# chat/routing.py
from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/somerandomurl/(?P<room_name>\w+)/$', consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/contacts/(?P<user_name>\w+)/$', consumers.NotificationConsumer.as_asgi()),
    re_path(r'ws/sendreceive/(?P<user_name>\w+)/$', consumers.SendReceive.as_asgi()),
]
