namespace backend.DTOs
{
    public class UpdateUserDto
    {
        public string Email { get; set; } = string.Empty;
        public bool EmailConfirmed { get; set; }
        public int RoleId { get; set; }
    }
}
