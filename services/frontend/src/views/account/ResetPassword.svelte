<script>
    import httpReq from '@datawrapper/shared/httpReq';
    import SignInPageLayout from 'layout/SignInPageLayout.svelte';
    import Notification from 'layout/partials/bulma/Notification.svelte';
    import CheckPassword from '../shared/CheckPassword.svelte';

    export let token;
    export let __;

    let password;
    let submitting;
    let passwordClear = false;

    let resetSuccess;
    let resetError;

    let passwordOk;
    let passwordHelp;
    let passwordSuccess;
    let passwordError;

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
        <Notification type="success" deletable={false}>
            {__('account / password-reset / success')}
        </Notification>
    {:else if resetError}
        <Notification type="warning" deletable={false}>
            {@html resetError}
        </Notification>
    {/if}

    <div class="reset-form">
        <div class="field mb-3">
            <label for="set-pwd" class="label">{__('password')}</label>

            <!-- input types can't be dynamic when using two-way value binding -->
            {#if passwordClear}
                <input
                    id="set-pwd"
                    class="input"
                    type="text"
                    autocomplete="new-password"
                    bind:value={password}
                    class:is-danger={passwordError}
                    class:is-success={!passwordError && passwordSuccess}
                />
            {:else}
                <input
                    id="set-pwd"
                    class="input"
                    type="password"
                    autocomplete="new-password"
                    bind:value={password}
                    class:is-danger={passwordError}
                    class:is-success={!passwordError && passwordSuccess}
                />
            {/if}

            <CheckPassword
                {__}
                bind:password
                bind:passwordHelp
                bind:passwordSuccess
                bind:passwordError
                bind:passwordOk
            />

            {#if passwordError}
                <p class="help is-danger">{@html passwordError}</p>
            {:else if passwordSuccess}
                <p class="help is-success is-dark">{@html passwordSuccess}</p>
            {:else if passwordHelp}
                <p class="help has-text-grey-dark">{@html passwordHelp}</p>
            {/if}
        </div>

        <div class="field">
            <label class="checkbox">
                <input bind:checked={passwordClear} type="checkbox" />
                {@html __('account / invite / password-clear-text')}
            </label>
        </div>

        <button class="button is-primary" on:click={submit} disabled={submitting || !passwordOk}>
            {__('account / password-reset / button')}
        </button>
    </div>
</SignInPageLayout>
