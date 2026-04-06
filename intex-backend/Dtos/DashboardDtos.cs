namespace Intex.Backend.Dtos;

public record RecentActivityItem(DateTime Timestamp, string Type, string Message);

public record DashboardSummaryResponse(
    int ActiveResidents,
    decimal DonationsThisMonth,
    int UpcomingCaseConferences,
    int AtRiskResidents,
    IReadOnlyList<RecentActivityItem> RecentActivity
);

