import axios from 'axios';
import type { SpotifySong, CreateSongLogData } from '../types/spotify.ts';
import type { SongLog } from '../types/songlog.ts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create an axios instance with default config
const spotifyClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
spotifyClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
});

export const spotifyApi = {
    searchSongs: async (query: string): Promise<SpotifySong[]> => {
        const response = await spotifyClient.get('/song-logs/search_spotify/', {
            params: { q: query }
        });
        return response.data;
    },

    createSongLog: async (data: CreateSongLogData): Promise<any> => {
        const response = await spotifyClient.post('/song-logs/create_from_spotify/', data);
        return response.data;
    },

    getSongLogs: async (): Promise<SongLog[]> => {
        const response = await spotifyClient.get('/song-logs/');
        return response.data;
    },

    searchSpotifyArtists: async (query: string): Promise<{ id: string; name: string; image: string | null }[]> => {
        const response = await spotifyClient.get('/song-logs/search_artist/', {
            params: { q: query }
        });
        return response.data;
    }
}; 