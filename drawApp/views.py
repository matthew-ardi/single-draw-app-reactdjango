from django.shortcuts import render
from rest_framework import viewsets, permissions
from .serializers import DrawAppSerializer, SavedDrawingsSerializer
from .models import DrawApp, SavedDrawings
from django.views import View
from django.http import HttpResponse, HttpResponseNotFound
import os, sys

# Create your views here.

class DrawAppView(viewsets.ModelViewSet):
    serializer_class = DrawAppSerializer
    queryset = DrawApp.objects.all()

class SavedDrawingsView(viewsets.ModelViewSet):
    serializer_class = SavedDrawingsSerializer
    queryset = SavedDrawings.objects.all()

# class SavedDrawingsView(viewsets.ModelViewSet):
#     serializer_class = SavedDrawingsSerializer
#     permission_classes = [permissions.IsAuthenticated, ]
#     def get_queryset(self):
#         # logging.info(user)
#         user = self.request.user
#         queryset =  SavedDrawings.objects.all()
#         return queryset.filter(username=user)
    
    def pre_save(self, obj):
        obj.created_by = self.request.user

class Assets(View):

    def get(self, _request, filename):
        path = os.path.join(os.path.dirname(__file__), 'static', filename)

        if os.path.isfile(path):
            with open(path, 'rb') as file:
                return HttpResponse(file.read(), content_type='application/javascript')
        else:
            return HttpResponseNotFound()
