using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
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
        private readonly IConfiguration _config;

        public UsersController(AppDbContext context, EmailService emailService, IConfiguration config)
        {
            _context = context;
            _emailService = emailService;
            _config = config;
        }

        // GET: api/users
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

            user.Email = dto.Email;
            user.EmailConfirmed = dto.EmailConfirmed;
            user.RoleId = dto.RoleId;

            await _context.SaveChangesAsync();

            await _context.Entry(user).Reference(u => u.Role).LoadAsync();

            if (Request.Cookies.TryGetValue("auth_token", out var token))
            {
                var handler = new JwtSecurityTokenHandler();
                var jwt = handler.ReadJwtToken(token);
                var currentUserId = jwt.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;

                if (currentUserId == user.Id.ToString())
                {
                    var keyString = _config["Jwt:Key"];
                    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));

                    var claims = new[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                        new Claim(ClaimTypes.Email, user.Email),
                        new Claim(ClaimTypes.Role, user.Role.Name)
                    };

                    var newToken = new JwtSecurityToken(
                        issuer: "backend",
                        audience: "frontend",
                        claims: claims,
                        expires: DateTime.UtcNow.AddHours(2),
                        signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
                    );

                    var jwtString = handler.WriteToken(newToken);

                    Response.Cookies.Append("auth_token", jwtString, new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = false,
                        SameSite = SameSiteMode.Lax,
                        Expires = DateTimeOffset.UtcNow.AddHours(2),
                        Path = "/"
                    });

                    return Ok(new { updatedOwnAccount = true, role = user.Role.Name });
                }
            }

            return Ok(new { updatedOwnAccount = false });
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
