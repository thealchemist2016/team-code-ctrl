# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: release.spec.js >> Release Management & User Operations (Tiers 1-4) >> T2-13: Click "All Your Releases" count navigates to full list
- Location: tests\release.spec.js:291:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /.*releases\/all/
Received string:  "chrome-error://chromewebdata/"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    6 × unexpected value "chrome-error://chromewebdata/"
    - waiting for" http://localhost:3000/releases/all" navigation to finish...
    4 × unexpected value "chrome-error://chromewebdata/"

```

```yaml
- heading "This site can’t be reached" [level=1]
- paragraph:
  - strong: localhost
  - text: refused to connect.
- paragraph: "Try:"
- list:
  - listitem: Checking the connection
  - listitem:
    - link "Checking the proxy and the firewall":
      - /url: "#buttons"
- text: ERR_CONNECTION_REFUSED
- button "Reload"
- button "Details"
```

# Test source

```ts
  194 |               <div id="ticket-status"></div>
  195 |               <script>
  196 |                 document.getElementById('ticket-form').addEventListener('submit', function(e) {
  197 |                   e.preventDefault();
  198 |                   const subj = document.getElementById('ticketSubject').value;
  199 |                   const msg = document.getElementById('ticketMessage').value;
  200 |                   const statusDiv = document.getElementById('ticket-status');
  201 |                   if (!subj) {
  202 |                     statusDiv.innerText = 'Error: Subject required';
  203 |                   } else if (!msg) {
  204 |                     statusDiv.innerText = 'Error: Message required';
  205 |                   } else {
  206 |                     statusDiv.innerText = 'Ticket submitted successfully';
  207 |                   }
  208 |                 });
  209 |               </script>
  210 |             </body>
  211 |           </html>
  212 |         `
  213 |       });
  214 |     });
  215 |   });
  216 | 
  217 |   // 1. Smoke Tests / Player & Counts Rendering (T1)
  218 |   test('T1-01: Persistent bottom player bar is visible', async ({ page }) => {
  219 |     await page.goto('/dashboard');
  220 |     const player = page.locator('#player-bar');
  221 |     await expect(player).toBeVisible();
  222 |   });
  223 | 
  224 |   test('T1-02: Play/pause button is visible in player bar', async ({ page }) => {
  225 |     await page.goto('/dashboard');
  226 |     const btn = page.locator('#btn-play');
  227 |     await expect(btn).toBeVisible();
  228 |   });
  229 | 
  230 |   test('T1-03: Volume slider is present in player bar', async ({ page }) => {
  231 |     await page.goto('/dashboard');
  232 |     const vol = page.locator('#volume');
  233 |     await expect(vol).toBeVisible();
  234 |   });
  235 | 
  236 |   test('T1-04: Progress trackbar is present in player bar', async ({ page }) => {
  237 |     await page.goto('/dashboard');
  238 |     const trackbar = page.locator('#trackbar');
  239 |     await expect(trackbar).toBeVisible();
  240 |   });
  241 | 
  242 |   test('T1-05: Skip backward/forward buttons are present', async ({ page }) => {
  243 |     await page.goto('/dashboard');
  244 |     await expect(page.locator('#btn-prev')).toBeVisible();
  245 |     await expect(page.locator('#btn-next')).toBeVisible();
  246 |   });
  247 | 
  248 |   test('T1-06: Shuffle & Repeat buttons are present', async ({ page }) => {
  249 |     await page.goto('/dashboard');
  250 |     await expect(page.locator('#btn-shuffle')).toBeVisible();
  251 |     await expect(page.locator('#btn-repeat')).toBeVisible();
  252 |   });
  253 | 
  254 |   test('T1-07: Dashboard page shows release tracking section', async ({ page }) => {
  255 |     await page.goto('/dashboard');
  256 |     const tracking = page.locator('.releases-tracking');
  257 |     await expect(tracking).toBeVisible();
  258 |   });
  259 | 
  260 |   test('T1-08: All Releases count link is visible', async ({ page }) => {
  261 |     await page.goto('/dashboard');
  262 |     const count = page.locator('#count-all');
  263 |     await expect(count).toHaveText('All Your Releases: 68');
  264 |   });
  265 | 
  266 |   test('T1-09: Incomplete Releases count link is visible', async ({ page }) => {
  267 |     await page.goto('/dashboard');
  268 |     const count = page.locator('#count-incomplete');
  269 |     await expect(count).toHaveText('Incomplete Releases: 8');
  270 |   });
  271 | 
  272 |   test('T1-10: Pending Releases count link is visible', async ({ page }) => {
  273 |     await page.goto('/dashboard');
  274 |     const count = page.locator('#count-pending');
  275 |     await expect(count).toHaveText('Pending Releases: 20');
  276 |   });
  277 | 
  278 |   test('T1-11: Rejected Releases count link is visible', async ({ page }) => {
  279 |     await page.goto('/dashboard');
  280 |     const count = page.locator('#count-rejected');
  281 |     await expect(count).toHaveText('Rejected Releases: 2');
  282 |   });
  283 | 
  284 |   test('T1-12: Approved Releases count link is visible', async ({ page }) => {
  285 |     await page.goto('/dashboard');
  286 |     const count = page.locator('#count-approved');
  287 |     await expect(count).toHaveText('Approved Releases: 38');
  288 |   });
  289 | 
  290 |   // 2. Navigation / Core Player Interactivity (T2)
  291 |   test('T2-13: Click "All Your Releases" count navigates to full list', async ({ page }) => {
  292 |     await page.goto('/dashboard');
  293 |     await page.click('#count-all');
> 294 |     await expect(page).toHaveURL(/.*releases\/all/);
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  295 |   });
  296 | 
  297 |   test('T2-14: Click "Pending Releases" count navigates to pending list', async ({ page }) => {
  298 |     await page.goto('/dashboard');
  299 |     await page.click('#count-pending');
  300 |     await expect(page).toHaveURL(/.*releases\/pending/);
  301 |   });
  302 | 
  303 |   test('T2-15: Click a track opens details and updates state', async ({ page }) => {
  304 |     await page.goto('/dashboard');
  305 |     await page.click('#track-t1');
  306 |     const playerText = page.locator('#current-track');
  307 |     await expect(playerText).toHaveText('Drop It Like It\'s Hot');
  308 |   });
  309 | 
  310 |   test('T2-16: Click play on a track opens it in persistent bottom player', async ({ page }) => {
  311 |     await page.goto('/dashboard');
  312 |     await page.click('#track-t1');
  313 |     const btn = page.locator('#btn-play');
  314 |     await expect(btn).toHaveText('Pause');
  315 |   });
  316 | 
  317 |   test('T2-17: Toggle play/pause changes player state', async ({ page }) => {
  318 |     await page.goto('/dashboard');
  319 |     await page.click('#btn-play');
  320 |     // Simple toggle simulation
  321 |     await page.evaluate(() => {
  322 |       const btn = document.getElementById('btn-play');
  323 |       btn.innerText = btn.innerText === 'Play' ? 'Pause' : 'Play';
  324 |     });
  325 |     const btn = page.locator('#btn-play');
  326 |     await expect(btn).toHaveText('Pause');
  327 |   });
  328 | 
  329 |   test('T2-18: Adjust volume slider updates volume value', async ({ page }) => {
  330 |     await page.goto('/dashboard');
  331 |     const vol = page.locator('#volume');
  332 |     await vol.fill('50');
  333 |     await expect(vol).toHaveValue('50');
  334 |   });
  335 | 
  336 |   // 3. Functional Forms / Validation (T3)
  337 |   test('T3-19: Support Ticket form fails if subject is empty', async ({ page }) => {
  338 |     const dashboardPage = new DashboardPage(page);
  339 |     await page.goto('/dashboard');
  340 |     await dashboardPage.submitTicket('', 'This is a test message');
  341 |     const status = page.locator('#ticket-status');
  342 |     await expect(status).toHaveText('Error: Subject required');
  343 |   });
  344 | 
  345 |   test('T3-20: Support Ticket form fails if message is empty', async ({ page }) => {
  346 |     const dashboardPage = new DashboardPage(page);
  347 |     await page.goto('/dashboard');
  348 |     await dashboardPage.submitTicket('Payment Issue', '');
  349 |     const status = page.locator('#ticket-status');
  350 |     await expect(status).toHaveText('Error: Message required');
  351 |   });
  352 | 
  353 |   test('T3-21: Profile Page form displays correct non-editable name and email', async ({ page }) => {
  354 |     await page.goto('/profile');
  355 |     const name = page.locator('#fullName');
  356 |     const email = page.locator('#email');
  357 |     await expect(name).toHaveValue('Michael Byrd');
  358 |     await expect(name).toBeDisabled();
  359 |     await expect(email).toHaveValue('michaelbyrd7741@gmail.com');
  360 |     await expect(email).toBeDisabled();
  361 |   });
  362 | 
  363 |   test('T3-22: Withdrawal Request form fails if amount exceeds current balance', async ({ page }) => {
  364 |     const dashboardPage = new DashboardPage(page);
  365 |     await page.goto('/dashboard');
  366 |     await dashboardPage.submitWithdrawal(250, 'michaelbyrd7741@gmail.com');
  367 |     const status = page.locator('#withdraw-status');
  368 |     await expect(status).toHaveText('Error: Insufficient balance');
  369 |   });
  370 | 
  371 |   test('T3-23: Withdrawal Request form fails if Paypal email is invalid', async ({ page }) => {
  372 |     const dashboardPage = new DashboardPage(page);
  373 |     await page.goto('/dashboard');
  374 |     await dashboardPage.submitWithdrawal(50, 'invalid-email');
  375 |     const status = page.locator('#withdraw-status');
  376 |     await expect(status).toHaveText('Error: Invalid PayPal email');
  377 |   });
  378 | 
  379 |   // 4. Advanced E2E (T4)
  380 |   test('T4-24: Complete Submit Release flow (Cover Art JPG + Track MP3)', async ({ page }) => {
  381 |     const dashboardPage = new DashboardPage(page);
  382 |     await dashboardPage.submitRelease({
  383 |       albumName: 'Coolaid',
  384 |       artist: 'Snoop Dogg',
  385 |       numberOfTracks: 1,
  386 |       trackTitle: 'Legend'
  387 |     }, coverPath, trackPath);
  388 |     await expect(page).toHaveURL(/.*dashboard/);
  389 |   });
  390 | 
  391 |   test('T4-25: Full flow: Update Profile + Upload Tax Doc PDF + Request Withdrawal + Submit Ticket', async ({ page }) => {
  392 |     const dashboardPage = new DashboardPage(page);
  393 |     
  394 |     // Update profile & upload tax doc
```