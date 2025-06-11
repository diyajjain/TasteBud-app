export interface SpotifySong {
    spotify_id: string;
    title: string;
    artist: string;
    album: string;
    album_art: string | null;
    preview_url: string | null;
    duration_ms: number;
    popularity: number;
}

export interface CreateSongLogData {
    spotify_id: string;
    date: string;
    note?: string;
} 