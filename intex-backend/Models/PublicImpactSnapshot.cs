using System.ComponentModel.DataAnnotations;

namespace Intex.Backend.Models;

public class PublicImpactSnapshot
{
    [Key]
    public int SnapshotId { get; set; }

    public DateTime SnapshotDate { get; set; }

    [Required]
    public string Headline { get; set; } = "";

    [Required]
    public string SummaryText { get; set; } = "";

    [Required]
    public string MetricPayloadJson { get; set; } = "";

    public bool IsPublished { get; set; }
    public DateTime? PublishedAt { get; set; }
}

