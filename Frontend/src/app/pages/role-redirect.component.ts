import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth/auth.service';

@Component({
  selector: 'app-role-redirect',
  standalone: true,
  template: `<p>Redirecting...</p>`
})
export class RoleRedirectComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const userRole = this.authService.getUserRole();
    
    switch (userRole) {
      case 'Citizen':
        this.router.navigate(['/citizen']);
        break;
      case 'Admin':
      case 'SuperAdmin':
        this.router.navigate(['/admin']);
        break;
      case 'Officer':
      case 'DepartmentHead':
        this.router.navigate(['/officer']);
        break;
      default:
        this.router.navigate(['/login']);
        break;
    }
  }
}