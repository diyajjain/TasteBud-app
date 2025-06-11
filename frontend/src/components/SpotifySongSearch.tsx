import React, { useState, useCallback } from 'react';
import { useDebounce } from '../hooks';
import { spotifyApi } from '../api/spotify';
import type { SpotifySong } from '../types/spotify';
import { format } from 'date-fns';

interface SpotifySongSearchProps {
    onSongSelect: (song: SpotifySong) => void;
    className?: string;
}

export const SpotifySongSearch: React.FC<SpotifySongSearchProps> = ({ onSongSelect, className = '' }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SpotifySong[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [note, setNote] = useState('');

    const debouncedSearch = useDebounce(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const results = await spotifyApi.searchSongs(query);
            setSearchResults(results);
        } catch (err) {
            setError('Failed to search songs. Please try again.');
            console.error('Search error:', err);
        } finally {
            setIsLoading(false);
        }
    }, 500);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        debouncedSearch(query);
    }, [debouncedSearch]);

    const handleSongSelect = async (song: SpotifySong) => {
        try {
            await spotifyApi.createSongLog({
                spotify_id: song.spotify_id,
                date: selectedDate,
                note: note.trim() || undefined
            });
            onSongSelect(song);
            // Reset form
            setSearchQuery('');
            setSearchResults([]);
            setNote('');
        } catch (err) {
            setError('Failed to create song log. Please try again.');
            console.error('Create song log error:', err);
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex flex-col space-y-2">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search for a song..."
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note (optional)"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                />
            </div>

            {error && (
                <div className="text-red-500 text-sm">{error}</div>
            )}

            {isLoading && (
                <div className="text-gray-500 text-sm">Searching...</div>
            )}

            {searchResults.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {searchResults.map((song) => (
                        <div
                            key={song.spotify_id}
                            className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleSongSelect(song)}
                        >
                            {song.album_art && (
                                <img
                                    src={song.album_art}
                                    alt={`${song.album} cover`}
                                    className="w-12 h-12 rounded"
                                />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {song.title}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                    {song.artist} • {song.album}
                                </p>
                            </div>
                            {song.preview_url && (
                                <audio
                                    controls
                                    className="h-8"
                                    src={song.preview_url}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Your browser does not support the audio element.
                                </audio>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}; 