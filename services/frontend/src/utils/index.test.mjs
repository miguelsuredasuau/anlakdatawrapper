import { expect } from 'chai';
import { getNestedObjectKeys } from './index.js';
import { filterNestedObjectKeys } from './index.js';
import clone from 'lodash/cloneDeep';

describe('getNestedObjectKeys', function () {
    it('returns correct keys', function () {
        const keys = getNestedObjectKeys({
            answer: 42,
            metadata: {
                transpose: false,
                'null-key': null,
                describe: {
                    intro: 'Intro',
                    enabled: false
                }
            },
            today: new Date()
        });
        expect(keys).to.have.same.members([
            'answer',
            'today',
            'metadata.transpose',
            'metadata.null-key',
            'metadata.describe.intro',
            'metadata.describe.enabled'
        ]);
    });
});

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
