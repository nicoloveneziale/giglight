'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import Link from 'next/link';
import api from '@/lib/api';
import GigCard from '@/components/GigCard';

interface Gig {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  venue_name: string;
  venue_address: string;
  city: string;
  promo_image_url: string;
}

export default function DashboardPage() {
  const { isAuthenticated, user, loadingAuth } = useAuth();
  const router = useRouter();

  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loadingGigs, setLoadingGigs] = useState(true);
  const [errorGigs, setErrorGigs] = useState('');

  useEffect(() => {
    if (!loadingAuth && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loadingAuth, router]);

  useEffect(() => {
    const fetchBandAndGigs = async () => {
      if (isAuthenticated && user?.userType === 'band') {
        try {
          setLoadingGigs(true);
          setErrorGigs('');

          const bandProfileResponse = await api.get('/bands/profile');
          const bandId = bandProfileResponse.data.id;
          
          if (!bandId) {
            setErrorGigs("Band profile not found.");
            setLoadingGigs(false);
            return;
          }

          const gigsResponse = await api.get<Gig[]>(`/bands/${bandId}/gigs`);
          setGigs(gigsResponse.data);
          
        } catch (err: any) {
          console.error('Error fetching gigs:', err);
          setErrorGigs(err.response?.data?.message || 'Failed to load gigs.');
        } finally {
          setLoadingGigs(false);
        }
      }
    };

    fetchBandAndGigs();
  }, [isAuthenticated, user?.userType]); 

  if (loadingAuth || !isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center text-lg text-gray-700">
        {loadingAuth ? 'Loading dashboard...' : 'Redirecting to login...'}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 py-8 mt-16">
      <div className="bg-gray-100 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Your Activities</h2>
        {user?.userType === 'band' ? (
          <>
            <p className="text-gray-600">
              Manage your band profile, upcoming gigs, and fan interactions here.
            </p>
            <p className="mt-4 text-gray-500 text-sm">
              Create your band profile:
              <Link href="/band-profile" className="text-blue-500 underline ml-1">here</Link>
            </p>
            
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Upcoming Gigs</h3>
              {loadingGigs ? (
                <p className="text-gray-500">Loading gigs...</p>
              ) : errorGigs ? (
                <p className="text-red-500">{errorGigs}</p>
              ) : gigs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gigs.map(gig => (
                    <GigCard 
                      key={gig.id} 
                      id={gig.id} 
                      title={gig.title} 
                      start_time={gig.start_time} 
                      end_time={gig.end_time}
                      venue_name={gig.venue_name} 
                      venue_address={gig.venue_address}
                      city={gig.city}
                      promo_image_url={gig.promo_image_url}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">You have no upcoming gigs.</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-gray-600">
            Explore new bands, follow your favorites, and discover upcoming gigs.
          </p>
        )}
      </div>
    </div>
  );
}