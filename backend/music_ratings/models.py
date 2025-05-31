from django.db import models
from django.conf import settings
from music_logs.models import SongLog

class Rating(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ratings')
    song_log = models.ForeignKey(SongLog, on_delete=models.CASCADE, related_name='ratings')
    compared_song_log = models.ForeignKey(SongLog, on_delete=models.CASCADE, related_name='compared_ratings')
    winner_song_log = models.ForeignKey(SongLog, on_delete=models.CASCADE, related_name='winning_ratings')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'song_log', 'compared_song_log']

    def __str__(self):
        return f"Rating: {self.song_log} vs {self.compared_song_log} by {self.user}"
