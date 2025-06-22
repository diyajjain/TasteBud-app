import React, { useState, useEffect } from 'react';
import { ratingsApi, type RatingStats } from '../api/ratings';
import type { SongLog } from '../types/songlog';

interface SongRankingsProps {
    className?: string;
}

export const SongRankings: React.FC<SongRankingsProps> = ({ className = '' }) => {
    const [rankings, setRankings] = useState<SongLog[]>([]);
    const [stats, setStats] = useState<RatingStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [rankingsData, statsData] = await Promise.all([
                ratingsApi.getRankings(),
                ratingsApi.getStats()
            ]);
            setRankings(rankingsData);
            setStats(statsData);
        } catch (err: any) {
            setError('Failed to load rankings. Please try again.');
            console.error('Error fetching rankings:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className={`flex items-center justify-center p-8 ${className}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading rankings...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`text-center p-8 ${className}`}>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className={className}>
            {/* Stats Section */}
            {stats && (
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Rating Stats</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{stats.total_songs}</div>
                            <div className="text-sm text-gray-600">Total Songs</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.total_ratings}</div>
                            <div className="text-sm text-gray-600">Comparisons</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{stats.avg_rating}</div>
                            <div className="text-sm text-gray-600">Avg Rating</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                                {stats.total_songs > 0 ? Math.round((stats.total_ratings / stats.total_songs) * 100) : 0}%
                            </div>
                            <div className="text-sm text-gray-600">Completion</div>
                        </div>
                    </div>
                    
                    {stats.highest_rated_song && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg">
                            <h4 className="font-semibold text-green-800 mb-2">🏆 Highest Rated</h4>
                            <p className="text-green-700">
                                {stats.highest_rated_song.title} by {stats.highest_rated_song.artist}
                                <span className="ml-2 font-semibold">({Math.round(stats.highest_rated_song.rating)})</span>
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Rankings Section */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Your Song Rankings</h3>
                    <p className="text-sm text-gray-600">Songs ranked by ELO rating</p>
                </div>
                
                {rankings.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-gray-600">No songs ranked yet. Start comparing your songs!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {rankings.map((song, index) => (
                            <div key={song.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-4">
                                    {/* Rank Badge */}
                                    <div className="flex-shrink-0">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                            index === 1 ? 'bg-gray-100 text-gray-800' :
                                            index === 2 ? 'bg-orange-100 text-orange-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {index + 1}
                                        </div>
                                    </div>
                                    
                                    {/* Album Art */}
                                    {song.album_art_url && (
                                        <img
                                            src={song.album_art_url}
                                            alt={`${song.album} cover`}
                                            className="w-12 h-12 rounded-lg"
                                        />
                                    )}
                                    
                                    {/* Song Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-lg font-semibold text-gray-900 truncate">
                                            {song.song_title}
                                        </h4>
                                        <p className="text-gray-600">{song.artist}</p>
                                        <p className="text-sm text-gray-500">{song.album}</p>
                                        <p className="text-xs text-gray-400">Logged on: {song.date}</p>
                                    </div>
                                    
                                    {/* Rating */}
                                    <div className="flex-shrink-0 text-right">
                                        <div className="text-2xl font-bold text-gray-900">
                                            {Math.round(song.elo_rating)}
                                        </div>
                                        <div className="text-sm text-gray-500">ELO Rating</div>
                                    </div>
                                </div>
                                
                                {song.note && (
                                    <div className="mt-3 pl-12">
                                        <p className="text-sm text-gray-600 italic">"{song.note}"</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}; 