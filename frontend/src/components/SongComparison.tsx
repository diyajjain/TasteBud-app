import React, { useState, useEffect } from 'react';
import { ratingsApi, type ComparisonPair } from '../api/ratings';

interface SongComparisonProps {
    onRatingComplete?: () => void;
    className?: string;
}

export const SongComparison: React.FC<SongComparisonProps> = ({ 
    onRatingComplete, 
    className = '' 
}) => {
    const [comparisonPair, setComparisonPair] = useState<ComparisonPair | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedWinner, setSelectedWinner] = useState<number | null>(null);

    const fetchComparisonPair = async () => {
        setLoading(true);
        setError(null);
        try {
            const pair = await ratingsApi.getComparisonPair();
            setComparisonPair(pair);
            setSelectedWinner(null);
        } catch (err: any) {
            if (err.response?.status === 404) {
                setError('No songs available for comparison. Add more songs to start rating!');
            } else {
                setError('Failed to load comparison pair. Please try again.');
            }
            console.error('Error fetching comparison pair:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComparisonPair();
    }, []);

    const handleSongSelect = (songId: number) => {
        setSelectedWinner(songId);
    };

    const handleSubmit = async () => {
        if (!comparisonPair || !selectedWinner) return;

        setSubmitting(true);
        try {
            await ratingsApi.createRating({
                song_log_id: comparisonPair.song1.id,
                compared_song_log_id: comparisonPair.song2.id,
                winner_song_log_id: selectedWinner
            });

            // Fetch next comparison pair
            await fetchComparisonPair();
            onRatingComplete?.();
        } catch (err: any) {
            setError('Failed to submit rating. Please try again.');
            console.error('Error submitting rating:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSkip = async () => {
        await fetchComparisonPair();
    };

    if (loading) {
        return (
            <div className={`flex items-center justify-center p-8 ${className}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading songs for comparison...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`text-center p-8 ${className}`}>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    onClick={fetchComparisonPair}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!comparisonPair) {
        return (
            <div className={`text-center p-8 ${className}`}>
                <p className="text-gray-600">No songs available for comparison.</p>
            </div>
        );
    }

    return (
        <div className={`max-w-4xl mx-auto ${className}`}>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Which song do you prefer?</h2>
                <p className="text-gray-600">Click on your favorite song to rate it higher</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Song 1 */}
                <div
                    className={`relative p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedWinner === comparisonPair.song1.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSongSelect(comparisonPair.song1.id)}
                >
                    {selectedWinner === comparisonPair.song1.id && (
                        <div className="absolute top-2 right-2">
                            <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                                ✓
                            </div>
                        </div>
                    )}
                    
                    <div className="flex items-center space-x-4">
                        {comparisonPair.song1.album_art_url && (
                            <img
                                src={comparisonPair.song1.album_art_url}
                                alt={`${comparisonPair.song1.album} cover`}
                                className="w-16 h-16 rounded-lg"
                            />
                        )}
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900">
                                {comparisonPair.song1.title}
                            </h3>
                            <p className="text-gray-600">{comparisonPair.song1.artist}</p>
                            <p className="text-sm text-gray-500">{comparisonPair.song1.album}</p>
                            <p className="text-xs text-gray-400">Logged on: {comparisonPair.song1.date}</p>
                        </div>
                    </div>
                    
                    <div className="mt-4 text-center">
                        <span className="text-sm text-gray-500">Current Rating:</span>
                        <div className="text-lg font-semibold text-gray-900">
                            {Math.round(comparisonPair.song1.elo_rating)}
                        </div>
                    </div>
                </div>

                {/* Song 2 */}
                <div
                    className={`relative p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedWinner === comparisonPair.song2.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSongSelect(comparisonPair.song2.id)}
                >
                    {selectedWinner === comparisonPair.song2.id && (
                        <div className="absolute top-2 right-2">
                            <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                                ✓
                            </div>
                        </div>
                    )}
                    
                    <div className="flex items-center space-x-4">
                        {comparisonPair.song2.album_art_url && (
                            <img
                                src={comparisonPair.song2.album_art_url}
                                alt={`${comparisonPair.song2.album} cover`}
                                className="w-16 h-16 rounded-lg"
                            />
                        )}
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900">
                                {comparisonPair.song2.title}
                            </h3>
                            <p className="text-gray-600">{comparisonPair.song2.artist}</p>
                            <p className="text-sm text-gray-500">{comparisonPair.song2.album}</p>
                            <p className="text-xs text-gray-400">Logged on: {comparisonPair.song2.date}</p>
                        </div>
                    </div>
                    
                    <div className="mt-4 text-center">
                        <span className="text-sm text-gray-500">Current Rating:</span>
                        <div className="text-lg font-semibold text-gray-900">
                            {Math.round(comparisonPair.song2.elo_rating)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center space-x-4">
                <button
                    onClick={handleSkip}
                    disabled={submitting}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                    Skip
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!selectedWinner || submitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? 'Submitting...' : 'Submit Rating'}
                </button>
            </div>
        </div>
    );
}; 