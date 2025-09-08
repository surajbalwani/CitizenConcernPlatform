import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { LayoutService } from '../../core/services/layout.service';
import { 
  Concern, 
  ConcernStatus, 
  ConcernAnalytics, 
  UserResponse, 
  UpdateStatusRequest,
  PaginatedResponse
} from '../../core/models/api.models';

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
    FormsModule
  ],
  template: `
    <div class="admin-dashboard" [class.mobile-layout]="layoutService.isMobile()">
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
                <mat-icon class="analytics-icon" color="primary">assessment</mat-icon>
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
                <mat-icon class="analytics-icon" color="accent">fiber_new</mat-icon>
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
                <mat-icon class="analytics-icon" style="color: #4caf50;">check_circle</mat-icon>
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
                  <input matInput [(ngModel)]="searchTerm" (keyup.enter)="loadConcerns()" placeholder="Search concerns...">
                </mat-form-field>
                
                <mat-form-field>
                  <mat-label>Status</mat-label>
                  <mat-select [(ngModel)]="selectedStatus" (selectionChange)="loadConcerns()">
                    <mat-option value="">All Statuses</mat-option>
                    <mat-option [value]="ConcernStatus.New">New</mat-option>
                    <mat-option [value]="ConcernStatus.Acknowledged">Acknowledged</mat-option>
                    <mat-option [value]="ConcernStatus.InProgress">In Progress</mat-option>
                    <mat-option [value]="ConcernStatus.UnderReview">Under Review</mat-option>
                    <mat-option [value]="ConcernStatus.Resolved">Resolved</mat-option>
                    <mat-option [value]="ConcernStatus.Closed">Closed</mat-option>
                    <mat-option [value]="ConcernStatus.Rejected">Rejected</mat-option>
                  </mat-select>
                </mat-form-field>
                
                <mat-form-field>
                  <mat-label>Category</mat-label>
                  <mat-select [(ngModel)]="selectedCategory" (selectionChange)="loadConcerns()">
                    <mat-option value="">All Categories</mat-option>
                    @for (category of availableCategories(); track category) {
                      <mat-option [value]="category">{{category}}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                
                <button mat-raised-button color="primary" (click)="loadConcerns()">
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
                  <table mat-table [dataSource]="concerns().data" class="concerns-table">
                    <ng-container matColumnDef="id">
                      <th mat-header-cell *matHeaderCellDef>ID</th>
                      <td mat-cell *matCellDef="let concern">#{{concern.id}}</td>
                    </ng-container>

                    <ng-container matColumnDef="title">
                      <th mat-header-cell *matHeaderCellDef>Title</th>
                      <td mat-cell *matCellDef="let concern" class="title-cell">
                        <div class="title-content">
                          <span class="concern-title">{{concern.title}}</span>
                          <span class="concern-category">{{concern.category}}</span>
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
                            <span>{{concern.citizenName}}</span>
                            @if (concern.citizenEmail) {
                              <small>{{concern.citizenEmail}}</small>
                            }
                          </div>
                        }
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let concern">
                        <mat-chip [class]="getStatusClass(concern.status)">
                          {{getStatusDisplayName(concern.status)}}
                        </mat-chip>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="priority">
                      <th mat-header-cell *matHeaderCellDef>Priority</th>
                      <td mat-cell *matCellDef="let concern">
                        <mat-chip [class]="getPriorityClass(concern.priority)">
                          {{getPriorityDisplayName(concern.priority)}}
                        </mat-chip>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="votes">
                      <th mat-header-cell *matHeaderCellDef>Votes</th>
                      <td mat-cell *matCellDef="let concern">
                        <div class="votes-display">
                          <span class="vote-count">
                            <mat-icon>thumb_up</mat-icon>
                            {{concern.upVotes}}
                          </span>
                          <span class="vote-count">
                            <mat-icon>thumb_down</mat-icon>
                            {{concern.downVotes}}
                          </span>
                        </div>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="created">
                      <th mat-header-cell *matHeaderCellDef>Created</th>
                      <td mat-cell *matCellDef="let concern">
                        {{formatDate(concern.createdAt)}}
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Actions</th>
                      <td mat-cell *matCellDef="let concern">
                        <div class="action-buttons">
                          <button mat-icon-button color="primary" (click)="viewConcern(concern)" 
                                  matTooltip="View Details">
                            <mat-icon>visibility</mat-icon>
                          </button>
                          <button mat-icon-button color="accent" (click)="editConcern(concern)"
                                  matTooltip="Update Status">
                            <mat-icon>edit</mat-icon>
                          </button>
                          @if (authService.canManageUsers()) {
                            <button mat-icon-button color="warn" (click)="deleteConcern(concern)"
                                    matTooltip="Delete">
                              <mat-icon>delete</mat-icon>
                            </button>
                          }
                        </div>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                  </table>

                  <!-- Pagination -->
                  <mat-paginator 
                    [length]="concerns().totalCount"
                    [pageSize]="concerns().perPage"
                    [pageIndex]="concerns().page - 1"
                    [pageSizeOptions]="[10, 25, 50, 100]"
                    (page)="onPageChange($event)"
                    showFirstLastButtons>
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
                  <table mat-table [dataSource]="users().data" class="users-table">
                    <ng-container matColumnDef="name">
                      <th mat-header-cell *matHeaderCellDef>Name</th>
                      <td mat-cell *matCellDef="let user">
                        <div class="user-info">
                          <span>{{user.firstName}} {{user.lastName}}</span>
                          <small>{{user.email}}</small>
                        </div>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="role">
                      <th mat-header-cell *matHeaderCellDef>Role</th>
                      <td mat-cell *matCellDef="let user">
                        <mat-chip>{{authService.getRoleDisplayName(user.role)}}</mat-chip>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="department">
                      <th mat-header-cell *matHeaderCellDef>Department</th>
                      <td mat-cell *matCellDef="let user">{{user.department || 'N/A'}}</td>
                    </ng-container>

                    <ng-container matColumnDef="verified">
                      <th mat-header-cell *matHeaderCellDef>Verified</th>
                      <td mat-cell *matCellDef="let user">
                        <mat-icon [color]="user.isVerified ? 'primary' : 'warn'">
                          {{user.isVerified ? 'verified' : 'pending'}}
                        </mat-icon>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="lastLogin">
                      <th mat-header-cell *matHeaderCellDef>Last Login</th>
                      <td mat-cell *matCellDef="let user">
                        {{user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}}
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="userColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: userColumns;"></tr>
                  </table>

                  <!-- Users Pagination -->
                  <mat-paginator 
                    [length]="users().totalCount"
                    [pageSize]="users().perPage"
                    [pageIndex]="users().page - 1"
                    [pageSizeOptions]="[10, 25, 50]"
                    (page)="onUsersPageChange($event)"
                    showFirstLastButtons>
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
                          <span class="category-name">{{item.category}}</span>
                          <span class="category-count">{{item.count}}</span>
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
                          <span class="region-name">{{item.region}}</span>
                          <span class="region-count">{{item.count}}</span>
                        </div>
                      }
                    </mat-card-content>
                  </mat-card>
                </div>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styles: [`
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
    
    .concerns-table, .users-table {
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
    
    .category-stat, .region-stat {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    
    .category-count, .region-count {
      font-weight: bold;
      color: #1976d2;
    }
    
    /* Status chip colors */
    .status-new { background-color: #e3f2fd; color: #1976d2; }
    .status-acknowledged { background-color: #fff3e0; color: #f57c00; }
    .status-in-progress { background-color: #fff3e0; color: #ef6c00; }
    .status-under-review { background-color: #f3e5f5; color: #7b1fa2; }
    .status-resolved { background-color: #e8f5e8; color: #2e7d32; }
    .status-closed { background-color: #f5f5f5; color: #757575; }
    .status-rejected { background-color: #ffebee; color: #d32f2f; }
    
    /* Priority colors */
    .priority-high { background-color: #ffebee; color: #d32f2f; }
    .priority-medium { background-color: #fff3e0; color: #f57c00; }
    .priority-low { background-color: #e8f5e8; color: #388e3c; }
    
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
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  analytics = signal<ConcernAnalytics | null>(null);
  concerns = signal<PaginatedResponse<Concern>>({ data: [], totalCount: 0, page: 1, perPage: 10, totalPages: 0 });
  users = signal<PaginatedResponse<UserResponse>>({ data: [], totalCount: 0, page: 1, perPage: 10, totalPages: 0 });
  availableCategories = signal<string[]>([]);
  
  isLoadingAnalytics = signal(false);
  isLoadingConcerns = signal(false);
  isLoadingUsers = signal(false);
  
  // Filters
  searchTerm = '';
  selectedStatus: ConcernStatus | '' = '';
  selectedCategory = '';
  
  // Table columns
  displayedColumns = ['id', 'title', 'citizen', 'status', 'priority', 'votes', 'created', 'actions'];
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
      }
    });
  }

  loadConcerns() {
    this.isLoadingConcerns.set(true);
    
    const params: any = {
      page: this.concerns().page,
      limit: this.concerns().perPage
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
      }
    });
  }

  private loadUsers() {
    this.isLoadingUsers.set(true);
    
    this.apiService.getUsers({
      page: this.users().page,
      limit: this.users().perPage
    }).subscribe({
      next: (response) => {
        this.users.set(response);
        this.isLoadingUsers.set(false);
      },
      error: (error) => {
        console.error('Failed to load users:', error);
        this.isLoadingUsers.set(false);
      }
    });
  }

  private loadCategories() {
    this.apiService.getCategories().subscribe({
      next: (categories) => {
        this.availableCategories.set(categories);
      },
      error: (error) => {
        console.error('Failed to load categories:', error);
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.concerns.update(current => ({
      ...current,
      page: event.pageIndex + 1,
      perPage: event.pageSize
    }));
    this.loadConcerns();
  }

  onUsersPageChange(event: PageEvent) {
    this.users.update(current => ({
      ...current,
      page: event.pageIndex + 1,
      perPage: event.pageSize
    }));
    this.loadUsers();
  }

  getStatusDisplayName(status: ConcernStatus): string {
    switch (status) {
      case ConcernStatus.New: return 'New';
      case ConcernStatus.Acknowledged: return 'Acknowledged';
      case ConcernStatus.InProgress: return 'In Progress';
      case ConcernStatus.UnderReview: return 'Under Review';
      case ConcernStatus.Resolved: return 'Resolved';
      case ConcernStatus.Closed: return 'Closed';
      case ConcernStatus.Rejected: return 'Rejected';
      default: return 'Unknown';
    }
  }

  getPriorityDisplayName(priority: number): string {
    if (priority >= 4) return 'High';
    if (priority >= 3) return 'Medium';
    return 'Low';
  }

  getStatusClass(status: ConcernStatus): string {
    return `status-${this.getStatusDisplayName(status).toLowerCase().replace(' ', '-')}`;
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
      count
    }));
  }

  getRegionAnalytics() {
    const regionData = this.analytics()?.concernsByRegion || {};
    return Object.entries(regionData).map(([region, count]) => ({
      region,
      count
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
}