from rest_framework import serializers
from .models import DrawApp, SavedDrawings

class DrawAppSerializer(serializers.ModelSerializer):
    class Meta:
        model = DrawApp
        fields = ('id', 'title', 'description', 'completed')

class SavedDrawingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedDrawings
        fields = ('id', 'username', 'saveId', 'saveName', 'corners')