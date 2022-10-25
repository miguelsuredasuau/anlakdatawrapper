<script>
    import httpReq from '@datawrapper/shared/httpReq.js';
    import SignInPageLayout from '_layout/SignInPageLayout.svelte';
    import SetPassword from './SetPassword.svelte';

    export let token;
    export let email;
    export let chart;
    export let __;
    export let headlineText;
    export let introText;
    export let buttonText;

    let submitting;
    let submitError;
    const headlineTextBold = false;

    async function handleSubmit(event) {
        const password = event.detail.password;

        submitting = true;

        try {
            await httpReq.post(`/v3/auth/activate/${token}`, {
                payload: {
                    password
                }
            });
            setTimeout(() => {
                if (chart) {
                    window.location.href = `/chart/${chart}/edit`;
                } else {
                    window.location.href = '/';
                }
            }, 400);
        } catch (error) {
            submitting = false;

            if (error.name === 'HttpReqError') {
                const body = await error.response.json();
                submitError = body ? body.message : error.message;
            } else {
                submitError = error;
            }
        }
    }
</script>

<SignInPageLayout title={__('invite / h1 / chart')}>
    <SetPassword
        {headlineText}
        {headlineTextBold}
        {introText}
        {buttonText}
        {email}
        bind:submitError
        bind:submitting
        on:submit={handleSubmit}
    />
</SignInPageLayout>
