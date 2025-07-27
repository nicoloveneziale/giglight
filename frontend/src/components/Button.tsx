import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean; 
}

const Button: React.FC<ButtonProps> = ({
  children,
  isLoading = false,
  variant = 'primary', 
  className = '', 
  ...props
}) => {
  const baseStyles = 'font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out text-base';
  let variantStyles = '';

  switch (variant) {
    case 'primary':
      variantStyles = 'bg-blue-600 hover:bg-blue-700 text-white';
      break;
    case 'secondary':
      variantStyles = 'bg-gray-200 hover:bg-gray-300 text-gray-800';
      break;
    case 'outline':
      variantStyles = 'border border-blue-600 text-blue-600 hover:bg-blue-50';
      break;
    default:
      break;
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};

export default Button;