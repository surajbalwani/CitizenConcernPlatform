using System.ComponentModel.DataAnnotations;

namespace CitizenConcernAPI.Models
{
    public class AnalyticsData
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public string MetricName { get; set; } = string.Empty;
        public string MetricValue { get; set; } = string.Empty;
        public string? Category { get; set; }
        public string? Region { get; set; }
        public string? Department { get; set; }
    }

    public class ConcernAnalytics
    {
        public int TotalConcerns { get; set; }
        public int NewConcerns { get; set; }
        public int InProgressConcerns { get; set; }
        public int ResolvedConcerns { get; set; }
        public int ClosedConcerns { get; set; }
        
        public double AverageResolutionTime { get; set; }
        public double CitizenSatisfactionScore { get; set; }
        
        public Dictionary<string, int> ConcernsByCategory { get; set; } = new();
        public Dictionary<string, int> ConcernsByRegion { get; set; } = new();
        public Dictionary<string, int> ConcernsByDepartment { get; set; } = new();
        public Dictionary<string, double> SentimentByCategory { get; set; } = new();
        
        public List<TrendData> DailyTrends { get; set; } = new();
        public List<HeatmapData> RegionalHeatmap { get; set; } = new();
    }

    public class TrendData
    {
        public DateTime Date { get; set; }
        public int Count { get; set; }
        public string Category { get; set; } = string.Empty;
    }

    public class HeatmapData
    {
        public string Region { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public int ConcernCount { get; set; }
        public int Priority { get; set; }
        public string DominantCategory { get; set; } = string.Empty;
    }

    public class SDGMetrics
    {
        public int Id { get; set; }
        public string SDGGoal { get; set; } = string.Empty;
        public string SDGTarget { get; set; } = string.Empty;
        public int RelatedConcerns { get; set; }
        public int ResolvedConcerns { get; set; }
        public double ProgressPercentage { get; set; }
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }

    public class RewardSystem
    {
        public int Id { get; set; }
        public string CitizenId { get; set; } = string.Empty;
        public ApplicationUser Citizen { get; set; } = null!;
        
        public int Points { get; set; }
        public string RewardType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        
        public int? RelatedConcernId { get; set; }
        public Concern? RelatedConcern { get; set; }
        
        public DateTime EarnedAt { get; set; } = DateTime.UtcNow;
        public bool IsRedeemed { get; set; } = false;
        public DateTime? RedeemedAt { get; set; }
    }
}