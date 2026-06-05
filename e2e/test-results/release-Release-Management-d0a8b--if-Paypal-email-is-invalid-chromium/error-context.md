# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: release.spec.js >> Release Management & User Operations (Tiers 1-4) >> T3-23: Withdrawal Request form fails if Paypal email is invalid
- Location: tests\release.spec.js:371:3

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator:  locator('#withdraw-status')
Expected: "Error: Invalid PayPal email"
Received: ""
Timeout:  5000ms

Call log:
  - Expect "toHaveText" with timeout 5000ms
  - waiting for locator('#withdraw-status')
    14 × locator resolved to <div id="withdraw-status"></div>
       - unexpected value ""

```

```yaml
- heading "Balance & Withdrawals" [level=2]
- text: "Balance: $197"
- spinbutton: "50"
- textbox: invalid-email
- button "Request Withdrawal"
```

# Test source

```ts
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
  294 |     await expect(page).toHaveURL(/.*releases\/all/);
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
> 376 |     await expect(status).toHaveText('Error: Invalid PayPal email');
      |                          ^ Error: expect(locator).toHaveText(expected) failed
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
  395 |     await dashboardPage.updateProfile('123 Music Lane', 'PayPal: michaelbyrd7741@gmail.com');
  396 |     await dashboardPage.uploadTaxDoc(taxDocPath);
  397 |     await expect(page.locator('#success')).toHaveText('Profile Updated!');
  398 |     await expect(page.locator('#tax-docs-list li')).toHaveText('tax_doc.pdf');
  399 | 
  400 |     // Submit Withdrawal
  401 |     await dashboardPage.submitWithdrawal(50, 'michaelbyrd7741@gmail.com');
  402 |     await expect(page.locator('#withdraw-status')).toHaveText('Withdrawal request submitted');
  403 | 
  404 |     // Submit Ticket
  405 |     await dashboardPage.submitTicket('Balance Issue', 'My balance shows incorrect pending balance.');
  406 |     await expect(page.locator('#ticket-status')).toHaveText('Ticket submitted successfully');
  407 |   });
  408 | });
  409 | 
```