import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = '#007bff' 
}) => {
  const sizeMap = {
    small: '16px',
    medium: '24px',
    large: '32px'
  };

  return (
    <div 
      className="loading-spinner"
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        border: `2px solid ${color}20`,
        borderTop: `2px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}
    />
  );
};