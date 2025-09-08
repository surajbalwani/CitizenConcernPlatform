import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  UserResponse, 
  UserRole,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<UserResponse | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    // Check if user is already logged in on service initialization
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('currentUser');
    
    if (token && userString) {
      try {
        const user = JSON.parse(userString);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        
        // Optionally verify token is still valid
        this.verifyToken().subscribe({
          error: () => this.logout()
        });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.logout();
      }
    }
  }

  private verifyToken(): Observable<UserResponse> {
    return this.apiService.getProfile().pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      }),
      catchError(error => {
        this.logout();
        throw error;
      })
    );
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.loadingSubject.next(true);
    
    return this.apiService.login(credentials).pipe(
      tap(response => {
        this.currentUserSubject.next(response.user);
        this.isAuthenticatedSubject.next(true);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  register(userData: RegisterRequest): Observable<{ message: string; userId: string }> {
    this.loadingSubject.next(true);
    
    return this.apiService.register(userData).pipe(
      tap(response => {
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  logout(): void {
    this.apiService.logout();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<{ token: string }> {
    return this.apiService.refreshToken();
  }

  getProfile(): Observable<UserResponse> {
    return this.apiService.getProfile().pipe(
      tap(user => {
        this.currentUserSubject.next(user);
      })
    );
  }

  updateUserData(userData: UserResponse): void {
    this.currentUserSubject.next(userData);
  }

  changePassword(request: ChangePasswordRequest): Observable<{ message: string }> {
    return this.apiService.changePassword(request);
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<{ message: string }> {
    return this.apiService.forgotPassword(request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<{ message: string }> {
    return this.apiService.resetPassword(request);
  }

  // Utility methods
  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getCurrentUser(): UserResponse | null {
    return this.currentUserSubject.value;
  }

  getCurrentUserId(): string | null {
    return this.getCurrentUser()?.id || null;
  }

  getUserRole(): UserRole | null {
    return this.getCurrentUser()?.role || null;
  }

  hasRole(role: UserRole): boolean {
    const currentRole = this.getUserRole();
    return currentRole === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const currentRole = this.getUserRole();
    return currentRole ? roles.includes(currentRole) : false;
  }

  isCitizen(): boolean {
    return this.hasRole(UserRole.Citizen);
  }

  isOfficer(): boolean {
    return this.hasRole(UserRole.Officer);
  }

  isDepartmentHead(): boolean {
    return this.hasRole(UserRole.DepartmentHead);
  }

  isAdmin(): boolean {
    return this.hasRole(UserRole.Admin);
  }

  isSuperAdmin(): boolean {
    return this.hasRole(UserRole.SuperAdmin);
  }

  isStaff(): boolean {
    return this.hasAnyRole([
      UserRole.Officer, 
      UserRole.DepartmentHead, 
      UserRole.Admin, 
      UserRole.SuperAdmin
    ]);
  }

  canManageConcerns(): boolean {
    return this.hasAnyRole([
      UserRole.Officer, 
      UserRole.DepartmentHead, 
      UserRole.Admin, 
      UserRole.SuperAdmin
    ]);
  }

  canViewAnalytics(): boolean {
    return this.hasAnyRole([
      UserRole.DepartmentHead, 
      UserRole.Admin, 
      UserRole.SuperAdmin
    ]);
  }

  canManageUsers(): boolean {
    return this.hasAnyRole([
      UserRole.Admin, 
      UserRole.SuperAdmin
    ]);
  }

  getDefaultRoute(): string {
    const role = this.getUserRole();
    
    switch (role) {
      case UserRole.Citizen:
        return '/citizen/dashboard';
      case UserRole.Officer:
        return '/officer/dashboard';
      case UserRole.DepartmentHead:
        return '/admin/dashboard';
      case UserRole.Admin:
        return '/admin/dashboard';
      case UserRole.SuperAdmin:
        return '/admin/dashboard';
      default:
        return '/auth/login';
    }
  }

  getWelcomeMessage(): string {
    const user = this.getCurrentUser();
    if (!user) return 'Welcome';
    
    const name = `${user.firstName} ${user.lastName}`.trim();
    const role = this.getRoleDisplayName(user.role);
    
    return `Welcome, ${name} (${role})`;
  }

  getRoleDisplayName(role: UserRole): string {
    switch (role) {
      case UserRole.Citizen:
        return 'Citizen';
      case UserRole.Officer:
        return 'Officer';
      case UserRole.DepartmentHead:
        return 'Department Head';
      case UserRole.Admin:
        return 'Administrator';
      case UserRole.SuperAdmin:
        return 'Super Administrator';
      default:
        return 'User';
    }
  }

  // Token management
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  shouldRefreshToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      // Refresh if token expires within 5 minutes
      return (payload.exp - currentTime) < 300;
    } catch (error) {
      return false;
    }
  }
}
