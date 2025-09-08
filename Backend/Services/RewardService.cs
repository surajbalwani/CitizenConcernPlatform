using CitizenConcernAPI.Data;
using CitizenConcernAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace CitizenConcernAPI.Services
{
    public class RewardService : IRewardService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<RewardService> _logger;

        private readonly Dictionary<string, int> _rewardPoints = new()
        {
            { "ConcernSubmission", 10 },
            { "ConcernResolved", 50 },
            { "ResolutionProvided", 25 },
            { "UpVote", 2 },
            { "DownVote", 1 },
            { "Comment", 3 },
            { "OfficialComment", 5 },
            { "HighPriorityConcern", 15 },
            { "FirstConcern", 20 },
            { "ActiveParticipation", 5 }
        };

        public RewardService(ApplicationDbContext context, ILogger<RewardService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<int> AwardPointsAsync(string citizenId, string rewardType, int points, string description, int? relatedConcernId = null)
        {
            try
            {
                if (string.IsNullOrEmpty(citizenId))
                {
                    _logger.LogWarning("Cannot award points: citizenId is null or empty");
                    return 0;
                }

                var reward = new RewardSystem
                {
                    CitizenId = citizenId,
                    Points = points,
                    RewardType = rewardType,
                    Description = description,
                    RelatedConcernId = relatedConcernId,
                    EarnedAt = DateTime.UtcNow,
                    IsRedeemed = false
                };

                _context.RewardSystem.Add(reward);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Awarded {Points} points to citizen {CitizenId} for {RewardType}", points, citizenId, rewardType);
                return reward.Id;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error awarding points to citizen {CitizenId}", citizenId);
                return 0;
            }
        }

        public async Task<int> GetTotalPointsAsync(string citizenId)
        {
            try
            {
                return await _context.RewardSystem
                    .Where(r => r.CitizenId == citizenId && !r.IsRedeemed)
                    .SumAsync(r => r.Points);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting total points for citizen {CitizenId}", citizenId);
                return 0;
            }
        }

        public async Task<List<RewardSystem>> GetRewardHistoryAsync(string citizenId, int limit = 10)
        {
            try
            {
                return await _context.RewardSystem
                    .Where(r => r.CitizenId == citizenId)
                    .OrderByDescending(r => r.EarnedAt)
                    .Take(limit)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reward history for citizen {CitizenId}", citizenId);
                return new List<RewardSystem>();
            }
        }

        public async Task<bool> RedeemPointsAsync(string citizenId, int pointsToRedeem)
        {
            try
            {
                var availablePoints = await GetTotalPointsAsync(citizenId);
                if (availablePoints < pointsToRedeem)
                {
                    _logger.LogWarning("Insufficient points for redemption. Citizen {CitizenId} has {Available} but needs {Required}", 
                        citizenId, availablePoints, pointsToRedeem);
                    return false;
                }

                var redemptionRecord = new RewardSystem
                {
                    CitizenId = citizenId,
                    Points = -pointsToRedeem,
                    RewardType = "Redemption",
                    Description = $"Redeemed {pointsToRedeem} points",
                    EarnedAt = DateTime.UtcNow,
                    IsRedeemed = true,
                    RedeemedAt = DateTime.UtcNow
                };

                _context.RewardSystem.Add(redemptionRecord);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Citizen {CitizenId} redeemed {Points} points", citizenId, pointsToRedeem);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error redeeming points for citizen {CitizenId}", citizenId);
                return false;
            }
        }

        public async Task ProcessConcernSubmissionRewardAsync(Concern concern)
        {
            try
            {
                var basePoints = _rewardPoints["ConcernSubmission"];
                var description = $"Submitted concern: {concern.Title}";

                // Bonus for first-time users
                var isFirstConcern = !await _context.Concerns
                    .AnyAsync(c => c.CitizenId == concern.CitizenId && c.Id != concern.Id);

                if (isFirstConcern)
                {
                    await AwardPointsAsync(concern.CitizenId, "FirstConcern", _rewardPoints["FirstConcern"], 
                        "First concern submission bonus", concern.Id);
                }

                // Bonus for high-priority concerns
                if (concern.Priority >= 4)
                {
                    basePoints += _rewardPoints["HighPriorityConcern"];
                    description += " (High Priority)";
                }

                await AwardPointsAsync(concern.CitizenId, "ConcernSubmission", basePoints, description, concern.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing concern submission reward for concern {ConcernId}", concern.Id);
            }
        }

        public async Task ProcessConcernResolutionRewardAsync(Concern concern, string? officerId = null)
        {
            try
            {
                // Reward citizen for resolved concern
                var citizenReward = _rewardPoints["ConcernResolved"];
                var timeTaken = concern.ResolvedAt.HasValue ? 
                    (concern.ResolvedAt.Value - concern.CreatedAt).TotalDays : 0;

                // Bonus for quick resolution (within 7 days)
                if (timeTaken <= 7 && timeTaken > 0)
                {
                    citizenReward += 10;
                }

                await AwardPointsAsync(concern.CitizenId, "ConcernResolved", citizenReward, 
                    $"Concern resolved: {concern.Title}", concern.Id);

                // Reward officer for providing resolution
                if (!string.IsNullOrEmpty(officerId))
                {
                    var officerReward = _rewardPoints["ResolutionProvided"];
                    
                    // Bonus for quick resolution
                    if (timeTaken <= 7 && timeTaken > 0)
                    {
                        officerReward += 5;
                    }

                    await AwardPointsAsync(officerId, "ResolutionProvided", officerReward, 
                        $"Resolved concern: {concern.Title}", concern.Id);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing concern resolution reward for concern {ConcernId}", concern.Id);
            }
        }

        public async Task ProcessVotingRewardAsync(string citizenId, int concernId, bool isUpVote)
        {
            try
            {
                // Check if user has already voted on this concern
                var existingVoteReward = await _context.RewardSystem
                    .AnyAsync(r => r.CitizenId == citizenId && 
                                  r.RelatedConcernId == concernId && 
                                  (r.RewardType == "UpVote" || r.RewardType == "DownVote"));

                if (existingVoteReward)
                {
                    _logger.LogInformation("Citizen {CitizenId} has already been rewarded for voting on concern {ConcernId}", 
                        citizenId, concernId);
                    return;
                }

                var rewardType = isUpVote ? "UpVote" : "DownVote";
                var points = _rewardPoints[rewardType];
                var description = $"{(isUpVote ? "Upvoted" : "Downvoted")} concern";

                await AwardPointsAsync(citizenId, rewardType, points, description, concernId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing voting reward for citizen {CitizenId} on concern {ConcernId}", 
                    citizenId, concernId);
            }
        }

        public async Task ProcessCommentRewardAsync(string citizenId, int concernId, bool isOfficial)
        {
            try
            {
                var rewardType = isOfficial ? "OfficialComment" : "Comment";
                var points = _rewardPoints[rewardType];
                var description = $"Added {(isOfficial ? "official " : "")}comment on concern";

                // Limit comment rewards to prevent spam (max 3 comment rewards per concern per user)
                var existingCommentRewards = await _context.RewardSystem
                    .CountAsync(r => r.CitizenId == citizenId && 
                                    r.RelatedConcernId == concernId && 
                                    (r.RewardType == "Comment" || r.RewardType == "OfficialComment"));

                if (existingCommentRewards >= 3)
                {
                    _logger.LogInformation("Comment reward limit reached for citizen {CitizenId} on concern {ConcernId}", 
                        citizenId, concernId);
                    return;
                }

                await AwardPointsAsync(citizenId, rewardType, points, description, concernId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing comment reward for citizen {CitizenId} on concern {ConcernId}", 
                    citizenId, concernId);
            }
        }
    }
}