from rest_framework import serializers
from .models import DrawApp, SavedDrawings#, CustomUser
# from rest_framework.serializers import ModelSerializer

class DrawAppSerializer(serializers.ModelSerializer):
    class Meta:
        model = DrawApp
        fields = ('id', 'title', 'description', 'completed')

class SavedDrawingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedDrawings
        fields = ('id', 'username', 'saveId', 'saveName', 'corners')

# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = CustomUser
#         fields = ('email', 'last_login', 'date_joined', 'is_staff')