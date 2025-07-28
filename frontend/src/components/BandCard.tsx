import React from 'react';
import Link from 'next/link';

interface BandCardProps {
  id: string;
  name: string;
  genre: string | null;
  location: string | null;
  profile_picture_url: string | null;
}

const BandCard: React.FC<BandCardProps> = ({ id, name, genre, location, profile_picture_url }) => {
  return (
    <Link href={`/bands/${id}`} className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="relative w-full h-48 bg-gray-200 flex items-center justify-center">
        {profile_picture_url ? (
          <img
            src={profile_picture_url}
            alt={`${name} profile`}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-500 text-lg font-semibold">No Image</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800 mb-1">{name}</h3>
        {genre && <p className="text-gray-600 text-sm mb-1">{genre}</p>}
        {location && <p className="text-gray-500 text-sm">{location}</p>}
      </div>
    </Link>
  );
};

export default BandCard;