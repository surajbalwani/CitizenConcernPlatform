import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { LoginRequest } from '../../core/models/api.models';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-container">
       
      <mat-card class="login-card">
        <div class="login-logo">
          <img src="assets/images/citizen-sphere-logo.png" alt="Citizen Sphere Logo" class="app-logo">
        </div>
        <mat-card-header class="header-with-padding">
          <mat-card-title>Login</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="onLogin()">
            <mat-form-field class="full-width" appearance="outline">
              <mat-label>Email</mat-label>
              <input
                matInput
                type="email"
                [(ngModel)]="email"
                name="email"
                required
              />
            </mat-form-field>

            <mat-form-field class="full-width" appearance="outline">
              <mat-label>Password</mat-label>
              <input
                matInput
                type="password"
                [(ngModel)]="password"
                name="password"
                required
              />
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="full-width"
              [disabled]="isLoading"
            >
              <mat-spinner
                diameter="20"
                *ngIf="isLoading"
                style="margin-right: 8px;"
              ></mat-spinner>
              {{ isLoading ? 'Logging in...' : 'Login' }}
            </button>

            <div *ngIf="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #009ca6 100%);
        position: relative;
        z-index: 1;
      }
      .login-card {
        max-width: 400px;
        width: 100%;
        position: relative;
        z-index: 2;
      }
      .full-width {
        width: 100%;
        margin-bottom: 16px;
      }
      .full-width input {
        cursor: text;
        pointer-events: auto;
      }
      .error-message {
        color: #f44336;
        font-size: 14px;
        margin-top: 16px;
        text-align: center;
      }
      .header-with-padding {
        padding-bottom: 20px;
      }
      mat-form-field {
        position: relative;
        z-index: 3;
      }
      mat-form-field input {
        cursor: text !important;
        pointer-events: auto !important;
        background-color: transparent !important;
        background: none !important;
      }
     
      /* Remove background from Material Design input field */
      ::ng-deep .mat-mdc-form-field .mat-mdc-text-field-wrapper {
        background-color: transparent !important;
      }
     
      ::ng-deep .mat-mdc-form-field .mdc-text-field {
        background-color: transparent !important;
      }
     
      ::ng-deep .mat-mdc-form-field .mdc-text-field--filled {
        background-color: transparent !important;
      }
      app-logo {
        height: 58px; // Adjust height as needed
        width: auto;
        margin-right: 8px;
        vertical-align: middle;
      }

    `,
  ],
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loginRequest: LoginRequest = {
      email: this.email,
      password: this.password,
    };

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Navigate to default route based on user role
        const defaultRoute = this.authService.getDefaultRoute();
        this.router.navigate([defaultRoute]);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Login failed. Please try again.';
      },
    });
  }
}
