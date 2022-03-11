<script>
    import { createEventDispatcher } from 'svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';

    export let label = 'Save changes';

    export let inProgressLabel = 'Saving...';
    export let successLabel = 'Saved';
    export let errorLabel = 'Error';

    export let className = '';
    export let inProgress = false;
    export let result = null;
    export let icon = null;
    export let resetTimeout = {
        error: 5000,
        success: 3000
    };

    const dispatch = createEventDispatcher();

    let _result = result;
    let _inProgress = inProgress;
    let refButton;

    $: {
        if (result !== _result) {
            if (result) {
                // auto-reset result after 2 seconds
                setTimeout(() => {
                    result = null;
                    dispatch('reset');
                }, resetTimeout[result] || 3000);
            }
            _result = result;
        }
    }

    $: {
        if (_inProgress !== inProgress) {
            if (inProgress) {
                // blur icon when inProgress is set to true
                refButton.blur();
            }
            _inProgress = inProgress;
        }
    }

    $: displayedIcon = inProgress
        ? 'loading-spinner'
        : result === 'success'
        ? 'checkmark-bold'
        : result === 'error'
        ? 'close'
        : icon;
</script>

<style>
    .shows-result {
        pointer-events: none;
    }
</style>

<button
    bind:this={refButton}
    class="button {className}"
    disabled={inProgress}
    class:shows-result={!!result}
    class:is-success={result === 'success'}
    class:is-inverted={result === 'success'}
    class:is-ghost={result === 'success'}
    class:is-danger={result === 'error' || className.includes('is-danger')}
    on:click
>
    {#if displayedIcon}
        <IconDisplay
            spin={inProgress}
            icon={displayedIcon}
            timing="steps(12)"
            duration="1s"
        />{/if}<span
        >{result === 'success'
            ? successLabel
            : result === 'error'
            ? errorLabel
            : inProgress
            ? inProgressLabel
            : label}</span
    >
</button>
