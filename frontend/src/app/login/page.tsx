'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/Input'; 
import Button from '@/components/Button';
import AuthCard from '@/components/AuthCard'; 
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isAuthenticated, login, loadingAuth } = useAuth(); 

  useEffect(() => {
    if (!loadingAuth && isAuthenticated) {
      router.push('/dashboard'); 
    }
  }, [isAuthenticated, loadingAuth, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        console.log(data.user)
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Network or server error during login:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gray-100">
      <AuthCard title="Sign In to GigLight">
        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            id="email"
            type="email"
            placeholder="your@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}

          <div className="flex items-center justify-center sm:justify-between flex-wrap"> 
            <Button type="submit" isLoading={loading}>
              Sign In
            </Button>
            <p className="mt-4 sm:mt-0 text-center text-sm text-gray-600 w-full sm:w-auto">
              {"Don't have an account?"}
              <a href="/signup" className="font-bold text-blue-600 hover:text-blue-800">
                Sign Up
              </a>
            </p>
          </div>
        </form>
      </AuthCard>
    </div>
  );
}