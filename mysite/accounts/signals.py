
from . import models
from django.db.models.signals import post_save
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


def my_foo(sender,instance,**kwargs):
    #channel_layer = get_channel_layer()
    #async_to_sync(channel_layer.group_send)('chat_Room3',{'type':'notify', 'message':'lkjasf'})
    print('myfo0')

post_save.connect(my_foo,sender=models.ContactRequest)
