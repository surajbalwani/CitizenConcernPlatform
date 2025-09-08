import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { LayoutService } from '../../core/services/layout.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Concern, ConcernStatus, VoteRequest, PaginatedResponse } from '../../core/models/api.models';

interface LocationInfo {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

@Component({
  selector: 'app-nearby-concerns',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSliderModule,
    MatPaginatorModule,
    MatTooltipModule,
    FormsModule
  ],
  template: `
    <div class="nearby-container" [class.mobile-layout]="layoutService.isMobile()">
      <div class="header-section">
        <h1>🗺️ Nearby Concerns</h1>
        <p>Issues reported in your area</p>
      </div>

      <!-- Location Status -->
      <mat-card class="location-card">
        <mat-card-content>
          @if (gettingLocation()) {
            <div class="location-status getting">
              <mat-spinner diameter="20"></mat-spinner>
              <span>Getting your location...</span>
            </div>
          } @else if (currentLocation()) {
            <div class="location-status success">
              <mat-icon>location_on</mat-icon>
              <span>Location found! Showing nearby concerns within {{radiusKm}}km</span>
            </div>
          } @else {
            <div class="location-status error">
              <mat-icon>location_off</mat-icon>
              <span>Location access needed to show nearby concerns</span>
              <button mat-raised-button color="primary" (click)="getCurrentLocation()">
                Enable Location
              </button>
            </div>
          }
        </mat-card-content>
      </mat-card>

      <!-- Filters -->
      @if (currentLocation()) {
        <mat-card class="filters-card">
          <mat-card-content>
            <div class="filters-row">
              <mat-form-field>
                <mat-label>Category</mat-label>
                <mat-select [(ngModel)]="selectedCategory" (selectionChange)="loadNearbyConcerns()">
                  <mat-option value="">All Categories</mat-option>
                  @for (category of availableCategories(); track category) {
                    <mat-option [value]="category">{{category}}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              
              <mat-form-field>
                <mat-label>Status</mat-label>
                <mat-select [(ngModel)]="selectedStatus" (selectionChange)="loadNearbyConcerns()">
                  <mat-option value="">All Statuses</mat-option>
                  <mat-option [value]="ConcernStatus.New">New</mat-option>
                  <mat-option [value]="ConcernStatus.Acknowledged">Acknowledged</mat-option>
                  <mat-option [value]="ConcernStatus.InProgress">In Progress</mat-option>
                  <mat-option [value]="ConcernStatus.Resolved">Resolved</mat-option>
                </mat-select>
              </mat-form-field>
              
              <div class="radius-control">
                <label>Radius: {{radiusKm}}km</label>
                <mat-slider 
                  [min]="0.5" 
                  [max]="50" 
                  [step]="0.5" 
                  [(ngModel)]="radiusKm" 
                  (valueChange)="onRadiusChange()">
                </mat-slider>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      }

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading nearby concerns...</p>
        </div>
      }

      <!-- Error State -->
      @if (errorMessage()) {
        <mat-card class="error-card">
          <mat-card-content>
            <div class="error-content">
              <mat-icon>error</mat-icon>
              <p>{{errorMessage()}}</p>
              <button mat-raised-button color="primary" (click)="loadNearbyConcerns()">
                Try Again
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      }

      <!-- Concerns Grid -->
      @if (!isLoading() && !errorMessage() && currentLocation()) {
        <div class="concerns-section">
          @if (concerns().data.length === 0) {
            <mat-card class="empty-state">
              <mat-card-content>
                <mat-icon class="empty-icon">near_me</mat-icon>
                <h3>No concerns found nearby</h3>
                <p>There are no reported concerns within {{radiusKm}}km of your location.</p>
                <button mat-raised-button color="primary" routerLink="/citizen/submit">
                  Report First Concern
                </button>
              </mat-card-content>
            </mat-card>
          } @else {
            <div class="results-header">
              <h3>{{concerns().totalCount}} concerns found within {{radiusKm}}km</h3>
            </div>
            
            <div class="concerns-grid">
              @for (concern of concerns().data; track concern.id) {
                <mat-card class="concern-card" [class.own-concern]="isOwnConcern(concern)">
                  <mat-card-header>
                    <mat-card-title>{{concern.title}}</mat-card-title>
                    <mat-card-subtitle>
                      <div class="distance-info">
                        <mat-icon>location_on</mat-icon>
                        {{calculateDistance(concern)}}km away
                      </div>
                    </mat-card-subtitle>
                  </mat-card-header>
                  
                  <mat-card-content>
                    <p class="concern-description">{{concern.description | slice:0:100}}{{concern.description.length > 100 ? '...' : ''}}</p>
                    
                    <div class="concern-meta">
                      <div class="meta-item">
                        <mat-icon>category</mat-icon>
                        {{concern.category}}
                      </div>
                      <div class="meta-item">
                        <mat-icon>location_city</mat-icon>
                        {{concern.region || 'Unknown Region'}}
                      </div>
                      <div class="meta-item">
                        <mat-icon>schedule</mat-icon>
                        {{formatDate(concern.createdAt)}}
                      </div>
                    </div>
                    
                    <div class="concern-chips">
                      <mat-chip [class]="getStatusClass(concern.status)">
                        {{getStatusDisplayName(concern.status)}}
                      </mat-chip>
                      <mat-chip [class]="getPriorityClass(concern.priority)">
                        {{getPriorityDisplayName(concern.priority)}} Priority
                      </mat-chip>
                      @if (concern.isAnonymous) {
                        <mat-chip class="anonymous-chip">Anonymous</mat-chip>
                      }
                      @if (isOwnConcern(concern)) {
                        <mat-chip class="own-concern-chip">Your Concern</mat-chip>
                      }
                    </div>
                    
                    <div class="voting-section">
                      <button 
                        mat-icon-button 
                        (click)="upvoteConcern(concern)" 
                        [disabled]="isOwnConcern(concern)"
                        [class.voted]="hasUserVoted(concern, true)"
                        matTooltip="{{isOwnConcern(concern) ? 'Cannot vote on your own concern' : 'Upvote this concern'}}">
                        <mat-icon>thumb_up</mat-icon>
                      </button>
                      <span class="vote-count upvote">{{concern.upVotes}}</span>
                      
                      <button 
                        mat-icon-button 
                        (click)="downvoteConcern(concern)" 
                        [disabled]="isOwnConcern(concern)"
                        [class.voted]="hasUserVoted(concern, false)"
                        matTooltip="{{isOwnConcern(concern) ? 'Cannot vote on your own concern' : 'Downvote this concern'}}">
                        <mat-icon>thumb_down</mat-icon>
                      </button>
                      <span class="vote-count downvote">{{concern.downVotes}}</span>
                      
                      @if (concern.assignedDepartment) {
                        <div class="department-badge">
                          <mat-icon>business</mat-icon>
                          {{concern.assignedDepartment}}
                        </div>
                      }
                    </div>
                  </mat-card-content>
                  
                  <mat-card-actions>
                    <button mat-button color="primary" (click)="viewConcernDetails(concern)">
                      <mat-icon>visibility</mat-icon>
                      View Details
                    </button>
                    @if (!isOwnConcern(concern)) {
                      <button mat-button (click)="getDirections(concern)">
                        <mat-icon>directions</mat-icon>
                        Directions
                      </button>
                    }
                    <button mat-button (click)="shareConcern(concern)">
                      <mat-icon>share</mat-icon>
                      Share
                    </button>
                  </mat-card-actions>
                </mat-card>
              }
            </div>
            
            <!-- Pagination -->
            @if (concerns().totalPages > 1) {
              <mat-paginator 
                [length]="concerns().totalCount"
                [pageSize]="concerns().perPage"
                [pageIndex]="concerns().page - 1"
                [pageSizeOptions]="[6, 12, 24]"
                (page)="onPageChange($event)"
                showFirstLastButtons>
              </mat-paginator>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .nearby-container {
      padding: 16px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .mobile-layout {
      padding: 8px;
    }
    
    .header-section {
      text-align: center;
      margin-bottom: 24px;
    }
    
    .header-section h1 {
      color: #1976d2;
      margin-bottom: 8px;
    }
    
    .header-section p {
      color: #666;
      font-size: 1.1rem;
    }
    
    .location-card, .filters-card {
      margin-bottom: 24px;
    }
    
    .location-status {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
    }
    
    .location-status.getting {
      background-color: #e3f2fd;
      color: #1976d2;
    }
    
    .location-status.success {
      background-color: #e8f5e8;
      color: #2e7d32;
    }
    
    .location-status.error {
      background-color: #ffebee;
      color: #d32f2f;
      justify-content: space-between;
      flex-wrap: wrap;
    }
    
    .filters-row {
      display: flex;
      gap: 16px;
      align-items: flex-end;
      flex-wrap: wrap;
    }
    
    .filters-row mat-form-field {
      min-width: 150px;
    }
    
    .radius-control {
      flex: 1;
      min-width: 200px;
    }
    
    .radius-control label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      color: #666;
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
    
    .error-card {
      margin-bottom: 24px;
    }
    
    .error-content {
      display: flex;
      align-items: center;
      gap: 16px;
      color: #d32f2f;
    }
    
    .error-content mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    
    .results-header {
      text-align: center;
      margin-bottom: 24px;
    }
    
    .results-header h3 {
      color: #333;
      font-weight: 500;
    }
    
    .concerns-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    
    .mobile-layout .concerns-grid {
      grid-template-columns: 1fr;
    }
    
    .concern-card {
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative;
    }
    
    .concern-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .concern-card.own-concern {
      border-left: 4px solid #1976d2;
    }
    
    .distance-info {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #666;
    }
    
    .distance-info mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    
    .concern-description {
      margin: 16px 0;
      color: #444;
      line-height: 1.5;
    }
    
    .concern-meta {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: 16px 0;
    }
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #666;
    }
    
    .meta-item mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    
    .concern-chips {
      display: flex;
      gap: 8px;
      margin: 16px 0;
      flex-wrap: wrap;
    }
    
    .voting-section {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      flex-wrap: wrap;
    }
    
    .vote-count {
      font-weight: 500;
      min-width: 20px;
      text-align: center;
      font-size: 14px;
    }
    
    .vote-count.upvote {
      color: #4caf50;
    }
    
    .vote-count.downvote {
      color: #f44336;
    }
    
    .voted {
      color: #1976d2 !important;
      background-color: rgba(25, 118, 210, 0.1) !important;
    }
    
    .department-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-left: auto;
      padding: 4px 8px;
      background-color: #f5f5f5;
      border-radius: 12px;
      font-size: 12px;
      color: #666;
    }
    
    .department-badge mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
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
    
    /* Status chip colors */
    .status-new { background-color: #e3f2fd; color: #1976d2; }
    .status-acknowledged { background-color: #fff3e0; color: #f57c00; }
    .status-inprogress { background-color: #fff3e0; color: #ef6c00; }
    .status-resolved { background-color: #e8f5e8; color: #2e7d32; }
    .status-closed { background-color: #f5f5f5; color: #757575; }
    
    /* Priority colors */
    .priority-high { background-color: #ffebee; color: #d32f2f; }
    .priority-medium { background-color: #fff3e0; color: #f57c00; }
    .priority-low { background-color: #e8f5e8; color: #388e3c; }
    
    .anonymous-chip {
      background-color: #9e9e9e;
      color: white;
    }
    
    .own-concern-chip {
      background-color: #1976d2;
      color: white;
    }
    
    mat-card-actions {
      display: flex;
      gap: 8px;
      padding: 16px;
      flex-wrap: wrap;
    }
    
    @media (max-width: 768px) {
      .filters-row {
        flex-direction: column;
        align-items: stretch;
      }
      
      .filters-row mat-form-field {
        min-width: auto;
      }
      
      .concerns-grid {
        grid-template-columns: 1fr;
      }
      
      .voting-section {
        justify-content: space-between;
      }
      
      mat-card-actions {
        justify-content: space-around;
      }
      
      mat-card-actions button {
        flex: 1;
        min-width: 0;
      }
    }
  `]
})
export class NearbyConcernsComponent implements OnInit {
  concerns = signal<PaginatedResponse<Concern>>({ data: [], totalCount: 0, page: 1, perPage: 12, totalPages: 0 });
  availableCategories = signal<string[]>([]);
  currentLocation = signal<LocationInfo | null>(null);
  isLoading = signal(false);
  gettingLocation = signal(false);
  errorMessage = signal('');

  // Filters
  selectedCategory = '';
  selectedStatus: ConcernStatus | '' = '';
  radiusKm = 5;

  // Enums for template
  ConcernStatus = ConcernStatus;

  constructor(
    public layoutService: LayoutService,
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.getCurrentLocation();
  }

  getCurrentLocation() {
    if (!navigator.geolocation) {
      this.errorMessage.set('Geolocation is not supported by this browser');
      return;
    }

    this.gettingLocation.set(true);
    this.errorMessage.set('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.currentLocation.set({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        this.gettingLocation.set(false);
        this.loadNearbyConcerns();
      },
      (error) => {
        this.gettingLocation.set(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            this.errorMessage.set('Location access denied. Please enable location services to see nearby concerns.');
            break;
          case error.POSITION_UNAVAILABLE:
            this.errorMessage.set('Location information unavailable.');
            break;
          case error.TIMEOUT:
            this.errorMessage.set('Location request timed out.');
            break;
          default:
            this.errorMessage.set('An unknown error occurred while retrieving location.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
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

  loadNearbyConcerns() {
    if (!this.currentLocation()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const params: any = {
      page: this.concerns().page,
      limit: this.concerns().perPage
    };

    if (this.selectedCategory) params.category = this.selectedCategory;
    if (this.selectedStatus) params.status = this.selectedStatus.toString();

    this.apiService.getConcerns(params).subscribe({
      next: (response) => {
        // Filter concerns by distance (simulated - in real app, backend would handle this)
        const nearbyConcerns = response.data.filter(concern => {
          if (concern.location) {
            const distance = this.calculateDistanceFromLocation(
              this.currentLocation()!.latitude,
              this.currentLocation()!.longitude,
              concern.location.latitude,
              concern.location.longitude
            );
            return distance <= this.radiusKm;
          }
          return true; // Include concerns without location for now
        });

        this.concerns.set({
          ...response,
          data: nearbyConcerns,
          totalCount: nearbyConcerns.length,
          totalPages: Math.ceil(nearbyConcerns.length / response.perPage)
        });
        
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Failed to load nearby concerns');
        this.isLoading.set(false);
        console.error('Failed to load concerns:', error);
      }
    });
  }

  onRadiusChange() {
    // Debounce the radius change to avoid too many API calls
    setTimeout(() => {
      this.loadNearbyConcerns();
    }, 500);
  }

  onPageChange(event: PageEvent) {
    this.concerns.update(current => ({
      ...current,
      page: event.pageIndex + 1,
      perPage: event.pageSize
    }));
    this.loadNearbyConcerns();
  }

  calculateDistance(concern: Concern): string {
    if (!concern.location || !this.currentLocation()) {
      return '?';
    }

    const distance = this.calculateDistanceFromLocation(
      this.currentLocation()!.latitude,
      this.currentLocation()!.longitude,
      concern.location.latitude,
      concern.location.longitude
    );

    return distance.toFixed(1);
  }

  private calculateDistanceFromLocation(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  upvoteConcern(concern: Concern) {
    if (this.isOwnConcern(concern)) return;

    const voteRequest: VoteRequest = { isUpVote: true };
    
    this.apiService.voteConcern(concern.id, voteRequest).subscribe({
      next: (response) => {
        // Update the concern with new vote counts
        const concernIndex = this.concerns().data.findIndex(c => c.id === concern.id);
        if (concernIndex !== -1) {
          const updatedData = [...this.concerns().data];
          updatedData[concernIndex] = {
            ...updatedData[concernIndex],
            upVotes: response.upVotes,
            downVotes: response.downVotes,
            priority: response.priority
          };
          
          this.concerns.update(current => ({
            ...current,
            data: updatedData
          }));
        }
      },
      error: (error) => {
        console.error('Failed to vote:', error);
      }
    });
  }

  downvoteConcern(concern: Concern) {
    if (this.isOwnConcern(concern)) return;

    const voteRequest: VoteRequest = { isUpVote: false };
    
    this.apiService.voteConcern(concern.id, voteRequest).subscribe({
      next: (response) => {
        // Update the concern with new vote counts
        const concernIndex = this.concerns().data.findIndex(c => c.id === concern.id);
        if (concernIndex !== -1) {
          const updatedData = [...this.concerns().data];
          updatedData[concernIndex] = {
            ...updatedData[concernIndex],
            upVotes: response.upVotes,
            downVotes: response.downVotes,
            priority: response.priority
          };
          
          this.concerns.update(current => ({
            ...current,
            data: updatedData
          }));
        }
      },
      error: (error) => {
        console.error('Failed to vote:', error);
      }
    });
  }

  isOwnConcern(concern: Concern): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.id === concern.citizenId;
  }

  hasUserVoted(concern: Concern, isUpVote: boolean): boolean {
    // This would need to be tracked by the backend API
    // For now, return false as we don't have user vote history
    return false;
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

  viewConcernDetails(concern: Concern) {
    // Navigate to concern details
    console.log('Viewing concern details:', concern.id);
  }

  getDirections(concern: Concern) {
    if (concern.location && this.currentLocation()) {
      const url = `https://www.google.com/maps/dir/${this.currentLocation()!.latitude},${this.currentLocation()!.longitude}/${concern.location.latitude},${concern.location.longitude}`;
      window.open(url, '_blank');
    }
  }

  shareConcern(concern: Concern) {
    if (navigator.share) {
      navigator.share({
        title: `Concern: ${concern.title}`,
        text: `Check out this local concern: ${concern.description}`,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(`${concern.title}: ${window.location.href}`);
      alert('Concern link copied to clipboard!');
    }
  }
}