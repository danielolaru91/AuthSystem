namespace backend.Dtos
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public bool EmailConfirmed { get; set; }
    }
}
