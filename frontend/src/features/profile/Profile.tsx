import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

const GENRES = [
  'Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical', 'Electronic',
  'R&B', 'Country', 'Blues', 'Metal', 'Folk', 'Indie'
]

const MOODS = [
  'Happy', 'Sad', 'Energetic', 'Relaxed', 'Focused',
  'Romantic', 'Nostalgic', 'Motivated', 'Chill', 'Party'
]

export function Profile() {
  const { user, updatePreferences, error } = useAuth()
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([])
  const [favoriteArtists, setFavoriteArtists] = useState<string[]>([])
  const [moodPreferences, setMoodPreferences] = useState<string[]>([])
  const [newArtist, setNewArtist] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (user) {
      setFavoriteGenres(user.favorite_genres)
      setFavoriteArtists(user.favorite_artists)
      setMoodPreferences(user.mood_preferences)
    }
  }, [user])

  const handleGenreToggle = (genre: string) => {
    setFavoriteGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  const handleMoodToggle = (mood: string) => {
    setMoodPreferences(prev =>
      prev.includes(mood)
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    )
  }

  const handleAddArtist = (e: React.FormEvent) => {
    e.preventDefault()
    if (newArtist.trim() && !favoriteArtists.includes(newArtist.trim())) {
      setFavoriteArtists(prev => [...prev, newArtist.trim()])
      setNewArtist('')
    }
  }

  const handleRemoveArtist = (artist: string) => {
    setFavoriteArtists(prev => prev.filter(a => a !== artist))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSuccessMessage('')
    
    try {
      await updatePreferences({
        favorite_genres: favoriteGenres,
        favorite_artists: favoriteArtists,
        mood_preferences: moodPreferences
      })
      setSuccessMessage('Preferences updated successfully!')
    } catch (err) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return <div>Please log in to view your profile.</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Favorite Genres */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Favorite Genres</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {GENRES.map(genre => (
              <label key={genre} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={favoriteGenres.includes(genre)}
                  onChange={() => handleGenreToggle(genre)}
                  className="rounded text-primary-600"
                />
                <span>{genre}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Favorite Artists */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Favorite Artists</h2>
          <form onSubmit={handleAddArtist} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newArtist}
              onChange={(e) => setNewArtist(e.target.value)}
              placeholder="Add an artist"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Add
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            {favoriteArtists.map(artist => (
              <span
                key={artist}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100"
              >
                {artist}
                <button
                  type="button"
                  onClick={() => handleRemoveArtist(artist)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Mood Preferences */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Mood Preferences</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {MOODS.map(mood => (
              <label key={mood} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={moodPreferences.includes(mood)}
                  onChange={() => handleMoodToggle(mood)}
                  className="rounded text-primary-600"
                />
                <span>{mood}</span>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="text-red-600">{error}</div>
        )}

        {successMessage && (
          <div className="text-green-600">{successMessage}</div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </button>
      </form>
    </div>
  )
} 