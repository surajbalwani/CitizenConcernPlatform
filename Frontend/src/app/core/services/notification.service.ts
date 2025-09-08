import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';

export interface NotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  silent?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  
  constructor(private swPush: SwPush) {}
  
  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }
    
    return await Notification.requestPermission();
  }
  
  /**
   * Check current notification permission status
   */
  getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }
  
  /**
   * Show a local notification
   */
  showNotification(title: string, options: NotificationOptions = {}): void {
    if (this.getPermissionStatus() !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }
    
    const defaultOptions: NotificationOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      requireInteraction: false,
      ...options
    };
    
    new Notification(title, defaultOptions);
  }
  
  /**
   * Subscribe to push notifications (requires service worker)
   */
  async subscribeToNotifications(): Promise<PushSubscription | null> {
    if (!this.swPush.isEnabled) {
      console.warn('Service worker push notifications not enabled');
      return null;
    }
    
    try {
      // Note: You need to replace this with your actual VAPID public key
      const subscription = await this.swPush.requestSubscription({
        serverPublicKey: 'YOUR_VAPID_PUBLIC_KEY_HERE'
      });
      
      // Send subscription to your backend server
      await this.sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }
  
  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromNotifications(): Promise<boolean> {
    if (!this.swPush.isEnabled) {
      return false;
    }
    
    try {
      const subscription = await this.swPush.subscription.toPromise();
      if (subscription) {
        await subscription.unsubscribe();
        // Notify your backend server about unsubscription
        await this.removeSubscriptionFromServer(subscription);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }
  
  /**
   * Listen for push notification messages
   */
  subscribeToNotificationClicks(): void {
    if (!this.swPush.isEnabled) {
      return;
    }
    
    this.swPush.messages.subscribe(message => {
      console.log('Received push message:', message);
      
      // Handle the push notification message
      if (message && typeof message === 'object' && 'title' in message) {
        const pushMessage = message as any;
        this.showNotification(pushMessage.title, {
          body: pushMessage.body || '',
          data: pushMessage.data || {},
          actions: pushMessage.actions || []
        });
      }
    });
    
    this.swPush.notificationClicks.subscribe(click => {
      console.log('Notification clicked:', click);
      
      // Handle notification click actions
      if (click.action) {
        this.handleNotificationAction(click.action, click.notification.data);
      } else {
        // Default action (notification body clicked)
        this.handleNotificationClick(click.notification.data);
      }
    });
  }
  
  /**
   * Show notification for concern updates
   */
  showConcernUpdateNotification(
    concernId: string, 
    concernTitle: string, 
    status: string, 
    message: string
  ): void {
    this.showNotification(`Concern Update: ${concernTitle}`, {
      body: `Status: ${status}\n${message}`,
      tag: `concern-${concernId}`,
      data: {
        type: 'concern-update',
        concernId: concernId,
        status: status
      },
      actions: [
        {
          action: 'view',
          title: 'View Details'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    });
  }
  
  /**
   * Show notification for new nearby concerns
   */
  showNearbyNotification(concernTitle: string, distance: string): void {
    this.showNotification('New Nearby Concern', {
      body: `${concernTitle} - ${distance} away`,
      tag: 'nearby-concern',
      data: {
        type: 'nearby-concern'
      },
      actions: [
        {
          action: 'view-nearby',
          title: 'View Nearby'
        }
      ]
    });
  }
  
  /**
   * Send subscription to server (implement according to your backend API)
   */
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save subscription on server');
      }
    } catch (error) {
      console.error('Error sending subscription to server:', error);
      throw error;
    }
  }
  
  /**
   * Remove subscription from server
   */
  private async removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove subscription from server');
      }
    } catch (error) {
      console.error('Error removing subscription from server:', error);
      throw error;
    }
  }
  
  /**
   * Handle notification action clicks
   */
  private handleNotificationAction(action: string, data: any): void {
    switch (action) {
      case 'view':
        if (data?.concernId) {
          // Navigate to concern details
          window.open(`/citizen/track?id=${data.concernId}`, '_blank');
        }
        break;
      case 'view-nearby':
        // Navigate to nearby concerns
        window.open('/citizen/nearby', '_blank');
        break;
      case 'dismiss':
        // Just dismiss the notification (no action needed)
        break;
      default:
        console.log('Unknown notification action:', action);
    }
  }
  
  /**
   * Handle default notification clicks (when body is clicked)
   */
  private handleNotificationClick(data: any): void {
    if (data?.type === 'concern-update' && data?.concernId) {
      // Navigate to concern details
      window.open(`/citizen/track?id=${data.concernId}`, '_blank');
    } else if (data?.type === 'nearby-concern') {
      // Navigate to nearby concerns
      window.open('/citizen/nearby', '_blank');
    } else {
      // Default action - open the app
      window.focus();
    }
  }
  
  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return 'Notification' in window;
  }
  
  /**
   * Check if push notifications are supported
   */
  isPushSupported(): boolean {
    return this.swPush.isEnabled;
  }
}