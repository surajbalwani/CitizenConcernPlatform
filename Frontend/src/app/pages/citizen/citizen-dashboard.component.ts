import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LayoutService } from '../../core/services/layout.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Concern, ConcernStatus, ConcernAnalytics } from '../../core/models/api.models';

interface DashboardStats {
  totalSubmitted: number;
  inProgress: number;
  resolved: number;
  pending: number;
}

@Component({
  selector: 'app-citizen-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatBadgeModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="dashboard-container" [class.mobile-layout]="layoutService.isMobile()">
      <div class="header-section">
        <h1>{{ getWelcomeMessage() }}</h1>
        <p class="subtitle">Track and manage your community concerns</p>
      </div>

      <!-- Loading Spinner -->
      @if (isLoading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading dashboard data...</p>
        </div>
      }

      <!-- Quick Actions -->
      <div class="quick-actions">
        <button mat-raised-button color="primary" [routerLink]="['/citizen/submit']" class="action-button">
          <mat-icon>add_circle</mat-icon>
          Submit New Concern
        </button>
        
        <button mat-raised-button color="accent" [routerLink]="['/citizen/nearby']" class="action-button">
          <mat-icon>location_on</mat-icon>
          Nearby Concerns
        </button>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon" color="primary">receipt</mat-icon>
              <div class="stat-details">
                <h3>{{stats().totalSubmitted}}</h3>
                <p>Total Submitted</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon" color="warn">schedule</mat-icon>
              <div class="stat-details">
                <h3>{{stats().inProgress}}</h3>
                <p>In Progress</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon" style="color: green;">check_circle</mat-icon>
              <div class="stat-details">
                <h3>{{stats().resolved}}</h3>
                <p>Resolved</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon" color="accent">pending</mat-icon>
              <div class="stat-details">
                <h3>{{stats().pending}}</h3>
                <p>Pending</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Recent Concerns -->
      <mat-card class="recent-concerns">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>history</mat-icon>
            Recent Concerns
          </mat-card-title>
          <mat-card-subtitle>Your latest submissions</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          @if (isLoading()) {
            <div class="loading-container">
              <mat-spinner diameter="30"></mat-spinner>
              <p>Loading recent concerns...</p>
            </div>
          } @else if (recentConcerns().length === 0) {
            <div class="empty-state">
              <mat-icon>inbox</mat-icon>
              <p>No concerns submitted yet</p>
              <button mat-raised-button color="primary" [routerLink]="['/citizen/submit']">
                Submit Your First Concern
              </button>
            </div>
          } @else {
            <div class="concerns-list">
              @for (concern of recentConcerns(); track concern.id) {
                <div class="concern-item" [routerLink]="['/citizen/track', concern.id]">
                  <div class="concern-header">
                    <h4>{{concern.title}}</h4>
                    <mat-chip [class]="getStatusClass(getStatusDisplayName(concern.status))">
                      {{getStatusDisplayName(concern.status)}}
                    </mat-chip>
                  </div>
                  
                  <div class="concern-meta">
                    <span class="category">
                      <mat-icon>category</mat-icon>
                      {{concern.category}}
                    </span>
                    <span class="date">
                      <mat-icon>schedule</mat-icon>
                      {{formatDate(concern.createdAt)}}
                    </span>
                  </div>
                  
                  <div class="concern-priority">
                    <mat-chip [class]="getPriorityClass(getPriorityDisplayName(concern.priority))">
                      {{getPriorityDisplayName(concern.priority)}} Priority
                    </mat-chip>
                  </div>

                  <div class="concern-votes">
                    <span class="vote-count">
                      <mat-icon>thumb_up</mat-icon>
                      {{concern.upVotes}}
                    </span>
                    <span class="vote-count">
                      <mat-icon>thumb_down</mat-icon>
                      {{concern.downVotes}}
                    </span>
                  </div>
                </div>
              }
            </div>
          }
        </mat-card-content>
        
        <mat-card-actions>
          <button mat-button [routerLink]="['/citizen/track']">
            View All Concerns
            <mat-icon>arrow_forward</mat-icon>
          </button>
        </mat-card-actions>
      </mat-card>

      <!-- Offline Status -->
      @if (isOffline()) {
        <mat-card class="offline-banner">
          <mat-card-content>
            <div class="offline-content">
              <mat-icon>cloud_off</mat-icon>
              <div>
                <h4>Working Offline</h4>
                <p>Your submissions will sync when connection is restored</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 16px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .mobile-layout {
      padding: 8px;
    }
    
    .header-section {
      text-align: center;
      margin-bottom: 32px;
    }
    
    .header-section h1 {
      color: #1976d2;
      margin-bottom: 8px;
      font-size: 2.2rem;
    }
    
    .subtitle {
      color: #666;
      font-size: 1.1rem;
    }
    
    .quick-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-bottom: 32px;
      flex-wrap: wrap;
    }
    
    .action-button {
      min-width: 180px;
      height: 56px;
      font-size: 1.1rem;
    }
    
    .action-button mat-icon {
      margin-right: 8px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }
    
    .stat-card {
      transition: transform 0.2s ease;
      cursor: pointer;
    }
    
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    
    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .stat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
    }
    
    .stat-details h3 {
      margin: 0;
      font-size: 2rem;
      font-weight: bold;
    }
    
    .stat-details p {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 0.9rem;
    }
    
    .recent-concerns {
      margin-bottom: 24px;
    }
    
    .recent-concerns mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .empty-state {
      text-align: center;
      padding: 48px 16px;
      color: #666;
    }
    
    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }
    
    .concerns-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .concern-item {
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .concern-item:hover {
      border-color: #1976d2;
      box-shadow: 0 2px 4px rgba(25, 118, 210, 0.2);
    }
    
    .concern-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    
    .concern-header h4 {
      margin: 0;
      color: #333;
      flex: 1;
      margin-right: 16px;
    }
    
    .concern-meta {
      display: flex;
      gap: 16px;
      margin-bottom: 8px;
      font-size: 0.9rem;
      color: #666;
    }
    
    .concern-meta span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .concern-meta mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    
    .concern-priority {
      margin-top: 8px;
    }
    
    /* Status Colors */
    .status-pending { background-color: #fff3e0; color: #ef6c00; }
    .status-in-progress { background-color: #e3f2fd; color: #1976d2; }
    .status-resolved { background-color: #e8f5e8; color: #2e7d32; }
    .status-closed { background-color: #f5f5f5; color: #757575; }
    
    /* Priority Colors */
    .priority-high { background-color: #ffebee; color: #d32f2f; }
    .priority-medium { background-color: #fff3e0; color: #f57c00; }
    .priority-low { background-color: #e8f5e8; color: #388e3c; }
    
    .offline-banner {
      margin-top: 16px;
      background-color: #fff3e0;
      border: 1px solid #ffcc02;
    }
    
    .offline-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .offline-content mat-icon {
      color: #f57c00;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }
    
    .offline-content h4 {
      margin: 0;
      color: #ef6c00;
    }
    
    .offline-content p {
      margin: 4px 0 0 0;
      color: #bf6000;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 16px;
      color: #666;
    }
    
    .loading-container p {
      margin-top: 16px;
      font-size: 1rem;
    }
    
    .concern-votes {
      display: flex;
      gap: 16px;
      margin-top: 8px;
      font-size: 0.9rem;
      color: #666;
    }
    
    .vote-count {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .vote-count mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    
    @media (max-width: 600px) {
      .header-section h1 {
        font-size: 1.8rem;
      }
      
      .quick-actions {
        flex-direction: column;
        align-items: center;
      }
      
      .action-button {
        width: 100%;
        max-width: 300px;
      }
      
      .stats-grid {
        grid-template-columns: 1fr 1fr;
      }
      
      .concern-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      
      .concern-meta {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class CitizenDashboardComponent implements OnInit {
  stats = signal<DashboardStats>({
    totalSubmitted: 0,
    inProgress: 0,
    resolved: 0,
    pending: 0
  });

  recentConcerns = signal<Concern[]>([]);
  isOffline = signal(false);
  isLoading = signal(true);
  errorMessage = signal('');

  constructor(
    public layoutService: LayoutService,
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
    this.checkOfflineStatus();
  }

  private loadDashboardData() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.errorMessage.set('User not authenticated');
      this.isLoading.set(false);
      return;
    }

    // Load user's concerns and analytics in parallel
    Promise.all([
      this.loadUserConcerns(currentUser.id),
      this.loadAnalytics()
    ]).then(() => {
      this.isLoading.set(false);
    }).catch(error => {
      this.errorMessage.set('Failed to load dashboard data');
      this.isLoading.set(false);
      console.error('Dashboard load error:', error);
    });
  }

  private async loadUserConcerns(userId: string) {
    try {
      // Get concerns for the current user (limit to recent 5)
      const response = await this.apiService.getConcerns({ 
        page: 1, 
        limit: 5 
      }).toPromise();
      
      if (response) {
        // Filter concerns by current user (assuming we have citizenId field)
        const userConcerns = response.data.filter(concern => concern.citizenId === userId);
        this.recentConcerns.set(userConcerns);
        
        // Calculate user-specific stats
        this.calculateUserStats(userConcerns);
      }
    } catch (error) {
      console.error('Failed to load user concerns:', error);
      throw error;
    }
  }

  private async loadAnalytics() {
    try {
      // Only load analytics if user has permission
      if (this.authService.canViewAnalytics()) {
        const analytics = await this.apiService.getConcernAnalytics().toPromise();
        if (analytics) {
          // Update stats with analytics data
          this.stats.update(current => ({
            ...current,
            // These would be system-wide stats if user has permission
          }));
        }
      }
    } catch (error) {
      // Analytics failure shouldn't break the dashboard
      console.warn('Failed to load analytics:', error);
    }
  }

  private calculateUserStats(concerns: Concern[]) {
    const stats = {
      totalSubmitted: concerns.length,
      inProgress: concerns.filter(c => c.status === ConcernStatus.InProgress).length,
      resolved: concerns.filter(c => c.status === ConcernStatus.Resolved).length,
      pending: concerns.filter(c => c.status === ConcernStatus.New || c.status === ConcernStatus.Acknowledged).length
    };
    
    this.stats.set(stats);
  }

  private checkOfflineStatus() {
    // Mock offline detection - in real app, would use navigator.onLine and service worker
    this.isOffline.set(!navigator.onLine);
    
    window.addEventListener('online', () => this.isOffline.set(false));
    window.addEventListener('offline', () => this.isOffline.set(true));
  }

  getWelcomeMessage(): string {
    return this.authService.getWelcomeMessage();
  }

  getStatusDisplayName(status: ConcernStatus): string {
    switch (status) {
      case ConcernStatus.New:
        return 'New';
      case ConcernStatus.Acknowledged:
        return 'Acknowledged';
      case ConcernStatus.InProgress:
        return 'In Progress';
      case ConcernStatus.UnderReview:
        return 'Under Review';
      case ConcernStatus.Resolved:
        return 'Resolved';
      case ConcernStatus.Closed:
        return 'Closed';
      case ConcernStatus.Rejected:
        return 'Rejected';
      default:
        return 'Unknown';
    }
  }

  getPriorityDisplayName(priority: number): string {
    if (priority >= 4) return 'High';
    if (priority >= 3) return 'Medium';
    return 'Low';
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase().replace(' ', '-')}`;
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority.toLowerCase()}`;
  }

  formatDate(date: Date): string {
    const now = new Date();
    const concernDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - concernDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return concernDate.toLocaleDateString();
    }
  }
}