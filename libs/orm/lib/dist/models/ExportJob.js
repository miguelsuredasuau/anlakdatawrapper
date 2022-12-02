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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wrap_1 = require("../utils/wrap");
const exported = (0, wrap_1.createExports)('export_job')();
exports.default = exported;
const sequelize_1 = __importStar(require("sequelize"));
const User_1 = __importDefault(require("./User"));
const Chart_1 = __importDefault(require("./Chart"));
class ExportJob extends sequelize_1.Model {
    safeGetLog() {
        const { progress = [], attempts = 0, ...rest } = this.get('log') || {};
        return { progress, attempts, ...rest };
    }
    /**
     * sets the processed_at timestamp, increments the attempts counter
     * and initializes the progress array
     */
    async process() {
        const log = this.safeGetLog();
        this.set('log', {
            ...log,
            attempts: log.attempts + 1
        });
        this.processed_at = new Date();
        this.status = 'in_progress';
        return this.save({ fields: ['processed_at', 'log', 'status'] });
    }
    /**
     * adds a new progress log entry
     */
    async logProgress(info) {
        const log = this.safeGetLog();
        this.set('log', {
            ...log,
            progress: log.progress.concat([
                {
                    ...info,
                    timestamp: new Date()
                }
            ])
        });
        return this.save({ fields: ['log'] });
    }
}
(0, wrap_1.setInitializer)(exported, ({ initOptions }) => {
    ExportJob.init({
        id: { type: sequelize_1.default.INTEGER, primaryKey: true, autoIncrement: true },
        // key will be used to identify job types
        key: sequelize_1.default.STRING,
        // the larger the priority, the sooner the job will be done
        priority: sequelize_1.default.INTEGER,
        // current status of the job
        status: {
            type: sequelize_1.default.ENUM('queued', 'in_progress', 'done', 'failed'),
            defaultValue: 'queued'
        },
        created_at: sequelize_1.default.DATE,
        // when was the status changed from queued to in_progress
        processed_at: sequelize_1.default.DATE,
        // when was the status changed to done or failed
        done_at: sequelize_1.default.DATE,
        // the index of the last task the client has worked on
        last_task: sequelize_1.default.INTEGER,
        // the task list
        tasks: sequelize_1.default.JSON,
        // a log file with debug and error messages from the client
        // should not be tampered with manually, instead please use
        // job.logProgress()
        log: sequelize_1.default.JSON
    }, {
        tableName: 'export_job',
        ...initOptions
    });
    ExportJob.belongsTo(User_1.default, { foreignKey: 'user_id' });
    ExportJob.belongsTo(Chart_1.default, { foreignKey: 'chart_id' });
    return ExportJob;
});
