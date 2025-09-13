import { useRef, useCallback, useState } from 'react';
import debug from 'debug';

const log = debug('chat:notifications');

export const useNotifications = () => {
  const beepRef = useRef<(HTMLAudioElement & { playclip?: () => void }) | null>(null);
  const notificationRef = useRef<Notification | null>(null);
  const ttoutRef = useRef<NodeJS.Timeout | null>(null);
  const msgsRef = useRef(0);
  const lastSoundTimeRef = useRef<number>(0);
  const soundThrottledRef = useRef<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('chatSoundEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const createBeep = useCallback(() => {
    const audioElement = document.createElement('audio') as HTMLAudioElement & { playclip?: () => void };
    if (typeof audioElement.canPlayType === 'function') {
      const sourceElement = document.createElement('source');
      sourceElement.setAttribute('src', '/static/beep.ogg');
      sourceElement.setAttribute('type', 'audio/ogg');
      audioElement.appendChild(sourceElement);
      audioElement.load();
      
      audioElement.playclip = () => {
        audioElement.pause();
        audioElement.volume = 0.5;
        audioElement.currentTime = 0;
        const playPromise = audioElement.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            log('Error playing audio:', error);
          });
        }
      };
      
      return audioElement;
    }
    return null;
  }, []);

  const playThrottledSound = useCallback(() => {
    if (!soundEnabled) {
      log('Sound disabled, not playing');
      return;
    }
    
    const now = Date.now();
    const THROTTLE_DURATION = 60000; // 1 minute
    const MIN_SOUND_INTERVAL = 1000; // 1 second minimum between sounds
    
    log('Sound check:', {
      now,
      lastSoundTime: lastSoundTimeRef.current,
      timeSinceLastSound: now - lastSoundTimeRef.current,
      throttleDuration: THROTTLE_DURATION,
      minInterval: MIN_SOUND_INTERVAL,
      soundThrottled: soundThrottledRef.current
    });
    
    // Check if we're currently throttled
    if (soundThrottledRef.current) {
      log('Sound throttled: currently in throttle period');
      return;
    }
    
    // Check minimum interval between sounds
    const timeSinceLastSound = now - lastSoundTimeRef.current;
    if (timeSinceLastSound < MIN_SOUND_INTERVAL) {
      log('Sound throttled: too soon since last sound', timeSinceLastSound, 'ms');
      return; // Too soon since last sound
    }
    
    // Play the sound
    if (beepRef.current && beepRef.current.playclip) {
      log('Playing notification sound at', now);
      beepRef.current.playclip();
      lastSoundTimeRef.current = now;
      soundThrottledRef.current = true;
      
      // Set a timeout to reset the throttle after 1 minute
      setTimeout(() => {
        log('Resetting sound throttle after 1 minute');
        soundThrottledRef.current = false;
      }, THROTTLE_DURATION);
    } else {
      log('No beep ref or playclip function available');
    }
  }, [soundEnabled]);

  const toggleSound = useCallback(() => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    localStorage.setItem('chatSoundEnabled', JSON.stringify(newSoundEnabled));
  }, [soundEnabled]);

  const setFavicon = useCallback((color: string) => {
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.setAttribute('type', 'image/x-icon');
    link.setAttribute('rel', 'shortcut icon');
    link.setAttribute('href', `/static/images/favicon-${color}.ico`);
    document.getElementsByTagName('head')[0].appendChild(link);
  }, []);

  const clearNotification = useCallback(() => {
    if (notificationRef.current) {
      notificationRef.current.close();
      notificationRef.current = null;
    }
  }, []);

  const createNotification = useCallback((from: string, message: any, isFocused: boolean, enabled: boolean) => {
    if (isFocused || !enabled) return;

    msgsRef.current++;
    setFavicon('blue');
    document.title = `(${msgsRef.current}) New messages...`;

    if (!ttoutRef.current) {
      ttoutRef.current = setInterval(() => {
        if (document.title === 'Chat') {
          setFavicon('blue');
          document.title = `(${msgsRef.current}) New messages...`;
        } else {
          setFavicon('green');
          document.title = 'Chat';
        }
      }, 1500);
    }

    playThrottledSound();

    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
      return;
    }

    clearNotification();

    const cleanFrom = from.replace(/(<([^>]+)>)/ig, '');
    const cleanMessage = message.text?.replace(/(<([^>]+)>)/ig, '') || '';

    notificationRef.current = new Notification(cleanFrom, {
      icon: '/static/images/favicon-blue.png',
      body: cleanMessage,
    });

    notificationRef.current.onclick = () => {
      window.parent.focus();
      window.focus();
    };
  }, [setFavicon, clearNotification, playThrottledSound]);

  const resetSoundThrottling = useCallback(() => {
    // Reset sound throttling when user focuses the window
    log('Resetting sound throttling');
    lastSoundTimeRef.current = 0; // Reset last sound time to allow immediate sound
    soundThrottledRef.current = false; // Reset throttle flag
  }, []);

  const clearAll = useCallback(() => {
    clearNotification();
    if (ttoutRef.current) {
      clearInterval(ttoutRef.current);
      ttoutRef.current = null;
    }
    msgsRef.current = 0;
    setFavicon('green');
    document.title = 'Chat';
    // Don't reset sound throttling here - only reset on explicit focus
  }, [clearNotification, setFavicon]);

  const init = useCallback(() => {
    beepRef.current = createBeep();
    setFavicon('red');
  }, [createBeep, setFavicon]);

  return {
    createNotification,
    clearAll,
    init,
    soundEnabled,
    toggleSound,
    resetSoundThrottling,
  };
};