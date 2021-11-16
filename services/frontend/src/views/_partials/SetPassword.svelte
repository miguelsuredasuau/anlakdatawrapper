<script>
    import NotificationDisplay from '_partials/displays/NotificationDisplay.svelte';
    import CheckPassword from '../shared/CheckPassword.svelte';
    import { createEventDispatcher } from 'svelte';

    import { getContext } from 'svelte';
    const messages = getContext('messages');
    export let __;
    $: {
        __ = (key, scope = 'core') => messages.translate(key, scope, $messages);
    }

    export let headlineText;
    export let headlineTextBold = false;
    export let introText;
    export let buttonText;
    export let email;
    export let submitError;
    export let submitting;

    let password;
    let passwordClear = false;
    let passwordOk;
    let passwordHelp;
    let passwordSuccess;
    let passwordError;

    const dispatch = createEventDispatcher();

    function submit() {
        dispatch('submit', {
            password: password
        });
    }
</script>

<style lang="scss">
    @import 'bulma/sass/utilities/_all.sass';
    @include desktop {
        .intro-p {
            max-width: 75%;
        }
    }

    .reset-form {
        max-width: 300px;
    }

    .login-help {
        color: #999;
        padding-top: 10px;
    }
</style>

<h2 class="title is-3" class:has-text-weight-normal={!headlineTextBold}>
    {@html headlineText}
</h2>
<p class="intro-p mb-3">{introText}</p>

{#if submitError}
    <NotificationDisplay type="warning" deletable={false}>
        {@html submitError}
    </NotificationDisplay>
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
        <div class="control-group login-help">
            {#if email}
                {@html __('account / invite / your-login-is').replace(
                    '%s',
                    `<span class="email" style="color: #222">${email}</span>`
                )}
            {/if}
        </div>
    </div>

    <button class="button is-primary" on:click={submit} disabled={submitting || !passwordOk}>
        {@html buttonText}
    </button>
</div>
