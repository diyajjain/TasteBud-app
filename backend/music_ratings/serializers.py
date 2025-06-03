from rest_framework import serializers
from .models import Rating
from music_logs.serializers import SongLogSerializer

class RatingSerializer(serializers.ModelSerializer):
    # Include full song log details when retrieving ratings
    song_log = SongLogSerializer(read_only=True)
    compared_song_log = SongLogSerializer(read_only=True)
    winner_song_log = SongLogSerializer(read_only=True)

    class Meta:
        model = Rating
        fields = ['id', 'user', 'song_log', 'compared_song_log', 'winner_song_log', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

    def create(self, validated_data):
        # Automatically set the user to the current user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data) 