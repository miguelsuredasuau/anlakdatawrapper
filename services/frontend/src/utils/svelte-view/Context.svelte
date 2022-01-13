<script>
    import { setContext, getContext } from 'svelte';
    import { writable } from 'svelte/store';
    import debounce from 'lodash/debounce';
    import isEqual from 'lodash/isEqual';
    import { httpReq, clone } from '@datawrapper/shared';

    import dayjs from 'dayjs';
    import relativeTime from 'dayjs/plugin/relativeTime';
    import advancedFormat from 'dayjs/plugin/advancedFormat';
    import localizedFormat from 'dayjs/plugin/localizedFormat';

    import de from 'dayjs/locale/de';
    import es from 'dayjs/locale/es';
    import fr from 'dayjs/locale/fr';
    import it from 'dayjs/locale/it';
    import zh from 'dayjs/locale/zh';

    export let stores = {};
    export let viewComponents = {};

    // prepare dayjs library
    const dayjsLocales = {
        de,
        es,
        fr,
        it,
        zh
    };
    const userLang = stores.user.language;
    dayjs.extend(relativeTime);
    dayjs.extend(advancedFormat);
    dayjs.extend(localizedFormat);
    if (dayjsLocales[userLang.substr(0, 2)]) {
        dayjs.locale(dayjsLocales[userLang.substr(0, 2)]);
    }
    // export libraries as context
    setContext('libraries', { dayjs });

    export let view;
    export let ref;

    Object.keys(stores).forEach(key => {
        const store = writable(clone(stores[key]));
        if (key === 'messages') store.translate = translate;
        if (key === 'userData' && typeof window !== 'undefined') {
            store.subscribe(
                debounce(async function (value) {
                    if (!isEqual(value, stores[key])) {
                        await httpReq.patch(`/v3/me/data`, {
                            payload: value
                        });
                        stores[key] = value;
                    }
                }, 1000)
            );
        }
        setContext(key, store);
    });

    setContext('viewComponents', viewComponents);

    function translate(key, scope = 'core', messages) {
        if (!messages) messages = stores.messages;
        try {
            const msg = messages[scope];
            return msg[key] || key;
        } catch (e) {
            return key;
        }
    }

    const msg = getContext('messages');
    function __(key, scope = 'core') {
        return translate(key, scope, $msg);
    }
</script>

<svelte:component this={view} bind:this={ref} {__} {...$$restProps} />
