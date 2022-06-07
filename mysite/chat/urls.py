# chat/urls.py
from django.urls import path

from . import views
app_name = 'chat'

urlpatterns = [
    path('', views.meetings, name='meetings'),
    path('dev', views.dev, name='dev'),

]
