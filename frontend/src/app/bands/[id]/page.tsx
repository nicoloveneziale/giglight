'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; 
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import api from '@/lib/api';
import { FaFacebook, FaInstagram, FaBandcamp, FaSpotify, FaYoutube, FaGlobe } from 'react-icons/fa'; 

interface BandProfileDetails {
  id: string;
  user_id: string;
  name: string;
  genre: string | null;
  bio: string | null;
  location: string | null;
  profile_picture_url: string | null;
  website_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  bandcamp_url: string | null;
  spotify_url: string | null;
  youtube_url: string | null;
}

export default function SingleBandPage() {
  const params = useParams();
  const bandId = params.id as string; 
  const [band, setBand] = useState<BandProfileDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const {user}= useAuth();

  useEffect(() => {
    const fetchBand = async () => {
      if (!bandId) {
        setError('Band ID is missing.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError('');
        const response = await api.get<BandProfileDetails>(`/bands/${bandId}`); 
        setBand(response.data);
      } catch (err: any) {
        console.error('Error fetching band:', err);
        setError(err.response?.data?.message || 'Failed to load band profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchBand();
  }, [bandId]); 

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center text-lg text-gray-700">
        Loading band profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center text-lg text-red-500">
        <p>{error}</p>
        <p className="text-sm text-gray-600 mt-2">Please check the URL or try again later.</p>
      </div>
    );
  }

  if (!band) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center text-lg text-gray-700">
        Band not found.
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-20 p-4 py-8">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden md:flex">
        <div className="md:w-1/3 p-4 flex flex-col items-center justify-center bg-gray-100 shadow">
          <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg mb-4">
            {band.profile_picture_url ? (
              <img
                src={band.profile_picture_url}
                alt={`${band.name} profile`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 text-4xl font-bold">
                {band.name ? band.name[0].toUpperCase() : 'B'}
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">{band.name}</h1>
          {band.genre && <p className="text-blue-600 text-lg mb-2">{band.genre}</p>}
          {band.location && <p className="text-gray-600 text-md">{band.location}</p>}
        </div>

        <div className="md:w-2/3 p-6">
        { (user && band.user_id === user.id) && (
            <div className="flex items-center justify-center">
                <Link href="/band-profile" className="flex items-center justify-center w-1/2  bg-gray-200 text-2xl font-bold min-h-12 rounded-xl text-gray-800 mb-4 shadow-md">Edit</Link>
            </div>
        )}
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">About {band.name}</h2>
          {band.bio ? (
            <p className="text-gray-700 leading-relaxed mb-6">{band.bio}</p>
          ) : (
            <p className="text-gray-500 italic mb-6">No bio available.</p>
          )}

          <h3 className="text-xl font-semibold text-gray-800 mb-3">Connect with {band.name}</h3>
          <div className="flex flex-wrap gap-4 mb-6">
            {band.website_url && (
              <a href={band.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center space-x-2">
                <FaGlobe className="text-xl" /> <span>Website</span>
              </a>
            )}
            {band.facebook_url && (
              <a href={band.facebook_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center space-x-2">
                <FaFacebook className="text-xl" /> <span>Facebook</span>
              </a>
            )}
            {band.instagram_url && (
              <a href={band.instagram_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center space-x-2">
                <FaInstagram className="text-xl" /> <span>Instagram</span>
              </a>
            )}
            {band.bandcamp_url && (
              <a href={band.bandcamp_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center space-x-2">
                <FaBandcamp className="text-xl" /> <span>Bandcamp</span>
              </a>
            )}
            {band.spotify_url && (
              <a href={band.spotify_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center space-x-2">
                <FaSpotify className="text-xl" /> <span>Spotify</span>
              </a>
            )}
            {band.youtube_url && (
              <a href={band.youtube_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center space-x-2">
                <FaYoutube className="text-xl" /> <span>YouTube</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}