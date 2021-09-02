# Generated by Django 3.1.13 on 2021-09-02 19:52

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('drawApp', '0017_auto_20210902_1912'),
    ]

    operations = [
        migrations.AlterField(
            model_name='saveddrawings',
            name='username',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]
