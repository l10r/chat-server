import React from 'react';
import { Lock, LockOpen } from '@mui/icons-material';
import { Tooltip, Chip } from '@mui/material';

interface EncryptionStatusProps {
  enabled: boolean;
  hasKeys: boolean;
}

export const EncryptionStatus: React.FC<EncryptionStatusProps> = ({ enabled, hasKeys }) => {
  if (!enabled) {
    return null;
  }

  return (
    <Tooltip title={hasKeys ? "End-to-end encryption active" : "Encryption enabled, waiting for other users"}>
      <Chip
        icon={hasKeys ? <Lock /> : <LockOpen />}
        label={hasKeys ? "E2E" : "Encrypting..."}
        size="small"
        color={hasKeys ? "success" : "warning"}
        sx={{
          fontSize: '10px',
          height: '20px',
          '& .MuiChip-icon': {
            fontSize: '12px'
          }
        }}
      />
    </Tooltip>
  );
};
