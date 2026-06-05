# E2E Testing Infrastructure Investigation and Proposal

This report outlines the Node/NPM environment status of the MERN application (`team-code-ctrl`) and proposes a robust End-to-End (E2E) testing setup.

---

## 1. Observation

- **CLI Execution Timeout:** 
  Attempts to execute `node -v; npm -v` and `node --version` using the `run_command` tool timed out awaiting user permission.
  *Verbatim Error:* 
  `Encountered error in step execution: Permission prompt for action 'command' on target 'node --version' timed out waiting for user response. The user was not able to provide permission on time. You should proceed as much as possible without access to this resource.`
  Consequently, environment properties must be analyzed statically.
  
- **Static Package Analysis:**
  - **Root Package:** `package.json` at `C:\Users\admin\.gemini\antigravity\scratch\team-code-ctrl\package.json` contains standard scripts (`start:server`, `start:client`, `dev`) and only `concurrently` as a dependency.
  - **Client Package:** `client/xs-records/package.json` lists `"react-scripts": "3.0.0"`. Static analysis of `client/xs-records/node_modules` reveals that **Jest** is already installed under `@jest` and `jest` folders because it is bundled with `react-scripts`. There are no Cypress, Playwright, or Puppeteer folders in `node_modules`.
  - **Server Package:** `server/package.json` contains database and routing dependencies (`express`, `bcryptjs`, `passport`, etc.) and `nodemon` for development. No testing framework is present on the server-side.
  - **Existing Tests:** Only one unit/integration test is present in `client/xs-records/src/App.test.js`, which verifies that the React application renders without crashing using JSDOM in Jest.

---

## 2. Logic Chain

1. **E2E Framework Analysis:**
   - **Cypress:** Great interface, but requires downloading a large binary (~100-200MB) during installation. In a `CODE_ONLY` network environment, it will fail unless the environment variable `CYPRESS_INSTALL_BINARY` is mapped to a pre-downloaded local zip file.
   - **Playwright:** Highly performant, offers outstanding trace viewer, auto-waiting, and native support for multi-user context testing. Like Cypress, it requires browser binaries (`npx playwright install`), which will fail offline unless a pre-downloaded folder is mapped to `PLAYWRIGHT_BROWSERS_PATH`.
   - **Puppeteer:** Controls Chromium over DevTools. While it also downloads Chromium by default, it can easily be configured to use the existing Google Chrome installation on the Windows host (e.g., `C:\Program Files\Google\Chrome\Application\chrome.exe`) by passing the `executablePath` option, bypassing the offline download limitation completely.
   - **Jest (JSDOM / Supertest):** Currently present in the project. It works fully offline, but JSDOM is not a real browser. It cannot test cross-origin cookie authentication, actual file uploads, persistent audio playback controls, or visual page transitions.

2. **Application Requirements Match:**
   The XS-Records music distribution application is a multi-role system (regular Users submit releases, request withdrawals, and open support tickets, while Admin users search records, download media/CSVs, and manage permissions).
   - Evaluating workflows like "User uploads audio file -> Admin reviews and downloads it" requires either **multi-browser/tab testing** or **isolated browser contexts**.
   - **Playwright** supports running isolated browser contexts within a single test execution (avoiding heavy overhead of multiple browser windows), making it the most suitable choice.
   - For strictly offline environments where downloading Playwright browsers is impossible, **Puppeteer with local Chrome** combined with Jest is the recommended fallback.

---

## 3. Caveats

- **No Live Verification:** Due to user permission timeouts, we could not run active CLI commands to check Node/NPM versions or verify global packages.
- **Local Browser Presence:** The Puppeteer/Chrome fallback assumes Google Chrome is installed at standard paths on the Windows target environment.
- **Ports Config:** We assume standard MERN development ports: port `3001` for the backend Express server and port `3002` for the React client.

---

## 4. Conclusion & Infrastructure Proposal

We propose establishing a dedicated `e2e` directory at the project root level. This structure keeps E2E tests clean, decoupled, and capable of spanning both frontend and backend domains.

### Proposed Directory Layout
```text
team-code-ctrl/
├── e2e/
│   ├── package.json              # E2E test-specific dependencies
│   ├── playwright.config.js      # Playwright E2E configuration
│   └── tests/
│       ├── auth.spec.js          # Authentication & Route Guards tests
│       ├── release.spec.js       # Release submission & upload verification
│       └── admin.spec.js         # Admin panel, exports & downloads tests
```

---

### Implementation Blueprints

#### Option A: Playwright Configuration (Recommended)

Create `e2e/package.json`:
```json
{
  "name": "xs-records-e2e",
  "version": "1.0.0",
  "private": true,
  "devDependencies": {
    "@playwright/test": "^1.42.0"
  },
  "scripts": {
    "test": "playwright test"
  }
}
```

Create `e2e/playwright.config.js`:
```javascript
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 2,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3002',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Automatically start both client and server prior to E2E runs
  webServer: [
    {
      command: 'npm run start:server',
      cwd: '../',
      port: 3001,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run start:client',
      cwd: '../',
      port: 3002,
      reuseExistingServer: !process.env.CI,
    }
  ],
});
```

Create an Example E2E test at `e2e/tests/auth.spec.js`:
```javascript
const { test, expect } = require('@playwright/test');

test.describe('Authentication and Route Access Controls', () => {
  
  test('unauthenticated user is redirected from protected route', async ({ page }) => {
    // Navigate directly to dashboard
    await page.goto('/dashboard');
    // Verify redirection to login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('user can register and view dashboard', async ({ page }) => {
    await page.goto('/register');
    
    // Fill out registration form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'Password123!');
    await page.check('input[name="agreeTerms"]');
    
    await page.click('button[type="submit"]');
    
    // Should be redirected to dashboard on success
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=Balance: $0')).toBeVisible();
  });

  test('multi-role workflow verification (User submission & Admin view)', async ({ browser }) => {
    // 1. Create isolated User session
    const userContext = await browser.newContext();
    const userPage = await userContext.newPage();
    await userPage.goto('/login');
    await userPage.fill('input[name="username"]', 'artist_user');
    await userPage.fill('input[name="password"]', 'ArtistPwd123');
    await userPage.click('button[type="submit"]');
    
    // Submit release
    await userPage.goto('/submit-release');
    await userPage.fill('input[name="title"]', 'New Single');
    // Upload files
    await userPage.setInputFiles('input[name="cover"]', 'tests/fixtures/cover.jpg');
    await userPage.setInputFiles('input[name="audio"]', 'tests/fixtures/track.mp3');
    await userPage.click('button[type="submit"]');
    
    // 2. Create isolated Admin session
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await adminPage.goto('/login');
    await adminPage.fill('input[name="username"]', 'admin_user');
    await adminPage.fill('input[name="password"]', 'AdminPwd123');
    await adminPage.click('button[type="submit"]');
    
    // Go to admin panel and verify user's release is listable
    await adminPage.goto('/admin');
    await expect(adminPage.locator('text=New Single')).toBeVisible();
    
    await userContext.close();
    await adminContext.close();
  });
});
```

---

#### Option B: Puppeteer Offline Configuration (Fallback)

If internet/binaries cannot be fetched, we can use Jest + Puppeteer pointing to local Chrome.

Create `e2e/jest.config.js`:
```javascript
module.exports = {
  preset: 'jest-puppeteer',
  testRegex: './*\\.test\\.js$',
};
```

Create `e2e/jest-puppeteer.config.js`:
```javascript
module.exports = {
  launch: {
    headless: true,
    // Point to existing Chrome browser on Windows
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    defaultViewport: {
      width: 1280,
      height: 800
    }
  },
  server: {
    command: 'npm run dev',
    port: 3002,
    launchTimeout: 30000,
    debug: true,
  },
};
```

Create `e2e/auth.test.js`:
```javascript
describe('User Authentication (Puppeteer)', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:3002/dashboard');
  });

  it('redirects unauthenticated user to login', async () => {
    const url = page.url();
    expect(url).toMatch(/login/);
  });
});
```

---

## 5. Verification Method

Once offline package/browser mirrors are aligned or network access is configured:

1. Install E2E directory dependencies:
   ```bash
   cd e2e
   npm install
   ```
2. (For Playwright) Run browser installer or configure cache:
   ```bash
   # Online install:
   npx playwright install chromium
   
   # Or offline configuration mapping:
   # Set environment variable PLAYWRIGHT_BROWSERS_PATH="C:\path\to\cached\browsers"
   ```
3. Run E2E tests:
   ```bash
   npm run test
   ```
4. Verification condition is met when both front-end and back-end local servers launch, and tests assert success on redirection guards, form submits, and dashboard counts.
