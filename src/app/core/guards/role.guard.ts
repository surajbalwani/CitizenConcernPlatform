import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] as Array<string>;
    const userRole = this.authService.getUserRole();
    
    if (requiredRoles && userRole) {
      const userRoleName = this.getRoleDisplayName(userRole);
      if (requiredRoles.includes(userRoleName)) {
        return true;
      }
    }
    
    // Redirect to appropriate dashboard based on role
    this.redirectToAppropriateRoute(userRole);
    return false;
  }

  private getRoleDisplayName(role: UserRole): string {
    switch (role) {
      case UserRole.Citizen:
        return 'Citizen';
      case UserRole.Officer:
        return 'Officer';
      case UserRole.DepartmentHead:
        return 'DepartmentHead';
      case UserRole.Admin:
        return 'Admin';
      case UserRole.SuperAdmin:
        return 'SuperAdmin';
      default:
        return 'Unknown';
    }
  }

  private redirectToAppropriateRoute(userRole: UserRole | null): void {
    if (!userRole) {
      this.router.navigate(['/auth/login']);
      return;
    }

    switch (userRole) {
      case UserRole.Citizen:
        this.router.navigate(['/citizen']);
        break;
      case UserRole.Admin:
      case UserRole.SuperAdmin:
      case UserRole.DepartmentHead:
        this.router.navigate(['/admin']);
        break;
      case UserRole.Officer:
        this.router.navigate(['/admin']); // Officers can also use admin dashboard
        break;
      default:
        this.router.navigate(['/auth/login']);
        break;
    }
  }
}