# Generated by Django 3.2.6 on 2021-08-29 03:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('drawApp', '0004_auto_20210829_0323'),
    ]

    operations = [
        migrations.AddField(
            model_name='saveddrawings',
            name='corners',
            field=models.JSONField(default={}),
            preserve_default=False,
        ),
    ]
