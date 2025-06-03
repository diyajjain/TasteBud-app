from rest_framework import serializers
from .models import SongLog

class SongLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SongLog
        fields = ['id', 'title', 'artist', 'spotify_id', 'created_at', 'user']
        read_only_fields = ['id', 'created_at', 'user']  # These fields can't be set by the API 