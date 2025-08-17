import math
from typing import Tuple, Dict, Any
from django.db import transaction, models
from .models import Rating
from music_logs.models import SongLog

class EloRatingService:
    """
    Service for handling ELO rating calculations and updates
    """
    
    # ELO rating constants
    K_FACTOR = 32  # Maximum rating change per game
    INITIAL_RATING = 1500.0
    
    @classmethod
    def calculate_expected_score(cls, rating_a: float, rating_b: float) -> float:
        """
        Calculate the expected score for player A against player B
        """
        return 1.0 / (1.0 + math.pow(10, (rating_b - rating_a) / 400.0))
    
    @classmethod
    def calculate_new_rating(cls, current_rating: float, expected_score: float, actual_score: float) -> float:
        """
        Calculate new rating based on expected vs actual score
        """
        return current_rating + cls.K_FACTOR * (actual_score - expected_score)
    
    @classmethod
    def update_ratings(cls, winner_rating: float, loser_rating: float) -> Tuple[float, float]:
        """
        Update ELO ratings for winner and loser
        Returns: (new_winner_rating, new_loser_rating)
        """
        # Calculate expected scores
        winner_expected = cls.calculate_expected_score(winner_rating, loser_rating)
        loser_expected = cls.calculate_expected_score(loser_rating, winner_rating)
        
        # Calculate new ratings
        new_winner_rating = cls.calculate_new_rating(winner_rating, winner_expected, 1.0)
        new_loser_rating = cls.calculate_new_rating(loser_rating, loser_expected, 0.0)
        
        return new_winner_rating, new_loser_rating

class RatingService:
    """
    Service for handling rating operations
    """
    
    @classmethod
    def create_rating(cls, user, song_log_id: int, compared_song_log_id: int, winner_song_log_id: int) -> Rating:
        """
        Create a new rating comparison and update ELO ratings
        """
        with transaction.atomic():
            # Get the song logs
            song_log = SongLog.objects.get(id=song_log_id, user=user)
            compared_song_log = SongLog.objects.get(id=compared_song_log_id, user=user)
            winner_song_log = SongLog.objects.get(id=winner_song_log_id, user=user)
            
            # Determine which song is the loser
            if winner_song_log_id == song_log_id:
                loser_song_log = compared_song_log
            else:
                loser_song_log = song_log
            
            # Update ELO ratings
            new_winner_rating, new_loser_rating = EloRatingService.update_ratings(
                winner_song_log.elo_rating,
                loser_song_log.elo_rating
            )
            
            # Save the new ratings
            winner_song_log.elo_rating = new_winner_rating
            winner_song_log.save()
            
            loser_song_log.elo_rating = new_loser_rating
            loser_song_log.save()
            
            # Create the rating record
            rating = Rating.objects.create(
                user=user,
                song_log=song_log,
                compared_song_log=compared_song_log,
                winner_song_log=winner_song_log
            )
            
            return rating
    
    @classmethod
    def get_comparison_pair(cls, user) -> Dict[str, Any]:
        """
        Get a random pair of songs for comparison
        """
        # Get songs that haven't been compared yet
        user_songs = SongLog.objects.filter(user=user).order_by('?')[:10]
        
        if len(user_songs) < 2:
            return None
        
        # Find a pair that hasn't been compared
        for i in range(len(user_songs)):
            for j in range(i + 1, len(user_songs)):
                song1 = user_songs[i]
                song2 = user_songs[j]
                
                # Check if this pair has already been rated
                existing_rating = Rating.objects.filter(
                    user=user,
                    song_log__in=[song1, song2],
                    compared_song_log__in=[song1, song2]
                ).first()
                
                if not existing_rating:
                    return {
                        'song1': {
                            'id': song1.id,
                            'title': song1.song_title,
                            'artist': song1.artist,
                            'album': song1.album,
                            'album_art_url': song1.album_art_url,
                            'elo_rating': song1.elo_rating,
                            'date': song1.date
                        },
                        'song2': {
                            'id': song2.id,
                            'title': song2.song_title,
                            'artist': song2.artist,
                            'album': song2.album,
                            'album_art_url': song2.album_art_url,
                            'elo_rating': song2.elo_rating,
                            'date': song2.date
                        }
                    }
        
        return None
    
    @classmethod
    def get_user_rankings(cls, user) -> list:
        """
        Get user's songs ranked by ELO rating
        """
        return SongLog.objects.filter(user=user).order_by('-elo_rating')
    
    @classmethod
    def get_rating_stats(cls, user) -> Dict[str, Any]:
        """
        Get rating statistics for a user
        """
        total_ratings = Rating.objects.filter(user=user).count()
        total_songs = SongLog.objects.filter(user=user).count()
        
        if total_songs == 0:
            return {
                'total_ratings': 0,
                'total_songs': 0,
                'avg_rating': 0,
                'highest_rated_song': None,
                'lowest_rated_song': None
            }
        
        songs = SongLog.objects.filter(user=user)
        # Calculate average using 1-10 scale ratings instead of raw ELO
        avg_rating = sum(song.rating for song in songs) / total_songs if total_songs > 0 else 0
        highest_rated = songs.order_by('-elo_rating').first()
        lowest_rated = songs.order_by('elo_rating').first()
        
        return {
            'total_ratings': total_ratings,
            'total_songs': total_songs,
            'avg_rating': round(avg_rating, 2) if avg_rating else 0,
            'highest_rated_song': {
                'title': highest_rated.song_title,
                'artist': highest_rated.artist,
                'rating': highest_rated.rating  # Use 1-10 scale rating
            } if highest_rated else None,
            'lowest_rated_song': {
                'title': lowest_rated.song_title,
                'artist': lowest_rated.artist,
                'rating': lowest_rated.rating  # Use 1-10 scale rating
            } if lowest_rated else None
        } 