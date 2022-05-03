export function waitFor(condition, action) {
    if (!condition())
        return setTimeout(() => {
            waitFor(condition, action);
        }, 10);
    action();
}
