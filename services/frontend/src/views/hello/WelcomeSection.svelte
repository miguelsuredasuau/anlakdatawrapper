<script>
    import { onMount, onDestroy, getContext } from 'svelte';
    const user = getContext('user');

    export let magicNumber = false;
    export let __;

    let knocked = false;

    function knock() {
        knocked = true;
    }

    let interval;
    onMount(() => {
        interval = setInterval(() => {
            magicNumber++;
        }, 1000);
    });

    onDestroy(() => {
        clearInterval(interval);
    });

    $: message = !knocked ? `Knock, knock. Who's there? (click me!)` : `Hello ${$user.name}!`;
</script>

<div class="section pl-0 pt-0">
    <h1 class="title is-1">Hello world!</h1>
    <p class="subtitle is-3 has-text-grey">A Datawrapper demo page</p>
    <h3 id="welcome" class="title is-4 mt-3" style="color:#c04" on:click={knock}>
        {message}
        {#if $user && $user.activeTeam}
            Your active team is <b>{$user.activeTeam.name}</b>.
        {:else}
            You don't have an active team.
        {/if}
    </h3>
    <div class="content">
        <p class="subtitle">
            Welcome to the Hello World demo page of our new frontend! The purpose of this page is to
            demonstate the use of our built-in design components, most of which are based on the <a
                href="https://bulma.io/documentation/overview/start/">Bulma CSS framework</a
            >.
        </p>
        <p>A translation test: {__('team / invite / intro')}</p>
        <p>
            The magic number is&nbsp;<b>{magicNumber}</b>, and it keeps increasing because Svelte
            client-side hydration works!
        </p>
    </div>
</div>
