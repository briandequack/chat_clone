# Generated by Django 4.0 on 2022-01-27 10:38

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0006_status'),
    ]

    operations = [
        migrations.RenameField(
            model_name='status',
            old_name='status',
            new_name='online',
        ),
    ]
