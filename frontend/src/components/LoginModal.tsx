import React, { useState, useEffect } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onLogin: (nick: string) => void;
  error?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLogin, error }) => {
  const [nick, setNick] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Load saved nick from storage
      const savedNick = localStorage.getItem('chatNickname') || '';
      setNick(savedNick);
      setIsSubmitting(false); // Reset submitting state when modal opens
    }
  }, [isOpen]);

  // Reset submitting state when error changes
  useEffect(() => {
    if (error) {
      setIsSubmitting(false);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNick = nick.trim();
    
    if (!trimmedNick || isSubmitting) return;
    
    setIsSubmitting(true);
    onLogin(trimmedNick);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleSubmit(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay">
      <div className="login-modal">
        <div className="login-modal-header">
          <h2>Join Chat</h2>
          <p>Enter your nickname to start chatting</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="nick-input">Nickname</label>
            <input
              id="nick-input"
              type="text"
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your nickname..."
              disabled={isSubmitting}
              autoFocus
              maxLength={20}
              className="nick-input"
            />
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={!nick.trim() || isSubmitting}
            className="login-button"
          >
            {isSubmitting ? 'Joining...' : 'Join Chat'}
          </button>
        </form>
      </div>
    </div>
  );
};
