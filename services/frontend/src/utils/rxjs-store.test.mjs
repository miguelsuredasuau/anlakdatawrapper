import { SubscriptionCollection } from './rxjs-store.mjs';
import sinon from 'sinon';

describe('SubscriptionCollection', function () {
    it('unsubscribes all subscriptions', async function () {
        const collection = new SubscriptionCollection();

        const unsubscribe1 = sinon.spy();
        const unsubscribe2 = sinon.spy();
        const unsubscribe3 = sinon.spy();

        collection.add(unsubscribe1);
        collection.add(unsubscribe2);
        collection.add({ unsubscribe: unsubscribe3 });

        collection.unsubscribe();

        expect(unsubscribe1.calledOnce).to.equal(true);
        expect(unsubscribe2.calledOnce).to.equal(true);
        expect(unsubscribe3.calledOnce).to.equal(true);
    });
});
