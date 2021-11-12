<script>
    import SignInPageLayout from './layout/SignInPageLayout.svelte';
    import SetPassword from './shared/SetPassword.svelte';
    import httpReq from '@datawrapper/shared/httpReq';

    export let __;
    export let token;
    export let team;
    export let headlineText;
    export let introText;
    export let buttonText;
    export let email;

    let submitError;
    const headlineTextBold = false;

    async function handleSubmit(event) {
        const password = event.detail.password;
        try {
            await httpReq.post(`/v3/auth/activate/${token}`, {
                payload: {
                    password
                }
            });

            await httpReq.post(`/v3/teams/${team}/invites/${token}`);

            setTimeout(() => {
                window.location.href = `/team/${team}`;
            }, 400);
        } catch (error) {
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
        on:submit={handleSubmit}
    />
</SignInPageLayout>
