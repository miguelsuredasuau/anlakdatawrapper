<script>
    import MainLayout from 'layout/MainLayout.svelte';
    import { getContext } from 'svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';

    const request = getContext('request');
    const config = getContext('config');

    export let statusCode;
    export let error;
    export let message;
    export let data;

    const heds = {
        404: 'error / not-found / hed',
        403: 'error / forbidden / hed',
        400: 'error / bad-request / hed',
        401: 'error / forbidden / hed'
    };
    const texts = {
        404: 'error / not-found / text',
        403: 'error / forbidden / text',
        400: 'error / bad-request / text',
        401: 'error / forbidden / text'
    };

    $: niceHed = message || __(heds[statusCode] || 'error / unexpected / hed');
    $: niceText = data?.text || __(texts[statusCode] || 'error / unexpected / text');

    export let __;
</script>

<MainLayout title="Error {statusCode} / {error}">
    <section class="section">
        <div class="container">
            <div class="columns">
                <div class="column is-2">
                    <IconDisplay icon="warning" size="11rem" className="has-text-grey-lighter" />
                </div>
                <div class="column is-8">
                    <h3 class="is-size-4 mb-4 has-text-grey">
                        Error {statusCode} - {error}
                    </h3>
                    <h1 class="title is-2 mt-1 mb-6">{niceHed}</h1>
                    <p class="is-4 is-size-4 has-text-danger">{niceText}</p>

                    <div class="content mt-5 mb-4">
                        {#if statusCode === 404}
                            <p>Here are some other places you may want to go to now</p>
                            <ul>
                                <li><a href="/">Dashboard</a></li>
                                <li><a href="/account">User settings</a></li>
                            </ul>
                        {/if}
                        <p>
                            {@html __('error / support-help').replace(
                                '%s',
                                `mailto:support@datawrapper.de?subject=Error%20${statusCode}:%20${error}&body=%0A%0A%0A%0A----%0AError:%20${statusCode}%20/%20${message}%0AURL:%20${$request.method.toUpperCase()}%20${
                                    $config.frontendDomain
                                }${$request.path}%0AQuery:%20${encodeURI(
                                    JSON.stringify($request.query)
                                )}%0ATime:%20${new Date().toUTCString()}`
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</MainLayout>
