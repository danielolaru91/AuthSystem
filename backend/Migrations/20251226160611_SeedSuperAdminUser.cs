using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class SeedSuperAdminUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var passwordHash = BCrypt.Net.BCrypt.HashPassword("temp123");

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[]
                {
                    "Id", "Email", "PasswordHash", "EmailConfirmed",
                    "EmailConfirmationToken", "EmailConfirmationExpires",
                    "ResetToken", "ResetTokenExpires", "RoleId"
                },
                values: new object[]
                {
                    1,
                    "danielolaru1991@gmail.com",
                    passwordHash,
                    true,
                    null,
                    null,
                    null,
                    null,
                    1 // SuperAdmin
                }
            );

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
