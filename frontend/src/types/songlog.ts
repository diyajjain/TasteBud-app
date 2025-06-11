// This is a trivial change to trigger TypeScript re-evaluation
export interface SongLog {
    id: number;
    user: number; // Assuming user ID
    song_title: string;
    artist: string;
    album: string;
    note: string;
    date: string; // YYYY-MM-DD format
    created_at: string; // ISO string format
    elo_rating: number;
    spotify_id: string | null;
    album_art_url: string | null;
    preview_url: string | null;
    duration_ms: number | null;
    popularity: number | null;
} 