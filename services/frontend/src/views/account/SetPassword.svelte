<script>
    import NotificationDisplay from '_partials/displays/NotificationDisplay.svelte';
    import SetPasswordInput from '_partials/controls/SetPasswordInput.svelte';
    import purifyHtml from '@datawrapper/shared/purifyHtml.js';
    import { createEventDispatcher } from 'svelte';

    import { getContext } from 'svelte';
    const msg = getContext('messages');
    function createTranslate(msg, messages) {
        return (key, scope = 'core', replacements) =>
            msg.translate(key, scope, messages, replacements);
    }
    $: __ = createTranslate(msg, $msg);

    export let headlineText;
    export let headlineTextBold = false;
    export let introText;
    export let buttonText;
    export let email;
    export let submitError;
    export let submitting;

    let password;
    let passwordOk;

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
    {@html purifyHtml(headlineText)}
</h2>
<p class="intro-p mb-3">{introText}</p>

{#if submitError}
    <NotificationDisplay type="warning" deletable={false}>
        {@html purifyHtml(submitError)}
    </NotificationDisplay>
{/if}

<div class="reset-form">
    <SetPasswordInput {__} bind:value={password} bind:ok={passwordOk} />

    <div class="field">
        <div class="control-group login-help">
            {#if email}
                {@html __('account / invite / your-login-is', 'core', {
                    s: `<span class="email" style="color: #222">${email}</span>`
                })}
            {/if}
        </div>
    </div>

    <button class="button is-primary" on:click={submit} disabled={submitting || !passwordOk}>
        {@html purifyHtml(buttonText)}
    </button>
</div>
