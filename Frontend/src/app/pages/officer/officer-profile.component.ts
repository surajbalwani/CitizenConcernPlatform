import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';

import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { UserResponse, UserRole } from '../../core/models/api.models';

@Component({
  selector: 'app-officer-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatDividerModule,
    MatChipsModule,
    MatBadgeModule
  ],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <h1 class="page-title">
          <mat-icon>person</mat-icon>
          Officer Profile
        </h1>
        <p class="page-subtitle">Manage your profile and settings</p>
      </div>

      @if (isLoading()) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading profile...</p>
        </div>
      } @else {
        <div class="profile-content">
          <div class="profile-sidebar">
            <mat-card class="profile-summary">
              <mat-card-content>
                <div class="profile-avatar">
                  <div class="avatar-circle">
                    <mat-icon>person</mat-icon>
                  </div>
                  <button mat-icon-button class="change-photo-btn" matTooltip="Change Photo">
                    <mat-icon>camera_alt</mat-icon>
                  </button>
                </div>
                
                <div class="profile-info">
                  <h2>{{ currentOfficer()?.firstName }} {{ currentOfficer()?.lastName }}</h2>
                  <p class="role">{{ currentOfficer()?.role }}</p>
                  <p class="department">{{ currentOfficer()?.department || 'General Department' }}</p>
                  <p class="email">{{ currentOfficer()?.email }}</p>
                </div>

                <mat-divider></mat-divider>

                <div class="profile-stats">
                  <div class="stat-item">
                    <span class="stat-label">Member Since</span>
                    <span class="stat-value">{{ currentOfficer()?.createdAt ? formatDate(currentOfficer()!.createdAt.toString()) : 'N/A' }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Status</span>
                    <mat-chip color="primary">{{ 'Active' }}</mat-chip>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Badge Number</span>
                    <span class="stat-value">{{ 'N/A' }}</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="quick-actions">
              <mat-card-header>
                <mat-card-title>Quick Actions</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="action-buttons">
                  <button mat-raised-button color="primary" (click)="viewMyConcerns()">
                    <mat-icon>assignment</mat-icon>
                    My Concerns
                  </button>
                  <button mat-raised-button (click)="generateReport()">
                    <mat-icon>description</mat-icon>
                    Generate Report
                  </button>
                  <button mat-raised-button (click)="viewSchedule()">
                    <mat-icon>schedule</mat-icon>
                    View Schedule
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <div class="profile-main">
            <mat-card class="profile-tabs-card">
              <mat-tab-group>
                <mat-tab label="Personal Information">
                  <div class="tab-content">
                    <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
                      <div class="form-row">
                        <mat-form-field>
                          <mat-label>First Name</mat-label>
                          <input matInput formControlName="firstName" placeholder="Enter first name">
                          @if (profileForm.get('firstName')?.hasError('required')) {
                            <mat-error>First name is required</mat-error>
                          }
                        </mat-form-field>

                        <mat-form-field>
                          <mat-label>Last Name</mat-label>
                          <input matInput formControlName="lastName" placeholder="Enter last name">
                          @if (profileForm.get('lastName')?.hasError('required')) {
                            <mat-error>Last name is required</mat-error>
                          }
                        </mat-form-field>
                      </div>

                      <div class="form-row">
                        <mat-form-field>
                          <mat-label>Email</mat-label>
                          <input matInput formControlName="email" type="email" placeholder="Enter email">
                          @if (profileForm.get('email')?.hasError('required')) {
                            <mat-error>Email is required</mat-error>
                          }
                          @if (profileForm.get('email')?.hasError('email')) {
                            <mat-error>Please enter a valid email</mat-error>
                          }
                        </mat-form-field>

                        <mat-form-field>
                          <mat-label>Phone Number</mat-label>
                          <input matInput formControlName="phoneNumber" type="tel" placeholder="Enter phone number">
                        </mat-form-field>
                      </div>

                      <div class="form-row">
                        <mat-form-field>
                          <mat-label>Department</mat-label>
                          <mat-select formControlName="department">
                            <mat-option value="Public Works">Public Works</mat-option>
                            <mat-option value="Transportation">Transportation</mat-option>
                            <mat-option value="Parks & Recreation">Parks & Recreation</mat-option>
                            <mat-option value="Public Safety">Public Safety</mat-option>
                            <mat-option value="Environmental Services">Environmental Services</mat-option>
                            <mat-option value="General">General</mat-option>
                          </mat-select>
                        </mat-form-field>

                        <mat-form-field>
                          <mat-label>Badge Number</mat-label>
                          <input matInput formControlName="badgeNumber" placeholder="Enter badge number">
                        </mat-form-field>
                      </div>

                      <mat-form-field class="full-width">
                        <mat-label>Bio</mat-label>
                        <textarea matInput formControlName="bio" rows="4" 
                                  placeholder="Tell us about yourself..."></textarea>
                      </mat-form-field>

                      <div class="form-actions">
                        <button mat-raised-button color="primary" type="submit" 
                                [disabled]="profileForm.invalid || isUpdating()">
                          @if (isUpdating()) {
                            <mat-spinner diameter="20"></mat-spinner>
                          }
                          <span>Update Profile</span>
                        </button>
                        <button mat-button type="button" (click)="resetForm()">
                          Reset
                        </button>
                      </div>
                    </form>
                  </div>
                </mat-tab>

                <mat-tab label="Change Password">
                  <div class="tab-content">
                    <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
                      <mat-form-field class="full-width">
                        <mat-label>Current Password</mat-label>
                        <input matInput formControlName="currentPassword" type="password" 
                               placeholder="Enter current password">
                        @if (passwordForm.get('currentPassword')?.hasError('required')) {
                          <mat-error>Current password is required</mat-error>
                        }
                      </mat-form-field>

                      <mat-form-field class="full-width">
                        <mat-label>New Password</mat-label>
                        <input matInput formControlName="newPassword" type="password" 
                               placeholder="Enter new password">
                        @if (passwordForm.get('newPassword')?.hasError('required')) {
                          <mat-error>New password is required</mat-error>
                        }
                        @if (passwordForm.get('newPassword')?.hasError('minlength')) {
                          <mat-error>Password must be at least 6 characters</mat-error>
                        }
                      </mat-form-field>

                      <mat-form-field class="full-width">
                        <mat-label>Confirm New Password</mat-label>
                        <input matInput formControlName="confirmPassword" type="password" 
                               placeholder="Confirm new password">
                        @if (passwordForm.get('confirmPassword')?.hasError('required')) {
                          <mat-error>Please confirm your password</mat-error>
                        }
                        @if (passwordForm.hasError('passwordMismatch') && passwordForm.get('confirmPassword')?.touched) {
                          <mat-error>Passwords do not match</mat-error>
                        }
                      </mat-form-field>

                      <div class="form-actions">
                        <button mat-raised-button color="primary" type="submit" 
                                [disabled]="passwordForm.invalid || isChangingPassword()">
                          @if (isChangingPassword()) {
                            <mat-spinner diameter="20"></mat-spinner>
                          }
                          <span>Change Password</span>
                        </button>
                        <button mat-button type="button" (click)="resetPasswordForm()">
                          Reset
                        </button>
                      </div>
                    </form>
                  </div>
                </mat-tab>

                <mat-tab label="Work History">
                  <div class="tab-content">
                    <div class="work-history-section">
                      <h3>Recent Activity</h3>
                      <div class="activity-timeline">
                        <div class="activity-item">
                          <mat-icon>assignment_turned_in</mat-icon>
                          <div class="activity-content">
                            <h4>Resolved 5 concerns this week</h4>
                            <p>Excellent progress on community issues</p>
                            <span class="activity-date">3 days ago</span>
                          </div>
                        </div>
                        <div class="activity-item">
                          <mat-icon>comment</mat-icon>
                          <div class="activity-content">
                            <h4>Updated 12 concern statuses</h4>
                            <p>Kept citizens informed about progress</p>
                            <span class="activity-date">1 week ago</span>
                          </div>
                        </div>
                        <div class="activity-item">
                          <mat-icon>star</mat-icon>
                          <div class="activity-content">
                            <h4>Received citizen commendation</h4>
                            <p>Excellent service for road repair issue</p>
                            <span class="activity-date">2 weeks ago</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <mat-divider></mat-divider>

                    <div class="performance-metrics">
                      <h3>Performance Metrics</h3>
                      <div class="metrics-grid">
                        <div class="metric-card">
                          <mat-icon>assignment</mat-icon>
                          <span class="metric-number">47</span>
                          <span class="metric-label">Total Assigned</span>
                        </div>
                        <div class="metric-card">
                          <mat-icon>check_circle</mat-icon>
                          <span class="metric-number">42</span>
                          <span class="metric-label">Resolved</span>
                        </div>
                        <div class="metric-card">
                          <mat-icon>speed</mat-icon>
                          <span class="metric-number">2.3</span>
                          <span class="metric-label">Avg. Days</span>
                        </div>
                        <div class="metric-card">
                          <mat-icon>thumb_up</mat-icon>
                          <span class="metric-number">96%</span>
                          <span class="metric-label">Satisfaction</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </mat-tab>
              </mat-tab-group>
            </mat-card>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .profile-header {
      margin-bottom: 30px;
    }

    .page-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-size: 2rem;
      font-weight: 500;
      color: #1976d2;
    }

    .page-subtitle {
      margin: 8px 0 0 0;
      color: #666;
      font-size: 1.1rem;
    }

    .loading-container {
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

    .profile-content {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 30px;
    }

    .profile-sidebar {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .profile-summary {
      text-align: center;
    }

    .profile-avatar {
      position: relative;
      display: inline-block;
      margin-bottom: 20px;
    }

    .avatar-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1976d2, #42a5f5);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 48px;
    }

    .change-photo-btn {
      position: absolute;
      bottom: 0;
      right: 0;
      background: #1976d2;
      color: white;
    }

    .profile-info h2 {
      margin: 0 0 8px 0;
      font-weight: 500;
    }

    .profile-info p {
      margin: 4px 0;
    }

    .role {
      color: #1976d2;
      font-weight: 500;
    }

    .department {
      color: #666;
    }

    .email {
      color: #333;
      font-family: monospace;
      font-size: 14px;
    }

    .profile-stats {
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-label {
      color: #666;
      font-size: 14px;
    }

    .stat-value {
      font-weight: 500;
    }

    .quick-actions {
      margin-top: 20px;
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .action-buttons button {
      justify-content: flex-start;
      gap: 8px;
    }

    .profile-tabs-card {
      min-height: 600px;
    }

    .tab-content {
      padding: 24px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }

    .form-actions button {
      min-width: 140px;
    }

    .work-history-section h3, .performance-metrics h3 {
      margin: 0 0 20px 0;
      color: #333;
    }

    .activity-timeline {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 32px;
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    .activity-item mat-icon {
      color: #1976d2;
      margin-top: 2px;
    }

    .activity-content h4 {
      margin: 0 0 4px 0;
      font-weight: 500;
    }

    .activity-content p {
      margin: 0 0 8px 0;
      color: #666;
    }

    .activity-date {
      font-size: 12px;
      color: #999;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .metric-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      text-align: center;
    }

    .metric-card mat-icon {
      color: #1976d2;
      margin-bottom: 8px;
    }

    .metric-number {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      margin-bottom: 4px;
    }

    .metric-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
    }

    @media (max-width: 768px) {
      .profile-content {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 480px) {
      .metrics-grid {
        grid-template-columns: 1fr;
      }

      .action-buttons button {
        width: 100%;
      }
    }
  `]
})
export class OfficerProfileComponent implements OnInit {
  currentOfficer = signal<UserResponse | null>(null);
  isLoading = signal<boolean>(false);
  isUpdating = signal<boolean>(false);
  isChangingPassword = signal<boolean>(false);
  
  profileForm: FormGroup;
  passwordForm: FormGroup;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      department: [''],
      badgeNumber: [''],
      bio: ['']
    });

    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.loadOfficerProfile();
  }

  loadOfficerProfile() {
    this.isLoading.set(true);
    const user = this.authService.getCurrentUser();
    
    if (user && (user.role === UserRole.Officer || user.role === UserRole.DepartmentHead)) {
      this.currentOfficer.set(user);
      this.populateForm(user);
      this.isLoading.set(false);
    } else {
      this.isLoading.set(false);
      this.snackBar.open('Unable to load officer profile', 'Close', {
        duration: 3000
      });
    }
  }

  populateForm(user: UserResponse) {
    this.profileForm.patchValue({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      department: user.department || '',
      badgeNumber: '',  // UserResponse doesn't have badgeNumber
      bio: ''  // UserResponse doesn't have bio
    });
  }

  updateProfile() {
    if (this.profileForm.valid) {
      this.isUpdating.set(true);
      const formData = this.profileForm.value;
      
      // Simulate API call - in real app, call this.apiService.updateProfile(formData)
      setTimeout(() => {
        const updatedUser = {
          ...this.currentOfficer()!,
          ...formData
        };
        this.currentOfficer.set(updatedUser);
        this.authService.updateUserData(updatedUser);
        
        this.isUpdating.set(false);
        this.snackBar.open('Profile updated successfully!', 'Close', {
          duration: 3000
        });
      }, 1000);
    }
  }

  changePassword() {
    if (this.passwordForm.valid) {
      this.isChangingPassword.set(true);
      const { currentPassword, newPassword } = this.passwordForm.value;
      
      // Simulate API call - in real app, call this.apiService.changePassword(currentPassword, newPassword)
      setTimeout(() => {
        this.isChangingPassword.set(false);
        this.resetPasswordForm();
        this.snackBar.open('Password changed successfully!', 'Close', {
          duration: 3000
        });
      }, 1000);
    }
  }

  resetForm() {
    if (this.currentOfficer()) {
      this.populateForm(this.currentOfficer()!);
      this.snackBar.open('Form reset to original values', 'Close', {
        duration: 2000
      });
    }
  }

  resetPasswordForm() {
    this.passwordForm.reset();
    Object.keys(this.passwordForm.controls).forEach(key => {
      this.passwordForm.get(key)?.setErrors(null);
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  viewMyConcerns() {
    this.snackBar.open('Navigating to your assigned concerns...', 'Close', {
      duration: 2000
    });
  }

  generateReport() {
    this.snackBar.open('Generating performance report...', 'Close', {
      duration: 2000
    });
  }

  viewSchedule() {
    this.snackBar.open('Opening work schedule...', 'Close', {
      duration: 2000
    });
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Not available';
    }
  }
}