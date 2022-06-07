from django.contrib import admin
from . import models


admin.site.register(models.ContactList)
admin.site.register(models.ContactRequest)
admin.site.register(models.MainSession)
