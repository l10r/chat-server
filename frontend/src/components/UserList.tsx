import React, { useState, useRef, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Chip, Box } from '@mui/material';
import { People, Close } from '@mui/icons-material';
import { getUsernameStyle } from '../utils/userColors';

interface UserListProps {
  users: string[];
  maxVisible?: number;
}

export const UserList: React.FC<UserListProps> = ({ users, maxVisible = 5 }) => {
  const [showAllDialog, setShowAllDialog] = useState(false);
  const [visibleUsers, setVisibleUsers] = useState<string[]>([]);
  const [hiddenCount, setHiddenCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (users.length <= maxVisible) {
      setVisibleUsers(users);
      setHiddenCount(0);
    } else {
      setVisibleUsers(users.slice(0, maxVisible));
      setHiddenCount(users.length - maxVisible);
    }
  }, [users, maxVisible]);

  const handleShowAll = () => {
    setShowAllDialog(true);
  };

  const handleCloseDialog = () => {
    setShowAllDialog(false);
  };

  return (
    <>
      <div ref={containerRef} className="user-list">
        {visibleUsers.map((user) => (
          <Chip
            key={user}
            label={user}
            size="small"
            sx={{
              backgroundColor: getUsernameStyle(user, users).backgroundColor,
              color: getUsernameStyle(user, users).color,
              fontSize: '12px',
              height: '24px',
              margin: '2px',
              '& .MuiChip-label': {
                padding: '0 8px'
              }
            }}
          />
        ))}
        
        {hiddenCount > 0 && (
          <Button
            size="small"
            variant="outlined"
            onClick={handleShowAll}
            sx={{
              minWidth: 'auto',
              padding: '4px 8px',
              fontSize: '12px',
              height: '24px',
              margin: '2px',
              color: '#4a9eff',
              borderColor: '#4a9eff',
              '&:hover': {
                backgroundColor: 'rgba(74, 158, 255, 0.1)',
                borderColor: '#66b3ff'
              }
            }}
          >
            +{hiddenCount}
          </Button>
        )}
      </div>

      {/* All Users Dialog */}
      <Dialog
        open={showAllDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1a1a1a',
            color: '#e0e0e0',
            maxHeight: '70vh'
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <People />
            All Users ({users.length})
          </Box>
          <IconButton 
            onClick={handleCloseDialog} 
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
        <DialogContent sx={{ padding: '16px' }}>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1,
            maxHeight: '50vh',
            overflow: 'auto'
          }}>
            {users.map((user) => (
              <Chip
                key={user}
                label={user}
                sx={{
                  backgroundColor: getUsernameStyle(user, users).backgroundColor,
                  color: getUsernameStyle(user, users).color,
                  fontSize: '14px',
                  height: '32px',
                  '& .MuiChip-label': {
                    padding: '0 12px'
                  }
                }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: '16px', borderTop: '1px solid #333' }}>
          <Button onClick={handleCloseDialog} variant="outlined" sx={{ color: '#4a9eff', borderColor: '#4a9eff' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};