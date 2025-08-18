import axios from 'axios';
import type { SpotifySong, CreateSongLogData } from '../types/spotify.ts';
import type { SongLog } from '../types/songlog.ts';

// Temporarily hardcoded for testing deployment
const API_URL = 'https://tastebud-backend.onrender.com/api';
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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
        try {
            const response = await spotifyClient.post('/song-logs/create_from_spotify/', data);
            return response.data;
        } catch (error: any) {
            // Extract the specific error message from the backend
            if (error.response?.data?.error) {
                throw new Error(error.response.data.error);
            } else if (error.response?.status === 400) {
                throw new Error('Invalid request. Please check your input and try again.');
            } else if (error.response?.status === 401) {
                throw new Error('Authentication required. Please log in again.');
            } else if (error.response?.status === 500) {
                throw new Error('Server error. Please try again later.');
            } else {
                throw new Error('Failed to create song log. Please try again.');
            }
        }
    },

    getSongLogs: async (): Promise<SongLog[]> => {
        const response = await spotifyClient.get('/song-logs/');
        return response.data;
    },

    checkCanLogToday: async (): Promise<any> => {
        const response = await spotifyClient.get('/song-logs/can_log_today/');
        return response.data;
    },

    getHomeStatus: async (): Promise<any> => {
        const response = await spotifyClient.get('/song-logs/home_status/');
        return response.data;
    },

    getUserProfile: async (userId: number): Promise<any> => {
        const response = await spotifyClient.get(`/song-logs/user_profile/?user_id=${userId}`);
        return response.data;
    },

    searchSpotifyArtists: async (query: string): Promise<{ id: string; name: string; image: string | null }[]> => {
        const response = await spotifyClient.get('/song-logs/search_artist/', {
            params: { q: query }
        });
        return response.data;
    }
}; 