using CitizenConcernAPI.Models;

namespace CitizenConcernAPI.Services
{
    public interface IRewardService
    {
        Task<int> AwardPointsAsync(string citizenId, string rewardType, int points, string description, int? relatedConcernId = null);
        Task<int> GetTotalPointsAsync(string citizenId);
        Task<List<RewardSystem>> GetRewardHistoryAsync(string citizenId, int limit = 10);
        Task<bool> RedeemPointsAsync(string citizenId, int pointsToRedeem);
        Task ProcessConcernSubmissionRewardAsync(Concern concern);
        Task ProcessConcernResolutionRewardAsync(Concern concern, string? officerId = null);
        Task ProcessVotingRewardAsync(string citizenId, int concernId, bool isUpVote);
        Task ProcessCommentRewardAsync(string citizenId, int concernId, bool isOfficial);
    }
}