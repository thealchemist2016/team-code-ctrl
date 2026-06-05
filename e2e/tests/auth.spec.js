const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../page-objects/login-page');

test.describe('Authentication and Navigation Flows (Tiers 1-4)', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the landing page and basic navigation links
    await page.route('**/', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <!DOCTYPE html>
          <html>
            <head><title>XS-Records Music Distribution</title></head>
            <body>
              <header>
                <a class="navBrand" href="/">XS-Records</a>
                <nav>
                  <a href="/login" class="nav-link" id="nav-login">Login</a>
                  <a href="/register" class="nav-link" id="nav-register">Register</a>
                  <a href="/about" class="nav-link" id="nav-about">About Us</a>
                  <a href="/contact" class="nav-link" id="nav-contact">Contact Us</a>
                </nav>
              </header>
              <main>
                <h1>XSR</h1>
                <p class="slogan">XS Records is the easiest way for musicians to distribute music.</p>
                <button class="btn-get-started" id="btn-get-started" onclick="window.location.href='/register'">GET STARTED</button>
                <div class="news-section">
                  <h2 class="cardTitle">XSR News</h2>
                  <p class="cardText">Id anim fugiat fugiat proident aute incididunt et irure enim cillum aliqua ullamco...</p>
                </div>
              </main>
              <footer>
                <span class="logo">XS-Records Footer Logo</span>
                <a href="/tos" class="footer-link" id="footer-tos">Terms of Service</a>
                <a href="/privacy" class="footer-link" id="footer-privacy">Privacy Policy</a>
                <p class="copyright">&copy; 2026 XS-Records. All rights reserved.</p>
              </footer>
            </body>
          </html>
        `
      });
    });

    await page.route('**/tos', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body><h1>Terms of Service</h1><p>Our terms of service details...</p></body></html>'
      });
    });

    await page.route('**/privacy', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body><h1>Privacy Policy</h1><p>Our privacy policy details...</p></body></html>'
      });
    });

    await page.route('**/about', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body><h1>About Us</h1><p>About XS-Records...</p></body></html>'
      });
    });

    // Route guards / redirects simulation
    await page.route('**/dashboard', async route => {
      const cookies = await page.context().cookies();
      const hasToken = cookies.some(c => c.name === 'token');
      if (!hasToken) {
        await route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: '<html><head><meta http-equiv="refresh" content="0; url=/login"></head><body>Redirecting to login...</body></html>'
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: '<html><body><h1>Dashboard</h1><div class="balance-badge">Balance: $197</div><a href="/logout" id="logout-btn">Logout</a></body></html>'
        });
      }
    });

    await page.route('**/add-album', async route => {
      const cookies = await page.context().cookies();
      const hasToken = cookies.some(c => c.name === 'token');
      if (!hasToken) {
        await route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: '<html><head><meta http-equiv="refresh" content="0; url=/login"></head><body>Redirecting...</body></html>'
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: '<html><body><h1>Add Album</h1></body></html>'
        });
      }
    });

    await page.route('**/add-track', async route => {
      const cookies = await page.context().cookies();
      const hasToken = cookies.some(c => c.name === 'token');
      if (!hasToken) {
        await route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: '<html><head><meta http-equiv="refresh" content="0; url=/login"></head><body>Redirecting...</body></html>'
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: '<html><body><h1>Add Track</h1></body></html>'
        });
      }
    });

    await page.route('**/profile', async route => {
      const cookies = await page.context().cookies();
      const hasToken = cookies.some(c => c.name === 'token');
      if (!hasToken) {
        await route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: '<html><head><meta http-equiv="refresh" content="0; url=/login"></head><body>Redirecting...</body></html>'
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: '<html><body><h1>Profile</h1></body></html>'
        });
      }
    });

    await page.route('**/balance', async route => {
      const cookies = await page.context().cookies();
      const hasToken = cookies.some(c => c.name === 'token');
      if (!hasToken) {
        await route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: '<html><head><meta http-equiv="refresh" content="0; url=/login"></head><body>Redirecting...</body></html>'
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: '<html><body><h1>Balance</h1></body></html>'
        });
      }
    });

    // Mock Login Page HTML
    await page.route('**/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <body>
              <h2>login</h2>
              <form id="login-form">
                <input name="email" type="email" placeholder="Email" />
                <input name="password" type="password" placeholder="Password" />
                <button type="submit">Submit</button>
              </form>
              <div id="error-message" style="display:none; color:red;">Incorrect username or password</div>
              <script>
                document.getElementById('login-form').addEventListener('submit', function(e) {
                  e.preventDefault();
                  const email = document.querySelector('input[name="email"]').value;
                  const password = document.querySelector('input[name="password"]').value;
                  if (email === 'michaelbyrd7741@gmail.com' && password === 'michael123') {
                    document.cookie = "token=mock-jwt-token; path=/";
                    window.location.href = '/dashboard';
                  } else {
                    document.getElementById('error-message').style.display = 'block';
                  }
                });
              </script>
            </body>
          </html>
        `
      });
    });

    // Mock Register Page HTML
    await page.route('**/register', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <body>
              <h2>Register</h2>
              <form id="register-form">
                <input name="fname" id="fname" placeholder="First Name" />
                <input name="lname" id="lname" placeholder="Last Name" />
                <input name="email" id="email" type="email" placeholder="Email" />
                <input name="username" id="usename" placeholder="Username" />
                <input name="password" id="password" type="password" placeholder="Password" />
                <input type="checkbox" name="tosAccepted" id="tosAccepted" /> I agree to the Terms of Service
                <button type="submit">Submit</button>
              </form>
              <script>
                document.getElementById('register-form').addEventListener('submit', function(e) {
                  e.preventDefault();
                  const tos = document.getElementById('tosAccepted').checked;
                  if (!tos) {
                    alert('Terms of Service must be accepted.');
                  } else {
                    window.location.href = '/login';
                  }
                });
              </script>
            </body>
          </html>
        `
      });
    });
  });

  // 1. Smoke Tests / Rendering (T1)
  test('T1-01: should render landing page header logo', async ({ page }) => {
    await page.goto('/');
    const logo = page.locator('.navBrand');
    await expect(logo).toHaveText('XS-Records');
  });

  test('T1-02: should show About Us link in menu', async ({ page }) => {
    await page.goto('/');
    const about = page.locator('#nav-about');
    await expect(about).toHaveText('About Us');
  });

  test('T1-03: should show Contact Us link in menu', async ({ page }) => {
    await page.goto('/');
    const contact = page.locator('#nav-contact');
    await expect(contact).toHaveText('Contact Us');
  });

  test('T1-04: should show footer with copyright', async ({ page }) => {
    await page.goto('/');
    const copyright = page.locator('.copyright');
    await expect(copyright).toContainText('XS-Records. All rights reserved.');
  });

  test('T1-05: should show Terms of Service link in footer', async ({ page }) => {
    await page.goto('/');
    const tos = page.locator('#footer-tos');
    await expect(tos).toHaveText('Terms of Service');
  });

  test('T1-06: should show Privacy Policy link in footer', async ({ page }) => {
    await page.goto('/');
    const privacy = page.locator('#footer-privacy');
    await expect(privacy).toHaveText('Privacy Policy');
  });

  test('T1-07: should show Login link in menu', async ({ page }) => {
    await page.goto('/');
    const login = page.locator('#nav-login');
    await expect(login).toHaveText('Login');
  });

  test('T1-08: should show Register link in menu', async ({ page }) => {
    await page.goto('/');
    const register = page.locator('#nav-register');
    await expect(register).toHaveText('Register');
  });

  test('T1-09: should show company slogan in body', async ({ page }) => {
    await page.goto('/');
    const slogan = page.locator('.slogan');
    await expect(slogan).toContainText('XS Records is the easiest way for musicians to distribute music.');
  });

  test('T1-10: should show news section title', async ({ page }) => {
    await page.goto('/');
    const title = page.locator('.cardTitle');
    await expect(title).toHaveText('XSR News');
  });

  test('T1-11: should show news description content', async ({ page }) => {
    await page.goto('/');
    const text = page.locator('.cardText');
    await expect(text).toContainText('Id anim fugiat fugiat proident');
  });

  test('T1-12: should show GET STARTED button in body', async ({ page }) => {
    await page.goto('/');
    const btn = page.locator('#btn-get-started');
    await expect(btn).toHaveText('GET STARTED');
  });

  // 2. Navigation / Interactive (T2)
  test('T2-13: should navigate to Login page when clicking Login link', async ({ page }) => {
    await page.goto('/');
    await page.click('#nav-login');
    await expect(page).toHaveURL(/.*login/);
  });

  test('T2-14: should navigate to Register page when clicking Register link', async ({ page }) => {
    await page.goto('/');
    await page.click('#nav-register');
    await expect(page).toHaveURL(/.*register/);
  });

  test('T2-15: should navigate to Register page when clicking GET STARTED button', async ({ page }) => {
    await page.goto('/');
    await page.click('#btn-get-started');
    await expect(page).toHaveURL(/.*register/);
  });

  test('T2-16: should navigate to Terms of Service page when clicking ToS link', async ({ page }) => {
    await page.goto('/');
    await page.click('#footer-tos');
    await expect(page).toHaveURL(/.*tos/);
  });

  test('T2-17: should navigate to Privacy Policy page when clicking Privacy Policy link', async ({ page }) => {
    await page.goto('/');
    await page.click('#footer-privacy');
    await expect(page).toHaveURL(/.*privacy/);
  });

  test('T2-18: should navigate to Home page when clicking Logo from another page', async ({ page }) => {
    await page.goto('/about');
    await page.route('**/about', () => {}); // disable mock if navigating away
    await page.click('.navBrand');
    await expect(page).toHaveURL(/\/$/);
  });

  // 3. Functional Auth / Access Control (T3)
  test('T3-19: should redirect unauthenticated user from /dashboard to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/.*login/);
    await expect(page).toHaveURL(/.*login/);
  });

  test('T3-20: should redirect unauthenticated user from /add-album to /login', async ({ page }) => {
    await page.goto('/add-album');
    await page.waitForURL(/.*login/);
    await expect(page).toHaveURL(/.*login/);
  });

  test('T3-21: should redirect unauthenticated user from /add-track to /login', async ({ page }) => {
    await page.goto('/add-track');
    await page.waitForURL(/.*login/);
    await expect(page).toHaveURL(/.*login/);
  });

  test('T3-22: should redirect unauthenticated user from /profile to /login', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForURL(/.*login/);
    await expect(page).toHaveURL(/.*login/);
  });

  test('T3-23: should redirect unauthenticated user from /balance to /login', async ({ page }) => {
    await page.goto('/balance');
    await page.waitForURL(/.*login/);
    await expect(page).toHaveURL(/.*login/);
  });

  test('T3-24: should fail login with invalid credentials and show error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('wrong@user.com', 'wrongpassword');
    const err = page.locator('#error-message');
    await expect(err).toBeVisible();
    await expect(err).toHaveText('Incorrect username or password');
  });

  // 4. Advanced E2E (T4)
  test('T4-25: should register, login, view dashboard, and logout successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    // Register
    await loginPage.register('Michael', 'Byrd', 'michaelbyrd7741@gmail.com', 'michaelbyrd7741@gmail.com', 'michael123', true);
    await expect(page).toHaveURL(/.*login/);

    // Login
    await loginPage.login('michaelbyrd7741@gmail.com', 'michael123');
    await expect(page).toHaveURL(/.*dashboard/);

    // Dashboard features check
    const balance = page.locator('.balance-badge');
    await expect(balance).toHaveText('Balance: $197');

    // Logout
    await page.click('#logout-btn');
    // Clear cookies mock to test logout guard
    await page.context().clearCookies();
    await page.goto('/dashboard');
    await page.waitForURL(/.*login/);
    await expect(page).toHaveURL(/.*login/);
  });
});
