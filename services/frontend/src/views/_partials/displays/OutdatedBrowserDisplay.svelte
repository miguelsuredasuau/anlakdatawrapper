<script>
    import ModalDisplay from '_partials/displays/ModalDisplay.svelte';
    import DatawrapperLogoDisplay from '_partials/displays/DatawrapperLogoDisplay.svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';

    import { getContext } from 'svelte';

    const browser = getContext('browser');
    const msg = getContext('messages');
    function createTranslate(msg, messages) {
        return (key, scope = 'core') => msg.translate(key, scope, messages);
    }
    $: __ = createTranslate(msg, $msg);
</script>

<style lang="scss">
    @import '../../../styles/colors.scss';
    .browser-warning {
        font-family: Segoe UI, Arial, sans-serif;
        background: $dw-scooter-lightest;
        border-radius: 0;
    }

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .title {
        text-align: center;
        border-top: 1px solid $dw-grey-light;
        border-bottom: 1px solid $dw-grey-light;
    }

    .icon {
        display: block;
        width: 40px;
        height: 40px;
        border-radius: 20px;
        margin: 5px 20px 0 0;

        svg {
            fill: currentColor;
            color: inherit;
            margin: 7px;
        }
    }

    .icon.is-warning {
        background: $dw-yellow;
        color: $dw-grey-darker;
    }

    .icon.is-ok {
        background: $dw-green;
        color: $dw-white;
    }

    .browser-warning :global(p > a) {
        font-weight: bold;
    }
</style>

<ModalDisplay open={$browser.isIE} closeable={false} maxWidth="640px" backgroundOpacity="0.8">
    <div class="box browser-warning p-6 is-size-5">
        <header class="header">
            <a href="//www.datawrapper.de/">
                <DatawrapperLogoDisplay width="130px" height="50px" />
            </a>
            <a class="is-size-5" href="//www.datawrapper.de/">
                {__('browser-warning / learn-more')}
                <IconDisplay valign="middle" icon="arrow-right" size="30px" />
            </a>
        </header>
        <h3 class="title py-5 my-4">
            {__('browser-warning / title')}
        </h3>
        <ul>
            <li class="is-flex pb-5 pt-3">
                <div>
                    <span class="icon is-warning">
                        <svg
                            width="26"
                            height="26"
                            viewBox="0 0 30 30"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M4 0C1.794 0 0 1.794 0 4h2c0-1.103.897-2 2-2s2 .897 2 2c0 .799-.49 1.291-1.29 2.03C3.95 6.733 3 7.61 3 9h2c0-.488.406-.889 1.068-1.5C6.93 6.704 8 5.715 8 4c0-2.206-1.794-4-4-4zm11 3c-1.159 0-2.266.18-3.31.48a1 1 0 1 0 .552 1.922A9.93 9.93 0 0 1 15 5c5.535 0 10 4.465 10 10s-4.465 10-10 10c-4.428 0-8.16-2.872-9.479-6.846a1 1 0 0 0-1.898.631C5.208 23.558 9.706 27 15 27c6.616 0 12-5.384 12-12 0-6.615-5.384-12-12-12zm-2.5 7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm8 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM4 11.5a1.5 1.5 0 1 0 .001 3.001A1.5 1.5 0 0 0 4 11.5zM20 15c-2.7 0-4.65.824-5.904 1.672-1.254.848-1.873 1.785-1.873 1.785a.999.999 0 1 0 1.68 1.086s.349-.563 1.314-1.215C16.182 17.676 17.7 17 20 17a1 1 0 1 0 0-2z"
                            />
                        </svg>
                    </span>
                </div>
                <p>
                    {@html __('browser-warning / not-supported')}
                </p>
            </li>
            <li class="is-flex pb-5">
                <div>
                    <span class="icon is-warning">
                        <svg
                            width="25"
                            height="25"
                            viewBox="0 0 30 30"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M6 4c-1.093 0-2 .907-2 2v11a1 1 0 0 0 1 1h3v-2H6V8h12v2h2V6c0-1.093-.907-2-2-2H6zm6 8c-1.093 0-2 .907-2 2v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V14c0-1.093-.907-2-2-2H12zm0 2h12v2H12v-2z"
                            />
                        </svg>
                    </span>
                </div>
                <p>
                    {@html __('browser-warning / switch-browser')}
                </p>
            </li>
            <li class="is-flex">
                <div>
                    <span class="icon is-ok">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 30 30"
                            xmlns="http://www.w3.org/2000/svg"
                            ><path
                                d="m2.172 16.293 2.12-2.121a1 1 0 0 1 1.415 0l4.586 4.585.707.743.707-.743L25.293 5.172a1 1 0 0 1 1.414 0l2.121 2.12a1 1 0 0 1 0 1.415l-17.12 17.121a1 1 0 0 1-1.415 0l-8.121-8.12a1 1 0 0 1 0-1.415z"
                            /></svg
                        >
                    </span>
                </div>
                <p>
                    {@html __('browser-warning / visualizations')}
                </p>
            </li>
        </ul>
    </div>
</ModalDisplay>
