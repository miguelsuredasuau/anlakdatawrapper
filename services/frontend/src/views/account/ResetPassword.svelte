<script>
    import httpReq from '@datawrapper/shared/httpReq.js';
    import purifyHtml from '@datawrapper/shared/purifyHtml.js';
    import SignInPageLayout from '_layout/SignInPageLayout.svelte';
    import NotificationDisplay from '_partials/displays/NotificationDisplay.svelte';
    import SetPasswordInput from '_partials/controls/SetPasswordInput.svelte';

    export let token;
    export let __;

    let password;
    let passwordOk;
    let submitting;

    let resetSuccess;
    let resetError;

    async function submit() {
        submitting = true;

        try {
            await httpReq.post('/v3/auth/change-password', {
                payload: {
                    token,
                    password
                }
            });

            resetSuccess = true;
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } catch (error) {
            submitting = false;

            if (error.name === 'HttpReqError') {
                const body = await error.response.json();
                resetError = body ? body.message : error.message;
            } else {
                resetError = error;
            }
        }
    }
</script>

<style>
    .reset-form {
        max-width: 300px;
    }
</style>

<SignInPageLayout title={__('account / password-reset / headline')}>
    <h2 class="title is-3">{__('account / password-reset / headline')}</h2>
    <p class="mb-3">{__('account / password-reset / intro')}</p>

    {#if resetSuccess}
        <NotificationDisplay type="success" deletable={false}>
            {__('account / password-reset / success')}
        </NotificationDisplay>
    {:else if resetError}
        <NotificationDisplay type="warning" deletable={false}>
            {@html purifyHtml(resetError)}
        </NotificationDisplay>
    {/if}

    <div class="reset-form">
        <SetPasswordInput bind:value={password} bind:ok={passwordOk} {__} />

        <button class="button is-primary" on:click={submit} disabled={submitting || !passwordOk}>
            {__('account / password-reset / button')}
        </button>
    </div>
</SignInPageLayout>
