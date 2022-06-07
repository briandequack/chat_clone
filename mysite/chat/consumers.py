
# get the closed session# chat/consumers.py
import base64
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from accounts.models import ContactRequest, ContactList
from . models import Room, RoomMember, Message, Status, Session
from accounts.models import MainSession
from channels.db import database_sync_to_async
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.utils import timezone
from dateutil import parser
import datetime
from django.db.models import Q


from . views import get_group as _get_group
from . views import get_groups as _get_groups
from . views import flatten_group as _flatten_group
from . views import flatten_groups as _flatten_groups
from . views import get_users as _get_users
from . views import get_user as _get_user

from . views import new_memberships as _new_memberships
from . views import new_membership as _new_membership
from . views import update_memberships as _update_memberships
from . views import update_membership as _update_membership

from . views import get_all_users_from_groups as _get_all_users_from_groups
from . views import flatten_users as _flatten_users
from . views import flatten_user as _flatten_user


from django.contrib.auth import get_user_model
User = get_user_model()

import random

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        self.layer_name = 'notifications_%s' % self.user.username

        await self.channel_layer.group_add(
            self.layer_name,
            self.channel_name
        )

        await self.accept()
        #print(self.user,'joined',self.layer_name)


    async def disconnect(self, close_code):

        await self.channel_layer.group_discard(
            self.layer_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        if 'contact_request' in text_data_json:
            await self.update_contact_request(text_data_json)
        elif 'add_room' in text_data_json:
            await self.add_room(text_data_json)
        else:
            pass


    @database_sync_to_async
    def update_contact_request(self, data):
        contact_request = ContactRequest.objects.get(pk=data['pk'])
        if data['contact_request']:
            contact_request.accept()
            contact_request.save()
        else:
            contact_request.delete()


    # Receive message from room group
    async def notify(self, event):
        message = event['message']
        sender = event['sender']
        #print(message)
        await self.send(text_data=json.dumps({
            'message': message, 'sender': sender
        }))


    async def room_notification(self, data):
        await self.send(text_data=json.dumps({
            'room_notification': data['message'], 'name': data['name']
        }))




    # Receive message from room group
    @database_sync_to_async
    def add_room(self, data):
        inviter = self.user
        invitee = User.objects.get(pk=data['user_pk'])

        # Create a unique room name base on the primary keys of the users
        room_name = ''
        if inviter.pk < invitee.pk:
            room_name = 'room{}{}'.format(inviter.pk,invitee.pk)
        else:
            room_name = 'room{}{}'.format(invitee.pk,inviter.pk)

        # Get or create the room
        new_room, created = Room.objects.get_or_create(name=room_name)
        if created:
            channel_layer = get_channel_layer()

            RoomMember.objects.create(user=inviter,room=new_room)
            async_to_sync(channel_layer.group_send)(
                self.layer_name,
                {'type':'room_notification',
                'message':'add' ,'name': new_room.name
                }
            )

            invitee_layer_name = 'notifications_%s' % invitee.username
            RoomMember.objects.create(user=invitee,room=new_room)
            async_to_sync(channel_layer.group_send)(
                invitee_layer_name,
                {'type':'room_notification',
                 'message':'add' ,'name': new_room.name
                }
            )


        else:
            pass










class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        self.room_name = self.scope['url_route']['kwargs']['room_name']

        self.room_group_name = 'chat_%s' % self.room_name



        #print(self.room_group_name)
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()


        #query = Message.objects.filter(room=self.room_name)
        #print(query)
        all_members = await self.get_room_members()


        recent_messages = await self.recent_messages()
        recent_messages.reverse()
        unread = await self.unreadMessages()


        await self.send(text_data=json.dumps({
            'new': unread
        }))

        await self.send(text_data=json.dumps({
            'message': recent_messages
        }, indent=4, sort_keys=True, default=str))


    @database_sync_to_async
    def recent_messages(self):
        results = Message.objects.filter(room=self.room_name).order_by('-timestamp')[:10]
        list = []
        for result in results:
            list.append({'text':result.text,'author':result.author.username, 'timestamp':result.timestamp})

        return list



    @database_sync_to_async
    def unreadMessages(self):
        results = RoomMember.objects.filter(room=self.room_name).filter(user=self.user.pk)
        membership = results[0]
        if membership.last_seen != None:
            results = Message.objects.filter(room=self.room_name).filter(timestamp__gt=membership.last_seen)

        return len(results)

    @database_sync_to_async
    def get_room_members(self):
        results = RoomMember.objects.filter(room=self.room_name)
        list = []
        for member in results:
            list.append(member.user.username)
        return list



    async def disconnect(self, close_code):
        await self.change_active(False)

        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )








    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)

        if 'active' in text_data_json:
            await self.change_active(text_data_json['active'])
        elif 'message' in text_data_json:
            await self.store_message(text_data_json['message'],text_data_json['sender'])

        # Check if message or status update
        message_type, user = text_data_json
        message_types = {'message': 'chat_message', 'status': 'status_update', 'active': 'update_active'}

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': message_types[message_type],
                'message': text_data_json[message_type], 'sender': text_data_json['sender']
            }
        )


    @database_sync_to_async
    def store_message(self, text, sender):
        room = Room.objects.get(pk=self.room_name)
        author = User.objects.get(username=sender)
        message = Message.objects.create(room=room,text=text,author=author,timestamp=timezone.now())


    @database_sync_to_async
    def change_active(self,status):
        result = RoomMember.objects.filter(room=self.room_name).filter(user=self.user.pk)
        membership = result[0]
        if status:
            membership.last_seen = None
        else:
            if membership.last_seen == None:
                print('updated',self.room_name, self.user.username)
                membership.last_seen = timezone.now()
        membership.save()



    # Receive message from room group
    async def chat_message(self, event):

        message = event['message']
        sender = event['sender']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message, 'sender': sender,
        }))

    async def status_update(self, event):
        message = event['message']
        sender = event['sender']
        #print(message)
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'status': message, 'sender': sender,
        }))




    @database_sync_to_async
    def update_active(self, event):
        pass


        #print(self.room_group_name,event['sender'],'active',event['message'])



    async def notify(self, event):
        print('notify!')










class SendReceive(AsyncWebsocketConsumer):

    async def connect(self):

        self.user = self.scope['user']
        self.room_name = self.scope['url_route']['kwargs']['user_name']
        self.ws_base = 'sendreveive_%s'
        self.room_group_name = self.ws_base % self.room_name

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        self.online_contacts = []

        self.my_contacts = await self.get_all_users_from_groups(self.user.pk)
        self.my_contacts_flat = await self.flatten_users(self.my_contacts)
        await self.send_contacts(self.my_contacts_flat)





        self.my_groups = await self.get_groups(self.user.pk)
        groups_flat = await self.flatten_groups(self.my_groups)


        self.contacts, self.contacts_flat = await self.get_contacts()



        await self.response_connected()

        await self.send_ping(self.my_contacts)

    async def disconnect(self, close_code):
        await self.update_main_session()
        self.closing_groups = await self.get_groups(self.user.pk)



        for group in self.closing_groups:

            variable = group['room']['last_seen']
            print('group last seen', group['room']['last_seen'])
            if variable is None:
                user = await self.get_user({'name':self.user.username})

                await self.update_membership(group, user, {'last_seen':'left'})

        await self.send_offline_status(self.online_contacts)

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )


    async def receive(self, text_data):
        text_data_json = json.loads(text_data)

        # When receving a ping it's send a pong back and adds the sender to online contacts.
        if text_data_json['type'] == 'ping':
            await self.add_online_contact(text_data)
            await self.send_pong(text_data_json)

        if text_data_json['type'] == 'pong':
            await self.add_online_contact(text_data)

        if text_data_json['type'] == 'offline':
            await self.remove_online_contact(text_data)

        # Store a message
        if text_data_json['type'] == 'message':
            group = await self.get_group(text_data_json['to'], self.user.username)
            for member in group['members']:
                if member['name'] == self.user.username:
                    if member['membership']['status'] == 'active':
                        message_pk, message_timestamp, message_status = await self.store_message(group, text_data_json['message'])
                        await self.echo_message(message_pk,message_timestamp,message_status, text_data_json, group)



        if text_data_json['type'] == 'search':
            self.search_result = await self.search_contact(text_data)

            await self.send_search_result(self.search_result)




        if text_data_json['type'] == 'request_groups':
            groups_flat = await self.flatten_groups(self.my_groups)
            await self.send_groups_to_self(groups_flat)


        if text_data_json['type'] == 'request_members':
            group = await self.get_group(text_data_json['pk'], self.user.username)
            group_flat = await self.flatten_group(group)
            await self.response_members(group_flat)




        if text_data_json['type'] == 'update_membership_of_self':
            echo = 'yes'
            if 'echo' in text_data_json['message']['membership']:
                echo = text_data_json['message']['membership']['echo']
                groupEvent = ()


            print('update MEMBERSHIP')
            pk = text_data_json['message']['pk']
            membership = text_data_json['message']['membership']

            group = await self.get_group(pk, self.user.username)

            user = await self.get_user({'name':self.user.username})
            print('this USER', user)
            await self.update_membership(group, user, membership)

            await self.replace_local_group(group)

            if echo != 'no':
                group = await self.get_group(pk, self.user.username)
                updated_group = await self.get_group(pk, self.user.username, [{'name':self.user.username}]);

                if group != False:
                    group_flat = await self.flatten_group(group)
                    await self.echo_membership_update(group_flat, text_data_json['from'])
                    updated_group_flat = await self.flatten_group(updated_group);
                    await self.response_updated_membership(group_flat, updated_group_flat)



        if text_data_json['type'] == 'create_group':
            users = [{'name':x} for x,y in text_data_json['message']]
            type = text_data_json['message'][0][1]
            dir = text_data_json['dir']
            pk = await self.new_group(users, type)
            group = await self.get_group(pk, self.user.username)
            user = await self.get_user({'name':self.user.username})
            await self.new_membership(group, user)
            members = await self.get_users(users)
            await self.new_memberships(group, members)
            group = await self.get_group(pk, self.user.username)
            group['room']['event'] = 'create';
            group_flat = await self.flatten_group(group)

            await self.replace_local_group(group)

            updated_group = await self.get_group(pk, self.user.username, members)
            updated_group_flat = await self.flatten_group(updated_group)
            await self.response_updated_membership(group_flat, group_flat, dir)

            # Echo system message
            usersString = ', '.join(str(e.capitalize()) for e,f in text_data_json['message'])
            if type == 'group':
                string = text_data_json['from'].capitalize() + ' created a group with ' + usersString + '.'
            else:
                string = text_data_json['from'].capitalize() + ' started a chat with ' + usersString + '.'

            message_pk, message_timestamp, message_status = await self.store_message(group, string, 'silent')
            text_data_json['message'] = string
            await self.echo_message(message_pk,message_timestamp,message_status, text_data_json, group)


        if text_data_json['type'] == 'add_contact_to_group':

            print('ADDED!!')
            users = [{'name':x} for x,y in text_data_json['message']]
            pk = text_data_json['message'][0][1]
            dir = text_data_json['dir']

            group = await self.get_group(pk, self.user.username)
            members = await self.get_users(users)
            await self.new_memberships(group, members)
            group = await self.get_group(pk, self.user.username)
            group['room']['event'] = 'add_user_to_group';
            group_flat = await self.flatten_group(group)

            await self.replace_local_group(group)
            await self.echo_membership_update(group_flat)
            updated_group = await self.get_group(pk, self.user.username, members);
            updated_group_flat = await self.flatten_group(updated_group);
            await self.response_updated_membership(group_flat, updated_group_flat, dir)

            # Echo system message
            usersString = ', '.join(str(e.capitalize()) for e,f in text_data_json['message'])
            string = text_data_json['from'].capitalize() + ' added ' + usersString + ' to group.'
            message_pk, message_timestamp, message_status = await self.store_message(group, string, 'silent')
            text_data_json['message'] = string
            await self.echo_message(message_pk,message_timestamp,message_status, text_data_json, group)



        if text_data_json['type'] == 'remove_contact_from_group':
            users = [{'name':x} for x,y in text_data_json['message']]
            pk = text_data_json['message'][0][1]
            dir = text_data_json['dir']


            group = await self.get_group(pk, self.user.username)
            members = await self.get_users(users)

            await self.update_memberships(group, members, {'status':'left','role':'member'})
            group = await self.get_group(pk, self.user.username)
            group['room']['event'] = 'remove_user_from_group';
            group_flat = await self.flatten_group(group)
            await self.echo_membership_update(group_flat)

            ##group_removed_members = await self.get_group(pk, self.user.username, members)
            ##group_removed_members_flat = await self.flatten_group(group_removed_members)
            ##await self.response_contact_removed_from_group(group_flat, group_removed_members_flat)
            updated_group = await self.get_group(pk, self.user.username, members);
            updated_group_flat = await self.flatten_group(updated_group);
            await self.response_updated_membership(group_flat, updated_group_flat, dir)

            # Echo system message
            usersString = ', '.join(str(e.capitalize()) for e,f in text_data_json['message'])
            string = text_data_json['from'].capitalize() + ' removed ' + usersString + ' from group.'
            message_pk, message_timestamp, message_status = await self.store_message(group, string, 'silent')
            text_data_json['message'] = string
            await self.echo_message(message_pk,message_timestamp,message_status, text_data_json, group)


        if text_data_json['type'] == 'make_contact_group_admin':
            users = [{'name':x} for x,y in text_data_json['message']]
            pk = text_data_json['message'][0][1]
            dir = text_data_json['dir']
            group = await self.get_group(pk, self.user.username)
            members = await self.get_users(users)
            await self.update_memberships(group, members, {'role':'admin'})
            group = await self.get_group(pk, self.user.username)
            group['room']['event'] = 'add_group_admin';
            group_flat = await self.flatten_group(group)

            await self.replace_local_group(group)

            await self.echo_membership_update(group_flat)

            updated_group = await self.get_group(pk, self.user.username, members);
            updated_group_flat = await self.flatten_group(updated_group);
            await self.response_updated_membership(group_flat, updated_group_flat, dir)

            # Echo system message
            usersString = ', '.join(str(e.capitalize()) for e,f in text_data_json['message'])
            string = text_data_json['from'].capitalize() + ' made ' + usersString + ' a group admin.'
            message_pk, message_timestamp, message_status = await self.store_message(group, string, 'silent')
            text_data_json['message'] = string
            await self.echo_message(message_pk,message_timestamp,message_status, text_data_json, group)

        if text_data_json['type'] == 'remove_contact_group_admin':
            users = [{'name':x} for x,y in text_data_json['message']]
            pk = text_data_json['message'][0][1];
            dir = text_data_json['dir']
            group = await self.get_group(pk, self.user.username)
            members = await self.get_users(users)
            await self.update_memberships(group, members, {'role':'member'})
            group = await self.get_group(pk, self.user.username)
            group['room']['event'] = 'remove_group_admin';
            group_flat = await self.flatten_group(group)
            await self.replace_local_group(group)
            await self.echo_membership_update(group_flat)
            updated_group = await self.get_group(pk, self.user.username, members);
            updated_group_flat = await self.flatten_group(updated_group);
            await self.response_updated_membership(group_flat, updated_group_flat, dir)

            # Echo system message
            usersString = ', '.join(str(e.capitalize()) for e,f in text_data_json['message'])
            string = text_data_json['from'].capitalize() + ' removed ' + usersString + ' as group admin.'
            message_pk, message_timestamp, message_status = await self.store_message(group, string, 'silent')
            text_data_json['message'] = string
            await self.echo_message(message_pk,message_timestamp,message_status, text_data_json, group)



        if text_data_json['type'] == 'add_group_to_consumer':
            pk = text_data_json['message']['room']['pk']
            local_group = await self.get_local_group(pk)
            if local_group == False:
                group = await self.get_group(pk, self.user.username)
                self.my_groups.append(group)
            else:
                group = await self.get_group(pk, self.user.username)
                await self.replace_local_group(group)

            print('I RUN')
            await self.send_ping(group['members'])

        if text_data_json['type'] == 'request_messages':
            messages = await self.get_messages(text_data_json['pk'],text_data_json['date_time'])
            await self.response_messages(messages)



        if text_data_json['type'] == 'is_typing':
            group = await self.get_local_group(text_data_json['to'])
            await self.echo_activity(text_data, group)

        # only typing to keep
        if text_data_json['type'] == 'activity':
            group = await self.get_group(text_data_json['to'], self.user.username)
            group_flat = await self.flatten_group(group)
            await self.echo_self_activity(text_data, group_flat)

        if text_data_json['type'] == 'add_contact':
            neW_contact = await self.add_contact(text_data)
            await self.response_contact_added(neW_contact);

        if text_data_json['type'] == 'delete_message':
            messagePk = text_data_json['message']['messagePk'];
            groupPk = text_data_json['message']['groupPk'];
            group = await self.get_group(groupPk, self.user.username)
            group_flat = await self.flatten_group(group)
            await self.delete_message(messagePk)
            await self.response_message_deleted(messagePk, group_flat);


        if text_data_json['type'] == 'delete_contact':
            contact = text_data_json['message'];
            await self.delete_contact(contact)
            await self.response_contact_deleted(contact);

        if  text_data_json['type'] == 'request_user_datetime':
            user_datetime = await self.get_user(text_data_json['message'])
            flat_user_datetime = await self.flatten_user(user_datetime)
            await self.response_user_datetime(flat_user_datetime);


        if text_data_json['type'] == 'request_contacts':
            contacts = await self.get_user_contacts();
            await self.response_user_contacts(contacts)


        if text_data_json['type'] == 'request_contact_status':
            await self.send_ping([{'name':text_data_json['to']}])



    # Send response with group members to self
    async def response_members(self, members):
        print('members', members)
        await self.channel_layer.group_send(
        self.room_group_name,
        {
            'type': 'message',
            'message_type':'response_members',
            'message': members,
            'from': self.user.username,
            'to': self.user.username,
        }
        )



    async def response_contact_deleted(self, contact):
        await self.channel_layer.group_send(
        self.room_group_name,
        {
            'type': 'message',
            'message_type':'response_contact_deleted',
            'message': contact,
            'from': self.user.username,
            'to': self.user.username,
        }
        )

    async def response_connected(self):
        print('say hello')
        await self.channel_layer.group_send(
        self.room_group_name,
        {
            'type': 'message',
            'message_type':'connected',
            'message': 'Welcome',
            'from': self.user.username,
            'to': self.user.username,
        }
        )



    async def send_ping(self, contacts):

        for contact in contacts:

            if contact['name'] != self.user.username:
                self.contact_room_group_name = self.ws_base % contact['name']
                await self.channel_layer.group_send(
                self.contact_room_group_name,
                {
                    'type': 'message',
                    'message_type':'ping',
                    'message': 'ping',
                    'from': self.user.username,
                    'to': contact['name']
                }
                )



    async def send_pong(self,data):
        self.contact_room_group_name = self.ws_base % data['from']
        await self.channel_layer.group_send(
        self.contact_room_group_name,
        {
            'type': 'message',
            'message_type':'pong',
            'message': 'PONG!',
            'from': self.user.username,
            'to':  str(data['from'])
        }
        )


    async def send_contacts(self, contacts):
        await self.channel_layer.group_send(
        self.room_group_name,
        {
            'type': 'message',
            'message_type':'recieve_contacts',
            'message': contacts,
            'from': self.user.username,
            'to':  self.user.username
        }
        )

    async def add_online_contact(self, text_data):
        text_data_json = json.loads(text_data)
        for contact in self.online_contacts:
            if contact['name'] == text_data_json['from']:
                break;
        else:
            self.online_contacts.append({'name':text_data_json['from']})
            await self.send_online_contacts(self.room_group_name)


    async def remove_online_contact(self, text_data):
        text_data_json = json.loads(text_data)
        for contact in self.online_contacts:
            if contact['name'] == text_data_json['from']:
                self.online_contacts.remove(contact)
                await self.send_online_contacts(self.room_group_name)



    async def send_online_contacts(self, room_group):
        await self.channel_layer.group_send(
        room_group,
        {
            'type': 'message',
            'message_type':'online_contacts',
            'message': self.online_contacts,
            'from': self.user.username,
            'to': self.user.username
        }
        )


    async def send_offline_status(self,contacts):
        for contact in contacts:
            self.contact_room_group_name = self.ws_base % contact['name']
            await self.channel_layer.group_send(
            self.contact_room_group_name,
            {
                'type': 'message',
                'message_type':'offline',
                'message': 'Im offline!',
                'from': self.user.username,
                'to': self.contact_room_group_name
            }
            )




    async def echo_message(self,message_pk,message_timestamp,message_status, text_data_json, group):
        for member in group['members']:
            #print(member['membership']['status'])
            if member['membership']['status'] == 'active' or member['membership']['status'] == 'deleted' or member['membership']['status'] == 'inactive' :
                self.contact_room_group_name = self.ws_base % member['name']
                await self.channel_layer.group_send(
                self.contact_room_group_name,
                {
                    'type': 'message',
                    'message_type':'message',
                    'message': {'text':text_data_json['message'],'pk': message_pk, 'from':text_data_json['from'], 'timestamp': message_timestamp.isoformat(), 'status': message_status},
                    'from': text_data_json['from'],
                    'to': group['room']['pk'],
                }
                )




    async def message(self, message):
        await self.send(text_data=json.dumps({
                'type': message['message_type'],
                'message': message['message'],
                'from': message['from'],
                'to': message['to']
            }))

    # Correct

    async def response_messages(self, messages):

        await self.channel_layer.group_send(
        self.room_group_name,
        {
            'type': 'message',
            'message_type':'response_messages',
            'message': messages,
            'from': self.user.username,
            'to': self.user.username
        }
        )

    @database_sync_to_async
    def get_messages(self,pk, date_time):
        start_date = parser.parse(date_time)

        room = Room.objects.get(pk=pk);
        membership = RoomMember.objects.filter(room=room).filter(user_id=self.user.pk)


        print('time',date_time)

        #messages2 = Message.objects.filter(room=room).order_by('-id')[:10]

        message_list = []

        object = {'room':{'pk':pk},'messages':[]}

        #

        #for message in messages:


        # get the session of date else get next one
        #somedate = datetime.datetime.now() - datetime.timedelta(4)
        somedate = start_date
        print('date',somedate)
        #sessions = Session.objects.filter(room=room).filter(user=self.user.pk).order_by('-id')

        #SESSION START IS open
        #END IS CLOSED

        new_date = None

        sessions = Session.objects.filter(room=room).filter(user=self.user.pk).filter(start__lte=somedate)

        new_somedate = None
        # get the closed session
        criterion1 = Q(start__lte=somedate)
        criterion2 = Q(end__gte=somedate)
        criterion3 = Q(user=self.user.pk)
        criterion4 = Q(room=pk)
        q = Session.objects.filter(criterion1 & criterion2 & criterion3 & criterion4)
        print('middel',q)
        if len(q) != 0:
            start = somedate
            end = q[0].start
            new_somedate = q[0].start

        if len(q) == 0:
            criterion1 = Q(start__lte=somedate)
            criterion2 = Q(end__isnull=True)
            criterion3 = Q(user=self.user.pk)
            criterion4 = Q(room=pk)
            q = Session.objects.filter(criterion1 & criterion2 & criterion3 & criterion4)
            print('open',q)
            if len(q) != 0:
                start = somedate
                end = q[0].start
                new_somedate = q[0].start
                print('this')
            if len(q) == 0:
                # get most recent
                criterion1 = Q(start__lte=somedate)
                criterion2 = Q(end__lte=somedate)
                criterion3 = Q(user=self.user.pk)
                criterion4 = Q(room=pk)
                q = Session.objects.filter(criterion1 & criterion2 & criterion3 & criterion4).order_by('-id')[:1]
                if len(q) != 0:
                    start = q[0].end
                    end = q[0].start
                    new_somedate = q[0].start
                print('closed',q)


        num_messages = 0;





        messages = Message.objects.filter(room=room).filter(timestamp__range=(end,start)).order_by('-id')[:10]
        print('messages',messages, pk)
        for message in messages:
            if num_messages < 10:
                #'text':text_data_json['message'],'pk': message_pk, 'from':text_data_json['from'], 'timestamp': message_timestamp.isoformat()},
                object['messages'].append({'text': message.text,'pk':message.pk, 'from':message.author.username, 'timestamp':message.timestamp.isoformat(), 'status': message.status})
                num_messages += 1
            else:
                run = False
                break

        print('first',num_messages)

        run = True

    #print(q)
        while num_messages < 10 and run == True:
            print('Need more messages', num_messages)
            criterion1 = Q(start__lte=new_somedate)
            criterion2 = Q(end__lte=new_somedate)
            criterion3 = Q(user=self.user.pk)
            criterion4 = Q(room=pk)
            q = Session.objects.filter(criterion1 & criterion2 & criterion3 & criterion4).order_by('-id')[:1]
            print('len',q)
            if len(q) == 0:

                run = False
            else:
                #print('Need more messages', num_messages)
                start = q[0].end
                end = q[0].start
                messages = Message.objects.filter(room=room).filter(timestamp__range=(end,start)).order_by('-id')[:10]
                #print('messages',messages)
                for message in messages:

                    num_messages += 1
                    object['messages'].append({'text': message.text,'pk':message.pk, 'from':message.author.username, 'timestamp':message.timestamp.isoformat(), 'status': message.status})
                    if num_messages == 10:
                        run = False
                        break

                new_somedate = q[0].start


                #print('messages',messages)
                #for message in messages:
                #    num_messages += 1




        print('num', num_messages)

        return object
        #message_retrieved = 0;
        #for session in sessions:

        #    start = session.start
        #    end = session.end
        #    if end == None:
        #        end = timezone.now()

        #    messages = Message.objects.filter(room=room).filter(timestamp__range=(start,end)).order_by('-id')
        #    message_retrieved += len(messages)

        #    print('mesages retrieved', type(yourdate))
        #    if message_retrieved >= 5:
        #        break


            #print('>>>>>>>>>>>', messages)

        #return messages

        #
        #employee_query = Session.objects.filter(user=self.user)

        #messages = Message.objects.filter(room=room).filter(timestamp__range=(start,end))

        #room.get_sessions();


    @database_sync_to_async
    def flatten_group(self,group):
        group_flat = _flatten_group(group)
        return group_flat

    @database_sync_to_async
    def flatten_groups(self,groups):
        groups_flat = _flatten_groups(groups)
        return groups_flat


    @database_sync_to_async
    def get_groups(self, pk):
        groups, groups_flat = _get_groups(pk)
        return groups

    @database_sync_to_async
    def get_group(self, pk, user_pk, include=[]):

        group, group_flat = _get_group(pk, self.user.pk, include)
        return group


    @database_sync_to_async
    def get_all_users_from_groups(self, user_pk):
        my_users = _get_all_users_from_groups(user_pk)
        return my_users

    @database_sync_to_async
    def flatten_users(self,users):
        flat_users = _flatten_users(users)
        return flat_users

    @database_sync_to_async
    def flatten_user(self,users):
        flat_user = _flatten_user(users)
        return flat_user



    @database_sync_to_async
    def get_users(self, name):
        users = _get_users(name)
        return users

    @database_sync_to_async
    def get_user(self, name):
        user = _get_user(name)
        return user


    # keep me!
    async def response_updated_membership(self, group_flat, updated_group, dir=''):
        print('WTFSGOINGON', )
        group_flat['messages'] = []
        for member in group_flat['members']:
            self.contact_room_group_name = self.ws_base % member['name']
            await self.channel_layer.group_send(
            self.contact_room_group_name,
            {
                'type': 'message',
                'message_type':'response_membership_updated',
                'message': updated_group,
                'from': dir,
                'to': member['name'],

            }
            )

    async def response_contact_removed_from_group(self, group_flat, group_removed_members_flat):
        group_flat['messages'] = []
        for member in group_flat['members']:
            self.contact_room_group_name = self.ws_base % member['name']
            await self.channel_layer.group_send(
            self.contact_room_group_name,
            {
                'type': 'message',
                'message_type':'response_contact_removed_from_group',
                'message': group_removed_members_flat,
                'from': 'anon',
                'to': member['name']
            }
            )



    async def response_contact_added_to_group(self, group_flat, group_added_members_flat):
        group_flat['messages'] = []
        for member in group_flat['members']:
            self.contact_room_group_name = self.ws_base % member['name']
            await self.channel_layer.group_send(
            self.contact_room_group_name,
            {
                'type': 'message',
                'message_type':'response_contact_added_to_group',
                'message': group_added_members_flat,
                'from': 'anon',
                'to': member['name']
            }
            )


    async def echo_membership_update(self, group_flat, sender=None):
        if sender == None:
            sender = self.user.username

        print('update membershiop for',self.user.username,'by', sender)
        group_flat['messages'] = []
        for member in group_flat['members']:
            self.contact_room_group_name = self.ws_base % member['name']
            await self.channel_layer.group_send(
            self.contact_room_group_name,
            {
                'type': 'message',
                'message_type':'membership_has_been_updated',
                'message': group_flat,
                'from': sender,
                'to': member['name']
            }
            )

    async def echo_new_group(self, group_flat):
        for member in group_flat['members']:
            self.contact_room_group_name = self.ws_base % member['name']
            await self.channel_layer.group_send(
            self.contact_room_group_name,
            {
                'type': 'message',
                'message_type':'new_group_created',
                'message': group_flat,
                'from': self.user.username,
                'to': member['name']
            }
            )


    @database_sync_to_async
    def delete_message(self, pk):
        message = Message.objects.get(pk=pk)
        message.text = 'Removed'
        message.status = 'removed';
        message.save()



    @database_sync_to_async
    def leave_group(self, local_group):
        membership = ''
        for member in local_group['members']:
            if member['name'] == self.user.username:
                membership = member['membership']['object']
                member['membership']['status'] = 'left'

        membership.status = 'left'

        membership.save()


    async def echo_add_members_to_group(self, local_group_flat):
        for member in local_group_flat['members']:
            print(self.user.username,'echooo update',member['name'])
            self.contact_room_group_name = self.ws_base % member['name']
            await self.channel_layer.group_send(
            self.contact_room_group_name,
            {
                'type': 'message',
                'message_type':'add_members_to_group',
                'message': local_group_flat,
                'from': self.user.username,
                'to': member['name']
            }
            )

    async def response_message_deleted(self,messagePk, group_flat):
        groupPk = group_flat['room']['pk']
        for member in group_flat['members']:
            self.contact_room_group_name = self.ws_base % member['name']
            await self.channel_layer.group_send(
            self.contact_room_group_name,
            {
                'type': 'message',
                'message_type':'response_message_deleted',
                'message': {'messagePk':messagePk, 'groupPk':groupPk},
                'from': self.user.username,
                'to': member['name']
            }
            )



    async def send_groups_to_self(self, groups):
        await self.channel_layer.group_send(
        self.room_group_name,
        {
            'type': 'message',
            'message_type':'receive_groups_of_self',
            'message': groups,
            'from': 'consumer',
            'to': self.user.username
        }
        )




    async def response_user_datetime(self, user):

        await self.channel_layer.group_send(
        self.room_group_name,
            {
            'type': 'message',
            'message_type':'response_user_datetime',
            'message': user,
            'from': self.user.username,
            'to': self.user.username,
            }
            )

    async def response_user_contacts(self, contacts):

        await self.channel_layer.group_send(
        self.room_group_name,
            {
            'type': 'message',
            'message_type':'response_contacts',
            'message': contacts,
            'from': self.user.username,
            'to': self.user.username,
            }
            )


    async def response_contact_added(self, contact):
        await self.channel_layer.group_send(
        self.room_group_name,
        {
        'type': 'message',
        'message_type':'response_added_contact',
        'message': contact,
        'from': self.user.username,
        'to': self.user.username
        }
        )

    async def echo_self_activity(self, text_data, group):
        print('ECHO SELF ACTIBITY')
        text_data_json = json.loads(text_data)
        for member in group['members']:
                if member['name'] != self.user.username:
                    self.contact_room_group_name = self.ws_base % member['name']
                    await self.channel_layer.group_send(
                    self.contact_room_group_name,
                    {
                    'type': 'message',
                    'message_type':'response_user_activity',
                    'message': [text_data_json['message'],self.user.username,text_data_json['to']],
                    'from': self.user.username,
                    'to': text_data_json['to']
                    }
                    )



    async def echo_activity(self, text_data, group):
        text_data_json = json.loads(text_data)
        console.log('ECHOO OACTIVITY123')
        for member in group['members']:
                if member['name'] != self.user.username:
                    self.contact_room_group_name = self.ws_base % member['name']
                    await self.channel_layer.group_send(
                    self.contact_room_group_name,
                    {
                    'type': 'message',
                    'message_type':'response_user_activity',
                    'message': text_data_json['message'],
                    'from': self.user.username,
                    'to': text_data_json['to']
                    }
                    )
        #text_data_json = json.loads(text_data)



    async def echo_contact_leaving_group(self, local_group_flat):
        for member in local_group_flat['members']:
            #print(self.user.username,'echooo update',member['name'])
            self.contact_room_group_name = self.ws_base % member['name']
            await self.channel_layer.group_send(
            self.contact_room_group_name,
            {
                'type': 'message',
                'message_type':'contact_leaving_group',
                'message': local_group_flat,
                'from': self.user.username,
                'to': member['name']
            }
            )


    @database_sync_to_async
    def replace_local_group(self, group):
        print('replace local group', group)
        for n, local_group in enumerate(self.my_groups):

            if local_group['room']['pk'] == group['room']['pk']:
                self.my_groups.pop(n)
                self.my_groups.append(group)
                break



    @database_sync_to_async
    def get_local_group(self, pk):

        local_group = ''
        for group in self.my_groups:
            if group['room']['pk'] == int(pk):
                local_group = group
                break
        else:
             local_group = False

        return local_group


    @database_sync_to_async
    def add_contact(self, text_data):
        text_data_json = json.loads(text_data)
        contact_list = ContactList.objects.get(user=self.user)
        contact = User.objects.get(username=text_data_json['message'])
        contact_list.contacts.add(contact)
        return contact.username

    @database_sync_to_async
    def delete_contact(self, contact):
        contact_list = ContactList.objects.get(user=self.user)
        contact = User.objects.get(username=contact)
        contact_list.contacts.remove(contact)



    @database_sync_to_async
    def new_group(self, members, type):
        group_name = ''
        member_pks = [str(self.user.pk)]
        if type == 'group':
            group_name = str(random.randint(0, 1000000))
            room = Room.objects.create(name=group_name,type=type)


        elif type == 'private':
            for member in members:
                member_object = User.objects.get(username=member['name'])
                member_pks.append(str(member_object.pk))

            member_pks.sort()
            group_name = '-'.join(member_pks)

            room, created = Room.objects.get_or_create(name=group_name,type=type)



        return room.pk


    @database_sync_to_async
    def new_memberships(self, group, member):
        _new_memberships(self, group, member)



    @database_sync_to_async
    def new_membership(self, group, member):
        _new_membership(self, group, member)


    @database_sync_to_async
    def update_memberships(self, group, member, status):
        _update_memberships(self, group, member, status)

    @database_sync_to_async
    def update_membership(self, group, member, status):
        _update_membership(self, group, member, status)


    @database_sync_to_async
    def update_main_session(self):
        print('updated_main_session')
        main_session = MainSession.objects.get(user=self.user)
        main_session.timestamp= timezone.now()
        main_session.save()




    @database_sync_to_async
    def close_group(self, local_group):
        for member in local_group['members']:
            if member['name'] == self.user.username:
                member['membership']['object'].closed = 'yes'
                member['membership']['object'].save()
                break


    @database_sync_to_async
    def store_message(self, group, message, type='default'):

        new_message, created = Message.objects.get_or_create(
            room=group['room']['object'],
            text=message,
            author=self.user,
            timestamp=timezone.now(),
            status=type,
        )

        return new_message.pk ,timezone.now(), new_message.status


    @database_sync_to_async
    def search_contact(self, text_data):
        print('SEARCH RESULT', text_data)
        text_data_json = json.loads(text_data)
        results = User.objects.filter(username__icontains = text_data_json['message'])[:10]
        contacts = ContactList.objects.get(user=self.user)

        usernames = []
        for result in results:
            if result != self.user:
                if contacts.is_contact(result):
                    usernames.append({'name': result.username, 'relation':'contact'})
                else:
                    usernames.append({'name': result.username, 'relation':'none'})

        return usernames


    @database_sync_to_async
    def reopen_room(self, text_data):
        text_data_json = json.loads(text_data)
        results = RoomMember.objects.filter(room_id=text_data_json['message']).filter(user=self.user)

        membership = results[0]

        membership.open = True
        membership.save()


        (self.user,'is reopening room: ', text_data_json['message'])


    async def send_search_result(self, results):
        await self.channel_layer.group_send(
        self.room_group_name,
        {
            'type': 'message',
            'message_type':'search_results',
            'message': results,
            'from': self.user.username,
            'to': self.user.username,
        }
        )




    @database_sync_to_async
    def get_user_contacts(self):
        contactlist_object = ContactList.objects.get(user=self.user)
        contacts = contactlist_object.contacts.all()
        contact_list = []
        for contact in contacts:
            contact_list.append({'name':contact.username})

        return contact_list



    @database_sync_to_async
    def get_contacts(self):
        contacts = []
        contacts_flat = []

        rooms = Room.objects.filter(members__pk=self.user.pk);
        for room in rooms:
            room_members = room.members.all()
            for member in room_members:
                if member != self.user:
                    contacts.append({'name':member.username,'pk':member.pk,'object':member})
                    contacts_flat.append({'name':member.username,'pk':member.pk})

        return contacts, contacts_flat
