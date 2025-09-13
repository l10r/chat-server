import React, { useState, useRef, useEffect } from 'react';
import { VolumeUp, VolumeOff } from '@mui/icons-material';
import debug from 'debug';

const log = debug('chat:audio-player');

// Utility function to validate and potentially fix base64 audio data
const validateAndFixAudioData = async (src: string, type: string): Promise<string | null> => {
  try {
    if (!src.startsWith('data:')) {
      return null;
    }
    
    // Extract the base64 data
    const base64Data = src.split(',')[1];
    if (!base64Data) {
      log('No base64 data found in data URL');
      return null;
    }
    
    // Check if the data looks valid (basic validation)
    if (base64Data.length < 100) {
      log('Audio data seems too short to be valid');
      return null;
    }
    
    // Try to create a blob and test it
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Try different MIME types for better compatibility
    const mimeTypes = [
      type, // Original type
      'audio/webm; codecs=opus', // With spaces
      'audio/webm', // Without codecs
      'audio/ogg; codecs=opus', // Alternative format
      'audio/mp4', // Fallback
      'audio/wav' // Universal fallback
    ];
    
    for (const mimeType of mimeTypes) {
      try {
        const blob = new Blob([bytes], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);
        
        // Test the blob URL
        const testAudio = new Audio();
        testAudio.src = blobUrl;
        testAudio.preload = 'metadata';
        
        const result = await new Promise<string | null>((resolve) => {
          const timeout = setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
            resolve(null);
          }, 2000);
          
          testAudio.addEventListener('canplay', () => {
            clearTimeout(timeout);
            log(`Audio validation successful with MIME type: ${mimeType}`);
            resolve(blobUrl);
          });
          
          testAudio.addEventListener('error', (e) => {
            clearTimeout(timeout);
            log(`Audio validation failed with MIME type: ${mimeType}`, e);
            URL.revokeObjectURL(blobUrl);
            resolve(null);
          });
          
          testAudio.load();
        });
        
        if (result) {
          return result;
        }
      } catch (error) {
        log(`Error testing MIME type ${mimeType}:`, error);
        continue;
      }
    }
    
    log('All MIME type attempts failed');
    return null;
  } catch (error) {
    log('Error validating audio data:', error);
    return null;
  }
};

interface CustomAudioPlayerProps {
  src: string;
  type: string;
  name: string;
  duration?: number;
}

export const CustomAudioPlayer: React.FC<CustomAudioPlayerProps> = ({ 
  src, 
  type, 
  name, 
  duration: propDuration 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState<number | null>(propDuration && isFinite(propDuration) ? propDuration : null);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src);
  const audioRef = useRef<HTMLAudioElement>(null);
  const blobUrlRef = useRef<string | null>(null);


  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set the audio source with better handling for different formats
    audio.src = currentSrc;
    
    // Add additional attributes for better compatibility
    audio.preload = 'metadata';
    audio.crossOrigin = 'anonymous';
    
    // Try to detect if this is a problematic format and add hints
    if (type.includes('webm') && !type.includes('codecs')) {
      log('Detected WebM without codecs, adding compatibility hints');
      audio.setAttribute('type', 'audio/webm; codecs=opus');
    }
    
    // Special handling for Firefox-generated audio
    const isFirefoxAudio = type.includes('webm') && src.includes('base64');
    if (isFirefoxAudio) {
      log('Detected Firefox-generated audio, applying special handling');
      audio.setAttribute('type', 'audio/webm; codecs=opus');
      // Try to force Chrome to treat it as a proper WebM file
      audio.preload = 'auto';
    }
    
    audio.load();

    const handleTimeUpdate = () => {
      if (duration && isFinite(duration) && duration > 0) {
        setProgress(audio.currentTime / duration);
      }
    };

    const handleLoadedMetadata = () => {
      if (isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleError = (e: Event) => {
      log('Audio error:', e);
      const audio = e.target as HTMLAudioElement;
      const error = audio.error;
      
      let errorMessage = 'Audio playback failed';
      if (error) {
        switch (error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = 'Audio playback was aborted';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error during audio playback';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = 'Audio format not supported';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Audio format not supported by browser';
            break;
          default:
            errorMessage = `Audio playback failed (Error ${error.code})`;
        }
      }
      
      log('Audio error details:', {
        error: error?.code,
        message: errorMessage,
        src: audio.src,
        type: type,
        retryCount: retryCount
      });
      
      // Try to retry with a different approach if it's a format issue
      if ((error?.code === MediaError.MEDIA_ERR_DECODE || 
           error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED ||
           error?.code === MediaError.MEDIA_ERR_NETWORK) && 
          retryCount < 2) {
        log(`Attempting to retry audio playback (attempt ${retryCount + 1})...`);
        setRetryCount(prev => prev + 1);
        setIsLoading(true);
        setHasError(false);
        
        // Try to validate and fix the audio data
        validateAndFixAudioData(src, type).then((fixedSrc) => {
          if (fixedSrc) {
            log('Audio data validation successful, using fixed source...');
            // Clean up previous blob URL if it exists
            if (blobUrlRef.current) {
              URL.revokeObjectURL(blobUrlRef.current);
            }
            blobUrlRef.current = fixedSrc;
            setCurrentSrc(fixedSrc);
          } else if (retryCount === 0) {
            // If first retry failed, try with original source as fallback
            log('Audio data validation failed, trying original source...');
            setCurrentSrc(src);
          } else {
            log('All audio retry attempts failed, showing error');
            setHasError(true);
            setIsLoading(false);
          }
        });
        return;
      }
      
      setHasError(true);
      setIsLoading(false);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [currentSrc, duration, type, retryCount]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };


  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    if (audioRef.current && duration && isFinite(duration) && duration > 0) {
      audioRef.current.currentTime = seekTime * duration;
    }
    setProgress(seekTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? volume : 0;
    }
  };

  if (hasError) {
    return (
      <div style={{ 
        margin: '8px 0', 
        padding: '8px', 
        border: '1px solid #ff4444', 
        borderRadius: '4px', 
        backgroundColor: '#2a1a1a' 
      }}>
        <div style={{ color: '#ff4444', fontSize: '12px', marginBottom: '4px' }}>
          ⚠️ Audio playback failed
        </div>
        <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>
          Type: {type}
        </div>
        <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>
          This format may not be supported by your browser
        </div>
        <div style={{ fontSize: '10px', color: '#888', marginBottom: '8px' }}>
          Try downloading the file to play it locally
        </div>
        <a 
          href={currentSrc} 
          download={name} 
          style={{ 
            color: '#888', 
            textDecoration: 'underline',
            fontSize: '12px'
          }}
        >
          Download audio file
        </a>
      </div>
    );
  }

  return (
    <div className="custom-audio-player">
      {/* Hidden HTML5 audio element for actual audio playback */}
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        style={{ display: 'none' }}
      />

      {/* Custom Player UI */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        {/* Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: isPlaying ? '#ff4444' : '#4a9eff',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          {isPlaying ? '||' : '▶'}
        </button>

        {/* Progress Bar */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', color: '#888', minWidth: '30px' }}>
            {duration && isFinite(duration) ? formatTime(duration * progress) : '0:00'}
          </span>
          <div style={{ flex: 1, margin: '0 8px', position: 'relative' }}>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isFinite(progress) ? progress : 0}
              onChange={handleSeek}
              disabled={isLoading || hasError}
              style={{
                width: '100%',
                height: '4px',
                background: 'transparent',
                outline: 'none',
                cursor: 'pointer',
                WebkitAppearance: 'none',
                appearance: 'none',
                position: 'relative',
                zIndex: 2
              }}
              className="custom-slider"
            />
            <div 
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '4px',
                backgroundColor: '#333',
                borderRadius: '2px',
                transform: 'translateY(-50%)',
                zIndex: 1
              }}
            />
            <div 
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                height: '4px',
                backgroundColor: '#4a9eff',
                borderRadius: '2px',
                transform: 'translateY(-50%)',
                width: `${(isFinite(progress) ? progress : 0) * 100}%`,
                zIndex: 1
              }}
            />
          </div>
          <span style={{ fontSize: '10px', color: '#888', minWidth: '30px' }}>
            {duration && isFinite(duration) ? formatTime(duration) : '0:00'}
          </span>
        </div>

        {/* Volume Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={handleMuteToggle}
            style={{
              width: '24px',
              height: '24px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#888',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isMuted ? <VolumeOff fontSize="small" /> : <VolumeUp fontSize="small" />}
          </button>
          <div style={{ width: '60px', position: 'relative' }}>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              disabled={isLoading || hasError}
              style={{
                width: '100%',
                height: '4px',
                background: 'transparent',
                outline: 'none',
                cursor: 'pointer',
                WebkitAppearance: 'none',
                appearance: 'none',
                position: 'relative',
                zIndex: 2
              }}
              className="custom-slider"
            />
            <div 
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '4px',
                backgroundColor: '#333',
                borderRadius: '2px',
                transform: 'translateY(-50%)',
                zIndex: 1
              }}
            />
            <div 
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                height: '4px',
                backgroundColor: '#4a9eff',
                borderRadius: '2px',
                transform: 'translateY(-50%)',
                width: `${(isMuted ? 0 : volume) * 100}%`,
                zIndex: 1
              }}
            />
          </div>
        </div>
      </div>

      {/* File Info */}
      <div style={{ 
        fontSize: '12px', 
        color: '#888', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <span>Voice memo</span>
        {isLoading && (
          <span style={{ fontSize: '10px', color: '#666' }}>
            Loading...
          </span>
        )}
      </div>
      
      <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
        <a 
          href={src} 
          download={name} 
          style={{ color: '#888', textDecoration: 'none' }}
        >
          Download ({type})
        </a>
      </div>
    </div>
  );
};
