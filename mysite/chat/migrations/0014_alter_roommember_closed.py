# Generated by Django 4.0 on 2022-02-02 20:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0013_roommember_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='roommember',
            name='closed',
            field=models.CharField(choices=[('left', 'left'), ('active', 'active')], default='closed', max_length=20),
        ),
    ]