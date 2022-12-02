import type { DB } from './dbTypes';

let db: DB | null = null;

export const setDB = (dbInput: DB) => {
    db = dbInput;
};

export const getDB = () => {
    if (!db) {
        throw new Error('ORM is not initialized');
    }

    return db;
};
