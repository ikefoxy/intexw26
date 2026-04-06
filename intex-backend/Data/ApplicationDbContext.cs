using Intex.Backend.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Intex.Backend.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Safehouse> Safehouses => Set<Safehouse>();
    public DbSet<Resident> Residents => Set<Resident>();
    public DbSet<Supporter> Supporters => Set<Supporter>();
    public DbSet<Donation> Donations => Set<Donation>();
    public DbSet<ProcessRecording> ProcessRecordings => Set<ProcessRecording>();
    public DbSet<HomeVisitation> HomeVisitations => Set<HomeVisitation>();
    public DbSet<SocialMediaPost> SocialMediaPosts => Set<SocialMediaPost>();
    public DbSet<PublicImpactSnapshot> PublicImpactSnapshots => Set<PublicImpactSnapshot>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Resident>()
            .HasOne(r => r.Safehouse)
            .WithMany(s => s.Residents)
            .HasForeignKey(r => r.SafehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Donation>()
            .HasOne(d => d.Supporter)
            .WithMany(s => s.Donations)
            .HasForeignKey(d => d.SupporterId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<ProcessRecording>()
            .HasOne(p => p.Resident)
            .WithMany(r => r.ProcessRecordings)
            .HasForeignKey(p => p.ResidentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<HomeVisitation>()
            .HasOne(v => v.Resident)
            .WithMany(r => r.HomeVisitations)
            .HasForeignKey(v => v.ResidentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

