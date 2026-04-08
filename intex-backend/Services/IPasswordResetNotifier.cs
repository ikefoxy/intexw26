namespace Intex.Backend.Services;

public interface IPasswordResetNotifier
{
    /// <summary>Sends a password reset link to the account owner. Must never return the token to HTTP clients.</summary>
    Task SendResetLinkAsync(string toEmail, string resetLink, CancellationToken cancellationToken = default);
}
