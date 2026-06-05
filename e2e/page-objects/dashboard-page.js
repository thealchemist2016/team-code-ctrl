class DashboardPage {
  constructor(page) {
    this.page = page;
    this.balanceBadge = page.locator('.balance-badge');
    this.submitReleaseLink = page.locator('a[href*="release"], button:has-text("Release")');
    this.allReleasesCount = page.locator('.releases-count-all');
    this.pendingReleasesCount = page.locator('.releases-count-pending');
    this.withdrawalButton = page.locator('button:has-text("Withdraw"), button:has-text("withdrawal")');

    // Submit Release form selectors
    this.albumNameInput = page.locator('input[name="albumName"], #albumName');
    this.artistInput = page.locator('input[name="artist"], #artist');
    this.numberOfTracksInput = page.locator('input[name="numberOfTracks"], #numberOfTracks');
    this.coverInput = page.locator('input[type="file"]');
    this.submitAlbumButton = page.locator('button:has-text("Continue to Tracks"), button[type="submit"]');

    this.trackTitleInput = page.locator('input[name="title"], #title');
    this.audioInput = page.locator('input[type="file"]');
    this.submitTrackButton = page.locator('button:has-text("Submit"), button[type="submit"]');

    // Profile selectors
    this.profileLink = page.locator('a:has-text("Profile"), a[href*="profile"]');
    this.addressInput = page.locator('input[name="address"], #address');
    this.bankInfoInput = page.locator('input[name="bankInfo"], #bankInfo');
    this.taxDocInput = page.locator('input[name="taxDoc"], #taxDoc');
    this.saveProfileButton = page.locator('button:has-text("Save"), button[type="submit"]');

    // Withdrawal selectors
    this.withdrawLink = page.locator('a:has-text("Balance"), a[href*="balance"], a[href*="withdraw"]');
    this.withdrawAmountInput = page.locator('input[name="amount"], #withdrawAmount');
    this.paypalEmailInput = page.locator('input[name="paypalEmail"], #paypalEmail');
    this.submitWithdrawalButton = page.locator('button:has-text("Request Withdrawal"), button[type="submit"]');

    // Support Ticket selectors
    this.contactLink = page.locator('a:has-text("Contact"), a[href*="contact"], a[href*="tickets"]');
    this.ticketSubjectInput = page.locator('input[name="subject"], #ticketSubject');
    this.ticketMessageInput = page.locator('textarea[name="message"], #ticketMessage');
    this.submitTicketButton = page.locator('button:has-text("Submit Ticket"), button[type="submit"]');
  }

  async navigate() {
    await this.page.goto('/dashboard');
  }

  async submitRelease(metadata, coverPath, trackPath) {
    // 1. Fill out add-album form
    await this.page.goto('/add-album');
    await this.albumNameInput.fill(metadata.albumName);
    await this.artistInput.fill(metadata.artist);
    await this.numberOfTracksInput.fill(String(metadata.numberOfTracks));
    if (coverPath) {
      await this.coverInput.setInputFiles(coverPath);
    }
    await this.submitAlbumButton.click();

    // 2. Fill out add-track form (after redirect or navigation)
    await this.page.waitForURL(/.*add-track.*/);
    await this.trackTitleInput.fill(metadata.trackTitle || 'Track 1');
    if (trackPath) {
      await this.audioInput.setInputFiles(trackPath);
    }
    await this.submitTrackButton.click();
  }

  async submitTicket(subject, message) {
    if (await this.contactLink.isVisible()) {
      await this.contactLink.click();
    } else {
      await this.page.goto('/tickets');
    }
    await this.ticketSubjectInput.fill(subject);
    await this.ticketMessageInput.fill(message);
    await this.submitTicketButton.click();
  }

  async uploadTaxDoc(filePath) {
    if (await this.profileLink.isVisible()) {
      await this.profileLink.click();
    } else {
      await this.page.goto('/profile');
    }
    await this.taxDocInput.setInputFiles(filePath);
    await this.saveProfileButton.click();
  }

  async updateProfile(address, bankInfo) {
    if (await this.profileLink.isVisible()) {
      await this.profileLink.click();
    } else {
      await this.page.goto('/profile');
    }
    await this.addressInput.fill(address);
    await this.bankInfoInput.fill(bankInfo);
    await this.saveProfileButton.click();
  }

  async submitWithdrawal(amount, paypalEmail) {
    if (await this.withdrawLink.isVisible()) {
      await this.withdrawLink.click();
    } else {
      await this.page.goto('/balance');
    }
    await this.withdrawAmountInput.fill(String(amount));
    await this.paypalEmailInput.fill(paypalEmail);
    await this.submitWithdrawalButton.click();
  }
}

module.exports = { DashboardPage };
