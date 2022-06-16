<script>
    import SignInPageLayout from '_layout/SignInPageLayout.svelte';
    import SignUpForm from './SignUpForm.svelte';

    export let __;
    export let target;
    export let providers;
    export let noSignUp;
    export let signupWithoutPassword = false;
    export let email;
    export let passwordChanged;
</script>

<SignInPageLayout title="Welcome">
    <SignUpForm
        {__}
        {target}
        {providers}
        {noSignUp}
        {signupWithoutPassword}
        {email}
        {passwordChanged}
    />
</SignInPageLayout>
