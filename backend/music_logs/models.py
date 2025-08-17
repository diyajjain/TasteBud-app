from django.db import models
from django.conf import settings

# Create your models here.

class SongLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='song_logs')
    song_title = models.CharField(max_length=255)
    artist = models.CharField(max_length=255)
    album = models.CharField(max_length=255, blank=True)
    note = models.TextField(blank=True)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    elo_rating = models.FloatField(default=1500.0)
    
    # Spotify specific fields
    spotify_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    album_art_url = models.URLField(max_length=500, blank=True, null=True)
    preview_url = models.URLField(max_length=500, blank=True, null=True)
    duration_ms = models.IntegerField(null=True, blank=True)
    popularity = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.song_title} by {self.artist} ({self.date})"
