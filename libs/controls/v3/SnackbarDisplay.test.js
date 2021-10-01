import SnackbarDisplay from './SnackbarDisplay.svelte';
import test from 'ava';

test('Snackbar closes automatically after specified delay', async t => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const component = new SnackbarDisplay({
        target,
        props: {
            label: 'My label',
            class: 'snackbar-1',
            delay: 1000
        }
    });
    const el = target.querySelector('.snackbar-1');
    t.is(component.closed, false);
    t.false(el.classList.contains('hidden'));
    await new Promise(resolve => setTimeout(resolve, 1500));
    t.is(component.closed, true);
});

test('Snackbar is hidden when created in closed state', t => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const component = new SnackbarDisplay({
        target,
        props: {
            label: 'My label',
            class: 'snackbar-2',
            closed: true
        }
    });
    const el = target.querySelector('.snackbar-2');
    t.true(el.classList.contains('hidden'));
    component.closed = false;
    t.false(el.classList.contains('hidden'));
});

test('default SnackbarDisplay has no uid', t => {
    const target = document.createElement('div');
    new SnackbarDisplay({
        target
    });

    t.is(target.querySelector('.snackbar').getAttribute('data-uid'), null);
});

test('SnackbarDisplay can have data-uid', t => {
    const target = document.createElement('div');
    new SnackbarDisplay({
        target,
        props: { uid: 'foobar' }
    });

    t.is(target.querySelector('.snackbar').getAttribute('data-uid'), 'foobar');
});
