<script>
    import { getContext } from 'svelte';
    const config = getContext('config');
    const msg = getContext('messages');

    let __;
    $: {
        __ = (key, scope = 'core') => msg.translate(key, scope, $msg);
    }
</script>

<style>
    footer li a.highlight {
        background: #4688d7;
        color: white;
        padding: 3px 6px;
        font-weight: bold;
    }
    nav ul {
        color: silver;
        margin: 0;
        padding: 0;
    }
    nav ul li {
        display: inline-block;
        margin-right: 0.3ex;
    }
    nav ul li + li {
        margin-left: 0.3ex;
    }
    nav ul li + li:before {
        content: ' – ';
    }
</style>

<footer class="footer">
    <div class="container">
        <hr />
        <div class="columns">
            <div class="column">
                <p class="mb-0">{@html __('footer / datawrapper-gmbh')}</p>
                <nav>
                    <ul>
                        {#each $config.footerLinks as link}
                            <li>
                                <a class:highlight={link.highlight} href={link.url}>
                                    {link.title.en}
                                </a>
                            </li>
                        {/each}
                    </ul>
                </nav>
            </div>
            <div class="column is-narrow">
                <a href="#top" on:click|preventDefault={() => window.scrollTo(0, 0)}
                    >{__('Back to top')}</a
                >{#if config.dev}
                    <br />
                    {$config.apiDomain}
                {/if}
            </div>
        </div>
    </div>
</footer>
