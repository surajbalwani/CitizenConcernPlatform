using CitizenConcernAPI.Data;
using CitizenConcernAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace CitizenConcernAPI.Services
{
    public class SDGService : ISDGService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SDGService> _logger;

        // Mapping of concern categories to SDG IDs
        private readonly Dictionary<string, List<int>> _categoryToSDGMapping = new()
        {
            { "Health", new List<int> { 1 } }, // SDG 3: Good Health and Well-being
            { "Water", new List<int> { 2 } }, // SDG 6: Clean Water and Sanitation
            { "Sanitation", new List<int> { 2 } }, // SDG 6: Clean Water and Sanitation
            { "Roads", new List<int> { 3 } }, // SDG 11: Sustainable Cities and Communities
            { "Transport", new List<int> { 3 } }, // SDG 11: Sustainable Cities and Communities
            { "Housing", new List<int> { 3 } }, // SDG 11: Sustainable Cities and Communities
            { "Infrastructure", new List<int> { 3 } }, // SDG 11: Sustainable Cities and Communities
            { "Environment", new List<int> { 4 } }, // SDG 13: Climate Action
            { "Electricity", new List<int> { 3, 4 } }, // SDG 11 & 13
            { "Safety", new List<int> { 3 } }, // SDG 11: Sustainable Cities and Communities
            { "Education", new List<int> { } }, // No direct mapping in current SDGs
            { "General", new List<int> { } } // No direct mapping
        };

        // Keywords for additional SDG detection beyond category mapping
        private readonly Dictionary<int, List<string>> _sdgKeywords = new()
        {
            { 1, new List<string> { "health", "medical", "hospital", "clinic", "disease", "medicine", "healthcare", "ambulance", "doctor" } },
            { 2, new List<string> { "water", "sanitation", "sewage", "drainage", "toilet", "hygiene", "waste", "clean water", "drinking water" } },
            { 3, new List<string> { "city", "urban", "housing", "transport", "infrastructure", "road", "building", "community", "public space", "accessibility" } },
            { 4, new List<string> { "climate", "environment", "pollution", "carbon", "green", "renewable", "sustainable", "emission", "air quality", "flooding" } }
        };

        public SDGService(ApplicationDbContext context, ILogger<SDGService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<int>> CategorizeConcernToSDGsAsync(Concern concern)
        {
            try
            {
                var mappedSDGs = new HashSet<int>();

                // Primary mapping based on category
                if (_categoryToSDGMapping.ContainsKey(concern.Category))
                {
                    foreach (var sdgId in _categoryToSDGMapping[concern.Category])
                    {
                        mappedSDGs.Add(sdgId);
                    }
                }

                // Secondary mapping based on keywords in title and description
                var text = $"{concern.Title} {concern.Description}".ToLower();
                
                foreach (var sdgKeywordPair in _sdgKeywords)
                {
                    var sdgId = sdgKeywordPair.Key;
                    var keywords = sdgKeywordPair.Value;

                    var keywordMatches = keywords.Count(keyword => text.Contains(keyword));
                    
                    // If we find multiple keyword matches (>= 2), consider it relevant to this SDG
                    if (keywordMatches >= 2)
                    {
                        mappedSDGs.Add(sdgId);
                    }
                }

                // Log the mapping for transparency
                if (mappedSDGs.Any())
                {
                    _logger.LogInformation("Concern {ConcernId} mapped to SDGs: {SDGIds}", concern.Id, string.Join(", ", mappedSDGs));
                }

                return mappedSDGs.ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error categorizing concern {ConcernId} to SDGs", concern.Id);
                return new List<int>();
            }
        }

        public async Task UpdateSDGProgressAsync(Concern concern)
        {
            try
            {
                var relevantSDGIds = await CategorizeConcernToSDGsAsync(concern);
                
                if (!relevantSDGIds.Any())
                {
                    _logger.LogInformation("Concern {ConcernId} not mapped to any SDGs", concern.Id);
                    return;
                }

                foreach (var sdgId in relevantSDGIds)
                {
                    var sdgMetric = await _context.SDGMetrics.FindAsync(sdgId);
                    if (sdgMetric != null)
                    {
                        // Update metrics based on concern status
                        if (concern.Status == ConcernStatus.New || concern.Status == ConcernStatus.InProgress)
                        {
                            // For new concerns, we just increment the related concerns count
                            await RecalculateSpecificSDGProgressAsync(sdgId);
                        }
                        else if (concern.Status == ConcernStatus.Resolved)
                        {
                            // For resolved concerns, update both counts and progress
                            await RecalculateSpecificSDGProgressAsync(sdgId);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating SDG progress for concern {ConcernId}", concern.Id);
            }
        }

        public async Task<List<SDGMetrics>> GetAllSDGMetricsAsync()
        {
            try
            {
                return await _context.SDGMetrics
                    .OrderBy(s => s.Id)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving SDG metrics");
                return new List<SDGMetrics>();
            }
        }

        public async Task<SDGMetrics?> GetSDGMetricByIdAsync(int id)
        {
            try
            {
                return await _context.SDGMetrics.FindAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving SDG metric {SDGId}", id);
                return null;
            }
        }

        public async Task RecalculateSDGProgressAsync()
        {
            try
            {
                var allSDGs = await _context.SDGMetrics.ToListAsync();
                
                foreach (var sdg in allSDGs)
                {
                    await RecalculateSpecificSDGProgressAsync(sdg.Id);
                }

                _logger.LogInformation("Recalculated progress for all SDGs");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recalculating SDG progress");
            }
        }

        private async Task RecalculateSpecificSDGProgressAsync(int sdgId)
        {
            try
            {
                var sdgMetric = await _context.SDGMetrics.FindAsync(sdgId);
                if (sdgMetric == null) return;

                // Get all concerns that map to this SDG
                var relevantConcernIds = new List<int>();
                var allConcerns = await _context.Concerns.ToListAsync();

                foreach (var concern in allConcerns)
                {
                    var mappedSDGs = await CategorizeConcernToSDGsAsync(concern);
                    if (mappedSDGs.Contains(sdgId))
                    {
                        relevantConcernIds.Add(concern.Id);
                    }
                }

                // Calculate metrics
                var relatedConcerns = relevantConcernIds.Count;
                var resolvedConcerns = await _context.Concerns
                    .Where(c => relevantConcernIds.Contains(c.Id) && c.Status == ConcernStatus.Resolved)
                    .CountAsync();

                var progressPercentage = relatedConcerns > 0 ? (double)resolvedConcerns / relatedConcerns * 100 : 0;

                // Update the SDG metric
                sdgMetric.RelatedConcerns = relatedConcerns;
                sdgMetric.ResolvedConcerns = resolvedConcerns;
                sdgMetric.ProgressPercentage = Math.Round(progressPercentage, 2);
                sdgMetric.LastUpdated = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated SDG {SDGId}: {Related} related, {Resolved} resolved, {Progress}% progress", 
                    sdgId, relatedConcerns, resolvedConcerns, progressPercentage);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recalculating progress for SDG {SDGId}", sdgId);
            }
        }

        public async Task ProcessConcernCreatedAsync(Concern concern)
        {
            try
            {
                await UpdateSDGProgressAsync(concern);
                _logger.LogInformation("Processed SDG categorization for newly created concern {ConcernId}", concern.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing concern creation for SDG tracking, concern {ConcernId}", concern.Id);
            }
        }

        public async Task ProcessConcernResolvedAsync(Concern concern)
        {
            try
            {
                await UpdateSDGProgressAsync(concern);
                _logger.LogInformation("Updated SDG progress for resolved concern {ConcernId}", concern.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing concern resolution for SDG tracking, concern {ConcernId}", concern.Id);
            }
        }

        public async Task<Dictionary<string, List<int>>> GetCategoryToSDGMappingAsync()
        {
            return await Task.FromResult(_categoryToSDGMapping);
        }
    }
}