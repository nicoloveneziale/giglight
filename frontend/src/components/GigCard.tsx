import React from 'react';
import Link from 'next/link';

interface GigCardProps {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  venue_name: string;
  venue_address: string;
  city: string;
  promo_image_url: string;
}

const GigCard: React.FC<GigCardProps> = ({ id, title, start_time, end_time, venue_name, venue_address, city, promo_image_url }) => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  const gigStartTime = new Date(start_time);
  const gigEndTime = new Date(end_time);

  const formattedDate = gigStartTime.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedStartTime = gigStartTime.toLocaleTimeString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true, 
  });

  const formattedEndTime = gigEndTime.toLocaleTimeString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true, 
  });


  return (
    <Link href={`/gigs/${id}`}>
      <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer">
        <div className="relative w-full h-48 mb-4 overflow-hidden rounded-md"> 
          <img
              src={`${backendUrl}${promo_image_url}`}
              alt={`Promotional image for ${title}`} 
              className="absolute inset-0 w-full h-full object-cover" 
            />
        </div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <p className="text-gray-600 mt-1">{`${venue_name}, ${venue_address}`}</p>
        <p className="text-gray-700 mt-1">{city}</p>
        <p className="text-sm text-gray-500 mt-2">{`${formattedStartTime} - ${formattedEndTime} ${formattedDate}`}</p>
      </div>
    </Link>
  );
};

export default GigCard;