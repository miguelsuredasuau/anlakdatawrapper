import { createChart, createUser, destroy } from '../../../../../api/test/helpers/setup.js';
import { getSessionHeaders, parseSvelteProps } from '../../../../tests/helpers/serverUtils.mjs';

describe('GET /preview/{chartId}', function () {
    let user1Obj = {};
    let user1Chart;
    let user2Obj = {};

    before(async function () {
        user1Obj = await createUser(this.server);
        user1Chart = await createChart({
            author_id: user1Obj.user.id,
            language: 'pt-BR'
        });
        user2Obj = await createUser(this.server);
    });

    after(async function () {
        await destroy(user1Chart, ...Object.values(user1Obj), ...Object.values(user2Obj));
    });

    describe('when a user accesses their chart', function () {
        let res;

        before(async function () {
            res = await this.server.inject({
                method: 'GET',
                url: `/preview/${user1Chart.id}`,
                headers: getSessionHeaders(user1Obj)
            });
        });

        it('returns code 200', async function () {
            expect(res.statusCode).to.equal(200);
        });

        it('renders HTML LANG equal to the chart locale', async function () {
            expect(res.result).to.include('<html lang="pt-BR">');
        });

        it('sets dark and light theme data properties', async function () {
            const props = parseSvelteProps(res.result);
            expect(props.themeDataDark.colors.background).to.equal('#252525');
            expect(props.themeDataLight.colors.background).to.equal('#ffffff');
        });
    });

    describe("when a user accesses another user's chart", function () {
        let res;

        before(async function () {
            res = await this.server.inject({
                method: 'GET',
                url: `/preview/${user1Chart.id}`,
                headers: getSessionHeaders(user2Obj) // Authenticate as user2, but the chart belongs to user1.
            });
        });

        it('returns error 404', async function () {
            expect(res.statusCode).to.equal(404);
        });
    });
});
