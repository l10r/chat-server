import React, { useState, useRef, useEffect, useCallback } from 'react';
import { EmojiPicker } from './EmojiPicker';
import { FaPaperclip, FaSmile, FaPaperPlane, FaMicrophone, FaStop } from 'react-icons/fa';
import { VoiceMemoRecorder, formatDuration } from '../utils/voiceMemo';
import { useFileUpload } from '../hooks/useFileUpload';
import debug from 'debug';

const log = debug('chat:message-input');

interface MessageInputProps {
  onSendMessage: (message: string | any) => void;
  onTypingChange: (isTyping: boolean) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTypingChange,
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const voiceRecorderRef = useRef<VoiceMemoRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { processFile, createFileAttachment } = useFileUpload({
    onError: (error) => log('File upload error:', error)
  });

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      const dataUrl = await processFile(file);
      const attachment = createFileAttachment(file, dataUrl);
      onSendMessage(attachment);
    } catch (error) {
      log('Error processing file:', error);
      // Error is already handled by the hook
    }
  }, [processFile, createFileAttachment, onSendMessage]);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage('');
      setIsTyping(false);
      onTypingChange(false);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Auto-resize textarea
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }

    // Handle typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTypingChange(true);
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
      onTypingChange(false);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    if (value.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTypingChange(false);
      }, 2e3);
    }
  };

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    // Check if any of the pasted items are files
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        e.preventDefault(); // Prevent default paste behavior
        const file = item.getAsFile();
        if (file) {
          handleFileUpload(file);
        }
        return;
      }
    }
  }, [handleFileUpload]);

  const handleEmojiClick = (emoji: string) => {
    setMessage(prev => {
      const newMessage = prev + emoji;
      // Trigger auto-resize after state update
      setTimeout(() => {
        if (textareaRef.current) {
          const textarea = textareaRef.current;
          textarea.style.height = 'auto';
          textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
        }
      }, 0);
      return newMessage;
    });
    setShowEmojiPicker(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const startRecording = useCallback(async () => {
    try {
      const recorder = new VoiceMemoRecorder();
      voiceRecorderRef.current = recorder;
      
      await recorder.startRecording();
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      log('Error starting recording:', error);
      log('Could not access microphone. Please check permissions.');
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (voiceRecorderRef.current && isRecording) {
      try {
        const voiceMemo = voiceRecorderRef.current.stopRecording();
        
        // Convert blob to base64 data URL for transmission
        const reader = new FileReader();
        reader.onload = () => {
          const base64Data = reader.result as string;
          const voiceMemoForTransmission = {
            type: voiceMemo.type,
            url: base64Data, // Use base64 data URL instead of blob URL
            name: voiceMemo.name,
            duration: voiceMemo.duration,
            size: voiceMemo.blob.size
          };
          
          // Send the voice memo
          onSendMessage(voiceMemoForTransmission);
        };
        reader.readAsDataURL(voiceMemo.blob);
        
        // Clean up
        voiceRecorderRef.current.cleanup();
        voiceRecorderRef.current = null;
        
        setIsRecording(false);
        setRecordingTime(0);
        
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
        
        // Don't revoke URL immediately - let the audio element load it first
        // The URL will be cleaned up when the component unmounts or after a delay
        setTimeout(() => {
          // Only revoke if the URL is still valid
          try {
            URL.revokeObjectURL(voiceMemo.url);
          } catch (e) {
            log('URL already revoked or invalid');
          }
        }, 30000); // Revoke after 30 seconds
        
      } catch (error) {
        log('Error stopping recording:', error);
        log('Error stopping recording. Please try again.');
      }
    }
  }, [isRecording, onSendMessage]);

  // Use the utility function for formatting time

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      if (voiceRecorderRef.current) {
        voiceRecorderRef.current.cleanup();
      }
    };
  }, []); // Empty dependency array - only run on unmount

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(handleFileUpload);
    e.target.value = ''; // Reset input
  }, [handleFileUpload]);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    Array.from(e.dataTransfer.files).forEach(handleFileUpload);
  }, [handleFileUpload]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="message-input-container">
      {isRecording && (
        <div className="recording-indicator">
          <div className="recording-dot"></div>
          <span>Recording... {formatDuration(recordingTime)}</span>
        </div>
      )}
      
      
      <div 
        className="message-input-wrapper"
        onClick={() => textareaRef.current?.focus()}
        style={{ cursor: 'text' }}
      >
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onDrop={handleFileDrop}
          onDragOver={handleDragOver}
          onPaste={handlePaste}
          placeholder="Message"
          disabled={disabled}
          className="message-input"
          rows={1}
        />
        <input
          type="file"
          id="file-input"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            document.getElementById('file-input')?.click();
          }}
          className="attachment-button"
          disabled={disabled}
          title="Upload file"
        >
          <FaPaperclip />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            log('Emoji button clicked, current state:', showEmojiPicker);
            setShowEmojiPicker(!showEmojiPicker);
            log('Emoji picker should be:', !showEmojiPicker);
          }}
          className="emoji-toggle"
          disabled={disabled}
          title="Add emoji"
        >
          <FaSmile />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            isRecording ? stopRecording() : startRecording();
          }}
          className={`voice-button ${isRecording ? 'recording' : ''}`}
          disabled={disabled}
          title={isRecording ? 'Stop recording' : 'Record voice memo'}
        >
          {isRecording ? <FaStop /> : <FaMicrophone />}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSend();
          }}
          disabled={disabled || !message.trim()}
          className="send-button"
        >
          <FaPaperPlane />
        </button>
      </div>
      
      {showEmojiPicker && (
        <EmojiPicker
          onEmojiSelect={handleEmojiClick}
          isVisible={showEmojiPicker}
          onToggle={() => {
            log('Emoji picker toggle clicked');
            setShowEmojiPicker(false);
          }}
        />
      )} 
      {/* Debug indicator */}
      {showEmojiPicker && (
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '0',
          background: 'red',
          color: 'white',
          padding: '5px',
          fontSize: '12px',
          zIndex: 9999
        }}>
          EMOJI PICKER SHOULD BE VISIBLE
        </div>
      )}
      
      {/* Debug info */}
      {isRecording && (
        <div style={{ 
          position: 'absolute', 
          top: '-40px', 
          left: '0', 
          color: 'red', 
          fontSize: '12px',
          background: 'black',
          padding: '4px',
          zIndex: 1000
        }}>
          DEBUG: Recording={isRecording}, Time={recordingTime}
        </div>
      )}
    </div>
  );
};