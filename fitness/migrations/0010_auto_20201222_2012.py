# Generated by Django 3.1.1 on 2020-12-22 20:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fitness', '0009_auto_20201222_2002'),
    ]

    operations = [
        migrations.AlterField(
            model_name='fitnessdiary',
            name='timestamp',
            field=models.DateField(unique=True),
        ),
    ]
