import debug from 'debug';

const log = debug('chat:voice-memo');

export interface VoiceMemoData {
  type: string;
  url: string;
  name: string;
  blob: Blob;
  duration?: number;
}

export class VoiceMemoRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private recordingStartTime: number = 0;

  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      this.audioChunks = [];
      
      // Try different audio formats for better compatibility
      // Prioritize formats that work across browsers
      const supportedFormats = [
        'audio/webm;codecs=opus',  // Chrome preferred
        'audio/webm',              // Firefox fallback
        'audio/mp4;codecs=mp4a.40.2', // Safari/Edge
        'audio/mp4',
        'audio/ogg;codecs=opus',   // Firefox preferred
        'audio/ogg',
        'audio/wav'                // Universal fallback
      ];
      
      let mimeType = 'audio/webm;codecs=opus'; // Default
      for (const format of supportedFormats) {
        if (MediaRecorder.isTypeSupported(format)) {
          mimeType = format;
          log('Using audio format:', mimeType);
          break;
        }
      }
      
      // Force a more compatible format for cross-browser playback
      // If we're in Firefox, prefer formats that Chrome can also play
      const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
      if (isFirefox) {
        // Try to use a format that works in both browsers
        const crossBrowserFormats = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/mp4;codecs=mp4a.40.2',
          'audio/mp4'
        ];
        
        for (const format of crossBrowserFormats) {
          if (MediaRecorder.isTypeSupported(format)) {
            mimeType = format;
            log('Firefox: Using cross-browser compatible format:', mimeType);
            break;
          }
        }
      }
      
      log('Browser audio support check:', {
        'audio/webm;codecs=opus': MediaRecorder.isTypeSupported('audio/webm;codecs=opus'),
        'audio/webm': MediaRecorder.isTypeSupported('audio/webm'),
        'audio/mp4': MediaRecorder.isTypeSupported('audio/mp4'),
        'audio/ogg': MediaRecorder.isTypeSupported('audio/ogg'),
        'audio/wav': MediaRecorder.isTypeSupported('audio/wav'),
        'isFirefox': isFirefox,
        'selectedFormat': mimeType
      });
      
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: mimeType
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // Collect data every 100ms
      this.recordingStartTime = Date.now();
      
    } catch (error) {
      log('Error starting voice recording:', error);
      throw new Error('Could not access microphone. Please check permissions.');
    }
  }

  stopRecording(): VoiceMemoData {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      throw new Error('No active recording to stop');
    }

    this.mediaRecorder.stop();
    const duration = Date.now() - this.recordingStartTime;
    
    // Clean up stream
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }

    // Use the actual MIME type from the recorder
    const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
    const fileExtension = mimeType.includes('mp4') ? 'm4a' : 
                         mimeType.includes('wav') ? 'wav' : 'webm';
    
    // Create blob with the correct MIME type
    const audioBlob = new Blob(this.audioChunks, { type: mimeType });
    const audioUrl = URL.createObjectURL(audioBlob);
    
    const voiceMemo: VoiceMemoData = {
      type: mimeType,
      url: audioUrl,
      name: `voice-memo-${Date.now()}.${fileExtension}`,
      blob: audioBlob,
      duration: Math.round(duration / 1000) // Convert to seconds
    };

    log('Voice memo created:', {
      size: audioBlob.size,
      type: audioBlob.type,
      mimeType: mimeType,
      duration: voiceMemo.duration,
      url: audioUrl
    });

    return voiceMemo;
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }
}

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
