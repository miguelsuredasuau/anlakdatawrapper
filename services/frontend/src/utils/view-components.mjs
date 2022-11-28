export class ViewComponents {
    constructor() {
        this.viewComponents = new Map();
    }

    set(key, component) {
        this.viewComponents.set(key, component);
    }

    get(key) {
        if (!this.viewComponents.has(key)) {
            console.error(`View component '${key}' is not registered`);
            return false;
        }
        return this.viewComponents.get(key);
    }
}
