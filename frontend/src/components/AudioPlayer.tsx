import React, { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  src: string;
  type: string;
  name: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, type, name }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadStart = () => {
      setIsLoading(true);
      setHasError(false);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleError = (e: Event) => {
      console.error('Audio playback error:', e);
      console.error('Audio src:', src);
      console.error('Audio type:', type);
      setHasError(true);
      setIsLoading(false);
    };

    const handleLoadEnd = () => {
      setIsLoading(false);
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadend', handleLoadEnd);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadend', handleLoadEnd);
    };
  }, [src, type]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (hasError) {
    return (
      <div style={{ margin: '8px 0', padding: '8px', border: '1px solid #ff4444', borderRadius: '4px', backgroundColor: '#2a1a1a' }}>
        <div style={{ color: '#ff4444', fontSize: '12px', marginBottom: '4px' }}>
          ⚠️ Audio playback failed
        </div>
        <div style={{ fontSize: '10px', color: '#888', marginBottom: '8px' }}>
          Type: {type}
        </div>
        <a 
          href={src} 
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
    <div style={{ margin: '8px 0' }}>
      <audio 
        ref={audioRef}
        controls 
        preload="metadata"
        style={{ width: '100%', maxWidth: '300px' }}
      >
        <source src={src} type={type} />
        <source src={src} type="audio/mpeg" />
        <source src={src} type="audio/wav" />
        <source src={src} type="audio/ogg" />
        Your browser does not support the audio element.
      </audio>
      
      <div style={{ fontSize: '12px', color: '#888', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>🎤 Voice memo</span>
        {duration && (
          <span style={{ fontSize: '10px' }}>
            {formatDuration(duration)}
          </span>
        )}
        {isLoading && (
          <span style={{ fontSize: '10px', color: '#666' }}>
            Loading...
          </span>
        )}
      </div>
      
      <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
        <a href={src} download={name} style={{ color: '#888', textDecoration: 'none' }}>
          Download ({type})
        </a>
      </div>
    </div>
  );
};
