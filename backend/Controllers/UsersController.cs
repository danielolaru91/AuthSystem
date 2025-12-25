using System.Security.Cryptography;
using backend.Data;
using backend.Dtos;
using backend.DTOs;
using backend.Models;
using backend.Services;
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

        public UsersController(AppDbContext context, EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // GET: api/users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    EmailConfirmed = u.EmailConfirmed
                })
                .ToListAsync();

            return Ok(users);
        }

        // GET: api/users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return NotFound();

            return Ok(new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                EmailConfirmed = user.EmailConfirmed
            });
        }

        // POST: api/users
        [HttpPost]
        public async Task<ActionResult<UserDto>> CreateUser(CreateUserDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                return Conflict(new { Success = false, Message = "Email already exists" });

            var user = new User
            {
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                EmailConfirmed = dto.EmailConfirmed
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

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                EmailConfirmed = user.EmailConfirmed
            });
        }

        // PUT: api/users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UpdateUserDto dto)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return NotFound();

            user.Email = dto.Email;
            user.EmailConfirmed = dto.EmailConfirmed;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/users/5
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
    }
}
