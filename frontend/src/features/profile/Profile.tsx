import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { ArtistAutocomplete } from './ArtistAutocomplete'
import type { ArtistOption } from './ArtistAutocomplete'

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
  const [favoriteArtists, setFavoriteArtists] = useState<ArtistOption[]>([])
  const [moodPreferences, setMoodPreferences] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (user) {
      setFavoriteGenres(user.favorite_genres)
      // Always map to ArtistOption objects
      if (user.favorite_artists) {
        setFavoriteArtists(
          user.favorite_artists.map((a: any) =>
            typeof a === 'object'
              ? { id: a.id || '', name: a.name, image: a.image || null }
              : { id: '', name: a, image: null }
          )
        )
      } else {
        setFavoriteArtists([])
      }
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

  const handleAddArtist = (artist: ArtistOption) => {
    if (!favoriteArtists.some(a => a.id === artist.id)) {
      setFavoriteArtists(prev => [...prev, artist])
    }
  }

  const handleRemoveArtist = (artistId: string) => {
    setFavoriteArtists(prev => prev.filter(a => a.id !== artistId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSuccessMessage('')
    try {
      // If your backend expects string[] for favorite_artists, convert here:
      await updatePreferences({
        favorite_genres: favoriteGenres,
        favorite_artists: favoriteArtists.map(a => a.name),
        mood_preferences: moodPreferences
      })
      // If your backend now supports objects, send as-is:
      // await updatePreferences({
      //   favorite_genres: favoriteGenres,
      //   favorite_artists: favoriteArtists,
      //   mood_preferences: moodPreferences
      // })
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
    <div>
      <div className="flex items-center mb-8 p-4 bg-blue-50 rounded-lg shadow">
        <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
          <span className="text-white font-bold text-2xl">
            {user.username.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Welcome, <span className="text-blue-700">{user.username}</span>!</h1>
          <p className="text-gray-500">This is your music profile.</p>
        </div>
      </div>
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
          <ArtistAutocomplete onSelect={handleAddArtist} />
          <div className="flex flex-wrap gap-2 mt-4">
            {favoriteArtists.filter(Boolean).map(artist => (
              <span
                key={artist.id || artist.name}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100"
              >
                {artist.image && (
                  <img src={artist.image} alt={artist.name} className="w-5 h-5 rounded-full mr-2" />
                )}
                {artist.name}
                <button
                  type="button"
                  onClick={() => handleRemoveArtist(artist.id)}
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