# Citizen Concern Platform - Frontend

Angular 19 PWA frontend for the Citizen Concern Platform, providing citizen and government portals for civic engagement.

**Built with:**
- Angular 19 with Standalone Components
- Angular Material Design
- Angular Signals for state management
- JWT Authentication with role-based routing
- PWA features with service worker
- Real-time geolocation services

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Backend API running on `https://localhost:7001`

### Development server

To start the development server:

```bash
npm install
ng serve --port 4202
```

Navigate to `http://localhost:4202/`. The app automatically reloads when you modify source files.

### Test Accounts
Use these pre-seeded accounts for testing:

**Citizens:**
- `citizen1@test.com` / `Citizen@123`
- `citizen2@test.com` / `Citizen@123`

**Officers:**  
- `officer1@government.local` / `Officer@123`

**Admins:**
- `admin1@government.local` / `Admin@123`

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project for production:

```bash
ng build
```

This creates optimized build artifacts in the `dist/` directory, ready for deployment.

## Project Structure

```
src/app/
├── core/                    # Services, guards, models
│   ├── services/           # API, auth, utility services  
│   ├── guards/             # Route protection
│   └── models/             # TypeScript interfaces
├── pages/                   # Feature components
│   ├── auth/               # Login, registration
│   ├── citizen/            # Citizen portal
│   ├── admin/              # Admin dashboard  
│   └── officer/            # Officer portal
└── shared/                  # Reusable components
```

## Features Implemented

### Citizen Portal
- ✅ Dashboard with personal overview
- ✅ Submit concerns with photo and GPS
- ✅ Track submitted concerns with real-time updates
- ✅ Nearby concerns with geolocation filtering
- ✅ Profile management

### Officer Portal  
- ✅ Concerns dashboard with filtering
- ✅ Status management and updates
- ✅ Profile management with performance metrics

### Admin Portal
- ✅ Comprehensive analytics dashboard
- ✅ User and concern management
- ✅ System-wide reporting

### Technical Features
- ✅ JWT authentication with role-based routing
- ✅ Real-time API integration  
- ✅ Geolocation services with HTML5 Navigator API
- ✅ Responsive PWA design
- ✅ Angular Material UI components
- ✅ Error handling and loading states

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
