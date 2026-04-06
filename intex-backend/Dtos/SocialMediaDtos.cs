namespace Intex.Backend.Dtos;

public record AvgEngagementRateByPlatformItem(string Platform, decimal AvgEngagementRate);

public record SocialMediaAnalyticsResponse(
    string? TopPlatformByEngagement,
    string? TopPostTypeByDonations,
    IReadOnlyList<AvgEngagementRateByPlatformItem> AvgEngagementRateByPlatform,
    int? BestPostingHour,
    string? BestDayOfWeek
);

