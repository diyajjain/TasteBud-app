from rest_framework import serializers
from .models import SongLog

class SongLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SongLog
        fields = [
            'id', 'user', 'song_title', 'artist', 'album', 'note', 
            'date', 'created_at', 'elo_rating', 'rating', 'spotify_id', 
            'album_art_url', 'preview_url', 'duration_ms', 'popularity'
        ]
        read_only_fields = ['id', 'created_at', 'elo_rating', 'rating'] 