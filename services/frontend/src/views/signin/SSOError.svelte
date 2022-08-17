<script>
    import MainLayout from '_layout/MainLayout.svelte';
    import MessageDisplay from '_partials/displays/MessageDisplay.svelte';
    import { getContext } from 'svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';

    const request = getContext('request');
    const config = getContext('config');

    export let statusCode;
    export let error;
    export let message;
    export let data;
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
                    <h1 class="title is-2 mt-1 mb-4">{message}</h1>
                    <p class="is-4 is-size-4 mb-4 has-text-danger">{data.text}</p>

                    <MessageDisplay type="" deletable={false}>
                        {data.providerError}
                    </MessageDisplay>

                    <div class="content mt-5 mb-4">
                        <p>
                            {@html __('error / support-help', 'core', {
                                s: `mailto:support@datawrapper.de?subject=Error%20${statusCode}:%20${error}&body=%0A%0A%0A%0A----%0AError:%20${statusCode}%20/%20${message}%0AURL:%20${$request.method.toUpperCase()}%20${
                                    $config.frontendDomain
                                }${$request.path}%0AQuery:%20${encodeURI(
                                    JSON.stringify($request.query)
                                )}%0ATime:%20${new Date().toUTCString()}`
                            })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</MainLayout>
