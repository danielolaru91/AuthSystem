using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using backend.Data;
using backend.Dtos;
using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;
        private readonly IConfiguration _config;

        public UsersController(AppDbContext context, EmailService emailService, IConfiguration config)
        {
            _context = context;
            _emailService = emailService;
            _config = config;
        }

        // GET: api/users
        
        [Authorize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            var users = await _context.Users
                .Include(u => u.Role)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    EmailConfirmed = u.EmailConfirmed,
                    RoleId = u.RoleId
                })
                .ToListAsync();

            return Ok(users);
        }

        // GET: api/users/5
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound();

            return Ok(new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                EmailConfirmed = user.EmailConfirmed,
                RoleId = user.RoleId
            });
        }

        // POST: api/users
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<UserDto>> CreateUser(CreateUserDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                return Conflict(new { Success = false, Message = "Email already exists" });

            // Validate role
            if (!await _context.Roles.AnyAsync(r => r.Id == dto.RoleId))
                return BadRequest(new { Success = false, Message = "Invalid role" });

            var user = new User
            {
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                EmailConfirmed = dto.EmailConfirmed,
                RoleId = dto.RoleId
            };

            // If NOT confirmed → generate token + send email
            if (!dto.EmailConfirmed)
            {
                var tokenBytes = RandomNumberGenerator.GetBytes(64);
                var emailToken = Base64UrlEncoder.Encode(tokenBytes);

                user.EmailConfirmationToken = emailToken;
                user.EmailConfirmationExpires = DateTime.UtcNow.AddHours(24);

                var confirmUrl = $"http://localhost:4200/confirm-email?token={emailToken}";

                var subject = "Confirm your email address";
                var html = $@"
                    <p>Hello,</p>
                    <p>Your account has been created by an administrator.</p>
                    <p>Please confirm your email by clicking the link below:</p>
                    <p><a href=""{confirmUrl}"">Confirm Email</a></p>
                    <p>This link expires in 24 hours.</p>
                ";

                await _emailService.SendEmailAsync(user.Email, subject, html);
            }

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            await _context.Entry(user).Reference(u => u.Role).LoadAsync();

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                EmailConfirmed = user.EmailConfirmed,
                RoleId = user.Role.Id
            });
        }

        // PUT: api/users/5
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UpdateUserDto dto)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound();

            if (!await _context.Roles.AnyAsync(r => r.Id == dto.RoleId))
                return BadRequest(new { Success = false, Message = "Invalid role" });

            // Update fields
            user.Email = dto.Email;
            user.EmailConfirmed = dto.EmailConfirmed;
            user.RoleId = dto.RoleId;

            await _context.SaveChangesAsync();

            // If the logged-in user updated their own account → invalidate refresh token
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (currentUserId == user.Id.ToString())
            {
                user.RefreshToken = null;
                user.RefreshTokenExpires = null;
                await _context.SaveChangesAsync();

                // Remove cookies so frontend triggers /refresh automatically
                Response.Cookies.Delete("auth_token");
                Response.Cookies.Delete("refresh_token");

                return Ok(new 
                { 
                    updatedOwnAccount = true,
                    message = "Your account was updated. Please re-authenticate."
                });
            }

            return Ok(new { updatedOwnAccount = false });
        }


        // DELETE: api/users/5
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize]
        [HttpPost("bulk-delete")]
        public async Task<IActionResult> BulkDelete([FromBody] List<int> ids)
        {
            if (ids == null || ids.Count == 0)
                return BadRequest("No IDs provided.");

            var users = await _context.Users
                .Where(c => ids.Contains(c.Id))
                .ToListAsync();

            if (users.Count == 0)
                return NotFound("No matching users found.");

            _context.Users.RemoveRange(users);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
