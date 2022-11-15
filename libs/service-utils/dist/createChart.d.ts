import type { AccessToken } from './accessTokenModelTypes';
import type { Chart as TChart } from './chartModelTypes';
import type { Server } from './serverTypes';
import type { User as TUser } from './userModelTypes';
declare type AllowedPayload = {
    title?: string;
    theme?: string;
    type?: string;
    language?: string;
    last_edit_step?: number;
    forkable?: boolean;
    forked_from?: string;
    is_fork?: boolean;
    external_data?: string;
};
declare type Payload = AllowedPayload & {
    teamId?: string;
    folderId?: string;
};
/**
 * Creates a new visualization
 * @exports createChart
 * @kind function
 *
 * @param {object} options.server     - instance of API or Frontend service
 * @param {object} options.user       - instance of authenticated user
 * @param {object} options.session    - instance of current session
 * @param {object} options.payload    - presets for the new visualization
 * @param {object} options.payload.title    - visualization title
 * @param {object} options.payload.theme   - visualization theme
 * @param {object} options.payload.type     - visualization type
 * @param {object} options.payload.language         - visualization language
 * @param {object} options.payload.last_edit_step   - visualization last_edit_step
 * @param {object} options.payload.forkable          - should vis be forkable
 * @param {object} options.payload.forked_from      - chart id of source for forks
 * @param {object} options.payload.is_fork           - chart id of source for forks
 * @param {object} options.payload.external_data    - chart id of source for forks
 * @param {object} options.payload.folderId          - folder id, will be checked and used to determine team
 * @param {object} options.payload.teamId            - team id will be used to determine defaults
 * @param {string} [newChartId]         - when supplied, new chart is created with this ID instead of auto-generated one
 *
 * @returns {Chart} -- instance of new chart object
 */
export declare function createChart({ server, user, payload, session: sessionId, token }: {
    server: Server;
    user: TUser;
    payload: Payload;
    session: string;
    token: AccessToken;
}, newChartId?: string | null): Promise<TChart>;
export {};
