import anyTest, { type TestFn } from 'ava';
import type { DB, ChartModel, UserModel } from '@datawrapper/orm-lib';
import type { ChartAccessToken } from '@datawrapper/orm-lib/db';
import { createChart, createUser, destroy } from './helpers/fixtures';
import { init } from './helpers/orm';

const test = anyTest as TestFn<{
    db: DB;
    chart: ChartModel;
    ChartAccessToken: typeof ChartAccessToken;
    user: UserModel;
}>;

test.before(async t => {
    t.context.db = await init();
    t.context.chart = await createChart();
    t.context.ChartAccessToken = t.context.db.models.chart_access_token;
    t.context.user = await createUser();
});

test.after.always(async t => {
    await destroy(t.context.user, t.context.chart);
    await t.context.db.close();
});

test('create a new ChartAccessToken', async t => {
    const { ChartAccessToken, chart } = t.context;
    let res;
    try {
        res = await ChartAccessToken.newToken({
            chart_id: chart.id
        });

        t.is(typeof res.token, 'string');
        t.is(res.token.length, 32);
        t.is(res.chart_id, chart.id);
    } finally {
        if (res && res.token) {
            await ChartAccessToken.destroy({ where: { token: res.token } });
        }
    }
});
