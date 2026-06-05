## 2026-06-05T05:22:53Z

An improved, fully featured, and visually impressive version of the XS-Records MERN (MongoDB/Express/React/Node) music discography web application to showcase to employers.

Working directory: C:\Users\admin\.gemini\antigravity\scratch\team-code-ctrl
Integrity mode: development

## Requirements

### R1. Modern Premium Aesthetics (UI/UX)
- Implement a dark mode default UI with sleek glassmorphism panels, vibrant glow effects, and modern typography (e.g., Google Font "Outfit").
- Use clean layouts, smooth hover animations, transition effects, and a responsive layout with a music-focused sidebar navigation.

### R2. Persistent Bottom Music Player
- Add a bottom music player bar that persists across pages.
- The player should feature full controls: play/pause, volume slider, progress trackbar, skip backward/forward, shuffle, and repeat.
- Connect tracks in the database to actual playable resources (using standard royalty-free Lofi MP3 URLs or uploaded local audio files).

### R3. File Upload and Local Storage
- Support uploading real cover images and audio files when adding albums and tracks.
- Files should be saved locally on the server (e.g., in a `public/uploads` directory) and served statically.

### R4. Dashboard Enhancements
- Integrate a real-time search bar to filter albums by name, artist, or track.
- Add an interactive metrics card section (e.g., total albums, total songs, total playtime).
- Include album details pages showing high-res artwork, track numbers, and controls to play individual tracks directly.

### R5. Client-Side Protected Routes
- Restrict dashboard access and album/track creation to authenticated users. Unauthenticated visitors should be redirected to the login screen.

## Acceptance Criteria

### Verification Target
- [ ] User can register a new account, log in, and be redirected to a glassmorphic dashboard.
- [ ] User can create an album, upload a custom cover image, and add tracks with audio files.
- [ ] The dashboard updates dynamically to list the new album with a playable tracklist.
- [ ] Clicking a track opens it in the persistent bottom player, showing correct controls (play/pause, volume, progress bar) and playing the audio.
- [ ] Unauthenticated users are barred from accessing `/dashboard`, `/add-album`, or `/add-track`.

## 2026-06-05T05:26:13Z

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
