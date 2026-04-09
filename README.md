# Intex W26 — Nova Path

Nova Path is a full-stack platform that supports survivor care operations with a public impact site and a secure admin dashboard.

## Live Azure App

- **Website:** https://intexw26-web-21573.azurewebsites.net
- **API:** https://intexw26-api-21573.azurewebsites.net

## Test credentials (seeded for grading)

These accounts are created by the backend seeder when `Seed:*` passwords are configured (see `intex-backend` configuration / Azure app settings).

| Role | Email | Password (example dev seed) | MFA required |
| :--- | :--- | :--- | :--- |
| Admin | admin@test.com | Admin@12345678! | No |
| MFA Admin | mfa_admin@test.com | MfaAdmin@12345678! | Yes |
| Donor | donor@test.com | Donor@12345678! | No |

In deployed environments, passwords come from **Azure environment variables** (`Seed:AdminPassword`, `Seed:DonorPassword`, `Seed:MfaAdminPassword`), not necessarily the values above.

## Multi-factor authentication (MFA) — manual setup

If the in-app MFA setup flow does not appear or a manual fallback is needed, graders may use this secret in Google Authenticator or Authy:

**Manual secret key:** `JBSWY3DPEHPK3PXP`

## Machine learning integration (IS 455)

The project uses models such as Random Forest classification and K-Means clustering to support Nova Path operations. Highlights:

- **Peer matching:** Residents matched using behavioral features and history.
- **Risk assessment:** Flags residents who may need intervention using predictive signals.
- **Documentation:** Methodology and validation are in `ML_Pipeline/IS455_Master_Models.ipynb` and related notebooks in `ML_Pipeline/`.

## Security and infrastructure (IS 414)

- **Secrets:** JWT secrets, database connection strings, and seed passwords are configured via environment variables (e.g. Azure App Settings), not committed to the repo.
- **Headers:** Content-Security-Policy (CSP) and `X-Frame-Options` help reduce common web risks.
- **RBAC:** Donor accounts cannot access admin caseload routes; admin APIs require the Admin role where enforced.

## Run locally

**Prerequisites:** .NET SDK, Node.js/npm.

1. **Backend**
   - `cd intex-backend`
   - `dotnet restore`
   - `dotnet run`
2. **Frontend** (separate terminal)
   - `cd intex-frontend`
   - `npm install`
   - `npm run dev`

Point the frontend at your API (e.g. `VITE_API_BASE_URL` if you use one).

## Deployment

Azure deployment is managed by GitHub Actions. See [AZURE_DEPLOY.md](AZURE_DEPLOY.md).
