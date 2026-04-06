namespace Intex.Backend.Dtos;

public record LoginRequest(string Email, string Password);

public record LoginResponse(string Token);

public record RegisterRequest(string Email, string Password, string Role);

public record MeResponse(bool Authenticated, string? Email, IReadOnlyList<string> Roles);

