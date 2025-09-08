using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using CitizenConcernAPI.Models;
using System.Text.Json;

namespace CitizenConcernAPI.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Concern> Concerns { get; set; }
        public DbSet<ConcernUpdate> ConcernUpdates { get; set; }
        public DbSet<ConcernComment> ConcernComments { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<UserNotification> UserNotifications { get; set; }
        public DbSet<AnalyticsData> AnalyticsData { get; set; }
        public DbSet<SDGMetrics> SDGMetrics { get; set; }
        public DbSet<RewardSystem> RewardSystem { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Concern>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).IsRequired().HasMaxLength(2000);
                entity.Property(e => e.Location).HasColumnType("geography");
                
                entity.Property(e => e.Tags)
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                        v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>());
                
                entity.Property(e => e.AttachmentUrls)
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                        v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>());

                entity.HasOne<ApplicationUser>()
                    .WithMany(u => u.SubmittedConcerns)
                    .HasForeignKey(c => c.CitizenId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(c => c.Updates)
                    .WithOne(u => u.Concern)
                    .HasForeignKey(u => u.ConcernId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(c => c.Comments)
                    .WithOne(c => c.Concern)
                    .HasForeignKey(c => c.ConcernId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<Department>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                
                entity.Property(e => e.ResponsibleCategories)
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                        v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>());

                entity.HasOne(d => d.HeadOfficer)
                    .WithMany()
                    .HasForeignKey(d => d.HeadOfficerId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            builder.Entity<UserNotification>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.HasOne(n => n.User)
                    .WithMany()
                    .HasForeignKey(n => n.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(n => n.RelatedConcern)
                    .WithMany()
                    .HasForeignKey(n => n.RelatedConcernId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<RewardSystem>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.HasOne(r => r.Citizen)
                    .WithMany()
                    .HasForeignKey(r => r.CitizenId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(r => r.RelatedConcern)
                    .WithMany()
                    .HasForeignKey(r => r.RelatedConcernId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            SeedData(builder);
        }

        private void SeedData(ModelBuilder builder)
        {
            builder.Entity<Department>().HasData(
                new Department { Id = 1, Name = "Public Works", Description = "Roads, Infrastructure, Water Supply", ResponsibleCategories = new List<string> { "Roads", "Water", "Electricity", "Infrastructure" } },
                new Department { Id = 2, Name = "Health Department", Description = "Public Health, Sanitation, Medical Services", ResponsibleCategories = new List<string> { "Health", "Sanitation", "Medical" } },
                new Department { Id = 3, Name = "Environment", Description = "Waste Management, Pollution, Green Spaces", ResponsibleCategories = new List<string> { "Environment", "Waste", "Pollution" } },
                new Department { Id = 4, Name = "Transport", Description = "Public Transport, Traffic Management", ResponsibleCategories = new List<string> { "Transport", "Traffic", "Parking" } },
                new Department { Id = 5, Name = "Education", Description = "Schools, Educational Infrastructure", ResponsibleCategories = new List<string> { "Education", "Schools" } }
            );

            builder.Entity<SDGMetrics>().HasData(
                new SDGMetrics { Id = 1, SDGGoal = "SDG 3: Good Health and Well-being", SDGTarget = "3.3 End epidemics and combat diseases", RelatedConcerns = 0, ResolvedConcerns = 0, ProgressPercentage = 0 },
                new SDGMetrics { Id = 2, SDGGoal = "SDG 6: Clean Water and Sanitation", SDGTarget = "6.1 Safe and affordable drinking water", RelatedConcerns = 0, ResolvedConcerns = 0, ProgressPercentage = 0 },
                new SDGMetrics { Id = 3, SDGGoal = "SDG 11: Sustainable Cities and Communities", SDGTarget = "11.1 Safe and affordable housing", RelatedConcerns = 0, ResolvedConcerns = 0, ProgressPercentage = 0 },
                new SDGMetrics { Id = 4, SDGGoal = "SDG 13: Climate Action", SDGTarget = "13.1 Climate resilience and adaptation", RelatedConcerns = 0, ResolvedConcerns = 0, ProgressPercentage = 0 }
            );
        }
    }
}