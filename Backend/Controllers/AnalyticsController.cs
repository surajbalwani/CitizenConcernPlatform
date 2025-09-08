using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using CitizenConcernAPI.Data;
using CitizenConcernAPI.Models;

namespace CitizenConcernAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Officer,DepartmentHead,Admin,SuperAdmin")]
    public class AnalyticsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AnalyticsController> _logger;

        public AnalyticsController(ApplicationDbContext context, ILogger<AnalyticsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("dashboard")]
        public async Task<ActionResult<ConcernAnalytics>> GetDashboardAnalytics()
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

                // Calculate average resolution time
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

                // Category breakdown
                analytics.ConcernsByCategory = await _context.Concerns
                    .GroupBy(c => c.Category)
                    .Select(g => new { Category = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.Category, x => x.Count);

                // Regional breakdown
                analytics.ConcernsByRegion = await _context.Concerns
                    .Where(c => c.Region != null)
                    .GroupBy(c => c.Region!)
                    .Select(g => new { Region = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.Region, x => x.Count);

                // Department breakdown
                analytics.ConcernsByDepartment = await _context.Concerns
                    .Where(c => c.AssignedDepartment != null)
                    .GroupBy(c => c.AssignedDepartment!)
                    .Select(g => new { Department = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.Department, x => x.Count);

                // Sentiment analysis by category
                analytics.SentimentByCategory = await _context.Concerns
                    .GroupBy(c => c.Category)
                    .Select(g => new { Category = g.Key, AvgSentiment = g.Average(c => c.SentimentScore) })
                    .ToDictionaryAsync(x => x.Category, x => x.AvgSentiment);

                // Daily trends (last 30 days)
                var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
                analytics.DailyTrends = await _context.Concerns
                    .Where(c => c.CreatedAt >= thirtyDaysAgo)
                    .GroupBy(c => new { Date = c.CreatedAt.Date, c.Category })
                    .Select(g => new TrendData
                    {
                        Date = g.Key.Date,
                        Category = g.Key.Category,
                        Count = g.Count()
                    })
                    .ToListAsync();

                // Regional heatmap
                analytics.RegionalHeatmap = await _context.Concerns
                    .Where(c => c.Location != null && c.Region != null)
                    .GroupBy(c => c.Region!)
                    .Select(g => new HeatmapData
                    {
                        Region = g.Key,
                        Latitude = g.Average(c => c.Location!.Y),
                        Longitude = g.Average(c => c.Location!.X),
                        ConcernCount = g.Count(),
                        Priority = (int)g.Average(c => c.Priority),
                        DominantCategory = g.GroupBy(c => c.Category)
                                           .OrderByDescending(gc => gc.Count())
                                           .First().Key
                    })
                    .ToListAsync();

                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving dashboard analytics");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("metrics")]
        public async Task<ActionResult<IEnumerable<AnalyticsData>>> GetMetrics(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] string? category = null,
            [FromQuery] string? region = null)
        {
            try
            {
                var query = _context.AnalyticsData.AsQueryable();

                if (startDate.HasValue)
                    query = query.Where(a => a.Date >= startDate.Value);

                if (endDate.HasValue)
                    query = query.Where(a => a.Date <= endDate.Value);

                if (!string.IsNullOrEmpty(category))
                    query = query.Where(a => a.Category == category);

                if (!string.IsNullOrEmpty(region))
                    query = query.Where(a => a.Region == region);

                var metrics = await query.OrderByDescending(a => a.Date).ToListAsync();
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving metrics");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("performance")]
        public async Task<ActionResult<PerformanceMetrics>> GetPerformanceMetrics()
        {
            try
            {
                var totalConcerns = await _context.Concerns.CountAsync();
                var resolvedConcerns = await _context.Concerns.CountAsync(c => c.Status == ConcernStatus.Resolved);
                var avgResolutionTime = await _context.Concerns
                    .Where(c => c.ResolvedAt.HasValue)
                    .Select(c => (c.ResolvedAt!.Value - c.CreatedAt).TotalHours)
                    .DefaultIfEmpty(0)
                    .AverageAsync();

                // Department performance
                var departmentPerformance = await _context.Concerns
                    .Where(c => c.AssignedDepartment != null)
                    .GroupBy(c => c.AssignedDepartment!)
                    .Select(g => new DepartmentPerformance
                    {
                        Department = g.Key,
                        TotalConcerns = g.Count(),
                        ResolvedConcerns = g.Count(c => c.Status == ConcernStatus.Resolved),
                        AverageResolutionTime = g.Where(c => c.ResolvedAt.HasValue)
                                               .Select(c => (c.ResolvedAt!.Value - c.CreatedAt).TotalHours)
                                               .DefaultIfEmpty(0)
                                               .Average(),
                        ResolutionRate = g.Count() > 0 ? (double)g.Count(c => c.Status == ConcernStatus.Resolved) / g.Count() * 100 : 0
                    })
                    .ToListAsync();

                var performance = new PerformanceMetrics
                {
                    TotalConcerns = totalConcerns,
                    ResolvedConcerns = resolvedConcerns,
                    ResolutionRate = totalConcerns > 0 ? (double)resolvedConcerns / totalConcerns * 100 : 0,
                    AverageResolutionTime = avgResolutionTime,
                    DepartmentPerformance = departmentPerformance
                };

                return Ok(performance);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving performance metrics");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("trends")]
        public async Task<ActionResult<IEnumerable<TrendData>>> GetTrends(
            [FromQuery] int days = 30,
            [FromQuery] string? category = null)
        {
            try
            {
                var startDate = DateTime.UtcNow.AddDays(-days);
                var query = _context.Concerns.Where(c => c.CreatedAt >= startDate);

                if (!string.IsNullOrEmpty(category))
                    query = query.Where(c => c.Category == category);

                var trends = await query
                    .GroupBy(c => new { Date = c.CreatedAt.Date, c.Category })
                    .Select(g => new TrendData
                    {
                        Date = g.Key.Date,
                        Category = g.Key.Category,
                        Count = g.Count()
                    })
                    .OrderBy(t => t.Date)
                    .ToListAsync();

                return Ok(trends);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving trends");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("heatmap")]
        public async Task<ActionResult<IEnumerable<HeatmapData>>> GetHeatmap()
        {
            try
            {
                var heatmapData = await _context.Concerns
                    .Where(c => c.Location != null && c.Region != null)
                    .GroupBy(c => new { c.Region, c.Ward })
                    .Select(g => new HeatmapData
                    {
                        Region = g.Key.Region!,
                        Latitude = g.Average(c => c.Location!.Y),
                        Longitude = g.Average(c => c.Location!.X),
                        ConcernCount = g.Count(),
                        Priority = (int)g.Average(c => c.Priority),
                        DominantCategory = g.GroupBy(c => c.Category)
                                           .OrderByDescending(gc => gc.Count())
                                           .First().Key
                    })
                    .ToListAsync();

                return Ok(heatmapData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving heatmap data");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("sdg-progress")]
        public async Task<ActionResult<IEnumerable<SDGMetrics>>> GetSDGProgress()
        {
            try
            {
                var sdgMetrics = await _context.SDGMetrics.ToListAsync();
                return Ok(sdgMetrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving SDG progress");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("generate-report")]
        public async Task<ActionResult<AnalyticsReport>> GenerateReport(ReportRequest request)
        {
            try
            {
                var query = _context.Concerns.AsQueryable();

                if (request.StartDate.HasValue)
                    query = query.Where(c => c.CreatedAt >= request.StartDate.Value);

                if (request.EndDate.HasValue)
                    query = query.Where(c => c.CreatedAt <= request.EndDate.Value);

                if (!string.IsNullOrEmpty(request.Category))
                    query = query.Where(c => c.Category == request.Category);

                if (!string.IsNullOrEmpty(request.Region))
                    query = query.Where(c => c.Region == request.Region);

                if (!string.IsNullOrEmpty(request.Department))
                    query = query.Where(c => c.AssignedDepartment == request.Department);

                var concerns = await query.ToListAsync();

                var report = new AnalyticsReport
                {
                    ReportId = Guid.NewGuid().ToString(),
                    GeneratedAt = DateTime.UtcNow,
                    Parameters = request,
                    TotalConcerns = concerns.Count,
                    StatusBreakdown = concerns.GroupBy(c => c.Status)
                                            .ToDictionary(g => g.Key.ToString(), g => g.Count()),
                    CategoryBreakdown = concerns.GroupBy(c => c.Category)
                                              .ToDictionary(g => g.Key, g => g.Count()),
                    AverageResolutionTime = concerns.Where(c => c.ResolvedAt.HasValue)
                                                  .Select(c => (c.ResolvedAt!.Value - c.CreatedAt).TotalHours)
                                                  .DefaultIfEmpty(0)
                                                  .Average(),
                    CitizenSatisfactionScore = concerns.Where(c => c.UpVotes + c.DownVotes > 0)
                                                     .Select(c => (double)c.UpVotes / (c.UpVotes + c.DownVotes))
                                                     .DefaultIfEmpty(0)
                                                     .Average() * 100
                };

                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating report");
                return StatusCode(500, "Internal server error");
            }
        }
    }

    // DTOs
    public class PerformanceMetrics
    {
        public int TotalConcerns { get; set; }
        public int ResolvedConcerns { get; set; }
        public double ResolutionRate { get; set; }
        public double AverageResolutionTime { get; set; }
        public List<DepartmentPerformance> DepartmentPerformance { get; set; } = new();
    }

    public class DepartmentPerformance
    {
        public string Department { get; set; } = string.Empty;
        public int TotalConcerns { get; set; }
        public int ResolvedConcerns { get; set; }
        public double AverageResolutionTime { get; set; }
        public double ResolutionRate { get; set; }
    }

    public class ReportRequest
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Category { get; set; }
        public string? Region { get; set; }
        public string? Department { get; set; }
        public string? ReportType { get; set; }
    }

    public class AnalyticsReport
    {
        public string ReportId { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; }
        public ReportRequest Parameters { get; set; } = null!;
        public int TotalConcerns { get; set; }
        public Dictionary<string, int> StatusBreakdown { get; set; } = new();
        public Dictionary<string, int> CategoryBreakdown { get; set; } = new();
        public double AverageResolutionTime { get; set; }
        public double CitizenSatisfactionScore { get; set; }
    }
}