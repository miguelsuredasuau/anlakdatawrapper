"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withTransaction = exports.rawQuery = void 0;
const internal_orm_state_1 = require("./internal-orm-state");
__exportStar(require("./models"), exports);
// Utility method which would be really hard to implement with proper type declarations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wrapMethod = (key) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((...args) => (0, internal_orm_state_1.getDB)()[key](...args));
};
exports.rawQuery = wrapMethod('query');
exports.withTransaction = wrapMethod('transaction');
