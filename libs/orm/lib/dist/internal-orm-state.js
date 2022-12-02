"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDB = exports.setDB = void 0;
let db = null;
const setDB = (dbInput) => {
    db = dbInput;
};
exports.setDB = setDB;
const getDB = () => {
    if (!db) {
        throw new Error('ORM is not initialized');
    }
    return db;
};
exports.getDB = getDB;
