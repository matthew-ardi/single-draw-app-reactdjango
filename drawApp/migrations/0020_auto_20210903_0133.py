# Generated by Django 3.1.13 on 2021-09-03 01:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('drawApp', '0019_auto_20210903_0121'),
    ]

    operations = [
        migrations.AlterField(
            model_name='saveddrawings',
            name='corners',
            field=models.JSONField(),
        ),
    ]