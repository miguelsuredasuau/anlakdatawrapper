import test from 'ava';
import ColorScaleEditor from './ColorScaleEditor.html';
import Column from '@datawrapper/chart-core/lib/dw/dataset/column.mjs';

test.beforeEach(t => {
    t.context = document.createElement('div');
    document.body.innerHTML = '';
    document.body.appendChild(t.context);
});

test('ColorScaleEditor can be initialized', t => {
    const column = Column('values', [4, 5, 6], 'number');
    new ColorScaleEditor({
        target: t.context,
        data: {
            column,
            columns: [column]
        }
    });
    t.pass();
});
