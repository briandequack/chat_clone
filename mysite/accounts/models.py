from django.db import models
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.utils import timezone
User = get_user_model()

class ContactList(models.Model):
    user = models.OneToOneField(User, related_name='contactlist', on_delete=models.CASCADE)
    contacts = models.ManyToManyField(User, related_name='contacts', blank=True)


    def __str__(self):
        return self.user.username



    def is_contact(self, contact):
        if contact not in self.contacts.all():
            return False
        else:
            return True

    def add_contact(self, contact):
        if contact not in self.contacts.all():
            self.contacts.add(contact)
            self.save()

    def remove_contact(self, contact):
        if contact in self.contacts.all():
            self.contacts.remove(contact)
            self.save()

    def end_contact(self, contact):
        self.remove_contact(contact)
        ContactList.objects.get(user=contact).remove_contact(self.user)


    def is_mututal_contact(self, contact):
        if contact in self.contact.all():
            return True
        return False


class ContactRequest(models.Model):
    sender = models.ForeignKey(User, related_name='sender', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='contact_requests', on_delete=models.CASCADE)
    is_active = models.BooleanField(blank=True,null=False, default=False)
    created_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.sender.username

    def accept(self):

        receiver_contact_list = ContactList.objects.get(user=self.receiver)
        receiver_contact_list.add_contact(self.sender)

        sender_contact_list = ContactList.objects.get(user=self.sender)
        sender_contact_list.add_contact(self.receiver)

        self.is_active = True
        self.save()



class MainSession(models.Model):
    user = models.ForeignKey(User, related_name="main_user_sessions",on_delete=models.CASCADE)
    timestamp = models.DateTimeField(default=timezone.now,blank=True,null=True)





from django.db.models.signals import post_save
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

def send_contact_request(sender,instance,**kwargs):

    channel_layer = get_channel_layer()
    receiver_layer = 'notifications_%s' % instance.receiver.username
    sender = instance.sender.username

    async_to_sync(channel_layer.group_send)(receiver_layer,{'type':'notify', 'message':'Friend request!' ,'sender': sender})


post_save.connect(send_contact_request,sender=ContactRequest)
