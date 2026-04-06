using Intex.Backend.Data;
using Intex.Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Intex.Backend.Controllers;

[ApiController]
[Route("api/home-visitations")]
[Authorize]
public class HomeVisitationsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public HomeVisitationsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet("resident/{residentId:int}")]
    public async Task<ActionResult<IReadOnlyList<HomeVisitation>>> GetForResident(int residentId)
    {
        var items = await _db.HomeVisitations.AsNoTracking()
            .Where(v => v.ResidentId == residentId)
            .OrderByDescending(v => v.VisitDate)
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<HomeVisitation>> Create([FromBody] HomeVisitation visitation)
    {
        visitation.VisitationId = 0;
        _db.HomeVisitations.Add(visitation);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetForResident), new { residentId = visitation.ResidentId }, visitation);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Update(int id, [FromBody] HomeVisitation updated)
    {
        var existing = await _db.HomeVisitations.FirstOrDefaultAsync(v => v.VisitationId == id);
        if (existing is null) return NotFound();

        updated.VisitationId = id;
        _db.Entry(existing).CurrentValues.SetValues(updated);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Delete(int id)
    {
        var existing = await _db.HomeVisitations.FirstOrDefaultAsync(v => v.VisitationId == id);
        if (existing is null) return NotFound();

        _db.HomeVisitations.Remove(existing);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

