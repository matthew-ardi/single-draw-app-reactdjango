from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import JSONParser
from django.http.response import JsonResponse
from .serializers import DrawAppSerializer, SavedDrawingsSerializer
from .models import DrawApp, SavedDrawings
from django.views import View
from django.http import HttpResponse, HttpResponseNotFound
import os
import sys

# Create your views here.


class DrawAppView(viewsets.ModelViewSet):
    serializer_class = DrawAppSerializer
    queryset = DrawApp.objects.all()

# class SavedDrawingsView(viewsets.ModelViewSet):
#     permission_classes = [permissions.IsAuthenticated, ]
#     serializer_class = SavedDrawingsSerializer
#     queryset = SavedDrawings.objects.all()


class SavedDrawingsView(viewsets.ModelViewSet):
    serializer_class = SavedDrawingsSerializer
    # permission_classes = [permissions.IsAuthenticated, ]

    def get_queryset(self):
        # logging.info(user)
        user = self.request.user
        queryset = SavedDrawings.objects.all()
        return queryset.filter(username=user)

    def pre_save(self, obj):
        obj.created_by = self.request.user


@api_view(['DELETE', 'PUT'])
# @permission_classes((permissions.IsAuthenticated, ))
def SavedDrawingsList(request, id):
    try:
        drawing = SavedDrawings.objects.get(id=id)
    except SavedDrawings.DoesNotExist:
        return JsonResponse({'message': 'The drawing does not exist'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        inputData = JSONParser().parse(request)
        serializer_class = SavedDrawingsSerializer(drawing, data=inputData)

        if serializer_class.is_valid():
            serializer_class.save()
            return JsonResponse(serializer_class.data)
        return JsonResponse(serializer_class.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        drawing.delete()
        return JsonResponse({'message': 'drawing was deleted successfully!'})


class Assets(View):

    def get(self, _request, filename):
        path = os.path.join(os.path.dirname(__file__), 'static', filename)

        if os.path.isfile(path):
            with open(path, 'rb') as file:
                return HttpResponse(file.read(), content_type='application/javascript')
        else:
            return HttpResponseNotFound()
