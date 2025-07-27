
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import AuthCard from '@/components/AuthCard';
import BandProfileForm from '@/components/BandProfileForm'; 

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

export default function BandProfilePage() {
  const { isAuthenticated, user, loadingAuth, logout } = useAuth();
  const router = useRouter();
  const [profileExists, setProfileExists] = useState(false);
  const [formData, setFormData] = useState<Partial<BandProfile>>({
    name: '',
    genre: '',
    bio: '',
    location: '',
    profile_picture_url: '',
    website_url: '',
    facebook_url: '',
    instagram_url: '',
    bandcamp_url: '',
    spotify_url: '',
    youtube_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null); 


  useEffect(() => {
    if (!loadingAuth) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.userType !== 'band') {
        setError('This page is only for band accounts. Redirecting...');
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    }
  }, [isAuthenticated, loadingAuth, user, router]);

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
        setFormData(response.data);
        setProfileExists(true);
        if (response.data.profile_picture_url) {
            setPreviewImage(response.data.profile_picture_url);
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          setProfileExists(false);
          setFormData(prev => ({ ...prev, name: prev.name || '' }));
        } else if (err.response?.status === 401) {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreviewImage(formData.profile_picture_url); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    if (!formData.name) {
      setError('Band Name is required.');
      setSubmitting(false);
      return;
    }

    let uploadedImageUrl = formData.profile_picture_url; 

    if (selectedFile) {
      const fileFormData = new FormData();
      fileFormData.append('profilePicture', selectedFile); 

      try {
        const uploadResponse = await api.post<{ fileUrl: string }>('/upload/profile-picture', fileFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        uploadedImageUrl = uploadResponse.data.fileUrl; 
        setSuccessMessage('Profile picture uploaded!');
      } catch (uploadError: any) {
        console.error('Failed to upload profile picture:', uploadError);
        setError(uploadError.response?.data?.message || 'Failed to upload profile picture.');
        setSubmitting(false);
        return; 
      }
    }

    try {
      const finalFormData = { ...formData, profile_picture_url: uploadedImageUrl };
      const method = profileExists ? 'put' : 'post';
      const response = await api[method]('/bands/profile', finalFormData);
      setSuccessMessage(response.data.message || 'Band profile saved successfully!');
      setProfileExists(true);
      setFormData(response.data.profile || finalFormData); 
      setSelectedFile(null); 
    } catch (submitError: any) {
      console.error('Failed to save band profile:', submitError);
      setError(submitError.response?.data?.message || 'Failed to save band profile.');
      if (submitError.response?.status === 401) {
        logout();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingAuth || loading || (isAuthenticated && user?.userType !== 'band' && error === 'This page is only for band accounts. Redirecting...')) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center text-lg text-gray-700">
        {loadingAuth || loading ? 'Loading band profile...' : error}
      </div>
    );
  }

  if (!isAuthenticated || user?.userType !== 'band') {
    return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center text-red-500">Access Denied.</div>;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] mt-20 md:mt-30 flex items-center justify-center p-4 sm:p-6 bg-gray-100">
      <AuthCard title={profileExists ? `${user?.email}'s Band Profile` : `Create Your Band Profile`}>
        <BandProfileForm
          formData={formData}
          handleChange={handleChange}
          handleFileChange={handleFileChange}
          handleSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          successMessage={successMessage}
          profileExists={profileExists}
          userEmail={user.email}
          previewImage={previewImage}
        />
      </AuthCard>
    </div>
  );
}