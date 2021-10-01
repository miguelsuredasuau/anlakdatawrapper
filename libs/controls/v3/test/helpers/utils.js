import { detach, insert, noop } from 'svelte/internal';

/**
 * simulates a click while pressing ctrl-key
 * @param element - DOM element on which to dispatch the event
 */
export function clickEvent(element, options = {}) {
    options = Object.assign({ ctrl: false, alt: false, shift: false, meta: false }, options);
    const evt = document.createEvent('MouseEvents');
    evt.initMouseEvent(
        'click', // type
        true, // canBubble
        true, // cancelable
        window, // view
        0, // detail (click count)
        0, // screenX
        0, // screenY
        80, // clientX
        20, // clientY
        options.ctrl, // ctrlKey
        options.alt, // altKey
        options.shift, // shiftKey
        options.meta, // metaKey
        0, // button
        null // relatedTarget
    );
    element.dispatchEvent(evt);
}

/**
 * simulates a KeyboardEvent
 * @param element - DOM element on which to dispatch the event
 * @param key - the key representation, e.g. "x" or "Enter"
 * @param type - the keyevent type, defaults to "keypress"
 */
export function keyEvent(element, key, type) {
    const event = new window.KeyboardEvent(type || 'keypress', {
        bubbles: true,
        cancelable: true,
        key
    });
    element.dispatchEvent(event);
}

/**
 * Set slots when creating component instance.
 *
 * @see https://github.com/sveltejs/svelte/issues/2588#issuecomment-488343541
 */
export function createSlots(slots) {
    const svelteSlots = {};

    for (const slotName in slots) {
        svelteSlots[slotName] = [createSlotFn(slots[slotName])];
    }

    function createSlotFn(element) {
        return function () {
            return {
                c: noop,

                m: function mount(target, anchor) {
                    insert(target, element, anchor);
                },

                d: function destroy(detaching) {
                    if (detaching) {
                        detach(element);
                    }
                },

                l: noop
            };
        };
    }
    return svelteSlots;
}
