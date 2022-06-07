# chat/views.py
from django.shortcuts import render
from . import models
from . models import Room, RoomMember, Session, Message
from accounts.models import MainSession

from django.utils import timezone
import json
from django.core.serializers.json import DjangoJSONEncoder
from django.contrib.auth import get_user_model
from accounts.models import ContactList
from django.core import serializers
from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import render, redirect, reverse
import copy
import random



User = get_user_model()


def index(request):
    return render(request, 'chat/index.html', {})

def dev(request):
    return render(request, 'chat/test.html', {})


def room(request, *args, **kwargs):
    query_results = models.Room.objects.filter(members__pk=request.user.pk);
    context = { 'rooms' : query_results }
    return render(request, 'chat/room.html', context)


def meetings(request, *args, **kwargs):

    if request.user.is_authenticated:

        groups, groups_flat_delme = get_groups(request.user.pk)

        contacts, contacts_flat = get_contacts(request.user.pk)

        groups_flat = flatten_groups(groups)
        print('groups', len(groups_flat))

        #users_in_groups = get_all_users_from_groups(groups)
        #flat_users_in_groups = flatten_users(users_in_groups)
        #print('flatt user in groups', flat_users_in_groups)

        context = {'contacts':contacts_flat, 'groups' : groups_flat}

        return render(request, 'chat/meet.html', context)

    else:

        return HttpResponseRedirect(reverse('accounts:login2'))




def get_all_users_from_groups(user_pk):
    groups, groups_flat_delme = get_groups(user_pk)


    myset = set()
    for group in groups:
        for member in group['members']:
            myset.add(member['name'])

    mylist = []
    for user in myset:
        mylist.append({'name': user})

    users = get_users(mylist)
    return users





def flatten_groups(groups):

    groups_flat = []
    for group in groups:
        group_flat = flatten_group(group)
        groups_flat.append(group_flat)

    return groups_flat

def flatten_group(group):
    group_flat = copy.deepcopy(group)
    group_flat['room'].pop('object', None)
    if group_flat['room']['last_seen'] != None:
        iso_time = group_flat['room']['last_seen'].isoformat()
        group_flat['room']['last_seen'] = iso_time
    else:
        group_flat['room']['last_seen'] = 'empty';
    for member in group_flat['members']:
        member.pop('object', None)
        member['membership'].pop('object', None)

    return group_flat

def get_contacts(pk):

    contacts = []
    contacts_flat = []
    contact_List = ContactList.objects.get(user=pk);
    for contact in contact_List.contacts.all():
        contacts.append({'name':contact.username,'pk':contact.pk,'object':contact})
        contacts_flat.append({'name':contact.username,'pk':contact.pk})

    return contacts, contacts_flat



def get_groups(user_pk):

    rooms = models.Room.objects.filter(members__pk=user_pk);
    groups = []
    groups_flat = []
    for room in rooms:
        group, group_flat = get_group(room.pk, user_pk)
        groups.append(group)
        groups_flat.append(group_flat)

    return groups, groups_flat


def get_users(users):

    user_list = []
    for user in users:
        my_user = get_user(user)
        user_list.append(my_user)

    return user_list

def get_user(user):

    user = User.objects.get(username=user['name'])
    last_seen = MainSession.objects.get(user=user.pk)
    iso_time = last_seen.timestamp.isoformat()
    return {'name': user.username, 'object': user, 'last_seen': iso_time}

def flatten_users(users):
    user_list = []
    for user in users:
        flat_user = flatten_user(user)
        user_list.append(flat_user)

    return user_list

def flatten_user(user):
    user_flat = copy.deepcopy(user)
    user_flat.pop('object', None)

    return user_flat


def get_group(pk, user_pk, include = []):

    group = {'room':{'pk': '','type':'','last_seen':'','unread':0,'object':'', 'event': ''},'members':[],'messages':[]}
    group_flat = {'room':{'pk': '','type':''},'members':[],'messages':[]}


    try:
        room = Room.objects.get(pk=pk)
    except Room.DoesNotExist:
        room = None

    if room != None:

        my_memberships = RoomMember.objects.filter(room=room).filter(user_id=user_pk)



        #sessions = Session.objects.filter(room=room,user=user)
        #messages = Message.objects.filter(room=room).filter(author=user_pk)
        sessions = Session.objects.filter(room=room).filter(user=user_pk).order_by('-id')
        list1 = []
        for session in sessions:
            my_membership = my_memberships[0]
            list_messages = []
            start = session.start
            end = session.end
            if end == None:
                end = timezone.now()

            #print(my_membership.last_seen)

            found_new = False


            messages = Message.objects.filter(room=room).filter(timestamp__range=(start,end))
            for message in messages:
                #print(message.timestamp)
                if my_membership.last_seen != None:
                    if message.timestamp > my_membership.last_seen:
                        #print('new')
                        found_new = True
                        group['room']['unread'] += 1
                    else:
                        pass
                        #print('no new')
                #print(my_membership.last_seen)
                time_stamp = message.timestamp.isoformat()
                #list_messages.append({'message':message.text,'pk':message.pk, 'from':message.author.username, 'timestamp': time_stamp})
                #group['messages'].append({'message':message.text, 'from':message.author.username})

            list_messages.extend(list1)
            list1 = list_messages

            if found_new == True:
                if my_membership.status == 'inactive' or my_membership.status == 'deleted':
                    my_membership.status = 'active'
                    my_membership.save()

        group['messages'] = list1
        group['room']['pk'] = room.pk
        group['room']['type'] = room.type
        group['room']['object'] = room
        group_flat['room']['pk'] = room.pk
        group_flat['room']['type'] = room.type

        memberships = RoomMember.objects.filter(room_id=room.pk)
        for membership in memberships:
            if membership.user.pk == user_pk:
                group['room']['last_seen'] = membership.last_seen


            main_session = MainSession.objects.get(user=membership.user.pk);
            user_last_seen = main_session.timestamp.isoformat()
            #get_last_seen = get_user({'name':membership.user.username})



            if len(include) != 0:
                for item in include:
                    if item['name'] == membership.user.username:
                        group['members'].append({'name':membership.user.username,'membership':{'status':membership.status,'last_seen':user_last_seen,'role':membership.role,'object': membership , 'room': room.pk}, 'object':membership.user})
                        group_flat['members'].append({'name':membership.user.username,'membership':{'status':membership.status, 'room': room.pk} })

            else:
                group['members'].append({'name':membership.user.username,'membership':{'status':membership.status,'last_seen':user_last_seen,'role':membership.role,'object': membership , 'room': room.pk}, 'object':membership.user})
                group_flat['members'].append({'name':membership.user.username,'membership':{'status':membership.status, 'room': room.pk} })


        return group, group_flat

    else:
        return False, False

def get_messages():
    pass


def new_memberships(self, group, members):
    for member in members:
        new_membership(self, group, member)



def new_membership(self, group, member):
    print('new membershiop for:', member)
    new_membership, created = RoomMember.objects.get_or_create(room=group['room']['object'],user=member['object'])
    if member['name'] == self.user.username:
        if group['room']['type'] == 'private':
            new_membership.role = 'member'
        else:
            new_membership.role = 'admin'

        if new_membership.status == 'blocked_and_deleted':
            new_membership.status = 'blocked'
        else:
            new_membership.status = 'active'



        new_membership.save()

    if created:
        new_session = Session.objects.get_or_create(room=group['room']['object'],user=member['object'])
    else:
        if group['room']['type'] == 'group':
            sessions = Session.objects.filter(room=group['room']['object']).filter(user=member['object']).order_by('-id')[:1]
            session = sessions[0]
            if session.end != None:
                new_session = Session.objects.create(room=group['room']['object'],user=member['object'])


    if new_membership.status == 'left':
        new_membership.status = 'active'
        new_membership.save()
    elif new_membership.status == 'left_and_deleted':
        new_membership.status = 'inactive'
        new_membership.save()


def update_memberships(self,group, members, status):
    for member in members:
        update_membership(self, group, member, status)


def update_membership(self, group, member, updated_membership):

    print(member)
    memberships = RoomMember.objects.filter(room=group['room']['object']).filter(user=member['object'])
    membership = memberships[0]

    if 'last_seen' in updated_membership:
        if updated_membership['last_seen'] == 'left':
            membership.last_seen = timezone.now()


        else:
            membership.last_seen = None
        membership.save()


    if 'status' in updated_membership:
        if updated_membership['status'] == 'blocked' or updated_membership['status'] == 'left':
            sessions = Session.objects.filter(room=group['room']['object']).filter(user=member['object']).order_by('-id')[:1]
            session = sessions[0]
            session.end = timezone.now()
            session.save()



            if membership.role == 'admin':
                membership.role = 'member';
                for group_member in group['members']:
                    if group_member['name'] != member['name']:
                        if group_member['membership']['role'] == 'admin':
                            print('NO NEED for new admin')
                            break
                else:
                    active_members = [x for x in group['members'] if 'active' in x['membership']['status'] or 'inactive' in x['membership']['status']]
                    non_admins = [x for x in active_members if member['name'] not in x['name']]
                    print('active members', active_members)
                    if len(non_admins) != 0:
                        random.shuffle(non_admins)
                        print('non', non_admins)
                        non_admins[0]['membership']['object'].role = 'admin'
                        non_admins[0]['membership']['object'].save()

            final_membership = updated_membership['status']

            if updated_membership['status'] == 'left':
                if membership.status == 'inactive':
                    final_membership = 'left_and_deleted'

            membership.status = final_membership
            membership.save()

        if updated_membership['status'] == 'active':
            sessions = Session.objects.filter(room=group['room']['object']).filter(user=member['object']).order_by('-id')[:1]
            session = sessions[0]
            print('active',session)
            if session.end != None:
                 print('session created')
                 new_session = Session.objects.create(room=group['room']['object'],user=member['object'])

            membership.status = updated_membership['status']
            membership.save()


        if updated_membership['status'] == 'deleted' or updated_membership['status'] == 'blocked_and_deleted' or updated_membership['status'] == 'left_and_deleted':
            final_membership = None

            deteled_sessions = Session.objects.filter(room=group['room']['object']).filter(user=member['object'])
            for deleted_session in deteled_sessions:
                deleted_session.delete()

            #print('NEWSES', member['object'],updated_membership['status'])
            if updated_membership['status'] == 'deleted':
                new_session = Session.objects.create(room=group['room']['object'],user=member['object'])
            elif updated_membership['status'] == 'blocked_and_deleted' or updated_membership['status'] == 'left_and_deleted':
                my_time = timezone.now()
                added_seconds = timezone.timedelta(0, 1)
                new_datetime = my_time + added_seconds
                new_session = Session.objects.create(room=group['room']['object'],user=member['object'],end=new_datetime)

            final_membership = updated_membership['status']
            if membership.status == 'left':
                final_membership = 'left_and_deleted'
            elif membership.status == 'blocked':
                final_membership = 'blocked_and_deleted'
            elif membership.status == 'active':
                final_membership = 'deleted'

            membership.status = final_membership
            membership.save()


            #print('group', group['members'])
            for group_member in group['members']:
                if group_member['name'] != self.user.username:
                    if group_member['membership']['status'] == 'active' or group_member['membership']['status'] == 'blocked' or group_member['membership']['status'] == 'left':
                        print('keep')
                        break
            else:
                obj = Room.objects.get(pk=group['room']['pk'])
                obj.delete()
                print('this works')






    if 'role' in updated_membership:
        membership.role = updated_membership['role']

        for group_member in group['members']:
            if group_member['name'] != self.user.username:
                if group_member['membership']['role'] == 'admin':
                    print('NO NEED for new admin')
                    break
        else:
            active_members = [x for x in group['members'] if 'active' in x['membership']['status']  or 'inactive' in x['membership']['status']]
            non_admins = [x for x in active_members if self.user.username not in x['name']]
            print('active members', active_members)
            if len(non_admins) != 0:
                random.shuffle(non_admins)
                print('non', non_admins)
                non_admins[0]['membership']['object'].role = 'admin'
                non_admins[0]['membership']['object'].save()
            else:
                membership.role ='admin'


        print(group['members'])

        membership.save()
