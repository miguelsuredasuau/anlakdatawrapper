/* eslint no-new: 0 */
/* globals dw */

import test from 'ava';
import $ from 'cash-dom';
import { clickEvent } from './test/helpers/utils.mjs';

import AnnotationEditor from './AnnotationEditor.html';
import Chart from '@datawrapper/chart-core/lib/dw/svelteChart';
import clone from '@datawrapper/shared/clone';
import metadata from './stories/lib/annotationMetadata.mjs';

const themeData = {
    colors: {
        palette: [
            '#18a1cd',
            '#1d81a2',
            '#15607a',
            '#00dca6',
            '#09bb9f',
            '#009076',
            '#c4c4c4',
            '#c71e1d',
            '#fa8c00',
            '#ffca76',
            '#ffe59c'
        ],
        picker: {
            rowCount: 6
        }
    }
};

test.beforeEach(t => {
    dw.backend.hooks = {
        register: function () {},
        unregister: function () {}
    };

    t.context = document.createElement('div');
    document.body.innerHTML = '';
    document.body.appendChild(t.context);

    t.context.chart = new Chart();
    t.context.chart.set({ metadata: clone(metadata), themeData });
});

test('Controls render when no annotation metadata is present', t => {
    const noAnnotationMetadata = { visualize: {} };
    t.context.chart.set({ metadata: noAnnotationMetadata });

    new AnnotationEditor({
        store: t.context.chart,
        target: t.context
    });

    t.pass();
});

test('Render correct number of items in list', t => {
    const annotationControls = new AnnotationEditor({
        store: t.context.chart,
        target: t.context
    });

    annotationControls.set({ editMode: true });

    const list = $('.option-group-content > ul li', t.context);
    t.is(list.length, 5);
});

test('Update style in a single annotation', t => {
    const annotationControls = new AnnotationEditor({
        store: t.context.chart,
        target: t.context
    });

    annotationControls.set({ editMode: true });

    const { $metadata: $initialMetadata } = annotationControls.get();
    const initialAnnotationData = $initialMetadata.visualize['text-annotations'];
    t.is(initialAnnotationData[0].bold, false);

    $('.option-group-content > ul li:first-child', t.context)[0].click();

    // click on bold button
    $('.vis-option-group-toggle .btn-group button:first-child', t.context)[0].click();
    const { $metadata } = annotationControls.get();
    const annotationData = $metadata.visualize['text-annotations'];
    t.is(annotationData[0].bold, true);
});

test('Update style in multiple annotations', t => {
    const annotationControls = new AnnotationEditor({
        store: t.context.chart,
        target: t.context
    });

    annotationControls.set({ editMode: true });

    const { $metadata: $initialMetadata } = annotationControls.get();
    const initialAnnotationData = $initialMetadata.visualize['text-annotations'];

    // initially all annotations have italic set to `false`
    t.is(initialAnnotationData[0].italic, false);
    t.is(initialAnnotationData[1].italic, false);
    t.is(initialAnnotationData[2].italic, false);
    t.is(initialAnnotationData[3].italic, false);
    t.is(initialAnnotationData[4].italic, false);

    // click on first item, then on third item with `shift` to select 3 annotations
    clickEvent(t.context.querySelector('.option-group-content > ul li:first-child'));
    clickEvent(t.context.querySelector('.option-group-content > ul li:nth-child(3)'), {
        shift: true
    });

    // check that 3 annotations are selected
    const selectedList = $('.option-group-content > ul li.selected', t.context);
    t.is(selectedList.length, 3);

    // click on the italic button
    $('.vis-option-group-toggle .btn-group button:nth-child(2)', t.context)[0].click();
    const { $metadata } = annotationControls.get();
    const annotationData = $metadata.visualize['text-annotations'];

    // selected annotations have italic set to `true` now
    t.is(annotationData[0].italic, true);
    t.is(annotationData[1].italic, true);
    t.is(annotationData[2].italic, true);

    // other annotations still have italic set to `false`
    t.is(annotationData[3].italic, false);
    t.is(annotationData[4].italic, false);
});

test('Indeterminate state is set correctly', t => {
    const annotationControls = new AnnotationEditor({
        store: t.context.chart,
        target: t.context
    });

    annotationControls.set({ editMode: true });

    // click on first item, then on second item with `shift` to select 2 annotations
    clickEvent(t.context.querySelector('.option-group-content > ul li:first-child'));
    clickEvent(t.context.querySelector('.option-group-content > ul li:nth-child(2)'), {
        shift: true
    });

    // different values for `bold`: indeterminate
    t.is(
        $('.vis-option-group-toggle .btn-group button:first-child', t.context).hasClass(
            'indeterminate'
        ),
        true
    );
    // same values for `italic`: not indeterminate
    t.is(
        $('.vis-option-group-toggle .btn-group button:nth-child(2)', t.context).hasClass(
            'indeterminate'
        ),
        false
    );
});

test('Delete single annotation', t => {
    const annotationControls = new AnnotationEditor({
        store: t.context.chart,
        target: t.context
    });

    annotationControls.set({ editMode: true });

    const { $metadata: $initialMetadata } = annotationControls.get();
    const initialAnnotationData = $initialMetadata.visualize['text-annotations'];
    // save text from second annotation - we'll need it later
    const secondAnnotationText = initialAnnotationData[1].text;

    $('.option-group-content > ul li:first-child', t.context)[0].click();
    $('.btn-delete', t.context)[0].click();

    const { $metadata } = annotationControls.get();
    const annotationData = $metadata.visualize['text-annotations'];

    // number of annotations has gone down
    t.is(annotationData.length, 4);
    // first annotation is now the one that used to be second
    t.is(annotationData[0].text, secondAnnotationText);
});

test('Delete multiple annotations', t => {
    const annotationControls = new AnnotationEditor({
        store: t.context.chart,
        target: t.context
    });

    annotationControls.set({ editMode: true });

    const { $metadata: $initialMetadata } = annotationControls.get();
    const initialAnnotationData = $initialMetadata.visualize['text-annotations'];
    // save text from second, fourth and fifth annotations - we'll need them later
    const secondAnnotationText = initialAnnotationData[1].text;
    const fourthAnnotationText = initialAnnotationData[3].text;
    const fifthAnnotationText = initialAnnotationData[4].text;

    // click on first item, then on third item with `ctrl` to select 2 annotations
    clickEvent(t.context.querySelector('.option-group-content > ul li:first-child'));
    clickEvent(t.context.querySelector('.option-group-content > ul li:nth-child(3)'), {
        ctrl: true
    });
    $('.btn-danger', t.context)[0].click();

    const { $metadata } = annotationControls.get();
    const annotationData = $metadata.visualize['text-annotations'];

    // number of annotations has gone down
    t.is(annotationData.length, 3);
    // first annotation is now the one that used to be second
    t.is(annotationData[0].text, secondAnnotationText);
    // second annotation is now the one that used to be fourth
    t.is(annotationData[1].text, fourthAnnotationText);
    // third annotation is now the one that used to be fifth
    t.is(annotationData[2].text, fifthAnnotationText);
});
