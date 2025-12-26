using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Company> Companies { get; set; }
        public DbSet<Role> Roles => Set<Role>();

        protected override void OnModelCreating(ModelBuilder modelBuilder) { 
            base.OnModelCreating(modelBuilder); 

            modelBuilder.Entity<Role>().HasData( 
                new Role { Id = 1, Name = "SuperAdmin", IsSystem = true }, 
                new Role { Id = 2, Name = "Admin", IsSystem = true }, 
                new Role { Id = 3, Name = "User", IsSystem = true } 
            ); 
        }
    }
}
