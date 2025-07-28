'use client';

import React, { useState } from 'react';
import Input from '@/components/Input';
import Button from '@/components/Button';
import api from '@/lib/api';

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

interface GigVenueCreateProps {
  onVenueCreatedAndSelected: (venueId: string) => void;
}

const GigVenueCreate: React.FC<GigVenueCreateProps> = ({ onVenueCreatedAndSelected }) => {
  const [newVenueFormData, setNewVenueFormData] = useState<Partial<Venue>>({
    name: '', address: '', city: '', postcode: '', website_url: ''
  });
  const [creatingVenue, setCreatingVenue] = useState(false);
  const [createVenueError, setCreateVenueError] = useState('');
  const [createVenueSuccess, setCreateVenueSuccess] = useState('');

  const handleNewVenueChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewVenueFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleCreateVenueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingVenue(true);
    setCreateVenueError('');
    setCreateVenueSuccess('');

    if (!newVenueFormData.name || !newVenueFormData.address || !newVenueFormData.city || !newVenueFormData.postcode) {
      setCreateVenueError('Name, address, city, and postcode are required for a new venue.');
      setCreatingVenue(false);
      return;
    }

    try {
      const response = await api.post<{ venue: Venue }>('/venues', newVenueFormData);
      setCreateVenueSuccess('Venue created and selected!');
      onVenueCreatedAndSelected(response.data.venue.id); 
      setNewVenueFormData({ name: '', address: '', city: '', postcode: '', website_url: '' }); 
    } catch (err: any) {
      console.error('Error creating venue:', err);
      setCreateVenueError(err.response?.data?.message || 'Failed to create venue.');
    } finally {
      setCreatingVenue(false);
    }
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      <h4 className="text-lg font-semibold mb-3 text-gray-700">New Venue Details</h4>
      <form onSubmit={handleCreateVenueSubmit}>
        <Input
          label="Venue Name"
          id="name"
          type="text"
          placeholder="The O2 Arena"
          value={newVenueFormData.name || ''}
          onChange={handleNewVenueChange}
          required
        />
        <Input
          label="Address"
          id="address"
          type="text"
          placeholder="Peninsula Square"
          value={newVenueFormData.address || ''}
          onChange={handleNewVenueChange}
          required
        />
        <Input
          label="City"
          id="city"
          type="text"
          placeholder="London"
          value={newVenueFormData.city || ''}
          onChange={handleNewVenueChange}
          required
        />
        <Input
          label="Postcode"
          id="postcode"
          type="text"
          placeholder="SE10 0DX"
          value={newVenueFormData.postcode || ''}
          onChange={handleNewVenueChange}
          required
        />
        <Input
          label="Website URL (Optional)"
          id="website_url"
          type="url"
          placeholder="https://theo2.co.uk"
          value={newVenueFormData.website_url || ''}
          onChange={handleNewVenueChange}
        />
        {createVenueError && <p className="text-red-500 text-xs italic mb-4">{createVenueError}</p>}
        {createVenueSuccess && <p className="text-green-500 text-xs italic mb-4">{createVenueSuccess}</p>}
        <Button type="submit" isLoading={creatingVenue} className="w-full">
          Create Venue
        </Button>
      </form>
    </div>
  );
};

export default GigVenueCreate;