import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Authentication routes
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/auth/login.component').then((c) => c.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/auth/register.component').then(
            (c) => c.RegisterComponent
          ),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  // // Legacy login route for backward compatibility
  // {
  //   path: 'login',
  //   redirectTo: '/auth/login'
  // },

  // Citizen routes (mobile-optimized)
  {
    path: 'citizen',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Citizen'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/citizen/citizen-dashboard.component').then(
            (c) => c.CitizenDashboardComponent
          ),
      },
      {
        path: 'submit',
        loadComponent: () =>
          import('./pages/citizen/submit-concern.component').then(
            (c) => c.SubmitConcernComponent
          ),
      },
      {
        path: 'track',
        loadComponent: () =>
          import('./pages/citizen/track-concerns.component').then(
            (c) => c.TrackConcernsComponent
          ),
      },
      {
        path: 'nearby',
        loadComponent: () =>
          import('./pages/citizen/nearby-concerns.component').then(
            (c) => c.NearbyConcernsComponent
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/citizen/profile.component').then(
            (c) => c.CitizenProfileComponent
          ),
      },
    ],
  },

  // Admin routes (full dashboard)
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin', 'SuperAdmin', 'DepartmentHead'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/admin/admin-dashboard.component').then(
            (c) => c.AdminDashboardComponent
          ),
      },
    ],
  },

  // Officer routes
  {
    path: 'officer',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Officer', 'DepartmentHead'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/officer/officer-dashboard.component').then(
            (c) => c.OfficerDashboardComponent
          ),
      },
      {
        path: 'concerns',
        loadComponent: () =>
          import('./pages/officer/officer-concerns.component').then(
            (c) => c.OfficerConcernsComponent
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/officer/officer-profile.component').then(
            (c) => c.OfficerProfileComponent
          ),
      },
    ],
  },

  // Auto-redirect based on role
  {
    path: '',
    loadComponent: () =>
      import('./pages/role-redirect.component').then(
        (c) => c.RoleRedirectComponent
      ),
    canActivate: [AuthGuard],
  },

  // Fallback
  { path: '**', redirectTo: '' },
];
