import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value?: string | number | string[]; 
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  className?: string;
}

const Input: React.FC<InputProps> = ({ label, id, type = 'text', placeholder, value, onChange, className, ...props }) => {
  const commonClasses = "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out text-base";

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          id={id}
          rows={4}
          className={`${commonClasses} resize-y ${className || ''}`}
          placeholder={placeholder}
          value={value as string} 
          onChange={onChange}
          {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>}
        />
      );
    } else if (type === 'file') {
      return (
        <input
          id={id}
          type="file"
          className={`${commonClasses} ${className || ''} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
          onChange={onChange}
          {...props}
        />
      );
    } else {
      return (
        <input
          id={id}
          type={type}
          className={`${commonClasses} ${className || ''}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          {...props}
        />
      );
    }
  };

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-700 text-sm font-bold mb-2">
        {label}
      </label>
      {renderInput()}
    </div>
  );
};

export default Input;