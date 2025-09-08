using CitizenConcernAPI.Models;

namespace CitizenConcernAPI.Services
{
    public interface ISDGService
    {
        Task<List<int>> CategorizeConcernToSDGsAsync(Concern concern);
        Task UpdateSDGProgressAsync(Concern concern);
        Task<List<SDGMetrics>> GetAllSDGMetricsAsync();
        Task<SDGMetrics?> GetSDGMetricByIdAsync(int id);
        Task RecalculateSDGProgressAsync();
        Task ProcessConcernCreatedAsync(Concern concern);
        Task ProcessConcernResolvedAsync(Concern concern);
        Task<Dictionary<string, List<int>>> GetCategoryToSDGMappingAsync();
    }
}