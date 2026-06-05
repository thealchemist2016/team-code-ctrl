# XS-Records Music Distribution Platform — E2E Test Infrastructure

This document details the configuration, folder layout, test coverage mapping, and execution instructions for the End-to-End (E2E) testing framework designed for the XS-Records Music Distribution Platform.

---

## 1. Overview and Architecture

The E2E test suite uses **Playwright** as the automated browser testing library. To ensure high fidelity and reproducibility, tests are run against a real instance of Google Chrome installed on the host operating system.

### Key Objectives
- **Zero Browser Downloads:** Configured to reuse the host's existing Google Chrome installation to optimize setup times, prevent external downloads, and satisfy network-restricted environments.
- **Page Object Model (POM):** Decouples page elements and operations from the test flow logic to maintain clean and dry test specs.
- **Requirement-Driven Scenarios:** Mapped directly to the application specifications (Home Page, Authentication, User Dashboard, Admin Dashboard, and File Storage).

---

## 2. Directory Structure

The E2E test workspace is structured inside the `/e2e` directory as follows:

```text
team-code-ctrl/e2e/
├── package.json               # E2E dependencies, commands, and scripts
├── playwright.config.js       # Playwright configuration pointing to host Chrome
├── page-objects/              # Page Object Models (POMs) representing views
│   ├── login-page.js          # Selectors & flows for login & sign-up
│   └── dashboard-page.js      # Selectors & flows for user/admin dashboard operations
└── tests/                     # Test specification suites
    ├── auth.spec.js           # E2E flows for R1, R2, and Protected Routes (Access Control)
    ├── release.spec.js        # E2E flows for R3 and Persistent Bottom Player
    └── admin.spec.js          # E2E flows for R4, R5, and Admin Permissions/Exports
```

---

## 3. Configuration Details

### Host Google Chrome Integration
Playwright is configured to run using the Chrome executable located at:
`C:\Program Files\Google\Chrome\Application\chrome.exe`

This is defined in the `playwright.config.js` options:
```javascript
use: {
  launchOptions: {
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  }
}
```

### Server Target Base URL
All tests target the application running on the local host at:
`http://localhost:3000` (configurable via `baseURL` in `playwright.config.js`).

---

## 4. Test Coverage Mapping

| Requirement | Description | E2E Test Suite | Page Object / Selectors |
| :--- | :--- | :--- | :--- |
| **R1. Home Page** | Verification of header/menu, body elements, terms/privacy links, and buttons. | `tests/auth.spec.js` | `page.locator('header')`, `.footer` |
| **R2. Auth** | Registration flow (TOS checkbox), Login with JWT verification, and redirect. | `tests/auth.spec.js` | `LoginPage` (`/login`, `/signup`) |
| **R3. User Dashboard** | Release metadata fields, cover art & track file uploads, counts updates, balance & withdrawal requests, and support tickets. | `tests/release.spec.js` | `DashboardPage` (`.balance-badge`, `.releases-count-pending`) |
| **R4. Admin Dashboard** | Admin login, searching/editing users and releases, and exporting data (CSV, XML, audio, image). | `tests/admin.spec.js` | `DashboardPage` (admin table rows, download buttons) |
| **R5. File Storage** | Verifying uploaded media files are correctly saved to assets/uploads and downloadable by Admins. | `tests/admin.spec.js` | `page.locator('a[download]')` |
| **Access Control** | Protecting dashboards; redirecting unauthenticated users to `/login`. | `tests/auth.spec.js` | `page.goto('/dashboard')` checking redirection |

---

## 5. Getting Started & Running Tests

### Prerequisites
- Node.js installed.
- Host Google Chrome installed at the standard location: `C:\Program Files\Google\Chrome\Application\chrome.exe`.

### Installation
From the root of the project, navigate to the `e2e` directory and install the dependencies:
```bash
cd e2e
npm install
```

### Running Tests
Execute the test suites using npm scripts defined in `package.json`:

* Run tests in headless mode (default):
  ```bash
  npm run test
  ```

* Run tests with a visible browser (headed):
  ```bash
  npm run test:headed
  ```

* Open Playwright interactive UI Mode:
  ```bash
  npm run test:ui
  ```

* Launch code generator for recording test steps:
  ```bash
  npm run codegen
  ```
