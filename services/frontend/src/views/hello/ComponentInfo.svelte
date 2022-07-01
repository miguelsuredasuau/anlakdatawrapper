<script>
    import CodeHighlight from './CodeHighlight.svelte';

    export let component;
    export let info;

    $: compName = component.split('/').slice(-1)[0].replace('.svelte', '');
    $: compPath = component.split('/').slice(0, -1).join('/');

    $: hasAnonymousSlot = info.slots.find(slot => slot.anonymous);
    $: namedSlots = info.slots.filter(slot => !slot.anonymous);

    $: sortedProps = info.props.sort((a, b) => (a.name < b.name ? -1 : 1));
    $: sortedActions = info.actions.sort((a, b) => (a.name < b.name ? -1 : 1));
    $: needsTranslateFunc = info.props.find(prop => prop.name === '__');

    $: totalAttributes = info.props.length + info.actions.length;
    $: inline = totalAttributes < 3;

    function formatProp(prop) {
        // bug in @el3um4s/svelte-get-component-info seems to
        // remove "let" out of property names?
        if (prop.name === 'deable') prop.name = 'deletable';
        if (prop.name === 'value') {
            return 'bind:value';
        } else if (prop.name === 'label') {
            return 'label="Lorem ipsum"';
        } else if (typeof prop.defaultValue === 'undefined') {
            return `{${prop.name}}`;
        } else if (['true', 'false', 'null'].includes(prop.defaultValue)) {
            return `${prop.name}={${prop.defaultValue}}`;
        } else if (prop.defaultValue.includes(' => ')) {
            return `${prop.name}={() => {}}`;
        } else if (prop.defaultValue.startsWith('{') || prop.defaultValue.startsWith('[')) {
            let def;
            eval('def = ' + prop.defaultValue);
            return `${prop.name}={${JSON.stringify(def)}}`;
        }
        return `${prop.name}=${JSON.stringify(prop.defaultValue)}`;
    }

    let formattedProps = '';
    $: {
        const prepend =
            !inline && sortedProps.length > 0 ? '\n    ' : sortedProps.length > 0 ? ' ' : '';
        const glue = !inline ? '\n    ' : ' ';
        formattedProps = prepend + sortedProps.map(formatProp).join(glue);
    }

    let formattedActions = '';
    $: {
        const prepend =
            sortedActions.length && !inline ? '\n    ' : sortedProps.length > 0 ? ' ' : '';
        const glue = !inline ? '\n    ' : ' ';
        formattedActions =
            prepend + sortedActions.map(({ name }) => `on:${name}={(event) => null}`).join(glue);
    }

    $: formattedSlots = `${hasAnonymousSlot ? '    <!-- add content here -->' : ''}${
        hasAnonymousSlot && namedSlots.length ? '\n' : ''
    }${namedSlots.length ? '    ' : ''}${namedSlots
        .map(({ name }) => `<svelte:fragment slot="${name}">Lorem ipsum</svelte:fragment>`)
        .join('\n    ')}\n</${compName}>`;

    $: code = `<${'script>'}\n    import ${compName} from '${component}';\n${
        needsTranslateFunc ? '\n    export let __;\n' : ''
    }</${'script>'}\n\n<${compName}${formattedProps}${formattedActions}${
        info.slots.length ? (inline ? '' : '\n') + '>\n' + formattedSlots : ' />'
    }`;
</script>

<div class="block">
    <h3 class="title is-4">
        <span class="has-text-grey">{compPath}/</span>{compName}.svelte (<a
            href="https://github.com/datawrapper/code/tree/main/services/frontend/src/views/{component}"
            >code</a
        >)
    </h3>

    <CodeHighlight {code} />
</div>
