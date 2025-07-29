import React, { useRef } from 'react'; 
import Input from '@/components/Input';
import Button from '@/components/Button';

interface BandProfileFormProps {
  formData: {
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
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  error: string;
  successMessage: string;
  profileExists: boolean;
  userEmail: string;
  previewImage: string | null;
}

const genres = [
  'Please Select',
  'Rock', 'Pop', 'Hip Hop', 'Electronic', 'R&B', 'Jazz', 'Blues', 'Country',
  'Classical', 'Metal', 'Punk', 'Folk', 'Indie', 'Alternative', 'Reggae',
  'Funk', 'Soul', 'Gospel', 'Ambient', 'Techno', 'House', 'Dubstep',
  'Trance', 'Acoustic', 'World', 'Latin', 'K-Pop', 'J-Pop', 'Soundtrack'
].sort((a, b) => {
  if (a === 'Please Select') return -1;
  if (b === 'Please Select') return 1;
  return a.localeCompare(b);
});

const BandProfileForm: React.FC<BandProfileFormProps> = ({
  formData,
  handleChange,
  handleFileChange,
  handleSubmit,
  submitting,
  error,
  successMessage,
  profileExists,
  userEmail,
  previewImage, 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL; 

  const currentImageSrc = previewImage || `${backendUrl}${formData.profile_picture_url}` || 'https://via.placeholder.com/150/EEEEEE/808080?text=Upload+Image';

  const handleImageClick = () => {
    fileInputRef.current?.click(); 
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-4 flex flex-col items-center">
        <p className="text-gray-700 text-sm font-bold mb-2">Profile Picture:</p>
        <input
          type="file"
          id="profile_picture_upload"
          accept="image/*"
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
        <img
          src={currentImageSrc}
          alt="Profile Preview"
          className="w-32 h-32 object-cover rounded-full border border-gray-300 shadow-md cursor-pointer transition-opacity duration-300 hover:opacity-80"
          onClick={handleImageClick} 
        />
        <p className="text-gray-600 text-xs mt-2">Click the image to upload or change</p>
      </div>

      <div className="mb-6">
        <p className="text-gray-700 text-sm font-bold mb-2">Logged in as:</p>
        <p className="text-gray-900 mb-4">{userEmail} (Band Account)</p>
      </div>

      <Input
        label="Band Name"
        id="name"
        type="text"
        placeholder="The Rock Outlaws"
        value={formData.name || ''}
        onChange={handleChange}
        required
      />

      <div className="mb-4">
        <label htmlFor="genre" className="block text-gray-700 text-sm font-bold mb-2">
          Genre
        </label>
        <select
          id="genre"
          name="genre" 
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out text-base"
          value={formData.genre || 'Please Select'} 
          onChange={handleChange}
        >
          {genres.map((genreOption) => (
            <option key={genreOption} value={genreOption === 'Please Select' ? '' : genreOption}>
              {genreOption}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Bio"
        id="bio"
        type="textarea"
        placeholder="Tell us about your band, your style, and your journey..."
        value={formData.bio || ''}
        onChange={handleChange}
      />
      <Input
        label="Location"
        id="location"
        type="text"
        placeholder="e.g., London, UK"
        value={formData.location || ''}
        onChange={handleChange}
      />
      <Input
        label="Website URL"
        id="website_url"
        type="url"
        placeholder="https://yourband.com"
        value={formData.website_url || ''}
        onChange={handleChange}
      />
      <Input
        label="Facebook URL"
        id="facebook_url"
        type="url"
        placeholder="https://facebook.com/yourband"
        value={formData.facebook_url || ''}
        onChange={handleChange}
      />
      <Input
        label="Instagram URL"
        id="instagram_url"
        type="url"
        placeholder="https://instagram.com/yourband"
        value={formData.instagram_url || ''}
        onChange={handleChange}
      />
      <Input
        label="Bandcamp URL"
        id="bandcamp_url"
        type="url"
        placeholder="https://yourband.bandcamp.com"
        value={formData.bandcamp_url || ''}
        onChange={handleChange}
      />
      <Input
        label="Spotify URL"
        id="spotify_url"
        type="url"
        placeholder="https://open.spotify.com/artist/yourid"
        value={formData.spotify_url || ''}
        onChange={handleChange}
      />
      <Input
        label="YouTube URL"
        id="youtube_url"
        type="url"
        placeholder="https://youtube.com/yourchannel"
        value={formData.youtube_url || ''}
        onChange={handleChange}
      />

      {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
      {successMessage && <p className="text-green-500 text-xs italic mb-4">{successMessage}</p>}

      <Button type="submit" isLoading={submitting}>
        {profileExists ? 'Update Band Profile' : 'Create Band Profile'}
      </Button>
    </form>
  );
};

export default BandProfileForm;