from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SongLogViewSet

router = DefaultRouter()
router.register(r'song-logs', SongLogViewSet, basename='songlog')

urlpatterns = [
    path('', include(router.urls)),
] 