'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button';
import api from '@/lib/api';

interface BandProfile {
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

const Header: React.FC = () => {
  const { isAuthenticated, user, logout, loadingAuth } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bandProfile, setBandProfile] = useState<Partial<BandProfile>>({});

  useEffect(() => {
    setIsMenuOpen(false);
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchBandProfile = async () => {
      if (!isAuthenticated || !user || user.userType !== 'band') {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError('');
        const response = await api.get<BandProfile>('/bands/profile');
        setBandProfile(response.data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          logout();
          setError(err.response?.data?.message || 'Authentication error. Please log in again.');
        } else {
          console.error('Failed to fetch band profile:', err);
          setError(err.response?.data?.message || 'Failed to fetch band profile.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && !loadingAuth && user?.userType === 'band') {
      fetchBandProfile();
    }
  }, [isAuthenticated, loadingAuth, user, logout]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  if (loadingAuth) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-800 text-white shadow-md">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white transition-colors duration-200 hover:text-blue-400">
          GigLight
        </Link>

        <nav className="hidden md:flex space-x-6 items-center">
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="hover:text-blue-400 transition-colors duration-200">
                Home
              </Link>
            </li>
            <li>
              <Link href="/gigs" className="hover:text-blue-400 transition-colors duration-200">
                Gigs
              </Link>
            </li>
            {isAuthenticated && (
              <li>
                <Link href="/dashboard" className="hover:text-blue-400 transition-colors duration-200">
                  Dashboard
                </Link>
              </li>
            )}
          </ul>
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 text-sm md:text-base">Welcome, {user?.email}</span>
              <Button onClick={logout} variant="outline" className="text-sm px-3 py-1">
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex space-x-4">
              <Link href="/login">
                <Button variant="outline" className="text-sm px-3 py-1">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="text-sm px-3 py-1">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </nav>

        <button
          className="md:hidden p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
        </button>
      </div>

      <div
        id="mobile-menu"
        className={`fixed inset-0 bg-gray-900 bg-opacity-95 z-40 transform transition-transform duration-300 ease-in-out md:hidden
          ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <button
          className="md:hidden m-5 w-min p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </button>
        <div className="flex flex-col h-full p-6 pt-10">

          <ul className="flex flex-col space-y-6 text-xl mb-8">
            <li>
              <Link href="/" className="block text-white hover:text-blue-400 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/gigs" className="block text-white hover:text-blue-400 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>
                Gigs
              </Link>
            </li>
            {isAuthenticated && (
              <>
              <li>
                <Link href="/dashboard" className="block text-white hover:text-blue-400 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
              </li>
              {bandProfile.id && (
              <>
              <li>
                <Link href={`/bands/${bandProfile.id}`} className="block text-white hover:text-blue-400 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>
                  Your Band Profile
                </Link>
              </li>
              <li>
                <Link href={"/create-gig"} className="block text-white hover:text-blue-400 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>
                  Create Gig +
                </Link>
              </li>
              </>
              )
              }
              </>
            )}
          </ul>

          {isAuthenticated ? (
            <div className="flex flex-col space-y-4 items-start border-t border-gray-700 pt-6">
              <span className="text-gray-300 text-lg">Welcome, {user?.email}</span>
              <span className="text-gray-400 text-sm">Type: {user?.userType}</span>
              <Button onClick={logout} variant="outline" className="w-full text-lg">
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex flex-col space-y-4 items-start border-t border-gray-700 pt-6">
              <Link href="/login" className="w-full" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full text-lg">
                  Login
                </Button>
              </Link>
              <Link href="/signup" className="w-full" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full text-lg">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;