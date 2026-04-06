using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Intex.Backend.Models;

public class Donation
{
    [Key]
    public int DonationId { get; set; }

    public int SupporterId { get; set; }
    public Supporter? Supporter { get; set; }

    [Required]
    public string DonationType { get; set; } = "";

    public DateTime DonationDate { get; set; }

    [Required]
    public string ChannelSource { get; set; } = "";

    public string? CurrencyCode { get; set; }

    [Precision(18, 2)]
    public decimal? Amount { get; set; }

    [Precision(18, 2)]
    public decimal? EstimatedValue { get; set; }

    [Required]
    public string ImpactUnit { get; set; } = "";

    public bool IsRecurring { get; set; }
    public string? CampaignName { get; set; }

    [Required]
    public string Notes { get; set; } = "";
}

