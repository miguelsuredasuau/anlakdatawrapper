"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const CodedError_1 = __importDefault(require("./CodedError"));
(0, ava_1.default)('CodedError preserves code', t => {
    const error = new CodedError_1.default('notFound', 'the chart was not found');
    t.is(error.code, 'notFound');
    t.is(error.message, 'the chart was not found');
    t.is(error.name, 'CodedError');
    t.is(typeof error.stack, 'string');
    t.is(String(error), '[notFound] the chart was not found');
});
