using Microsoft.AspNetCore.Identity;

namespace Intex.Backend.Data;

public static class IdentitySeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        await EnsureRoleAsync(roleManager, "Admin");
        await EnsureRoleAsync(roleManager, "Donor");

        await EnsureUserAsync(
            userManager,
            email: "admin@test.com",
            password: "Admin@12345678!",
            role: "Admin"
        );

        await EnsureUserAsync(
            userManager,
            email: "donor@test.com",
            password: "Donor@12345678!",
            role: "Donor"
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
        string role
    )
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true
            };

            var createResult = await userManager.CreateAsync(user, password);
            if (!createResult.Succeeded)
            {
                var msg = string.Join("; ", createResult.Errors.Select(e => $"{e.Code}:{e.Description}"));
                throw new InvalidOperationException($"Failed to seed user {email}. {msg}");
            }
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

