# Database Schema Documentation
## Citizen Concern Platform Backend

This document provides a comprehensive overview of all database tables, columns, relationships, and constraints in the Citizen Concern Platform backend system.

---

## Table of Contents

1. [Overview](#overview)
2. [Core Tables](#core-tables)
3. [Identity Tables (ASP.NET Identity)](#identity-tables-aspnet-identity)
4. [Analytics & Reporting Tables](#analytics--reporting-tables)
5. [Relationships Diagram](#relationships-diagram)
6. [Indexes](#indexes)
7. [Data Types & Constraints](#data-types--constraints)

---

## Overview

The database schema is built on **Entity Framework Core 8.0** with **SQL Server** and includes:
- **12 Main Tables** (including Identity tables)
- **Spatial Data Support** with NetTopologySuite
- **Role-based Access Control** via ASP.NET Identity
- **Comprehensive Analytics** and SDG tracking
- **Audit Trail** through updates and notifications

---

## Core Tables

### 1. **Concerns** 
*Primary table storing citizen-reported concerns*

| Column Name | Data Type | Max Length | Nullable | Description |
|-------------|-----------|------------|----------|-------------|
| **Id** | `int` | - | ❌ | Primary key, auto-increment |
| **Title** | `nvarchar` | 200 | ❌ | Brief title of the concern |
| **Description** | `nvarchar` | 2000 | ❌ | Detailed description of the issue |
| **Category** | `nvarchar` | - | ❌ | AI-categorized concern type (Infrastructure, Water, Health, etc.) |
| **SubCategory** | `nvarchar` | - | ❌ | Sub-classification within main category |
| **Priority** | `int` | - | ❌ | Priority level (1-5), AI-calculated |
| **Urgency** | `int` | - | ❌ | Urgency rating (1-5) |
| **Impact** | `int` | - | ❌ | Impact assessment (1-5) |
| **Status** | `int` | - | ❌ | Current status (enum: New=1, Acknowledged=2, InProgress=3, UnderReview=4, Resolved=5, Closed=6, Rejected=7) |
| **Location** | `geography` | - | ✅ | GPS coordinates as spatial point (SRID 4326) |
| **Address** | `nvarchar` | - | ✅ | Human-readable address |
| **Region** | `nvarchar` | - | ✅ | Administrative region/city |
| **Ward** | `nvarchar` | - | ✅ | Local ward/district |
| **CitizenId** | `nvarchar` | 450 | ❌ | Foreign key to AspNetUsers |
| **CitizenName** | `nvarchar` | - | ✅ | Citizen's display name |
| **CitizenPhone** | `nvarchar` | - | ✅ | Contact phone number |
| **CitizenEmail** | `nvarchar` | - | ✅ | Contact email address |
| **AssignedDepartment** | `nvarchar` | - | ✅ | Department responsible for resolution |
| **AssignedOfficer** | `nvarchar` | - | ✅ | Assigned government officer |
| **CreatedAt** | `datetime2` | - | ❌ | Timestamp when concern was submitted |
| **UpdatedAt** | `datetime2` | - | ✅ | Last modification timestamp |
| **ResolvedAt** | `datetime2` | - | ✅ | Timestamp when resolved |
| **ResolutionNotes** | `nvarchar` | - | ✅ | Final resolution description |
| **IsAnonymous** | `bit` | - | ❌ | Whether submitted anonymously |
| **Tags** | `nvarchar` | - | ❌ | JSON array of AI-extracted keywords |
| **AttachmentUrls** | `nvarchar` | - | ❌ | JSON array of file URLs |
| **SentimentScore** | `float` | - | ❌ | AI sentiment analysis score (-1 to 1) |
| **Language** | `nvarchar` | - | ❌ | Detected language code (en, hi, te, etc.) |
| **UpVotes** | `int` | - | ❌ | Community upvote count |
| **DownVotes** | `int` | - | ❌ | Community downvote count |

**Relationships:**
- **Many-to-One** with `AspNetUsers` (CitizenId → Id)
- **One-to-Many** with `ConcernUpdates` 
- **One-to-Many** with `ConcernComments`
- **One-to-Many** with `UserNotifications`
- **One-to-Many** with `RewardSystem`

---

### 2. **ConcernUpdates**
*Track status changes and progress updates*

| Column Name | Data Type | Max Length | Nullable | Description |
|-------------|-----------|------------|----------|-------------|
| **Id** | `int` | - | ❌ | Primary key, auto-increment |
| **ConcernId** | `int` | - | ❌ | Foreign key to Concerns |
| **UpdateText** | `nvarchar` | - | ❌ | Update description/notes |
| **Status** | `int` | - | ❌ | Status at time of update (ConcernStatus enum) |
| **UpdatedBy** | `nvarchar` | - | ❌ | Name/ID of person making update |
| **UpdatedAt** | `datetime2` | - | ❌ | Timestamp of update |

**Relationships:**
- **Many-to-One** with `Concerns` (ConcernId → Id) - Cascade Delete

---

### 3. **ConcernComments**
*Public and official comments on concerns*

| Column Name | Data Type | Max Length | Nullable | Description |
|-------------|-----------|------------|----------|-------------|
| **Id** | `int` | - | ❌ | Primary key, auto-increment |
| **ConcernId** | `int` | - | ❌ | Foreign key to Concerns |
| **CommentText** | `nvarchar` | - | ❌ | Comment content |
| **CommentBy** | `nvarchar` | - | ❌ | Name of commenter |
| **IsOfficial** | `bit` | - | ❌ | Whether comment is from government official |
| **CreatedAt** | `datetime2` | - | ❌ | Timestamp when comment was posted |

**Relationships:**
- **Many-to-One** with `Concerns` (ConcernId → Id) - Cascade Delete

---

### 4. **Departments**
*Government departments and their responsibilities*

| Column Name | Data Type | Max Length | Nullable | Description |
|-------------|-----------|------------|----------|-------------|
| **Id** | `int` | - | ❌ | Primary key, auto-increment |
| **Name** | `nvarchar` | 100 | ❌ | Department name |
| **Description** | `nvarchar` | - | ✅ | Department description |
| **HeadOfficerId** | `nvarchar` | 450 | ✅ | Foreign key to AspNetUsers |
| **ResponsibleCategories** | `nvarchar` | - | ❌ | JSON array of concern categories this department handles |
| **IsActive** | `bit` | - | ❌ | Whether department is active |
| **CreatedAt** | `datetime2` | - | ❌ | Timestamp when department was created |

**Relationships:**
- **Many-to-One** with `AspNetUsers` (HeadOfficerId → Id) - Set Null on Delete

**Seeded Data:**
1. Public Works - Roads, Water, Electricity, Infrastructure
2. Health Department - Health, Sanitation, Medical  
3. Environment - Environment, Waste, Pollution
4. Transport - Transport, Traffic, Parking
5. Education - Education, Schools

---

### 5. **UserNotifications**
*System notifications for users*

| Column Name | Data Type | Max Length | Nullable | Description |
|-------------|-----------|------------|----------|-------------|
| **Id** | `int` | - | ❌ | Primary key, auto-increment |
| **UserId** | `nvarchar` | 450 | ❌ | Foreign key to AspNetUsers |
| **Title** | `nvarchar` | - | ❌ | Notification title |
| **Message** | `nvarchar` | - | ❌ | Notification content |
| **Type** | `int` | - | ❌ | Notification type (enum: ConcernUpdate=1, StatusChange=2, NewAssignment=3, System=4, Reminder=5) |
| **IsRead** | `bit` | - | ❌ | Whether notification has been read |
| **CreatedAt** | `datetime2` | - | ❌ | Timestamp when notification was created |
| **ReadAt** | `datetime2` | - | ✅ | Timestamp when notification was read |
| **RelatedConcernId** | `int` | - | ✅ | Foreign key to related Concern |

**Relationships:**
- **Many-to-One** with `AspNetUsers` (UserId → Id) - Cascade Delete
- **Many-to-One** with `Concerns` (RelatedConcernId → Id) - Cascade Delete

---

## Identity Tables (ASP.NET Identity)

### 6. **AspNetUsers** (extends IdentityUser)
*User accounts with custom properties*

| Column Name | Data Type | Max Length | Nullable | Description |
|-------------|-----------|------------|----------|-------------|
| **Id** | `nvarchar` | 450 | ❌ | Primary key (GUID) |
| **FirstName** | `nvarchar` | 100 | ❌ | User's first name |
| **LastName** | `nvarchar` | 100 | ❌ | User's last name |
| **Address** | `nvarchar` | - | ✅ | Physical address |
| **Region** | `nvarchar` | - | ✅ | User's region/city |
| **Ward** | `nvarchar` | - | ✅ | User's ward/district |
| **Role** | `int` | - | ❌ | User role enum (Citizen=1, Officer=2, DepartmentHead=3, Admin=4, SuperAdmin=5) |
| **CreatedAt** | `datetime2` | - | ❌ | Account creation timestamp |
| **LastLoginAt** | `datetime2` | - | ✅ | Last login timestamp |
| **IsVerified** | `bit` | - | ❌ | Whether account is verified |
| **Department** | `nvarchar` | - | ✅ | Department for government users |
| **UserName** | `nvarchar` | 256 | ✅ | Login username |
| **NormalizedUserName** | `nvarchar` | 256 | ✅ | Normalized username for searches |
| **Email** | `nvarchar` | 256 | ✅ | Email address |
| **NormalizedEmail** | `nvarchar` | 256 | ✅ | Normalized email for searches |
| **EmailConfirmed** | `bit` | - | ❌ | Whether email is confirmed |
| **PasswordHash** | `nvarchar` | - | ✅ | Hashed password |
| **SecurityStamp** | `nvarchar` | - | ✅ | Security stamp for validation |
| **ConcurrencyStamp** | `nvarchar` | - | ✅ | Concurrency control |
| **PhoneNumber** | `nvarchar` | - | ✅ | Phone number |
| **PhoneNumberConfirmed** | `bit` | - | ❌ | Whether phone is confirmed |
| **TwoFactorEnabled** | `bit` | - | ❌ | 2FA enabled flag |
| **LockoutEnd** | `datetimeoffset` | - | ✅ | Lockout expiration |
| **LockoutEnabled** | `bit` | - | ❌ | Whether lockout is enabled |
| **AccessFailedCount** | `int` | - | ❌ | Failed login attempts |

**Relationships:**
- **One-to-Many** with `Concerns` (as CitizenId)
- **One-to-Many** with `UserNotifications`
- **One-to-Many** with `RewardSystem`
- **One-to-Many** with `Departments` (as HeadOfficerId)

**Seeded Users:**
- **Admin**: `admin@government.local` / `Admin@123` (SuperAdmin role)
- **Officer**: `officer@government.local` / `Officer@123` (Officer role)

---

### 7. **AspNetRoles** (IdentityRole)
*System roles for authorization*

| Column Name | Data Type | Max Length | Nullable | Description |
|-------------|-----------|------------|----------|-------------|
| **Id** | `nvarchar` | 450 | ❌ | Primary key (GUID) |
| **Name** | `nvarchar` | 256 | ✅ | Role name |
| **NormalizedName** | `nvarchar` | 256 | ✅ | Normalized role name |
| **ConcurrencyStamp** | `nvarchar` | - | ✅ | Concurrency control |

**Seeded Roles:**
- Citizen, Officer, DepartmentHead, Admin, SuperAdmin

---

### 8. **AspNetUserRoles** (Junction Table)
*Many-to-many relationship between users and roles*

| Column Name | Data Type | Max Length | Nullable | Description |
|-------------|-----------|------------|----------|-------------|
| **UserId** | `nvarchar` | 450 | ❌ | Foreign key to AspNetUsers |
| **RoleId** | `nvarchar` | 450 | ❌ | Foreign key to AspNetRoles |

---

### 9. **AspNetUserClaims**
*Additional claims for users*

| Column Name | Data Type | Max Length | Nullable | Description |
|-------------|-----------|------------|----------|-------------|
| **Id** | `int` | - | ❌ | Primary key, auto-increment |
| **UserId** | `nvarchar` | 450 | ❌ | Foreign key to AspNetUsers |
| **ClaimType** | `nvarchar` | - | ✅ | Type of claim |
| **ClaimValue** | `nvarchar` | - | ✅ | Claim value |

---

### 10. **AspNetRoleClaims**
*Claims associated with roles*

| Column Name | Data Type | Max Length | Nullable | Description |
|-------------|-----------|------------|----------|-------------|
| **Id** | `int` | - | ❌ | Primary key, auto-increment |
| **RoleId** | `nvarchar` | 450 | ❌ | Foreign key to AspNetRoles |
| **ClaimType** | `nvarchar` | - | ✅ | Type of claim |
| **ClaimValue** | `nvarchar` | - | ✅ | Claim value |

---

### 11. **AspNetUserLogins**
*External login providers*

| Column Name | Data Type | Max Length | Nullable | Description |
|-------------|-----------|------------|----------|-------------|
| **LoginProvider** | `nvarchar` | 450 | ❌ | Login provider name |
| **ProviderKey** | `nvarchar` | 450 | ❌ | Provider-specific key |
| **ProviderDisplayName** | `nvarchar` | - | ✅ | Display name |
| **UserId** | `nvarchar` | 450 | ❌ | Foreign key to AspNetUsers |

---

### 12. **AspNetUserTokens**
*Authentication tokens*

| Column Name | Data Type | Max Length | Nullable | Description |
|-------------|-----------|------------|----------|-------------|
| **UserId** | `nvarchar` | 450 | ❌ | Foreign key to AspNetUsers |
| **LoginProvider** | `nvarchar` | 450 | ❌ | Token provider |
| **Name** | `nvarchar` | 450 | ❌ | Token name |
| **Value** | `nvarchar` | - | ✅ | Token value |

---

## Analytics & Reporting Tables

### 13. **AnalyticsData**
*Raw analytics metrics storage*

| Column Name | Data Type | Max Length | Nullable | Description |
|-------------|-----------|------------|----------|-------------|
| **Id** | `int` | - | ❌ | Primary key, auto-increment |
| **Date** | `datetime2` | - | ❌ | Date of the metric |
| **MetricName** | `nvarchar` | - | ❌ | Name of the metric being tracked |
| **MetricValue** | `nvarchar` | - | ❌ | Value of the metric (stored as string for flexibility) |
| **Category** | `nvarchar` | - | ✅ | Category filter for the metric |
| **Region** | `nvarchar` | - | ✅ | Region filter for the metric |
| **Department** | `nvarchar` | - | ✅ | Department filter for the metric |

---

### 14. **SDGMetrics** 
*UN Sustainable Development Goals tracking*

| Column Name | Data Type | Max Length | Nullable | Description |
|-------------|-----------|------------|----------|-------------|
| **Id** | `int` | - | ❌ | Primary key, auto-increment |
| **SDGGoal** | `nvarchar` | - | ❌ | SDG goal description |
| **SDGTarget** | `nvarchar` | - | ❌ | Specific SDG target |
| **RelatedConcerns** | `int` | - | ❌ | Count of concerns related to this SDG |
| **ResolvedConcerns** | `int` | - | ❌ | Count of resolved concerns for this SDG |
| **ProgressPercentage** | `float` | - | ❌ | Progress percentage (0-100) |
| **LastUpdated** | `datetime2` | - | ❌ | Last update timestamp |

**Seeded Data:**
1. **SDG 3**: Good Health and Well-being - End epidemics and combat diseases
2. **SDG 6**: Clean Water and Sanitation - Safe and affordable drinking water  
3. **SDG 11**: Sustainable Cities and Communities - Safe and affordable housing
4. **SDG 13**: Climate Action - Climate resilience and adaptation

---

### 15. **RewardSystem**
*Citizen engagement rewards and points*

| Column Name | Data Type | Max Length | Nullable | Description |
|-------------|-----------|------------|----------|-------------|
| **Id** | `int` | - | ❌ | Primary key, auto-increment |
| **CitizenId** | `nvarchar` | 450 | ❌ | Foreign key to AspNetUsers |
| **Points** | `int` | - | ❌ | Points awarded |
| **RewardType** | `nvarchar` | - | ❌ | Type of reward (QualityReporting, CommunityBenefit, etc.) |
| **Description** | `nvarchar` | - | ❌ | Description of why reward was given |
| **RelatedConcernId** | `int` | - | ✅ | Foreign key to related Concern |
| **EarnedAt** | `datetime2` | - | ❌ | Timestamp when points were earned |
| **IsRedeemed** | `bit` | - | ❌ | Whether points have been redeemed |
| **RedeemedAt** | `datetime2` | - | ✅ | Timestamp when points were redeemed |

**Relationships:**
- **Many-to-One** with `AspNetUsers` (CitizenId → Id) - Cascade Delete
- **Many-to-One** with `Concerns` (RelatedConcernId → Id) - Set Null on Delete

---

## Relationships Diagram

```
AspNetUsers (1) ──── (∞) Concerns
    │                     │
    │                     ├── (∞) ConcernUpdates
    │                     ├── (∞) ConcernComments  
    │                     └── (∞) UserNotifications
    │
    ├── (∞) UserNotifications
    ├── (∞) RewardSystem
    ├── (∞) Departments (HeadOfficer)
    └── (∞) AspNetUserRoles ──── AspNetRoles

Concerns (1) ──── (∞) RewardSystem
```

---

## Indexes

### **Primary Indexes**
- All tables have clustered primary key indexes on `Id` columns
- `AspNetUsers`: Clustered index on `Id` (GUID)
- Composite primary keys on junction tables (`AspNetUserRoles`, `AspNetUserLogins`, `AspNetUserTokens`)

### **Unique Indexes**
- `AspNetUsers.NormalizedUserName` (unique, filtered)
- `AspNetRoles.NormalizedName` (unique, filtered)

### **Foreign Key Indexes**
- `IX_Concerns_CitizenId` 
- `IX_ConcernUpdates_ConcernId`
- `IX_ConcernComments_ConcernId`
- `IX_UserNotifications_UserId`
- `IX_UserNotifications_RelatedConcernId`
- `IX_Departments_HeadOfficerId`
- `IX_RewardSystem_CitizenId`
- `IX_RewardSystem_RelatedConcernId`
- All ASP.NET Identity foreign key indexes

### **Search Indexes**
- `EmailIndex` on `AspNetUsers.NormalizedEmail`
- Geographic spatial indexes on `Concerns.Location`

---

## Data Types & Constraints

### **Spatial Data**
- **Location**: `geography` type with SRID 4326 (WGS84)
- Requires **NetTopologySuite.Geometries.Point** in C#
- **SQL Server Spatial Extensions** enabled

### **JSON Storage**
- **Tags**, **AttachmentUrls**, **ResponsibleCategories**: Stored as JSON strings
- Converted using `JsonSerializer` in Entity Framework
- ⚠️ **Note**: Value comparers not configured (warnings in logs)

### **Enums**
- **ConcernStatus**: New=1, Acknowledged=2, InProgress=3, UnderReview=4, Resolved=5, Closed=6, Rejected=7
- **UserRole**: Citizen=1, Officer=2, DepartmentHead=3, Admin=4, SuperAdmin=5  
- **NotificationType**: ConcernUpdate=1, StatusChange=2, NewAssignment=3, System=4, Reminder=5

### **String Lengths**
- **Names/Titles**: 100-200 characters
- **Descriptions**: Up to 2000 characters
- **Email/UserName**: 256 characters (ASP.NET Identity standard)
- **Foreign Keys**: 450 characters (GUID string representation)

### **Required Fields**
- All `Id`, timestamp, and core business fields are required
- Most descriptive and contact fields are nullable for flexibility
- Location and address fields are optional to support various input methods

---

## Security Considerations

### **Data Encryption**
- Passwords hashed using ASP.NET Identity (PBKDF2)
- Sensitive PII can be anonymized via `IsAnonymous` flag
- No plain-text storage of sensitive information

### **Access Control** 
- Role-based authorization on API endpoints
- Department-based data segregation possible
- Audit trail via `ConcernUpdates` and `UserNotifications`

### **Privacy**
- Anonymous reporting supported
- Personal data separated from concern content  
- GDPR compliance considerations in data retention policies

---

*Last Updated: September 2025*  
*Database Schema Version: 1.0 (Migration: 20250907081755_InitialCreate)*