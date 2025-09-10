import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { LayoutService } from '../../core/services/layout.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Concern, ConcernStatus, PaginatedResponse } from '../../core/models/api.models';


@Component({
  selector: 'app-track-concerns',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatPaginatorModule
  ],
  template: `
    <div class="track-container" [class.mobile-layout]="layoutService.isMobile()">
      <h1>Track My Concerns</h1>
      
      @if (isLoading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading your concerns...</p>
        </div>
      } @else {
        <div class="concerns-list">
          @for (concern of concerns().data; track concern.id) {
            <mat-card class="concern-card">
              <mat-card-header>
                <mat-card-title>{{concern.title}}</mat-card-title>
                <mat-card-subtitle>
                  <mat-chip [class]="getStatusClass(concern.status)">
                    {{getStatusDisplayName(concern.status)}}
                  </mat-chip>
                  @if (concern.isAnonymous) {
                    <mat-chip class="anonymous-chip">Anonymous</mat-chip>
                  }
                </mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <div class="concern-description">
                  <p>{{concern.description}}</p>
                </div>
                
                <div class="concern-meta">
                  <p><mat-icon>category</mat-icon> {{concern.category}} - {{concern.subCategory}}</p>
                  <p><mat-icon>location_on</mat-icon> {{concern.address}}</p>
                  <p><mat-icon>schedule</mat-icon> Submitted: {{concern.createdAt | date:'medium'}}</p>
                  @if (concern.updatedAt) {
                    <p><mat-icon>update</mat-icon> Last Update: {{concern.updatedAt | date:'medium'}}</p>
                  }
                  @if (concern.assignedDepartment) {
                    <p><mat-icon>business</mat-icon> Department: {{concern.assignedDepartment}}</p>
                  }
                </div>
                
                <div class="priority-votes">
                  <div class="priority">
                    <mat-chip [class]="getPriorityClass(concern.priority)">
                      {{getPriorityDisplayName(concern.priority)}} Priority
                    </mat-chip>
                  </div>
                  <div class="votes">
                    <span class="vote-count upvote">
                      <mat-icon>thumb_up</mat-icon>
                      {{concern.upVotes}}
                    </span>
                    <span class="vote-count downvote">
                      <mat-icon>thumb_down</mat-icon>
                      {{concern.downVotes}}
                    </span>
                  </div>
                </div>
                
                <div class="progress-section">
                  <p class="progress-text">Status Progress</p>
                  <mat-progress-bar 
                    mode="determinate" 
                    [value]="getProgressValue(concern.status)"
                    [class]="getProgressClass(concern.status)">
                  </mat-progress-bar>
                </div>
                
                @if (concern.updates && concern.updates.length > 0) {
                  <div class="updates-section">
                    <h4>Recent Updates:</h4>
                    <div class="timeline">
                      @for (update of concern.updates.slice(-3); track update.id) {
                        <div class="timeline-item">
                          <div class="timeline-icon">
                            <mat-icon>{{getUpdateIcon(update.status)}}</mat-icon>
                          </div>
                          <div class="timeline-content">
                            <strong>{{getStatusDisplayName(update.status)}}</strong>
                            <p>{{update.updateText}}</p>
                            <small>{{update.updatedAt | date:'short'}} - by {{update.updatedBy}}</small>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
                
                @if (concern.comments && concern.comments.length > 0) {
                  <div class="comments-section">
                    <h4>Recent Comments:</h4>
                    @for (comment of concern.comments.slice(-2); track comment.id) {
                      <div class="comment-item" [class.official]="comment.isOfficial">
                        <div class="comment-header">
                          <strong>{{comment.commentBy}}</strong>
                          @if (comment.isOfficial) {
                            <mat-chip class="official-badge">Official</mat-chip>
                          }
                          <small>{{comment.createdAt | date:'short'}}</small>
                        </div>
                        <p>{{comment.commentText}}</p>
                      </div>
                    }
                  </div>
                }
            </mat-card-content>
            
            <mat-card-actions>
              <button mat-button color="primary" (click)="viewDetails(concern.id)">
                <mat-icon>visibility</mat-icon>
                View Details
              </button>
              <button mat-button (click)="shareUpdate(concern.id)">
                <mat-icon>share</mat-icon>
                Share
              </button>
            </mat-card-actions>
          </mat-card>
        }
          
        @if (concerns().data.length === 0) {
          <mat-card class="empty-state">
            <mat-card-content>
              <mat-icon class="empty-icon">inbox</mat-icon>
              <h3>No concerns submitted yet</h3>
              <p>Submit your first concern to start tracking its progress.</p>
              <button mat-raised-button color="primary" routerLink="/citizen/submit">
                Submit Concern
              </button>
            </mat-card-content>
          </mat-card>
          }
          
          <!-- Pagination -->
          @if (concerns().totalPages > 1) {
            <mat-paginator 
              [length]="concerns().totalCount"
              [pageSize]="concerns().perPage"
              [pageIndex]="concerns().page - 1"
              [pageSizeOptions]="[5, 10, 25]"
              (page)="onPageChange($event)"
              showFirstLastButtons>
            </mat-paginator>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .track-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .mobile-layout {
      padding: 16px;
    }
    
    h1 {
      color: #1976d2;
      text-align: center;
      margin-bottom: 24px;
    }
    
    .concerns-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .concern-card {
      margin-bottom: 16px;
    }
    
    .concern-meta {
      margin: 16px 0;
    }
    
    .concern-meta p {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 8px 0;
      font-size: 14px;
      color: #666;
    }
    
    .concern-meta mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      color: #666;
    }
    
    .loading-container p {
      margin-top: 16px;
    }
    
    .concern-description {
      margin-bottom: 16px;
      padding: 12px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    
    .concern-description p {
      margin: 0;
      color: #444;
    }
    
    .priority-votes {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 16px 0;
    }
    
    .votes {
      display: flex;
      gap: 16px;
    }
    
    .vote-count {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
    }
    
    .vote-count mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    .upvote {
      color: #4caf50;
    }
    
    .downvote {
      color: #f44336;
    }
    
    .comments-section {
      margin-top: 16px;
    }
    
    .comments-section h4 {
      margin: 0 0 12px 0;
      color: #333;
    }
    
    .comment-item {
      padding: 12px;
      margin-bottom: 12px;
      border-left: 3px solid #e0e0e0;
      background-color: #f9f9f9;
    }
    
    .comment-item.official {
      border-left-color: #1976d2;
      background-color: #e3f2fd;
    }
    
    .comment-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    
    .comment-header strong {
      color: #333;
    }
    
    .comment-header small {
      color: #666;
      margin-left: auto;
    }
    
    .official-badge {
      background-color: #1976d2;
      color: white;
      font-size: 10px;
      padding: 2px 8px;
      height: 20px;
      line-height: 16px;
    }
    
    .anonymous-chip {
      background-color: #9e9e9e;
      color: white;
      margin-left: 8px;
    }
    
    .status-new { background-color: #e3f2fd; color: #1976d2; }
    .status-acknowledged { background-color: #fff3e0; color: #f57c00; }
    .status-inprogress { background-color: #fff3e0; color: #ef6c00; }
    .status-underreview { background-color: #f3e5f5; color: #7b1fa2; }
    .status-resolved { background-color: #e8f5e8; color: #2e7d32; }
    .status-closed { background-color: #f5f5f5; color: #757575; }
    .status-rejected { background-color: #ffebee; color: #d32f2f; }
    
    .priority-high { background-color: #ffebee; color: #d32f2f; }
    .priority-medium { background-color: #fff3e0; color: #f57c00; }
    .priority-low { background-color: #e8f5e8; color: #388e3c; }
    
    .progress-section {
      margin: 16px 0;
    }
    
    .progress-text {
      margin-bottom: 8px;
      font-weight: 500;
    }
    
    .progress-new { --mdc-linear-progress-active-indicator-color: #1976d2; }
    .progress-acknowledged { --mdc-linear-progress-active-indicator-color: #f57c00; }
    .progress-inprogress { --mdc-linear-progress-active-indicator-color: #ef6c00; }
    .progress-underreview { --mdc-linear-progress-active-indicator-color: #7b1fa2; }
    .progress-resolved { --mdc-linear-progress-active-indicator-color: #2e7d32; }
    .progress-closed { --mdc-linear-progress-active-indicator-color: #757575; }
    .progress-rejected { --mdc-linear-progress-active-indicator-color: #d32f2f; }
    
    .updates-section {
      margin-top: 16px;
    }
    
    .updates-section h4 {
      margin: 0 0 12px 0;
      color: #333;
    }
    
    .timeline {
      border-left: 2px solid #e0e0e0;
      padding-left: 16px;
    }
    
    .timeline-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    
    .timeline-icon {
      margin-left: -24px;
      margin-right: 16px;
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .timeline-icon mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #666;
    }
    
    .timeline-content {
      flex: 1;
    }
    
    .timeline-content p {
      margin: 4px 0;
      font-size: 14px;
    }
    
    .timeline-content small {
      color: #666;
      font-size: 12px;
    }
    
    .empty-state {
      text-align: center;
      padding: 48px 24px;
    }
    
    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }
    
    .empty-state h3 {
      color: #666;
      margin: 16px 0 8px 0;
    }
    
    .empty-state p {
      color: #999;
      margin-bottom: 24px;
    }
    
    mat-card-actions {
      padding: 16px;
    }
    
    @media (max-width: 600px) {
      mat-card-actions {
        flex-direction: column;
        gap: 8px;
      }
      
      mat-card-actions button {
        width: 100%;
      }
    }
  `]
})
export class TrackConcernsComponent implements OnInit {
  concerns = signal<PaginatedResponse<Concern>>({ data: [], totalCount: 0, page: 1, perPage: 10, totalPages: 0 });
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    public layoutService: LayoutService,
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadMyConcerns();
  }

  loadMyConcerns() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.errorMessage.set('User not authenticated');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    // Get all concerns for the current user
    this.apiService.getConcerns({
      page: this.concerns().page,
      limit: this.concerns().perPage
    }).subscribe({
      next: (response) => {
        // Filter concerns by current user
        const userConcerns = response.data.filter(concern => concern.citizenId === currentUser.id);
        
        // Create a new paginated response with filtered data
        const filteredResponse: PaginatedResponse<Concern> = {
          data: userConcerns,
          totalCount: userConcerns.length,
          page: response.page,
          perPage: response.perPage,
          totalPages: Math.ceil(userConcerns.length / response.perPage)
        };
        
        this.concerns.set(filteredResponse);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Failed to load your concerns');
        this.isLoading.set(false);
        console.error('Failed to load concerns:', error);
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.concerns.update(current => ({
      ...current,
      page: event.pageIndex + 1,
      perPage: event.pageSize
    }));
    this.loadMyConcerns();
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

  getStatusClass(status: ConcernStatus): string {
    switch (status) {
      case ConcernStatus.New: return 'status-new';
      case ConcernStatus.Acknowledged: return 'status-acknowledged';
      case ConcernStatus.InProgress: return 'status-inprogress';
      case ConcernStatus.UnderReview: return 'status-underreview';
      case ConcernStatus.Resolved: return 'status-resolved';
      case ConcernStatus.Closed: return 'status-closed';
      case ConcernStatus.Rejected: return 'status-rejected';
      default: return 'status-unknown';
    }
  }

  getPriorityDisplayName(priority: number): string {
    if (priority >= 4) return 'High';
    if (priority >= 3) return 'Medium';
    return 'Low';
  }

  getPriorityClass(priority: number): string {
    if (priority >= 4) return 'priority-high';
    if (priority >= 3) return 'priority-medium';
    return 'priority-low';
  }

  getProgressValue(status: ConcernStatus): number {
    switch (status) {
      case ConcernStatus.New: return 10;
      case ConcernStatus.Acknowledged: return 25;
      case ConcernStatus.InProgress: return 60;
      case ConcernStatus.UnderReview: return 80;
      case ConcernStatus.Resolved: return 100;
      case ConcernStatus.Closed: return 100;
      case ConcernStatus.Rejected: return 0;
      default: return 0;
    }
  }

  getProgressClass(status: ConcernStatus): string {
    return `progress-${this.getStatusClass(status).replace('status-', '')}`;
  }

  getUpdateIcon(status: ConcernStatus): string {
    switch (status) {
      case ConcernStatus.New: return 'fiber_new';
      case ConcernStatus.Acknowledged: return 'check_circle_outline';
      case ConcernStatus.InProgress: return 'hourglass_empty';
      case ConcernStatus.UnderReview: return 'rate_review';
      case ConcernStatus.Resolved: return 'check_circle';
      case ConcernStatus.Closed: return 'lock';
      case ConcernStatus.Rejected: return 'cancel';
      default: return 'info';
    }
  }

  viewDetails(concernId: number) {
    // Navigate to detailed view
    console.log('Viewing details for concern:', concernId);
  }

  shareUpdate(concernId: number) {
    // Share concern update
    if (navigator.share) {
      navigator.share({
        title: 'Concern Update',
        text: 'Check out the progress on my concern',
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  }
}