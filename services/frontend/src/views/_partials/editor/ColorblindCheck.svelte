<script>
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import ToolbarItem from '_partials/editor/ToolbarItem.svelte';
    import purifyHtml from '@datawrapper/shared/purifyHtml';
    import { onMount } from 'svelte';
    import { uniq } from 'underscore';
    import chroma from 'chroma-js';

    import blinder from '../../../utils/blinder.js';

    export let __;
    export let iframe;
    export let uid = null;

    let __dw;
    let testing = false;
    let activeMode = 'normal';
    let colorLookup = {};

    const lastColors = new Set();

    const modes = [
        {
            id: 'normal',
            label: 'None',
            icon: 'norm.png',
            info: false
        },
        {
            id: 'deuteranopia',
            label: 'Deut',
            icon: 'deut.png',
            info: __('colorblind / info / deut')
        },
        {
            id: 'protanopia',
            label: 'Prot',
            icon: 'prot.png',
            info: __('colorblind / info / prot')
        },
        {
            id: 'tritanopia',
            label: 'Trit',
            icon: 'trit.png',
            info: __('colorblind / info / trit')
        },
        {
            id: 'achromatopsia',
            label: 'Achr',
            icon: 'bw.png',
            info: __('colorblind / info / bw')
        }
    ];

    let warnings = {
        deuteranopia: false,
        protanopia: false,
        tritanopia: false
    };

    function setMode(mode) {
        activeMode = mode;
        colorLookup = {};
        forceRerender();
    }

    function forceRerender() {
        iframe.getContext(contentWindow => {
            contentWindow.__dw.vis.colorMode(activeMode);
            contentWindow.__dw.render();
            contentWindow.dispatchEvent(new Event('resize'));
        });
    }

    function initIframe() {
        iframe.getContext(contentWindow => {
            __dw = contentWindow.__dw;
            __dw.vis.colorMap(color => colorMap(color));
        });
    }

    function colorMap(color) {
        if (
            activeMode === 'normal' ||
            !color ||
            color === 'none' ||
            color === 'transparent' ||
            color === 'auto'
        )
            return color;
        var k = String(color);
        lastColors.add(k);
        if (colorLookup[k] !== undefined) return colorLookup[k];
        try {
            color = chroma(k).rgba();
            return (colorLookup[k] = blinder[activeMode](color));
        } catch (e) {
            return color;
        }
    }

    function runTests() {
        // get list of all colors used in last run
        if (typeof __dw === 'undefined' || !__dw.vis) {
            // try again later
            return setTimeout(() => {
                runTests();
            }, 1000);
        }
        let colors = uniq(
            __dw.vis
                .colorsUsed()
                .filter(c => chroma.valid(c) && chroma(c).get('lch.c') > 1.5)
                .map(c => chroma(c).hex())
        );
        let sample;
        if (colors.length > 30) {
            colors = colors
                .map(function (c) {
                    var col = chroma(c);
                    return {
                        raw: c,
                        color: col,
                        hue: col.get('lch.h')
                    };
                })
                .sort(function (a, b) {
                    return a.hue - b.hue;
                })
                .map(function (c) {
                    return c.color;
                });
            // sample colors from hue gradient
            sample = chroma.scale(colors).colors(40);
        } else {
            // use all colors
            sample = colors;
        }

        if (testing) return;

        if (!sample.length) {
            // wait a second
            setTimeout(() => {
                runTests();
            }, 1000);
            return;
        }

        testing = true;

        // auto-test 3 simulations

        var res = {};

        if (colors.length > 1) {
            Object.keys(warnings).forEach(mode => {
                if (!testSample(sample, mode)) {
                    warnings[mode] = true;
                    res[mode] = 1;
                } else {
                    warnings[mode] = false;
                    res[mode] = 0;
                }
            });
            warnings = warnings;
        } else {
            // just one color
            res = { deuteranopia: 0, protanopia: 0, tritanopia: 0 };
        }

        // testing = false;
        colorLookup = {};
    }

    function testSample(sample, type) {
        let ok = 0;
        let notok = 0;
        const ratioThres = 5;
        const smallestPercievableDistance = 9.2;
        const k = sample.length;
        if (!k) {
            return true;
        }
        // compute distances between colors
        for (var a = 0; a < k; a++) {
            for (var b = a + 1; b < k; b++) {
                try {
                    var colA = chroma(sample[a]);
                    var colB = chroma(sample[b]);
                } catch (e) {
                    // something odd with either of the colors, ignore
                    continue;
                }
                const dstNorm = difference(colA, colB);
                if (dstNorm < smallestPercievableDistance) continue;
                const aSim = blinder[type](colA.hex());
                const bSim = blinder[type](colB.hex());
                const dstSim = difference(aSim, bSim);
                const isNotOk =
                    dstNorm / dstSim > ratioThres && dstSim < smallestPercievableDistance;
                // count combinations that are problematic
                if (isNotOk) notok++;
                else ok++;
            }
        }

        // compute share of problematic samples
        return notok / (ok + notok) < 0.03;
    }

    function difference(colA, colB) {
        return 0.5 * (chroma.deltaE(colA, colB) + chroma.deltaE(colB, colA));
    }

    onMount(() => {
        window.addEventListener('message', evt => {
            if (evt.data === 'datawrapper:vis:init') {
                initIframe();
            }
            if (evt.data === 'datawrapper:vis:rendered') {
                runTests();
            }
        });
    });
</script>

<style lang="scss">
    @import '../../../styles/export.scss';

    .button {
        .mode-label {
            font-size: 10px;
            text-transform: uppercase;
            display: none;
        }
        .mode-icon {
            margin: 0 -0.5em;
            display: inline-flex;
            align-items: center;

            img {
                width: 20px;
            }
        }
        .more-info {
            &:before {
                content: '';
                display: block;
                height: 1rem;
                position: absolute;
                left: 1em;
                top: 0;
                border-left: 1px solid $dw-grey-dark;
            }
            display: none;
            position: absolute;
            top: 2.25rem;
            left: 0;
            padding-top: 1.25rem;
            text-align: left;
            width: 15em;
            white-space: normal;
            color: $grey-dark;
            font-size: $size-6;
            line-height: 1.35;
        }
        .color-warning {
            color: $warning;
            border-radius: 50%;
            background-color: rgba(0, 0, 0, 0.3);
            position: absolute;
            width: 2em;
            height: 2em;
            display: flex;
            justify-content: center;
            align-items: center;

            :global(.icon) {
                position: relative;
                top: -0.05em;
            }
        }
    }

    .button:hover .more-info,
    .buttons:not(:hover) .button.is-active .more-info {
        display: block;
    }
</style>

<ToolbarItem>
    <svelte:fragment slot="title">
        {__('colorblind / caption')}
        <IconDisplay icon="accessibility" valign="-0.2em" />
    </svelte:fragment>
    <div class="field has-addons buttons are-outlined" data-uid={uid}>
        {#each modes as mode}
            <div class="control">
                <button
                    class="button is-small is-outlined is-dark"
                    on:click={() => setMode(mode.id)}
                    class:has-color-warning={warnings[mode.id]}
                    class:is-selected={mode.id === activeMode}
                    data-uid={uid && `${uid}-${mode.id}`}
                >
                    <figure class="mode-icon">
                        <img alt={mode.id} src="/static/img/colorblind-check/{mode.icon}" />
                        <figcaption class="mode-label">{mode.label}</figcaption>
                    </figure>
                    {#if warnings[mode.id]}
                        <div class="color-warning">
                            <IconDisplay icon="warning" />
                        </div>
                    {/if}
                    {#if mode.info}
                        <div class="more-info">
                            {@html purifyHtml(mode.info)}
                        </div>
                    {/if}
                </button>
            </div>
        {/each}
    </div>
</ToolbarItem>
