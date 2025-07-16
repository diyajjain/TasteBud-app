import { useState, useEffect, useCallback } from 'react';
import { SpotifySongSearch } from '../../components/SpotifySongSearch';
import type { SpotifySong } from '../../types/spotify';
import type { SongLog } from '../../types/songlog';
import { spotifyApi } from '../../api/spotify';

export function SongLogPage() {
    const [songLogs, setSongLogs] = useState<SongLog[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [errorLogs, setErrorLogs] = useState<string | null>(null);

    const fetchSongLogs = useCallback(async () => {
        setLoadingLogs(true);
        setErrorLogs(null);
        try {
            const logs = await spotifyApi.getSongLogs();
            setSongLogs(logs);
        } catch (err) {
            console.error("Failed to fetch song logs:", err);
            setErrorLogs("Failed to load your song logs. Please try again.");
        } finally {
            setLoadingLogs(false);
        }
    }, []);

    useEffect(() => {
        fetchSongLogs();
    }, [fetchSongLogs]);

    const handleSongSelect = (song: SpotifySong) => {
        // You can add a toast notification here if you have a notification system
        console.log('Song logged successfully:', song);
        // Refresh the list of logs after a new one is added
        fetchSongLogs();
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Log a Song</h1>
            <div className="mb-8">
                <SpotifySongSearch onSongSelect={handleSongSelect} />
            </div>
            <h2 className="text-2xl font-bold mb-4">Your Logged Songs</h2>
            {loadingLogs && <p className="text-gray-500">Loading your song logs...</p>}
            {errorLogs && <p className="text-red-500">{errorLogs}</p>}
            {!loadingLogs && songLogs.length === 0 && !errorLogs && (
                <p className="text-gray-600">No songs logged yet. Start by searching above!</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {songLogs.map((log) => (
                    <div key={log.id} className="bg-white p-4 shadow rounded-lg flex items-center space-x-4">
                        {log.album_art_url && (
                            <img src={log.album_art_url} alt={`${log.album} cover`} className="w-16 h-16 rounded" />
                        )}
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg">{log.song_title}</h3>
                            <p className="text-sm text-gray-600">{log.artist} • {log.album}</p>
                            <p className="text-xs text-gray-500">Logged on: {log.date}</p>
                            {log.note && <p className="text-sm italic mt-1">Note: {log.note}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 