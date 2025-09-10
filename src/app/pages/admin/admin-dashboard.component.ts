import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import {
  Concern,
  ConcernAnalytics,
  ConcernStatus,
  PaginatedResponse,
  UserResponse,
} from '../../core/models/api.models';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { LayoutService } from '../../core/services/layout.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressBarModule,
    FormsModule,
  ],
  template: `
    <div
      class="admin-dashboard"
      [class.mobile-layout]="layoutService.isMobile()"
    >
      <div class="header-section">
        <h1>{{ getWelcomeMessage() }}</h1>
        <p class="subtitle">Administrative Dashboard</p>
      </div>

      <!-- Analytics Cards -->
      @if (isLoadingAnalytics()) {
      <div class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading analytics...</p>
      </div>
      } @else {
      <div class="analytics-grid">
        <mat-card class="analytics-card">
          <mat-card-content>
            <div class="analytics-content">
              <mat-icon class="analytics-icon" color="primary"
                >assessment</mat-icon
              >
              <div class="analytics-details">
                <h3>{{ analytics()?.totalConcerns || 0 }}</h3>
                <p>Total Concerns</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="analytics-card">
          <mat-card-content>
            <div class="analytics-content">
              <mat-icon class="analytics-icon" color="accent"
                >fiber_new</mat-icon
              >
              <div class="analytics-details">
                <h3>{{ analytics()?.newConcerns || 0 }}</h3>
                <p>New Concerns</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="analytics-card">
          <mat-card-content>
            <div class="analytics-content">
              <mat-icon class="analytics-icon" color="warn">schedule</mat-icon>
              <div class="analytics-details">
                <h3>{{ analytics()?.inProgressConcerns || 0 }}</h3>
                <p>In Progress</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="analytics-card">
          <mat-card-content>
            <div class="analytics-content">
              <mat-icon class="analytics-icon" style="color: #4caf50;"
                >check_circle</mat-icon
              >
              <div class="analytics-details">
                <h3>{{ analytics()?.resolvedConcerns || 0 }}</h3>
                <p>Resolved</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
      }

      <!-- Main Content Tabs -->
      <mat-card class="main-content">
        <mat-tab-group>
          <mat-tab label="Concerns Management">
            <div class="tab-content">
              <!-- Filters -->
              <div class="filters-section">
                <mat-form-field>
                  <mat-label>Search</mat-label>
                  <input
                    matInput
                    [(ngModel)]="searchTerm"
                    (keyup.enter)="loadConcerns()"
                    placeholder="Search concerns..."
                  />
                </mat-form-field>

                <mat-form-field>
                  <mat-label>Status</mat-label>
                  <mat-select
                    [(ngModel)]="selectedStatus"
                    (selectionChange)="loadConcerns()"
                  >
                    <mat-option value="">All Statuses</mat-option>
                    <mat-option [value]="ConcernStatus.New">New</mat-option>
                    <mat-option [value]="ConcernStatus.Acknowledged"
                      >Acknowledged</mat-option
                    >
                    <mat-option [value]="ConcernStatus.InProgress"
                      >In Progress</mat-option
                    >
                    <mat-option [value]="ConcernStatus.UnderReview"
                      >Under Review</mat-option
                    >
                    <mat-option [value]="ConcernStatus.Resolved"
                      >Resolved</mat-option
                    >
                    <mat-option [value]="ConcernStatus.Closed"
                      >Closed</mat-option
                    >
                    <mat-option [value]="ConcernStatus.Rejected"
                      >Rejected</mat-option
                    >
                  </mat-select>
                </mat-form-field>

                <mat-form-field>
                  <mat-label>Category</mat-label>
                  <mat-select
                    [(ngModel)]="selectedCategory"
                    (selectionChange)="loadConcerns()"
                  >
                    <mat-option value="">All Categories</mat-option>
                    @for (category of availableCategories(); track category) {
                    <mat-option [value]="category">{{ category }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>

                <button
                  mat-raised-button
                  color="primary"
                  (click)="loadConcerns()"
                >
                  <mat-icon>search</mat-icon>
                  Search
                </button>
              </div>

              <!-- Concerns Table -->
              @if (isLoadingConcerns()) {
              <div class="loading-container">
                <mat-spinner diameter="40"></mat-spinner>
                <p>Loading concerns...</p>
              </div>
              } @else {
              <div class="table-container">
                <table
                  mat-table
                  [dataSource]="concerns().data"
                  class="concerns-table"
                >
                  <ng-container matColumnDef="id">
                    <th mat-header-cell *matHeaderCellDef>ID</th>
                    <td mat-cell *matCellDef="let concern">
                      #{{ concern.id }}
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="title">
                    <th mat-header-cell *matHeaderCellDef>Title</th>
                    <td mat-cell *matCellDef="let concern" class="title-cell">
                      <div class="title-content">
                        <span class="concern-title">{{ concern.title }}</span>
                        <span class="concern-category">{{
                          concern.category
                        }}</span>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="citizen">
                    <th mat-header-cell *matHeaderCellDef>Citizen</th>
                    <td mat-cell *matCellDef="let concern">
                      @if (concern.isAnonymous) {
                      <span class="anonymous-label">Anonymous</span>
                      } @else {
                      <div class="citizen-info">
                        <span>{{ concern.citizenName }}</span>
                        @if (concern.citizenEmail) {
                        <small>{{ concern.citizenEmail }}</small>
                        }
                      </div>
                      }
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let concern">
                      <mat-chip [class]="getStatusClass(concern.status)">
                        {{ getStatusDisplayName(concern.status) }}
                      </mat-chip>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="priority">
                    <th mat-header-cell *matHeaderCellDef>Priority</th>
                    <td mat-cell *matCellDef="let concern">
                      <mat-chip [class]="getPriorityClass(concern.priority)">
                        {{ getPriorityDisplayName(concern.priority) }}
                      </mat-chip>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="votes">
                    <th mat-header-cell *matHeaderCellDef>Votes</th>
                    <td mat-cell *matCellDef="let concern">
                      <div class="votes-display">
                        <span class="vote-count">
                          <mat-icon>thumb_up</mat-icon>
                          {{ concern.upVotes }}
                        </span>
                        <span class="vote-count">
                          <mat-icon>thumb_down</mat-icon>
                          {{ concern.downVotes }}
                        </span>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="created">
                    <th mat-header-cell *matHeaderCellDef>Created</th>
                    <td mat-cell *matCellDef="let concern">
                      {{ formatDate(concern.createdAt) }}
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let concern">
                      <div class="action-buttons">
                        <button
                          mat-icon-button
                          color="primary"
                          (click)="viewConcern(concern)"
                          matTooltip="View Details"
                        >
                          <mat-icon>visibility</mat-icon>
                        </button>
                        <button
                          mat-icon-button
                          color="accent"
                          (click)="editConcern(concern)"
                          matTooltip="Update Status"
                        >
                          <mat-icon>edit</mat-icon>
                        </button>
                        @if (authService.canManageUsers()) {
                        <button
                          mat-icon-button
                          color="warn"
                          (click)="deleteConcern(concern)"
                          matTooltip="Delete"
                        >
                          <mat-icon>delete</mat-icon>
                        </button>
                        }
                      </div>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr
                    mat-row
                    *matRowDef="let row; columns: displayedColumns"
                  ></tr>
                </table>

                <!-- Pagination -->
                <mat-paginator
                  [length]="concerns().totalCount"
                  [pageSize]="concerns().perPage"
                  [pageIndex]="concerns().page - 1"
                  [pageSizeOptions]="[10, 25, 50, 100]"
                  (page)="onPageChange($event)"
                  showFirstLastButtons
                >
                </mat-paginator>
              </div>
              }
            </div>
          </mat-tab>

          <mat-tab label="Users" *ngIf="authService.canManageUsers()">
            <div class="tab-content">
              @if (isLoadingUsers()) {
              <div class="loading-container">
                <mat-spinner diameter="40"></mat-spinner>
                <p>Loading users...</p>
              </div>
              } @else {
              <div class="table-container">
                <table
                  mat-table
                  [dataSource]="users().data"
                  class="users-table"
                >
                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef>Name</th>
                    <td mat-cell *matCellDef="let user">
                      <div class="user-info">
                        <span>{{ user.firstName }} {{ user.lastName }}</span>
                        <small>{{ user.email }}</small>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="role">
                    <th mat-header-cell *matHeaderCellDef>Role</th>
                    <td mat-cell *matCellDef="let user">
                      <mat-chip>{{
                        authService.getRoleDisplayName(user.role)
                      }}</mat-chip>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="department">
                    <th mat-header-cell *matHeaderCellDef>Department</th>
                    <td mat-cell *matCellDef="let user">
                      {{ user.department || 'N/A' }}
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="verified">
                    <th mat-header-cell *matHeaderCellDef>Verified</th>
                    <td mat-cell *matCellDef="let user">
                      <mat-icon [color]="user.isVerified ? 'primary' : 'warn'">
                        {{ user.isVerified ? 'verified' : 'pending' }}
                      </mat-icon>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="lastLogin">
                    <th mat-header-cell *matHeaderCellDef>Last Login</th>
                    <td mat-cell *matCellDef="let user">
                      {{
                        user.lastLoginAt
                          ? formatDate(user.lastLoginAt)
                          : 'Never'
                      }}
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="userColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: userColumns"></tr>
                </table>

                <!-- Users Pagination -->
                <mat-paginator
                  [length]="users().totalCount"
                  [pageSize]="users().perPage"
                  [pageIndex]="users().page - 1"
                  [pageSizeOptions]="[10, 25, 50]"
                  (page)="onUsersPageChange($event)"
                  showFirstLastButtons
                >
                </mat-paginator>
              </div>
              }
            </div>
          </mat-tab>

          <mat-tab label="Analytics">
            <div class="tab-content">
              @if (analytics()) {
              <div class="detailed-analytics">
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>Average Resolution Time</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <h2>{{ analytics()?.averageResolutionTime || 0 }} days</h2>
                  </mat-card-content>
                </mat-card>

                <mat-card>
                  <mat-card-header>
                    <mat-card-title>Concerns by Category</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    @for (item of getCategoryAnalytics(); track item.category) {
                    <div class="category-stat">
                      <span class="category-name">{{ item.category }}</span>
                      <span class="category-count">{{ item.count }}</span>
                    </div>
                    }
                  </mat-card-content>
                </mat-card>

                <mat-card>
                  <mat-card-header>
                    <mat-card-title>Concerns by Region</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    @for (item of getRegionAnalytics(); track item.region) {
                    <div class="region-stat">
                      <span class="region-name">{{ item.region }}</span>
                      <span class="region-count">{{ item.count }}</span>
                    </div>
                    }
                  </mat-card-content>
                </mat-card>
              </div>
              }
            </div>
          </mat-tab>

          <mat-tab label="SDG Progress">
            <div class="tab-content">
              @if (sdgProgress() === null) {
              <div class="loading-sdg">
                <mat-spinner diameter="30"></mat-spinner>
                <p>Loading SDG progress data...</p>
              </div>
              } @else {
              <div class="sdg-grid">
                @for (sdg of sdgProgress(); track sdg.id) {
                <mat-card class="sdg-card" [class]="getSdgCardClass(sdg)">
                  <mat-card-header class="sdg-card-header">
                    <div class="sdg-icon">
                      <mat-icon>{{ getSdgIcon(sdg.sdgGoal) }}</mat-icon>
                    </div>
                    <div class="sdg-title-section">
                      <mat-card-title class="sdg-goal">{{ sdg.sdgGoal }}</mat-card-title>
                      <mat-card-subtitle class="sdg-target">{{ sdg.sdgTarget }}</mat-card-subtitle>
                    </div>
                  </mat-card-header>
                  <mat-card-content class="sdg-content">
                    <div class="progress-section">
                      <div class="progress-header">
                        <span class="progress-label">Progress</span>
                        <span class="progress-value">{{ sdg.progressPercentage }}%</span>
                      </div>
                      <mat-progress-bar 
                        [value]="sdg.progressPercentage" 
                        mode="determinate"
                        [class]="getProgressBarClass(sdg.progressPercentage)">
                      </mat-progress-bar>
                    </div>
                    
                    <div class="stats-row">
                      <div class="stat-item">
                        <div class="stat-number">{{ sdg.relatedConcerns }}</div>
                        <div class="stat-label">Related Concerns</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-number resolved">{{ sdg.resolvedConcerns }}</div>
                        <div class="stat-label">Resolved</div>
                      </div>
                    </div>
                    
                    <div class="last-updated">
                      <mat-icon class="update-icon">schedule</mat-icon>
                      Last updated: {{ sdg.lastUpdated | date:'short' }}
                    </div>
                  </mat-card-content>
                </mat-card>
                }
              </div>
              
              <!-- SDG Summary -->
              <div class="sdg-summary">
                <h3 class="summary-title">
                  <mat-icon>analytics</mat-icon>
                  Overall SDG Impact Summary
                </h3>
                <div class="summary-stats">
                  <div class="summary-item">
                    <div class="summary-number">{{ getTotalConcerns() }}</div>
                    <div class="summary-label">Total SDG-Related Concerns</div>
                  </div>
                  <div class="summary-item">
                    <div class="summary-number resolved">{{ getTotalResolved() }}</div>
                    <div class="summary-label">Total Resolved</div>
                  </div>
                  <div class="summary-item">
                    <div class="summary-number">{{ getAverageProgress() }}%</div>
                    <div class="summary-label">Average Progress</div>
                  </div>
                  <div class="summary-item">
                    <div class="summary-number">{{ getActiveGoals() }}</div>
                    <div class="summary-label">Active Goals</div>
                  </div>
                </div>
              </div>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .admin-dashboard {
        padding: 16px;
        max-width: 1400px;
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
      }

      .subtitle {
        color: #666;
        font-size: 1.1rem;
      }

      .analytics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
        margin-bottom: 32px;
      }

      .analytics-card {
        transition: transform 0.2s ease;
      }

      .analytics-card:hover {
        transform: translateY(-2px);
      }

      .analytics-content {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .analytics-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
      }

      .analytics-details h3 {
        margin: 0;
        font-size: 2rem;
        font-weight: bold;
      }

      .analytics-details p {
        margin: 4px 0 0 0;
        color: #666;
      }

      .main-content {
        margin-bottom: 24px;
      }

      .tab-content {
        padding: 24px;
      }

      .filters-section {
        display: flex;
        gap: 16px;
        margin-bottom: 24px;
        flex-wrap: wrap;
        align-items: flex-end;
      }

      .filters-section mat-form-field {
        min-width: 150px;
      }

      .table-container {
        overflow-x: auto;
      }

      .concerns-table,
      .users-table {
        width: 100%;
      }

      .title-cell {
        max-width: 200px;
      }

      .title-content {
        display: flex;
        flex-direction: column;
      }

      .concern-title {
        font-weight: 500;
        margin-bottom: 4px;
      }

      .concern-category {
        font-size: 0.8rem;
        color: #666;
      }

      .citizen-info {
        display: flex;
        flex-direction: column;
      }

      .citizen-info small {
        color: #666;
        font-size: 0.8rem;
      }

      .anonymous-label {
        font-style: italic;
        color: #999;
      }

      .votes-display {
        display: flex;
        gap: 8px;
      }

      .vote-count {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.9rem;
      }

      .vote-count mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .action-buttons {
        display: flex;
        gap: 4px;
      }

      .user-info {
        display: flex;
        flex-direction: column;
      }

      .user-info small {
        color: #666;
        font-size: 0.8rem;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 48px;
      }

      .loading-container p {
        margin-top: 16px;
        color: #666;
      }

      .detailed-analytics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 24px;
      }

      .category-stat,
      .region-stat {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #eee;
      }

      .category-count,
      .region-count {
        font-weight: bold;
        color: #1976d2;
      }

      /* Status chip colors */
      .status-new {
        background-color: #e3f2fd;
        color: #1976d2;
      }
      .status-acknowledged {
        background-color: #fff3e0;
        color: #f57c00;
      }
      .status-in-progress {
        background-color: #fff3e0;
        color: #ef6c00;
      }
      .status-under-review {
        background-color: #f3e5f5;
        color: #7b1fa2;
      }
      .status-resolved {
        background-color: #e8f5e8;
        color: #2e7d32;
      }
      .status-closed {
        background-color: #f5f5f5;
        color: #757575;
      }
      .status-rejected {
        background-color: #ffebee;
        color: #d32f2f;
      }

      /* Priority colors */
      .priority-high {
        background-color: #ffebee;
        color: #d32f2f;
      }
      .priority-medium {
        background-color: #fff3e0;
        color: #f57c00;
      }
      .priority-low {
        background-color: #e8f5e8;
        color: #388e3c;
      }

      @media (max-width: 768px) {
        .filters-section {
          flex-direction: column;
          align-items: stretch;
        }

        .filters-section mat-form-field {
          min-width: auto;
        }

        .analytics-grid {
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .detailed-analytics {
          grid-template-columns: 1fr;
        }

        .sdg-grid {
          grid-template-columns: 1fr;
        }

        .summary-stats {
          grid-template-columns: 1fr 1fr;
        }

        .stats-row {
          grid-template-columns: 1fr;
          gap: 6px;
        }

        .sdg-card-header {
          padding: 12px 12px 6px 12px;
          flex-direction: row;
          align-items: flex-start;
          text-align: left;
          gap: 10px;
        }

        .sdg-content {
          padding: 0 12px 12px 12px;
        }

        .sdg-summary {
          padding: 16px;
        }
      }

      /* SDG Progress Styles */
      .loading-sdg {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 24px;
        gap: 12px;
      }

      .sdg-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }

      .sdg-card {
        border: 1px solid #e0e0e0;
        overflow: hidden;
        background: white;
        border-radius: 0 !important;
        box-shadow: none !important;
      }

      .sdg-card .mat-mdc-card {
        border-radius: 0 !important;
        box-shadow: none !important;
      }

      /* Override Material Design defaults for SDG section */
      .sdg-grid mat-card,
      .sdg-grid .mat-mdc-card,
      .sdg-summary mat-card,
      .sdg-summary .mat-mdc-card {
        border-radius: 0 !important;
        box-shadow: none !important;
      }

      .sdg-card-header {
        padding: 16px 16px 8px 16px;
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }

      .sdg-icon {
        background: #f5f5f5;
        border: 1px solid #e0e0e0;
        padding: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 36px;
        height: 36px;
      }

      .sdg-icon mat-icon {
        color: #1976d2;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .sdg-title-section {
        flex: 1;
        min-width: 0;
      }

      .sdg-goal {
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 2px;
        color: #1976d2;
        line-height: 1.2;
      }

      .sdg-target {
        font-size: 0.8rem;
        color: #666;
        line-height: 1.3;
        margin: 0;
      }

      .sdg-content {
        padding: 0 16px 16px 16px;
      }

      .progress-section {
        margin-bottom: 16px;
      }

      .progress-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .progress-label {
        font-weight: 500;
        color: #333;
      }

      .progress-value {
        font-weight: 600;
        font-size: 1rem;
        color: #1976d2;
      }

      .progress-excellent .mat-mdc-progress-bar-fill::after {
        background-color: #4caf50 !important;
      }

      .progress-good .mat-mdc-progress-bar-fill::after {
        background-color: #2196f3 !important;
      }

      .progress-fair .mat-mdc-progress-bar-fill::after {
        background-color: #ff9800 !important;
      }

      .progress-needs-attention .mat-mdc-progress-bar-fill::after {
        background-color: #f44336 !important;
      }

      .stats-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 12px;
      }

      .stat-item {
        text-align: center;
        padding: 8px;
        background: #fafafa;
        border: 1px solid #e0e0e0;
      }

      .stat-number {
        font-size: 1.2rem;
        font-weight: 700;
        color: #333;
        line-height: 1;
      }

      .stat-number.resolved {
        color: #4caf50;
      }

      .stat-label {
        font-size: 0.75rem;
        color: #666;
        margin-top: 2px;
        font-weight: 500;
      }

      .last-updated {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.75rem;
        color: #888;
        padding: 6px 8px;
        background: #f8f8f8;
        border: 1px solid #e0e0e0;
      }

      .update-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }

      .sdg-summary {
        background: #fafafa;
        padding: 20px;
        border: 1px solid #e0e0e0;
      }

      .summary-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 16px 0;
        color: #1976d2;
        font-size: 1.2rem;
        font-weight: 600;
      }

      .summary-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 16px;
      }

      .summary-item {
        text-align: center;
        padding: 16px;
        background: white;
        border: 1px solid #e0e0e0;
      }

      .summary-number {
        font-size: 1.6rem;
        font-weight: 700;
        color: #1976d2;
        line-height: 1;
        margin-bottom: 6px;
      }

      .summary-number.resolved {
        color: #4caf50;
      }

      .summary-label {
        font-size: 0.85rem;
        color: #666;
        font-weight: 500;
        line-height: 1.2;
      }
    `,
  ],
})
export class AdminDashboardComponent implements OnInit {
  analytics = signal<ConcernAnalytics | null>(null);
  concerns = signal<PaginatedResponse<Concern>>({
    data: [],
    totalCount: 0,
    page: 1,
    perPage: 10,
    totalPages: 0,
  });
  users = signal<PaginatedResponse<UserResponse>>({
    data: [],
    totalCount: 0,
    page: 1,
    perPage: 10,
    totalPages: 0,
  });
  availableCategories = signal<string[]>([]);
  sdgProgress = signal<any>(null);

  isLoadingAnalytics = signal(false);
  isLoadingConcerns = signal(false);
  isLoadingUsers = signal(false);

  // Filters
  searchTerm = '';
  selectedStatus: ConcernStatus | '' = '';
  selectedCategory = '';

  // Table columns
  displayedColumns = [
    'id',
    'title',
    'citizen',
    'status',
    'priority',
    'votes',
    'created',
    'actions',
  ];
  userColumns = ['name', 'role', 'department', 'verified', 'lastLogin'];

  // Enums for template
  ConcernStatus = ConcernStatus;

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    public layoutService: LayoutService
  ) {}

  ngOnInit() {
    this.loadAnalytics();
    this.loadConcerns();
    this.loadCategories();
    this.loadSdgProgress();

    if (this.authService.canManageUsers()) {
      this.loadUsers();
    }
  }

  getWelcomeMessage(): string {
    return this.authService.getWelcomeMessage();
  }

  private loadAnalytics() {
    this.isLoadingAnalytics.set(true);

    this.apiService.getConcernAnalytics().subscribe({
      next: (analytics) => {
        this.analytics.set(analytics);
        this.isLoadingAnalytics.set(false);
      },
      error: (error) => {
        console.error('Failed to load analytics:', error);
        this.isLoadingAnalytics.set(false);
      },
    });
  }

  loadConcerns() {
    this.isLoadingConcerns.set(true);

    const params: any = {
      page: this.concerns().page,
      limit: this.concerns().perPage,
    };

    if (this.searchTerm) params.search = this.searchTerm;
    if (this.selectedStatus) params.status = this.selectedStatus.toString();
    if (this.selectedCategory) params.category = this.selectedCategory;

    this.apiService.getConcerns(params).subscribe({
      next: (response) => {
        this.concerns.set(response);
        this.isLoadingConcerns.set(false);
      },
      error: (error) => {
        console.error('Failed to load concerns:', error);
        this.isLoadingConcerns.set(false);
      },
    });
  }

  private loadUsers() {
    this.isLoadingUsers.set(true);

    this.apiService
      .getUsers({
        page: this.users().page,
        limit: this.users().perPage,
      })
      .subscribe({
        next: (response) => {
          this.users.set(response);
          this.isLoadingUsers.set(false);
        },
        error: (error) => {
          console.error('Failed to load users:', error);
          this.isLoadingUsers.set(false);
        },
      });
  }

  private loadCategories() {
    this.apiService.getCategories().subscribe({
      next: (categories) => {
        const categorynames = categories.length
          ? categories.map((cat) => cat.name)
          : [];
        this.availableCategories.set(categorynames);
      },
      error: (error) => {
        console.error('Failed to load categories:', error);
      },
    });
  }

  onPageChange(event: PageEvent) {
    this.concerns.update((current) => ({
      ...current,
      page: event.pageIndex + 1,
      perPage: event.pageSize,
    }));
    this.loadConcerns();
  }

  onUsersPageChange(event: PageEvent) {
    this.users.update((current) => ({
      ...current,
      page: event.pageIndex + 1,
      perPage: event.pageSize,
    }));
    this.loadUsers();
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

  getStatusClass(status: ConcernStatus): string {
    return `status-${this.getStatusDisplayName(status)
      .toLowerCase()
      .replace(' ', '-')}`;
  }

  getPriorityClass(priority: number): string {
    return `priority-${this.getPriorityDisplayName(priority).toLowerCase()}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  getCategoryAnalytics() {
    const categoryData = this.analytics()?.concernsByCategory || {};
    return Object.entries(categoryData).map(([category, count]) => ({
      category,
      count,
    }));
  }

  getRegionAnalytics() {
    const regionData = this.analytics()?.concernsByRegion || {};
    return Object.entries(regionData).map(([region, count]) => ({
      region,
      count,
    }));
  }

  viewConcern(concern: Concern) {
    // Navigate to concern details page
    console.log('View concern:', concern);
  }

  editConcern(concern: Concern) {
    // Open edit dialog or navigate to edit page
    console.log('Edit concern:', concern);
  }

  deleteConcern(concern: Concern) {
    // Confirm and delete concern
    if (confirm('Are you sure you want to delete this concern?')) {
      console.log('Delete concern:', concern);
    }
  }

  // SDG Progress Methods
  private loadSdgProgress() {
    this.apiService.getSdgProgress().subscribe({
      next: (data) => {
        console.log('SDG Progress Data:', data);
        this.sdgProgress.set(data);
      },
      error: (error) => {
        console.error('Failed to load SDG progress data:', error);
        this.sdgProgress.set(null);
      }
    });
  }

  getSdgIcon(sdgGoal: string): string {
    if (sdgGoal.includes('Health')) return 'health_and_safety';
    if (sdgGoal.includes('Water')) return 'water_drop';
    if (sdgGoal.includes('Cities')) return 'location_city';
    if (sdgGoal.includes('Climate')) return 'eco';
    return 'public';
  }

  getSdgCardClass(sdg: any): string {
    if (sdg.progressPercentage >= 75) return 'sdg-excellent';
    if (sdg.progressPercentage >= 50) return 'sdg-good';
    if (sdg.progressPercentage >= 25) return 'sdg-fair';
    return 'sdg-needs-attention';
  }

  getProgressBarClass(percentage: number): string {
    if (percentage >= 75) return 'progress-excellent';
    if (percentage >= 50) return 'progress-good';
    if (percentage >= 25) return 'progress-fair';
    return 'progress-needs-attention';
  }

  getTotalConcerns(): number {
    const sdgData = this.sdgProgress();
    return sdgData ? sdgData.reduce((total: number, sdg: any) => total + sdg.relatedConcerns, 0) : 0;
  }

  getTotalResolved(): number {
    const sdgData = this.sdgProgress();
    return sdgData ? sdgData.reduce((total: number, sdg: any) => total + sdg.resolvedConcerns, 0) : 0;
  }

  getAverageProgress(): number {
    const sdgData = this.sdgProgress();
    if (!sdgData || sdgData.length === 0) return 0;
    const total = sdgData.reduce((sum: number, sdg: any) => sum + sdg.progressPercentage, 0);
    return Math.round(total / sdgData.length);
  }

  getActiveGoals(): number {
    const sdgData = this.sdgProgress();
    return sdgData ? sdgData.filter((sdg: any) => sdg.relatedConcerns > 0).length : 0;
  }
}