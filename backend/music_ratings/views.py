from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Rating
from .serializers import RatingSerializer
from .services import RatingService

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

    @action(detail=False, methods=['get'])
    def comparison_pair(self, request):
        """
        Get a random pair of songs for comparison
        """
        try:
            pair = RatingService.get_comparison_pair(request.user)
            if not pair:
                return Response(
                    {'error': 'No songs available for comparison. Add more songs to start rating!'},
                    status=status.HTTP_404_NOT_FOUND
                )
            return Response(pair)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def create_comparison(self, request):
        """
        Create a new rating comparison
        """
        song_log_id = request.data.get('song_log_id')
        compared_song_log_id = request.data.get('compared_song_log_id')
        winner_song_log_id = request.data.get('winner_song_log_id')

        if not all([song_log_id, compared_song_log_id, winner_song_log_id]):
            return Response(
                {'error': 'song_log_id, compared_song_log_id, and winner_song_log_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if winner_song_log_id not in [song_log_id, compared_song_log_id]:
            return Response(
                {'error': 'winner_song_log_id must be one of the compared songs'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            rating = RatingService.create_rating(
                request.user,
                song_log_id,
                compared_song_log_id,
                winner_song_log_id
            )
            return Response(RatingSerializer(rating).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def rankings(self, request):
        """
        Get user's songs ranked by ELO rating
        """
        try:
            rankings = RatingService.get_user_rankings(request.user)
            from music_logs.serializers import SongLogSerializer
            return Response(SongLogSerializer(rankings, many=True).data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get rating statistics for the user
        """
        try:
            stats = RatingService.get_rating_stats(request.user)
            return Response(stats)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
