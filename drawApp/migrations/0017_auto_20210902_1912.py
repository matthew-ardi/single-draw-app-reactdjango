# Generated by Django 3.1.13 on 2021-09-02 19:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('drawApp', '0016_auto_20210902_1756'),
    ]

    operations = [
        migrations.AlterField(
            model_name='saveddrawings',
            name='username',
            field=models.CharField(max_length=500, null=True, verbose_name='users.CustomUser'),
        ),
    ]