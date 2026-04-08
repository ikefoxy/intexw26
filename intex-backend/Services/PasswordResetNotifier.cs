using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace Intex.Backend.Services;

public sealed class PasswordResetNotifier(
    IConfiguration configuration,
    IWebHostEnvironment environment,
    ILogger<PasswordResetNotifier> logger) : IPasswordResetNotifier
{
    public async Task SendResetLinkAsync(string toEmail, string resetLink, CancellationToken cancellationToken = default)
    {
        var host = configuration["Smtp:Host"];
        if (string.IsNullOrWhiteSpace(host))
        {
            if (environment.IsDevelopment())
            {
                logger.LogWarning(
                    "SMTP not configured. Password reset link for {Email} (dev only, copy from logs): {ResetLink}",
                    toEmail,
                    resetLink);
            }
            else
            {
                logger.LogError(
                    "SMTP host is not configured; cannot send password reset email to {Email}.",
                    toEmail);
            }

            return;
        }

        var port = configuration.GetValue("Smtp:Port", 587);
        var user = configuration["Smtp:User"];
        var password = configuration["Smtp:Password"];
        var from = configuration["Smtp:From"];
        if (string.IsNullOrWhiteSpace(from))
            from = user;
        if (string.IsNullOrWhiteSpace(from))
        {
            logger.LogError("Smtp:From (or Smtp:User) is required to send email.");
            return;
        }

        var message = new MimeMessage();
        message.From.Add(MailboxAddress.Parse(from));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = "Reset your password";
        message.Body = new TextPart("plain")
        {
            Text =
                "You requested a password reset. Open this link to choose a new password (it expires after a short time):\n\n"
                + resetLink
                + "\n\nIf you did not request this, you can ignore this message.",
        };

        using var client = new SmtpClient();
        var socketOptions = port == 465
            ? SecureSocketOptions.SslOnConnect
            : SecureSocketOptions.StartTls;

        await client.ConnectAsync(host, port, socketOptions, cancellationToken);
        if (!string.IsNullOrEmpty(user))
            await client.AuthenticateAsync(user, password, cancellationToken);
        await client.SendAsync(message, cancellationToken);
        await client.DisconnectAsync(true, cancellationToken);
        logger.LogInformation("Password reset email sent to {Email}.", toEmail);
    }
}
