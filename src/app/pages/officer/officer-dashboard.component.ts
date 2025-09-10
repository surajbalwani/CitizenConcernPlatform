import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import {
  Concern,
  ConcernStatus,
  UserResponse,
} from '../../core/models/api.models';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

interface OfficerStats {
  assignedConcerns: number;
  inProgressConcerns: number;
  resolvedConcerns: number;
  pendingConcerns: number;
  avgResolutionTime: number;
  recentActivity: number;
}

@Component({
  selector: 'app-officer-dashboard',
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
    MatProgressSpinnerModule,
    MatTabsModule,
  ],
  template: `
    <div class="officer-dashboard">
      <div class="dashboard-header">
        <div class="header-content">
          <h1 class="dashboard-title">
            <mat-icon>work</mat-icon>
            Officer Dashboard
          </h1>
          <p class="dashboard-subtitle">{{ getWelcomeMessage() }}</p>
        </div>
        <div class="header-actions">
          <button
            mat-raised-button
            color="primary"
            routerLink="/officer/concerns"
          >
            <mat-icon>list</mat-icon>
            View All Concerns
          </button>
        </div>
      </div>

      <!-- Loading Spinner -->
      @if (isLoading()) {
      <div class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading dashboard data...</p>
      </div>
      } @else {
      <!-- Quick Stats Cards -->
      <div class="stats-grid">
        <mat-card class="stat-card assigned">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>assignment</mat-icon>
            </div>
            <div class="stat-info">
              <h3>{{ stats().assignedConcerns }}</h3>
              <p>Assigned to Me</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card in-progress">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>hourglass_empty</mat-icon>
            </div>
            <div class="stat-info">
              <h3>{{ stats().inProgressConcerns }}</h3>
              <p>In Progress</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card resolved">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="stat-info">
              <h3>{{ stats().resolvedConcerns }}</h3>
              <p>Resolved</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card pending">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>pending</mat-icon>
            </div>
            <div class="stat-info">
              <h3>{{ stats().pendingConcerns }}</h3>
              <p>Pending Review</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Performance Metrics -->
      <div class="performance-section">
        <mat-card class="performance-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>trending_up</mat-icon>
              Performance Overview
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="performance-metrics">
              <div class="metric">
                <div class="metric-label">Resolution Rate</div>
                <div class="metric-value">{{ getResolutionRate() }}%</div>
                <mat-progress-bar
                  [value]="getResolutionRate()"
                  mode="determinate"
                ></mat-progress-bar>
              </div>
              <div class="metric">
                <div class="metric-label">Avg. Resolution Time</div>
                <div class="metric-value">
                  {{ stats().avgResolutionTime }} days
                </div>
              </div>
              <div class="metric">
                <div class="metric-label">Recent Activity</div>
                <div class="metric-value">
                  {{ stats().recentActivity }} actions this week
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Quick Actions -->
        <mat-card class="quick-actions-card">
          <mat-card-header>
            <mat-card-title class="quick-actions-title">
              <mat-icon>flash_on</mat-icon>
              Quick Actions
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="action-buttons">
              <!-- New Concerns Action -->
              <div class="action-item">
                <button
                  mat-raised-button
                  color="primary"
                  class="action-btn"
                  routerLink="/officer/concerns"
                  [queryParams]="{ status: 'New' }"
                >
                  <div class="btn-content">
                    <mat-icon class="btn-icon">new_releases</mat-icon>
                    <div class="btn-text">
                      <span class="btn-label">View New Concerns</span>
                      <span class="btn-description">Review newly reported issues</span>
                    </div>
                  </div>
                </button>
                @if (stats().pendingConcerns > 0) {
                  <mat-chip class="action-badge primary">{{ stats().pendingConcerns }}</mat-chip>
                }
              </div>

              <!-- In Progress Action -->
              <div class="action-item">
                <button
                  mat-raised-button
                  color="accent"
                  class="action-btn"
                  routerLink="/officer/concerns"
                  [queryParams]="{ status: 'InProgress' }"
                >
                  <div class="btn-content">
                    <mat-icon class="btn-icon">work</mat-icon>
                    <div class="btn-text">
                      <span class="btn-label">Continue Work</span>
                      <span class="btn-description">Resume ongoing concerns</span>
                    </div>
                  </div>
                </button>
                @if (stats().inProgressConcerns > 0) {
                  <mat-chip class="action-badge accent">{{ stats().inProgressConcerns }}</mat-chip>
                }
              </div>

              <!-- Profile Action -->
              <div class="action-item">
                <button
                  mat-stroked-button
                  class="action-btn profile-btn"
                  routerLink="/officer/profile"
                >
                  <div class="btn-content">
                    <mat-icon class="btn-icon">person</mat-icon>
                    <div class="btn-text">
                      <span class="btn-label">My Profile</span>
                      <span class="btn-description">Update profile & settings</span>
                    </div>
                  </div>
                </button>
              </div>

              <!-- Additional Quick Action -->
              <div class="action-item">
                <button
                  mat-stroked-button
                  class="action-btn"
                  routerLink="/officer/concerns"
                >
                  <div class="btn-content">
                    <mat-icon class="btn-icon">list</mat-icon>
                    <div class="btn-text">
                      <span class="btn-label">All Concerns</span>
                      <span class="btn-description">View complete concern list</span>
                    </div>
                  </div>
                </button>
                @if (stats().assignedConcerns > 0) {
                  <mat-chip class="action-badge neutral">{{ stats().assignedConcerns }}</mat-chip>
                }
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Recent Concerns -->
      <mat-card class="recent-concerns-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>history</mat-icon>
            Recent Concerns
          </mat-card-title>
          <mat-card-subtitle>Last 5 assigned concerns</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          @if (recentConcerns().length === 0) {
          <div class="no-data">
            <mat-icon>inbox</mat-icon>
            <p>No recent concerns assigned</p>
          </div>
          } @else {
          <div class="concerns-list">
            @for (concern of recentConcerns(); track concern.id) {
            <div class="concern-item" (click)="navigateToConcern(concern.id)">
              <div class="concern-header">
                <h4>{{ concern.title }}</h4>
                <mat-chip [class]="getStatusClass(concern.status)">
                  {{ getStatusDisplayName(concern.status) }}
                </mat-chip>
              </div>
              <p class="concern-description">
                {{ concern.description | slice : 0 : 100 }}...
              </p>
              <div class="concern-meta">
                <span class="category">{{ concern.category }}</span>
                <span class="date">{{
                  concern.createdAt | date : 'short'
                }}</span>
              </div>
            </div>
            }
          </div>
          }
        </mat-card-content>
        <mat-card-actions>
          <button mat-button routerLink="/officer/concerns">
            View All Concerns
            <mat-icon>arrow_forward</mat-icon>
          </button>
        </mat-card-actions>
      </mat-card>
      }
    </div>
  `,
  styles: [
    `
      .officer-dashboard {
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        flex-wrap: wrap;
        gap: 16px;
      }

      .dashboard-title {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
        font-size: 1.8rem;
        font-weight: 500;
      }

      .dashboard-subtitle {
        margin: 8px 0 0 0;
        color: #666;
        font-size: 1rem;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 48px;
        gap: 16px;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }

      .stat-card {
        min-height: 120px;
      }

      .stat-card mat-card-content {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
      }

      .stat-icon mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      .stat-info h3 {
        margin: 0;
        font-size: 1.8rem;
        font-weight: 600;
      }

      .stat-info p {
        margin: 4px 0 0 0;
        color: #666;
        font-size: 0.9rem;
      }

      .stat-card.assigned .stat-icon {
        color: #2196f3;
      }
      .stat-card.in-progress .stat-icon {
        color: #ff9800;
      }
      .stat-card.resolved .stat-icon {
        color: #4caf50;
      }
      .stat-card.pending .stat-icon {
        color: #f44336;
      }

      .performance-section {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 16px;
        margin-bottom: 24px;
      }

      .performance-metrics {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .metric {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .metric-label {
        font-size: 0.9rem;
        color: #666;
      }

      .metric-value {
        font-size: 1.2rem;
        font-weight: 600;
      }

      .quick-actions-title {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #1976d2;
      }

      .action-buttons {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .action-item {
        position: relative;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .action-btn {
        flex: 1;
        min-height: 64px;
        padding: 12px 20px;
        text-align: left;
        justify-content: flex-start;
        border-radius: 12px;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .action-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }

      .profile-btn {
        border: 2px solid #e0e0e0;
      }

      .profile-btn:hover {
        border-color: #1976d2;
        background-color: rgba(25, 118, 210, 0.04);
      }

      .btn-content {
        display: flex;
        align-items: center;
        gap: 16px;
        width: 100%;
      }

      .btn-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        flex-shrink: 0;
      }

      .btn-text {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0;
      }

      .btn-label {
        font-size: 16px;
        font-weight: 500;
        line-height: 1.2;
        margin-bottom: 2px;
      }

      .btn-description {
        font-size: 13px;
        opacity: 0.7;
        line-height: 1.2;
      }

      .action-badge {
        min-width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 14px;
        border-radius: 16px;
        flex-shrink: 0;
      }

      .action-badge.primary {
        background-color: #1976d2;
        color: white;
      }

      .action-badge.accent {
        background-color: #ff5722;
        color: white;
      }

      .action-badge.neutral {
        background-color: #666;
        color: white;
      }

      .concerns-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .concern-item {
        padding: 16px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .concern-item:hover {
        background-color: #f5f5f5;
        border-color: #ccc;
      }

      .concern-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .concern-header h4 {
        margin: 0;
        font-weight: 500;
      }

      .concern-description {
        margin: 8px 0;
        color: #666;
        line-height: 1.4;
      }

      .concern-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.85rem;
        color: #888;
      }

      .category {
        background-color: #e3f2fd;
        color: #1976d2;
        padding: 2px 8px;
        border-radius: 12px;
      }

      .no-data {
        text-align: center;
        padding: 32px;
        color: #666;
      }

      .no-data mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      /* Status chip styles */
      .status-new {
        background-color: #e3f2fd;
        color: #1976d2;
      }
      .status-in-progress {
        background-color: #fff3e0;
        color: #f57c00;
      }
      .status-resolved {
        background-color: #e8f5e8;
        color: #388e3c;
      }
      .status-closed {
        background-color: #fce4ec;
        color: #c2185b;
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .officer-dashboard {
          padding: 16px;
        }

        .dashboard-header {
          flex-direction: column;
          align-items: flex-start;
        }

        .performance-section {
          grid-template-columns: 1fr;
        }

        .stats-grid {
          grid-template-columns: 1fr 1fr;
        }
      }

      @media (max-width: 480px) {
        .stats-grid {
          grid-template-columns: 1fr;
        }

        .action-btn {
          min-height: 56px;
          padding: 10px 16px;
        }

        .btn-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
        }

        .btn-label {
          font-size: 14px;
        }

        .btn-description {
          font-size: 12px;
        }

        .action-badge {
          min-width: 28px;
          height: 28px;
          font-size: 13px;
        }
      }
    `,
  ],
})
export class OfficerDashboardComponent implements OnInit {
  isLoading = signal(false);
  stats = signal<OfficerStats>({
    assignedConcerns: 0,
    inProgressConcerns: 0,
    resolvedConcerns: 0,
    pendingConcerns: 0,
    avgResolutionTime: 0,
    recentActivity: 0,
  });
  recentConcerns = signal<Concern[]>([]);
  currentUser = signal<UserResponse | null>(null);

  constructor(
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    this.isLoading.set(true);

    // Load current user info
    const currentUser = this.apiService.getCurrentUser();
    if (currentUser) {
      this.currentUser.set(currentUser);
    }

    // Load concerns assigned to this officer
    this.apiService.getConcerns({ page: 1, limit: 50 }).subscribe({
      next: (concernsResponse) => {
        const allConcerns = concernsResponse.data;

        // Calculate stats from the concerns data
        const assigned = allConcerns.length;
        const inProgress = allConcerns.filter(
          (c: Concern) => c.status === ConcernStatus.InProgress
        ).length;
        const resolved = allConcerns.filter(
          (c: Concern) => c.status === ConcernStatus.Resolved
        ).length;
        const pending = allConcerns.filter(
          (c: Concern) => c.status === ConcernStatus.New
        ).length;

        // Calculate average resolution time (mock calculation)
        const resolvedConcerns = allConcerns.filter(
          (c: Concern) => c.status === ConcernStatus.Resolved
        );
        const avgResolutionTime =
          resolvedConcerns.length > 0
            ? Math.round(
                resolvedConcerns.reduce((acc: number, concern: Concern) => {
                  const created = new Date(concern.createdAt);
                  const now = new Date();
                  return (
                    acc +
                    (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
                  );
                }, 0) / resolvedConcerns.length
              )
            : 0;

        this.stats.set({
          assignedConcerns: assigned,
          inProgressConcerns: inProgress,
          resolvedConcerns: resolved,
          pendingConcerns: pending,
          avgResolutionTime,
          recentActivity: Math.min(assigned, 10), // Mock recent activity
        });

        // Get recent concerns (last 5)
        const recent = allConcerns
          .sort(
            (a: Concern, b: Concern) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 5);
        this.recentConcerns.set(recent);

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load dashboard data:', error);
        // Set default stats on error
        this.stats.set({
          assignedConcerns: 0,
          inProgressConcerns: 0,
          resolvedConcerns: 0,
          pendingConcerns: 0,
          avgResolutionTime: 0,
          recentActivity: 0,
        });
        this.isLoading.set(false);
      }
    });
  }

  getWelcomeMessage(): string {
    const user = this.currentUser();
    if (user) {
      const hour = new Date().getHours();
      const greeting =
        hour < 12
          ? 'Good morning'
          : hour < 18
          ? 'Good afternoon'
          : 'Good evening';
      return `${greeting}, ${user.firstName} ${user.lastName}`;
    }
    return 'Welcome to your dashboard';
  }

  getResolutionRate(): number {
    const stats = this.stats();
    const total = stats.assignedConcerns;
    return total > 0 ? Math.round((stats.resolvedConcerns / total) * 100) : 0;
  }

  getStatusClass(status: ConcernStatus): string {
    switch (status) {
      case ConcernStatus.New:
        return 'status-new';
      case ConcernStatus.InProgress:
        return 'status-in-progress';
      case ConcernStatus.Resolved:
        return 'status-resolved';
      case ConcernStatus.Closed:
        return 'status-closed';
      default:
        return 'status-new';
    }
  }

  getStatusDisplayName(status: ConcernStatus): string {
    switch (status) {
      case ConcernStatus.New:
        return 'New';
      case ConcernStatus.InProgress:
        return 'In Progress';
      case ConcernStatus.Resolved:
        return 'Resolved';
      case ConcernStatus.Closed:
        return 'Closed';
      default:
        return 'Unknown';
    }
  }

  navigateToConcern(concernId: number) {
    // This could navigate to a detailed view or open the concerns page with a filter
    window.location.href = `/officer/concerns?id=${concernId}`;
  }
}
