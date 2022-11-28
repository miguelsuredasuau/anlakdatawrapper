<script>
    import { createEventDispatcher } from 'svelte';
    import IconDisplay from './displays/IconDisplay.svelte';
    import purifyHtml from '@datawrapper/shared/purifyHtml.js';

    const dispatch = createEventDispatcher();

    export let items = []; // { id, title }
    export let active;
    export let highlight;
    export let className = null;

    function setActive(item) {
        active = item.id;
        dispatch('change', item);
    }
</script>

<style lang="scss">
    .icon-wrap {
        margin-right: -8px;
        display: inline-block;
    }

    .is-highlight a {
        background-color: $dw-scooter-lighter;
        color: $dw-scooter;

        &:hover {
            color: $dw-black;
        }
    }
</style>

<div class="tabs is-boxed {className || ''}">
    <ul>
        {#each items as item}
            <li
                class:is-active={active === item.id}
                class:is-highlight={highlight === item.id}
                data-uid={`tab-${item.id}`}
            >
                <a on:click|preventDefault={() => setActive(item)} href="#{item.id}"
                    >{@html purifyHtml(item.title)}
                    {#if item.icon}
                        <div class="icon-wrap">
                            <IconDisplay icon={item.icon} color={item.iconColor} />
                        </div>
                    {/if}
                </a>
            </li>
        {/each}
    </ul>
</div>
