'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import AuthCard from '@/components/AuthCard';
import GigVenueSearch from '@/components/GigVenueSearch'; 
import GigVenueCreate from '@/components/GigVenueCreate'; 
import GigForm from '@/components/GigForm';

interface GigFormData {
  venue_id: string | null;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  ticket_url: string | null;
  promo_image_url: string | null;
}

type VenueMode = 'search' | 'create';

export default function CreateGigPage() {
  const { isAuthenticated, user, loadingAuth, logout } = useAuth();
  const router = useRouter();
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [venueMode, setVenueMode] = useState<VenueMode>('search'); 
  const [gigFormData, setGigFormData] = useState<Partial<GigFormData>>({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    ticket_url: '',
    promo_image_url: '',
  });
  const [submittingGig, setSubmittingGig] = useState(false);
  const [gigError, setGigError] = useState('');
  const [gigSuccessMessage, setGigSuccessMessage] = useState('');
  const [selectedPromoFile, setSelectedPromoFile] = useState<File | null>(null);
  const [previewPromoImage, setPreviewPromoImage] = useState<string | null>(null);

  useEffect(() => {
    if (!loadingAuth) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.userType !== 'band') {
        setGigError('Access denied. Only band accounts can create gigs. Redirecting...');
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    }
  }, [isAuthenticated, loadingAuth, user, router]);

  const handleGigFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setGigFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handlePromoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPromoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewPromoImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedPromoFile(null);
      setPreviewPromoImage(gigFormData.promo_image_url ?? null);
    }
  };

  const handleGigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingGig(true);
    setGigError('');
    setGigSuccessMessage('');

    if (!selectedVenueId) {
      setGigError('Please select or create a venue for the gig.');
      setSubmittingGig(false);
      return;
    }
    if (!gigFormData.title || !gigFormData.start_time) {
      setGigError('Gig title and start time are required.');
      setSubmittingGig(false);
      return;
    }

    let uploadedPromoImageUrl = gigFormData.promo_image_url;

    if (selectedPromoFile) {
      const fileFormData = new FormData();
      fileFormData.append('profilePicture', selectedPromoFile); 

      try {
        const uploadResponse = await api.post<{ fileUrl: string }>('/upload/profile-picture', fileFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        uploadedPromoImageUrl = uploadResponse.data.fileUrl;
        setGigSuccessMessage('Promo image uploaded!');
      } catch (uploadError: any) {
        console.error('Failed to upload promo image:', uploadError);
        setGigError(uploadError.response?.data?.message || 'Failed to upload promo image.');
        setSubmittingGig(false);
        return;
      }
    }

    try {
      const finalGigData = {
        ...gigFormData,
        venue_id: selectedVenueId,
        promo_image_url: uploadedPromoImageUrl,
      };

      const response = await api.post('/gigs', finalGigData);
      setGigSuccessMessage(response.data.message || 'Gig created successfully!');
      setGigFormData({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        ticket_url: '',
        promo_image_url: '',
      });
      setSelectedVenueId(null);
      setSelectedPromoFile(null);
      setPreviewPromoImage(null);
      setVenueMode('search'); 
      router.push('/gigs');
    } catch (submitError: any) {
      console.error('Failed to create gig:', submitError);
      setGigError(submitError.response?.data?.message || 'Failed to create gig.');
      if (submitError.response?.status === 401) {
        logout();
      }
    } finally {
      setSubmittingGig(false);
    }
  };

  if (loadingAuth || (isAuthenticated && user?.userType !== 'band' && gigError === 'Access denied. Only band accounts can create gigs. Redirecting...')) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center text-lg text-gray-700">
        {loadingAuth ? 'Loading...' : gigError}
      </div>
    );
  }

  if (!isAuthenticated || user?.userType !== 'band') {
    return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center text-red-500">Access Denied.</div>;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center mt-20 shadow p-4 sm:p-6">
      <AuthCard title="Create a New Gig">
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Venue Selection</h3>
          <div className="flex space-x-4 mb-4">
            <Button
              type="button"
              onClick={() => {
                setVenueMode('search');
                setSelectedVenueId(null);
              }}
              variant={venueMode === 'search' ? 'primary' : 'secondary'}
              className="flex-1"
            >
              Search Existing Venue
            </Button>
            <Button
              type="button"
              onClick={() => {
                setVenueMode('create');
                setSelectedVenueId(null); 
              }}
              variant={venueMode === 'create' ? 'primary' : 'secondary'}
              className="flex-1"
            >
              Create New Venue
            </Button>
          </div>

          {selectedVenueId && (
            <p className="mt-4 text-center text-green-700 font-medium p-3 border border-green-300 rounded-md bg-green-50">
              Venue Selected! Ready to create gig.
            </p>
          )}
          {venueMode === 'search' && (
            <GigVenueSearch
              onVenueSelected={setSelectedVenueId}
              selectedVenueId={selectedVenueId}
            />
          )}

          {venueMode === 'create' && (
            <GigVenueCreate
              onVenueCreatedAndSelected={(venueId) => {
                setSelectedVenueId(venueId);
                setVenueMode('search'); 
              }}
            />
          )}
        </div>
        <div className="my-6 p-4 border rounded-lg bg-white shadow-md">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Gig Details</h3>
          <GigForm
            formData={gigFormData as any}
            handleChange={handleGigFormChange}
            handleFileChange={handlePromoFileChange}
            handleSubmit={handleGigSubmit}
            submitting={submittingGig}
            error={gigError}
            successMessage={gigSuccessMessage}
            previewImage={previewPromoImage}
          />
        </div>
      </AuthCard>
    </div>
  );
}