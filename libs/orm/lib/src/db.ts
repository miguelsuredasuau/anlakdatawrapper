import type { DB } from './dbTypes';
import { getDB } from './internal-orm-state';

export * from './models';

// Utility method which would be really hard to implement with proper type declarations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wrapMethod = <TKey extends keyof DB>(key: TKey): DB[TKey] => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((...args: any[]) => getDB()[key](...args)) as any;
};

export const rawQuery = wrapMethod('query');
export const withTransaction = wrapMethod('transaction');
