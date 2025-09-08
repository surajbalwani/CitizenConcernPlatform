import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';

import {
  Concern,
  ConcernStatus,
  PaginatedResponse,
  UpdateStatusRequest,
  UserResponse,
  UserRole,
} from '../../core/models/api.models';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-officer-concerns',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatChipsModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTabsModule,
    MatBadgeModule,
  ],
  template: `
    <div class="officer-dashboard">
      <div class="dashboard-header">
        <div class="header-content">
          <h1 class="dashboard-title">
            <mat-icon>work</mat-icon>
            Officer Dashboard
          </h1>
          <p class="dashboard-subtitle">Manage and resolve assigned concerns</p>
        </div>

        @if (currentOfficer()) {
        <div class="officer-info">
          <mat-card class="officer-card">
            <mat-card-content>
              <div class="officer-details">
                <div class="officer-avatar">
                  <mat-icon>person</mat-icon>
                </div>
                <div class="officer-text">
                  <h3>
                    {{ currentOfficer()?.firstName }}
                    {{ currentOfficer()?.lastName }}
                  </h3>
                  <p class="department">
                    {{ currentOfficer()?.department || 'General' }}
                  </p>
                  <p class="role">{{ currentOfficer()?.role }}</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
        }
      </div>

      <div class="stats-overview">
        <mat-card class="stat-card assigned">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon>assignment</mat-icon>
              <div class="stat-info">
                <span class="stat-number">{{ concernStats().assigned }}</span>
                <span class="stat-label">Assigned to Me</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card in-progress">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon>work_in_progress</mat-icon>
              <div class="stat-info">
                <span class="stat-number">{{ concernStats().inProgress }}</span>
                <span class="stat-label">In Progress</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card resolved">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon>check_circle</mat-icon>
              <div class="stat-info">
                <span class="stat-number">{{ concernStats().resolved }}</span>
                <span class="stat-label">Resolved</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card urgent">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon>priority_high</mat-icon>
              <div class="stat-info">
                <span class="stat-number">{{ concernStats().urgent }}</span>
                <span class="stat-label">Urgent</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-container">
            <mat-form-field>
              <mat-label>Filter by Status</mat-label>
              <mat-select
                [(value)]="selectedStatus"
                (selectionChange)="applyFilters()"
              >
                <mat-option value="">All Status</mat-option>
                <mat-option value="Submitted">Submitted</mat-option>
                <mat-option value="Assigned">Assigned</mat-option>
                <mat-option value="InProgress">In Progress</mat-option>
                <mat-option value="Resolved">Resolved</mat-option>
                <mat-option value="Closed">Closed</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Search concerns</mat-label>
              <input
                matInput
                [(ngModel)]="searchQuery"
                (input)="applyFilters()"
                placeholder="Search by title, description..."
              />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              (click)="refreshConcerns()"
            >
              <mat-icon>refresh</mat-icon>
              Refresh
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="concerns-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>list</mat-icon>
            My Assigned Concerns @if (concernStats().assigned > 0) {
            <mat-chip-set>
              <mat-chip [color]="'accent'"
                >{{ concernStats().assigned }} Active</mat-chip
              >
            </mat-chip-set>
            }
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          @if (isLoading()) {
          <div class="loading-container">
            <mat-spinner></mat-spinner>
            <p>Loading assigned concerns...</p>
          </div>
          } @else if (errorMessage()) {
          <div class="error-container">
            <mat-icon color="warn">error</mat-icon>
            <p>{{ errorMessage() }}</p>
            <button
              mat-raised-button
              color="primary"
              (click)="loadOfficerConcerns()"
            >
              <mat-icon>refresh</mat-icon>
              Retry
            </button>
          </div>
          } @else { @if (concerns().data.length === 0) {
          <div class="no-concerns">
            <mat-icon>assignment</mat-icon>
            <h3>No concerns assigned yet</h3>
            <p>Assigned concerns will appear here when available.</p>
          </div>
          } @else {
          <div class="concerns-table-container">
            <table
              mat-table
              [dataSource]="concerns().data"
              class="concerns-table"
            >
              <!-- ID Column -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let concern">
                  <span class="concern-id">#{{ concern.id }}</span>
                </td>
              </ng-container>

              <!-- Title Column -->
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef>Title</th>
                <td mat-cell *matCellDef="let concern">
                  <div class="concern-title">
                    <span class="title-text">{{ concern.title }}</span>
                    @if (concern.isUrgent) {
                    <mat-icon class="urgent-icon" color="warn"
                      >priority_high</mat-icon
                    >
                    }
                  </div>
                </td>
              </ng-container>

              <!-- Category Column -->
              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef>Category</th>
                <td mat-cell *matCellDef="let concern">
                  <mat-chip>{{ concern.category }}</mat-chip>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let concern">
                  <mat-chip [color]="getStatusColor(concern.status)">
                    {{ concern.status }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Priority Column -->
              <ng-container matColumnDef="priority">
                <th mat-header-cell *matHeaderCellDef>Priority</th>
                <td mat-cell *matCellDef="let concern">
                  <span [class]="'priority-' + concern.priority">
                    {{ concern.priority }}
                  </span>
                </td>
              </ng-container>

              <!-- Date Column -->
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Submitted</th>
                <td mat-cell *matCellDef="let concern">
                  {{ formatDate(concern.createdAt) }}
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let concern">
                  <div class="action-buttons">
                    <button
                      mat-icon-button
                      color="primary"
                      (click)="viewConcernDetails(concern)"
                      matTooltip="View Details"
                    >
                      <mat-icon>visibility</mat-icon>
                    </button>

                    @if (concern.status !== 'Resolved' && concern.status !==
                    'Closed') {
                    <button
                      mat-icon-button
                      color="accent"
                      (click)="updateConcernStatus(concern)"
                      matTooltip="Update Status"
                    >
                      <mat-icon>edit</mat-icon>
                    </button>
                    }

                    <button
                      mat-icon-button
                      (click)="addComment(concern)"
                      matTooltip="Add Comment"
                    >
                      <mat-icon>comment</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          </div>

          @if (concerns().totalCount > concerns().perPage) {
          <mat-paginator
            [length]="concerns().totalCount"
            [pageSize]="concerns().perPage"
            [pageIndex]="concerns().page - 1"
            [pageSizeOptions]="[5, 10, 20, 50]"
            (page)="onPageChange($event)"
            showFirstLastButtons
          >
          </mat-paginator>
          } } }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .officer-dashboard {
        padding: 20px;
        max-width: 1400px;
        margin: 0 auto;
      }

      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 30px;
        gap: 20px;
      }

      .header-content .dashboard-title {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
        font-size: 2rem;
        font-weight: 500;
        color: #1976d2;
      }

      .dashboard-subtitle {
        margin: 8px 0 0 0;
        color: #666;
        font-size: 1.1rem;
      }

      .officer-info {
        flex-shrink: 0;
      }

      .officer-card {
        min-width: 280px;
      }

      .officer-details {
        display: flex;
        align-items: center;
        gap: 15px;
      }

      .officer-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #1976d2;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }

      .officer-text h3 {
        margin: 0 0 4px 0;
        font-weight: 500;
      }

      .officer-text p {
        margin: 2px 0;
        color: #666;
      }

      .department {
        font-weight: 500;
        color: #1976d2;
      }

      .stats-overview {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }

      .stat-card {
        overflow: hidden;
      }

      .stat-content {
        display: flex;
        align-items: center;
        gap: 15px;
      }

      .stat-content mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      .stat-info {
        display: flex;
        flex-direction: column;
      }

      .stat-number {
        font-size: 24px;
        font-weight: bold;
        line-height: 1;
      }

      .stat-label {
        font-size: 12px;
        color: #666;
        text-transform: uppercase;
      }

      .stat-card.assigned .stat-content mat-icon {
        color: #2196f3;
      }
      .stat-card.in-progress .stat-content mat-icon {
        color: #ff9800;
      }
      .stat-card.resolved .stat-content mat-icon {
        color: #4caf50;
      }
      .stat-card.urgent .stat-content mat-icon {
        color: #f44336;
      }

      .filters-card {
        margin-bottom: 20px;
      }

      .filters-container {
        display: flex;
        gap: 20px;
        align-items: center;
        flex-wrap: wrap;
      }

      .filters-container mat-form-field {
        min-width: 200px;
      }

      .concerns-card {
        margin-bottom: 20px;
      }

      .loading-container,
      .error-container,
      .no-concerns {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        text-align: center;
      }

      .loading-container mat-spinner {
        margin-bottom: 20px;
      }

      .error-container mat-icon,
      .no-concerns mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
      }

      .error-container mat-icon {
        color: #f44336;
      }

      .no-concerns mat-icon {
        color: #ccc;
      }

      .concerns-table-container {
        overflow-x: auto;
      }

      .concerns-table {
        width: 100%;
        margin-bottom: 20px;
      }

      .concern-id {
        font-family: monospace;
        font-weight: bold;
        color: #666;
      }

      .concern-title {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .title-text {
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .urgent-icon {
        font-size: 18px !important;
        width: 18px !important;
        height: 18px !important;
      }

      .priority-high {
        color: #f44336;
        font-weight: bold;
      }
      .priority-medium {
        color: #ff9800;
        font-weight: 500;
      }
      .priority-low {
        color: #4caf50;
      }

      .action-buttons {
        display: flex;
        gap: 4px;
      }

      @media (max-width: 768px) {
        .dashboard-header {
          flex-direction: column;
          align-items: stretch;
        }

        .officer-card {
          min-width: auto;
        }

        .stats-overview {
          grid-template-columns: repeat(2, 1fr);
        }

        .filters-container {
          flex-direction: column;
          align-items: stretch;
        }

        .filters-container mat-form-field {
          min-width: auto;
        }

        .concerns-table-container {
          font-size: 14px;
        }

        .title-text {
          max-width: 120px;
        }
      }
    `,
  ],
})
export class OfficerConcernsComponent implements OnInit {
  concerns = signal<PaginatedResponse<Concern>>({
    data: [],
    totalCount: 0,
    page: 1,
    perPage: 10,
    totalPages: 0,
  });

  concernStats = signal({
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    urgent: 0,
  });

  currentOfficer = signal<UserResponse | null>(null);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  selectedStatus: string = '';
  searchQuery: string = '';

  displayedColumns: string[] = [
    'id',
    'title',
    'category',
    'status',
    'priority',
    'date',
    'actions',
  ];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadCurrentOfficer();
    this.loadOfficerConcerns();
  }

  loadCurrentOfficer() {
    const user = this.authService.getCurrentUser();
    if (
      user &&
      (user.role === UserRole.Officer || user.role === UserRole.DepartmentHead)
    ) {
      this.currentOfficer.set(user);
    }
  }

  loadOfficerConcerns() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.errorMessage.set('Officer not authenticated');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const params: any = {
      page: this.concerns().page,
      limit: this.concerns().perPage,
    };

    if (this.selectedStatus) {
      params.status = this.selectedStatus;
    }

    if (this.searchQuery) {
      params.search = this.searchQuery;
    }

    this.apiService.getConcerns(params).subscribe({
      next: (response) => {
        // Filter concerns assigned to this officer or in their department
        let officerConcerns = response.data;

        // For demonstration, we'll show concerns that could be assigned to this officer
        // In a real application, this would be filtered by assignedOfficerId or department
        if (currentUser.role === UserRole.Officer) {
          // Show concerns that are assigned or could be assigned to this officer
          officerConcerns = response.data.filter(
            (concern) =>
              concern.status === ConcernStatus.Acknowledged ||
              concern.status === ConcernStatus.InProgress ||
              (concern.status === ConcernStatus.New && !concern.assignedOfficer)
          );
        }

        const filteredResponse: PaginatedResponse<Concern> = {
          data: officerConcerns,
          totalCount: officerConcerns.length,
          page: response.page,
          perPage: response.perPage,
          totalPages: Math.ceil(officerConcerns.length / response.perPage),
        };

        this.concerns.set(filteredResponse);
        this.updateStats(officerConcerns);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Failed to load assigned concerns');
        this.isLoading.set(false);
        console.error('Error loading concerns:', error);
      },
    });
  }

  updateStats(concerns: Concern[]) {
    const stats = {
      assigned: concerns.filter((c) => c.status === ConcernStatus.Acknowledged)
        .length,
      inProgress: concerns.filter((c) => c.status === ConcernStatus.InProgress)
        .length,
      resolved: concerns.filter((c) => c.status === ConcernStatus.Resolved)
        .length,
      urgent: concerns.filter((c) => c.priority >= 4).length,
    };
    this.concernStats.set(stats);
  }

  applyFilters() {
    this.loadOfficerConcerns();
  }

  refreshConcerns() {
    this.selectedStatus = '';
    this.searchQuery = '';
    this.loadOfficerConcerns();
  }

  onPageChange(event: PageEvent) {
    const updatedConcerns = {
      ...this.concerns(),
      page: event.pageIndex + 1,
      perPage: event.pageSize,
    };
    this.concerns.set(updatedConcerns);
    this.loadOfficerConcerns();
  }

  viewConcernDetails(concern: Concern) {
    // Navigate to concern details or show in modal
    console.log('View concern details:', concern);
    this.snackBar.open(
      `Viewing concern #${concern.id}: ${concern.title}`,
      'Close',
      {
        duration: 3000,
      }
    );
  }

  updateConcernStatus(concern: Concern) {
    // Open status update dialog or update directly
    console.log('Update concern status:', concern);

    // For demonstration, cycle through statuses
    let nextStatus: ConcernStatus;
    switch (concern.status) {
      case ConcernStatus.New:
        nextStatus = ConcernStatus.Acknowledged;
        break;
      case ConcernStatus.Acknowledged:
        nextStatus = ConcernStatus.InProgress;
        break;
      case ConcernStatus.InProgress:
        nextStatus = ConcernStatus.Resolved;
        break;
      default:
        nextStatus = ConcernStatus.InProgress;
    }

    const updateRequest: UpdateStatusRequest = { status: nextStatus };
    this.apiService.updateConcernStatus(concern.id, updateRequest).subscribe({
      next: () => {
        this.snackBar.open(
          `Concern #${concern.id} status updated to ${nextStatus}`,
          'Close',
          {
            duration: 3000,
          }
        );
        this.loadOfficerConcerns(); // Refresh the list
      },
      error: (error) => {
        this.snackBar.open('Failed to update concern status', 'Close', {
          duration: 3000,
        });
        console.error('Error updating status:', error);
      },
    });
  }

  addComment(concern: Concern) {
    // Open comment dialog
    console.log('Add comment to concern:', concern);
    this.snackBar.open(`Adding comment to concern #${concern.id}`, 'Close', {
      duration: 2000,
    });
  }

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' | undefined {
    switch (status) {
      case 'Submitted':
        return 'primary';
      case 'Assigned':
        return 'accent';
      case 'InProgress':
        return 'accent';
      case 'Resolved':
        return undefined; // Default color
      case 'Closed':
        return 'warn';
      default:
        return 'primary';
    }
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  }
}
