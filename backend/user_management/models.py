from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    favorite_genres = models.JSONField(default=list, blank=True)
    # favorite_artists is a list of objects: {id: str, name: str, image: str|null}
    favorite_artists = models.JSONField(default=list, blank=True)
    mood_preferences = models.JSONField(default=list, blank=True)
    """
    Example for favorite_artists:
    [
      {"id": "1uNFoZAHBGtllmzznpCI3s", "name": "Justin Bieber", "image": "https://..."},
      {"id": "06HL4z0CvFAxyc27GXpf02", "name": "Taylor Swift", "image": "https://..."}
    ]
    """

    def __str__(self):
        return self.username
