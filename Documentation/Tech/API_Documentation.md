# Citizen Concern Platform - API Documentation

## Overview

The Citizen Concern Platform API provides endpoints for managing citizen concerns, user authentication, analytics, and administrative functions. The API follows RESTful conventions and uses JWT authentication.

**Base URL**: `https://localhost:7001/api`  
**Authentication**: Bearer Token (JWT)  
**Content-Type**: `application/json`

## Authentication

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "12345",
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "role": "Citizen"
  },
  "expiresIn": 604800
}
```

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "address": "123 Main St",
  "region": "Central District",
  "ward": "Ward 5"
}
```

## Concerns API

### Get All Concerns
```http
GET /concerns?page=1&limit=10&category=Infrastructure&status=New&region=Central
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category
- `status` (optional): Filter by status
- `region` (optional): Filter by region

**Response:**
```json
{
  "data": [
    {
      "id": "1",
      "title": "Broken Street Light",
      "description": "Street light has been broken for two weeks",
      "category": "Infrastructure",
      "priority": 4,
      "status": "InProgress",
      "location": {
        "latitude": 17.3850,
        "longitude": 78.4867,
        "address": "Main Street, Hyderabad"
      },
      "region": "Central District",
      "ward": "Ward 5",
      "citizenId": "user123",
      "citizenName": "John Doe",
      "isAnonymous": false,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-16T14:20:00Z",
      "upVotes": 15,
      "downVotes": 2,
      "sentimentScore": -0.3,
      "tags": ["street", "light", "electricity"]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 50,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### Get Concern by ID
```http
GET /concerns/{id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "1",
  "title": "Broken Street Light",
  "description": "Street light has been broken for two weeks",
  "category": "Infrastructure",
  "priority": 4,
  "status": "InProgress",
  "location": {
    "latitude": 17.3850,
    "longitude": 78.4867,
    "address": "Main Street, Hyderabad"
  },
  "updates": [
    {
      "id": "u1",
      "updateText": "Technician dispatched to assess the issue",
      "status": "InProgress",
      "updatedBy": "Jane Officer",
      "updatedAt": "2024-01-16T14:20:00Z"
    }
  ],
  "comments": [
    {
      "id": "c1",
      "commentText": "Same issue on Oak Street",
      "commentBy": "Jane Smith",
      "isOfficial": false,
      "createdAt": "2024-01-15T16:45:00Z"
    }
  ]
}
```

### Create New Concern
```http
POST /concerns
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Water Leakage Issue",
  "description": "Major water leakage near the park causing wastage",
  "address": "Central Park, Hyderabad",
  "latitude": 17.3900,
  "longitude": 78.4800,
  "region": "Central District",
  "ward": "Ward 3",
  "citizenId": "user123",
  "citizenName": "John Doe",
  "citizenPhone": "+91-9876543210",
  "citizenEmail": "john@example.com",
  "isAnonymous": false,
  "language": "en",
  "attachmentUrls": ["https://storage.blob/image1.jpg"]
}
```

**Response:**
```json
{
  "id": "2",
  "title": "Water Leakage Issue",
  "category": "Water",
  "priority": 5,
  "status": "New",
  "createdAt": "2024-01-17T09:15:00Z",
  "message": "Concern submitted successfully"
}
```

### Update Concern Status (Admin/Officer Only)
```http
PUT /concerns/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "InProgress",
  "updateText": "Technician has been assigned to investigate",
  "assignedDepartment": "Water Department",
  "assignedOfficer": "Mike Water",
  "resolutionNotes": ""
}
```

### Vote on Concern
```http
POST /concerns/{id}/vote
Authorization: Bearer {token}
Content-Type: application/json

{
  "isUpVote": true
}
```

**Response:**
```json
{
  "upVotes": 16,
  "downVotes": 2,
  "priority": 4
}
```

### Add Comment to Concern
```http
POST /concerns/{id}/comments
Authorization: Bearer {token}
Content-Type: application/json

{
  "commentText": "I have the same issue in my area",
  "commentBy": "John Citizen",
  "isOfficial": false
}
```

## Analytics API

### Get Concern Analytics
```http
GET /concerns/analytics
Authorization: Bearer {token}
```

**Response:**
```json
{
  "totalConcerns": 150,
  "newConcerns": 25,
  "inProgressConcerns": 45,
  "resolvedConcerns": 70,
  "closedConcerns": 10,
  "averageResolutionTime": 48.5,
  "citizenSatisfactionScore": 4.2,
  "concernsByCategory": {
    "Infrastructure": 45,
    "Water": 30,
    "Sanitation": 25,
    "Health": 15,
    "Transport": 20,
    "Environment": 15
  },
  "concernsByRegion": {
    "Central District": 60,
    "South District": 40,
    "North District": 30,
    "East District": 20
  },
  "concernsByDepartment": {
    "Public Works": 50,
    "Water Department": 30,
    "Sanitation": 25,
    "Health": 15,
    "Transport": 20,
    "Environment": 10
  },
  "sentimentByCategory": {
    "Infrastructure": -0.2,
    "Water": -0.4,
    "Sanitation": -0.3,
    "Health": -0.1,
    "Transport": -0.2
  },
  "dailyTrends": [
    {
      "date": "2024-01-01",
      "count": 12,
      "category": "Infrastructure"
    },
    {
      "date": "2024-01-02",
      "count": 8,
      "category": "Water"
    }
  ],
  "regionalHeatmap": [
    {
      "region": "Central District",
      "latitude": 17.3850,
      "longitude": 78.4867,
      "concernCount": 60,
      "priority": 4,
      "dominantCategory": "Infrastructure"
    }
  ]
}
```

## Users API

### Get All Users (Admin Only)
```http
GET /users?page=1&limit=10&role=Citizen
Authorization: Bearer {token}
```

### Get User Profile
```http
GET /users/profile
Authorization: Bearer {token}
```

### Update User Profile
```http
PUT /users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+91-9876543210",
  "address": "123 Updated Address",
  "region": "Central District",
  "ward": "Ward 5"
}
```

## Departments API

### Get All Departments
```http
GET /departments
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Public Works",
    "description": "Roads, Infrastructure, Water Supply",
    "headOfficerId": "officer123",
    "headOfficer": {
      "firstName": "Jane",
      "lastName": "Officer"
    },
    "responsibleCategories": ["Infrastructure", "Roads", "Water"],
    "isActive": true
  }
]
```

### Create Department (Admin Only)
```http
POST /departments
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Environment Department",
  "description": "Environmental concerns and pollution control",
  "headOfficerId": "env_officer_123",
  "responsibleCategories": ["Environment", "Pollution", "Waste"],
  "isActive": true
}
```

## Reward System API

### Get User Reward Points
```http
GET /reward/points
Authorization: Bearer {token}
```

**Response:**
```json
{
  "totalPoints": 125
}
```

### Get Reward History
```http
GET /reward/history?limit=10
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": 1,
    "points": 10,
    "rewardType": "ConcernSubmission",
    "description": "Submitted concern: Broken Street Light",
    "relatedConcernId": 1,
    "earnedAt": "2024-01-15T10:30:00Z",
    "isRedeemed": false
  },
  {
    "id": 2,
    "points": 20,
    "rewardType": "FirstConcern",
    "description": "First concern submission bonus",
    "relatedConcernId": 1,
    "earnedAt": "2024-01-15T10:30:00Z",
    "isRedeemed": false
  }
]
```

### Redeem Points
```http
POST /reward/redeem
Authorization: Bearer {token}
Content-Type: application/json

{
  "pointsToRedeem": 50
}
```

**Response:**
```json
{
  "message": "Points redeemed successfully"
}
```

## SDG Tracking API

### Get All SDG Metrics
```http
GET /sdg/metrics
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": 1,
    "sdgGoal": "SDG 3: Good Health and Well-being",
    "sdgTarget": "3.3 End epidemics and combat diseases",
    "relatedConcerns": 15,
    "resolvedConcerns": 12,
    "progressPercentage": 80.0,
    "lastUpdated": "2024-01-17T10:30:00Z"
  },
  {
    "id": 2,
    "sdgGoal": "SDG 6: Clean Water and Sanitation",
    "sdgTarget": "6.1 Safe and affordable drinking water",
    "relatedConcerns": 25,
    "resolvedConcerns": 18,
    "progressPercentage": 72.0,
    "lastUpdated": "2024-01-17T10:30:00Z"
  }
]
```

### Get SDG Metric by ID
```http
GET /sdg/metrics/{id}
Authorization: Bearer {token}
```

### Recalculate SDG Progress (Admin Only)
```http
POST /sdg/recalculate
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "SDG progress recalculated successfully"
}
```

### Get Category to SDG Mapping
```http
GET /sdg/mapping
Authorization: Bearer {token}
```

**Response:**
```json
{
  "Health": [1],
  "Water": [2],
  "Sanitation": [2],
  "Roads": [3],
  "Transport": [3],
  "Housing": [3],
  "Infrastructure": [3],
  "Environment": [4],
  "Electricity": [3, 4],
  "Safety": [3]
}
```

## Notifications API

### Get User Notifications
```http
GET /users/notifications?unreadOnly=true
Authorization: Bearer {token}
```

### Mark Notification as Read
```http
PUT /users/notifications/{notificationId}/read
Authorization: Bearer {token}
```

## File Upload API

### Upload Attachment
```http
POST /upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form data:
- file: [file content]
- type: "concern_attachment"
```

**Response:**
```json
{
  "url": "https://storage.blob.core.windows.net/attachments/12345-image.jpg",
  "fileName": "street_light_issue.jpg",
  "fileSize": 245760,
  "contentType": "image/jpeg"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "BadRequest",
  "message": "Invalid request data",
  "details": {
    "title": ["Title is required"],
    "description": ["Description must be between 10 and 2000 characters"]
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "NotFound",
  "message": "Concern with ID '12345' not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "InternalServerError",
  "message": "An unexpected error occurred",
  "traceId": "12345-67890-abcdef"
}
```

## Rate Limiting

- **Concern Creation**: 10 requests per hour per user
- **File Upload**: 20 requests per hour per user
- **Analytics**: 100 requests per hour per user
- **General API**: 1000 requests per hour per user

## Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **204 No Content**: Update successful
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflict
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

## Data Models

### Concern Status Enum
```
New = 1
Acknowledged = 2
InProgress = 3
UnderReview = 4
Resolved = 5
Closed = 6
Rejected = 7
```

### User Role Enum
```
Citizen = 1
Officer = 2
DepartmentHead = 3
Admin = 4
SuperAdmin = 5
```

### Priority Scale
- **1**: Very Low
- **2**: Low
- **3**: Medium (Default)
- **4**: High
- **5**: Critical/Urgent

## AI/ML Endpoints

### Analyze Text
```http
POST /ai/analyze-text
Authorization: Bearer {token}
Content-Type: application/json

{
  "text": "The street light has been broken for weeks and it's dangerous",
  "language": "en"
}
```

**Response:**
```json
{
  "category": "Infrastructure",
  "priority": 4,
  "sentimentScore": -0.6,
  "keywords": ["street", "light", "broken", "dangerous"],
  "confidence": 0.85
}
```

### Translate Text
```http
POST /ai/translate
Authorization: Bearer {token}
Content-Type: application/json

{
  "text": "Street light is broken",
  "targetLanguage": "hi"
}
```

**Response:**
```json
{
  "translatedText": "स्ट्रीट लाइट टूटी हुई है",
  "sourceLanguage": "en",
  "targetLanguage": "hi",
  "confidence": 0.92
}
```

## Webhook Events

The API supports webhooks for real-time notifications:

### Concern Status Update
```json
{
  "event": "concern.status_updated",
  "data": {
    "concernId": "12345",
    "oldStatus": "New",
    "newStatus": "InProgress",
    "updatedBy": "officer@gov.local",
    "timestamp": "2024-01-17T10:30:00Z"
  }
}
```

### New Concern Created
```json
{
  "event": "concern.created",
  "data": {
    "concernId": "12346",
    "category": "Water",
    "priority": 5,
    "region": "Central District",
    "citizenId": "user123",
    "timestamp": "2024-01-17T10:35:00Z"
  }
}
```

## Testing

All endpoints can be tested using the Swagger UI at `https://localhost:7001/swagger`

### Sample Test Data

**Test Citizen Account:**
- Email: `demo@citizen.com`
- Password: `demo123`

**Test Officer Account:**
- Email: `officer@government.local`
- Password: `officer123`

**Test Admin Account:**
- Email: `admin@government.local`
- Password: `admin123`

## SDKs and Libraries

### JavaScript/TypeScript
```javascript
import { CitizenConcernAPI } from 'citizen-concern-sdk';

const api = new CitizenConcernAPI({
  baseUrl: 'https://localhost:7001/api',
  token: 'your-jwt-token'
});

const concerns = await api.concerns.getAll({ status: 'New' });
```

### C#
```csharp
using CitizenConcern.SDK;

var client = new CitizenConcernClient("https://localhost:7001/api", "your-jwt-token");
var concerns = await client.Concerns.GetAllAsync(new ConcernFilter { Status = "New" });
```

This API documentation provides comprehensive information for integrating with the Citizen Concern Platform. For additional support or questions, please contact the development team.