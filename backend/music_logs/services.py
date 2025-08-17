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

    def search_artists(self, query: str, limit: int = 10) -> List[Dict]:
        """
        Search for artists on Spotify
        Returns a list of artist dictionaries with relevant information
        """
        try:
            logger.info("Searching Spotify for artists: %s", query)
            results = self.sp.search(
                q=query,
                limit=limit,
                type='artist',
                market='US'
            )
            if not results.get('artists'):
                logger.warning("No artists found in Spotify response for query: %s", query)
                return []
            artists = results['artists'].get('items', [])
            logger.info("Found %d artists for query: %s", len(artists), query)
            artist_list = []
            for artist in artists:
                try:
                    artist_list.append({
                        'id': artist['id'],
                        'name': artist['name'],
                        'image': artist['images'][0]['url'] if artist['images'] else None
                    })
                except (KeyError, IndexError) as e:
                    logger.error("Error processing artist data: %s", str(e))
                    continue
            return artist_list
        except Exception as e:
            logger.error("Error searching Spotify for artists: %s", str(e), exc_info=True)
            return []

class SocialFeedService:
    """
    Service for handling social feed and user discovery based on music taste
    """
    
    @staticmethod
    def elo_to_rating_scale(elo_score, min_elo=800, max_elo=2000):
        """
        Convert ELO score to 1-10 scale for display
        ELO 800 → 1.0, ELO 1200 → 5.0, ELO 2000+ → 10.0
        """
        if elo_score <= min_elo:
            return 1.0
        elif elo_score >= max_elo:
            return 10.0
        else:
            # Linear mapping: 800 → 1.0, 2000 → 10.0
            normalized = (elo_score - min_elo) / (max_elo - min_elo)
            return round(1.0 + (normalized * 9.0), 1)
    
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
            def extract_artist_ids_or_names(artist_list):
                ids = set()
                names = set()
                for a in artist_list:
                    if isinstance(a, dict) and a.get('id'):
                        ids.add(a['id'])
                        names.add(a['name'])
                    elif isinstance(a, dict) and a.get('name'):
                        names.add(a['name'])
                    elif isinstance(a, str):
                        names.add(a)
                return ids, names
            
            user1_ids, user1_names = extract_artist_ids_or_names(user1.favorite_artists)
            user2_ids, user2_names = extract_artist_ids_or_names(user2.favorite_artists)
            
            # Debug logging
            logger.info(f"User {user1.username} artists - IDs: {user1_ids}, Names: {user1_names}")
            logger.info(f"User {user2.username} artists - IDs: {user2_ids}, Names: {user2_names}")
            
            # Try ID matching first (most reliable)
            if user1_ids and user2_ids:
                id_overlap = len(user1_ids & user2_ids)
                id_total = len(user1_ids | user2_ids)
                if id_total > 0:
                    artist_similarity = id_overlap / id_total
                    logger.info(f"Artist similarity by ID: {artist_similarity} ({id_overlap}/{id_total})")
                    similarity_score += artist_similarity * 0.3
                    total_weight += 0.3
            # Fallback to name matching if no ID match
            elif user1_names and user2_names:
                name_overlap = len(user1_names & user2_names)
                name_total = len(user1_names | user2_names)
                if name_total > 0:
                    artist_similarity = name_overlap / name_total
                    logger.info(f"Artist similarity by name: {artist_similarity} ({name_overlap}/{name_total})")
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
                'rating': cls.elo_to_rating_scale(log.elo_rating),  # 1-10 scale
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
                        'date': log.date,
                        'rating': cls.elo_to_rating_scale(log.elo_rating)  # 1-10 scale
                    }
                    for log in recent_logs
                ],
                'total_songs': SongLog.objects.filter(user=other_user).count()
            })
        
        return discovery_users 