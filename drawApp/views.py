from django.shortcuts import render
from rest_framework import viewsets
from .serializers import DrawAppSerializer, SavedDrawingsSerializer
from .models import DrawApp, SavedDrawings


# Create your views here.

class DrawAppView(viewsets.ModelViewSet):
    serializer_class = DrawAppSerializer
    queryset = DrawApp.objects.all()

class SavedDrawingsView(viewsets.ModelViewSet):
    serializer_class = SavedDrawingsSerializer
    queryset = SavedDrawings.objects.all()