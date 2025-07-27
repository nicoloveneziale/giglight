'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Input from "@/components/Input";
import AuthCard from "@/components/AuthCard";
import { useAuth } from "@/context/AuthContext";

export default function SignUpPage() {
const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('fan'); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const {isAuthenticated, login, loadingAuth} = useAuth();

  useEffect(() => {
    if (!loadingAuth && isAuthenticated) {
      router.push('/'); 
    }
  }, [isAuthenticated, loadingAuth, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setLoading(true);
    setError(''); 

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, userType }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Network or server error during registration:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gray-100">
      <AuthCard title="Sign Up for GigLight">
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
          <div className="mb-6">
            <label htmlFor="userType" className="block text-gray-700 text-sm font-bold mb-2">
              I am a:
            </label>
            <select
              id="userType"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out text-base"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
            >
              <option value="fan">Fan</option>
              <option value="band">Band</option>
            </select>
          </div>

          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}

          <div className="flex items-center justify-center sm:justify-between flex-wrap"> {/* Responsive flex */}
            <Button type="submit" isLoading={loading}>
              Sign Up
            </Button>
            <p className="mt-4 sm:mt-0 text-center text-sm text-gray-600 w-full sm:w-auto">
              Already have an account?{' '}
              <a href="/login" className="font-bold text-blue-600 hover:text-blue-800">
                Sign In
              </a>
            </p>
          </div>
        </form>
      </AuthCard>
    </div>
  );
}