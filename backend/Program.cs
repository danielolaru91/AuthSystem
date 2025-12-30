using backend.Data;
using backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// DB
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
);

// Services
builder.Services.AddControllers();
builder.Services.AddScoped<EmailService>();
builder.Services.AddOpenApi();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularDev", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? Environment.GetEnvironmentVariable("JWT_KEY");
if (string.IsNullOrEmpty(jwtKey))
    throw new Exception("JWT key is missing");

var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = key,

            ValidateIssuer = true,
            ValidIssuer = "backend",

            ValidateAudience = true,
            ValidAudience = "frontend",

            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            // Read JWT from cookie
            OnMessageReceived = context =>
            {
                if (context.Request.Cookies.TryGetValue("auth_token", out var token))
                    context.Token = token;

                return Task.CompletedTask;
            },

            // TokenVersion validation
            OnTokenValidated = async context =>
            {
                var principal = context.Principal;
                if (principal == null)
                {
                    context.Fail("Invalid token");
                    return;
                }

                var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var tokenVersionClaim = principal.FindFirst("tokenVersion")?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(tokenVersionClaim))
                {
                    context.Fail("Missing tokenVersion or userId");
                    return;
                }

                if (!int.TryParse(userIdClaim, out var userId) ||
                    !int.TryParse(tokenVersionClaim, out var tokenVersionFromToken))
                {
                    context.Fail("Invalid tokenVersion or userId format");
                    return;
                }

                var db = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
                var user = await db.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                {
                    context.Fail("User not found");
                    return;
                }

                if (user.TokenVersion != tokenVersionFromToken)
                {
                    context.Fail("Token invalidated");
                    return;
                }
            },

            // Proper fix: return JSON instead of empty 401
            OnChallenge = context =>
            {
                // Prevent default empty 401 response
                context.HandleResponse();

                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";

                var payload = System.Text.Json.JsonSerializer.Serialize(new
                {
                    success = false,
                    error = "SESSION_EXPIRED",
                    message = "Your session has expired. Please re-authenticate."
                });

                return context.Response.WriteAsync(payload);
            }
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Auto-migrate
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// Dev tools
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors("AllowAngularDev");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
