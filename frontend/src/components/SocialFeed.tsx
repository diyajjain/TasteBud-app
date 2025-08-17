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
    const [renderError, setRenderError] = useState<string | null>(null);

    const fetchFeed = async (pageNum: number = 1) => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching social feed, page:', pageNum);
            const response = await socialApi.getSocialFeed(pageNum, 20);
            console.log('Social feed response:', response);
            setFeedItems(response.feed_items);
            setPage(response.page);
            setHasNext(response.has_next);
            setHasPrevious(response.has_previous);
            setTotalCount(response.total_count);
        } catch (err: any) {
            console.error('Error fetching social feed:', err);
            console.error('Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            
            let errorMessage = 'Failed to load social feed. Please try again.';
            if (err.response?.status === 401) {
                errorMessage = 'Please log in again to view the social feed.';
            } else if (err.response?.status === 403) {
                errorMessage = 'You do not have permission to view the social feed.';
            } else if (err.response?.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            } else if (err.message === 'Network Error') {
                errorMessage = 'Network error. Please check your connection and try again.';
            }
            
            setError(errorMessage);
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

    // Catch any rendering errors
    try {
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
                    <div className="max-w-md mx-auto">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No music feed yet</h3>
                        <p className="text-gray-600 mb-4">
                            {totalCount === 0 
                                ? "There are no song logs from other users yet. Be the first to share your music!"
                                : "No song logs from users with similar taste yet."
                            }
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-blue-900 mb-2">To see the social feed:</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Log some songs to build your music profile</li>
                                <li>• Update your music preferences in your Profile</li>
                                <li>• Wait for other users to join and share their music</li>
                            </ul>
                        </div>
                    </div>
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
                                                key={typeof artist === 'object' ? artist.id || artist.name : artist}
                                                className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                                            >
                                                {typeof artist === 'object' ? artist.name : artist}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Rating */}
                                    <div className="mt-3 flex items-center space-x-2">
                                        <span className="text-sm text-gray-500">Rating:</span>
                                        <div className="flex items-center space-x-1">
                                            <span className="text-lg font-bold text-blue-600">
                                                {item.rating}
                                            </span>
                                            <span className="text-sm text-gray-500">/10</span>
                                        </div>
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
    } catch (err: any) {
        console.error('SocialFeed render error:', err);
        setRenderError(err.message);
        
        return (
            <div className={`text-center p-8 ${className}`}>
                <div className="max-w-md mx-auto">
                    <div className="text-red-400 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
                    <p className="text-gray-600 mb-4">
                        There was an error rendering the social feed.
                    </p>
                    {renderError && (
                        <p className="text-sm text-red-600 mb-4">
                            Error: {renderError}
                        </p>
                    )}
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        );
    }
}; 