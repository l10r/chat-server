import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, Tooltip } from '@mui/material';
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
          width: '200px', 
          height: '150px', 
          objectFit: 'cover',
          borderRadius: '8px',
          cursor: 'pointer',
          border: '1px solid #333',
          ...style
        }} 
        onClick={handleImageClick}
      />
      
      <Dialog 
        open={previewOpen} 
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: '#1a1a1a',
            color: '#fff'
          }
        }}
      >
        <DialogTitle style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          color: '#fff',
          borderBottom: '1px solid #333'
        }}>
          Image Preview
          <div style={{ display: 'flex', gap: '8px' }}>
            <Tooltip title="Download image">
              <IconButton 
                onClick={handleDownload}
                style={{ color: '#4a9eff' }}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <IconButton 
              onClick={handleClosePreview}
              style={{ color: '#fff' }}
            >
              <CloseIcon />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent style={{ padding: '20px', textAlign: 'center' }}>
          <img 
            src={src} 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '80vh',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
            }} 
            alt={alt}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
