from django.db import models
# from rest_framework import permissions
from drawAppBackend import settings

# from django.contrib.auth.models import AbstractUser

# Create your models here.
class DrawApp(models.Model):
    title = models.CharField(max_length=120)
    description = models.TextField()
    completed = models.BooleanField(default=False)

    def _str_(self):
        return self.title

class SavedDrawings(models.Model):
    username = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)
    saveId = models.IntegerField()
    saveName = models.CharField(max_length=500)
    corners = models.JSONField()

# class CustomUser(AbstractUser):
#     # Any extra fields would go here
#     def __str__(self):
#         return self.email
