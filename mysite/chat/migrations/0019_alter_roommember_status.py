# Generated by Django 4.0 on 2022-02-04 13:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0018_alter_roommember_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='roommember',
            name='status',
            field=models.CharField(choices=[('left', 'left'), ('active', 'active'), ('inactive', 'inactive'), ('blocked', 'blocked')], default='inactive', max_length=20),
        ),
    ]