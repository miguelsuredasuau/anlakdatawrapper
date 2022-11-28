import DropdownInput from './DropdownInput.svelte';
import { renderWithContext, setConfig } from '../../../../tests/helpers/clientUtils';
import chai, { expect } from 'chai';
import chaiDom from 'chai-dom';

setConfig({ testIdAttribute: 'data-uid' });

const uid = 'dropdown-input';
chai.use(chaiDom);

const options = [
    {
        value: 'one',
        label: 'first <b>item</b>'
    },
    {
        value: 'two',
        label: 'second <b>item</b>'
    }
];

describe('DropdownInput', () => {
    describe('initial state', function () {
        it('renders an input with placeholder', async () => {
            const result = await renderWithContext(DropdownInput, {
                placeholder: 'select an item',
                options
            });
            const button = result.getByText('select an item');
            expect(button).to.exist;
        });

        it('renders an input with selected value', async () => {
            const result = await renderWithContext(DropdownInput, {
                uid,
                placeholder: 'select an item',
                value: 'one',
                options
            });
            const button = (await result.findByTestId(uid)).querySelector('span.current-value');
            expect(button.innerHTML).to.equal('first <b>item</b>');
        });
    });
});
