'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import Link from 'next/link';

export default function DashboardPage() {
  const { isAuthenticated, user, loadingAuth } = useAuth();
  const router = useRouter();


  useEffect(() => {
    if (!loadingAuth && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loadingAuth, router]);


  if (loadingAuth || !isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center text-lg text-gray-700">
        {loadingAuth ? 'Loading dashboard...' : 'Redirecting to login...'}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 py-8 mt-15">
      <div className="bg-gray-100 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Your Activities</h2>
        {user?.userType === 'band' ? (
          <p className="text-gray-600">
            Manage your band profile, upcoming gigs, and fan interactions here.
          </p>
        ) : (
          <p className="text-gray-600">
            Explore new bands, follow your favorites, and discover upcoming gigs.
          </p>
        )}
        <p className="mt-4 text-gray-500 text-sm">
          Create your band profile:
          <Link href="/band-profile" className="text-blue-500 underline">here</Link>
        </p>
      </div>
    </div>
  );
}