using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CitizenConcernAPI.Services;
using CitizenConcernAPI.Models;

namespace CitizenConcernAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Officer,DepartmentHead,Admin,SuperAdmin")]
    public class SDGController : ControllerBase
    {
        private readonly ISDGService _sdgService;
        private readonly ILogger<SDGController> _logger;

        public SDGController(ISDGService sdgService, ILogger<SDGController> logger)
        {
            _sdgService = sdgService;
            _logger = logger;
        }

        [HttpGet("metrics")]
        public async Task<ActionResult<List<SDGMetrics>>> GetAllMetrics()
        {
            try
            {
                var metrics = await _sdgService.GetAllSDGMetricsAsync();
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving SDG metrics");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("metrics/{id}")]
        public async Task<ActionResult<SDGMetrics>> GetMetricById(int id)
        {
            try
            {
                var metric = await _sdgService.GetSDGMetricByIdAsync(id);
                if (metric == null)
                    return NotFound();

                return Ok(metric);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving SDG metric {SDGId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("recalculate")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> RecalculateProgress()
        {
            try
            {
                await _sdgService.RecalculateSDGProgressAsync();
                return Ok(new { Message = "SDG progress recalculated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recalculating SDG progress");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("mapping")]
        public async Task<ActionResult> GetCategoryMapping()
        {
            try
            {
                var mapping = await _sdgService.GetCategoryToSDGMappingAsync();
                return Ok(mapping);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving category to SDG mapping");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}