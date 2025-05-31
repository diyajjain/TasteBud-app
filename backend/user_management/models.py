from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    favorite_genres = models.JSONField(default=list, blank=True)
    favorite_artists = models.JSONField(default=list, blank=True)
    mood_preferences = models.JSONField(default=list, blank=True)

    def __str__(self):
        return self.username
