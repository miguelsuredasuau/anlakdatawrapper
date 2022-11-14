import { camelize } from 'humps';

export = function camelizeTopLevelKeys(obj: Record<string, unknown>): Record<string, unknown> {
    // Taken from humps library, see here:
    // https://github.com/domchristie/humps/blob/d612998749922a76c68d4d9c8b5ae93f02595019/humps.js#L29-L34
    const outputObj: Record<string, unknown> = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            outputObj[camelize(key)] = obj[key];
        }
    }
    return outputObj;
};
