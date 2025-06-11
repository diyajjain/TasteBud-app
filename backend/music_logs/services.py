import os
import logging
from typing import List, Dict, Optional
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from django.conf import settings

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