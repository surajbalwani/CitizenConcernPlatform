import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UserResponse } from './core/models/api.models';
import { AuthService } from './core/services/auth.service';
import { LayoutService } from './core/services/layout.service';
import { NotificationService } from './core/services/notification.service';
import { OfflineDataService } from './core/services/offline-data.service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatSnackBarModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  currentUser: UserResponse | null = null;

  constructor(
    private notificationService: NotificationService,
    private offlineDataService: OfflineDataService,
    private layoutService: LayoutService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    //this.initializePWAFeatures();
    //this.setupOfflineSync();
    //this.setupNotifications();
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
      .subscribe((isOnline) => {
        if (isOnline) {
          this.snackBar.open('✅ Back online! Syncing data...', 'Close', {
            duration: 3000,
          });
        } else {
          this.snackBar.open('📱 Working offline', 'Close', {
            duration: 3000,
          });
        }
      });

    // Monitor sync status
    this.offlineDataService.syncStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe((status) => {
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
          duration: 3000,
        });
        // Subscribe to push notifications
        await this.notificationService.subscribeToNotifications();
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
  }

  private loadCurrentUser() {
    this.currentUser = this.authService.getCurrentUser();
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  getUserDisplayName(): string {
    if (this.currentUser) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }
    return 'User';
  }

  getRoleDisplayName(): string {
    if (this.currentUser) {
      switch (this.currentUser.role) {
        case 1:
          return 'Citizen';
        case 2:
          return 'Officer';
        case 3:
          return 'Department Head';
        case 4:
          return 'Admin';
        case 5:
          return 'Super Admin';
        default:
          return 'User';
      }
    }
    return 'User';
  }

  getAppTitle(): string {
    if (!this.isLoggedIn()) {
      return 'Citizen Sphere';
    }

    const role = this.getRoleDisplayName();
    return `Citizen Sphere - ${role} Portal`;
  }

  showLayout(): boolean {
    // Only show the layout (toolbar + sidebar) if user is logged in
    return this.isLoggedIn();
  }

  navigateToProfile() {
    if (!this.currentUser) return;

    switch (this.currentUser.role) {
      case 1: // Citizen
        this.router.navigate(['/citizen/profile']);
        break;
      case 2: // Officer
      case 3: // Department Head
        this.router.navigate(['/officer/profile']);
        break;
      case 4: // Admin
      case 5: // Super Admin
        this.router.navigate(['/admin/profile']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }

  openSettings() {
    this.snackBar.open('Settings feature coming soon!', 'Close', {
      duration: 3000,
    });
  }

  logout() {
    this.authService.logout();
    this.currentUser = null;
    this.router.navigate(['/auth/login']);
    this.snackBar.open('Successfully logged out', 'Close', {
      duration: 3000,
    });
  }
}
