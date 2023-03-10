import test from 'ava';
import getOverlayColumnTitle from './getOverlayColumnTitle';

const visOne = {
    dataset: {
        hasColumn() {
            return true;
        },
        column(title: string) {
            return {
                title() {
                    return title;
                }
            };
        }
    }
};

const visTwo = {
    dataset: {
        hasColumn() {
            return false;
        },
        column() {
            throw new Error('should not be called');
        }
    }
};

const colName = 'a-super-col-name';
const ZERO_BASELINE = '--zero-baseline--';

test('has a column name', t => {
    t.deepEqual(getOverlayColumnTitle(visOne, colName, ZERO_BASELINE), colName);
});

test('has no column name', t => {
    t.deepEqual(getOverlayColumnTitle(visTwo, colName, ZERO_BASELINE), '');
});

test('column name is ZERO_BASELINE', t => {
    t.deepEqual(getOverlayColumnTitle(visOne, ZERO_BASELINE, ZERO_BASELINE), '0');
});
