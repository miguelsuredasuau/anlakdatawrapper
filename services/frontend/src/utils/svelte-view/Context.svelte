<script>
    import { setContext, getContext, onMount, createEventDispatcher } from 'svelte';
    import { get_current_component as getCurrentComponent } from 'svelte/internal';
    import { writable } from 'svelte/store';
    import debounce from 'lodash/debounce';
    import isEqual from 'lodash/isEqual';
    import cloneDeep from 'lodash/cloneDeep';
    import { Subject, lastValueFrom } from 'rxjs';
    import { take, tap } from 'rxjs/operators';
    import httpReq from '@datawrapper/shared/httpReq.js';
    import { loadScript } from '@datawrapper/shared/fetch.js';
    import { translate } from '@datawrapper/shared/l10n.js';
    import ConfirmationModalDisplay from '_partials/displays/ConfirmationModalDisplay.svelte';

    import dayjs from 'dayjs';
    import relativeTime from 'dayjs/plugin/relativeTime';
    import advancedFormat from 'dayjs/plugin/advancedFormat';
    import localizedFormat from 'dayjs/plugin/localizedFormat';
    import isoWeek from 'dayjs/plugin/isoWeek';

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
    dayjs.extend(isoWeek);
    if (dayjsLocales[userLang.substr(0, 2)]) {
        dayjs.locale(dayjsLocales[userLang.substr(0, 2)]);
    }
    // export libraries as context
    setContext('libraries', { dayjs });

    export let view;
    export let ref;

    let request;

    Object.keys(stores).forEach(key => {
        // this exception for contexts starting with
        // "page/" allows tests to emulate non-store
        // contexts defined in view index components
        // such as `page/archive`
        const store = key.startsWith('page/')
            ? stores[key] // don't deep clone so that tests can access the same store instances
            : writable(cloneDeep(stores[key]));
        if (key === 'messages') store.translate = translate;
        if (key === 'userData' && typeof window !== 'undefined') {
            store.subscribe(
                debounce(async function (value) {
                    if (!isEqual(value, stores[key])) {
                        await httpReq.patch(`/v3/me/data`, {
                            payload: value
                        });
                        stores[key] = cloneDeep(value);
                    }
                }, 1000)
            );
        }
        if (key === 'request') {
            // save reference to request store to be able
            // to update the hash on hashchange events
            request = store;
        }
        setContext(key, store);
    });

    setContext('viewComponents', viewComponents);

    const msg = getContext('messages');
    function __(key, scope = 'core', replacements = {}) {
        return translate(key, scope, $msg, replacements);
    }

    const config = getContext('config');

    const dispatch = createEventDispatcher();
    const component = getCurrentComponent();
    setContext('events', {
        on: (type, callback) => component.$on(type, callback),
        dispatch
    });

    onMount(async () => {
        await loadScript(
            `/lib/csr/_partials/svelte2/Svelte2Wrapper.element.svelte.js?sha=${$config.GITHEAD}`
        );
        if (window.location.hash) {
            $request.hash = window.location.hash;
        }
    });

    function onHashChange() {
        $request.hash = window.location.hash;
    }

    let confirmationModal;
    const confirmationResult = new Subject();

    setContext('main', {
        /**
         * displays a confirmation modal
         * @returns {boolean} - true if "yes" was selected, otherwise false
         */
        async showConfirmationModal(modalOptions) {
            confirmationModal = modalOptions;
            return lastValueFrom(
                confirmationResult.pipe(
                    take(1),
                    tap(() => (confirmationModal = null))
                )
            );
        }
    });
</script>

<svelte:window on:hashchange={onHashChange} />
<svelte:component this={view} bind:this={ref} {__} {...$$restProps} />

{#if confirmationModal}
    <ConfirmationModalDisplay
        {...confirmationModal}
        on:cancel={() => confirmationResult.next(false)}
        on:confirm={() => confirmationResult.next(true)}
    />
{/if}
