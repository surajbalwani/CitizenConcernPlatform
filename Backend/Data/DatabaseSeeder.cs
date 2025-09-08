using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using CitizenConcernAPI.Models;

namespace CitizenConcernAPI.Data
{
    public static class DatabaseSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager, ILogger logger)
        {
            try
            {
                await SeedRolesAsync(roleManager, logger);
                await SeedUsersAsync(userManager, logger);
                await SeedDepartmentsAsync(context, logger);
                await SeedConcernsAsync(context, userManager, logger);
                
                logger.LogInformation("Database seeding completed successfully!");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while seeding the database.");
                throw;
            }
        }

        private static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager, ILogger logger)
        {
            logger.LogInformation("Seeding roles...");

            string[] roleNames = { "Citizen", "Officer", "DepartmentHead", "Admin", "SuperAdmin" };

            foreach (var roleName in roleNames)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    var result = await roleManager.CreateAsync(new IdentityRole(roleName));
                    if (result.Succeeded)
                    {
                        logger.LogInformation($"Role '{roleName}' created successfully.");
                    }
                    else
                    {
                        logger.LogWarning($"Failed to create role '{roleName}': {string.Join(", ", result.Errors.Select(e => e.Description))}");
                    }
                }
            }
        }

        private static async Task SeedUsersAsync(UserManager<ApplicationUser> userManager, ILogger logger)
        {
            logger.LogInformation("Seeding users...");

            var testUsers = new[]
            {
                new
                {
                    Email = "citizen1@test.com",
                    Password = "Citizen@123",
                    FirstName = "John",
                    LastName = "Citizen",
                    Role = UserRole.Citizen,
                    RoleName = "Citizen",
                    Address = "123 Main Street",
                    Region = "Downtown",
                    Ward = "Ward 1",
                    PhoneNumber = "555-0001",
                    Department = (string?)null
                },
                new
                {
                    Email = "citizen2@test.com",
                    Password = "Citizen@123",
                    FirstName = "Jane",
                    LastName = "Smith",
                    Role = UserRole.Citizen,
                    RoleName = "Citizen",
                    Address = "456 Oak Avenue",
                    Region = "Suburban",
                    Ward = "Ward 2",
                    PhoneNumber = "555-0002",
                    Department = (string?)null
                },
                new
                {
                    Email = "officer1@government.local",
                    Password = "Officer@123",
                    FirstName = "Michael",
                    LastName = "Officer",
                    Role = UserRole.Officer,
                    RoleName = "Officer",
                    Address = "789 Government Plaza",
                    Region = "City Center",
                    Ward = "Administrative",
                    PhoneNumber = "555-0101",
                    Department = "Public Works"
                },
                new
                {
                    Email = "depthead@government.local",
                    Password = "DeptHead@123",
                    FirstName = "Sarah",
                    LastName = "DepartmentHead",
                    Role = UserRole.DepartmentHead,
                    RoleName = "DepartmentHead",
                    Address = "789 Government Plaza",
                    Region = "City Center",
                    Ward = "Administrative",
                    PhoneNumber = "555-0201",
                    Department = "Infrastructure"
                },
                new
                {
                    Email = "admin1@government.local",
                    Password = "Admin@123",
                    FirstName = "Robert",
                    LastName = "Administrator",
                    Role = UserRole.Admin,
                    RoleName = "Admin",
                    Address = "789 Government Plaza",
                    Region = "City Center",
                    Ward = "Administrative",
                    PhoneNumber = "555-0301",
                    Department = "IT Department"
                },
                new
                {
                    Email = "superadmin@government.local",
                    Password = "SuperAdmin@123",
                    FirstName = "System",
                    LastName = "SuperAdmin",
                    Role = UserRole.SuperAdmin,
                    RoleName = "SuperAdmin",
                    Address = "789 Government Plaza",
                    Region = "City Center",
                    Ward = "Administrative",
                    PhoneNumber = "555-0401",
                    Department = "System Administration"
                }
            };

            foreach (var userData in testUsers)
            {
                var existingUser = await userManager.FindByEmailAsync(userData.Email);
                if (existingUser == null)
                {
                    var user = new ApplicationUser
                    {
                        UserName = userData.Email,
                        Email = userData.Email,
                        FirstName = userData.FirstName,
                        LastName = userData.LastName,
                        Role = userData.Role,
                        Address = userData.Address,
                        Region = userData.Region,
                        Ward = userData.Ward,
                        PhoneNumber = userData.PhoneNumber,
                        Department = userData.Department,
                        IsVerified = true,
                        EmailConfirmed = true,
                        PhoneNumberConfirmed = false,
                        CreatedAt = DateTime.UtcNow
                    };

                    var result = await userManager.CreateAsync(user, userData.Password);
                    if (result.Succeeded)
                    {
                        await userManager.AddToRoleAsync(user, userData.RoleName);
                        logger.LogInformation($"User '{userData.Email}' created successfully with role '{userData.RoleName}'.");
                    }
                    else
                    {
                        logger.LogWarning($"Failed to create user '{userData.Email}': {string.Join(", ", result.Errors.Select(e => e.Description))}");
                    }
                }
                else
                {
                    logger.LogInformation($"User '{userData.Email}' already exists, skipping...");
                }
            }
        }

        private static async Task SeedDepartmentsAsync(ApplicationDbContext context, ILogger logger)
        {
            logger.LogInformation("Seeding departments...");

            if (!context.Departments.Any())
            {
                var departments = new[]
                {
                    new Department
                    {
                        Name = "Public Works",
                        Description = "Handles infrastructure, roads, and public facilities",
                        ResponsibleCategories = new List<string> { "Infrastructure", "Roads", "Bridges", "Street Lighting" },
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Department
                    {
                        Name = "Sanitation",
                        Description = "Waste management and environmental cleanliness",
                        ResponsibleCategories = new List<string> { "Waste Management", "Environment", "Cleaning", "Recycling" },
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Department
                    {
                        Name = "Utilities",
                        Description = "Water, electricity, and utility services",
                        ResponsibleCategories = new List<string> { "Water", "Electricity", "Gas", "Internet" },
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Department
                    {
                        Name = "Transportation",
                        Description = "Public transport and traffic management",
                        ResponsibleCategories = new List<string> { "Transport", "Traffic", "Parking", "Public Transit" },
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Department
                    {
                        Name = "Health Services",
                        Description = "Public health and medical services",
                        ResponsibleCategories = new List<string> { "Health", "Medical", "Safety", "Emergency Services" },
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Department
                    {
                        Name = "Education",
                        Description = "Public education and school services",
                        ResponsibleCategories = new List<string> { "Education", "Schools", "Libraries", "Youth Programs" },
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Department
                    {
                        Name = "Housing & Development",
                        Description = "Housing and urban development services",
                        ResponsibleCategories = new List<string> { "Housing", "Development", "Planning", "Zoning" },
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    }
                };

                context.Departments.AddRange(departments);
                await context.SaveChangesAsync();
                logger.LogInformation($"Created {departments.Length} departments.");
            }
            else
            {
                logger.LogInformation("Departments already exist, skipping...");
            }
        }

        private static async Task SeedConcernsAsync(ApplicationDbContext context, UserManager<ApplicationUser> userManager, ILogger logger)
        {
            logger.LogInformation("Seeding sample concerns...");

            if (!context.Concerns.Any())
            {
                var citizen1 = await userManager.FindByEmailAsync("citizen1@test.com");
                var citizen2 = await userManager.FindByEmailAsync("citizen2@test.com");

                if (citizen1 != null && citizen2 != null)
                {
                    var concerns = new[]
                    {
                        new Concern
                        {
                            Title = "Broken Street Light on Main Street",
                            Description = "The street light at the intersection of Main St and Oak Ave has been out for a week, making it dangerous for pedestrians at night.",
                            Category = "Infrastructure",
                            SubCategory = "Street Lighting",
                            Priority = 4,
                            Urgency = 4,
                            Impact = 3,
                            Status = ConcernStatus.New,
                            Address = "123 Main Street & Oak Avenue",
                            Region = "Downtown",
                            Ward = "Ward 1",
                            CitizenId = citizen1.Id,
                            CitizenName = $"{citizen1.FirstName} {citizen1.LastName}",
                            CitizenPhone = citizen1.PhoneNumber,
                            CitizenEmail = citizen1.Email,
                            AssignedDepartment = "Public Works",
                            CreatedAt = DateTime.UtcNow.AddDays(-1),
                            IsAnonymous = false,
                            Tags = new List<string> { "streetlight", "safety", "infrastructure" },
                            AttachmentUrls = new List<string>(),
                            SentimentScore = 0.2,
                            Language = "en",
                            UpVotes = 5,
                            DownVotes = 1,
                            Updates = new List<ConcernUpdate>(),
                            Comments = new List<ConcernComment>()
                        },
                        new Concern
                        {
                            Title = "Pothole on Elm Street",
                            Description = "Large pothole causing damage to vehicles. Located near house number 456.",
                            Category = "Infrastructure",
                            SubCategory = "Road Maintenance",
                            Priority = 3,
                            Urgency = 3,
                            Impact = 4,
                            Status = ConcernStatus.Acknowledged,
                            Address = "456 Elm Street",
                            Region = "Suburban",
                            Ward = "Ward 2",
                            CitizenId = citizen2.Id,
                            CitizenName = $"{citizen2.FirstName} {citizen2.LastName}",
                            CitizenPhone = citizen2.PhoneNumber,
                            CitizenEmail = citizen2.Email,
                            AssignedDepartment = "Public Works",
                            CreatedAt = DateTime.UtcNow.AddDays(-3),
                            IsAnonymous = false,
                            Tags = new List<string> { "pothole", "roads", "damage" },
                            AttachmentUrls = new List<string>(),
                            SentimentScore = -0.3,
                            Language = "en",
                            UpVotes = 8,
                            DownVotes = 2,
                            Updates = new List<ConcernUpdate>(),
                            Comments = new List<ConcernComment>()
                        },
                        new Concern
                        {
                            Title = "Garbage Not Collected",
                            Description = "Garbage has not been collected from our street for 3 days. Starting to smell and attract pests.",
                            Category = "Environment",
                            SubCategory = "Waste Management",
                            Priority = 3,
                            Urgency = 4,
                            Impact = 2,
                            Status = ConcernStatus.InProgress,
                            Address = "789 Pine Street",
                            Region = "Residential",
                            Ward = "Ward 3",
                            CitizenId = citizen1.Id,
                            CitizenName = $"{citizen1.FirstName} {citizen1.LastName}",
                            CitizenPhone = citizen1.PhoneNumber,
                            CitizenEmail = citizen1.Email,
                            AssignedDepartment = "Sanitation",
                            CreatedAt = DateTime.UtcNow.AddDays(-2),
                            IsAnonymous = false,
                            Tags = new List<string> { "garbage", "waste", "sanitation" },
                            AttachmentUrls = new List<string>(),
                            SentimentScore = -0.4,
                            Language = "en",
                            UpVotes = 12,
                            DownVotes = 0,
                            Updates = new List<ConcernUpdate>(),
                            Comments = new List<ConcernComment>()
                        },
                        new Concern
                        {
                            Title = "Water Pressure Issues",
                            Description = "Very low water pressure in our apartment building affecting all residents.",
                            Category = "Utilities",
                            SubCategory = "Water Supply",
                            Priority = 2,
                            Urgency = 2,
                            Impact = 3,
                            Status = ConcernStatus.New,
                            Address = "101 High Rise Apartments",
                            Region = "Urban",
                            Ward = "Ward 1",
                            CitizenId = citizen2.Id,
                            CitizenName = $"{citizen2.FirstName} {citizen2.LastName}",
                            CitizenPhone = citizen2.PhoneNumber,
                            CitizenEmail = citizen2.Email,
                            AssignedDepartment = "Utilities",
                            CreatedAt = DateTime.UtcNow.AddDays(-1),
                            IsAnonymous = false,
                            Tags = new List<string> { "water", "pressure", "utilities" },
                            AttachmentUrls = new List<string>(),
                            SentimentScore = -0.1,
                            Language = "en",
                            UpVotes = 3,
                            DownVotes = 1,
                            Updates = new List<ConcernUpdate>(),
                            Comments = new List<ConcernComment>()
                        },
                        new Concern
                        {
                            Title = "Park Vandalism",
                            Description = "Playground equipment has been vandalized at Central Park. Graffiti and broken swings.",
                            Category = "Safety",
                            SubCategory = "Vandalism",
                            Priority = 3,
                            Urgency = 2,
                            Impact = 2,
                            Status = ConcernStatus.New,
                            Address = "Central Park, 200 Park Avenue",
                            Region = "City Center",
                            Ward = "Ward 4",
                            CitizenId = citizen1.Id,
                            CitizenName = null, // Anonymous
                            CitizenPhone = null,
                            CitizenEmail = null,
                            AssignedDepartment = "Public Works",
                            CreatedAt = DateTime.UtcNow.AddDays(-3),
                            IsAnonymous = true,
                            Tags = new List<string> { "vandalism", "park", "safety" },
                            AttachmentUrls = new List<string>(),
                            SentimentScore = -0.6,
                            Language = "en",
                            UpVotes = 7,
                            DownVotes = 3,
                            Updates = new List<ConcernUpdate>(),
                            Comments = new List<ConcernComment>()
                        }
                    };

                    context.Concerns.AddRange(concerns);
                    await context.SaveChangesAsync();
                    
                    // Add some sample comments
                    await SeedCommentsAsync(context, userManager, logger);
                    
                    logger.LogInformation($"Created {concerns.Length} sample concerns.");
                }
                else
                {
                    logger.LogWarning("Could not find citizen users for seeding concerns.");
                }
            }
            else
            {
                logger.LogInformation("Concerns already exist, skipping...");
            }
        }

        private static async Task SeedCommentsAsync(ApplicationDbContext context, UserManager<ApplicationUser> userManager, ILogger logger)
        {
            var officer = await userManager.FindByEmailAsync("officer1@government.local");
            var citizen1 = await userManager.FindByEmailAsync("citizen1@test.com");

            if (officer != null && citizen1 != null)
            {
                var streetLightConcern = context.Concerns.FirstOrDefault(c => c.Title.Contains("Street Light"));
                var potholeConcern = context.Concerns.FirstOrDefault(c => c.Title.Contains("Pothole"));

                if (streetLightConcern != null && potholeConcern != null)
                {
                    var comments = new[]
                    {
                        new ConcernComment
                        {
                            ConcernId = streetLightConcern.Id,
                            CommentText = "We have received your report and will dispatch a maintenance crew within 48 hours.",
                            CommentBy = $"{officer.FirstName} {officer.LastName}",
                            IsOfficial = true,
                            CreatedAt = DateTime.UtcNow.AddHours(-6)
                        },
                        new ConcernComment
                        {
                            ConcernId = potholeConcern.Id,
                            CommentText = "Thank you for reporting this. We are scheduling road repairs for next week.",
                            CommentBy = $"{officer.FirstName} {officer.LastName}",
                            IsOfficial = true,
                            CreatedAt = DateTime.UtcNow.AddHours(-12)
                        },
                        new ConcernComment
                        {
                            ConcernId = streetLightConcern.Id,
                            CommentText = "Thank you for the quick response!",
                            CommentBy = $"{citizen1.FirstName} {citizen1.LastName}",
                            IsOfficial = false,
                            CreatedAt = DateTime.UtcNow.AddHours(-3)
                        }
                    };

                    context.ConcernComments.AddRange(comments);
                    await context.SaveChangesAsync();
                    logger.LogInformation($"Created {comments.Length} sample comments.");
                }
            }
        }

        public static void LogCredentials(ILogger logger)
        {
            logger.LogInformation("=== TEST LOGIN CREDENTIALS ===");
            logger.LogInformation("Citizens:");
            logger.LogInformation("  citizen1@test.com / Citizen@123");
            logger.LogInformation("  citizen2@test.com / Citizen@123");
            logger.LogInformation("");
            logger.LogInformation("Staff:");
            logger.LogInformation("  officer1@government.local / Officer@123");
            logger.LogInformation("  depthead@government.local / DeptHead@123");
            logger.LogInformation("  admin1@government.local / Admin@123");
            logger.LogInformation("  superadmin@government.local / SuperAdmin@123");
            logger.LogInformation("");
            logger.LogInformation("Note: All passwords follow the pattern [Role]@123");
            logger.LogInformation("===============================");
        }
    }
}