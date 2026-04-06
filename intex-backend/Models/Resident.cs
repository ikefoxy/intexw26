using System.ComponentModel.DataAnnotations;

namespace Intex.Backend.Models;

public class Resident
{
    [Key]
    public int ResidentId { get; set; }

    [Required]
    public string CaseControlNo { get; set; } = "";

    [Required]
    public string InternalCode { get; set; } = "";

    public int SafehouseId { get; set; }
    public Safehouse? Safehouse { get; set; }

    [Required]
    public string CaseStatus { get; set; } = "";

    [Required]
    public string Sex { get; set; } = "";

    public DateTime DateOfBirth { get; set; }

    [Required]
    public string Religion { get; set; } = "";

    [Required]
    public string CaseCategory { get; set; } = "";

    public bool SubCatTrafficked { get; set; }
    public bool SubCatPhysicalAbuse { get; set; }
    public bool SubCatSexualAbuse { get; set; }
    public bool SubCatOsaec { get; set; }
    public bool SubCatChildLabor { get; set; }
    public bool SubCatOrphaned { get; set; }
    public bool SubCatCicl { get; set; }
    public bool SubCatAtRisk { get; set; }
    public bool SubCatStreetChild { get; set; }
    public bool SubCatChildWithHiv { get; set; }

    public bool IsPwd { get; set; }
    public string? PwdType { get; set; }

    public bool HasSpecialNeeds { get; set; }
    public string? SpecialNeedsDiagnosis { get; set; }

    public bool FamilyIs4ps { get; set; }
    public bool FamilySoloParent { get; set; }
    public bool FamilyIndigenous { get; set; }
    public bool FamilyParentPwd { get; set; }
    public bool FamilyInformalSettler { get; set; }

    public DateTime DateOfAdmission { get; set; }

    [Required]
    public string ReferralSource { get; set; } = "";

    [Required]
    public string ReferringAgencyPerson { get; set; } = "";

    [Required]
    public string AssignedSocialWorker { get; set; } = "";

    [Required]
    public string InitialCaseAssessment { get; set; } = "";

    public string? ReintegrationType { get; set; }
    public string? ReintegrationStatus { get; set; }

    [Required]
    public string InitialRiskLevel { get; set; } = "";

    [Required]
    public string CurrentRiskLevel { get; set; } = "";

    public DateTime DateEnrolled { get; set; }
    public DateTime? DateClosed { get; set; }
    public DateTime CreatedAt { get; set; }

    public string? NotesRestricted { get; set; }

    public ICollection<ProcessRecording> ProcessRecordings { get; set; } = new List<ProcessRecording>();
    public ICollection<HomeVisitation> HomeVisitations { get; set; } = new List<HomeVisitation>();
}

