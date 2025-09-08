using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CitizenConcernAPI.Services;
using System.Security.Claims;

namespace CitizenConcernAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RewardController : ControllerBase
    {
        private readonly IRewardService _rewardService;
        private readonly ILogger<RewardController> _logger;

        public RewardController(IRewardService rewardService, ILogger<RewardController> logger)
        {
            _rewardService = rewardService;
            _logger = logger;
        }

        [HttpGet("points")]
        public async Task<ActionResult<int>> GetTotalPoints()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                    return BadRequest("User ID not found");

                var totalPoints = await _rewardService.GetTotalPointsAsync(userId);
                return Ok(new { TotalPoints = totalPoints });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving total points");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("history")]
        public async Task<ActionResult> GetRewardHistory([FromQuery] int limit = 10)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                    return BadRequest("User ID not found");

                var history = await _rewardService.GetRewardHistoryAsync(userId, limit);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving reward history");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("redeem")]
        public async Task<IActionResult> RedeemPoints(RedeemPointsRequest request)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                    return BadRequest("User ID not found");

                var success = await _rewardService.RedeemPointsAsync(userId, request.PointsToRedeem);
                if (!success)
                    return BadRequest("Insufficient points or redemption failed");

                return Ok(new { Message = "Points redeemed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error redeeming points");
                return StatusCode(500, "Internal server error");
            }
        }
    }

    public class RedeemPointsRequest
    {
        public int PointsToRedeem { get; set; }
    }
}