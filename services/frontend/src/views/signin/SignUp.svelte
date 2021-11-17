<script>
    import httpReq from '@datawrapper/shared/httpReq';
    import NotificationDisplay from '_partials/displays/NotificationDisplay.svelte';
    import LoadingSpinnerDisplay from '_partials/displays/LoadingSpinnerDisplay.svelte';
    import SetPasswordInput from '_partials/controls/SetPasswordInput.svelte';
    import ProviderButtons from './ProviderButtons.svelte';
    import { trackEvent } from '@datawrapper/shared/analytics';
    import { isValidEmail } from './utils';

    export let __;
    export let target;
    export let step;
    export let email;
    export let signupWithoutPassword;
    export let providers;
    export let emailOpen;
    export let password = '';
    export let noSignIn;

    let signingUp;
    let signupSuccess;
    let signupError;

    let passwordOk;

    async function doSignUp() {
        if (signingUp) return;
        // reset messages
        signingUp = true;
        signupError = signupSuccess = '';
        try {
            await httpReq.post('/v3/auth/signup', {
                payload: {
                    email,
                    invitation: signupWithoutPassword,
                    password: !signupWithoutPassword ? password : undefined
                }
            });

            trackEvent('App', 'sign-up');

            if (!signupWithoutPassword) {
                signupSuccess = __('signin / signup-success');
                setTimeout(() => {
                    window.location.href = target;
                }, 2000);
            } else {
                signupSuccess = __('signin / signup-check-email');
                signingUp = false;
            }
        } catch (error) {
            if (error.name === 'HttpReqError') {
                const body = await error.response.json();
                signupError = body ? body.message : error.message;
            } else {
                signupError = error;
            }
            signingUp = false;
        }
    }
</script>

<div>
    <h2 class="title is-3">{@html __('login / signup / headline')}</h2>
    <p>{@html __('login / signup / intro')}</p>

    {#if emailOpen}
        {#if signupError || signupSuccess}
            <NotificationDisplay type={signupError ? 'warning' : 'success'} deletable={false}>
                {@html signupError || signupSuccess}
            </NotificationDisplay>
        {/if}
        <div class="signup-form">
            <div class="field">
                <label for="su-email" class="label">{__('email')}</label>
                <input
                    id="su-email"
                    placeholder="name@example.com"
                    class="input"
                    class:is-danger={email && !isValidEmail(email)}
                    bind:value={email}
                    type="email"
                />
            </div>

            <SetPasswordInput bind:value={password} bind:ok={passwordOk} {__} />

            <button disabled={signingUp} class="button is-primary mb-2" on:click={() => doSignUp()}>
                {@html __('Sign Up')}
                {#if signingUp}<LoadingSpinnerDisplay className="ml-1" />{/if}</button
            >
            {#if providers.length}
                <div class="mt-5">
                    <a href="#/back" on:click|preventDefault={() => (emailOpen = false)}>
                        ←&nbsp;&nbsp;{__('signin / choose-different-provider')}</a
                    >
                </div>
            {/if}
        </div>
    {:else}
        <ProviderButtons {__} {target} {providers} bind:emailOpen signIn={false} />
    {/if}

    {#if !noSignIn}
        <hr />
        <p class=" mt-3">
            <strong>{__('signin / already-have-account')}</strong><br />
            <a
                href="#/signin"
                class="has-text-weight-bold"
                on:click|preventDefault={() => {
                    step = 'login';
                }}>{__('signin / signin-here')}</a
            >.
        </p>
    {/if}
</div>
