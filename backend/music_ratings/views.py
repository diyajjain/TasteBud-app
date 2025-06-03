from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Rating
from .serializers import RatingSerializer

# Create your views here.

class RatingViewSet(viewsets.ModelViewSet):
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own ratings
        return Rating.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the user when creating a rating
        serializer.save(user=self.request.user)
