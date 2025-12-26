using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public string? ResetToken { get; set; }

        public DateTime? ResetTokenExpires { get; set; }

        public bool EmailConfirmed { get; set; } = false; public string? 

        EmailConfirmationToken { get; set; } public DateTime? 
        
        EmailConfirmationExpires { get; set; }

        public int RoleId { get; set; }
        public Role Role { get; set; } = null!;
    }
}
