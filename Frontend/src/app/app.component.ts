import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NotificationService } from './core/services/notification.service';
import { OfflineDataService } from './core/services/offline-data.service';
import { LayoutService } from './core/services/layout.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private offlineDataService: OfflineDataService,
    private layoutService: LayoutService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.initializePWAFeatures();
    this.setupOfflineSync();
    this.setupNotifications();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializePWAFeatures() {
    // Initialize PWA features like notifications, offline sync, etc.
    console.log('Initializing PWA features...');
  }

  private setupOfflineSync() {
    // Monitor online/offline status
    this.offlineDataService.isOnline$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOnline => {
        if (isOnline) {
          this.snackBar.open('✅ Back online! Syncing data...', 'Close', {
            duration: 3000
          });
        } else {
          this.snackBar.open('📱 Working offline', 'Close', {
            duration: 3000
          });
        }
      });

    // Monitor sync status
    this.offlineDataService.syncStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        if (status.pendingCount > 0) {
          console.log(`${status.pendingCount} items pending sync`);
        }
      });
  }

  private setupNotifications() {
    // Setup push notifications
    this.notificationService.subscribeToNotificationClicks();

    // Request permission if not already granted
    if (this.notificationService.getPermissionStatus() === 'default') {
      setTimeout(() => {
        this.requestNotificationPermission();
      }, 2000); // Wait a bit before asking
    }
  }

  private async requestNotificationPermission() {
    try {
      const permission = await this.notificationService.requestPermission();
      if (permission === 'granted') {
        this.snackBar.open('🔔 Notifications enabled!', 'Close', {
          duration: 3000
        });
        // Subscribe to push notifications
        await this.notificationService.subscribeToNotifications();
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
  }
}
