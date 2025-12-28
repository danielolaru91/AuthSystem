using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using backend.Data;
using backend.Models;
using backend.Dtos;
using backend.Services;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        private readonly EmailService _emailService;

        public AuthController(AppDbContext context, IConfiguration config, EmailService emailService)
        {
            _context = context;
            _config = config;
            _emailService = emailService;
        }

        // Helpers
        private string GenerateRefreshToken()
        {
            var bytes = RandomNumberGenerator.GetBytes(64);
            return Base64UrlEncoder.Encode(bytes);
        }

        private string GenerateAccessToken(User user)
        {
            var keyString = _config["Jwt:Key"] ?? Environment.GetEnvironmentVariable("JWT_KEY");
            if (string.IsNullOrEmpty(keyString))
                throw new Exception("JWT key is not set in configuration or environment");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.Name)
            };

            var token = new JwtSecurityToken(
                issuer: "backend",
                audience: "frontend",
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(15), // short-lived access token
                signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private void SetAuthCookies(string accessToken, string refreshToken, DateTime refreshExpires)
        {
            // Access token cookie (short-lived)
            Response.Cookies.Append("auth_token", accessToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = false, // set true in production
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddMinutes(15),
                Path = "/"
            });

            // Refresh token cookie (long-lived)
            Response.Cookies.Append("refresh_token", refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = false, // set true in production
                SameSite = SameSiteMode.Lax,
                Expires = refreshExpires,
                Path = "/"
            });
        }

        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { Success = false, Message = "Email and Password are required" });

            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return Conflict(new { Success = false, Message = "Email already registered" });

            var tokenBytes = RandomNumberGenerator.GetBytes(64);
            var emailToken = Base64UrlEncoder.Encode(tokenBytes);

            var user = new User
            {
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                EmailConfirmed = false,
                EmailConfirmationToken = emailToken,
                EmailConfirmationExpires = DateTime.UtcNow.AddHours(24),
                RoleId = 3 // "User"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var confirmUrl = $"http://localhost:4200/confirm-email?token={emailToken}";

            var subject = "Confirm your email address";
            var html = $@"
                <p>Welcome!</p>
                <p>Please confirm your email by clicking the link below:</p>
                <p><a href=""{confirmUrl}"">Confirm Email</a></p>
                <p>This link expires in 24 hours.</p>
            ";

            await _emailService.SendEmailAsync(user.Email, subject, html);

            return Ok(new { Success = true, Message = "Registration successful. Please check your email to confirm your account." });
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return Unauthorized(new { Success = false, Message = "Invalid email or password" });

            if (!user.EmailConfirmed)
                return Unauthorized(new { Success = false, Message = "Please confirm your email before logging in." });

            // Generate tokens
            var accessToken = GenerateAccessToken(user);
            var refreshToken = GenerateRefreshToken();
            var refreshExpires = DateTime.UtcNow.AddDays(7); // long-lived refresh token

            // Persist refresh token (rotation base)
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpires = refreshExpires;
            await _context.SaveChangesAsync();

            // Set cookies
            SetAuthCookies(accessToken, refreshToken, refreshExpires);

            return Ok(new
            {
                Success = true,
                Role = user.Role.Name,
                UserId = user.Id
            });
        }

        // POST: api/auth/refresh
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            if (!Request.Cookies.TryGetValue("refresh_token", out var refreshToken) || string.IsNullOrEmpty(refreshToken))
                return Unauthorized(new { Success = false, Message = "No refresh token" });

            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u =>
                    u.RefreshToken == refreshToken &&
                    u.RefreshTokenExpires > DateTime.UtcNow);

            if (user == null)
                return Unauthorized(new { Success = false, Message = "Invalid or expired refresh token" });

            // Rotate refresh token
            var newRefreshToken = GenerateRefreshToken();
            var newRefreshExpires = DateTime.UtcNow.AddDays(7);
            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpires = newRefreshExpires;

            // New access token
            var newAccessToken = GenerateAccessToken(user);

            await _context.SaveChangesAsync();

            SetAuthCookies(newAccessToken, newRefreshToken, newRefreshExpires);

            return Ok(new
            {
                Success = true
            });
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult Me()
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            var role = User.FindFirstValue(ClaimTypes.Role);
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            return Ok(new { authenticated = true, email, role, userId });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            if (User.Identity?.IsAuthenticated == true)
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (int.TryParse(userId, out var id))
                {
                    var user = await _context.Users.FindAsync(id);
                    if (user != null)
                    {
                        user.RefreshToken = null;
                        user.RefreshTokenExpires = null;
                        await _context.SaveChangesAsync();
                    }
                }
            }

            Response.Cookies.Delete("auth_token");
            Response.Cookies.Delete("refresh_token");

            return Ok(new { Success = true });
        }

        // POST: api/auth/request-reset
        [HttpPost("request-reset")]
        public async Task<IActionResult> RequestReset([FromBody] RequestPasswordReset request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
                return Ok(new { Success = true });

            var tokenBytes = RandomNumberGenerator.GetBytes(64);
            var token = Base64UrlEncoder.Encode(tokenBytes);

            user.ResetToken = token;
            user.ResetTokenExpires = DateTime.UtcNow.AddHours(1);

            await _context.SaveChangesAsync();

            var resetUrl = $"http://localhost:4200/reset-password?token={token}";

            var subject = "Reset your password";
            var html = $@"
                <p>Hello,</p>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <p><a href=""{resetUrl}"">Reset Password</a></p>
                <p>If you did not request this, you can safely ignore this email.</p>
            ";

            await _emailService.SendEmailAsync(user.Email, subject, html);

            return Ok(new { Success = true });
        }

        // POST: api/auth/reset-password
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.ResetToken == request.Token &&
                u.ResetTokenExpires > DateTime.UtcNow);

            if (user == null)
                return BadRequest(new { Success = false, Message = "Invalid or expired token" });

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.ResetToken = null;
            user.ResetTokenExpires = null;

            await _context.SaveChangesAsync();

            return Ok(new { Success = true, Message = "Password reset successfully" });
        }

        [HttpPost("confirm-email")]
        public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.EmailConfirmationToken == request.Token &&
                u.EmailConfirmationExpires > DateTime.UtcNow);

            if (user == null)
                return BadRequest(new { Success = false, Message = "Invalid or expired confirmation token" });

            user.EmailConfirmed = true;
            user.EmailConfirmationToken = null;
            user.EmailConfirmationExpires = null;

            await _context.SaveChangesAsync();

            return Ok(new { Success = true, Message = "Email confirmed successfully" });
        }
    }
}
