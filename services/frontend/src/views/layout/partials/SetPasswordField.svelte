<script>
    import CheckPassword from '../../shared/CheckPassword.svelte';

    let showPassword = false;
    let help = '';
    let success = '';
    let error = '';

    export let value = '';
    export let ok = '';
    export let __;
</script>

<CheckPassword
    {__}
    bind:password={value}
    bind:passwordOk={ok}
    bind:passwordHelp={help}
    bind:passwordSuccess={success}
    bind:passwordError={error}
/>

<div class="field mb-3">
    <label for="set-pwd" class="label">{__('password')}</label>

    <!-- input types can't be dynamic when using two-way value binding -->
    {#if showPassword}
        <input
            id="set-pwd"
            class="input"
            type="text"
            autocomplete="new-password"
            class:is-danger={error}
            class:is-success={!error && success}
            bind:value
        />
    {:else}
        <input
            id="set-pwd"
            class="input"
            type="password"
            autocomplete="new-password"
            class:is-danger={error}
            class:is-success={!error && success}
            bind:value
        />
    {/if}

    {#if error}
        <p class="help is-danger">{@html error}</p>
    {:else if success}
        <p class="help is-success is-dark">{@html success}</p>
    {:else if help}
        <p class="help has-text-grey-dark">{@html help}</p>
    {/if}
</div>

<div class="field">
    <label class="checkbox">
        <input bind:checked={showPassword} type="checkbox" />
        {@html __('account / invite / password-clear-text')}
    </label>
</div>
