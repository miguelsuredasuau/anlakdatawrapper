<script>
    import Svelte2Wrapper from '_partials/svelte2/Svelte2Wrapper.svelte';

    // mock team settings data
    let data = {
        settings: {
            ga_id: '123',
            webhook_url: 'test',
            webhook_enabled: true
        }
    };
</script>

<div class="section pl-0 pt-0" id="svelte2-embed">
    <h3 id="svelte2" class="title is-3">Embedding Svelte2 components</h3>
    <div class="content">
        <p class="has-text-grey">Svelte3 data binding demo</p>
        <p>
            <label class="checkbox"
                ><input type="checkbox" bind:checked={data.settings.webhook_enabled} /> Webhook enabled</label
            >
        </p>
        {#if data.settings.webhook_enabled}
            <p>
                Webhook URL: <input class="input" bind:value={data.settings.webhook_url} />
            </p>
        {/if}
    </div>

    <div class="box">
        <Svelte2Wrapper
            id="plugin-team-integrations"
            js="/lib/plugins/team-integrations/static/team-integrations.js"
            css="/lib/plugins/team-integrations/static/team-integrations.css"
            bind:data
        />
    </div>
</div>
