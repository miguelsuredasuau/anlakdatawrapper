<script>
    import { setContext, getContext } from 'svelte';
    import { writable } from 'svelte/store';

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

    Object.keys(stores).forEach(key => {
        const store = writable(stores[key]);
        if (key === 'messages') store.translate = translate;
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

<svelte:component this={view} {__} {...$$restProps} />
