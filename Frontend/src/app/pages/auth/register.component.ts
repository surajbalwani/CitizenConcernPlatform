import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RegisterRequest, UserRole } from '../../core/models/api.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>Register for Citizen Concern Platform</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="onRegister()">
            <div class="form-row">
              <mat-form-field class="half-width">
                <mat-label>First Name</mat-label>
                <input matInput [(ngModel)]="firstName" name="firstName" required>
              </mat-form-field>
              
              <mat-form-field class="half-width">
                <mat-label>Last Name</mat-label>
                <input matInput [(ngModel)]="lastName" name="lastName" required>
              </mat-form-field>
            </div>
            
            <mat-form-field class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" [(ngModel)]="email" name="email" required>
            </mat-form-field>
            
            <mat-form-field class="full-width">
              <mat-label>Phone Number</mat-label>
              <input matInput [(ngModel)]="phoneNumber" name="phoneNumber">
            </mat-form-field>
            
            <mat-form-field class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" [(ngModel)]="password" name="password" required>
            </mat-form-field>
            
            <mat-form-field class="full-width">
              <mat-label>Confirm Password</mat-label>
              <input matInput type="password" [(ngModel)]="confirmPassword" name="confirmPassword" required>
            </mat-form-field>
            
            <mat-form-field class="full-width">
              <mat-label>Address</mat-label>
              <input matInput [(ngModel)]="address" name="address">
            </mat-form-field>
            
            <div class="form-row">
              <mat-form-field class="half-width">
                <mat-label>Region</mat-label>
                <input matInput [(ngModel)]="region" name="region">
              </mat-form-field>
              
              <mat-form-field class="half-width">
                <mat-label>Ward</mat-label>
                <input matInput [(ngModel)]="ward" name="ward">
              </mat-form-field>
            </div>
            
            <mat-form-field class="full-width">
              <mat-label>Account Type</mat-label>
              <mat-select [(ngModel)]="selectedRole" name="role" required>
                <mat-option [value]="UserRole.Citizen">Citizen</mat-option>
                <mat-option [value]="UserRole.Officer">Officer</mat-option>
                <mat-option [value]="UserRole.DepartmentHead">Department Head</mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field *ngIf="selectedRole !== UserRole.Citizen" class="full-width">
              <mat-label>Department</mat-label>
              <input matInput [(ngModel)]="department" name="department">
            </mat-form-field>
            
            <button mat-raised-button color="primary" type="submit" class="full-width" [disabled]="isLoading">
              <mat-spinner diameter="20" *ngIf="isLoading" style="margin-right: 8px;"></mat-spinner>
              {{ isLoading ? 'Creating Account...' : 'Create Account' }}
            </button>
            
            <div *ngIf="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>
            
            <div *ngIf="successMessage" class="success-message">
              {{ successMessage }}
            </div>
            
            <div class="login-link">
              Already have an account? <a (click)="goToLogin()">Login here</a>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .register-card {
      max-width: 500px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .form-row {
      display: flex;
      gap: 16px;
    }
    .half-width {
      flex: 1;
      margin-bottom: 16px;
    }
    .error-message {
      color: #f44336;
      font-size: 14px;
      margin-top: 16px;
      text-align: center;
    }
    .success-message {
      color: #4caf50;
      font-size: 14px;
      margin-top: 16px;
      text-align: center;
    }
    .login-link {
      text-align: center;
      margin-top: 16px;
      font-size: 14px;
    }
    .login-link a {
      color: #1976d2;
      cursor: pointer;
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
  firstName = '';
  lastName = '';
  email = '';
  phoneNumber = '';
  password = '';
  confirmPassword = '';
  address = '';
  region = '';
  ward = '';
  selectedRole = UserRole.Citizen;
  department = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  UserRole = UserRole;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onRegister() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const registerRequest: RegisterRequest = {
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      address: this.address || undefined,
      region: this.region || undefined,
      ward: this.ward || undefined,
      role: this.selectedRole,
      department: this.selectedRole !== UserRole.Citizen ? this.department : undefined,
      phoneNumber: this.phoneNumber || undefined
    };

    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Account created successfully! You can now login.';
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Registration failed. Please try again.';
      }
    });
  }

  private validateForm(): boolean {
    if (!this.firstName || !this.lastName || !this.email || !this.password) {
      this.errorMessage = 'Please fill in all required fields';
      return false;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return false;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return false;
    }

    if (this.selectedRole !== UserRole.Citizen && !this.department) {
      this.errorMessage = 'Department is required for staff accounts';
      return false;
    }

    return true;
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}