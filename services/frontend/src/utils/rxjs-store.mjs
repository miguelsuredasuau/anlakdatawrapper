import { BehaviorSubject } from 'rxjs';

export class SvelteSubject extends BehaviorSubject {
    set(value) {
        super.next(value);
    }
}

export class SubscriptionCollection extends Set {
    unsubscribe() {
        for (const unsubscribe of this.values()) {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            } else if (typeof unsubscribe.unsubscribe === 'function') {
                unsubscribe.unsubscribe();
            }
        }
    }
}
