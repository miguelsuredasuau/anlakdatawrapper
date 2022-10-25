<script>
    import SignInPageLayout from '_layout/SignInPageLayout.svelte';
    import SetPassword from './SetPassword.svelte';
    import httpReq from '@datawrapper/shared/httpReq.js';

    export let __;
    export let token;
    export let teamId;
    export let headlineText;
    export let introText;
    export let buttonText;
    export let email;

    let submitError;
    let submitting = false;
    const headlineTextBold = false;

    async function handleSubmit(event) {
        submitting = true;
        const password = event.detail.password;
        try {
            await httpReq.post(`/v3/auth/activate/${token}`, {
                payload: {
                    password
                }
            });

            if (teamId) {
                await httpReq.post(`/v3/teams/${teamId}/invites/${token}`);
            }

            setTimeout(() => {
                window.location.href = teamId ? `/team/${teamId}` : '/archive';
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
