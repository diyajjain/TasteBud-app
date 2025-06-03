from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import SongLog
from .serializers import SongLogSerializer

# Create your views here.

class SongLogViewSet(viewsets.ModelViewSet):
    serializer_class = SongLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own song logs
        return SongLog.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the user when creating a song log
        serializer.save(user=self.request.user)
