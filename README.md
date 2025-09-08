# AI-Powered Citizen Concern Prioritization & Feedback Platform

A comprehensive digital platform that empowers citizens to report concerns and helps governments prioritize and manage public feedback efficiently using AI/ML technologies.

## 🎯 Project Overview

This platform addresses the common challenge of governments receiving thousands of citizen complaints daily through various channels, many of which get lost, delayed, or lack proper prioritization. Our solution provides:

- **Unified PWA Platform**: Single responsive web app that works seamlessly on all devices
- **AI-Powered Categorization**: Automatic categorization and prioritization using NLP
- **Real-time Tracking**: Transparent progress tracking like parcel tracking
- **Analytics Dashboard**: Visual insights for government officials
- **Multi-language Support**: Regional language support for inclusivity
- **Heatmap Visualization**: Geographic pattern analysis
- **SDG Integration**: Automatic tracking and progress monitoring for UN Goals
- **Reward System**: Gamification with automatic point awards for civic engagement

## 🏗️ System Architecture

The platform uses a clean architecture with the following components:

```
┌───────────────────────────────────────────────────────────┐
│                Frontend (Angular 19 PWA)                  │
├─────────────┬─────────────┬─────────────┬─────────────────┤
│   Citizen   │   Officer   │    Admin    │     Auth        │
│   Portal    │   Portal    │  Dashboard  │   System        │
└─────────────┴─────────────┴─────────────┴─────────────────┘
                            │
                            ▼ (HTTP/HTTPS + JWT)
              ┌─────────────────────────┐
              │   .NET Core 8.0 API     │
              │   (ASP.NET Core)        │
              └─────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────┐
│                Business Logic Layer                       │
├─────────────┬─────────────┬─────────────┬─────────────────┤
│  Concern    │ User/Auth   │   AI        │   Analytics     │
│ Management  │ Management  │  Service    │   & Reports     │
├─────────────┼─────────────┼─────────────┼─────────────────┤
│   Reward    │    SDG      │ Notification│   Audit Trail   │
│   System    │ Tracking    │   Service   │    Service      │
└─────────────┴─────────────┴─────────────┴─────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │   Entity Framework      │
              │      Core 8.0           │
              └─────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │     SQL Server          │
              │   (with Spatial Data)   │
              └─────────────────────────┘
```

## 🛠️ Tech Stack

### Backend (.NET Core 8.0)

- **Framework**: ASP.NET Core 8.0 Web API
- **Database**: SQL Server with Entity Framework Core 8.0
- **Authentication**: JWT Bearer tokens with ASP.NET Identity
- **AI/ML**: Built-in AI service for categorization and sentiment analysis
- **Reward System**: Gamification with automatic point awards
- **SDG Tracking**: UN Sustainable Development Goals progress monitoring
- **Spatial Data**: NetTopologySuite for geographic data
- **Documentation**: Swagger/OpenAPI integrated
- **Seeding**: Automated database seeding with test accounts

### Frontend (Angular 19 PWA)

- **Framework**: Angular 19 with Standalone Components
- **UI Library**: Angular Material Design
- **State Management**: Angular Signals + RxJS Observables
- **Architecture**: Clean architecture with services and guards
- **Authentication**: JWT token-based with role guards
- **Geolocation**: HTML5 Navigator API with distance calculations
- **Maps**: Google Maps integration for directions
- **Responsive**: Mobile-first PWA design

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- .NET Core 8.0 SDK
- SQL Server or SQL Server Express LocalDB
- Visual Studio Code or Visual Studio 2022

### Backend Setup

1. Navigate to Backend directory:

```bash
cd Backend
```

2. Configure Database and Run:

```bash
# Install dependencies
dotnet restore

# Database migrations and seeding (happens automatically on startup)
dotnet run
```

Backend runs on: `https://localhost:7001`

- Swagger documentation: `https://localhost:7001/swagger`
- Database seeding happens automatically with test accounts

### Frontend Setup

1. Navigate to Frontend directory:

```bash
cd Frontend
```

2. Install dependencies and run:

```bash
npm install
ng serve --port 4202
```

Frontend runs on: `http://localhost:4202`

## 🔑 Ready-to-Use Login Credentials

These accounts are automatically created when the backend starts:

**Citizens (Full Citizen Portal Access):**

```
Email: citizen1@test.com / Password: Citizen@123
Email: citizen2@test.com / Password: Citizen@123
```

**Officer (Staff Access):**

```
Email: officer1@government.local / Password: Officer@123
```

**Department Head:**

```
Email: depthead@government.local / Password: DeptHead@123
```

**Administrator:**

```
Email: admin1@government.local / Password: Admin@123
```

**Super Administrator (Full System Access):**

```
Email: superadmin@government.local / Password: SuperAdmin@123
```

**Quick Login:** Go to `http://localhost:4202/auth/login` and use any of the above credentials.

## 🌐 Application URLs & Navigation

### Public Routes

- **Landing Page**: `http://localhost:4202/`
- **Login**: `http://localhost:4202/auth/login`
- **Register**: `http://localhost:4202/auth/register`

### Citizen Portal (Role: Citizen)

- **Dashboard**: `http://localhost:4202/citizen/dashboard`
- **Submit Concern**: `http://localhost:4202/citizen/submit`
- **Track Concerns**: `http://localhost:4202/citizen/track`
- **Nearby Issues**: `http://localhost:4202/citizen/nearby`
- **Profile**: `http://localhost:4202/citizen/profile`

### Officer Portal (Roles: Officer, Department Head)

- **Officer Dashboard**: `http://localhost:4202/officer/concerns`
- **Officer Profile**: `http://localhost:4202/officer/profile`

### Admin Portal (Roles: Officer, Department Head, Admin, Super Admin)

- **Admin Dashboard**: `http://localhost:4202/admin/dashboard`
  - Analytics Overview
  - Concern Management (search, filter, update status)
  - User Management (Admin+ only)
  - System Reports
  - SDG Progress Tracking
  - Reward System Analytics

## 📱 Features Implemented

### Citizen Portal (`/citizen`)

- ✅ **Dashboard**: Personal overview with concern statistics and reward points
- ✅ **Submit Concerns**: Multi-step form with photo upload and GPS location capture
- ✅ **Track Concerns**: Real-time status tracking with progress updates and comments
- ✅ **Nearby Concerns**: Geolocation-based concern discovery with distance filtering and voting
- ✅ **Profile Management**: Personal information and reward history
- ✅ **Reward System**: Automatic point awards for civic engagement activities
- ✅ **Mobile Responsive**: PWA design optimized for all devices

### Officer Portal (`/officer`)

- ✅ **Concerns Dashboard**: Manage assigned concerns with filtering and status updates
- ✅ **Profile Management**: Officer profile with performance metrics and work history
- ✅ **Status Management**: Update concern status and add official comments
- ✅ **Department Workflow**: Role-based concern assignment and tracking

### Admin Portal (`/admin`)

- ✅ **Analytics Dashboard**: Comprehensive system overview with charts and metrics
- ✅ **Concern Management**: System-wide concern oversight with search and filtering
- ✅ **User Management**: Admin-only user administration capabilities
- ✅ **SDG Progress Tracking**: Real-time UN SDG goal monitoring and reporting
- ✅ **Reward System Management**: View and manage citizen reward points and history
- ✅ **Reporting Tools**: Performance analytics and system reports

### Authentication & Security

- ✅ **JWT Authentication**: Secure token-based authentication
- ✅ **Role-Based Access**: Citizen, Officer, Admin, and Super Admin roles
- ✅ **Route Guards**: Protected routes based on user roles
- ✅ **Automatic Seeding**: Test accounts created on backend startup

## 🔧 Current Implementation Status

### ✅ **Completed & Production-Ready:**

- Complete JWT authentication system
- Role-based access control
- Citizen dashboard with real data and reward points
- Admin dashboard with full management capabilities
- Officer portal with concern management
- **Reward System**: Automatic point awards and gamification
- **SDG Progress Tracking**: UN goal monitoring and categorization
- Responsive PWA design
- Real-time API integration
- Geolocation services with distance calculation
- Database with automated seeding

### 🔄 **Available for Future Enhancement:**

- Advanced AI/ML categorization
- Multi-language support
- Push notifications
- Advanced analytics and reporting
- Social media integration

## 🤖 AI/ML Capabilities (Available for Enhancement)

### Text Analysis & NLP

- **Automatic Categorization**: Classify concerns into predefined categories
- **Sentiment Analysis**: Gauge citizen sentiment and urgency
- **Keyword Extraction**: Identify key themes and topics
- **Language Detection**: Support multiple regional languages
- **Priority Scoring**: AI-driven priority assessment

### Categories Supported

- Infrastructure (Roads, Bridges, Buildings)
- Water (Supply, Quality, Drainage)
- Electricity (Outages, Billing, Infrastructure)
- Health (Hospitals, Sanitation, Medical Services)
- Environment (Pollution, Waste Management)
- Transport (Public Transport, Traffic)
- Education (Schools, Educational Infrastructure)
- Safety (Crime, Security, Emergency Services)
- Housing (Construction, Maintenance)

### Priority Algorithm

The AI system considers:

- **Urgency Keywords**: Emergency, critical, danger, etc.
- **Community Support**: Number of upvotes
- **Category Importance**: Health and safety get higher priority
- **Sentiment Score**: Negative sentiment indicates urgency
- **Geographic Factors**: High-population areas
- **Historical Data**: Previous resolution patterns

## 📊 Data & Analytics

### Dashboard Metrics

- **Total Concerns**: Overall submission count
- **Status Distribution**: New, In Progress, Resolved, Closed
- **Category Breakdown**: Concerns by type
- **Geographic Distribution**: Regional patterns
- **Time Trends**: Daily, weekly, monthly patterns
- **Resolution Performance**: Average resolution times
- **Citizen Satisfaction**: Feedback and ratings

### Reports Available

- **Daily Activity Reports**: New submissions and updates
- **Department Performance**: Resolution times by department
- **Geographic Analysis**: Hotspot identification
- **Trend Analysis**: Seasonal patterns and emerging issues
- **SDG Progress Reports**: Alignment with UN goals
- **Citizen Satisfaction Reports**: Service quality metrics

## 🗺️ Geographic Features

### Location Services

- **Auto-detection**: GPS-based location tagging
- **Address Validation**: Verify and standardize addresses
- **Ward/Zone Mapping**: Administrative boundary recognition
- **Proximity Alerts**: Notify nearby concerns

### Heatmap Visualization

- **Concern Density**: Visual representation of issue concentration
- **Category Overlay**: Filter by concern type
- **Time Animation**: Show patterns over time
- **Severity Indicators**: Color-coded priority levels

## 🔐 Security & Privacy

### Data Protection

- **Encryption**: All data encrypted in transit and at rest
- **Anonymization**: Option for anonymous reporting
- **Data Retention**: Configurable retention policies
- **Audit Trails**: Complete action logging

### Authentication & Authorization

- **JWT Tokens**: Secure API authentication
- **Role-based Access**: Different permissions for citizens/officials
- **Multi-factor Authentication**: Enhanced security for admin users
- **Session Management**: Secure session handling

## 🌐 Multi-language Support

Currently supported languages:

- English (Primary)

### Translation Features

- **UI Translation**: Complete interface translation
- **Voice Input**: Multi-language speech recognition
- **Text Analysis**: Cross-language sentiment analysis
- **Response Generation**: Automated responses in user's language

## 📈 SDG Integration

The platform automatically maps citizen concerns to UN Sustainable Development Goals:

### Active SDG Tracking

- **SDG 3**: Good Health and Well-being (Health concerns)
- **SDG 6**: Clean Water and Sanitation (Water, sanitation issues)
- **SDG 11**: Sustainable Cities and Communities (Infrastructure, transport, housing)
- **SDG 13**: Climate Action (Environment, pollution concerns)

### Automatic Categorization

**Category-Based Mapping:**
- Health → SDG 3
- Water/Sanitation → SDG 6
- Roads/Transport/Housing → SDG 11
- Environment → SDG 13

**Keyword-Based Detection:**
- AI analyzes concern text for SDG-related keywords
- Multiple keyword matches = stronger SDG relevance
- Cross-category concerns can map to multiple SDGs

### SDG Metrics & APIs

- `GET /api/sdg/metrics` - View all SDG progress metrics
- `GET /api/sdg/metrics/{id}` - Get specific SDG details
- `POST /api/sdg/recalculate` - Refresh progress calculations
- `GET /api/sdg/mapping` - View category-to-SDG mappings

### Progress Tracking

- **Related Concerns**: Total concerns mapped to each SDG
- **Resolved Concerns**: Successfully addressed issues
- **Progress Percentage**: Automated calculation of resolution rate
- **Last Updated**: Real-time progress tracking

## 🏆 Reward System

### Citizen Engagement Points

The platform automatically awards points for civic participation:

- **Concern Submission**: 10 points (+ 15 bonus for high priority)
- **First Concern**: 20 bonus points for new users
- **Concern Resolved**: 50 points when your concern is resolved
- **Community Voting**: 2 points (upvote), 1 point (downvote)
- **Adding Comments**: 3 points (regular), 5 points (official comments)

### Officer Recognition

- **Resolution Provided**: 25 points for resolving citizen concerns
- **Quick Resolution**: Additional 5 points for resolution within 7 days
- **Quality Service**: Performance bonuses based on citizen satisfaction

### API Endpoints

- `GET /api/reward/points` - Get user's total reward points
- `GET /api/reward/history` - View detailed reward history
- `POST /api/reward/redeem` - Redeem points (future feature)

### Anti-Spam Protection

- Limited comment rewards (max 3 per concern)
- One-time voting rewards per concern
- Quality-based point validation

## 🔧 Configuration

### Environment Variables

```
DATABASE_CONNECTION=your_connection_string
JWT_SECRET=your_jwt_secret
REDIS_URL=your_redis_connection
AZURE_STORAGE_CONNECTION=your_storage_connection
SENDGRID_API_KEY=your_email_api_key
```

### Feature Flags

- Enable/disable voice input
- Toggle anonymous reporting
- Configure reward system
- Enable/disable geographic features
- Configure AI model parameters

## 🧪 Testing

### Backend Tests

```bash
cd Backend
dotnet test
```

### Frontend Tests

```bash
cd Frontend
npm test
```

### PWA Tests

```bash
cd Frontend
npm run test:pwa
```

## 📦 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Cloud Deployment

- **Backend**: Azure App Service or AWS Elastic Beanstalk
- **Database**: Azure SQL Database or AWS RDS
- **Storage**: Azure Blob Storage or AWS S3
- **PWA**: Deploy to any web hosting (Netlify, Vercel, Azure Static Web Apps)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Backend Development**: .NET Core API, Entity Framework, AI/ML Integration
- **Frontend Development**: Angular 19 Admin Dashboard, Angular Material
- **PWA Development**: Angular Progressive Web App with native features
- **DevOps**: Docker, Cloud Deployment, CI/CD
- **UI/UX Design**: User Interface Design, User Experience Optimization

## 📞 Support

For support and queries:

- 📧 Email: support@citizenconcern.gov
- 📱 Helpline: 1800-123-4567
- 💬 Chat: Available in the admin dashboard
- 📖 Documentation: Complete API documentation available

## 🚀 Future Roadmap

### Phase 2 Features

- **Chatbot Integration**: AI-powered citizen assistance
- **Video Submissions**: Support for video evidence
- **IoT Integration**: Sensor data integration for automatic issue detection
- **Predictive Analytics**: Forecast potential issues
- **Social Media Integration**: Monitor social media for concerns
- **Blockchain**: Immutable audit trails for transparency

### Phase 3 Features

- **Cross-city Integration**: Multi-city platform
- **Advanced AI**: Computer vision for image analysis
- **Augmented Reality**: AR-based issue reporting
- **Smart City Integration**: Integration with smart city infrastructure
- **API Marketplace**: Third-party integrations
