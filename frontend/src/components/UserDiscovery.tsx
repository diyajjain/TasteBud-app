import React, { useState, useEffect } from 'react';
import { socialApi, type DiscoveryUser } from '../api/social';

interface UserDiscoveryProps {
    className?: string;
}

export const UserDiscovery: React.FC<UserDiscoveryProps> = ({ className = '' }) => {
    const [discoveryUsers, setDiscoveryUsers] = useState<DiscoveryUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDiscoveryUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const users = await socialApi.getUserDiscovery(10);
            setDiscoveryUsers(users);
        } catch (err: any) {
            setError('Failed to load user discovery. Please try again.');
            console.error('Error fetching discovery users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscoveryUsers();
    }, []);

    const getTasteMatchColor = (tasteMatch: string) => {
        switch (tasteMatch) {
            case 'Excellent Match':
                return 'bg-green-100 text-green-800';
            case 'Great Match':
                return 'bg-blue-100 text-blue-800';
            case 'Good Match':
                return 'bg-yellow-100 text-yellow-800';
            case 'Some Similarity':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className={`flex items-center justify-center p-8 ${className}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading user discovery...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`text-center p-8 ${className}`}>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    onClick={fetchDiscoveryUsers}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (discoveryUsers.length === 0) {
        return (
            <div className={`text-center p-8 ${className}`}>
                <p className="text-gray-600 mb-4">No users to discover yet.</p>
                <p className="text-sm text-gray-500">Update your music preferences to find people with similar taste!</p>
            </div>
        );
    }

    return (
        <div className={className}>
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Discover People</h2>
                <p className="text-gray-600">
                    Find users with similar music taste
                </p>
            </div>

            {/* Discovery Users */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {discoveryUsers.map((discoveryUser) => (
                    <div key={discoveryUser.user.id} className="bg-white rounded-lg shadow p-6">
                        {/* User Info */}
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-lg">
                                    {discoveryUser.user.username.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">
                                    {discoveryUser.user.username}
                                </h3>
                                <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTasteMatchColor(discoveryUser.taste_match)}`}>
                                        {discoveryUser.taste_match}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {Math.round(discoveryUser.similarity_score * 100)}% match
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Music Preferences */}
                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Favorite Genres</h4>
                            <div className="flex flex-wrap gap-1">
                                {discoveryUser.user.favorite_genres.slice(0, 3).map((genre) => (
                                    <span
                                        key={genre}
                                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                    >
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Favorite Artists</h4>
                            <div className="flex flex-wrap gap-1">
                                {discoveryUser.user.favorite_artists.slice(0, 3).map((artist) => (
                                    <span
                                        key={artist}
                                        className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                                    >
                                        {artist}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Recent Songs */}
                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Songs</h4>
                            <div className="space-y-2">
                                {discoveryUser.recent_songs.slice(0, 2).map((song, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        {song.album_art_url && (
                                            <img
                                                src={song.album_art_url}
                                                alt={`${song.album} cover`}
                                                className="w-8 h-8 rounded"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {song.title}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {song.artist}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                            <span className="text-sm text-gray-500">
                                {discoveryUser.total_songs} songs logged
                            </span>
                            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                View Profile
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}; 