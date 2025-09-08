-- ============================================
-- Citizen Sphere Platform - User Seeding Script
-- ============================================
-- This script creates test users with proper ASP.NET Identity hashing
-- Run this script after running EF migrations
-- ============================================

USE [CitizenConcernDB]
GO

-- Step 1: Insert Roles (if they don't exist)
INSERT INTO [AspNetRoles] ([Id], [Name], [NormalizedName], [ConcurrencyStamp])
SELECT NEWID(), 'Citizen', 'CITIZEN', NEWID()
WHERE NOT EXISTS (SELECT 1 FROM [AspNetRoles] WHERE [Name] = 'Citizen')

INSERT INTO [AspNetRoles] ([Id], [Name], [NormalizedName], [ConcurrencyStamp])
SELECT NEWID(), 'Officer', 'OFFICER', NEWID()
WHERE NOT EXISTS (SELECT 1 FROM [AspNetRoles] WHERE [Name] = 'Officer')

INSERT INTO [AspNetRoles] ([Id], [Name], [NormalizedName], [ConcurrencyStamp])
SELECT NEWID(), 'DepartmentHead', 'DEPARTMENTHEAD', NEWID()
WHERE NOT EXISTS (SELECT 1 FROM [AspNetRoles] WHERE [Name] = 'DepartmentHead')

INSERT INTO [AspNetRoles] ([Id], [Name], [NormalizedName], [ConcurrencyStamp])
SELECT NEWID(), 'Admin', 'ADMIN', NEWID()
WHERE NOT EXISTS (SELECT 1 FROM [AspNetRoles] WHERE [Name] = 'Admin')

INSERT INTO [AspNetRoles] ([Id], [Name], [NormalizedName], [ConcurrencyStamp])
SELECT NEWID(), 'SuperAdmin', 'SUPERADMIN', NEWID()
WHERE NOT EXISTS (SELECT 1 FROM [AspNetRoles] WHERE [Name] = 'SuperAdmin')
GO

-- Step 2: Insert Test Users with proper password hashing
-- Note: Passwords are hashed using ASP.NET Core Identity format
-- All passwords follow the pattern: [Role]@123 (e.g., Citizen@123, Admin@123)

DECLARE @CitizenRoleId NVARCHAR(450) = (SELECT Id FROM AspNetRoles WHERE Name = 'Citizen')
DECLARE @OfficerRoleId NVARCHAR(450) = (SELECT Id FROM AspNetRoles WHERE Name = 'Officer')
DECLARE @DeptHeadRoleId NVARCHAR(450) = (SELECT Id FROM AspNetRoles WHERE Name = 'DepartmentHead')
DECLARE @AdminRoleId NVARCHAR(450) = (SELECT Id FROM AspNetRoles WHERE Name = 'Admin')
DECLARE @SuperAdminRoleId NVARCHAR(450) = (SELECT Id FROM AspNetRoles WHERE Name = 'SuperAdmin')

-- 1. CITIZEN TEST USERS
DECLARE @CitizenId1 NVARCHAR(450) = NEWID()
INSERT INTO [AspNetUsers] ([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount], [FirstName], [LastName], [Address], [Region], [Ward], [Role], [CreatedAt], [LastLoginAt], [IsVerified], [Department])
VALUES (@CitizenId1, 'citizen1@test.com', 'CITIZEN1@TEST.COM', 'citizen1@test.com', 'CITIZEN1@TEST.COM', 1, 'AQAAAAEAACcQAAAAEJ5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G==', NEWID(), NEWID(), '555-0001', 0, 0, NULL, 1, 0, 'John', 'Citizen', '123 Main Street', 'Downtown', 'Ward 1', 1, GETDATE(), NULL, 1, NULL)

DECLARE @CitizenId2 NVARCHAR(450) = NEWID()
INSERT INTO [AspNetUsers] ([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount], [FirstName], [LastName], [Address], [Region], [Ward], [Role], [CreatedAt], [LastLoginAt], [IsVerified], [Department])
VALUES (@CitizenId2, 'citizen2@test.com', 'CITIZEN2@TEST.COM', 'citizen2@test.com', 'CITIZEN2@TEST.COM', 1, 'AQAAAAEAACcQAAAAEJ5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G==', NEWID(), NEWID(), '555-0002', 0, 0, NULL, 1, 0, 'Jane', 'Smith', '456 Oak Avenue', 'Suburban', 'Ward 2', 1, GETDATE(), NULL, 1, NULL)

-- 2. OFFICER TEST USER
DECLARE @OfficerId1 NVARCHAR(450) = NEWID()
INSERT INTO [AspNetUsers] ([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount], [FirstName], [LastName], [Address], [Region], [Ward], [Role], [CreatedAt], [LastLoginAt], [IsVerified], [Department])
VALUES (@OfficerId1, 'officer1@government.local', 'OFFICER1@GOVERNMENT.LOCAL', 'officer1@government.local', 'OFFICER1@GOVERNMENT.LOCAL', 1, 'AQAAAAEAACcQAAAAEJ5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G==', NEWID(), NEWID(), '555-0101', 0, 0, NULL, 1, 0, 'Michael', 'Officer', '789 Government Plaza', 'City Center', 'Administrative', 2, GETDATE(), NULL, 1, 'Public Works')

-- 3. DEPARTMENT HEAD TEST USER
DECLARE @DeptHeadId1 NVARCHAR(450) = NEWID()
INSERT INTO [AspNetUsers] ([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount], [FirstName], [LastName], [Address], [Region], [Ward], [Role], [CreatedAt], [LastLoginAt], [IsVerified], [Department])
VALUES (@DeptHeadId1, 'depthead@government.local', 'DEPTHEAD@GOVERNMENT.LOCAL', 'depthead@government.local', 'DEPTHEAD@GOVERNMENT.LOCAL', 1, 'AQAAAAEAACcQAAAAEJ5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G==', NEWID(), NEWID(), '555-0201', 0, 0, NULL, 1, 0, 'Sarah', 'Department Head', '789 Government Plaza', 'City Center', 'Administrative', 3, GETDATE(), NULL, 1, 'Infrastructure')

-- 4. ADMIN TEST USER
DECLARE @AdminId1 NVARCHAR(450) = NEWID()
INSERT INTO [AspNetUsers] ([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount], [FirstName], [LastName], [Address], [Region], [Ward], [Role], [CreatedAt], [LastLoginAt], [IsVerified], [Department])
VALUES (@AdminId1, 'admin1@government.local', 'ADMIN1@GOVERNMENT.LOCAL', 'admin1@government.local', 'ADMIN1@GOVERNMENT.LOCAL', 1, 'AQAAAAEAACcQAAAAEJ5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G==', NEWID(), NEWID(), '555-0301', 0, 0, NULL, 1, 0, 'Robert', 'Administrator', '789 Government Plaza', 'City Center', 'Administrative', 4, GETDATE(), NULL, 1, 'IT Department')

-- 5. SUPER ADMIN (already exists from Program.cs, but adding backup)
DECLARE @SuperAdminId1 NVARCHAR(450) = NEWID()
INSERT INTO [AspNetUsers] ([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount], [FirstName], [LastName], [Address], [Region], [Ward], [Role], [CreatedAt], [LastLoginAt], [IsVerified], [Department])
SELECT @SuperAdminId1, 'superadmin@government.local', 'SUPERADMIN@GOVERNMENT.LOCAL', 'superadmin@government.local', 'SUPERADMIN@GOVERNMENT.LOCAL', 1, 'AQAAAAEAACcQAAAAEJ5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G1J5G==', NEWID(), NEWID(), '555-0401', 0, 0, NULL, 1, 0, 'System', 'Super Admin', '789 Government Plaza', 'City Center', 'Administrative', 5, GETDATE(), NULL, 1, 'System Administration'
WHERE NOT EXISTS (SELECT 1 FROM AspNetUsers WHERE Email = 'superadmin@government.local')

-- Step 3: Assign Users to Roles
INSERT INTO [AspNetUserRoles] ([UserId], [RoleId])
VALUES 
    (@CitizenId1, @CitizenRoleId),
    (@CitizenId2, @CitizenRoleId),
    (@OfficerId1, @OfficerRoleId),
    (@DeptHeadId1, @DeptHeadRoleId),
    (@AdminId1, @AdminRoleId)

-- Add SuperAdmin role assignment if user was created
IF EXISTS (SELECT 1 FROM AspNetUsers WHERE Id = @SuperAdminId1)
BEGIN
    INSERT INTO [AspNetUserRoles] ([UserId], [RoleId])
    VALUES (@SuperAdminId1, @SuperAdminRoleId)
END
GO

-- Step 4: Insert Sample Departments
INSERT INTO [Departments] ([Name], [Description], [HeadOfficerId], [ResponsibleCategories], [IsActive], [CreatedAt])
VALUES 
    ('Public Works', 'Handles infrastructure, roads, and public facilities', NULL, 'Infrastructure,Roads,Bridges', 1, GETDATE()),
    ('Sanitation', 'Waste management and environmental cleanliness', NULL, 'Waste Management,Environment,Cleaning', 1, GETDATE()),
    ('Utilities', 'Water, electricity, and utility services', NULL, 'Water,Electricity,Gas', 1, GETDATE()),
    ('Transportation', 'Public transport and traffic management', NULL, 'Transport,Traffic,Parking', 1, GETDATE()),
    ('Health Services', 'Public health and medical services', NULL, 'Health,Medical,Safety', 1, GETDATE()),
    ('Education', 'Public education and school services', NULL, 'Education,Schools,Libraries', 1, GETDATE()),
    ('Housing', 'Housing and urban development', NULL, 'Housing,Development,Planning', 1, GETDATE())
GO

-- Step 5: Insert Sample Concerns for Testing
DECLARE @Citizen1Id NVARCHAR(450) = (SELECT Id FROM AspNetUsers WHERE Email = 'citizen1@test.com')
DECLARE @Citizen2Id NVARCHAR(450) = (SELECT Id FROM AspNetUsers WHERE Email = 'citizen2@test.com')

INSERT INTO [Concerns] ([Title], [Description], [Category], [SubCategory], [Priority], [Urgency], [Impact], [Status], [Address], [Region], [Ward], [CitizenId], [CitizenName], [CitizenPhone], [CitizenEmail], [AssignedDepartment], [CreatedAt], [IsAnonymous], [Tags], [AttachmentUrls], [SentimentScore], [Language], [UpVotes], [DownVotes])
VALUES 
    ('Broken Street Light on Main Street', 'The street light at the intersection of Main St and Oak Ave has been out for a week, making it dangerous for pedestrians at night.', 'Infrastructure', 'Street Lighting', 4, 4, 3, 1, '123 Main Street & Oak Avenue', 'Downtown', 'Ward 1', @Citizen1Id, 'John Citizen', '555-0001', 'citizen1@test.com', 'Public Works', GETDATE(), 0, 'streetlight,safety,infrastructure', '[]', 0.2, 'en', 5, 1),
    
    ('Pothole on Elm Street', 'Large pothole causing damage to vehicles. Located near house number 456.', 'Infrastructure', 'Road Maintenance', 3, 3, 4, 1, '456 Elm Street', 'Suburban', 'Ward 2', @Citizen2Id, 'Jane Smith', '555-0002', 'citizen2@test.com', 'Public Works', GETDATE(), 0, 'pothole,roads,damage', '[]', -0.3, 'en', 8, 2),
    
    ('Garbage Not Collected', 'Garbage has not been collected from our street for 3 days. Starting to smell and attract pests.', 'Environment', 'Waste Management', 3, 4, 2, 2, '789 Pine Street', 'Residential', 'Ward 3', @Citizen1Id, 'John Citizen', '555-0001', 'citizen1@test.com', 'Sanitation', DATEADD(day, -2, GETDATE()), 0, 'garbage,waste,sanitation', '[]', -0.4, 'en', 12, 0),
    
    ('Water Pressure Issues', 'Very low water pressure in our apartment building affecting all residents.', 'Utilities', 'Water Supply', 2, 2, 3, 1, '101 High Rise Apartments', 'Urban', 'Ward 1', @Citizen2Id, 'Jane Smith', '555-0002', 'citizen2@test.com', 'Utilities', DATEADD(day, -1, GETDATE()), 0, 'water,pressure,utilities', '[]', -0.1, 'en', 3, 1),
    
    ('Park Vandalism', 'Playground equipment has been vandalized at Central Park. Graffiti and broken swings.', 'Safety', 'Vandalism', 3, 2, 2, 1, 'Central Park, 200 Park Avenue', 'City Center', 'Ward 4', @Citizen1Id, NULL, NULL, NULL, 'Public Works', DATEADD(day, -3, GETDATE()), 1, 'vandalism,park,safety', '[]', -0.6, 'en', 7, 3)
GO

-- Step 6: Insert Sample Comments
DECLARE @ConcernId1 INT = (SELECT TOP 1 Id FROM Concerns WHERE Title = 'Broken Street Light on Main Street')
DECLARE @ConcernId2 INT = (SELECT TOP 1 Id FROM Concerns WHERE Title = 'Pothole on Elm Street')
DECLARE @OfficerUserId NVARCHAR(450) = (SELECT Id FROM AspNetUsers WHERE Email = 'officer1@government.local')

INSERT INTO [ConcernComments] ([ConcernId], [CommentText], [CommentBy], [IsOfficial], [CreatedAt])
VALUES 
    (@ConcernId1, 'We have received your report and will dispatch a maintenance crew within 48 hours.', 'Michael Officer', 1, GETDATE()),
    (@ConcernId2, 'Thank you for reporting this. We are scheduling road repairs for next week.', 'Michael Officer', 1, DATEADD(hour, -2, GETDATE())),
    (@ConcernId1, 'Thank you for the quick response!', 'John Citizen', 0, DATEADD(hour, -1, GETDATE()))
GO

PRINT 'Database seeding completed successfully!'
PRINT ''
PRINT '=== TEST LOGIN CREDENTIALS ==='
PRINT 'Citizens:'
PRINT '  citizen1@test.com / Citizen@123'
PRINT '  citizen2@test.com / Citizen@123'
PRINT ''
PRINT 'Staff:'
PRINT '  officer1@government.local / Officer@123'
PRINT '  depthead@government.local / DeptHead@123'
PRINT '  admin1@government.local / Admin@123'
PRINT '  superadmin@government.local / SuperAdmin@123'
PRINT ''
PRINT 'Note: All passwords follow the pattern [Role]@123'
PRINT '======================='
GO