using backend.Data;
using backend.Dtos;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class CompaniesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CompaniesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CompanyDto>>> GetCompanies()
    {
        var companies = await _context.Companies
            .Select(c => new CompanyDto { Id = c.Id, Name = c.Name })
            .ToListAsync();

        return Ok(companies);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CompanyDto>> GetCompany(int id)
    {
        var company = await _context.Companies.FindAsync(id);
        if (company == null) return NotFound();

        return Ok(new CompanyDto { Id = company.Id, Name = company.Name });
    }

    [HttpPost]
    public async Task<ActionResult<CompanyDto>> CreateCompany(CreateCompanyDto dto)
    {
        var company = new Company { Name = dto.Name };

        _context.Companies.Add(company);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCompany), new { id = company.Id },
            new CompanyDto { Id = company.Id, Name = company.Name });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCompany(int id, UpdateCompanyDto dto)
    {
        var company = await _context.Companies.FindAsync(id);
        if (company == null) return NotFound();

        company.Name = dto.Name;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCompany(int id)
    {
        var company = await _context.Companies.FindAsync(id);
        if (company == null) return NotFound();

        _context.Companies.Remove(company);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
