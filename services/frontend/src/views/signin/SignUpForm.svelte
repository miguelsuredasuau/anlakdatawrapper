<script>
    import LogIn from './LogIn.svelte';
    import SignUp from './SignUp.svelte';

    export let __;
    export let target = '/';
    export let noSignUp = false;
    export let noSignIn = false;
    export let signupWithoutPassword = false;
    export let email = '';
    export let passwordChanged = false;

    export let providers;

    let step = noSignIn ? 'signup' : 'login'; // can also be 'login'

    let emailOpen = providers.length === 0 || email;
</script>

<style>
    .content :global(.signup-form) {
        max-width: 300px;
    }
</style>

<div class="content mb-0" data-piwik-mask>
    {#if step === 'signup' && !noSignUp}
        <SignUp
            {__}
            {providers}
            {target}
            {noSignIn}
            {signupWithoutPassword}
            bind:emailOpen
            bind:email
            bind:step
        />
    {:else if step === 'login' && !noSignIn}
        <LogIn
            {__}
            {providers}
            {target}
            {noSignUp}
            bind:emailOpen
            bind:email
            bind:step
            {passwordChanged}
        />
    {/if}
</div>
