/* eslint no-new: 0 */

import test from 'ava';
import $ from 'cash-dom';

import MoreOptionsGroup from './MoreOptionsGroup.html';

test.beforeEach(t => {
    t.context = document.createElement('div');
    document.body.innerHTML = '';
    document.body.appendChild(t.context);
});

test('Default MoreOptionsGroup state', t => {
    new MoreOptionsGroup({
        target: t.context
    });

    const button = $('.more-options-toggle button', t.context).get(0);
    t.truthy(button);
    // content is not added to DOM
    t.falsy($('.more-options-content', t.context).get(0));
    // hr not added to DOM
    t.falsy($('hr', t.context).get(0));
    // clicking button should show content
    button.click();
    t.truthy($('.more-options-content', t.context).get(0));
    t.falsy($('hr', t.context).get(0));
    // clicking button again should hide content
    button.click();
    t.falsy($('.more-options-content', t.context).get(0));
});

test('MoreOptionsGroup with bottomLine', t => {
    new MoreOptionsGroup({
        target: t.context,
        data: {
            bottomLine: true
        }
    });

    t.falsy($('hr', t.context).get(0));
    const button = $('.more-options-toggle button', t.context).get(0);
    button.click();
    // hr now added to DOM
    t.truthy($('hr', t.context).get(0));
});

test('MoreOptionsGroup with custom labels', t => {
    new MoreOptionsGroup({
        target: t.context,
        data: {
            showLabel: 'show me',
            hideLabel: 'hide me'
        }
    });

    const button = $('.more-options-toggle button', t.context);
    t.is(button.text().trim(), 'show me');
    button.get(0).click();
    // hr now added to DOM
    t.is(button.text().trim(), 'hide me');
});

test('Disabled MoreOptionsGroup', t => {
    new MoreOptionsGroup({
        target: t.context,
        data: {
            disabled: true
        }
    });

    const button = $('.more-options-toggle button', t.context).get(0);
    t.truthy(button);
    // content is not added to DOM
    t.falsy($('.more-options-content', t.context).get(0));
    // clicking button should do nothing
    button.click();
    t.falsy($('.more-options-content', t.context).get(0));
});
