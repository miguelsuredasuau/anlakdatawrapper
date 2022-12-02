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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModels = void 0;
const wrap_1 = require("../utils/wrap");
const models = __importStar(require("./allModels"));
const associations = __importStar(require("./assoc"));
const modelsList = Object.values(models);
const associationsList = Object.values(associations);
const initModels = (orm) => {
    for (const model of modelsList) {
        (0, wrap_1.setInitializerParams)(model, orm);
    }
    for (const model of modelsList) {
        (0, wrap_1.ensureModelInitialized)(model);
    }
    for (const association of associationsList) {
        association();
    }
    return orm.db;
};
exports.initModels = initModels;
