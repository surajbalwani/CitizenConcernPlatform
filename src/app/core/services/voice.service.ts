import { Injectable } from '@angular/core';

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface VoiceOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

@Injectable({
  providedIn: 'root'
})
export class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  
  constructor() {
    this.initializeSpeechRecognition();
  }
  
  private initializeSpeechRecognition(): void {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.setupDefaultSettings();
    }
  }
  
  private setupDefaultSettings(): void {
    if (!this.recognition) return;
    
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;
  }
  
  /**
   * Start voice recognition
   */
  async startListening(options: VoiceOptions = {}): Promise<string> {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported in this browser');
    }
    
    if (this.isListening) {
      throw new Error('Voice recognition is already active');
    }
    
    // Apply options
    this.recognition.lang = options.language || 'en-US';
    this.recognition.continuous = options.continuous || false;
    this.recognition.interimResults = options.interimResults || true;
    this.recognition.maxAlternatives = options.maxAlternatives || 1;
    
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not available'));
        return;
      }
      
      let finalTranscript = '';
      
      this.recognition.onstart = () => {
        this.isListening = true;
        console.log('Voice recognition started');
      };
      
      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // For continuous mode, we might want to handle interim results differently
        if (options.continuous && interimTranscript) {
          console.log('Interim result:', interimTranscript);
        }
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
        console.log('Voice recognition ended');
        resolve(finalTranscript);
      };
      
      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        this.isListening = false;
        let errorMessage = 'Speech recognition error';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech was detected';
            break;
          case 'audio-capture':
            errorMessage = 'No microphone was found';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission was denied';
            break;
          case 'network':
            errorMessage = 'Network error occurred';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service not allowed';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        reject(new Error(errorMessage));
      };
      
      try {
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        reject(new Error(`Failed to start speech recognition: ${error}`));
      }
    });
  }
  
  /**
   * Stop voice recognition
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }
  
  /**
   * Abort voice recognition
   */
  abortListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.abort();
      this.isListening = false;
    }
  }
  
  /**
   * Check if voice recognition is currently active
   */
  getIsListening(): boolean {
    return this.isListening;
  }
  
  /**
   * Check if speech recognition is supported
   */
  isSupported(): boolean {
    return this.recognition !== null;
  }
  
  /**
   * Get supported languages (browser-dependent)
   */
  getSupportedLanguages(): string[] {
    // This is a common set of languages supported by most browsers
    return [
      'en-US', 'en-GB', 'en-AU', 'en-CA', 'en-IN',
      'es-ES', 'es-MX', 'fr-FR', 'de-DE', 'it-IT',
      'pt-BR', 'ru-RU', 'ja-JP', 'ko-KR', 'zh-CN',
      'hi-IN', 'ar-SA', 'nl-NL', 'sv-SE', 'no-NO'
    ];
  }
  
  /**
   * Request microphone permission
   */
  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Text-to-Speech functionality
   */
  speak(text: string, options: { lang?: string; rate?: number; pitch?: number; volume?: number } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Text-to-speech not supported'));
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.lang = options.lang || 'en-US';
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;
      
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Text-to-speech error: ${event.error}`));
      
      speechSynthesis.speak(utterance);
    });
  }
  
  /**
   * Stop current speech synthesis
   */
  stopSpeaking(): void {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }
}

// Type declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}