import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { spotifyApi } from '../../api/spotify';

interface HomeStatus {
  user: {
    username: string;
    has_preferences: boolean;
    preferences_count: {
      genres: number;
      artists: number;
      moods: number;
    };
  };
  today_status: {
    can_log: boolean;
    missing_preferences: boolean;
  };
  recent_activity: {
    total_logs: number;
    recent_logs: any[];
  };
  guidance: {
    type: string;
    title: string;
    message: string;
    action_required: boolean;
    action_text: string | null;
    action_url: string | null;
  };
}

export function HomePage() {
  const [homeStatus, setHomeStatus] = useState<HomeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomeStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await spotifyApi.getHomeStatus();
        setHomeStatus(response);
      } catch (err: any) {
        console.error('Failed to fetch home status:', err);
        setError('Failed to load your status. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeStatus();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your music journey...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!homeStatus) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {homeStatus.recent_activity.total_logs > 0 ? `Welcome back, ${homeStatus.user.username}! 🎵` : `Welcome to TasteBud, ${homeStatus.user.username}! 🎵`}
        </h1>
        <p className="mt-2 text-gray-600">
          {homeStatus.guidance.message}
        </p>
      </div>

      {/* Guidance Card */}
      <div className={`rounded-lg p-6 ${
        homeStatus.guidance.type === 'setup_preferences' 
          ? 'bg-yellow-50 border border-yellow-200' 
          : 'bg-blue-50 border border-blue-200'
      }`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {homeStatus.guidance.type === 'setup_preferences' ? (
              <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            ) : (
              <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              {homeStatus.guidance.title}
            </h3>
            <p className="mt-2 text-gray-700">
              {homeStatus.guidance.message}
            </p>
            {homeStatus.guidance.action_required && homeStatus.guidance.action_text && (
              <div className="mt-4">
                <Link
                  to={homeStatus.guidance.action_url || '#'}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {homeStatus.guidance.action_text}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{homeStatus.recent_activity.total_logs}</div>
            <div className="text-sm text-gray-600">Songs Logged</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{homeStatus.user.preferences_count.genres}</div>
            <div className="text-sm text-gray-600">Genres</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{homeStatus.user.preferences_count.artists}</div>
            <div className="text-sm text-gray-600">Artists</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {homeStatus.recent_activity.recent_logs.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Songs</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {homeStatus.recent_activity.recent_logs.slice(0, 3).map((log: any) => (
                <div key={log.id} className="flex items-center space-x-3">
                  {log.album_art_url && (
                    <img src={log.album_art_url} alt="Album art" className="w-10 h-10 rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {log.song_title}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {log.artist} • {log.album}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(log.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
            {homeStatus.recent_activity.recent_logs.length > 3 && (
              <div className="mt-4 text-center">
                <Link
                  to="/log-song"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  View all {homeStatus.recent_activity.total_logs} songs →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/log-song"
          className="bg-blue-600 text-white p-4 rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          <div className="text-center">
            <div className="text-xl font-semibold">Log a Song</div>
            <div className="text-blue-100 text-sm mt-1">Share what you're listening to</div>
          </div>
        </Link>
        <Link
          to="/social"
          className="bg-green-600 text-white p-4 rounded-lg shadow hover:bg-green-700 transition-colors"
        >
          <div className="text-center">
            <div className="text-xl font-semibold">Discover Music</div>
            <div className="text-green-100 text-sm mt-1">See what others are listening to</div>
          </div>
        </Link>
      </div>
    </div>
  );
} 