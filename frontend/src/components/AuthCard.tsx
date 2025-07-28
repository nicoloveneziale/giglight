import React from 'react';

interface AuthCardProps {
  title: string;
  children: React.ReactNode;
}

const AuthCard: React.FC<AuthCardProps> = ({ title, children }) => {
  return (
    <div className="w-full bg-gray-100 mx-auto p-4 sm:p-6 md:p-8 rounded-lg shadow-md sm:max-w-md md:max-w-lg">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-gray-800">
        {title}
      </h2>
      {children}
    </div>
  );
};

export default AuthCard;