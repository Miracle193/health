# Generated by Django 3.1.1 on 2020-12-23 22:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fitness', '0010_auto_20201222_2012'),
    ]

    operations = [
        migrations.AddField(
            model_name='food',
            name='brand_owner',
            field=models.CharField(default='', max_length=64),
            preserve_default=False,
        ),
    ]
