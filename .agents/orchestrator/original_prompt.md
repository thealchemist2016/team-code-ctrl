## 2026-06-05T05:23:02Z

You are the Project Orchestrator. Your mission is to decompose and orchestrate the implementation of the XS-Records MERN music discography web application as requested in ORIGINAL_REQUEST.md at C:\Users\admin\.gemini\antigravity\scratch\team-code-ctrl\ORIGINAL_REQUEST.md.

Working directory details:
- Please set your own working directory to C:\Users\admin\.gemini\antigravity\scratch\team-code-ctrl\.agents\orchestrator.
- Maintain your plan.md, progress.md, and context.md there.

Your tasks:
1. Initialize your plan.md and progress.md based on the user's requirements (R1 through R5).
2. Spawn and coordinate specialized worker subagents (e.g., explorers, implementers, reviewers, etc.) to perform the implementation, analysis, and testing. Do not write source code directly.
3. Keep progress.md regularly updated with milestones, status, and log entries.
4. When all requirements and acceptance criteria are successfully met and verified, report completion back to the Sentinel.

## 2026-06-05T05:26:27Z

The user has provided a detailed product specification for the music distribution platform. Please incorporate all of these details into the implementation plan and codebase. Here is the full prompt specification:

An improved, fully featured, and visually impressive music distribution web application (XS-Records/distribution platform) to be used by Record Labels, Indie Artists, and Music Right-Holders to submit their releases for distribution, manage balances, profile details, and tickets, with an Admin dashboard to manage users, releases, tickets, and downloads.

Working directory: C:\Users\admin\.gemini\antigravity\scratch\team-code-ctrl
Integrity mode: development

## Requirements

### R1. Home Page
- **Header/Menu:** Logo, Login, About Us, Contact Us.
- **Body:** Logo, company slogan, Blog posts overview, Login button, and a prominent "GET STARTED" button.
- **Footer:** Logo, links to Terms of Service, and Privacy Policy (present on all pages).

### R2. Authentication (Sign-Up / Log-In)
- **Sign-Up Form:** Gather name, email, username, password. Include a mandatory checkbox to agree to Terms of Service.
- **Log-In Form:** Secure login using JWT authentication. Maintain session token in cookies or local storage.
- **Access Control:** Protect dashboard views so only authenticated users/admins can access them.

### R3. User Dashboard
- **Header:** Logo, notifications icon, Balance badge, Logout, About Us, and Contact Us links.
- **Profile Page:** Full Name (non-editable), Email (non-editable), uploaded tax documents, editable Address, and editable Bank or PayPal info.
- **Submit a New Release:** Form to fill out release metadata (title, artist, type: album/single, genre, release date) and complete with file uploads (cover art image and audio tracks).
- **Release Tracking & Counts:** Links with counts displaying the user's releases:
  - All Your Releases (with count, e.g., "All Your Releases: 68")
  - Incomplete Releases (e.g., "Incomplete Releases: 8")
  - Pending Releases (e.g., "Pending Releases: 20")
  - Rejected Releases (e.g., "Rejected Releases: 2")
  - Approved Releases (e.g., "Approved Releases: 38")
- **Balance & Withdrawal:** Displays current balance (e.g., "Balance: $197") and provides a withdrawal request form.
- **Notifications:** Displays admin messages (read-only, no replies).
- **Contact Us / Support Tickets:** Option to submit support tickets and read replies from admins.
- **About Us & Blogs:** General information pages and article listing.

### R4. Admin Dashboard
- Provides views to search, add, edit, and download CSV, Audio, Image, or XML exports for the following entities:
  - All Users (with count, e.g., "All Users: 82")
  - All Albums (e.g., "All Albums: 300")
  - All Singles (e.g., "All Singles: 600")
  - Notifications (e.g., "Notifications: 8")
  - Tickets (e.g., "Tickets: 5")
  - Admin's Access Permissions settings.

### R5. File Storage & Admin Access
- Uploaded release files (audio and cover images) and tax documents must be saved in the server's backend (e.g., a local file database with uploaded files in a local assets/uploads folder) and made downloadable by Admin users from the Admin Dashboard.

## Acceptance Criteria

### Verification Target
- [ ] Visitors can view the Home page, browse Blogs, and navigate to Sign-Up / Login.
- [ ] Users can register, log in (with JWT cookie verification), and access their User Dashboard.
- [ ] Users can submit a release, upload audio/image files, and see it appear under "All Your Releases" and "Pending Releases" (with counts updating).
- [ ] Users can submit withdrawal requests on the Balance page and create support tickets on the Contact page.
- [ ] Admins can log in and view the Admin Dashboard, search users and releases, view tickets, and download CSVs or uploaded audio/image files.
- [ ] Strict access control prevents normal users from opening the Admin Dashboard.
