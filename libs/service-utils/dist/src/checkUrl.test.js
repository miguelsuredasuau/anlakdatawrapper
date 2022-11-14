"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const checkUrl_1 = __importDefault(require("./checkUrl"));
(0, ava_1.default)('normal URLs work fine', t => {
    t.true((0, checkUrl_1.default)('https://www.datawrapper.de'));
    t.true((0, checkUrl_1.default)('http://app.datawrapper.local'));
    t.true((0, checkUrl_1.default)('mailto://support@datawrapper.de'));
    t.true((0, checkUrl_1.default)('ftp://example.com'));
});
(0, ava_1.default)('unix URLs are rejected', t => {
    t.false((0, checkUrl_1.default)('unix://foo'));
    t.false((0, checkUrl_1.default)('foo://unix:foo'));
});
