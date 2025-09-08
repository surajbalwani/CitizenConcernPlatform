using System.ComponentModel.DataAnnotations;
using NetTopologySuite.Geometries;

namespace CitizenConcernAPI.Models
{
    public class Concern
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        [StringLength(2000)]
        public string Description { get; set; } = string.Empty;
        
        public string Category { get; set; } = string.Empty;
        public string SubCategory { get; set; } = string.Empty;
        
        [Range(1, 5)]
        public int Priority { get; set; } = 3;
        
        public int Urgency { get; set; } = 3;
        public int Impact { get; set; } = 3;
        
        public ConcernStatus Status { get; set; } = ConcernStatus.New;
        
        public Point? Location { get; set; }
        public string? Address { get; set; }
        public string? Region { get; set; }
        public string? Ward { get; set; }
        
        public string CitizenId { get; set; } = string.Empty;
        public string? CitizenName { get; set; }
        public string? CitizenPhone { get; set; }
        public string? CitizenEmail { get; set; }
        
        public string? AssignedDepartment { get; set; }
        public string? AssignedOfficer { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
        
        public string? ResolutionNotes { get; set; }
        public bool IsAnonymous { get; set; } = false;
        
        public List<string> Tags { get; set; } = new List<string>();
        public List<string> AttachmentUrls { get; set; } = new List<string>();
        
        public double SentimentScore { get; set; } = 0.0;
        public string Language { get; set; } = "en";
        
        public int UpVotes { get; set; } = 0;
        public int DownVotes { get; set; } = 0;
        
        public List<ConcernUpdate> Updates { get; set; } = new List<ConcernUpdate>();
        public List<ConcernComment> Comments { get; set; } = new List<ConcernComment>();
    }

    public enum ConcernStatus
    {
        New = 1,
        Acknowledged = 2,
        InProgress = 3,
        UnderReview = 4,
        Resolved = 5,
        Closed = 6,
        Rejected = 7
    }

    public class ConcernUpdate
    {
        public int Id { get; set; }
        public int ConcernId { get; set; }
        public Concern Concern { get; set; } = null!;
        
        public string UpdateText { get; set; } = string.Empty;
        public ConcernStatus Status { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class ConcernComment
    {
        public int Id { get; set; }
        public int ConcernId { get; set; }
        public Concern Concern { get; set; } = null!;
        
        public string CommentText { get; set; } = string.Empty;
        public string CommentBy { get; set; } = string.Empty;
        public bool IsOfficial { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}