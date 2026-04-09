# Requirements Status (IS 401 / 413 / 414 / 455)

Updated: 2026-04-09

## IS 401 (Web App UX/Feature Delivery)
- Dashboard cleanup: Admin dashboard layout simplified and whitespace reduced.
- Donation UX: Donor login now routes to `/donor/dashboard` (not `/impact`), donation form is prominent, and donor nav includes `Make Donation` shortcut.
- Public impact CTA: `Impact` page now includes direct donate action (`Log in to Donate` or `Make a Donation` for donor users).

## IS 413 (Data / Application Integration)
- Database connectivity verified locally and against deployed API.
- Local check: `GET http://localhost:5007/api/public/stats` returns `200` with live DB-backed values.
- Deployed check: `GET https://intexw26-api-21573.azurewebsites.net/api/public/stats` returns `200`.

## IS 414 (Security)
- Password reset flow implemented end-to-end:
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/reset-password`
  - Frontend `/forgot-password` now requests token and resets password.
- Runtime verified via temporary account signup -> forgot-password -> reset-password -> login.
- Existing security controls kept intact: JWT auth, RBAC route/endpoint protection, CSP header, HSTS in non-development.
- Deployment checks:
  - HTTP to HTTPS redirect present for web app (`301`).
  - API responses include `content-security-policy` and `strict-transport-security` headers.

## IS 455 (ML Pipelines)
- Notebook execution verified (headless via `jupyter nbconvert --execute`) after dependency setup.
- Executed successfully:
  - `ML_Pipeline/donor-churn-classifier.ipynb`
  - `ML_Pipeline/resident-risk-predictor.ipynb`
  - `ML_Pipeline/social-media-donation-predictor.ipynb`
  - `ML_Pipeline/IS455_Master_Models.ipynb` (updated to current CSV schema)
- Social media and master notebooks were patched for current dataset schema and numeric feature handling so execution completes.

## Notes
- Frontend and backend both compile successfully:
  - `npm run build` (frontend)
  - `dotnet build` (backend)
- This file documents technical completion status; rubric scoring still depends on TA evaluation, demo quality, and required video/documentation evidence.

## Screenshot Backlog Verification
Verified against screenshot items 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20.

- `8` Caseload inventory page with search/filter: Complete.
  - Evidence: `/admin/residents` route and filters in `intex-frontend/src/pages/admin/CaseloadPage.tsx` (`safehouseId`, `caseStatus`, `caseCategory`, `riskLevel`, `search`).
  - Backend filtering endpoint: `GET /api/residents` in `intex-backend/Controllers/ResidentsController.cs`.
- `9` Process recording form + chronological history view: Complete.
  - Evidence: `intex-frontend/src/pages/admin/ProcessRecordingPage.tsx` supports create + dated history table.
  - API endpoints in `intex-backend/Controllers/ProcessRecordingsController.cs`.
- `10` Home visitation + case conference logging page: Complete.
  - Evidence: `intex-frontend/src/pages/admin/VisitationPage.tsx` includes explicit `Entry Type` selector (`Home Visitation` vs `Case Conference`), form submission, visitation history tab, and case conference tab.
  - API create/read endpoints in `intex-backend/Controllers/HomeVisitationsController.cs`.
- `11` Donors & contributions management page: Complete.
  - Evidence: `/admin/donors` page in `intex-frontend/src/pages/admin/DonorsPage.tsx` and `/admin/donations` in `intex-frontend/src/pages/admin/AdminDonationsPage.tsx`.
  - Supporter/donation APIs in `SupportersController.cs` and `DonationsController.cs`.
- `12` Public impact dashboard (anonymized aggregate): Complete.
  - Evidence: `/impact` page in `intex-frontend/src/pages/ImpactDashboardPage.tsx`.
  - Backend aggregate endpoints: `GET /api/public/impact`, `GET /api/public/stats` in `intex-backend/Controllers/PublicController.cs`.
- `14` HTTPS redirect + CSP + GDPR privacy policy: Complete.
  - Evidence:
    - `UseHttpsRedirection()` and `UseHsts()` in `intex-backend/Program.cs`
    - CSP header middleware in `intex-backend/Program.cs`
    - GDPR privacy page in `intex-frontend/src/pages/PrivacyPage.tsx`
    - Cookie consent component in `intex-frontend/src/components/CookieBanner.tsx`
- `15` RBAC on pages and API endpoints: Complete.
  - Frontend route protection: `intex-frontend/src/App.tsx` via `ProtectedRoute`.
  - Backend authorization attributes present across controllers (Admin/Donor role restrictions) in `intex-backend/Controllers/*.cs`.
- `16` ML Pipeline 1 (donor churn): Complete.
  - Evidence: `ML_Pipeline/donor-churn-classifier.ipynb` plus generated model artifacts (`donor_churn_model.pkl`, prediction CSV/plots).
- `17` ML Pipeline 2 (resident risk/reintegration): Complete.
  - Evidence: `ML_Pipeline/resident-risk-predictor.ipynb` plus generated model artifacts (`resident_risk_model.pkl`, prediction CSV/plots).
- `18` ML Pipeline 3 (social media ROI predictor): Complete.
  - Evidence: `ML_Pipeline/social-media-donation-predictor.ipynb` and executed notebook `ML_Pipeline/social-media-donation-predictor-executed.ipynb` with `social_media_insights.json`.
- `19` Integrate ML outputs into web app: Complete.
  - Evidence:
    - Resident recommendation UI in `intex-frontend/src/pages/admin/ResidentDetailPage.tsx` using `GET /api/residents/{id}/recommendations`.
    - Social analytics dashboard in `intex-frontend/src/pages/admin/SocialMediaPage.tsx` using `GET /api/social-media/ml-dashboard`.
- `20` Lighthouse accessibility >= 90: Verified for deployed public pages.
  - Run date: 2026-04-09, command `npx lighthouse ... --only-categories=accessibility`.
  - Scores:
    - `/` = `93`
    - `/login` = `96`
    - `/impact` = `96`
    - `/privacy` = `96`
  - Note: authenticated admin/donor routes require session context for full automated crawl; public routes are passing >=90.
