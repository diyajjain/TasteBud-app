from django.contrib import admin
from .models import SongLog

@admin.register(SongLog)
class SongLogAdmin(admin.ModelAdmin):
    list_display = ('song_title', 'artist', 'user', 'date', 'elo_rating')
    list_filter = ('date', 'user')
    search_fields = ('song_title', 'artist', 'album', 'note')
    date_hierarchy = 'date'
    ordering = ('-date', '-created_at')
