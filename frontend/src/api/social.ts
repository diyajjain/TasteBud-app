import axios from 'axios';

// Temporarily hardcoded for testing deployment
const API_URL = 'https://tastebud-backend.onrender.com/api';
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create an axios instance with default config
const socialClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
socialClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
});

export interface FeedItem {
    id: number;
    song_title: string;
    artist: string;
    album: string;
    note: string;
    date: string;
    created_at: string;
    album_art_url: string | null;
    elo_rating: number;
    rating: number;  // 1-10 scale rating
    user: {
        id: number;
        username: string;
        favorite_genres: string[];
        favorite_artists: (string | { id: string; name: string; image: string | null })[];
    };
    similarity_score: number;
    taste_match: string;
}

export interface SocialFeedResponse {
    feed_items: FeedItem[];
    total_count: number;
    page: number;
    page_size: number;
    has_next: boolean;
    has_previous: boolean;
}

export interface DiscoveryUser {
    user: {
        id: number;
        username: string;
        favorite_genres: string[];
        favorite_artists: (string | { id: string; name: string; image: string | null })[];
    };
    similarity_score: number;
    taste_match: string;
    recent_songs: {
        title: string;
        artist: string;
        album: string;
        album_art_url: string | null;
        date: string;
        rating: number;
    }[];
    total_songs: number;
}

export interface SimilarUser {
    id: number;
    username: string;
    favorite_genres: string[];
    favorite_artists: (string | { id: string; name: string; image: string | null })[];
    similarity_score: number;
    taste_match: string;
}

export const socialApi = {
    getSocialFeed: async (page: number = 1, pageSize: number = 20): Promise<SocialFeedResponse> => {
        const response = await socialClient.get('/song-logs/social_feed/', {
            params: { page, page_size: pageSize }
        });
        return response.data;
    },

    getUserDiscovery: async (limit: number = 10): Promise<DiscoveryUser[]> => {
        const response = await socialClient.get('/song-logs/user_discovery/', {
            params: { limit }
        });
        return response.data;
    },

    getSimilarUsers: async (limit: number = 10): Promise<SimilarUser[]> => {
        const response = await socialClient.get('/song-logs/similar_users/', {
            params: { limit }
        });
        return response.data;
    }
}; 