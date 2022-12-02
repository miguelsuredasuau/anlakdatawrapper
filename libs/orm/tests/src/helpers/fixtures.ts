// TODO: explicitly declare types
/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomInt } from 'crypto';
import type {
    ChartModel,
    ExportJobModel,
    PluginModel,
    ProductModel,
    SQ,
    TeamModel,
    ThemeModel,
    UserModel
} from '@datawrapper/orm-lib';
import {
    Chart,
    ExportJob,
    Plugin,
    Product,
    Team,
    TeamProduct,
    Theme,
    User,
    UserProduct,
    UserTeam
} from '@datawrapper/orm-lib/db';

export function createChart(props: any = {}): Promise<ChartModel> {
    const id = String(randomInt(99999));
    return Chart.create({
        id,
        ...props
    } as any);
}

export function createPlugin(props: any = {}): Promise<PluginModel> {
    const id = String(randomInt(99999));
    return Plugin.create({
        id,
        ...props
    } as any);
}

export function createProduct({ ...props }: any = {}): Promise<ProductModel> {
    const id = randomInt(2 ** 16);
    const name = String(randomInt(99999));
    return Product.create({
        id,
        name,
        ...props
    } as any);
}

export async function createTeam({ product, ...props }: any = {}): Promise<TeamModel> {
    const id = String(randomInt(99999));
    const team = await Team.create({
        id,
        ...props
    } as any);
    if (product) {
        await TeamProduct.create({
            organization_id: team.id,
            productId: product.id
        });
    }
    return team;
}

export function createTheme({ data = {}, assets = {}, ...props }: any = {}): Promise<ThemeModel> {
    const id = String(randomInt(99999));
    return Theme.create({
        id,
        data,
        assets,
        ...props
    } as any);
}

export async function createUser({ teams, product, ...props }: any = {}): Promise<UserModel> {
    const id = randomInt(2 ** 16);
    const user = await User.create({
        id,
        email: `user-${id}@datawrapper.de`,
        pwd: 'test',
        ...props
    } as any);
    if (teams) {
        for (const team of teams) {
            await UserTeam.create({
                user_id: user.id,
                organization_id: team.id,
                team_role: 'owner'
            });
        }
    }
    if (product) {
        await UserProduct.create({
            userId: user.id,
            productId: product.id
        });
    }
    return user;
}

export async function createTeamInvite({ user, team }: { user: UserModel; team: TeamModel }) {
    await UserTeam.create({
        user_id: user.id,
        organization_id: team.id,
        team_role: 'owner',
        invite_token: `${randomInt(2 ** 16)}`
    });
}

export function createJob({
    chart,
    user
}: {
    chart: ChartModel;
    user: UserModel;
}): Promise<ExportJobModel> {
    return ExportJob.create({
        chart_id: chart.id,
        user_id: user.id,
        key: 'test-task',
        created_at: new Date(),
        status: 'queued',
        priority: 0,
        tasks: [{ action: 'sleep', params: { delay: 500 } }]
    });
}

async function destroyTeam(team: TeamModel) {
    await TeamProduct.destroy({ where: { organization_id: team.id }, force: true });
    await team.destroy({ force: true });
}

async function destroyUser(user: UserModel) {
    await UserProduct.destroy({ where: { user_id: user.id }, force: true });
    await UserTeam.destroy({ where: { user_id: user.id }, force: true });
    await user.destroy({ force: true });
}

type Instance = InstanceType<typeof SQ.Model>;
type Instances = (Instance | Instances | undefined)[];

export async function destroy(...instances: Instances) {
    for (const instance of instances) {
        if (!instance) {
            continue;
        }

        if (Array.isArray(instance)) {
            await destroy(...instance);
        } else if (instance instanceof Team) {
            await destroyTeam(instance as InstanceType<typeof Team>);
        } else if (instance instanceof User) {
            await destroyUser(instance as InstanceType<typeof User>);
        } else {
            await instance.destroy({ force: true });
        }
    }
}
