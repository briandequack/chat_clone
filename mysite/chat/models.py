from django.db import models
from django.contrib.auth import get_user_model

from django.db.models.signals import post_save
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.utils import timezone


User = get_user_model()

ROOM_TYPE_CHOISES = (
    ("private", "private"),
    ("group", "group"),
)

class Room(models.Model):
    name = models.CharField(max_length=100,unique=True)
    members = models.ManyToManyField(User,through='RoomMember')
    type = models.CharField(max_length = 20, choices = ROOM_TYPE_CHOISES, default = 'private')

    def __str__(self):
        return self.name





def add_room(sender,instance,**kwargs):
    print('add room')


post_save.connect(add_room,sender=Room)

CLOSED_STATUS = (
    ("yes", "yes"),
    ("no", "no"),
)
MEMBERSHIP_STATUS = (
    ("left", "left"),
    ("left_and_deleted", "left_and_deleted"),
    ("active", "active"),
    ("inactive", "inactive"),
    ("deleted", "deleted"),
    ("blocked", "blocked"),
    ("blocked_and_deleted", "blocked_and_deleted"),
)

MEMBER_ROLE = (
    ("member", "member"),
    ("admin", "admin"),
)

MESSAGE_STATUS = (
    ("default", "default"),
    ("silent", "silent"),
    ("removed", "removed"),
)

class Session(models.Model):
    room = models.ForeignKey(Room, related_name="sessions",on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name="user_sessions",on_delete=models.CASCADE)
    start = models.DateTimeField(default=timezone.now,blank=True,null=True)
    end = models.DateTimeField(blank=True,null=True)




class RoomMember(models.Model):
    room = models.ForeignKey(Room, related_name="memberships",on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name="user_rooms",on_delete=models.CASCADE)
    last_seen = models.DateTimeField(default=timezone.now,blank=True,null=True)
    open = models.BooleanField(default=True)
    blocked = models.BooleanField(default=False)


    closed = models.CharField(max_length = 20, choices = CLOSED_STATUS, default = 'closed')
    status = models.CharField(max_length = 40, choices = MEMBERSHIP_STATUS, default = 'inactive')
    role = models.CharField(max_length = 20, choices = MEMBER_ROLE, default = 'member')

    def __str__(self):
        return self.user.username

    class Meta:
        unique_together = ('room', 'user',)

class Message(models.Model):
    room = models.ForeignKey(Room, related_name="mesages", on_delete=models.CASCADE)
    text = models.TextField()
    author = models.ForeignKey(User, related_name="authors", on_delete=models.CASCADE)
    timestamp = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length = 40, choices = MESSAGE_STATUS, default = 'default')



class Status(models.Model):
    user = models.ForeignKey(User, related_name="status",on_delete=models.CASCADE)
    online = models.BooleanField(default=False)
