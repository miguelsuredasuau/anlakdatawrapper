function visitSigninPage() {
    return browser.url('/signin/');
}

function getEmailProviderButton() {
    return $('button.provider-email');
}

function getEmailInput() {
    return $('input#si-email');
}

function getPasswordInput() {
    return $('input#si-pwd');
}

function getLoginButton() {
    return $('.button.is-primary.mb-2'); // TODO Use `[data-uid="login"]` once staging supports it.
}

describe('login and logout', () => {
    let dwConfig;

    before(async () => {
        await browser.logIP();
        dwConfig = await browser.getDwConfig();
    });

    it('redirects the user to the signin page if they are logged out', async () => {
        await browser.logout(); // Make sure the user is logged out, if another test case logged the user in.
        await browser.url('/');
        await browser.waitForUrl('/signin/?ref=/');

        // Then it shows the email provider button or login form.
        if (dwConfig.frontend.signinProviders?.length) {
            await expect(getEmailProviderButton()).toBeDisplayed();
        } else {
            await expect(getEmailInput()).toBeDisplayed();
            await expect(getPasswordInput()).toBeDisplayed();
            await expect(getLoginButton()).toBeDisplayed();
        }
    });

    it('logs the user in with valid credentials', async () => {
        const email = process.env.DW_USER;
        const password = process.env.DW_PASS;
        await visitSigninPage();
        if (dwConfig.frontend.signinProviders?.length) {
            await getEmailProviderButton().click();
        }
        await getEmailInput().setValue(email);
        await getPasswordInput().setValue(password);
        await expect(getLoginButton()).toBeEnabled();
        await getLoginButton().click();
        await browser.waitForUrl('/', 20000);

        // Then it logs the user out and sets the ref parameter.
        await browser.url('/archive/recently-edited');
        const $dropdown = await $('.nav-item-more'); // TODO Use `[data-uid="settings"]` once staging supports it.
        await expect($dropdown).toBeDisplayed();
        await $dropdown.click();
        const $logout = await $('a[href="#/logout"]');
        await expect($logout).toBeDisplayed();
        await $logout.click();
        await browser.waitForUrl('/signin/?ref=/archive/recently-edited');
    });
});
