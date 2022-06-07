# Generated by Django 4.0 on 2022-02-04 14:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0020_alter_roommember_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='roommember',
            name='status',
            field=models.CharField(choices=[('left', 'left'), ('left_and_deleted', 'left_and_deleted'), ('active', 'active'), ('inactive', 'inactive'), ('deleted', 'deleted'), ('blocked', 'blocked'), ('blocked_and_deleted', 'blocked_and_deleted')], default='inactive', max_length=20),
        ),
    ]
