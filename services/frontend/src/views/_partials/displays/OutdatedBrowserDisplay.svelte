<script>
    import ModalDisplay from '_partials/displays/ModalDisplay.svelte';
    import { getContext } from 'svelte';

    const browser = getContext('browser');
    const msg = getContext('messages');

    let __;
    $: {
        __ = (key, scope = 'core') => msg.translate(key, scope, $msg);
    }
</script>

{#if $browser.isIE}
    <ModalDisplay open={true} closeable={false}>
        <div class="box has-background-warning p-6">
            <h3 class="title is-2">{__('Your browser is not supported')}</h3>
            <p class="subtitle is-size-3 mb-5">
                {__(
                    'You are using a browser that is not supported at the moment. Please use a different browser instead. Note that this only applies to the chart editor. The charts itself can be viewed with any major browser.'
                )}
            </p>
        </div>
    </ModalDisplay>
{/if}
