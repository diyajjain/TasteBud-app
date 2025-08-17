import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { spotifyApi } from '../../api/spotify';

interface UserProfileData {
  user: {
    id: number;
    username: string;
    favorite_genres: string[];
    favorite_artists: Array<{ id: string; name: string; image: string | null }>;
    mood_preferences: string[];
  };
  recent_activity: {
    total_logs: number;
    recent_logs: Array<{
      id: number;
      song_title: string;
      artist: string;
      album: string;
      album_art_url: string | null;
      date: string;
      note: string;
      rating: number;  // Add 1-10 rating field
    }>;
  };
}

export function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await spotifyApi.getUserProfile(parseInt(userId));
        setProfileData(response);
      } catch (err: any) {
        console.error('Failed to fetch user profile:', err);
        setError('Failed to load user profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading profile...</p>
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

  if (!profileData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">User profile not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {profileData.user.username}'s Profile
          </h1>
          <p className="text-gray-600 mt-1">
            Music taste and recent activity
          </p>
        </div>
        <Link
          to="/social"
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          ← Back to Discovery
        </Link>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{profileData.recent_activity.total_logs}</div>
            <div className="text-sm text-gray-600">Songs Logged</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{profileData.user.favorite_genres.length}</div>
            <div className="text-sm text-gray-600">Genres</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{profileData.user.favorite_artists.length}</div>
            <div className="text-sm text-gray-600">Artists</div>
          </div>
        </div>
      </div>

      {/* Music Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Favorite Genres */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Favorite Genres</h3>
          <div className="flex flex-wrap gap-2">
            {profileData.user.favorite_genres.length > 0 ? (
              profileData.user.favorite_genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {genre}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No genres set yet</p>
            )}
          </div>
        </div>

        {/* Favorite Artists */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Favorite Artists</h3>
          <div className="space-y-2">
            {profileData.user.favorite_artists.length > 0 ? (
              profileData.user.favorite_artists.map((artist) => (
                <div key={artist.id || artist.name} className="flex items-center space-x-3">
                  {artist.image && (
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-gray-900">{artist.name}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No artists set yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Mood Preferences */}
      {profileData.user.mood_preferences.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Preferences</h3>
          <div className="flex flex-wrap gap-2">
            {profileData.user.mood_preferences.map((mood) => (
              <span
                key={mood}
                className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
              >
                {mood}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Songs */}
      {profileData.recent_activity.recent_logs.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Songs</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {profileData.recent_activity.recent_logs.map((log) => (
                <div key={log.id} className="flex items-center space-x-4">
                  {log.album_art_url && (
                    <img
                      src={log.album_art_url}
                      alt={`${log.album} cover`}
                      className="w-16 h-16 rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{log.song_title}</h4>
                    <p className="text-sm text-gray-600">{log.artist} • {log.album}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(log.date).toLocaleDateString()}
                    </p>
                    {log.note && (
                      <p className="text-sm text-gray-700 mt-1 italic">"{log.note}"</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-lg font-semibold text-blue-600">
                      {log.rating}
                    </span>
                    <span className="text-sm text-gray-400">/10</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State for Recent Songs */}
      {profileData.recent_activity.recent_logs.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No songs logged yet.</p>
        </div>
      )}
    </div>
  );
} 