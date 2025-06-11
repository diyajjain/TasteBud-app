import logging
from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import SongLog
from .serializers import SongLogSerializer
from .services import SpotifyService

logger = logging.getLogger(__name__)

# Create your views here.

class SongLogViewSet(viewsets.ModelViewSet):
    serializer_class = SongLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own song logs
        return SongLog.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the user when creating a song log
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def search_spotify(self, request):
        """
        Search for songs on Spotify
        """
        query = request.query_params.get('q', '')
        logger.info("Received Spotify search request for query: %s", query)
        
        if not query:
            logger.warning("Empty search query received")
            return Response(
                {'error': 'Search query is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            spotify_service = SpotifyService()
            results = spotify_service.search_songs(query)
            logger.info("Returning %d search results for query: %s", len(results), query)
            return Response(results)
        except Exception as e:
            logger.error("Error in search_spotify endpoint: %s", str(e), exc_info=True)
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def create_from_spotify(self, request):
        """
        Create a new song log entry from Spotify data
        """
        spotify_id = request.data.get('spotify_id')
        if not spotify_id:
            return Response(
                {'error': 'Spotify ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            spotify_service = SpotifyService()
            song_data = spotify_service.get_song_details(spotify_id)
            
            if not song_data:
                return Response(
                    {'error': 'Song not found on Spotify'}, 
                    status=status.HTTP_404_NOT_FOUND
                )

            # Create song log entry with Spotify data
            song_log_data = {
                'user': request.user.id,
                'song_title': song_data['title'],
                'artist': song_data['artist'],
                'album': song_data['album'],
                'spotify_id': song_data['spotify_id'],
                'album_art_url': song_data['album_art'],
                'preview_url': song_data['preview_url'],
                'duration_ms': song_data['duration_ms'],
                'popularity': song_data['popularity'],
                'date': request.data.get('date'),  # Required field from request
                'note': request.data.get('note', '')  # Optional note
            }

            serializer = self.get_serializer(data=song_log_data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
