import React, { useState, useCallback, useEffect } from 'react';
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
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [note, setNote] = useState('');
    const [canLogSongs, setCanLogSongs] = useState<boolean | null>(null);
    const [checkingPermissions, setCheckingPermissions] = useState(true);
    const [selectedSong, setSelectedSong] = useState<SpotifySong | null>(null);

    // Check if user can log songs
    const checkCanLogSongs = useCallback(async () => {
        try {
            setCheckingPermissions(true);
            const response = await spotifyApi.checkCanLogToday();
            setCanLogSongs(response.can_log);
            if (!response.can_log && response.message) {
                setError(response.message);
            }
        } catch (err) {
            console.error('Error checking permissions:', err);
            setCanLogSongs(false);
        } finally {
            setCheckingPermissions(false);
        }
    }, []);

    useEffect(() => {
        checkCanLogSongs();
    }, [checkCanLogSongs]);

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

    const handleSongSelect = (song: SpotifySong) => {
        setSelectedSong(song);
        setError(null);
        setSuccess(null);
        // Reset note and date for the new song
        setNote('');
        setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
    };

    const handleLogSong = async () => {
        if (!selectedSong) return;

        try {
            setError(null);
            setSuccess(null);
            await spotifyApi.createSongLog({
                spotify_id: selectedSong.spotify_id,
                date: selectedDate,
                note: note.trim() || undefined
            });
            onSongSelect(selectedSong);
            // Show success message
            setSuccess(`Successfully logged "${selectedSong.title}" by ${selectedSong.artist}!`);
            // Reset form
            setSearchQuery('');
            setSearchResults([]);
            setSelectedSong(null);
            setNote('');
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            // Display the specific error message from the backend
            const errorMessage = err.message || 'Failed to create song log. Please try again.';
            setError(errorMessage);
            console.error('Create song log error:', err);
        }
    };

    const handleCancelSelection = () => {
        setSelectedSong(null);
        setNote('');
        setError(null);
        setSuccess(null);
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {checkingPermissions && (
                <div className="text-gray-500 text-sm">Checking your permissions...</div>
            )}

            {!checkingPermissions && canLogSongs === false && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                                Setup Required
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>You need to set your music preferences before logging songs.</p>
                                <p className="mt-2">
                                    <a href="/profile" className="font-medium underline hover:no-underline">
                                        Go to your profile to set music preferences →
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!checkingPermissions && canLogSongs && (
                <>
                    <div className="flex flex-col space-y-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search for a song..."
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        Unable to log song
                                    </h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{error}</p>
                                        {error.includes('music preferences') && (
                                            <p className="mt-2">
                                                <a href="/profile" className="font-medium underline hover:no-underline">
                                                    Go to your profile to set music preferences →
                                                </a>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-green-800">
                                        Success!
                                    </h3>
                                    <div className="mt-2 text-sm text-green-700">
                                        <p>{success}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
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

                    {selectedSong && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Selected Song: {selectedSong.title} by {selectedSong.artist}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Album: {selectedSong.album}
                                </p>
                            </div>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Note (optional)
                                    </label>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="How did this song make you feel? Any thoughts?"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows={3}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={handleCancelSelection}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLogSong}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Log Song
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}; 