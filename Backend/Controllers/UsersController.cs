using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using CitizenConcernAPI.Data;
using CitizenConcernAPI.Models;

namespace CitizenConcernAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<UsersController> _logger;

        public UsersController(
            UserManager<ApplicationUser> userManager,
            ApplicationDbContext context,
            ILogger<UsersController> logger)
        {
            _userManager = userManager;
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<ActionResult<PagedResult<UserSummary>>> GetUsers(
            [FromQuery] int page = 1,
            [FromQuery] int limit = 20,
            [FromQuery] UserRole? role = null,
            [FromQuery] string? search = null,
            [FromQuery] string? department = null,
            [FromQuery] bool? isVerified = null)
        {
            try
            {
                var query = _userManager.Users.AsQueryable();

                if (role.HasValue)
                    query = query.Where(u => u.Role == role.Value);

                if (!string.IsNullOrEmpty(search))
                    query = query.Where(u => u.FirstName.Contains(search) || 
                                           u.LastName.Contains(search) || 
                                           u.Email!.Contains(search));

                if (!string.IsNullOrEmpty(department))
                    query = query.Where(u => u.Department == department);

                if (isVerified.HasValue)
                    query = query.Where(u => u.IsVerified == isVerified.Value);

                var totalCount = await query.CountAsync();
                var users = await query
                    .OrderByDescending(u => u.CreatedAt)
                    .Skip((page - 1) * limit)
                    .Take(limit)
                    .Select(u => new UserSummary
                    {
                        Id = u.Id,
                        FirstName = u.FirstName,
                        LastName = u.LastName,
                        Email = u.Email!,
                        Role = u.Role,
                        Department = u.Department,
                        Region = u.Region,
                        IsVerified = u.IsVerified,
                        CreatedAt = u.CreatedAt,
                        LastLoginAt = u.LastLoginAt
                    })
                    .ToListAsync();

                var result = new PagedResult<UserSummary>
                {
                    Data = users,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = limit,
                    TotalPages = (int)Math.Ceiling((double)totalCount / limit)
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<ActionResult<UserDetails>> GetUser(string id)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null)
                    return NotFound();

                var roles = await _userManager.GetRolesAsync(user);
                var submittedConcerns = await _context.Concerns
                    .Where(c => c.CitizenId == id)
                    .CountAsync();

                var rewardPoints = await _context.RewardSystem
                    .Where(r => r.CitizenId == id)
                    .SumAsync(r => r.Points);

                var userDetails = new UserDetails
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email!,
                    PhoneNumber = user.PhoneNumber,
                    Address = user.Address,
                    Region = user.Region,
                    Ward = user.Ward,
                    Role = user.Role,
                    Department = user.Department,
                    IsVerified = user.IsVerified,
                    CreatedAt = user.CreatedAt,
                    LastLoginAt = user.LastLoginAt,
                    Roles = roles.ToList(),
                    SubmittedConcerns = submittedConcerns,
                    RewardPoints = rewardPoints
                };

                return Ok(userDetails);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user {UserId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> UpdateUser(string id, UpdateUserRequest request)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null)
                    return NotFound();

                user.FirstName = request.FirstName;
                user.LastName = request.LastName;
                user.PhoneNumber = request.PhoneNumber;
                user.Address = request.Address;
                user.Region = request.Region;
                user.Ward = request.Ward;
                user.Department = request.Department;
                user.IsVerified = request.IsVerified;

                if (request.Role != user.Role)
                {
                    user.Role = request.Role;
                    // Update roles in ASP.NET Identity
                    var currentRoles = await _userManager.GetRolesAsync(user);
                    await _userManager.RemoveFromRolesAsync(user, currentRoles);
                    await _userManager.AddToRoleAsync(user, request.Role.ToString());
                }

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                    return BadRequest(result.Errors);

                return Ok(new { Message = "User updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {UserId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null)
                    return NotFound();

                // Check if user has submitted concerns
                var hasSubmittedConcerns = await _context.Concerns.AnyAsync(c => c.CitizenId == id);
                if (hasSubmittedConcerns)
                {
                    return BadRequest("Cannot delete user who has submitted concerns. Consider deactivating instead.");
                }

                var result = await _userManager.DeleteAsync(user);
                if (!result.Succeeded)
                    return BadRequest(result.Errors);

                return Ok(new { Message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user {UserId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("{id}/verify")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> VerifyUser(string id)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null)
                    return NotFound();

                user.IsVerified = true;
                var result = await _userManager.UpdateAsync(user);

                if (!result.Succeeded)
                    return BadRequest(result.Errors);

                // Create notification
                var notification = new UserNotification
                {
                    UserId = id,
                    Title = "Account Verified",
                    Message = "Your account has been verified by an administrator.",
                    Type = NotificationType.System
                };

                _context.UserNotifications.Add(notification);
                await _context.SaveChangesAsync();

                return Ok(new { Message = "User verified successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying user {UserId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("{id}/deactivate")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> DeactivateUser(string id)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null)
                    return NotFound();

                user.IsVerified = false;
                user.LockoutEnd = DateTimeOffset.MaxValue; // Lock indefinitely
                
                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                    return BadRequest(result.Errors);

                return Ok(new { Message = "User deactivated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating user {UserId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("profile")]
        public async Task<ActionResult<UserProfile>> GetProfile()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var user = await _userManager.FindByIdAsync(userId!);

                if (user == null)
                    return NotFound();

                var submittedConcerns = await _context.Concerns
                    .Where(c => c.CitizenId == userId)
                    .Select(c => new ConcernSummary
                    {
                        Id = c.Id,
                        Title = c.Title,
                        Category = c.Category,
                        Status = c.Status,
                        Priority = c.Priority,
                        CreatedAt = c.CreatedAt,
                        UpVotes = c.UpVotes,
                        DownVotes = c.DownVotes
                    })
                    .OrderByDescending(c => c.CreatedAt)
                    .Take(10)
                    .ToListAsync();

                var notifications = await _context.UserNotifications
                    .Where(n => n.UserId == userId)
                    .OrderByDescending(n => n.CreatedAt)
                    .Take(10)
                    .ToListAsync();

                var rewardHistory = await _context.RewardSystem
                    .Where(r => r.CitizenId == userId)
                    .OrderByDescending(r => r.EarnedAt)
                    .Take(10)
                    .ToListAsync();

                var profile = new UserProfile
                {
                    User = new UserDetails
                    {
                        Id = user.Id,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        Email = user.Email!,
                        PhoneNumber = user.PhoneNumber,
                        Address = user.Address,
                        Region = user.Region,
                        Ward = user.Ward,
                        Role = user.Role,
                        Department = user.Department,
                        IsVerified = user.IsVerified,
                        CreatedAt = user.CreatedAt,
                        LastLoginAt = user.LastLoginAt,
                        SubmittedConcerns = submittedConcerns.Count,
                        RewardPoints = rewardHistory.Sum(r => r.Points)
                    },
                    RecentConcerns = submittedConcerns,
                    RecentNotifications = notifications,
                    RewardHistory = rewardHistory
                };

                return Ok(profile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user profile");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile(UpdateProfileRequest request)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var user = await _userManager.FindByIdAsync(userId!);

                if (user == null)
                    return NotFound();

                user.FirstName = request.FirstName;
                user.LastName = request.LastName;
                user.PhoneNumber = request.PhoneNumber;
                user.Address = request.Address;
                user.Region = request.Region;
                user.Ward = request.Ward;

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                    return BadRequest(result.Errors);

                return Ok(new { Message = "Profile updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating profile");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("statistics")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<ActionResult<UserStatistics>> GetUserStatistics()
        {
            try
            {
                var totalUsers = await _userManager.Users.CountAsync();
                var verifiedUsers = await _userManager.Users.CountAsync(u => u.IsVerified);
                var activeUsers = await _userManager.Users.CountAsync(u => u.LastLoginAt.HasValue && u.LastLoginAt > DateTime.UtcNow.AddDays(-30));

                var roleDistribution = await _userManager.Users
                    .GroupBy(u => u.Role)
                    .Select(g => new RoleDistribution
                    {
                        Role = g.Key,
                        Count = g.Count(),
                        Percentage = (double)g.Count() / totalUsers * 100
                    })
                    .ToListAsync();

                var regionDistribution = await _userManager.Users
                    .Where(u => u.Region != null)
                    .GroupBy(u => u.Region!)
                    .Select(g => new RegionDistribution
                    {
                        Region = g.Key,
                        Count = g.Count()
                    })
                    .OrderByDescending(r => r.Count)
                    .Take(10)
                    .ToListAsync();

                var statistics = new UserStatistics
                {
                    TotalUsers = totalUsers,
                    VerifiedUsers = verifiedUsers,
                    ActiveUsers = activeUsers,
                    NewUsersThisMonth = await _userManager.Users.CountAsync(u => u.CreatedAt >= DateTime.UtcNow.AddDays(-30)),
                    VerificationRate = totalUsers > 0 ? (double)verifiedUsers / totalUsers * 100 : 0,
                    RoleDistribution = roleDistribution,
                    RegionDistribution = regionDistribution
                };

                return Ok(statistics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user statistics");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("notifications")]
        public async Task<ActionResult<IEnumerable<UserNotification>>> GetNotifications(
            [FromQuery] bool unreadOnly = false)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var query = _context.UserNotifications.Where(n => n.UserId == userId);

                if (unreadOnly)
                    query = query.Where(n => !n.IsRead);

                var notifications = await query
                    .OrderByDescending(n => n.CreatedAt)
                    .Take(50)
                    .ToListAsync();

                return Ok(notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving notifications");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("notifications/{notificationId}/read")]
        public async Task<IActionResult> MarkNotificationAsRead(int notificationId)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var notification = await _context.UserNotifications
                    .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

                if (notification == null)
                    return NotFound();

                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new { Message = "Notification marked as read" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notification as read");
                return StatusCode(500, "Internal server error");
            }
        }
    }

    // DTOs
    public class PagedResult<T>
    {
        public List<T> Data { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class UserSummary
    {
        public string Id { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public string? Department { get; set; }
        public string? Region { get; set; }
        public bool IsVerified { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
    }

    public class UserDetails
    {
        public string Id { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? Region { get; set; }
        public string? Ward { get; set; }
        public UserRole Role { get; set; }
        public string? Department { get; set; }
        public bool IsVerified { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public List<string> Roles { get; set; } = new();
        public int SubmittedConcerns { get; set; }
        public int RewardPoints { get; set; }
    }

    public class UpdateUserRequest
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? Region { get; set; }
        public string? Ward { get; set; }
        public UserRole Role { get; set; }
        public string? Department { get; set; }
        public bool IsVerified { get; set; }
    }

    public class UpdateProfileRequest
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? Region { get; set; }
        public string? Ward { get; set; }
    }

    public class UserProfile
    {
        public UserDetails User { get; set; } = null!;
        public List<ConcernSummary> RecentConcerns { get; set; } = new();
        public List<UserNotification> RecentNotifications { get; set; } = new();
        public List<RewardSystem> RewardHistory { get; set; } = new();
    }

    public class ConcernSummary
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public ConcernStatus Status { get; set; }
        public int Priority { get; set; }
        public DateTime CreatedAt { get; set; }
        public int UpVotes { get; set; }
        public int DownVotes { get; set; }
    }

    public class UserStatistics
    {
        public int TotalUsers { get; set; }
        public int VerifiedUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int NewUsersThisMonth { get; set; }
        public double VerificationRate { get; set; }
        public List<RoleDistribution> RoleDistribution { get; set; } = new();
        public List<RegionDistribution> RegionDistribution { get; set; } = new();
    }

    public class RoleDistribution
    {
        public UserRole Role { get; set; }
        public int Count { get; set; }
        public double Percentage { get; set; }
    }

    public class RegionDistribution
    {
        public string Region { get; set; } = string.Empty;
        public int Count { get; set; }
    }
}