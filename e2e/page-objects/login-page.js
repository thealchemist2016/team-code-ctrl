class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"], input[type="email"]');
    this.passwordInput = page.locator('input[name="password"], input[type="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    
    // Register Form Selectors
    this.fnameInput = page.locator('input[name="fname"], #fname');
    this.lnameInput = page.locator('input[name="lname"], #lname');
    this.regEmailInput = page.locator('input[name="email"], #email');
    this.usernameInput = page.locator('input[name="username"], #usename');
    this.regPasswordInput = page.locator('input[name="password"], #password');
    this.tosCheckbox = page.locator('input[name="tosAccepted"], #tosAccepted');
    this.registerSubmitButton = page.locator('button:has-text("Submit"), button[type="submit"]');

    // Logout Selector
    this.logoutButton = page.locator('a:has-text("Logout"), button:has-text("Logout"), .nav-link:has-text("Logout")');
  }

  async navigate() {
    await this.page.goto('/login');
  }

  async navigateRegister() {
    await this.page.goto('/register');
  }

  async login(emailOrUsername, password) {
    await this.emailInput.fill(emailOrUsername);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async register(fname, lname, email, username, password, acceptTos = true) {
    await this.navigateRegister();
    await this.fnameInput.fill(fname);
    await this.lnameInput.fill(lname);
    await this.regEmailInput.fill(email);
    await this.usernameInput.fill(username);
    await this.regPasswordInput.fill(password);
    if (acceptTos) {
      await this.tosCheckbox.check();
    } else {
      await this.tosCheckbox.uncheck();
    }
    await this.registerSubmitButton.click();
  }

  async logout() {
    await this.logoutButton.click();
  }
}

module.exports = { LoginPage };
