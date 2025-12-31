using System.Security.Claims;
using System.Text.Json;
using backend.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;

public static class JwtEventsFactory
{
    public static JwtBearerEvents Create() =>
        new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (context.Request.Cookies.TryGetValue("auth_token", out var token))
                    context.Token = token;

                return Task.CompletedTask;
            },

            OnTokenValidated = async context =>
            {
                var principal = context.Principal;
                if (principal == null)
                {
                    context.Fail("Invalid token");
                    return;
                }

                var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var tokenVersion = principal.FindFirst("tokenVersion")?.Value;

                if (!int.TryParse(userId, out var uid) ||
                    !int.TryParse(tokenVersion, out var tokenVersionFromToken))
                {
                    context.Fail("Invalid tokenVersion or userId format");
                    return;
                }

                var db = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
                var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == uid);

                if (user == null || user.TokenVersion != tokenVersionFromToken)
                {
                    context.Fail("Token invalidated");
                }
            },

            OnChallenge = context =>
            {
                context.HandleResponse();
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";

                var payload = JsonSerializer.Serialize(new
                {
                    success = false,
                    error = "SESSION_EXPIRED",
                    message = "Your session has expired. Please re-authenticate."
                });

                return context.Response.WriteAsync(payload);
            }
        };
}
