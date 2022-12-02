import { createExports, setInitializer } from '../utils/wrap';
const exported = createExports('export_job')<typeof ExportJob>();
export default exported;
export type ExportJobModel = InstanceType<typeof ExportJob>;

import SQ, {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model
} from 'sequelize';
import User from './User';
import Chart from './Chart';

class ExportJob extends Model<InferAttributes<ExportJob>, InferCreationAttributes<ExportJob>> {
    declare id: CreationOptional<number>;
    declare key: string;
    declare priority: number;
    declare status: 'queued' | 'in_progress' | 'done' | 'failed';
    declare processed_at: Date | undefined;
    declare created_at: Date;
    declare done_at: Date | undefined;
    declare last_task: number | undefined;
    declare tasks: unknown[];
    declare log?: {
        progress: Record<string, unknown>[];
        attempts: number;
    };
    declare user_id: ForeignKey<number>;
    declare chart_id: ForeignKey<string>;

    private safeGetLog() {
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
    async logProgress(info: Record<string, unknown>) {
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

setInitializer(exported, ({ initOptions }) => {
    ExportJob.init(
        {
            id: { type: SQ.INTEGER, primaryKey: true, autoIncrement: true },

            // key will be used to identify job types
            key: SQ.STRING,

            // the larger the priority, the sooner the job will be done
            priority: SQ.INTEGER,

            // current status of the job
            status: {
                type: SQ.ENUM('queued', 'in_progress', 'done', 'failed'),
                defaultValue: 'queued'
            },

            created_at: SQ.DATE,

            // when was the status changed from queued to in_progress
            processed_at: SQ.DATE,

            // when was the status changed to done or failed
            done_at: SQ.DATE,

            // the index of the last task the client has worked on
            last_task: SQ.INTEGER,

            // the task list
            tasks: SQ.JSON,

            // a log file with debug and error messages from the client
            // should not be tampered with manually, instead please use
            // job.logProgress()
            log: SQ.JSON
        },
        {
            tableName: 'export_job',
            ...initOptions
        }
    );

    ExportJob.belongsTo(User, { foreignKey: 'user_id' });
    ExportJob.belongsTo(Chart, { foreignKey: 'chart_id' });

    return ExportJob;
});
