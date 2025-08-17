import logging
from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import SongLog
from .serializers import SongLogSerializer
from .services import SpotifyService, SocialFeedService
from rest_framework import serializers
from django.utils import timezone

logger = logging.getLogger(__name__)

# Create your views here.

class SongLogViewSet(viewsets.ModelViewSet):
    serializer_class = SongLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own song logs
        return SongLog.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Check if user has set their music preferences
        user = self.request.user
        if not user.favorite_genres and not user.favorite_artists and not user.mood_preferences:
            raise serializers.ValidationError(
                'Please update your music preferences in your profile before logging songs. This helps us match you with other users!'
            )
        
        # Automatically set the user when creating a song log
        serializer.save(user=user)

    def create(self, request, *args, **kwargs):
        """
        Override create to provide better error handling
        """
        try:
            return super().create(request, *args, **kwargs)
        except serializers.ValidationError as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            # Log the actual error for debugging
            logger.error("Error creating song log: %s", str(e), exc_info=True)
            return Response(
                {'error': 'Failed to log song. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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

        # Check if user has set their music preferences
        user = request.user
        if not user.favorite_genres and not user.favorite_artists and not user.mood_preferences:
            return Response(
                {'error': 'Please update your music preferences in your profile before logging songs. This helps us match you with other users!'}, 
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
            # Log the actual error for debugging
            logger.error("Error creating song log: %s", str(e), exc_info=True)
            return Response(
                {'error': 'Failed to log song. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def social_feed(self, request):
        """
        Get social feed of song logs from users with similar taste
        """
        try:
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 20))
            
            feed_data = SocialFeedService.get_social_feed(
                user=request.user,
                page=page,
                page_size=page_size
            )
            
            return Response(feed_data)
        except Exception as e:
            logger.error("Error in social_feed endpoint: %s", str(e), exc_info=True)
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def user_discovery(self, request):
        """
        Get users to discover based on music taste
        """
        try:
            limit = int(request.query_params.get('limit', 10))
            
            discovery_users = SocialFeedService.get_user_discovery(
                user=request.user,
                limit=limit
            )
            
            return Response(discovery_users)
        except Exception as e:
            logger.error("Error in user_discovery endpoint: %s", str(e), exc_info=True)
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def similar_users(self, request):
        """
        Get users with similar music taste
        """
        try:
            limit = int(request.query_params.get('limit', 10))
            
            similar_users = SocialFeedService.get_similar_users(
                user=request.user,
                limit=limit
            )
            
            # Format response
            formatted_users = []
            for user_data in similar_users:
                user = user_data['user']
                formatted_users.append({
                    'id': user.id,
                    'username': user.username,
                    'favorite_genres': user.favorite_genres,
                    'favorite_artists': user.favorite_artists[:3],
                    'similarity_score': user_data['similarity_score'],
                    'taste_match': SocialFeedService._get_taste_match_label(user_data['similarity_score'])
                })
            
            return Response(formatted_users)
        except Exception as e:
            logger.error("Error in similar_users endpoint: %s", str(e), exc_info=True)
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def search_artist(self, request):
        """
        Search for artists on Spotify
        """
        query = request.query_params.get('q', '')
        logger.info("Received Spotify artist search request for query: %s", query)
        if not query:
            logger.warning("Empty artist search query received")
            return Response(
                {'error': 'Search query is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            spotify_service = SpotifyService()
            results = spotify_service.search_artists(query)
            logger.info("Returning %d artist search results for query: %s", len(results), query)
            return Response(results)
        except Exception as e:
            logger.error("Error in search_artist endpoint: %s", str(e), exc_info=True)
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def check_preferences(self, request):
        """
        Check if user has set their music preferences
        """
        user = request.user
        has_preferences = bool(user.favorite_genres or user.favorite_artists or user.mood_preferences)
        
        return Response({
            'has_preferences': has_preferences,
            'message': 'Please update your music preferences in your profile to get the most out of TasteBud!' if not has_preferences else None,
            'preferences': {
                'favorite_genres': user.favorite_genres or [],
                'favorite_artists': user.favorite_artists or [],
                'mood_preferences': user.mood_preferences or []
            }
        })

    @action(detail=False, methods=['get'])
    def can_log_today(self, request):
        """
        Check if user can log a song today
        """
        user = request.user
        
        # Check if user has set preferences
        has_preferences = bool(user.favorite_genres or user.favorite_artists or user.mood_preferences)
        
        return Response({
            'can_log': has_preferences,
            'missing_preferences': not has_preferences,
            'message': self._get_can_log_message(has_preferences)
        })
    
    def _get_can_log_message(self, has_preferences):
        """
        Generate appropriate message based on user's current state
        """
        if not has_preferences:
            return "Please update your music preferences in your profile before logging songs. This helps us match you with other users!"
        else:
            return "You can log songs anytime!"

    # Removed today_log method - users can now log multiple songs per day

    @action(detail=False, methods=['get'])
    def home_status(self, request):
        """
        Get user's home page status and guidance
        """
        user = request.user
        
        # Check if user has set preferences
        has_preferences = bool(user.favorite_genres or user.favorite_artists or user.mood_preferences)
        
        # Get user's recent song logs
        recent_logs = SongLog.objects.filter(user=user).order_by('-date')[:5]
        recent_logs_data = self.get_serializer(recent_logs, many=True).data
        
        # Determine what guidance to show
        if not has_preferences:
            guidance = {
                'type': 'setup_preferences',
                'title': 'Welcome to TasteBud! 🎵',
                'message': 'To get started, please update your music preferences in your profile. This helps us match you with other users who share your taste!',
                'action_required': True,
                'action_text': 'Go to Profile',
                'action_url': '/profile'
            }
        else:
            guidance = {
                'type': 'can_log',
                'title': 'Ready to Log Songs! 🎶',
                'message': 'Share what you\'re listening to and discover music through our rating system!',
                'action_required': False,
                'action_text': 'Log Song',
                'action_url': '/log-song'
            }
        
        return Response({
            'user': {
                'username': user.username,
                'has_preferences': has_preferences,
                'preferences_count': {
                    'genres': len(user.favorite_genres or []),
                    'artists': len(user.favorite_artists or []),
                    'moods': len(user.mood_preferences or [])
                }
            },
            'today_status': {
                'can_log': has_preferences,
                'missing_preferences': not has_preferences
            },
            'recent_activity': {
                'total_logs': SongLog.objects.filter(user=user).count(),
                'recent_logs': recent_logs_data
            },
            'guidance': guidance
        })

    @action(detail=False, methods=['get'])
    def setup_guide(self, request):
        """
        Get setup guide for new users
        """
        user = request.user
        has_preferences = bool(user.favorite_genres or user.favorite_artists or user.mood_preferences)
        has_logged_songs = SongLog.objects.filter(user=user).exists()
        
        steps = []
        
        if not has_preferences:
            steps.append({
                'step': 1,
                'title': 'Set Your Music Preferences',
                'description': 'Tell us about your favorite genres, artists, and mood preferences. This helps us match you with other users!',
                'completed': False,
                'action': 'Go to Profile',
                'url': '/profile'
            })
        else:
            steps.append({
                'step': 1,
                'title': 'Set Your Music Preferences',
                'description': 'Great! You\'ve set your music preferences.',
                'completed': True,
                'action': None,
                'url': None
            })
        
        if not has_logged_songs:
            steps.append({
                'step': 2,
                'title': 'Log Your First Song',
                'description': 'Share what you\'re listening to! You can log songs anytime you want.',
                'completed': False,
                'action': 'Log Song',
                'url': '/log-song'
            })
        else:
            steps.append({
                'step': 2,
                'title': 'Log Your First Song',
                'description': 'Awesome! You\'ve started sharing your music.',
                'completed': True,
                'action': None,
                'url': None
            })
        
        steps.append({
            'step': 3,
            'title': 'Rate Songs & Discover',
            'description': 'Compare your songs with others and discover new music through our rating system!',
            'completed': has_logged_songs and SongLog.objects.filter(user=user).count() >= 2,
            'action': 'Rate Songs' if has_logged_songs and SongLog.objects.filter(user=user).count() >= 2 else None,
            'url': '/rate-songs' if has_logged_songs and SongLog.objects.filter(user=user).count() >= 2 else None
        })
        
        steps.append({
            'step': 4,
            'title': 'Explore Social Feed',
            'description': 'See what others are listening to and discover users with similar taste!',
            'completed': has_preferences,
            'action': 'View Social Feed',
            'url': '/social'
        })
        
        return Response({
            'user_progress': {
                'has_preferences': has_preferences,
                'has_logged_songs': has_logged_songs,
                'total_songs': SongLog.objects.filter(user=user).count(),
                'completion_percentage': len([s for s in steps if s['completed']]) / len(steps) * 100
            },
            'steps': steps,
            'next_action': next((s for s in steps if not s['completed']), None)
        })

    @action(detail=False, methods=['get'])
    def user_profile(self, request):
        """
        Get another user's profile data for viewing their profile
        """
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {'error': 'User ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from user_management.models import User
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Get user's recent song logs
        recent_logs = SongLog.objects.filter(user=target_user).order_by('-date', '-created_at')[:10]
        
        # Serialize the data
        profile_data = {
            'user': {
                'id': target_user.id,
                'username': target_user.username,
                'favorite_genres': target_user.favorite_genres or [],
                'favorite_artists': target_user.favorite_artists or [],
                'mood_preferences': target_user.mood_preferences or [],
            },
            'recent_activity': {
                'total_logs': SongLog.objects.filter(user=target_user).count(),
                'recent_logs': [
                    {
                        'id': log.id,
                        'song_title': log.song_title,
                        'artist': log.artist,
                        'album': log.album,
                        'album_art_url': log.album_art_url,
                        'date': log.date.isoformat(),
                        'note': log.note or '',
                        'rating': SocialFeedService.elo_to_rating_scale(log.elo_rating),  # Add 1-10 rating
                    }
                    for log in recent_logs
                ]
            }
        }

        return Response(profile_data)
