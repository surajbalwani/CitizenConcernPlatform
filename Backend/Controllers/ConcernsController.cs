using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CitizenConcernAPI.Data;
using CitizenConcernAPI.Models;
using CitizenConcernAPI.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace CitizenConcernAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConcernsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IAIService _aiService;
        private readonly IRewardService _rewardService;
        private readonly ISDGService _sdgService;
        private readonly ILogger<ConcernsController> _logger;

        public ConcernsController(
            ApplicationDbContext context, 
            IAIService aiService, 
            IRewardService rewardService,
            ISDGService sdgService,
            ILogger<ConcernsController> logger)
        {
            _context = context;
            _aiService = aiService;
            _rewardService = rewardService;
            _sdgService = sdgService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Concern>>> GetConcerns(
            [FromQuery] int page = 1, 
            [FromQuery] int limit = 10,
            [FromQuery] string? category = null,
            [FromQuery] string? status = null,
            [FromQuery] string? region = null)
        {
            try
            {
                var query = _context.Concerns
                    .Include(c => c.Updates)
                    .Include(c => c.Comments)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(category))
                    query = query.Where(c => c.Category.ToLower() == category.ToLower());

                if (!string.IsNullOrEmpty(status) && Enum.TryParse<ConcernStatus>(status, true, out var statusEnum))
                    query = query.Where(c => c.Status == statusEnum);

                if (!string.IsNullOrEmpty(region))
                    query = query.Where(c => c.Region != null && c.Region.ToLower() == region.ToLower());

                var totalCount = await query.CountAsync();
                var concerns = await query
                    .OrderByDescending(c => c.CreatedAt)
                    .Skip((page - 1) * limit)
                    .Take(limit)
                    .ToListAsync();

                Response.Headers.Add("X-Total-Count", totalCount.ToString());
                Response.Headers.Add("X-Page", page.ToString());
                Response.Headers.Add("X-Per-Page", limit.ToString());

                return Ok(concerns);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving concerns");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Concern>> GetConcern(int id)
        {
            try
            {
                var concern = await _context.Concerns
                    .Include(c => c.Updates)
                    .Include(c => c.Comments)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (concern == null)
                    return NotFound();

                return Ok(concern);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving concern {ConcernId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Concern>> CreateConcern(CreateConcernRequest request)
        {
            try
            {
                var concern = new Concern
                {
                    Title = request.Title,
                    Description = request.Description,
                    Address = request.Address,
                    Region = request.Region,
                    Ward = request.Ward,
                    CitizenId = request.CitizenId,
                    CitizenName = request.CitizenName,
                    CitizenPhone = request.CitizenPhone,
                    CitizenEmail = request.CitizenEmail,
                    IsAnonymous = request.IsAnonymous,
                    Language = request.Language ?? "en",
                    AttachmentUrls = request.AttachmentUrls ?? new List<string>()
                };

                if (request.Latitude.HasValue && request.Longitude.HasValue)
                {
                    concern.Location = new NetTopologySuite.Geometries.Point(request.Longitude.Value, request.Latitude.Value) 
                    { 
                        SRID = 4326 
                    };
                }

                var result = await _aiService.ClassifyConcernAsync(concern.Title, concern.Description);
                concern.Category = result.Category ?? string.Empty;
                concern.SentimentScore = result.SentimentScore;
                concern.Priority = result.Priority;
                concern.Tags = result.Keywords?.Take(5).ToList() ?? [];
                concern.SubCategory = result.SdgGoal ?? string.Empty;

                _context.Concerns.Add(concern);
                await _context.SaveChangesAsync();

                var initialUpdate = new ConcernUpdate
                {
                    ConcernId = concern.Id,
                    UpdateText = "Concern submitted successfully",
                    Status = ConcernStatus.New,
                    UpdatedBy = "System"
                };

                _context.ConcernUpdates.Add(initialUpdate);
                await _context.SaveChangesAsync();

                // Process rewards and SDG categorization
                await _rewardService.ProcessConcernSubmissionRewardAsync(concern);
                await _sdgService.ProcessConcernCreatedAsync(concern);

                return CreatedAtAction(nameof(GetConcern), new { id = concern.Id }, concern);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating concern");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Officer,DepartmentHead,Admin")]
        public async Task<IActionResult> UpdateConcernStatus(int id, UpdateStatusRequest request)
        {
            try
            {
                var concern = await _context.Concerns.FindAsync(id);
                if (concern == null)
                    return NotFound();

                var oldStatus = concern.Status;
                concern.Status = request.Status;
                concern.UpdatedAt = DateTime.UtcNow;

                if (request.Status == ConcernStatus.Resolved)
                    concern.ResolvedAt = DateTime.UtcNow;

                if (!string.IsNullOrEmpty(request.AssignedDepartment))
                    concern.AssignedDepartment = request.AssignedDepartment;

                if (!string.IsNullOrEmpty(request.AssignedOfficer))
                    concern.AssignedOfficer = request.AssignedOfficer;

                if (!string.IsNullOrEmpty(request.ResolutionNotes))
                    concern.ResolutionNotes = request.ResolutionNotes;

                var statusUpdate = new ConcernUpdate
                {
                    ConcernId = id,
                    UpdateText = request.UpdateText ?? $"Status changed from {oldStatus} to {request.Status}",
                    Status = request.Status,
                    UpdatedBy = User.Identity?.Name ?? "System"
                };

                _context.ConcernUpdates.Add(statusUpdate);
                await _context.SaveChangesAsync();

                // Process rewards and SDG updates for resolved concerns
                if (request.Status == ConcernStatus.Resolved && oldStatus != ConcernStatus.Resolved)
                {
                    var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                    await _rewardService.ProcessConcernResolutionRewardAsync(concern, currentUserId);
                    await _sdgService.ProcessConcernResolvedAsync(concern);
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating concern status");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("{id}/vote")]
        public async Task<IActionResult> VoteConcern(int id, VoteRequest request)
        {
            try
            {
                var concern = await _context.Concerns.FindAsync(id);
                if (concern == null)
                    return NotFound();

                if (request.IsUpVote)
                    concern.UpVotes++;
                else
                    concern.DownVotes++;

                var newPriority = await _aiService.PrioritizeConcernAsync(concern);
                concern.Priority = newPriority;

                await _context.SaveChangesAsync();

                // Process voting rewards
                var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(currentUserId))
                {
                    await _rewardService.ProcessVotingRewardAsync(currentUserId, id, request.IsUpVote);
                }

                return Ok(new { UpVotes = concern.UpVotes, DownVotes = concern.DownVotes, Priority = concern.Priority });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error voting on concern");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("{id}/comments")]
        public async Task<IActionResult> AddComment(int id, AddCommentRequest request)
        {
            try
            {
                var concern = await _context.Concerns.FindAsync(id);
                if (concern == null)
                    return NotFound();

                var comment = new ConcernComment
                {
                    ConcernId = id,
                    CommentText = request.CommentText,
                    CommentBy = request.CommentBy,
                    IsOfficial = request.IsOfficial
                };

                _context.ConcernComments.Add(comment);
                await _context.SaveChangesAsync();

                // Process comment rewards
                var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(currentUserId))
                {
                    await _rewardService.ProcessCommentRewardAsync(currentUserId, id, request.IsOfficial);
                }

                return Ok(comment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding comment");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("analytics")]
        [Authorize(Roles = "Officer,DepartmentHead,Admin")]
        public async Task<ActionResult<ConcernAnalytics>> GetAnalytics()
        {
            try
            {
                var analytics = new ConcernAnalytics
                {
                    TotalConcerns = await _context.Concerns.CountAsync(),
                    NewConcerns = await _context.Concerns.CountAsync(c => c.Status == ConcernStatus.New),
                    InProgressConcerns = await _context.Concerns.CountAsync(c => c.Status == ConcernStatus.InProgress),
                    ResolvedConcerns = await _context.Concerns.CountAsync(c => c.Status == ConcernStatus.Resolved),
                    ClosedConcerns = await _context.Concerns.CountAsync(c => c.Status == ConcernStatus.Closed)
                };

                var resolvedConcerns = await _context.Concerns
                    .Where(c => c.ResolvedAt.HasValue)
                    .Select(c => new { c.CreatedAt, c.ResolvedAt })
                    .ToListAsync();

                if (resolvedConcerns.Any())
                {
                    analytics.AverageResolutionTime = resolvedConcerns
                        .Select(c => (c.ResolvedAt!.Value - c.CreatedAt).TotalHours)
                        .Average();
                }

                analytics.ConcernsByCategory = await _context.Concerns
                    .GroupBy(c => c.Category)
                    .Select(g => new { Category = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.Category, x => x.Count);

                analytics.ConcernsByRegion = await _context.Concerns
                    .Where(c => c.Region != null)
                    .GroupBy(c => c.Region!)
                    .Select(g => new { Region = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.Region, x => x.Count);

                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving analytics");
                return StatusCode(500, "Internal server error");
            }
        }
    }

    public class CreateConcernRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? Region { get; set; }
        public string? Ward { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string CitizenId { get; set; } = string.Empty;
        public string? CitizenName { get; set; }
        public string? CitizenPhone { get; set; }
        public string? CitizenEmail { get; set; }
        public bool IsAnonymous { get; set; } = false;
        public string? Language { get; set; }
        public List<string>? AttachmentUrls { get; set; }
    }

    public class UpdateStatusRequest
    {
        public ConcernStatus Status { get; set; }
        public string? UpdateText { get; set; }
        public string? AssignedDepartment { get; set; }
        public string? AssignedOfficer { get; set; }
        public string? ResolutionNotes { get; set; }
    }

    public class VoteRequest
    {
        public bool IsUpVote { get; set; }
    }

    public class AddCommentRequest
    {
        public string CommentText { get; set; } = string.Empty;
        public string CommentBy { get; set; } = string.Empty;
        public bool IsOfficial { get; set; } = false;
    }
}