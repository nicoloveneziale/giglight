'use client';

import React from 'react';
import Input from '@/components/Input';
import Button from '@/components/Button';

interface GigFormProps {
  formData: {
    title: string;
    description: string | null;
    start_time: string; 
    end_time: string | null; 
    ticket_url: string | null;
    promo_image_url: string | null;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  error: string;
  successMessage: string;
  previewImage: string | null;
}

const GigForm: React.FC<GigFormProps> = ({
  formData,
  handleChange,
  handleFileChange,
  handleSubmit,
  submitting,
  error,
  successMessage,
  previewImage,
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Gig Title"
        id="title"
        type="text"
        placeholder="Awesome Band Live!"
        value={formData.title}
        onChange={handleChange}
        required
      />

      <Input
        label="Description"
        id="description"
        type="textarea"
        placeholder="A brief description of the gig..."
        value={formData.description || ''}
        onChange={handleChange}
      />

      <Input
        label="Start Time"
        id="start_time"
        type="datetime-local"
        value={formData.start_time}
        onChange={handleChange}
        required
      />

      <Input
        label="End Time (Optional)"
        id="end_time"
        type="datetime-local"
        value={formData.end_time || ''}
        onChange={handleChange}
      />

      <Input
        label="Ticket URL (Optional)"
        id="ticket_url"
        type="url"
        placeholder="https://tickets.example.com/gig"
        value={formData.ticket_url || ''}
        onChange={handleChange}
      />

      <Input
        label="Promotional Image (Optional)"
        id="promo_image_upload" 
        type="file"
        onChange={handleFileChange}
        accept="image/*"
      />
      {previewImage && (
        <div className="mb-4">
          <p className="block text-gray-700 text-sm font-bold mb-2">Preview:</p>
          <img src={previewImage} alt="Promo Preview" className="w-32 h-32 object-cover rounded-md border border-gray-300" />
        </div>
      )}
      {formData.promo_image_url && !previewImage && (
        <div className="mb-4">
          <p className="block text-gray-700 text-sm font-bold mb-2">Current Image:</p>
          <img src={formData.promo_image_url} alt="Current Promo" className="w-32 h-32 object-cover rounded-md border border-gray-300" />
        </div>
      )}

      {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
      {successMessage && <p className="text-green-500 text-xs italic mb-4">{successMessage}</p>}

      <Button type="submit" isLoading={submitting} className="w-full">
        Create Gig
      </Button>
    </form>
  );
};

export default GigForm;