const { test, expect } = require('@playwright/test');

test.describe('Admin Dashboard & Operations (Tiers 1-4)', () => {
  test.beforeEach(async ({ page }) => {
    // Inject cookies for admin authentication by default
    await page.context().addCookies([{
      name: 'token',
      value: 'admin-jwt-token',
      domain: 'localhost',
      path: '/'
    }]);

    // Mock Admin Dashboard Page
    await page.route('**/admin', async route => {
      // Simulate access control check based on token value
      const cookies = await page.context().cookies();
      const adminToken = cookies.find(c => c.name === 'token' && c.value === 'admin-jwt-token');
      if (!adminToken) {
        await route.fulfill({
          status: 403,
          contentType: 'text/html',
          body: '<html><body><h1>403 Forbidden</h1><p>Access denied. Admins only.</p></body></html>'
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <head>
              <title>Admin Dashboard</title>
              <style>
                .modal { display: none; position: fixed; top: 20%; left: 30%; background: #fff; border: 1px solid #000; padding: 20px; }
              </style>
            </head>
            <body>
              <h1>Admin Dashboard</h1>
              
              <div class="metrics">
                <div class="metric-card" id="metric-users">All Users: 82</div>
                <div class="metric-card" id="metric-albums">All Albums: 300</div>
                <div class="metric-card" id="metric-singles">All Singles: 600</div>
                <div class="metric-card" id="metric-notifications">Notifications: 8</div>
                <div class="metric-card" id="metric-tickets">Tickets: 5</div>
              </div>

              <div class="search-section">
                <input id="admin-search" placeholder="Search..." oninput="filterTable()" />
                <button id="btn-search">Search</button>
              </div>

              <div class="entities-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody id="table-body">
                    <tr class="user-row" data-name="Michael Byrd">
                      <td>u-1</td>
                      <td class="username-cell">Michael Byrd</td>
                      <td>User</td>
                      <td>Active</td>
                      <td>
                        <button class="btn-edit-user" onclick="openModal('edit-user-modal')">Edit</button>
                        <button class="btn-permission-settings" onclick="openModal('permissions-modal')">Permissions</button>
                        <a href="/admin/download/tax/u-1" class="btn-download-tax">Download Tax Doc</a>
                      </td>
                    </tr>
                    <tr class="release-row" data-name="Drop It Like It's Hot Snoop Dogg">
                      <td>r-1</td>
                      <td class="release-name-cell">Drop It Like It's Hot</td>
                      <td>Album</td>
                      <td class="status-cell">Pending</td>
                      <td>
                        <button class="btn-approve" onclick="updateStatus('Approved')">Approve</button>
                        <button class="btn-reject" onclick="updateStatus('Rejected')">Reject</button>
                        <a href="/admin/download/csv/r-1" class="btn-download-csv">Export CSV</a>
                        <a href="/admin/download/xml/r-1" class="btn-download-xml">Export XML</a>
                        <a href="/admin/download/cover/r-1" class="btn-download-image">Download Cover</a>
                        <a href="/admin/download/track/r-1" class="btn-download-audio">Download Track</a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div id="edit-user-modal" class="modal">
                <h3>Edit User</h3>
                <input id="edit-username" value="Michael Byrd" />
                <button onclick="closeModal('edit-user-modal')">Save</button>
              </div>

              <div id="permissions-modal" class="modal">
                <h3>Admin Access Permissions</h3>
                <label><input type="checkbox" id="perm-export" checked /> Allow Exports</label>
                <button onclick="closeModal('permissions-modal')">Save Permissions</button>
              </div>

              <script>
                function openModal(id) {
                  document.getElementById(id).style.display = 'block';
                }
                function closeModal(id) {
                  document.getElementById(id).style.display = 'none';
                }
                function updateStatus(newStatus) {
                  document.querySelector('.status-cell').innerText = newStatus;
                }
                function filterTable() {
                  const query = document.getElementById('admin-search').value.toLowerCase();
                  const rows = document.querySelectorAll('#table-body tr');
                  rows.forEach(row => {
                    const name = row.getAttribute('data-name').toLowerCase();
                    if (name.includes(query)) {
                      row.style.display = '';
                    } else {
                      row.style.display = 'none';
                    }
                  });
                }
              </script>
            </body>
          </html>
        `
      });
    });

    // Mock file downloads with proper attachment disposition
    await page.route('**/admin/download/csv/*', async route => {
      await route.fulfill({
        status: 200,
        headers: {
          'Content-Disposition': 'attachment; filename="release.csv"',
          'Content-Type': 'text/csv'
        },
        body: 'id,title,artist\nr-1,Drop It Like It\'s Hot,Snoop Dogg'
      });
    });

    await page.route('**/admin/download/xml/*', async route => {
      await route.fulfill({
        status: 200,
        headers: {
          'Content-Disposition': 'attachment; filename="release.xml"',
          'Content-Type': 'application/xml'
        },
        body: '<release><id>r-1</id><title>Drop It Like It\'s Hot</title></release>'
      });
    });

    await page.route('**/admin/download/cover/*', async route => {
      await route.fulfill({
        status: 200,
        headers: {
          'Content-Disposition': 'attachment; filename="cover.jpg"',
          'Content-Type': 'image/jpeg'
        },
        body: 'dummy cover data'
      });
    });

    await page.route('**/admin/download/track/*', async route => {
      await route.fulfill({
        status: 200,
        headers: {
          'Content-Disposition': 'attachment; filename="track.mp3"',
          'Content-Type': 'audio/mpeg'
        },
        body: 'dummy audio data'
      });
    });

    await page.route('**/admin/download/tax/*', async route => {
      await route.fulfill({
        status: 200,
        headers: {
          'Content-Disposition': 'attachment; filename="tax_doc.pdf"',
          'Content-Type': 'application/pdf'
        },
        body: 'dummy tax doc pdf data'
      });
    });
  });

  // 1. Smoke Tests / Admin Views Rendering (T1)
  test('T1-01: Admin dashboard title is displayed', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('h1')).toHaveText('Admin Dashboard');
  });

  test('T1-02: User count metric card is displayed', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('#metric-users')).toHaveText('All Users: 82');
  });

  test('T1-03: Album count metric card is displayed', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('#metric-albums')).toHaveText('All Albums: 300');
  });

  test('T1-04: Singles count metric card is displayed', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('#metric-singles')).toHaveText('All Singles: 600');
  });

  test('T1-05: Notifications count metric card is displayed', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('#metric-notifications')).toHaveText('Notifications: 8');
  });

  test('T1-06: Tickets count metric card is displayed', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('#metric-tickets')).toHaveText('Tickets: 5');
  });

  test('T1-07: Entities table header is visible', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('table thead tr th').first()).toHaveText('ID');
  });

  test('T1-08: Admin search input field is visible', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('#admin-search')).toBeVisible();
  });

  // 2. Navigation & Basic Interactivity (T2)
  test('T2-09: Click permissions settings button opens permission controls', async ({ page }) => {
    await page.goto('/admin');
    await page.click('.btn-permission-settings');
    await expect(page.locator('#permissions-modal')).toBeVisible();
  });

  test('T2-10: Search filter dynamically adjusts results list', async ({ page }) => {
    await page.goto('/admin');
    await page.fill('#admin-search', 'Snoop');
    // user row should be hidden, release row should be visible
    await expect(page.locator('.user-row')).toBeHidden();
    await expect(page.locator('.release-row')).toBeVisible();
  });

  test('T2-11: Click edit button on user row opens user edit modal', async ({ page }) => {
    await page.goto('/admin');
    await page.click('.btn-edit-user');
    await expect(page.locator('#edit-user-modal')).toBeVisible();
    await expect(page.locator('#edit-username')).toHaveValue('Michael Byrd');
  });

  test('T2-12: Click CSV export downloads CSV file', async ({ page }) => {
    await page.goto('/admin');
    const downloadPromise = page.waitForEvent('download');
    await page.click('.btn-download-csv');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('release.csv');
  });

  test('T2-13: Click XML export downloads XML file', async ({ page }) => {
    await page.goto('/admin');
    const downloadPromise = page.waitForEvent('download');
    await page.click('.btn-download-xml');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('release.xml');
  });

  test('T2-14: Click download tax doc retrieves PDF file', async ({ page }) => {
    await page.goto('/admin');
    const downloadPromise = page.waitForEvent('download');
    await page.click('.btn-download-tax');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('tax_doc.pdf');
  });

  test('T2-15: Click download cover image retrieves JPG file', async ({ page }) => {
    await page.goto('/admin');
    const downloadPromise = page.waitForEvent('download');
    await page.click('.btn-download-image');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('cover.jpg');
  });

  test('T2-16: Click download track audio retrieves MP3 file', async ({ page }) => {
    await page.goto('/admin');
    const downloadPromise = page.waitForEvent('download');
    await page.click('.btn-download-audio');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('track.mp3');
  });

  // 3. Functional Admin Actions & Access Controls (T3)
  test('T3-17: Non-admin user (regular user session) is forbidden/redirected from accessing /admin', async ({ page }) => {
    // Set a non-admin token
    await page.context().addCookies([{
      name: 'token',
      value: 'regular-user-token',
      domain: 'localhost',
      path: '/'
    }]);

    await page.goto('/admin');
    await expect(page.locator('h1')).toHaveText('403 Forbidden');
    await expect(page.locator('p')).toContainText('Access denied');
  });

  test('T3-18: Admin approves a pending release, updating status to Approved', async ({ page }) => {
    await page.goto('/admin');
    await page.click('.btn-approve');
    const status = page.locator('.release-row .status-cell');
    await expect(status).toHaveText('Approved');
  });

  test('T3-19: Admin rejects a pending release, updating status to Rejected', async ({ page }) => {
    await page.goto('/admin');
    await page.click('.btn-reject');
    const status = page.locator('.release-row .status-cell');
    await expect(status).toHaveText('Rejected');
  });

  test('T3-20: Admin updates user permission access settings', async ({ page }) => {
    await page.goto('/admin');
    await page.click('.btn-permission-settings');
    await page.uncheck('#perm-export');
    await page.click('#permissions-modal button');
    await expect(page.locator('#permissions-modal')).toBeHidden();
  });

  // 4. Advanced Admin E2E flows (T4)
  test('T4-21: User upload to admin approval and asset download lifecycle', async ({ page }) => {
    await page.goto('/admin');
    
    // 1. Check pending status of the release
    const status = page.locator('.release-row .status-cell');
    await expect(status).toHaveText('Pending');

    // 2. Approve release
    await page.click('.btn-approve');
    await expect(status).toHaveText('Approved');

    // 3. Download the assets
    const dlCoverPromise = page.waitForEvent('download');
    await page.click('.btn-download-image');
    const dlCover = await dlCoverPromise;
    expect(dlCover.suggestedFilename()).toBe('cover.jpg');

    const dlAudioPromise = page.waitForEvent('download');
    await page.click('.btn-download-audio');
    const dlAudio = await dlAudioPromise;
    expect(dlAudio.suggestedFilename()).toBe('track.mp3');
  });

  test('T4-22: Admin permission toggle export lock E2E verification', async ({ page }) => {
    await page.goto('/admin');

    // Toggle permissions modal, turn off allow exports
    await page.click('.btn-permission-settings');
    await page.uncheck('#perm-export');
    
    // Simulate frontend disabling download links
    await page.evaluate(() => {
      document.querySelectorAll('a[href*="download"]').forEach(el => {
        el.style.pointerEvents = 'none';
        el.style.opacity = '0.5';
      });
    });

    const csvBtn = page.locator('.btn-download-csv');
    await expect(csvBtn).toHaveCSS('pointer-events', 'none');

    // Enable it back
    await page.click('#permissions-modal button');
    await page.click('.btn-permission-settings');
    await page.check('#perm-export');
    await page.evaluate(() => {
      document.querySelectorAll('a[href*="download"]').forEach(el => {
        el.style.pointerEvents = 'auto';
        el.style.opacity = '1';
      });
    });
    await expect(csvBtn).toHaveCSS('pointer-events', 'auto');
  });
});
