import Link from './Link.svelte';
import chai, { expect } from 'chai';
import chaiDom from 'chai-dom';
import { setConfig } from '../../../../tests/helpers/clientUtils';
import { render } from '@testing-library/svelte';

setConfig({ testIdAttribute: 'data-uid' });

chai.use(chaiDom);

describe('Link', () => {
    it('should render a button element by default', async () => {
        const { getByRole } = await render(Link, {});

        const button = getByRole('button');
        expect(button).to.not.have.attribute('href');
        expect(button).to.have.tagName('button');
        expect(button).to.not.have.attribute('disabled');
    });

    it('should render an a element when href is present', async () => {
        const { getByRole } = await render(Link, {
            href: 'https://example.com/'
        });

        const link = getByRole('link');
        expect(link).to.have.attribute('href', 'https://example.com/');
        expect(link).to.have.tagName('a');
    });

    it('should have disabled attribute when disabled prop is present', async () => {
        const { getByRole } = await render(Link, {
            disabled: true
        });

        const button = getByRole('button');
        expect(button).to.have.attribute('disabled');
    });

    it('should have underline by default', async () => {
        const { getByRole } = await render(Link, {});

        const button = getByRole('button');
        expect(button).to.have.class('link-underline');
    });

    it('should handle underline on hover', async () => {
        const { getByRole } = await render(Link, {
            underline: 'hover'
        });

        const button = getByRole('button');
        expect(button).to.have.class('link-underline-hover');
    });

    it('should handle no underline', async () => {
        const { getByRole } = await render(Link, {
            underline: false
        });

        const button = getByRole('button');
        expect(button).to.not.have.class('link-underline');
        expect(button).to.not.have.class('link-underline-hover');
    });
});
