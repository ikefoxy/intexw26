using System.ComponentModel.DataAnnotations;

namespace Intex.Backend.Models;

public class HomeVisitation
{
    [Key]
    public int VisitationId { get; set; }

    public int ResidentId { get; set; }
    public Resident? Resident { get; set; }

    public DateTime VisitDate { get; set; }

    [Required]
    public string SocialWorker { get; set; } = "";

    [Required]
    public string VisitType { get; set; } = "";

    [Required]
    public string LocationVisited { get; set; } = "";

    [Required]
    public string FamilyMembersPresent { get; set; } = "";

    [Required]
    public string Purpose { get; set; } = "";

    [Required]
    public string Observations { get; set; } = "";

    [Required]
    public string FamilyCooperationLevel { get; set; } = "";

    public bool SafetyConcernsNoted { get; set; }
    public bool FollowUpNeeded { get; set; }
    public string? FollowUpNotes { get; set; }

    [Required]
    public string VisitOutcome { get; set; } = "";
}

