<script>
    import IconDisplay from '_partials/displays/IconDisplay.svelte';

    const colors = ['#222222', '#18a1cd', '#c71e1d', '#1d81a2', '#15607a', '#3ed081', '#09bb9f'];

    let iconPreview = 'dw-map';
    export let icons;
</script>

<div class="section pl-0 pt-0">
    <h3 class="title is-3" id="icons">Icons!</h3>

    <div class="columns is-vcentered is-gapless is-multiline">
        {#each icons as icon, i}
            <div class="column is-2" title={icon} on:mouseenter={() => (iconPreview = icon)}>
                <IconDisplay
                    className="mb-4 mr-4 is-pulled-left"
                    color={colors[1]}
                    {icon}
                    size="24px"
                />
                <span class="is-size-7">{icon}</span>
            </div>
        {/each}
    </div>
    <div class="columns">
        <div class="column is-narrow">
            <div class="content mt-4">
                <p class="is-size-4 has-text-danger">
                    Icons can be used <IconDisplay icon={iconPreview} /> inline in text, too!<br
                    />Or in buttons:
                    <button class="button is-danger"
                        ><IconDisplay className="ml-0" size="1.2em" icon={iconPreview} /><span
                            >{iconPreview}</span
                        ></button
                    >
                    <br /><span class="is-size-6 has-text-grey-dark"
                        >(but don't forget the span around the text)</span
                    >
                    <br />And icons can spin, too!
                    <IconDisplay
                        valign="sub"
                        className="mr-2"
                        icon="refresh"
                        size="32px"
                        spin
                    /><IconDisplay
                        valign="sub"
                        icon="loading-spinner"
                        size="32px"
                        timing="steps(12)"
                        duration="1s"
                        spin
                    />
                </p>
            </div>
        </div>
        <div class="column">
            <div>
                {#each [12, 16, 20, 24, 32, 48, 64, 96, 128, 160] as size, i}
                    <IconDisplay
                        className="mr-1"
                        valign="middle"
                        color={colors[i % colors.length]}
                        icon={iconPreview}
                        size="{size}px"
                    />
                {/each}
            </div>
        </div>
    </div>
</div>
