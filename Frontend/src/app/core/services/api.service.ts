import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  AddCommentRequest,
  ApiError,
  Category,
  ChangePasswordRequest,
  Concern,
  ConcernAnalytics,
  CreateConcernRequest,
  Department,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  PaginatedResponse,
  QueryParams,
  RegisterRequest,
  ResetPasswordRequest,
  UpdateStatusRequest,
  UserNotification,
  UserResponse,
  VoteRequest,
} from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly apiUrl = environment.apiUrl || 'https://localhost:7001/api';
  private tokenSubject = new BehaviorSubject<string | null>(
    localStorage.getItem('token')
  );
  private currentUserSubject = new BehaviorSubject<UserResponse | null>(
    JSON.parse(localStorage.getItem('currentUser') || 'null')
  );

  public token$ = this.tokenSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Helper Methods
  private getAuthHeaders(): HttpHeaders {
    const token = this.tokenSubject.value;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);

    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.status === 401) {
        this.logout();
        errorMessage = 'Unauthorized. Please login again.';
      } else if (error.status === 403) {
        errorMessage = 'Access denied. Insufficient permissions.';
      } else if (error.status === 404) {
        errorMessage = 'Resource not found.';
      } else if (error.status === 500) {
        errorMessage = 'Internal server error. Please try again later.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    const apiError: ApiError = {
      message: errorMessage,
      status: error.status,
      errors: error.error?.errors,
    };

    return throwError(() => apiError);
  }

  private buildHttpParams(params?: QueryParams): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach((key) => {
        const value = (params as any)[key];
        if (value !== null && value !== undefined) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return httpParams;
  }

  // Authentication Methods
  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, request)
      .pipe(
        map((response) => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.tokenSubject.next(response.token);
          this.currentUserSubject.next(response.user);
          return response;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  register(
    request: RegisterRequest
  ): Observable<{ message: string; userId: string }> {
    return this.http
      .post<{ message: string; userId: string }>(
        `${this.apiUrl}/auth/register`,
        request
      )
      .pipe(catchError(this.handleError.bind(this)));
  }

  refreshToken(): Observable<{ token: string }> {
    return this.http
      .post<{ token: string }>(
        `${this.apiUrl}/auth/refresh-token`,
        {},
        {
          headers: this.getAuthHeaders(),
        }
      )
      .pipe(
        map((response) => {
          localStorage.setItem('token', response.token);
          this.tokenSubject.next(response.token);
          return response;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  logout(): void {
    this.http
      .post(
        `${this.apiUrl}/auth/logout`,
        {},
        {
          headers: this.getAuthHeaders(),
        }
      )
      .subscribe({
        complete: () => {
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
          this.tokenSubject.next(null);
          this.currentUserSubject.next(null);
        },
        error: () => {
          // Force logout even if API call fails
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
          this.tokenSubject.next(null);
          this.currentUserSubject.next(null);
        },
      });
  }

  getProfile(): Observable<UserResponse> {
    return this.http
      .get<UserResponse>(`${this.apiUrl}/auth/profile`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((user) => {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  changePassword(
    request: ChangePasswordRequest
  ): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(
        `${this.apiUrl}/auth/change-password`,
        request,
        {
          headers: this.getAuthHeaders(),
        }
      )
      .pipe(catchError(this.handleError.bind(this)));
  }

  forgotPassword(
    request: ForgotPasswordRequest
  ): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.apiUrl}/auth/forgot-password`, request)
      .pipe(catchError(this.handleError.bind(this)));
  }

  resetPassword(
    request: ResetPasswordRequest
  ): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.apiUrl}/auth/reset-password`, request)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Concern Methods
  getConcerns(params?: QueryParams): Observable<PaginatedResponse<Concern>> {
    const httpParams = this.buildHttpParams(params);

    return this.http
      .get<Concern[]>(`${this.apiUrl}/concerns`, {
        params: httpParams,
        observe: 'response',
      })
      .pipe(
        map((response) => {
          const totalCount = parseInt(
            response.headers.get('X-Total-Count') || '0'
          );
          const page = parseInt(response.headers.get('X-Page') || '1');
          const perPage = parseInt(response.headers.get('X-Per-Page') || '10');

          return {
            data: response.body || [],
            totalCount,
            page,
            perPage,
            totalPages: Math.ceil(totalCount / perPage),
          };
        }),
        catchError(this.handleError.bind(this))
      );
  }

  getConcern(id: number): Observable<Concern> {
    return this.http
      .get<Concern>(`${this.apiUrl}/concerns/${id}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  createConcern(request: CreateConcernRequest): Observable<Concern> {
    return this.http
      .post<Concern>(`${this.apiUrl}/concerns`, request)
      .pipe(catchError(this.handleError.bind(this)));
  }

  updateConcernStatus(
    id: number,
    request: UpdateStatusRequest
  ): Observable<void> {
    return this.http
      .put<void>(`${this.apiUrl}/concerns/${id}/status`, request, {
        headers: this.getAuthHeaders(),
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  voteConcern(
    id: number,
    request: VoteRequest
  ): Observable<{ upVotes: number; downVotes: number; priority: number }> {
    return this.http
      .post<{ upVotes: number; downVotes: number; priority: number }>(
        `${this.apiUrl}/concerns/${id}/vote`,
        request
      )
      .pipe(catchError(this.handleError.bind(this)));
  }

  addComment(id: number, request: AddCommentRequest): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/concerns/${id}/comments`, request)
      .pipe(catchError(this.handleError.bind(this)));
  }

  getConcernAnalytics(): Observable<ConcernAnalytics> {
    return this.http
      .get<ConcernAnalytics>(`${this.apiUrl}/concerns/analytics`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  // User Management (Admin only)
  getUsers(params?: QueryParams): Observable<PaginatedResponse<UserResponse>> {
    const httpParams = this.buildHttpParams(params);

    return this.http
      .get<PaginatedResponse<UserResponse>>(`${this.apiUrl}/users`, {
        params: httpParams,
        observe: 'response',
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((response) => {
          return response.body as PaginatedResponse<UserResponse>;
          // const totalCount = parseInt(
          //   response.headers.get('X-Total-Count') || '0'
          // );
          // const page = parseInt(response.headers.get('X-Page') || '1');
          // const perPage = parseInt(response.headers.get('X-Per-Page') || '10');

          // return {
          //   data: response.body || [],
          //   totalCount,
          //   page,
          //   perPage,
          //   totalPages: Math.ceil(totalCount / perPage),
          // };
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // Categories
  getCategories(): Observable<Category[]> {
    return this.http
      .get<Category[]>(`${this.apiUrl}/categories`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Departments
  getDepartments(): Observable<Department[]> {
    return this.http
      .get<Department[]>(`${this.apiUrl}/departments`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Notifications
  getUserNotifications(userId: string): Observable<UserNotification[]> {
    return this.http
      .get<UserNotification[]>(`${this.apiUrl}/notifications/user/${userId}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  markNotificationAsRead(id: number): Observable<void> {
    return this.http
      .put<void>(
        `${this.apiUrl}/notifications/${id}/read`,
        {},
        {
          headers: this.getAuthHeaders(),
        }
      )
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Utility Methods
  isLoggedIn(): boolean {
    return !!this.tokenSubject.value;
  }

  getCurrentUser(): UserResponse | null {
    return this.currentUserSubject.value;
  }

  getCurrentToken(): string | null {
    return this.tokenSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role?.toString().toLowerCase() === role.toLowerCase();
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }
}
