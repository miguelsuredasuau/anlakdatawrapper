import { BehaviorSubject } from 'rxjs';

export class SvelteSubject extends BehaviorSubject {
    set(value) {
        super.next(value);
    }
}
