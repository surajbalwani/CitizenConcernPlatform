import { Injectable } from '@angular/core';

export interface Position {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  
  /**
   * Get current position using HTML5 Geolocation API
   */
  async getCurrentPosition(options: LocationOptions = {}): Promise<Position> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }
      
      const defaultOptions: LocationOptions = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds
        maximumAge: 60000 // 1 minute
      };
      
      const finalOptions = { ...defaultOptions, ...options };
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed
          });
        },
        (error) => {
          let errorMessage = 'Unknown location error';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          reject(new Error(errorMessage));
        },
        finalOptions
      );
    });
  }
  
  /**
   * Watch position changes
   * Returns a watch ID that can be used to clear the watch
   */
  watchPosition(
    callback: (position: Position) => void,
    errorCallback: (error: Error) => void,
    options: LocationOptions = {}
  ): number {
    if (!navigator.geolocation) {
      errorCallback(new Error('Geolocation not supported'));
      return -1;
    }
    
    const defaultOptions: LocationOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    return navigator.geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed
        });
      },
      (error) => {
        let errorMessage = 'Unknown location error';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        errorCallback(new Error(errorMessage));
      },
      finalOptions
    );
  }
  
  /**
   * Clear position watch
   */
  clearWatch(watchId: number): void {
    navigator.geolocation.clearWatch(watchId);
  }
  
  /**
   * Reverse geocode coordinates to address
   * Uses OpenStreetMap Nominatim service (free)
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'CitizenConcernPlatform/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }
      
      const data = await response.json();
      
      if (data && data.display_name) {
        return data.display_name;
      } else {
        return `${latitude}, ${longitude}`;
      }
    } catch (error) {
      console.warn('Geocoding failed, using coordinates:', error);
      return `${latitude}, ${longitude}`;
    }
  }
  
  /**
   * Forward geocode address to coordinates
   */
  async geocodeAddress(address: string): Promise<Position | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'CitizenConcernPlatform/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          accuracy: 10000 // Estimated accuracy for geocoded addresses
        };
      }
      
      return null;
    } catch (error) {
      console.warn('Address geocoding failed:', error);
      return null;
    }
  }
  
  /**
   * Calculate distance between two coordinates (in kilometers)
   */
  calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
  }
  
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
  
  /**
   * Check if geolocation is available
   */
  isGeolocationAvailable(): boolean {
    return 'geolocation' in navigator;
  }
}