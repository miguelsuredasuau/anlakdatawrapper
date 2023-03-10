import chai from 'chai';
import { filterNestedObjectKeys, waitFor } from './index.js';
import clone from 'lodash/cloneDeep';

const { expect } = chai;

describe('filterNestedObjectKeys', function () {
    const srcObject = {
        title: 'Foo',
        metadata: {
            describe: {
                intro: 'intro',
                notes: 'also here'
            },
            visualize: {
                base: 1
            }
        }
    };
    const clonedSrc = clone(srcObject);

    it('removes a first-level key', function () {
        const filtered = filterNestedObjectKeys(srcObject, ['title']);
        expect(filtered).to.deep.equal({
            metadata: {
                describe: {
                    intro: 'intro',
                    notes: 'also here'
                },
                visualize: {
                    base: 1
                }
            }
        });
    });

    it('removes a nested first-level key', function () {
        const filtered = filterNestedObjectKeys(srcObject, ['metadata.describe']);
        expect(filtered).to.deep.equal({
            title: 'Foo',
            metadata: {
                visualize: {
                    base: 1
                }
            }
        });
    });

    it('removes a nested first-level key [array]', function () {
        const filtered = filterNestedObjectKeys(srcObject, [['metadata', 'describe']]);
        expect(filtered).to.deep.equal({
            title: 'Foo',
            metadata: {
                visualize: {
                    base: 1
                }
            }
        });
    });

    it('removes multiple keys', function () {
        const filtered = filterNestedObjectKeys(srcObject, ['title', 'metadata.describe']);
        expect(filtered).to.deep.equal({
            metadata: {
                visualize: {
                    base: 1
                }
            }
        });
    });

    it('removes removes empty keys', function () {
        const filtered = filterNestedObjectKeys(srcObject, ['metadata.visualize.base']);
        expect(filtered).to.deep.equal({
            title: 'Foo',
            metadata: {
                describe: {
                    intro: 'intro',
                    notes: 'also here'
                }
            }
        });
    });

    it('does not alter the srcObject', function () {
        filterNestedObjectKeys(srcObject, ['title']);
        expect(srcObject).to.deep.equal(clonedSrc);
        filterNestedObjectKeys(srcObject, ['metadata.visualize.base']);
        expect(srcObject).to.deep.equal(clonedSrc);
    });
});

describe('waitFor', () => {
    it('resolves once the condition func is truthy', async () => {
        let result = false;
        setTimeout(() => (result = 42), 200);
        const res = await waitFor(() => result);
        expect(res).to.equal(42);
    });

    it('times out', async () => {
        let result = false;
        setTimeout(() => (result = true), 2000);
        try {
            await waitFor(() => result, { timeout: 500 });
        } catch (e) {
            expect(e).to.be.an('error');
            expect(e.message).to.equal('waitFor timeout exceeded');
        }
    });
});
