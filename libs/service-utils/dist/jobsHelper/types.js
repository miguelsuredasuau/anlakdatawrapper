"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobCompletionError = exports.ExportFormat = void 0;
var ExportFormat;
(function (ExportFormat) {
    ExportFormat["PDF"] = "pdf";
    ExportFormat["PNG"] = "png";
    ExportFormat["SVG"] = "svg";
})(ExportFormat = exports.ExportFormat || (exports.ExportFormat = {}));
class JobCompletionError extends Error {
    code;
    constructor(code) {
        super();
        this.code = code;
    }
}
exports.JobCompletionError = JobCompletionError;
