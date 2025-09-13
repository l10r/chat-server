import { useRef, useCallback, useState } from 'react';

export const useNotifications = () => {
  const beepRef = useRef<(HTMLAudioElement & { playclip?: () => void }) | null>(null);
  const notificationRef = useRef<Notification | null>(null);
  const ttoutRef = useRef<NodeJS.Timeout | null>(null);
  const msgsRef = useRef(0);
  const lastSoundTimeRef = useRef<number>(0);
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
            console.error('Error playing audio:', error);
          });
        }
      };
      
      return audioElement;
    }
    return null;
  }, []);

  const playDebouncedSound = useCallback(() => {
    if (!soundEnabled) return;
    
    const now = Date.now();
    const timeSinceLastSound = now - lastSoundTimeRef.current;
    const DEBOUNCE_DELAY = 1000; // 1 second debounce
    
    if (timeSinceLastSound >= DEBOUNCE_DELAY) {
      if (beepRef.current && beepRef.current.playclip) {
        beepRef.current.playclip();
        lastSoundTimeRef.current = now;
      }
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

    playDebouncedSound();

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
  }, [setFavicon, clearNotification]);

  const clearAll = useCallback(() => {
    clearNotification();
    if (ttoutRef.current) {
      clearInterval(ttoutRef.current);
      ttoutRef.current = null;
    }
    msgsRef.current = 0;
    setFavicon('green');
    document.title = 'Chat';
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
  };
};