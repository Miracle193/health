# Generated by Django 3.1.1 on 2020-12-27 19:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fitness', '0013_auto_20201224_0113'),
    ]

    operations = [
        migrations.AlterField(
            model_name='exercise',
            name='num_of_mins',
            field=models.DecimalField(decimal_places=2, max_digits=8),
        ),
    ]
