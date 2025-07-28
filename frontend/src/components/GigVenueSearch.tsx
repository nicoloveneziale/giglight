'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Input from '@/components/Input';
import api from '@/lib/api';
import debounce from 'lodash.debounce';

interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  postcode: string;
  latitude: number | null;
  longitude: number | null;
  website_url: string | null;
}

interface GigVenueSearchProps {
  onVenueSelected: (venueId: string) => void;
  selectedVenueId: string | null;
}

const GigVenueSearch: React.FC<GigVenueSearchProps> = ({ onVenueSelected, selectedVenueId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Venue[]>([]);
  const [searching, setSearching] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setSearchResults([]);
        setSearching(false);
        return;
      }
      setSearching(true);
      try {
        const response = await api.get<Venue[]>(`/venues/search?q=${encodeURIComponent(query)}`);
        setSearchResults(response.data);
      } catch (err) {
        console.error('Venue search error:', err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, debouncedSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onVenueSelected(''); 
  };

  return (
    <div className="p-4 border border-gray-200 rounded-md bg-white shadow-sm">
      <h4 className="text-lg font-semibold mb-3 text-gray-700">Search Existing Venue</h4>
      <Input
        label="Venue Search"
        id="venueSearch"
        type="text"
        placeholder="Venue Name, Address, City, or Postcode"
        value={searchQuery}
        onChange={handleSearchChange}
      />
      {searching && <p className="text-sm text-gray-600 mt-2">Searching...</p>}
      {searchResults.length > 0 && (
        <div className="mt-2 border rounded-md max-h-48 overflow-y-auto bg-white shadow-sm">
          {searchResults.map((venue) => (
            <div
              key={venue.id}
              className={`p-3 cursor-pointer hover:bg-blue-50 transition-colors duration-150 ${selectedVenueId === venue.id ? 'bg-blue-100 font-medium' : ''}`}
              onClick={() => {
                onVenueSelected(venue.id);
                setSearchQuery(venue.name); 
                setSearchResults([]);
              }}
            >
              <p className="text-gray-800 font-semibold">{venue.name}</p>
              <p className="text-gray-600 text-sm">{venue.address}, {venue.city}, {venue.postcode}</p>
            </div>
          ))}
        </div>
      )}
      {searchQuery.length >= 3 && !searching && searchResults.length === 0 && (
          <p className="text-sm text-gray-600 mt-2">No venues found matching your search.</p>
      )}
    </div>
  );
};

export default GigVenueSearch;