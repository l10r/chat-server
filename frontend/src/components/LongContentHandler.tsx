import React, { useState, useRef, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { ExpandMore, ExpandLess, Close } from '@mui/icons-material';

interface LongContentHandlerProps {
  content: React.ReactNode;
  maxHeight?: string;
  maxLines?: number;
  title?: string;
  children: React.ReactNode;
}

export const LongContentHandler: React.FC<LongContentHandlerProps> = ({
  content,
  maxHeight = '200px',
  maxLines = 10,
  title = 'Full Content',
  children
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showViewAll, setShowViewAll] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (contentRef.current) {
        const element = contentRef.current;
        const lineHeight = parseInt(getComputedStyle(element).lineHeight) || 20;
        const maxHeightPx = maxLines * lineHeight;
        
        // Check if content exceeds the maximum height
        const isOverflowingHeight = element.scrollHeight > maxHeightPx;
        
        // Check if content has horizontal overflow
        const isOverflowingWidth = element.scrollWidth > element.clientWidth;
        
        setIsOverflowing(isOverflowingHeight || isOverflowingWidth);
      }
    };

    checkOverflow();
    
    // Check on resize
    const resizeObserver = new ResizeObserver(checkOverflow);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [maxLines, maxHeight]);

  const handleViewAll = () => {
    setShowViewAll(true);
  };

  const handleClose = () => {
    setShowViewAll(false);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <div 
        ref={contentRef}
        style={{
          maxHeight: isExpanded ? 'none' : maxHeight,
          overflow: isExpanded ? 'visible' : 'hidden',
          position: 'relative',
          width: '100%'
        }}
      >
        {children}
        
        {/* Gradient overlay when content is truncated */}
        {!isExpanded && isOverflowing && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '40px',
              background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))',
              pointerEvents: 'none'
            }}
          />
        )}
      </div>
      
      {/* View All button - positioned outside the scrollable content */}
      {isOverflowing && (
        <div style={{ 
          marginTop: '8px', 
          textAlign: 'center',
          width: '100%',
          position: 'relative',
          zIndex: 10
        }}>
          {!isExpanded ? (
            <Button
              variant="outlined"
              size="small"
              startIcon={<ExpandMore />}
              onClick={handleViewAll}
              sx={{
                color: '#4a9eff',
                borderColor: '#4a9eff',
                '&:hover': {
                  backgroundColor: 'rgba(74, 158, 255, 0.1)',
                  borderColor: '#66b3ff'
                }
              }}
            >
              View All
            </Button>
          ) : (
            <Button
              variant="outlined"
              size="small"
              startIcon={<ExpandLess />}
              onClick={toggleExpanded}
              sx={{
                color: '#4a9eff',
                borderColor: '#4a9eff',
                '&:hover': {
                  backgroundColor: 'rgba(74, 158, 255, 0.1)',
                  borderColor: '#66b3ff'
                }
              }}
            >
              Show Less
            </Button>
          )}
        </div>
      )}

      {/* Full content dialog */}
      <Dialog
        open={showViewAll}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1a1a1a',
            color: '#e0e0e0',
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid #333',
          color: '#4a9eff'
        }}>
          {title}
          <IconButton 
            onClick={handleClose} 
            size="small"
            sx={{ 
              color: '#ffffff',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ padding: 0 }}>
          <div style={{ padding: '16px', maxHeight: '60vh', overflow: 'auto' }}>
            {content}
          </div>
        </DialogContent>
        <DialogActions sx={{ padding: '16px', borderTop: '1px solid #333' }}>
          <Button onClick={handleClose} variant="outlined" sx={{ color: '#4a9eff', borderColor: '#4a9eff' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
