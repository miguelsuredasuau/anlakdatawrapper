<script>
    import httpReq from '@datawrapper/shared/httpReq.js';
    import purifyHtml from '@datawrapper/shared/purifyHtml.js';
    import MessageDisplay from '_partials/displays/MessageDisplay.svelte';
    import LoadingSpinnerDisplay from '_partials/displays/LoadingSpinnerDisplay.svelte';
    import ProviderButtons from './ProviderButtons.svelte';
    import { isValidEmail } from './utils';

    export let __;
    export let step;
    export let target = '/';
    export let emailOpen;
    export let providers;
    export let noSignUp;
    export let email = '';
    export let passwordChanged;

    let password = '';
    let rememberLogin = true;

    let loginSuccess;
    let loginError;
    let loggingIn = false;

    // otp stuff
    let needOTP = false;
    let loginOTP;

    let resetPassword = false;
    let requestingPassword = false;

    async function doLogIn() {
        loginError = loginSuccess = '';
        loggingIn = true;

        try {
            await httpReq.post('/v3/auth/login', {
                payload: {
                    email,
                    password,
                    keepSession: rememberLogin,
                    ...(loginOTP ? { otp: loginOTP } : {})
                }
            });
            needOTP = false;
            loginSuccess = __('signin / login-success');
            loginOTP = '';
            setTimeout(() => {
                window.window.location.href = target;
                loggingIn = false;
            }, 2000);
        } catch (error) {
            loggingIn = false;
            if (error.name === 'HttpReqError') {
                const body = await error.response.json();
                if (body.statusCode === 401 && body.message === 'Need OTP') {
                    needOTP = true;
                    loginOTP = '';
                    return;
                }
                loginError = body ? body.message : error.message;
            } else {
                loginError = error;
            }
        }
    }

    async function doResetPassword() {
        requestingPassword = true;
        loginError = loginSuccess = '';
        try {
            await httpReq.post('/v3/auth/reset-password', {
                payload: {
                    email
                }
            });
            loginSuccess = __('signin / password-reset / success');
        } catch (error) {
            if (error.name === 'HttpReqError') {
                const body = await error.response.json();
                const errMsgKey = `signin / password-reset / error / ${body.message}`;
                loginError = body.message
                    ? __(errMsgKey) !== errMsgKey
                        ? __(errMsgKey)
                        : body.message
                    : error.message;
            } else {
                loginError = error;
            }
        }
        requestingPassword = false;
    }

    function handleSubmit() {
        if (resetPassword) {
            doResetPassword();
        } else {
            doLogIn();
        }
    }
</script>

<div>
    <h2 class="title is-3">{@html __('login / login / headline')}</h2>
    {#if passwordChanged}
        <MessageDisplay type="success" deletable={false}
            >{@html __('login / login / password-changed')}</MessageDisplay
        >
    {:else}
        <p>{@html __('login / login / intro')}</p>
    {/if}
    {#if emailOpen}
        {#if loginError || loginSuccess}
            <MessageDisplay type={loginError ? 'warning' : 'success'} deletable={false}>
                {@html purifyHtml(loginError || loginSuccess)}
            </MessageDisplay>
        {/if}
        <form class="signup-form" on:submit|preventDefault={handleSubmit}>
            {#if !needOTP}
                <div class="field">
                    <label for="si-email" class="label">{__('email')}</label>
                    <input
                        id="si-email"
                        placeholder="name@example.com"
                        class="input"
                        class:is-danger={email && !isValidEmail(email)}
                        bind:value={email}
                        required
                        type="email"
                    />
                </div>
                {#if !resetPassword}
                    <div class="field">
                        <label for="si-pwd" class="label">{__('password')}</label>
                        <input id="si-pwd" bind:value={password} class="input" type="password" />
                    </div>
                    <div class="field">
                        <label class="checkbox"
                            ><input bind:checked={rememberLogin} type="checkbox" />
                            {@html __('Remember login')}</label
                        >
                    </div>
                {/if}
            {:else}
                <p>{__('signin / enter-otp')}</p>
                <div class="field">
                    <!-- svelte-ignore a11y-autofocus -->
                    <input
                        id="otp"
                        data-lpignore="true"
                        autofocus
                        bind:value={loginOTP}
                        class="input"
                        autocomplete="off"
                        type="text"
                        required
                    />
                </div>
            {/if}
            {#if !resetPassword}
                <button
                    type="submit"
                    disabled={loggingIn}
                    class="button is-primary mb-2"
                    data-uid="login"
                >
                    {@html __('Login')}
                    {#if loggingIn}<LoadingSpinnerDisplay className="ml-1" />{/if}
                </button>
                <div class="mt-3">
                    <a
                        on:click|preventDefault={() => (resetPassword = true)}
                        href="#/forgot-password">{@html __("Can't recall your password?")}</a
                    >
                </div>
                {#if providers.length}
                    <div class="mt-5">
                        <a href="#/back" on:click|preventDefault={() => (emailOpen = false)}>
                            ←&nbsp;&nbsp;{__('signin / choose-different-provider')}</a
                        >
                    </div>
                {/if}
            {:else}
                <button type="submit" disabled={requestingPassword} class="button is-primary mb-2">
                    {@html __('Send new password')}
                    {#if requestingPassword}<LoadingSpinnerDisplay className="ml-1" />{/if}
                </button>
                <div class="mt-3">
                    <a on:click|preventDefault={() => (resetPassword = false)} href="#/return"
                        >{@html __('Return to login...')}</a
                    >
                </div>
            {/if}
        </form>
    {:else}
        <ProviderButtons {__} {target} {providers} bind:emailOpen signIn={true} />
    {/if}

    {#if !noSignUp}
        <hr />
        <p class="mt-3">
            <strong>{__('signin / no-account-yet')}</strong><br />
            <a
                href="#/signin"
                class="has-text-weight-bold"
                on:click|preventDefault={() => {
                    step = 'signup';
                }}>{__('signup / create-account')}</a
            >
            {@html __('signup / or-try-free')}.
        </p>
    {/if}
</div>
