using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace CitizenConcernAPI.Models
{
    public class ApplicationUser : IdentityUser
    {
        [StringLength(100)]
        public string FirstName { get; set; } = string.Empty;
        
        [StringLength(100)]
        public string LastName { get; set; } = string.Empty;
        
        public string? Address { get; set; }
        public string? Region { get; set; }
        public string? Ward { get; set; }
        
        public UserRole Role { get; set; } = UserRole.Citizen;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLoginAt { get; set; }
        
        public bool IsVerified { get; set; } = false;
        public string? Department { get; set; }
        
        public string FullName => $"{FirstName} {LastName}";
        
        public List<Concern> SubmittedConcerns { get; set; } = new List<Concern>();
    }

    public enum UserRole
    {
        Citizen = 1,
        Officer = 2,
        DepartmentHead = 3,
        Admin = 4,
        SuperAdmin = 5
    }

    public class Department
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        public string? HeadOfficerId { get; set; }
        public ApplicationUser? HeadOfficer { get; set; }
        
        public List<string> ResponsibleCategories { get; set; } = new List<string>();
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class UserNotification
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public ApplicationUser User { get; set; } = null!;
        
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public NotificationType Type { get; set; }
        
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReadAt { get; set; }
        
        public int? RelatedConcernId { get; set; }
        public Concern? RelatedConcern { get; set; }
    }

    public enum NotificationType
    {
        ConcernUpdate = 1,
        StatusChange = 2,
        NewAssignment = 3,
        System = 4,
        Reminder = 5
    }
}