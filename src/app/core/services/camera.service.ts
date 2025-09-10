import { Injectable } from '@angular/core';

export interface CameraResult {
  dataUrl: string;
  blob: Blob;
}

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  
  /**
   * Capture photo using device camera
   * Uses WebRTC MediaDevices API to access camera
   */
  async capturePhoto(): Promise<CameraResult> {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use rear camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.style.display = 'none';
      document.body.appendChild(video);
      
      // Start video playback
      await video.play();
      
      return new Promise<CameraResult>((resolve, reject) => {
        video.onloadedmetadata = () => {
          // Create canvas to capture frame
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          // Set canvas size to video dimensions
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Draw current video frame to canvas
          context.drawImage(video, 0, 0);
          
          // Convert to blob and data URL
          canvas.toBlob((blob) => {
            if (blob) {
              const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
              
              // Clean up
              stream.getTracks().forEach(track => track.stop());
              document.body.removeChild(video);
              
              resolve({ dataUrl, blob });
            } else {
              reject(new Error('Failed to capture image'));
            }
          }, 'image/jpeg', 0.8);
        };
        
        video.onerror = () => {
          reject(new Error('Video element error'));
        };
      });
    } catch (error) {
      throw new Error(`Camera access denied or not available: ${error}`);
    }
  }
  
  /**
   * Check if camera is available
   */
  async isCameraAvailable(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'videoinput');
    } catch {
      return false;
    }
  }
  
  /**
   * Request camera permissions
   */
  async requestCameraPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch {
      return false;
    }
  }
}