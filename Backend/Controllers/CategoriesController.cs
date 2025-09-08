using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using CitizenConcernAPI.Data;
using CitizenConcernAPI.Models;

namespace CitizenConcernAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CategoriesController> _logger;

        public CategoriesController(ApplicationDbContext context, ILogger<CategoriesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public ActionResult<IEnumerable<CategoryInfo>> GetCategories()
        {
            try
            {
                var categories = new List<CategoryInfo>
                {
                    new CategoryInfo 
                    { 
                        Name = "Infrastructure", 
                        Description = "Roads, Bridges, Buildings, Public Infrastructure",
                        SubCategories = new List<string> { "Roads", "Bridges", "Buildings", "Public Works" },
                        Icon = "construction",
                        Color = "#FF6B35"
                    },
                    new CategoryInfo 
                    { 
                        Name = "Water", 
                        Description = "Water Supply, Quality, Drainage, Sewerage",
                        SubCategories = new List<string> { "Supply", "Quality", "Drainage", "Sewerage" },
                        Icon = "water_drop",
                        Color = "#0077BE"
                    },
                    new CategoryInfo 
                    { 
                        Name = "Electricity", 
                        Description = "Power Outages, Billing Issues, Infrastructure",
                        SubCategories = new List<string> { "Outages", "Billing", "Infrastructure", "Street Lights" },
                        Icon = "electrical_services",
                        Color = "#FFD23F"
                    },
                    new CategoryInfo 
                    { 
                        Name = "Health", 
                        Description = "Hospitals, Sanitation, Medical Services, Public Health",
                        SubCategories = new List<string> { "Hospitals", "Sanitation", "Medical Services", "Public Health" },
                        Icon = "medical_services",
                        Color = "#06D6A0"
                    },
                    new CategoryInfo 
                    { 
                        Name = "Environment", 
                        Description = "Pollution, Waste Management, Green Spaces",
                        SubCategories = new List<string> { "Air Pollution", "Noise Pollution", "Waste Management", "Green Spaces" },
                        Icon = "eco",
                        Color = "#4CAF50"
                    },
                    new CategoryInfo 
                    { 
                        Name = "Transport", 
                        Description = "Public Transport, Traffic Management, Parking",
                        SubCategories = new List<string> { "Public Transport", "Traffic", "Parking", "Road Safety" },
                        Icon = "directions_transit",
                        Color = "#9C27B0"
                    },
                    new CategoryInfo 
                    { 
                        Name = "Education", 
                        Description = "Schools, Educational Infrastructure, Services",
                        SubCategories = new List<string> { "Schools", "Infrastructure", "Services", "Libraries" },
                        Icon = "school",
                        Color = "#FF9800"
                    },
                    new CategoryInfo 
                    { 
                        Name = "Safety", 
                        Description = "Crime, Security, Emergency Services, Public Safety",
                        SubCategories = new List<string> { "Crime", "Security", "Emergency Services", "Public Safety" },
                        Icon = "security",
                        Color = "#F44336"
                    },
                    new CategoryInfo 
                    { 
                        Name = "Housing", 
                        Description = "Construction, Maintenance, Housing Services",
                        SubCategories = new List<string> { "Construction", "Maintenance", "Housing Services", "Slum Development" },
                        Icon = "home",
                        Color = "#795548"
                    }
                };

                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving categories");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{categoryName}/subcategories")]
        public ActionResult<IEnumerable<string>> GetSubCategories(string categoryName)
        {
            try
            {
                var categoryMap = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase)
                {
                    ["Infrastructure"] = new List<string> { "Roads", "Bridges", "Buildings", "Public Works", "Street Infrastructure" },
                    ["Water"] = new List<string> { "Supply", "Quality", "Drainage", "Sewerage", "Water Treatment" },
                    ["Electricity"] = new List<string> { "Outages", "Billing", "Infrastructure", "Street Lights", "Power Quality" },
                    ["Health"] = new List<string> { "Hospitals", "Sanitation", "Medical Services", "Public Health", "Emergency Services" },
                    ["Environment"] = new List<string> { "Air Pollution", "Noise Pollution", "Waste Management", "Green Spaces", "Water Pollution" },
                    ["Transport"] = new List<string> { "Public Transport", "Traffic", "Parking", "Road Safety", "Vehicle Registration" },
                    ["Education"] = new List<string> { "Schools", "Infrastructure", "Services", "Libraries", "Educational Programs" },
                    ["Safety"] = new List<string> { "Crime", "Security", "Emergency Services", "Public Safety", "Disaster Management" },
                    ["Housing"] = new List<string> { "Construction", "Maintenance", "Housing Services", "Slum Development", "Property Registration" }
                };

                if (categoryMap.TryGetValue(categoryName, out var subCategories))
                {
                    return Ok(subCategories);
                }

                return NotFound($"Category '{categoryName}' not found");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving subcategories for {CategoryName}", categoryName);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("statistics")]
        public async Task<ActionResult<IEnumerable<CategoryStatistics>>> GetCategoryStatistics()
        {
            try
            {
                var statistics = await _context.Concerns
                    .GroupBy(c => c.Category)
                    .Select(g => new CategoryStatistics
                    {
                        Category = g.Key,
                        TotalConcerns = g.Count(),
                        ResolvedConcerns = g.Count(c => c.Status == ConcernStatus.Resolved),
                        AverageResolutionTime = g.Where(c => c.ResolvedAt.HasValue)
                                               .Select(c => (c.ResolvedAt!.Value - c.CreatedAt).TotalHours)
                                               .DefaultIfEmpty(0)
                                               .Average(),
                        AveragePriority = g.Average(c => c.Priority),
                        AverageSentiment = g.Average(c => c.SentimentScore),
                        TotalUpVotes = g.Sum(c => c.UpVotes),
                        TotalDownVotes = g.Sum(c => c.DownVotes)
                    })
                    .OrderByDescending(s => s.TotalConcerns)
                    .ToListAsync();

                return Ok(statistics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving category statistics");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("trending")]
        public async Task<ActionResult<IEnumerable<TrendingCategory>>> GetTrendingCategories([FromQuery] int days = 30)
        {
            try
            {
                var startDate = DateTime.UtcNow.AddDays(-days);
                
                var trendingCategories = await _context.Concerns
                    .Where(c => c.CreatedAt >= startDate)
                    .GroupBy(c => c.Category)
                    .Select(g => new TrendingCategory
                    {
                        Category = g.Key,
                        ConcernCount = g.Count(),
                        GrowthRate = CalculateGrowthRate(g.Key, days),
                        AveragePriority = g.Average(c => c.Priority),
                        TotalVotes = g.Sum(c => c.UpVotes + c.DownVotes)
                    })
                    .OrderByDescending(t => t.ConcernCount)
                    .Take(10)
                    .ToListAsync();

                return Ok(trendingCategories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving trending categories");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("department-mapping")]
        public async Task<ActionResult<IEnumerable<DepartmentCategoryMapping>>> GetDepartmentMapping()
        {
            try
            {
                var mappings = await _context.Departments
                    .Select(d => new DepartmentCategoryMapping
                    {
                        DepartmentId = d.Id,
                        DepartmentName = d.Name,
                        ResponsibleCategories = d.ResponsibleCategories,
                        IsActive = d.IsActive
                    })
                    .ToListAsync();

                return Ok(mappings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving department mappings");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("department-mapping")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> UpdateDepartmentMapping(UpdateDepartmentMappingRequest request)
        {
            try
            {
                var department = await _context.Departments.FindAsync(request.DepartmentId);
                if (department == null)
                    return NotFound("Department not found");

                department.ResponsibleCategories = request.Categories;
                await _context.SaveChangesAsync();

                return Ok(new { Message = "Department mapping updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating department mapping");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("keywords")]
        public async Task<ActionResult<IEnumerable<CategoryKeywords>>> GetCategoryKeywords()
        {
            try
            {
                var keywordsByCategory = await _context.Concerns
                    .Where(c => c.Tags.Any())
                    .GroupBy(c => c.Category)
                    .Select(g => new CategoryKeywords
                    {
                        Category = g.Key,
                        Keywords = g.SelectMany(c => c.Tags)
                                   .GroupBy(tag => tag)
                                   .OrderByDescending(tg => tg.Count())
                                   .Take(10)
                                   .Select(tg => new KeywordFrequency
                                   {
                                       Keyword = tg.Key,
                                       Frequency = tg.Count()
                                   })
                                   .ToList()
                    })
                    .ToListAsync();

                return Ok(keywordsByCategory);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving category keywords");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("priority-distribution")]
        public async Task<ActionResult<IEnumerable<CategoryPriorityDistribution>>> GetPriorityDistribution()
        {
            try
            {
                var priorityDistribution = await _context.Concerns
                    .GroupBy(c => new { c.Category, c.Priority })
                    .Select(g => new CategoryPriorityDistribution
                    {
                        Category = g.Key.Category,
                        Priority = g.Key.Priority,
                        Count = g.Count(),
                        Percentage = 0 // Will be calculated after grouping
                    })
                    .ToListAsync();

                // Calculate percentages
                var categoryTotals = priorityDistribution
                    .GroupBy(pd => pd.Category)
                    .ToDictionary(g => g.Key, g => g.Sum(pd => pd.Count));

                foreach (var item in priorityDistribution)
                {
                    var total = categoryTotals[item.Category];
                    item.Percentage = total > 0 ? (double)item.Count / total * 100 : 0;
                }

                return Ok(priorityDistribution.OrderBy(pd => pd.Category).ThenBy(pd => pd.Priority));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving priority distribution");
                return StatusCode(500, "Internal server error");
            }
        }

        private double CalculateGrowthRate(string category, int days)
        {
            try
            {
                var midPoint = DateTime.UtcNow.AddDays(-days / 2);
                var startDate = DateTime.UtcNow.AddDays(-days);

                var firstHalfCount = _context.Concerns
                    .Count(c => c.Category == category && c.CreatedAt >= startDate && c.CreatedAt < midPoint);

                var secondHalfCount = _context.Concerns
                    .Count(c => c.Category == category && c.CreatedAt >= midPoint);

                return firstHalfCount > 0 ? ((double)(secondHalfCount - firstHalfCount) / firstHalfCount) * 100 : 0;
            }
            catch
            {
                return 0;
            }
        }
    }

    // DTOs
    public class CategoryInfo
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<string> SubCategories { get; set; } = new();
        public string Icon { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
    }

    public class CategoryStatistics
    {
        public string Category { get; set; } = string.Empty;
        public int TotalConcerns { get; set; }
        public int ResolvedConcerns { get; set; }
        public double AverageResolutionTime { get; set; }
        public double AveragePriority { get; set; }
        public double AverageSentiment { get; set; }
        public int TotalUpVotes { get; set; }
        public int TotalDownVotes { get; set; }
        public double ResolutionRate => TotalConcerns > 0 ? (double)ResolvedConcerns / TotalConcerns * 100 : 0;
        public double SatisfactionRate => (TotalUpVotes + TotalDownVotes) > 0 ? (double)TotalUpVotes / (TotalUpVotes + TotalDownVotes) * 100 : 0;
    }

    public class TrendingCategory
    {
        public string Category { get; set; } = string.Empty;
        public int ConcernCount { get; set; }
        public double GrowthRate { get; set; }
        public double AveragePriority { get; set; }
        public int TotalVotes { get; set; }
    }

    public class DepartmentCategoryMapping
    {
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public List<string> ResponsibleCategories { get; set; } = new();
        public bool IsActive { get; set; }
    }

    public class UpdateDepartmentMappingRequest
    {
        public int DepartmentId { get; set; }
        public List<string> Categories { get; set; } = new();
    }

    public class CategoryKeywords
    {
        public string Category { get; set; } = string.Empty;
        public List<KeywordFrequency> Keywords { get; set; } = new();
    }

    public class KeywordFrequency
    {
        public string Keyword { get; set; } = string.Empty;
        public int Frequency { get; set; }
    }

    public class CategoryPriorityDistribution
    {
        public string Category { get; set; } = string.Empty;
        public int Priority { get; set; }
        public int Count { get; set; }
        public double Percentage { get; set; }
    }
}