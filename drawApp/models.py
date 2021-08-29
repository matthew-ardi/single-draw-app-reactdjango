from django.db import models

# Create your models here.
class DrawApp(models.Model):
    title = models.CharField(max_length=120)
    description = models.TextField()
    completed = models.BooleanField(default=False)

    def _str_(self):
        return self.title

class SavedDrawings(models.Model):
    username = models.CharField(max_length=120)
    saveId = models.IntegerField()
    saveName = models.CharField(max_length=500)
    corners = models.JSONField()

