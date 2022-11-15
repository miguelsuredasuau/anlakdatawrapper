"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const camelizeTopLevelKeys_1 = require("./camelizeTopLevelKeys");
const isEmpty_1 = __importDefault(require("lodash/isEmpty"));
(0, ava_1.default)('camelizeTopLevelKeys camelizes only top level keys in nested object', t => {
    const obj = {
        author_id: 1,
        'key name': 'property text',
        custom_fields: {
            'Chart ID': '1234',
            'hidden from public': true
        }
    };
    const camelizedObj = (0, camelizeTopLevelKeys_1.camelizeTopLevelKeys)(obj);
    t.true('authorId' in camelizedObj);
    t.false('author_id' in camelizedObj);
    t.true('keyName' in camelizedObj);
    t.false('key name' in camelizedObj);
    t.true('customFields' in camelizedObj);
    t.false('custom_fields' in camelizedObj);
    t.true('Chart ID' in camelizedObj.customFields);
    t.false('chartID' in camelizedObj.customFields);
    t.true('hidden from public' in camelizedObj.customFields);
    t.false('hiddenFromPublic' in camelizedObj.customFields);
});
(0, ava_1.default)('camelizeTopLevelKeys does not crash on empty object', t => {
    const obj = {};
    const camelizedObj = (0, camelizeTopLevelKeys_1.camelizeTopLevelKeys)(obj);
    t.true((0, isEmpty_1.default)(camelizedObj));
});
