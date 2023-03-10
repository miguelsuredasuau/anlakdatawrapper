"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.camelizeTopLevelKeys = void 0;
const humps_1 = require("humps");
function camelizeTopLevelKeys(obj) {
    // Taken from humps library, see here:
    // https://github.com/domchristie/humps/blob/d612998749922a76c68d4d9c8b5ae93f02595019/humps.js#L29-L34
    const outputObj = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            outputObj[(0, humps_1.camelize)(key)] = obj[key];
        }
    }
    return outputObj;
}
exports.camelizeTopLevelKeys = camelizeTopLevelKeys;
