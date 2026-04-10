using System.Text.Json;
using Intex.Backend.Data;
using Intex.Backend.Dtos;
using Intex.Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Intex.Backend.Controllers;

[ApiController]
[Route("api/residents")]
[Authorize(Roles = "Admin")]
public class ResidentsController : ControllerBase
{
    private const string ResidentRecommendationsFileName = "resident_recommendations.json";

    private readonly ApplicationDbContext _db;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<ResidentsController> _logger;

    public ResidentsController(
        ApplicationDbContext db,
        IWebHostEnvironment env,
        ILogger<ResidentsController> logger)
    {
        _db = db;
        _env = env;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<Resident>>> GetResidents(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] string? caseStatus = null,
        [FromQuery] int? safehouseId = null,
        [FromQuery] string? caseCategory = null,
        [FromQuery] string? riskLevel = null,
        [FromQuery] string? assignedSocialWorker = null,
        [FromQuery] string? search = null
    )
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 100 ? 25 : pageSize;

        var q = _db.Residents.AsNoTracking().Include(r => r.Safehouse).AsQueryable();

        if (!string.IsNullOrWhiteSpace(caseStatus))
        {
            var st = caseStatus.Trim();
            q = q.Where(r => r.CaseStatus == st);
        }

        if (safehouseId.HasValue)
            q = q.Where(r => r.SafehouseId == safehouseId.Value);

        if (!string.IsNullOrWhiteSpace(caseCategory))
        {
            var cat = caseCategory.Trim();
            q = q.Where(r => r.CaseCategory == cat);
        }

        if (!string.IsNullOrWhiteSpace(riskLevel))
            q = q.Where(r => r.CurrentRiskLevel == riskLevel);

        if (!string.IsNullOrWhiteSpace(assignedSocialWorker))
        {
            var sw = assignedSocialWorker.Trim();
            q = q.Where(r => r.AssignedSocialWorker == sw);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            q = q.Where(r =>
                r.CaseControlNo.Contains(s) ||
                r.InternalCode.Contains(s));
        }

        var total = await q.CountAsync();
        var items = await q.OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new PagedResult<Resident>(items, page, pageSize, total));
    }

    /// <summary>All distinct assigned social worker names (trimmed), from every resident record.</summary>
    [HttpGet("social-workers")]
    public async Task<ActionResult<List<string>>> GetDistinctSocialWorkers()
    {
        var raw = await _db.Residents.AsNoTracking()
            .Select(r => r.AssignedSocialWorker)
            .ToListAsync();

        var names = raw
            .Select(s => s?.Trim() ?? "")
            .Where(s => s.Length > 0)
            .GroupBy(s => s, StringComparer.OrdinalIgnoreCase)
            .Select(g => g.OrderBy(x => x, StringComparer.Ordinal).First())
            .OrderBy(s => s, StringComparer.OrdinalIgnoreCase)
            .ToList();

        return Ok(names);
    }

    private async Task<List<string>> LoadDistinctCaseCategoriesAsync()
    {
        var raw = await _db.Residents.AsNoTracking()
            .Select(r => r.CaseCategory)
            .ToListAsync();

        return raw
            .Select(s => s?.Trim() ?? "")
            .Where(s => s.Length > 0)
            .GroupBy(s => s, StringComparer.OrdinalIgnoreCase)
            .Select(g => g.OrderBy(x => x, StringComparer.Ordinal).First())
            .OrderBy(s => s, StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    /// <summary>All distinct case categories (trimmed), from every resident record.</summary>
    [HttpGet("case-categories")]
    public async Task<ActionResult<List<string>>> GetDistinctCaseCategories() =>
        Ok(await LoadDistinctCaseCategoriesAsync());

    /// <summary>Alias for clients/proxies where the longer route misbehaves.</summary>
    [HttpGet("categories")]
    public async Task<ActionResult<List<string>>> GetDistinctCaseCategoriesAlias() =>
        Ok(await LoadDistinctCaseCategoriesAsync());

    /// <summary>All distinct case statuses (trimmed), from every resident record.</summary>
    [HttpGet("case-statuses")]
    public async Task<ActionResult<List<string>>> GetDistinctCaseStatuses()
    {
        var raw = await _db.Residents.AsNoTracking()
            .Select(r => r.CaseStatus)
            .ToListAsync();

        var statuses = raw
            .Select(s => s?.Trim() ?? "")
            .Where(s => s.Length > 0)
            .GroupBy(s => s, StringComparer.OrdinalIgnoreCase)
            .Select(g => g.OrderBy(x => x, StringComparer.Ordinal).First())
            .OrderBy(s => s, StringComparer.OrdinalIgnoreCase)
            .ToList();

        return Ok(statuses);
    }

    /// <summary>Next internal code after the highest existing <c>LS-####</c> style value (default <c>LS-0001</c> if none).</summary>
    [HttpGet("next-internal-code")]
    public async Task<ActionResult<object>> GetNextInternalCode()
    {
        const string prefix = "LS-";
        const int minDigits = 4;

        var codes = await _db.Residents.AsNoTracking()
            .Select(r => r.InternalCode)
            .ToListAsync();

        var maxNum = 0;
        var maxWidth = minDigits;

        foreach (var raw in codes)
        {
            if (string.IsNullOrWhiteSpace(raw)) continue;
            var code = raw.Trim();
            if (!code.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)) continue;

            var suffix = code[prefix.Length..];
            if (suffix.Length == 0 || !suffix.All(char.IsDigit)) continue;
            if (!int.TryParse(suffix, System.Globalization.NumberStyles.None, System.Globalization.CultureInfo.InvariantCulture, out var n))
                continue;

            maxNum = Math.Max(maxNum, n);
            maxWidth = Math.Max(maxWidth, suffix.Length);
        }

        var next = maxNum + 1;
        var digitCount = Math.Max(maxWidth, next.ToString(System.Globalization.CultureInfo.InvariantCulture).Length);
        var padded = next.ToString(System.Globalization.CultureInfo.InvariantCulture).PadLeft(digitCount, '0');
        return Ok(new { internalCode = $"{prefix}{padded}" });
    }

    /// <summary>Next case control number in <c>C0000</c> form: letter C plus four digits, one higher than the largest existing match (starts at <c>C0001</c>).</summary>
    [HttpGet("suggested-case-control-no")]
    public async Task<ActionResult<object>> GetSuggestedCaseControlNo(CancellationToken ct)
    {
        const int maxSuffix = 9999;

        var codes = await _db.Residents.AsNoTracking()
            .Select(r => r.CaseControlNo)
            .ToListAsync(ct);

        var maxNum = 0;
        var foundAny = false;
        foreach (var raw in codes)
        {
            if (string.IsNullOrWhiteSpace(raw)) continue;
            var code = raw.Trim();
            if (code.Length != 5) continue;
            if (!code.StartsWith('C') && !code.StartsWith('c')) continue;
            var suffix = code[1..];
            if (suffix.Length != 4 || !suffix.All(char.IsDigit)) continue;
            if (!int.TryParse(suffix, System.Globalization.NumberStyles.None, System.Globalization.CultureInfo.InvariantCulture, out var n))
                continue;
            foundAny = true;
            maxNum = Math.Max(maxNum, n);
        }

        var next = foundAny ? maxNum + 1 : 1;
        if (next > maxSuffix)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                new { message = "Case control numbers are exhausted (C0001–C9999)." });
        }

        var candidate = $"C{next.ToString(System.Globalization.CultureInfo.InvariantCulture).PadLeft(4, '0')}";
        var taken = await _db.Residents.AsNoTracking()
            .AnyAsync(r => r.CaseControlNo == candidate, ct);
        if (!taken)
            return Ok(new { caseControlNo = candidate });

        // Rare: gap / casing duplicate; scan upward for a free C#### slot
        for (var n = next + 1; n <= maxSuffix; n++)
        {
            var alt = $"C{n.ToString(System.Globalization.CultureInfo.InvariantCulture).PadLeft(4, '0')}";
            if (!await _db.Residents.AsNoTracking().AnyAsync(r => r.CaseControlNo == alt, ct))
                return Ok(new { caseControlNo = alt });
        }

        return StatusCode(StatusCodes.Status503ServiceUnavailable,
            new { message = "Could not allocate a unique case control number." });
    }

    /// <summary>Resident row + safehouse only. Use preview/count endpoints for related lists (large payloads were stalling the detail page).</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Resident>> GetResident(int id)
    {
        var resident = await _db.Residents.AsNoTracking()
            .Include(r => r.Safehouse)
            .FirstOrDefaultAsync(r => r.ResidentId == id);

        return resident is null ? NotFound() : Ok(resident);
    }

    [HttpGet("{id:int}/related-counts")]
    public async Task<ActionResult<object>> GetResidentRelatedCounts(int id)
    {
        var exists = await _db.Residents.AsNoTracking().AnyAsync(r => r.ResidentId == id);
        if (!exists) return NotFound();

        var educationRecords = await _db.EducationRecords.AsNoTracking().CountAsync(e => e.ResidentId == id);
        var healthWellbeingRecords = await _db.HealthWellbeingRecords.AsNoTracking().CountAsync(h => h.ResidentId == id);
        var incidentReports = await _db.IncidentReports.AsNoTracking().CountAsync(i => i.ResidentId == id);
        var interventionPlans = await _db.InterventionPlans.AsNoTracking().CountAsync(p => p.ResidentId == id);

        return Ok(new
        {
            educationRecords,
            healthWellbeingRecords,
            incidentReports,
            interventionPlans,
        });
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Resident>> CreateResident([FromBody] Resident resident)
    {
        resident.ResidentId = 0;
        if (resident.CreatedAt == default)
            resident.CreatedAt = DateTime.UtcNow;

        _db.Residents.Add(resident);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetResident), new { id = resident.ResidentId }, resident);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> UpdateResident(int id, [FromBody] Resident updated)
    {
        if (id != updated.ResidentId && updated.ResidentId != 0)
        {
            return BadRequest(new { message = "ResidentId mismatch." });
        }

        var existing = await _db.Residents.FirstOrDefaultAsync(r => r.ResidentId == id);
        if (existing is null) return NotFound();

        updated.ResidentId = id;
        _db.Entry(existing).CurrentValues.SetValues(updated);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteResident(int id, [FromQuery] bool confirm = false)
    {
        if (!confirm)
        {
            return BadRequest(new { message = "Confirmation required. Pass ?confirm=true." });
        }

        var resident = await _db.Residents.FirstOrDefaultAsync(r => r.ResidentId == id);
        if (resident is null) return NotFound();

        _db.Residents.Remove(resident);
        await _db.SaveChangesAsync();
        return NoContent();
    }
    // GET: api/residents/{id}/recommendations
    [HttpGet("{id:int}/recommendations")]
    public async Task<ActionResult> GetRecommendations(int id)
    {
        var resident = await _db.Residents
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.ResidentId == id);
        if (resident is null)
        {
            return NotFound(new { message = "Resident not found." });
        }

        var path = Path.Combine(_env.ContentRootPath, ResidentRecommendationsFileName);
        if (!System.IO.File.Exists(path))
        {
            return Ok(EmptyRecommendation(id, $"Model output file '{ResidentRecommendationsFileName}' was not found."));
        }

        string json;
        try
        {
            json = await System.IO.File.ReadAllTextAsync(path);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not read {File}", ResidentRecommendationsFileName);
            return Ok(EmptyRecommendation(id, $"Could not read '{ResidentRecommendationsFileName}'."));
        }

        if (TryParseRichRecommendations(json, out var richMap))
        {
            var avgRisk = richMap.Values.Average(v => v.RiskScore);
            if (!richMap.TryGetValue(id, out var entry))
            {
                return Ok(EmptyRecommendation(id, "No recommendation for this resident in the model output.", avgRisk));
            }

            return Ok(new
            {
                residentId = id,
                riskScore = entry.RiskScore,
                averageRiskScore = avgRisk,
                recommendedIntervention = entry.RecommendedIntervention,
                confidence = entry.Confidence,
                topDrivers = entry.TopDrivers ?? Array.Empty<string>(),
                incidentRisk = entry.IncidentRisk,
                reviewRequired = entry.ReviewRequired,
                message = (string?)null,
                modelUsed = ResidentRecommendationsFileName,
                peerMatches = Array.Empty<object>(),
                suggestedInterventions = entry.RecommendedIntervention is not null
                    ? new[] { entry.RecommendedIntervention }
                    : Array.Empty<string>(),
            });
        }

        if (TryParseLegacyScores(json, out var legacyScores, out var parseError))
        {
            var avgRisk = legacyScores.Values.Average();
            if (!legacyScores.TryGetValue(id, out var riskScore))
            {
                return Ok(EmptyRecommendation(id, "No risk score for this resident in the model output.", avgRisk));
            }

            return Ok(new
            {
                residentId = id,
                riskScore,
                averageRiskScore = avgRisk,
                recommendedIntervention = (string?)null,
                confidence = (decimal?)null,
                topDrivers = Array.Empty<string>(),
                incidentRisk = (decimal?)null,
                reviewRequired = false,
                message = (string?)null,
                modelUsed = ResidentRecommendationsFileName,
                peerMatches = Array.Empty<object>(),
                suggestedInterventions = Array.Empty<string>(),
            });
        }

        return Ok(EmptyRecommendation(id, parseError));
    }

    private static object EmptyRecommendation(int id, string? message, decimal? avgRisk = null) => new
    {
        residentId = id,
        riskScore = (decimal?)null,
        averageRiskScore = avgRisk,
        recommendedIntervention = (string?)null,
        confidence = (decimal?)null,
        topDrivers = Array.Empty<string>(),
        incidentRisk = (decimal?)null,
        reviewRequired = false,
        message,
        modelUsed = ResidentRecommendationsFileName,
        peerMatches = Array.Empty<object>(),
        suggestedInterventions = Array.Empty<string>(),
    };

    private static bool TryParseRichRecommendations(string json, out Dictionary<int, RecommendationEntry> map)
    {
        map = new Dictionary<int, RecommendationEntry>();
        var opts = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        try
        {
            var parsed = JsonSerializer.Deserialize<Dictionary<string, RecommendationEntry>>(json, opts);
            if (parsed is null || parsed.Count == 0) return false;

            var first = parsed.Values.First();
            if (first.RecommendedIntervention is null && first.TopDrivers is null)
                return false;

            foreach (var kv in parsed)
            {
                if (!int.TryParse(kv.Key, out var rid)) return false;
                map[rid] = kv.Value;
            }

            return map.Count > 0;
        }
        catch (JsonException)
        {
            return false;
        }
    }

    private static bool TryParseLegacyScores(string json, out Dictionary<int, decimal> scores, out string? error)
    {
        scores = new Dictionary<int, decimal>();
        error = null;
        var opts = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        try
        {
            var asStringKeys = JsonSerializer.Deserialize<Dictionary<string, decimal>>(json, opts);
            if (asStringKeys is { Count: > 0 })
            {
                foreach (var kv in asStringKeys)
                {
                    if (!int.TryParse(kv.Key, out var rid))
                    {
                        error = $"Invalid resident id key in JSON: '{kv.Key}'.";
                        scores.Clear();
                        return false;
                    }
                    scores[rid] = kv.Value;
                }
                return true;
            }
        }
        catch (JsonException) { }

        try
        {
            var rows = JsonSerializer.Deserialize<List<LegacyRiskScoreRow>>(json, opts);
            if (rows is { Count: > 0 })
            {
                foreach (var row in rows)
                    scores[row.ResidentId] = row.RiskScore;
                return true;
            }
        }
        catch (JsonException ex)
        {
            error = $"Could not parse '{ResidentRecommendationsFileName}': {ex.Message}";
            return false;
        }

        error = $"Could not parse '{ResidentRecommendationsFileName}'.";
        return false;
    }

    private sealed class RecommendationEntry
    {
        public decimal RiskScore { get; set; }
        public string? RecommendedIntervention { get; set; }
        public decimal Confidence { get; set; }
        public string[]? TopDrivers { get; set; }
        public decimal IncidentRisk { get; set; }
        public bool ReviewRequired { get; set; }
    }

    private sealed class LegacyRiskScoreRow
    {
        public int ResidentId { get; set; }
        public decimal RiskScore { get; set; }
    }
}
