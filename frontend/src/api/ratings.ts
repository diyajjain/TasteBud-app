import axios from 'axios';
import type { SongLog } from '../types/songlog';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create an axios instance with default config
const ratingsClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
ratingsClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
});

export interface ComparisonPair {
    song1: {
        id: number;
        title: string;
        artist: string;
        album: string;
        album_art_url: string | null;
        elo_rating: number;
        date: string;
    };
    song2: {
        id: number;
        title: string;
        artist: string;
        album: string;
        album_art_url: string | null;
        elo_rating: number;
        date: string;
    };
}

export interface RatingStats {
    total_ratings: number;
    total_songs: number;
    avg_rating: number;
    highest_rated_song: {
        title: string;
        artist: string;
        rating: number;
    } | null;
    lowest_rated_song: {
        title: string;
        artist: string;
        rating: number;
    } | null;
}

export interface CreateRatingData {
    song_log_id: number;
    compared_song_log_id: number;
    winner_song_log_id: number;
}

export const ratingsApi = {
    getComparisonPair: async (): Promise<ComparisonPair> => {
        const response = await ratingsClient.get('/ratings/comparison_pair/');
        return response.data;
    },

    createRating: async (data: CreateRatingData): Promise<any> => {
        const response = await ratingsClient.post('/ratings/create_comparison/', data);
        return response.data;
    },

    getRankings: async (): Promise<SongLog[]> => {
        const response = await ratingsClient.get('/ratings/rankings/');
        return response.data;
    },

    getStats: async (): Promise<RatingStats> => {
        const response = await ratingsClient.get('/ratings/stats/');
        return response.data;
    },

    getRatingHistory: async (): Promise<any[]> => {
        const response = await ratingsClient.get('/ratings/');
        return response.data;
    }
}; 