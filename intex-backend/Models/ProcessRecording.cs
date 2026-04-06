using System.ComponentModel.DataAnnotations;

namespace Intex.Backend.Models;

public class ProcessRecording
{
    [Key]
    public int RecordingId { get; set; }

    public int ResidentId { get; set; }
    public Resident? Resident { get; set; }

    public DateTime SessionDate { get; set; }

    [Required]
    public string SocialWorker { get; set; } = "";

    [Required]
    public string SessionType { get; set; } = "";

    public int SessionDurationMinutes { get; set; }

    [Required]
    public string EmotionalStateObserved { get; set; } = "";

    [Required]
    public string EmotionalStateEnd { get; set; } = "";

    [Required]
    public string SessionNarrative { get; set; } = "";

    [Required]
    public string InterventionsApplied { get; set; } = "";

    [Required]
    public string FollowUpActions { get; set; } = "";

    public bool ProgressNoted { get; set; }
    public bool ConcernsFlagged { get; set; }
    public bool ReferralMade { get; set; }
}

