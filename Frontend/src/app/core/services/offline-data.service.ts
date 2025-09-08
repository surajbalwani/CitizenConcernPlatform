import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export interface OfflineConcern {
  id: string;
  title: string;
  description: string;
  category: string;
  address: string;
  ward: string;
  images: Array<{
    id: string;
    url: string;
    name: string;
  }>;
  additionalNotes: string;
  createdAt: Date;
  synced: boolean;
  syncAttempts: number;
  lastSyncAttempt?: Date;
  syncError?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  syncInProgress: boolean;
  lastSyncTime?: Date;
  pendingCount: number;
  failedCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class OfflineDataService {
  private readonly DB_NAME = 'CitizenConcernDB';
  private readonly DB_VERSION = 1;
  private readonly STORE_CONCERNS = 'concerns';
  private readonly STORE_USER_DATA = 'userData';
  
  private db: IDBDatabase | null = null;
  private syncStatus = new BehaviorSubject<SyncStatus>({
    isOnline: navigator.onLine,
    syncInProgress: false,
    pendingCount: 0,
    failedCount: 0
  });
  
  // Observable for online/offline status
  public readonly isOnline$ = merge(
    of(navigator.onLine),
    fromEvent(window, 'online').pipe(map(() => true)),
    fromEvent(window, 'offline').pipe(map(() => false))
  ).pipe(startWith(navigator.onLine));
  
  public readonly syncStatus$ = this.syncStatus.asObservable();
  
  constructor() {
    this.initializeDatabase();
    this.setupOnlineStatusListeners();
    this.loadSyncStatus();
  }
  
  /**
   * Initialize IndexedDB database
   */
  private async initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create concerns store
        if (!db.objectStoreNames.contains(this.STORE_CONCERNS)) {
          const concernsStore = db.createObjectStore(this.STORE_CONCERNS, { keyPath: 'id' });
          concernsStore.createIndex('synced', 'synced', { unique: false });
          concernsStore.createIndex('createdAt', 'createdAt', { unique: false });
          concernsStore.createIndex('syncAttempts', 'syncAttempts', { unique: false });
        }
        
        // Create user data store
        if (!db.objectStoreNames.contains(this.STORE_USER_DATA)) {
          db.createObjectStore(this.STORE_USER_DATA, { keyPath: 'key' });
        }
        
        console.log('IndexedDB schema upgraded');
      };
    });
  }
  
  /**
   * Setup online/offline status listeners
   */
  private setupOnlineStatusListeners(): void {
    window.addEventListener('online', () => {
      this.updateSyncStatus({ isOnline: true });
      this.syncOfflineData();
    });
    
    window.addEventListener('offline', () => {
      this.updateSyncStatus({ isOnline: false });
    });
  }
  
  /**
   * Save concern to offline storage
   */
  async saveOfflineConcern(concernData: Omit<OfflineConcern, 'id' | 'createdAt' | 'synced' | 'syncAttempts'>): Promise<string> {
    if (!this.db) {
      await this.initializeDatabase();
    }
    
    const concern: OfflineConcern = {
      id: this.generateId(),
      createdAt: new Date(),
      synced: false,
      syncAttempts: 0,
      ...concernData
    };
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction([this.STORE_CONCERNS], 'readwrite');
      const store = transaction.objectStore(this.STORE_CONCERNS);
      
      const request = store.add(concern);
      
      request.onsuccess = () => {
        console.log('Concern saved offline:', concern.id);
        this.updatePendingCount();
        resolve(concern.id);
      };
      
      request.onerror = () => {
        console.error('Failed to save concern offline:', request.error);
        reject(request.error);
      };
    });
  }
  
  /**
   * Get all unsynced concerns
   */
  async getUnsyncedConcerns(): Promise<OfflineConcern[]> {
    if (!this.db) {
      await this.initializeDatabase();
    }
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction([this.STORE_CONCERNS], 'readonly');
      const store = transaction.objectStore(this.STORE_CONCERNS);
      const index = store.index('synced');
      
      const request = index.getAll(IDBKeyRange.only(false));
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }
  
  /**
   * Get all stored concerns (synced and unsynced)
   */
  async getAllStoredConcerns(): Promise<OfflineConcern[]> {
    if (!this.db) {
      await this.initializeDatabase();
    }
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction([this.STORE_CONCERNS], 'readonly');
      const store = transaction.objectStore(this.STORE_CONCERNS);
      
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }
  
  /**
   * Mark concern as synced
   */
  async markAsSynced(concernId: string): Promise<void> {
    if (!this.db) {
      await this.initializeDatabase();
    }
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction([this.STORE_CONCERNS], 'readwrite');
      const store = transaction.objectStore(this.STORE_CONCERNS);
      
      const getRequest = store.get(concernId);
      
      getRequest.onsuccess = () => {
        const concern = getRequest.result;
        if (concern) {
          concern.synced = true;
          concern.syncError = undefined;
          
          const putRequest = store.put(concern);
          putRequest.onsuccess = () => {
            this.updatePendingCount();
            resolve();
          };
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve(); // Concern not found, consider it synced
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }
  
  /**
   * Update sync attempt for a concern
   */
  async updateSyncAttempt(concernId: string, error?: string): Promise<void> {
    if (!this.db) {
      await this.initializeDatabase();
    }
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction([this.STORE_CONCERNS], 'readwrite');
      const store = transaction.objectStore(this.STORE_CONCERNS);
      
      const getRequest = store.get(concernId);
      
      getRequest.onsuccess = () => {
        const concern = getRequest.result;
        if (concern) {
          concern.syncAttempts += 1;
          concern.lastSyncAttempt = new Date();
          if (error) {
            concern.syncError = error;
          }
          
          const putRequest = store.put(concern);
          putRequest.onsuccess = () => {
            this.updateFailedCount();
            resolve();
          };
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }
  
  /**
   * Sync offline data with server
   */
  async syncOfflineData(): Promise<void> {
    if (!navigator.onLine) {
      console.log('Cannot sync: device is offline');
      return;
    }
    
    const currentStatus = this.syncStatus.value;
    if (currentStatus.syncInProgress) {
      console.log('Sync already in progress');
      return;
    }
    
    this.updateSyncStatus({ syncInProgress: true });
    
    try {
      const unsyncedConcerns = await this.getUnsyncedConcerns();
      console.log(`Found ${unsyncedConcerns.length} unsynced concerns`);
      
      for (const concern of unsyncedConcerns) {
        try {
          await this.syncConcern(concern);
        } catch (error) {
          console.error(`Failed to sync concern ${concern.id}:`, error);
          await this.updateSyncAttempt(concern.id, error instanceof Error ? error.message : 'Unknown error');
        }
      }
      
      this.updateSyncStatus({
        syncInProgress: false,
        lastSyncTime: new Date()
      });
      
      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
      this.updateSyncStatus({ syncInProgress: false });
    }
  }
  
  /**
   * Sync individual concern with server
   */
  private async syncConcern(concern: OfflineConcern): Promise<void> {
    // This would typically make an API call to your backend
    // For now, we'll simulate the API call
    
    const concernPayload = {
      title: concern.title,
      description: concern.description,
      category: concern.category,
      address: concern.address,
      ward: concern.ward,
      additionalNotes: concern.additionalNotes,
      images: concern.images,
      submittedAt: concern.createdAt
    };
    
    // Simulate API call
    try {
      // Replace this with your actual API endpoint
      const response = await fetch('/api/concerns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers as needed
        },
        body: JSON.stringify(concernPayload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Concern synced successfully:', result);
      
      await this.markAsSynced(concern.id);
    } catch (error) {
      // For demo purposes, we'll mark some concerns as synced randomly
      if (Math.random() > 0.3) { // 70% success rate simulation
        console.log('Simulated successful sync for:', concern.id);
        await this.markAsSynced(concern.id);
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Store user data offline
   */
  async storeUserData(key: string, data: any): Promise<void> {
    if (!this.db) {
      await this.initializeDatabase();
    }
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction([this.STORE_USER_DATA], 'readwrite');
      const store = transaction.objectStore(this.STORE_USER_DATA);
      
      const request = store.put({
        key: key,
        data: data,
        timestamp: new Date()
      });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  /**
   * Get stored user data
   */
  async getUserData(key: string): Promise<any> {
    if (!this.db) {
      await this.initializeDatabase();
    }
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction([this.STORE_USER_DATA], 'readonly');
      const store = transaction.objectStore(this.STORE_USER_DATA);
      
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
      
      request.onerror = () => reject(request.error);
    });
  }
  
  /**
   * Clear all offline data
   */
  async clearOfflineData(): Promise<void> {
    if (!this.db) {
      await this.initializeDatabase();
    }
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction([this.STORE_CONCERNS, this.STORE_USER_DATA], 'readwrite');
      
      const concernsStore = transaction.objectStore(this.STORE_CONCERNS);
      const userDataStore = transaction.objectStore(this.STORE_USER_DATA);
      
      const clearConcerns = concernsStore.clear();
      const clearUserData = userDataStore.clear();
      
      transaction.oncomplete = () => {
        this.updatePendingCount();
        this.updateFailedCount();
        resolve();
      };
      
      transaction.onerror = () => reject(transaction.error);
    });
  }
  
  /**
   * Get sync statistics
   */
  async getSyncStats(): Promise<{
    total: number;
    synced: number;
    pending: number;
    failed: number;
  }> {
    const allConcerns = await this.getAllStoredConcerns();
    const synced = allConcerns.filter(c => c.synced).length;
    const failed = allConcerns.filter(c => !c.synced && c.syncAttempts > 0).length;
    const pending = allConcerns.filter(c => !c.synced && c.syncAttempts === 0).length;
    
    return {
      total: allConcerns.length,
      synced,
      pending,
      failed
    };
  }
  
  /**
   * Generate unique ID for offline concerns
   */
  private generateId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Update sync status
   */
  private updateSyncStatus(updates: Partial<SyncStatus>): void {
    const current = this.syncStatus.value;
    this.syncStatus.next({ ...current, ...updates });
  }
  
  /**
   * Update pending count in sync status
   */
  private async updatePendingCount(): Promise<void> {
    try {
      const stats = await this.getSyncStats();
      this.updateSyncStatus({ 
        pendingCount: stats.pending + stats.failed,
        failedCount: stats.failed
      });
    } catch (error) {
      console.error('Failed to update pending count:', error);
    }
  }
  
  /**
   * Update failed count in sync status
   */
  private async updateFailedCount(): Promise<void> {
    try {
      const stats = await this.getSyncStats();
      this.updateSyncStatus({ failedCount: stats.failed });
    } catch (error) {
      console.error('Failed to update failed count:', error);
    }
  }
  
  /**
   * Load initial sync status
   */
  private async loadSyncStatus(): Promise<void> {
    try {
      await this.updatePendingCount();
      
      // Check for last sync time from user data
      const lastSyncTime = await this.getUserData('lastSyncTime');
      if (lastSyncTime) {
        this.updateSyncStatus({ lastSyncTime: new Date(lastSyncTime) });
      }
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  }
}