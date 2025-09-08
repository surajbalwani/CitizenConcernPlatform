import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth/auth.service';

@Component({
  selector: 'app-role-redirect',
  standalone: true,
  template: `<p>Redirecting...</p>`,
})
export class RoleRedirectComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  // Citizen = 1,
  // Officer = 2,
  // DepartmentHead = 3,
  // Admin = 4,
  // SuperAdmin = 5

  ngOnInit() {
    const userRole = this.authService.getUserRole() as number;

    switch (userRole) {
      case 1: //'Citizen':
        this.router.navigate(['/citizen']);
        break;
      case 4:
      case 5:
        this.router.navigate(['/admin']);
        break;
      case 2:
      case 3:
        this.router.navigate(['/officer']);
        break;
      default:
        this.router.navigate(['/login']);
        break;
    }
  }
}
