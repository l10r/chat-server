import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Close as CloseIcon, Download as DownloadIcon } from '@mui/icons-material';

interface ImagePreviewProps {
  src: string;
  alt?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  fileName?: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ 
  src, 
  alt = 'Image', 
  style = {}, 
  onClick,
  fileName
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleImageClick = () => {
    setPreviewOpen(true);
    if (onClick) onClick();
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = fileName || alt || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <img 
        src={src} 
        alt={alt}
        style={{ 
          maxWidth: '200px', 
          maxHeight: '150px', 
          width: 'auto',
          height: 'auto',
          objectFit: 'cover',
          borderRadius: '8px',
          cursor: 'pointer',
          border: '1px solid #333',
          display: 'block',
          ...style
        }} 
        onClick={handleImageClick}
      />
      
      {/* Simple Overlay */}
      {previewOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            cursor: 'pointer'
          }}
          onClick={handleClosePreview}
        >
          <div 
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <Tooltip title="Close">
              <IconButton
                onClick={handleClosePreview}
                style={{
                  position: 'absolute',
                  top: '-50px',
                  right: '0',
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: '#fff',
                  zIndex: 1
                }}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
            
            {/* Download button */}
            <Tooltip title="Download image">
              <IconButton
                onClick={handleDownload}
                style={{
                  position: 'absolute',
                  top: '-50px',
                  right: '50px',
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: '#4a9eff',
                  zIndex: 1
                }}
                size="small"
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            
            {/* Image */}
            <img 
              src={src} 
              style={{ 
                maxWidth: '100%', 
                maxHeight: 'calc(90vh - 100px)',
                width: 'auto',
                height: 'auto',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
                objectFit: 'contain',
                display: 'block'
              }} 
              alt={alt}
            />
          </div>
        </div>
      )}
    </>
  );
};
