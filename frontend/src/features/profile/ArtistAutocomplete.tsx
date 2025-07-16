import React, { useState, useRef } from 'react';
import { spotifyApi } from '../../api/spotify';

export interface ArtistOption {
    id: string;
    name: string;
    image: string | null;
}

interface ArtistAutocompleteProps {
    onSelect: (artist: ArtistOption) => void;
    placeholder?: string;
    className?: string;
}

export const ArtistAutocomplete: React.FC<ArtistAutocompleteProps> = ({ onSelect, placeholder = 'Add an artist', className = '' }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ArtistOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    let debounceTimeout: NodeJS.Timeout;

    const handleSearch = async (q: string) => {
        if (!q.trim()) {
            setResults([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const artists = await spotifyApi.searchSpotifyArtists(q);
            setResults(artists);
        } catch (err) {
            setError('Failed to search artists.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        setShowDropdown(true);
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            handleSearch(value);
        }, 300);
    };

    const handleSelect = (artist: ArtistOption) => {
        setQuery('');
        setResults([]);
        setShowDropdown(false);
        onSelect(artist);
        if (inputRef.current) inputRef.current.blur();
    };

    return (
        <div className={`relative ${className}`}>
            <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleChange}
                onFocus={() => setShowDropdown(true)}
                placeholder={placeholder}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoComplete="off"
            />
            {showDropdown && (results.length > 0 || loading || error) && (
                <div className="absolute z-10 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow mt-1 max-h-60 overflow-y-auto">
                    {loading && <div className="p-3 text-gray-500 text-sm">Searching...</div>}
                    {error && <div className="p-3 text-red-500 text-sm">{error}</div>}
                    {!loading && !error && results.length === 0 && query.trim() && (
                        <div className="p-3 text-gray-500 text-sm">No artists found.</div>
                    )}
                    {results.map((artist) => (
                        <div
                            key={artist.id}
                            className="flex items-center space-x-3 p-3 hover:bg-blue-50 cursor-pointer"
                            onClick={() => handleSelect(artist)}
                        >
                            {artist.image && (
                                <img src={artist.image} alt={artist.name} className="w-8 h-8 rounded-full" />
                            )}
                            <span className="font-medium text-gray-900">{artist.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}; 