import { Injectable, signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  isMobile = signal(false);
  isTablet = signal(false);
  isDesktop = signal(false);

  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge
    ]).subscribe(result => {
      this.isMobile.set(result.breakpoints[Breakpoints.XSmall]);
      this.isTablet.set(result.breakpoints[Breakpoints.Small] || result.breakpoints[Breakpoints.Medium]);
      this.isDesktop.set(result.breakpoints[Breakpoints.Large] || result.breakpoints[Breakpoints.XLarge]);
    });
  }

  getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (this.isMobile()) return 'mobile';
    if (this.isTablet()) return 'tablet';
    return 'desktop';
  }
}