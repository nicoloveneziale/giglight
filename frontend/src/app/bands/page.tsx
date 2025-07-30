'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import BandCard from '@/components/BandCard';
import debounce from 'lodash.debounce';
import { useRouter, useSearchParams } from 'next/navigation';

interface Band {
  id: string;
  name: string;
  genre: string | null;
  location: string | null;
  profile_picture_url: string | null;
}

export default function BandsPage() {
    const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get('q') || '';
  const [bands, setBands] = useState<Band[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const debouncedFetchBands = useCallback(
    debounce(async (query: string) => {
      setLoading(true);
      setError('');
      try {
        let response;
        if (query.trim() === '') {
          response = await api.get<Band[]>('/bands');
        } else {
          response = await api.get<Band[]>(`/bands/search?q=${encodeURIComponent(query)}`);
        }
        setBands(response.data);
      } catch (err: any) {
        console.error('Error fetching bands:', err);
        setError(err.response?.data?.message || 'Failed to load bands. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedFetchBands(currentQuery);

    return () => {
      debouncedFetchBands.cancel();
    };
  }, [currentQuery, debouncedFetchBands]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    const params = new URLSearchParams(searchParams);

    if (newQuery) {
      params.set('q', newQuery);
    } else {
      params.delete('q'); 
    }

    router.push(`/bands?${params.toString()}`);
  };

  if (error) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center text-lg text-red-500">
        <p>{error}</p>
        <p className="text-sm text-gray-600 mt-2">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 py-8 mt-16">
      <h1 className="text-4xl font-bold text-gray-200 mb-6 text-center">Discover Bands</h1>

      <div className="mb-8 flex flex-col">
        <label htmlFor="search" className='text-gray-200 mb-2'>
            Search For Bands
        </label>
        <input
          type="text"
          id='search'
          placeholder='Search by name, genre, location...'
          value={searchParams.get('q') || ''}
          onChange={handleSearchChange}
          className='py-2 px-4 rounded-lg bg-gray-100 text-gray-800 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
      </div>

      {loading ? (
        <div className="min-h-[200px] flex items-center justify-center text-lg text-gray-400">
          Loading bands...
        </div>
      ) : bands.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">No bands found matching your search. Try a different query!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {bands.map((band) => (
            <BandCard key={band.id} {...band} />
          ))}
        </div>
      )}
    </div>
  );
}