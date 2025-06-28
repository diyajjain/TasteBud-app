import os
import logging
from typing import List, Dict, Optional, Any
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from django.conf import settings
from django.db.models import Q, Count, Avg
from django.contrib.auth import get_user_model

from .models import SongLog

User = get_user_model()
logger = logging.getLogger(__name__)

class SpotifyService:
    def __init__(self):
        self.client_id = os.getenv('SPOTIFY_CLIENT_ID')
        self.client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
        
        if not self.client_id or not self.client_secret:
            logger.error("Spotify credentials not found in environment variables")
            raise ValueError("Spotify credentials not found in environment variables")
        
        logger.info("Initializing Spotify service with client ID: %s", self.client_id[:5] + "...")
        self.client_credentials_manager = SpotifyClientCredentials(
            client_id=self.client_id,
            client_secret=self.client_secret
        )
        self.sp = spotipy.Spotify(client_credentials_manager=self.client_credentials_manager)

    def search_songs(self, query: str, limit: int = 10) -> List[Dict]:
        """
        Search for songs on Spotify
        Returns a list of song dictionaries with relevant information
        """
        try:
            logger.info("Searching Spotify for query: %s", query)
            results = self.sp.search(
                q=query,
                limit=limit,
                type='track',
                market='US'  # You can make this configurable based on user's location
            )
            
            if not results.get('tracks'):
                logger.warning("No tracks found in Spotify response for query: %s", query)
                return []
            
            tracks = results['tracks'].get('items', [])
            logger.info("Found %d tracks for query: %s", len(tracks), query)
            
            songs = []
            for track in tracks:
                try:
                    song = {
                        'spotify_id': track['id'],
                        'title': track['name'],
                        'artist': track['artists'][0]['name'],
                        'album': track['album']['name'],
                        'album_art': track['album']['images'][0]['url'] if track['album']['images'] else None,
                        'preview_url': track['preview_url'],
                        'duration_ms': track['duration_ms'],
                        'popularity': track['popularity']
                    }
                    songs.append(song)
                except (KeyError, IndexError) as e:
                    logger.error("Error processing track data: %s", str(e))
                    continue
            
            return songs
        except Exception as e:
            logger.error("Error searching Spotify: %s", str(e), exc_info=True)
            return []

    def get_song_details(self, spotify_id: str) -> Optional[Dict]:
        """
        Get detailed information about a specific song using its Spotify ID
        """
        try:
            track = self.sp.track(spotify_id)
            return {
                'spotify_id': track['id'],
                'title': track['name'],
                'artist': track['artists'][0]['name'],
                'album': track['album']['name'],
                'album_art': track['album']['images'][0]['url'] if track['album']['images'] else None,
                'preview_url': track['preview_url'],
                'duration_ms': track['duration_ms'],
                'popularity': track['popularity']
            }
        except Exception as e:
            print(f"Error getting song details: {str(e)}")
            return None 

class SocialFeedService:
    """
    Service for handling social feed and user discovery based on music taste
    """
    
    @classmethod
    def calculate_taste_similarity(cls, user1: User, user2: User) -> float:
        """
        Calculate taste similarity between two users based on their music preferences
        Returns a score between 0 and 1, where 1 is most similar
        """
        similarity_score = 0.0
        total_weight = 0.0
        
        # Compare favorite genres (weight: 0.4)
        if user1.favorite_genres and user2.favorite_genres:
            genre_overlap = len(set(user1.favorite_genres) & set(user2.favorite_genres))
            genre_total = len(set(user1.favorite_genres) | set(user2.favorite_genres))
            if genre_total > 0:
                genre_similarity = genre_overlap / genre_total
                similarity_score += genre_similarity * 0.4
                total_weight += 0.4
        
        # Compare favorite artists (weight: 0.3)
        if user1.favorite_artists and user2.favorite_artists:
            artist_overlap = len(set(user1.favorite_artists) & set(user2.favorite_artists))
            artist_total = len(set(user1.favorite_artists) | set(user2.favorite_artists))
            if artist_total > 0:
                artist_similarity = artist_overlap / artist_total
                similarity_score += artist_similarity * 0.3
                total_weight += 0.3
        
        # Compare mood preferences (weight: 0.2)
        if user1.mood_preferences and user2.mood_preferences:
            mood_overlap = len(set(user1.mood_preferences) & set(user2.mood_preferences))
            mood_total = len(set(user1.mood_preferences) | set(user2.mood_preferences))
            if mood_total > 0:
                mood_similarity = mood_overlap / mood_total
                similarity_score += mood_similarity * 0.2
                total_weight += 0.2
        
        # Compare actual logged songs (weight: 0.1)
        user1_songs = set(SongLog.objects.filter(user=user1).values_list('artist', flat=True))
        user2_songs = set(SongLog.objects.filter(user=user2).values_list('artist', flat=True))
        if user1_songs and user2_songs:
            song_overlap = len(user1_songs & user2_songs)
            song_total = len(user1_songs | user2_songs)
            if song_total > 0:
                song_similarity = song_overlap / song_total
                similarity_score += song_similarity * 0.1
                total_weight += 0.1
        
        # Normalize by total weight
        if total_weight > 0:
            return similarity_score / total_weight
        
        return 0.0
    
    @classmethod
    def get_similar_users(cls, user: User, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get users with similar music taste
        """
        # Get all users except the current user
        all_users = User.objects.exclude(id=user.id)
        
        # Calculate similarity scores
        user_similarities = []
        for other_user in all_users:
            similarity = cls.calculate_taste_similarity(user, other_user)
            if similarity > 0:  # Only include users with some similarity
                user_similarities.append({
                    'user': other_user,
                    'similarity_score': similarity
                })
        
        # Sort by similarity score (highest first)
        user_similarities.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        # Return top users with their similarity scores
        return user_similarities[:limit]
    
    @classmethod
    def get_social_feed(cls, user: User, page: int = 1, page_size: int = 20) -> Dict[str, Any]:
        """
        Get a social feed of song logs from users with similar taste
        """
        # Get similar users
        similar_users = cls.get_similar_users(user, limit=20)
        
        if not similar_users:
            # If no similar users, get recent logs from all users
            recent_logs = SongLog.objects.exclude(user=user).order_by('-created_at')
        else:
            # Get logs from similar users
            similar_user_ids = [u['user'].id for u in similar_users]
            recent_logs = SongLog.objects.filter(
                user_id__in=similar_user_ids
            ).order_by('-created_at')
        
        # Paginate results
        start = (page - 1) * page_size
        end = start + page_size
        paginated_logs = recent_logs[start:end]
        
        # Prepare feed items with user info and similarity scores
        feed_items = []
        for log in paginated_logs:
            # Find similarity score for this user
            similarity_score = 0.0
            for similar_user in similar_users:
                if similar_user['user'].id == log.user.id:
                    similarity_score = similar_user['similarity_score']
                    break
            
            feed_items.append({
                'id': log.id,
                'song_title': log.song_title,
                'artist': log.artist,
                'album': log.album,
                'note': log.note,
                'date': log.date,
                'created_at': log.created_at,
                'album_art_url': log.album_art_url,
                'elo_rating': log.elo_rating,
                'user': {
                    'id': log.user.id,
                    'username': log.user.username,
                    'favorite_genres': log.user.favorite_genres,
                    'favorite_artists': log.user.favorite_artists[:3],  # Show first 3
                },
                'similarity_score': similarity_score,
                'taste_match': cls._get_taste_match_label(similarity_score)
            })
        
        return {
            'feed_items': feed_items,
            'total_count': recent_logs.count(),
            'page': page,
            'page_size': page_size,
            'has_next': end < recent_logs.count(),
            'has_previous': page > 1
        }
    
    @classmethod
    def _get_taste_match_label(cls, similarity_score: float) -> str:
        """
        Convert similarity score to human-readable label
        """
        if similarity_score >= 0.8:
            return "Excellent Match"
        elif similarity_score >= 0.6:
            return "Great Match"
        elif similarity_score >= 0.4:
            return "Good Match"
        elif similarity_score >= 0.2:
            return "Some Similarity"
        else:
            return "Different Taste"
    
    @classmethod
    def get_user_discovery(cls, user: User, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get users to discover based on music taste
        """
        similar_users = cls.get_similar_users(user, limit=limit)
        
        discovery_users = []
        for similar_user in similar_users:
            other_user = similar_user['user']
            
            # Get their recent song logs
            recent_logs = SongLog.objects.filter(user=other_user).order_by('-created_at')[:3]
            
            discovery_users.append({
                'user': {
                    'id': other_user.id,
                    'username': other_user.username,
                    'favorite_genres': other_user.favorite_genres,
                    'favorite_artists': other_user.favorite_artists[:3],
                },
                'similarity_score': similar_user['similarity_score'],
                'taste_match': cls._get_taste_match_label(similar_user['similarity_score']),
                'recent_songs': [
                    {
                        'title': log.song_title,
                        'artist': log.artist,
                        'album': log.album,
                        'album_art_url': log.album_art_url,
                        'date': log.date
                    }
                    for log in recent_logs
                ],
                'total_songs': SongLog.objects.filter(user=other_user).count()
            })
        
        return discovery_users 