from django.contrib import admin
from .models import Rating

@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ('user', 'song_log', 'compared_song_log', 'winner_song_log', 'created_at')
    list_filter = ('user', 'created_at')
    search_fields = ('song_log__song_title', 'compared_song_log__song_title')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
