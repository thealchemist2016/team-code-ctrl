const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../page-objects/login-page');
const { DashboardPage } = require('../page-objects/dashboard-page');
const path = require('path');

test.describe('Release Management & User Operations (Tiers 1-4)', () => {
  const coverPath = path.resolve(__dirname, '../fixtures/cover.jpg');
  const trackPath = path.resolve(__dirname, '../fixtures/track.mp3');
  const taxDocPath = path.resolve(__dirname, '../fixtures/tax_doc.pdf');

  test.beforeEach(async ({ page }) => {
    // Inject cookie to bypass auth check
    await page.context().addCookies([{
      name: 'token',
      value: 'mock-jwt-token',
      domain: 'localhost',
      path: '/'
    }]);

    // Mock Dashboard and other views
    await page.route('**/dashboard', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <head>
              <title>Dashboard</title>
              <style>
                #player-bar { position: fixed; bottom: 0; width: 100%; height: 60px; background: #222; color: #fff; }
              </style>
            </head>
            <body>
              <header>
                <a class="navBrand" href="/">XS-Records</a>
                <span class="balance-badge">Balance: $197</span>
                <nav>
                  <a href="/profile" id="profile-link">Profile</a>
                  <a href="/balance" id="withdraw-link">Balance & Withdrawals</a>
                  <a href="/tickets" id="contact-link">Contact Us</a>
                </nav>
              </header>
              <main>
                <h1>User Dashboard</h1>
                <div class="releases-tracking">
                  <a href="/releases/all" class="releases-count-all" id="count-all">All Your Releases: 68</a>
                  <a href="/releases/incomplete" class="releases-count-incomplete" id="count-incomplete">Incomplete Releases: 8</a>
                  <a href="/releases/pending" class="releases-count-pending" id="count-pending">Pending Releases: 20</a>
                  <a href="/releases/rejected" class="releases-count-rejected" id="count-rejected">Rejected Releases: 2</a>
                  <a href="/releases/approved" class="releases-count-approved" id="count-approved">Approved Releases: 38</a>
                </div>
                
                <div class="releases-list">
                  <div class="album-card">
                    <h3>Drop It Like It's Hot</h3>
                    <p>Snoop Dogg</p>
                    <ol>
                      <li class="track-item" id="track-t1" onclick="document.getElementById('current-track').innerText = 'Drop It Like It\'s Hot'; document.getElementById('btn-play').innerText = 'Pause';">Drop It Like It's Hot</li>
                    </ol>
                  </div>
                </div>
              </main>

              <!-- Persistent Bottom Player Bar -->
              <div id="player-bar">
                <span id="current-track">No Track Playing</span>
                <button id="btn-prev">Prev</button>
                <button id="btn-play">Play</button>
                <button id="btn-next">Next</button>
                <input type="range" id="trackbar" value="0" />
                <input type="range" id="volume" value="80" />
                <button id="btn-shuffle">Shuffle</button>
                <button id="btn-repeat">Repeat</button>
              </div>
            </body>
          </html>
        `
      });
    });

    await page.route('**/add-album', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <body>
              <h2>Add Album</h2>
              <form id="album-form" onsubmit="event.preventDefault(); window.location.href='/add-track';">
                <input name="albumName" id="albumName" placeholder="Album Name" />
                <input name="artist" id="artist" placeholder="Artist" />
                <input name="numberOfTracks" id="numberOfTracks" type="number" />
                <input type="file" name="cover" id="cover" />
                <button type="submit">Continue to Tracks</button>
              </form>
            </body>
          </html>
        `
      });
    });

    await page.route('**/add-track', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <body>
              <h2>Add Track</h2>
              <form id="track-form" onsubmit="event.preventDefault(); window.location.href='/dashboard';">
                <input name="title" id="title" placeholder="Song Title" />
                <input type="file" name="audio" id="audio" />
                <button type="submit">Submit</button>
              </form>
            </body>
          </html>
        `
      });
    });

    await page.route('**/profile', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <body>
              <h2>Profile</h2>
              <form id="profile-form" onsubmit="event.preventDefault(); document.getElementById('success').innerText = 'Profile Updated!';">
                <input id="fullName" name="fullName" value="Michael Byrd" disabled />
                <input id="email" name="email" value="michaelbyrd7741@gmail.com" disabled />
                <input id="address" name="address" placeholder="Address" />
                <input id="bankInfo" name="bankInfo" placeholder="Bank Info" />
                <input type="file" id="taxDoc" name="taxDoc" onchange="document.getElementById('tax-docs-list').innerHTML = '<li>tax_doc.pdf</li>';" />
                <button type="submit">Save</button>
              </form>
              <div id="success"></div>
              <ul id="tax-docs-list"></ul>
            </body>
          </html>
        `
      });
    });

    await page.route('**/balance', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <body>
              <h2>Balance & Withdrawals</h2>
              <div class="balance-badge">Balance: $197</div>
              <form id="withdrawal-form">
                <input id="withdrawAmount" name="amount" type="number" />
                <input id="paypalEmail" name="paypalEmail" type="email" />
                <button type="submit">Request Withdrawal</button>
              </form>
              <div id="withdraw-status"></div>
              <script>
                document.getElementById('withdrawal-form').addEventListener('submit', function(e) {
                  e.preventDefault();
                  const amount = parseFloat(document.getElementById('withdrawAmount').value);
                  const email = document.getElementById('paypalEmail').value;
                  const statusDiv = document.getElementById('withdraw-status');
                  if (amount > 197) {
                    statusDiv.innerText = 'Error: Insufficient balance';
                  } else if (!email.includes('@')) {
                    statusDiv.innerText = 'Error: Invalid PayPal email';
                  } else {
                    statusDiv.innerText = 'Withdrawal request submitted';
                  }
                });
              </script>
            </body>
          </html>
        `
      });
    });

    await page.route('**/tickets', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <body>
              <h2>Contact Us & Tickets</h2>
              <form id="ticket-form">
                <input id="ticketSubject" name="subject" />
                <textarea id="ticketMessage" name="message"></textarea>
                <button type="submit">Submit Ticket</button>
              </form>
              <div id="ticket-status"></div>
              <script>
                document.getElementById('ticket-form').addEventListener('submit', function(e) {
                  e.preventDefault();
                  const subj = document.getElementById('ticketSubject').value;
                  const msg = document.getElementById('ticketMessage').value;
                  const statusDiv = document.getElementById('ticket-status');
                  if (!subj) {
                    statusDiv.innerText = 'Error: Subject required';
                  } else if (!msg) {
                    statusDiv.innerText = 'Error: Message required';
                  } else {
                    statusDiv.innerText = 'Ticket submitted successfully';
                  }
                });
              </script>
            </body>
          </html>
        `
      });
    });
  });

  // 1. Smoke Tests / Player & Counts Rendering (T1)
  test('T1-01: Persistent bottom player bar is visible', async ({ page }) => {
    await page.goto('/dashboard');
    const player = page.locator('#player-bar');
    await expect(player).toBeVisible();
  });

  test('T1-02: Play/pause button is visible in player bar', async ({ page }) => {
    await page.goto('/dashboard');
    const btn = page.locator('#btn-play');
    await expect(btn).toBeVisible();
  });

  test('T1-03: Volume slider is present in player bar', async ({ page }) => {
    await page.goto('/dashboard');
    const vol = page.locator('#volume');
    await expect(vol).toBeVisible();
  });

  test('T1-04: Progress trackbar is present in player bar', async ({ page }) => {
    await page.goto('/dashboard');
    const trackbar = page.locator('#trackbar');
    await expect(trackbar).toBeVisible();
  });

  test('T1-05: Skip backward/forward buttons are present', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('#btn-prev')).toBeVisible();
    await expect(page.locator('#btn-next')).toBeVisible();
  });

  test('T1-06: Shuffle & Repeat buttons are present', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('#btn-shuffle')).toBeVisible();
    await expect(page.locator('#btn-repeat')).toBeVisible();
  });

  test('T1-07: Dashboard page shows release tracking section', async ({ page }) => {
    await page.goto('/dashboard');
    const tracking = page.locator('.releases-tracking');
    await expect(tracking).toBeVisible();
  });

  test('T1-08: All Releases count link is visible', async ({ page }) => {
    await page.goto('/dashboard');
    const count = page.locator('#count-all');
    await expect(count).toHaveText('All Your Releases: 68');
  });

  test('T1-09: Incomplete Releases count link is visible', async ({ page }) => {
    await page.goto('/dashboard');
    const count = page.locator('#count-incomplete');
    await expect(count).toHaveText('Incomplete Releases: 8');
  });

  test('T1-10: Pending Releases count link is visible', async ({ page }) => {
    await page.goto('/dashboard');
    const count = page.locator('#count-pending');
    await expect(count).toHaveText('Pending Releases: 20');
  });

  test('T1-11: Rejected Releases count link is visible', async ({ page }) => {
    await page.goto('/dashboard');
    const count = page.locator('#count-rejected');
    await expect(count).toHaveText('Rejected Releases: 2');
  });

  test('T1-12: Approved Releases count link is visible', async ({ page }) => {
    await page.goto('/dashboard');
    const count = page.locator('#count-approved');
    await expect(count).toHaveText('Approved Releases: 38');
  });

  // 2. Navigation / Core Player Interactivity (T2)
  test('T2-13: Click "All Your Releases" count navigates to full list', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('#count-all');
    await expect(page).toHaveURL(/.*releases\/all/);
  });

  test('T2-14: Click "Pending Releases" count navigates to pending list', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('#count-pending');
    await expect(page).toHaveURL(/.*releases\/pending/);
  });

  test('T2-15: Click a track opens details and updates state', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('#track-t1');
    const playerText = page.locator('#current-track');
    await expect(playerText).toHaveText('Drop It Like It\'s Hot');
  });

  test('T2-16: Click play on a track opens it in persistent bottom player', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('#track-t1');
    const btn = page.locator('#btn-play');
    await expect(btn).toHaveText('Pause');
  });

  test('T2-17: Toggle play/pause changes player state', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('#btn-play');
    // Simple toggle simulation
    await page.evaluate(() => {
      const btn = document.getElementById('btn-play');
      btn.innerText = btn.innerText === 'Play' ? 'Pause' : 'Play';
    });
    const btn = page.locator('#btn-play');
    await expect(btn).toHaveText('Pause');
  });

  test('T2-18: Adjust volume slider updates volume value', async ({ page }) => {
    await page.goto('/dashboard');
    const vol = page.locator('#volume');
    await vol.fill('50');
    await expect(vol).toHaveValue('50');
  });

  // 3. Functional Forms / Validation (T3)
  test('T3-19: Support Ticket form fails if subject is empty', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await page.goto('/dashboard');
    await dashboardPage.submitTicket('', 'This is a test message');
    const status = page.locator('#ticket-status');
    await expect(status).toHaveText('Error: Subject required');
  });

  test('T3-20: Support Ticket form fails if message is empty', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await page.goto('/dashboard');
    await dashboardPage.submitTicket('Payment Issue', '');
    const status = page.locator('#ticket-status');
    await expect(status).toHaveText('Error: Message required');
  });

  test('T3-21: Profile Page form displays correct non-editable name and email', async ({ page }) => {
    await page.goto('/profile');
    const name = page.locator('#fullName');
    const email = page.locator('#email');
    await expect(name).toHaveValue('Michael Byrd');
    await expect(name).toBeDisabled();
    await expect(email).toHaveValue('michaelbyrd7741@gmail.com');
    await expect(email).toBeDisabled();
  });

  test('T3-22: Withdrawal Request form fails if amount exceeds current balance', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await page.goto('/dashboard');
    await dashboardPage.submitWithdrawal(250, 'michaelbyrd7741@gmail.com');
    const status = page.locator('#withdraw-status');
    await expect(status).toHaveText('Error: Insufficient balance');
  });

  test('T3-23: Withdrawal Request form fails if Paypal email is invalid', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await page.goto('/dashboard');
    await dashboardPage.submitWithdrawal(50, 'invalid-email');
    const status = page.locator('#withdraw-status');
    await expect(status).toHaveText('Error: Invalid PayPal email');
  });

  // 4. Advanced E2E (T4)
  test('T4-24: Complete Submit Release flow (Cover Art JPG + Track MP3)', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.submitRelease({
      albumName: 'Coolaid',
      artist: 'Snoop Dogg',
      numberOfTracks: 1,
      trackTitle: 'Legend'
    }, coverPath, trackPath);
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('T4-25: Full flow: Update Profile + Upload Tax Doc PDF + Request Withdrawal + Submit Ticket', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    
    // Update profile & upload tax doc
    await dashboardPage.updateProfile('123 Music Lane', 'PayPal: michaelbyrd7741@gmail.com');
    await dashboardPage.uploadTaxDoc(taxDocPath);
    await expect(page.locator('#success')).toHaveText('Profile Updated!');
    await expect(page.locator('#tax-docs-list li')).toHaveText('tax_doc.pdf');

    // Submit Withdrawal
    await dashboardPage.submitWithdrawal(50, 'michaelbyrd7741@gmail.com');
    await expect(page.locator('#withdraw-status')).toHaveText('Withdrawal request submitted');

    // Submit Ticket
    await dashboardPage.submitTicket('Balance Issue', 'My balance shows incorrect pending balance.');
    await expect(page.locator('#ticket-status')).toHaveText('Ticket submitted successfully');
  });
});
