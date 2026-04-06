using System.ComponentModel.DataAnnotations;

namespace Intex.Backend.Models;

public class Supporter
{
    [Key]
    public int SupporterId { get; set; }

    [Required]
    public string SupporterType { get; set; } = "";

    [Required]
    public string DisplayName { get; set; } = "";

    public string? OrganizationName { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }

    [Required]
    public string RelationshipType { get; set; } = "";

    [Required]
    public string Region { get; set; } = "";

    [Required]
    public string Country { get; set; } = "";

    [Required]
    [EmailAddress]
    public string Email { get; set; } = "";

    [Required]
    public string Phone { get; set; } = "";

    [Required]
    public string Status { get; set; } = "";

    public DateTime? FirstDonationDate { get; set; }

    [Required]
    public string AcquisitionChannel { get; set; } = "";

    public DateTime CreatedAt { get; set; }

    public ICollection<Donation> Donations { get; set; } = new List<Donation>();
}

