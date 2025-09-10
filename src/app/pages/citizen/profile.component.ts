import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { LayoutService } from '../../core/services/layout.service';

@Component({
  selector: 'app-citizen-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  template: `
    <div class="profile-container" [class.mobile-layout]="layoutService.isMobile()">
      <h1>My Profile</h1>
      
      <mat-card>
        <mat-card-header>
          <mat-card-title>Personal Information</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
            <div class="form-row">
              <mat-form-field class="half-width">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="firstName">
              </mat-form-field>
              
              <mat-form-field class="half-width">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="lastName">
              </mat-form-field>
            </div>
            
            <mat-form-field class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email">
            </mat-form-field>
            
            <mat-form-field class="full-width">
              <mat-label>Phone</mat-label>
              <input matInput type="tel" formControlName="phone">
            </mat-form-field>
            
            <mat-form-field class="full-width">
              <mat-label>Address</mat-label>
              <textarea matInput formControlName="address" rows="3"></textarea>
            </mat-form-field>
            
            <div class="form-row">
              <mat-form-field class="half-width">
                <mat-label>City</mat-label>
                <input matInput formControlName="city">
              </mat-form-field>
              
              <mat-form-field class="half-width">
                <mat-label>Ward</mat-label>
                <input matInput formControlName="ward">
              </mat-form-field>
            </div>
            
            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="!profileForm.valid">
                <mat-icon>save</mat-icon>
                Update Profile
              </button>
              <button mat-button type="button" (click)="resetForm()">
                <mat-icon>refresh</mat-icon>
                Reset
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
      
      <mat-card class="stats-card">
        <mat-card-header>
          <mat-card-title>My Activity</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <div class="stats-grid">
            <div class="stat-item">
              <mat-icon>report</mat-icon>
              <span class="stat-number">5</span>
              <span class="stat-label">Concerns Submitted</span>
            </div>
            
            <div class="stat-item">
              <mat-icon>check_circle</mat-icon>
              <span class="stat-number">3</span>
              <span class="stat-label">Resolved</span>
            </div>
            
            <div class="stat-item">
              <mat-icon>thumb_up</mat-icon>
              <span class="stat-number">24</span>
              <span class="stat-label">Community Votes</span>
            </div>
            
            <div class="stat-item">
              <mat-icon>stars</mat-icon>
              <span class="stat-number">150</span>
              <span class="stat-label">Points Earned</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .mobile-layout {
      padding: 16px;
    }
    
    h1 {
      color: #1976d2;
      text-align: center;
      margin: 0;
    }
    
    .form-row {
      display: flex;
      gap: 16px;
    }
    
    .mobile-layout .form-row {
      flex-direction: column;
      gap: 0;
    }
    
    .full-width {
      width: 100%;
    }
    
    .half-width {
      flex: 1;
    }
    
    .mobile-layout .half-width {
      width: 100%;
    }
    
    .form-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      margin-top: 24px;
    }
    
    .mobile-layout .form-actions {
      flex-direction: column;
    }
    
    .mobile-layout .form-actions button {
      width: 100%;
    }
    
    .stats-card {
      margin-top: 16px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 16px;
    }
    
    .mobile-layout .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 16px;
      border-radius: 8px;
      background-color: #f5f5f5;
    }
    
    .stat-item mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #1976d2;
      margin-bottom: 8px;
    }
    
    .stat-number {
      font-size: 24px;
      font-weight: bold;
      color: #1976d2;
      margin-bottom: 4px;
    }
    
    .stat-label {
      font-size: 12px;
      color: #666;
    }
  `]
})
export class CitizenProfileComponent {
  profileForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public layoutService: LayoutService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['John', Validators.required],
      lastName: ['Doe', Validators.required],
      email: ['john.doe@example.com', [Validators.required, Validators.email]],
      phone: ['+1-555-0123', Validators.required],
      address: ['123 Main Street\nApt 4B', Validators.required],
      city: ['Sample City', Validators.required],
      ward: ['Ward 5', Validators.required]
    });
  }

  updateProfile() {
    if (this.profileForm.valid) {
      console.log('Profile updated:', this.profileForm.value);
      // In real app, would call API to update profile
    }
  }

  resetForm() {
    this.profileForm.reset();
    // Reload original values
    this.profileForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      address: '123 Main Street\nApt 4B',
      city: 'Sample City',
      ward: 'Ward 5'
    });
  }
}