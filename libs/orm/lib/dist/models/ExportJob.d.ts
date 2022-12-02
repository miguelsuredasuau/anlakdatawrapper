declare const exported: import("../utils/wrap").ExportedLite<"export_job", typeof ExportJob>;
export default exported;
export type ExportJobModel = InstanceType<typeof ExportJob>;
import { CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
declare class ExportJob extends Model<InferAttributes<ExportJob>, InferCreationAttributes<ExportJob>> {
    id: CreationOptional<number>;
    key: string;
    priority: number;
    status: 'queued' | 'in_progress' | 'done' | 'failed';
    processed_at: Date | undefined;
    created_at: Date;
    done_at: Date | undefined;
    last_task: number | undefined;
    tasks: unknown[];
    log?: {
        progress: Record<string, unknown>[];
        attempts: number;
    };
    user_id: ForeignKey<number>;
    chart_id: ForeignKey<string>;
    private safeGetLog;
    /**
     * sets the processed_at timestamp, increments the attempts counter
     * and initializes the progress array
     */
    process(): Promise<this>;
    /**
     * adds a new progress log entry
     */
    logProgress(info: Record<string, unknown>): Promise<this>;
}
