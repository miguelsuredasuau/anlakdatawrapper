import test from 'ava';
import CodedError from './CodedError';

test('CodedError preserves code', t => {
    const error = new CodedError('notFound', 'the chart was not found');
    t.is(error.code, 'notFound');
    t.is(error.message, 'the chart was not found');
    t.is(error.name, 'CodedError');
    t.is(typeof error.stack, 'string');
    t.is(String(error), '[notFound] the chart was not found');
});
