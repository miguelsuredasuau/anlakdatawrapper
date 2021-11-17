<script>
    import SignInPageLayout from '_layout/SignInPageLayout.svelte';
    import SignUpForm from './SignUpForm.svelte';

    export let __;
    export let target;
    export let providers;
    export let noSignUp;
    export let signupWithoutPassword = false;
</script>

<SignInPageLayout title="Welcome">
    <SignUpForm {__} {target} {providers} {noSignUp} {signupWithoutPassword} />
</SignInPageLayout>
