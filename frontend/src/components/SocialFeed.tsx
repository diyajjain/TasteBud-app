import React, { useState, useEffect } from 'react';
import { socialApi, type FeedItem } from '../api/social';
import { format } from 'date-fns';

interface SocialFeedProps {
    className?: string;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({ className = '' }) => {
    const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    const fetchFeed = async (pageNum: number = 1) => {
        setLoading(true);
        setError(null);
        try {
            const response = await socialApi.getSocialFeed(pageNum, 20);
            setFeedItems(response.feed_items);
            setPage(response.page);
            setHasNext(response.has_next);
            setHasPrevious(response.has_previous);
            setTotalCount(response.total_count);
        } catch (err: any) {
            setError('Failed to load social feed. Please try again.');
            console.error('Error fetching social feed:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeed();
    }, []);

    const handleNextPage = () => {
        if (hasNext) {
            fetchFeed(page + 1);
        }
    };

    const handlePreviousPage = () => {
        if (hasPrevious) {
            fetchFeed(page - 1);
        }
    };

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

    if (loading && feedItems.length === 0) {
        return (
            <div className={`flex items-center justify-center p-8 ${className}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading social feed...</p>
                </div>
            </div>
        );
    }

    if (error && feedItems.length === 0) {
        return (
            <div className={`text-center p-8 ${className}`}>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    onClick={() => fetchFeed()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (feedItems.length === 0) {
        return (
            <div className={`text-center p-8 ${className}`}>
                <p className="text-gray-600 mb-4">No song logs from other users yet.</p>
                <p className="text-sm text-gray-500">Start by logging some songs and updating your music preferences!</p>
            </div>
        );
    }

    return (
        <div className={className}>
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Music Feed</h2>
                <p className="text-gray-600">
                    Discover what people with similar taste are listening to
                </p>
                {totalCount > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                        {totalCount} song logs from users with similar taste
                    </p>
                )}
            </div>

            {/* Feed Items */}
            <div className="space-y-6">
                {feedItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg shadow p-6">
                        {/* User Info */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">
                                        {item.user.username.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        {item.user.username}
                                    </h3>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTasteMatchColor(item.taste_match)}`}>
                                            {item.taste_match}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {Math.round(item.similarity_score * 100)}% match
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">
                                    {format(new Date(item.created_at), 'MMM d, yyyy')}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {format(new Date(item.created_at), 'h:mm a')}
                                </p>
                            </div>
                        </div>

                        {/* Song Info */}
                        <div className="flex items-start space-x-4">
                            {item.album_art_url && (
                                <img
                                    src={item.album_art_url}
                                    alt={`${item.album} cover`}
                                    className="w-16 h-16 rounded-lg"
                                />
                            )}
                            <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-900">
                                    {item.song_title}
                                </h4>
                                <p className="text-gray-600">{item.artist}</p>
                                <p className="text-sm text-gray-500">{item.album}</p>
                                
                                {item.note && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-700 italic">"{item.note}"</p>
                                    </div>
                                )}

                                {/* User's Music Preferences */}
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {item.user.favorite_genres.slice(0, 3).map((genre) => (
                                        <span
                                            key={genre}
                                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                        >
                                            {genre}
                                        </span>
                                    ))}
                                    {item.user.favorite_artists.slice(0, 2).map((artist) => (
                                        <span
                                            key={artist}
                                            className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                                        >
                                            {artist}
                                        </span>
                                    ))}
                                </div>

                                {/* ELO Rating */}
                                <div className="mt-3 flex items-center space-x-2">
                                    <span className="text-sm text-gray-500">Rating:</span>
                                    <span className="text-lg font-semibold text-gray-900">
                                        {Math.round(item.elo_rating)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {(hasNext || hasPrevious) && (
                <div className="mt-8 flex justify-center space-x-4">
                    <button
                        onClick={handlePreviousPage}
                        disabled={!hasPrevious || loading}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-gray-600">
                        Page {page}
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={!hasNext || loading}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {loading && feedItems.length > 0 && (
                <div className="mt-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            )}
        </div>
    );
}; 