# Runtime Terror

# Project: AI-Powered Citizen Concern Prioritization & Feedback Platform

## Team Members:

- **Suraj Balwani** - Vadodara, India (Remote) **(LEAD)**
- **Utsav Pal** - Vadodara, India (Remote)  
- **Jobin Joy** - Vadodara, India (Remote)
- **Kamlesh Shamnani** - Vadodara, India (Remote)

## Project Overview

**Civica Message Hub** is a comprehensive digital platform that empowers citizens to report concerns and helps governments prioritize and manage public feedback efficiently using AI/ML technologies. The platform addresses the common challenge of governments receiving thousands of citizen complaints daily through various channels, many of which get lost, delayed, or lack proper prioritization.

### Key Problem Solved
- Governments receive overwhelming volumes of citizen complaints daily
- Issues often get lost or delayed in bureaucratic processes  
- Lack of transparency in resolution progress
- Inefficient prioritization of urgent concerns
- Limited citizen engagement and feedback mechanisms

### Core Solution Features
- **Unified PWA Platform**: Single responsive web app working seamlessly on all devices
- **AI-Powered Categorization**: Automatic categorization and prioritization using NLP
- **Real-time Progress Tracking**: Transparent tracking like parcel delivery systems
- **Analytics Dashboard**: Visual insights for government officials
- **Reward System**: Gamification with automatic point awards for civic engagement
- **SDG Integration**: Automatic UN Sustainable Development Goals tracking and progress monitoring

## Tech Stack

### Backend Architecture (.NET Core 8.0)
- **Framework**: ASP.NET Core 8.0 Web API
- **Database**: SQL Server with Entity Framework Core 8.0
- **Authentication**: JWT Bearer tokens with ASP.NET Identity
- **AI/ML**: Built-in AI service for categorization and sentiment analysis
- **Spatial Data**: NetTopologySuite for geographic data handling
- **Documentation**: Swagger/OpenAPI integration

### Frontend Architecture (Angular 19 PWA)
- **Framework**: Angular 19 with Standalone Components
- **UI Library**: Angular Material Design
- **State Management**: Angular Signals + RxJS Observables
- **Authentication**: JWT token-based with role guards
- **Geolocation**: HTML5 Navigator API with distance calculations
- **Maps**: Leaflet integration for location services
- **Charts**: Chart.js with ng2-charts for analytics visualization
- **Data Grid**: AG Grid for advanced data management

## Key Features Implemented

### 🏛️ Multi-Portal Architecture
- **Citizen Portal** (`/citizen`): Personal dashboard, concern submission, tracking, nearby issues
- **Officer Portal** (`/officer`): Assigned concern management, status updates, performance tracking  
- **Admin Portal** (`/admin`): System-wide analytics, user management, SDG tracking, reporting

### 🔐 Authentication & Security
- Complete JWT authentication system with role-based access control
- 5 user roles: Citizen, Officer, Department Head, Admin, Super Admin
- Automated test account seeding for immediate demo capability
- Protected routes with role-based guards

### 🏆 Gamification & Engagement
**Automated Reward System:**
- Concern submission: 10 points (+ 15 bonus for high priority)
- First-time users: 20 bonus points
- Resolved concerns: 50 points
- Community voting: 2 points (upvote), 1 point (downvote)
- Officer resolutions: 25 points (+ 5 bonus for quick resolution)

### 🎯 SDG Integration
**Automatic UN Goals Mapping:**
- **SDG 3**: Health and Well-being (Health concerns)
- **SDG 6**: Clean Water and Sanitation (Water/sanitation issues)
- **SDG 11**: Sustainable Cities (Infrastructure/transport/housing)
- **SDG 13**: Climate Action (Environment/pollution concerns)
- Real-time progress calculation and reporting

### 📊 Advanced Analytics
- Complete dashboard with charts and metrics
- Geographic heatmap visualization capabilities
- Performance analytics for departments
- Citizen satisfaction tracking
- Trend analysis and reporting tools

### 📱 Progressive Web App Features
- Mobile-first responsive design
- Offline capability with service workers
- GPS-based location capture
- Photo upload with geolocation tagging
- Push notification infrastructure ready

## Resources

### Development Environment
- **Local URLs**:
  - Frontend: `http://localhost:4202`
  - Backend API: `https://localhost:7001`
  - API Documentation: `https://localhost:7001/swagger`

### Ready-to-Use Demo Accounts
- **Citizens**: citizen1@test.com / Citizen@123
- **Officer**: officer1@government.local / Officer@123  
- **Admin**: admin1@government.local / Admin@123
- **Super Admin**: superadmin@government.local / SuperAdmin@123

### Repository Structure
```
CitizenConcernPlatform/
├── Backend/          # .NET Core 8.0 API
├── Frontend/         # Angular 19 PWA  
├── Documentation/    # Project documentation
└── README.md        # Comprehensive setup guide
```

## Current Implementation Status

### ✅ Production-Ready Features
- Complete authentication and authorization system
- Fully functional citizen, officer, and admin portals
- Real-time API integration with live data
- Automated reward system with point calculations
- SDG progress tracking and reporting
- Geographic services with distance calculations
- Responsive PWA design optimized for all devices
- Database with automated seeding for immediate testing

### 🔄 Enhancement Ready Features  
- Advanced AI/ML categorization algorithms
- Multi-language support infrastructure
- Push notification system
- Social media integration capabilities
- Advanced predictive analytics

## Demo Presentation

The platform is demo-ready with:
- Live working application on localhost
- Pre-populated test data and user accounts
- Complete user journeys for all personas (citizen, officer, admin)
- Real-time analytics and reporting dashboards
- Mobile-responsive design demonstration

## Team Notes

**Development Highlights:**
- Clean architecture with separation of concerns
- Comprehensive API documentation with Swagger
- Modern tech stack with latest framework versions
- Security-first approach with JWT authentication
- Scalable database design with Entity Framework
- PWA capabilities for mobile-native experience
- Real-time data integration and analytics

**Key Differentiators:**
- AI-powered concern categorization and prioritization
- Gamification through automated reward system
- UN SDG goal integration and progress tracking
- Geographic heatmap visualization
- Multi-role portal architecture
- Transparent real-time progress tracking

## Quick Start Guide

### Prerequisites
- Node.js 18+ and npm
- .NET Core 8.0 SDK
- SQL Server or SQL Server Express LocalDB

### Running the Application
1. **Backend**: Navigate to `Backend/` → `dotnet run`
2. **Frontend**: Navigate to `Frontend/` → `npm install` → `ng serve --port 4202`
3. **Access**: Open `http://localhost:4202` and use demo credentials

### API Documentation
Complete API documentation available at: `https://localhost:7001/swagger`