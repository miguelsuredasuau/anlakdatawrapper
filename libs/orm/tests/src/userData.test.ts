import anyTest, { type TestFn } from 'ava';
import type { DB, UserModel } from '@datawrapper/orm-lib';
import type { UserData } from '@datawrapper/orm-lib/db';
import { createUser, destroy } from './helpers/fixtures';
import { init } from './helpers/orm';

const test = anyTest as TestFn<{
    db: DB;
    getUserData: typeof UserData.getUserData;
    setUserData: typeof UserData.setUserData;
    unsetUserData: typeof UserData.unsetUserData;
    user1: UserModel;
    user2: UserModel;
    userData: Awaited<ReturnType<DB['models']['user_data']['create']>>;
}>;

test.before(async t => {
    t.context.db = await init();

    const UserData = t.context.db.models.user_data;
    t.context.getUserData = UserData.getUserData;
    t.context.setUserData = UserData.setUserData;
    t.context.unsetUserData = UserData.unsetUserData;

    t.context.user1 = await createUser();
    t.context.user2 = await createUser();
    t.context.userData = await UserData.create({
        user_id: t.context.user2.id,
        key: 'test',
        data: 'value'
    });
});

test.after.always(async t => {
    await destroy(t.context.userData, t.context.user2, t.context.user1);
    await t.context.db.close();
});

test('default for missing userdata', async t => {
    const { getUserData, user1 } = t.context;
    const val = await getUserData(user1.id, 'missing', '42');
    t.is(val, '42');
});

test('get and update existing userdata', async t => {
    const { getUserData, setUserData, user2 } = t.context;
    // get old value
    const val1 = (await getUserData(user2.id, 'test')) as string;
    t.is(val1, 'value');
    // set new value
    await setUserData(user2.id, 'test', 'new-value');
    const val2 = await getUserData(user2.id, 'test');
    t.is(val2, 'new-value');
    // reset to old value
    await setUserData(user2.id, 'test', val1);
    const val3 = await getUserData(user2.id, 'test');
    t.is(val3, 'value');
});

test('set and remove new userdata', async t => {
    const { getUserData, setUserData, unsetUserData, user1 } = t.context;
    // get old value
    const val1 = await getUserData(user1.id, 'missing-key');
    // set new value
    await setUserData(user1.id, 'missing-key', 'new-value');
    const val2 = await getUserData(user1.id, 'missing-key');
    // reset to old value
    await unsetUserData(user1.id, 'missing-key');
    const val3 = await getUserData(user1.id, 'missing-key');
    t.is(val1, undefined);
    t.is(val2, 'new-value');
    t.is(val3, undefined);
});
