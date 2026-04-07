using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace Intex.Backend.Data;

public static class IdentitySeeder
{
    public static async Task SeedAsync(IServiceProvider services, IConfiguration config)
    {
        var adminPassword = config["Seed:AdminPassword"];
        var donorPassword = config["Seed:DonorPassword"];
        if (string.IsNullOrWhiteSpace(adminPassword) || string.IsNullOrWhiteSpace(donorPassword))
        {
            throw new InvalidOperationException(
                "Seed passwords are required. Configure Seed:AdminPassword and Seed:DonorPassword."
            );
        }

        using var scope = services.CreateScope();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        await EnsureRoleAsync(roleManager, "Admin");
        await EnsureRoleAsync(roleManager, "Donor");

        // 1. Standard Admin
        await EnsureUserAsync(
            userManager,
            email: "admin@test.com",
            password: adminPassword,
            role: "Admin"
        );

        // 2. Standard Donor
        await EnsureUserAsync(
            userManager,
            email: "donor@test.com",
            password: donorPassword,
            role: "Donor"
        );

        // 3. REQUIRED: The MFA Testing Account
        await EnsureUserAsync(
            userManager,
            email: "mfa_admin@test.com",
            password: adminPassword,
            role: "Admin",
            requireMfa: true
        );
    }

    private static async Task EnsureRoleAsync(RoleManager<IdentityRole> roleManager, string role)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole(role));
        }
    }

    private static async Task EnsureUserAsync(
        UserManager<ApplicationUser> userManager,
        string email,
        string password,
        string role,
        bool requireMfa = false
    )
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                TwoFactorEnabled = requireMfa // Set MFA requirement on creation
            };

            var createResult = await userManager.CreateAsync(user, password);
            if (!createResult.Succeeded)
            {
                var msg = string.Join("; ", createResult.Errors.Select(e => $"{e.Code}:{e.Description}"));
                throw new InvalidOperationException($"Failed to seed user {email}. {msg}");
            }
        }
        else if (user.TwoFactorEnabled != requireMfa)
        {
            // Ensure existing users get updated if the seeder changes
            user.TwoFactorEnabled = requireMfa;
            await userManager.UpdateAsync(user);
        }

        if (!await userManager.IsInRoleAsync(user, role))
        {
            var addRoleResult = await userManager.AddToRoleAsync(user, role);
            if (!addRoleResult.Succeeded)
            {
                var msg = string.Join("; ", addRoleResult.Errors.Select(e => $"{e.Code}:{e.Description}"));
                throw new InvalidOperationException($"Failed to assign role {role} to {email}. {msg}");
            }
        }
    }
}