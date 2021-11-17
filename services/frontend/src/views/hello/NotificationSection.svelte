<script>
    import NotificationDisplay from '_partials/displays/NotificationDisplay.svelte';
</script>

<div class="section pl-0 pt-0">
    <h3 id="notifications" class="title is-3">Notifications</h3>
    <p class="subtitle is-5">
        Use wrapper component <tt>&lt;Notification /&gt;</tt>
    </p>

    <NotificationDisplay>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit lorem ipsum dolor. <strong
            >Pellentesque risus mi</strong
        >, tempus quis placerat ut, porta nec nulla. Vestibulum rhoncus ac ex sit amet fringilla.
        Nullam gravida purus diam, et dictum
        <a href="/#foo">felis venenatis</a> efficitur.
    </NotificationDisplay>

    <NotificationDisplay type="primary">
        <strong>Primary!</strong> Primar lorem ipsum dolor sit amet, consectetur adipiscing elit
        lorem ipsum dolor.
        <strong>Pellentesque risus mi</strong>, tempus quis placerat ut, porta nec nulla. Vestibulum
        rhoncus ac ex sit amet fringilla. Nullam gravida purus diam, et dictum
        <a href="/#foo">felis venenatis</a> efficitur.
    </NotificationDisplay>

    <NotificationDisplay type="info">
        <strong>Info!</strong> Primar lorem ipsum dolor sit amet, consectetur adipiscing elit lorem
        ipsum dolor.
        <strong>Pellentesque risus mi</strong>, tempus quis placerat ut, porta nec nulla. Vestibulum
        rhoncus ac ex sit amet fringilla. Nullam gravida purus diam, et dictum
        <a href="/#foo">felis venenatis</a> efficitur.
    </NotificationDisplay>

    <NotificationDisplay type="success">
        <strong>Success!</strong> Primar lorem ipsum dolor sit amet, consectetur adipiscing elit
        lorem ipsum dolor.
        <strong>Pellentesque risus mi</strong>, tempus quis placerat ut, porta nec nulla. Vestibulum
        rhoncus ac ex sit amet fringilla. Nullam gravida purus diam, et dictum
        <a href="/#foo">felis venenatis</a> efficitur.
    </NotificationDisplay>

    <NotificationDisplay type="warning" deletable={false}>
        <strong>Warning!</strong> Primar lorem ipsum dolor sit amet, consectetur adipiscing elit
        lorem ipsum dolor.
        <strong>Pellentesque risus mi</strong>, tempus quis placerat ut, porta nec nulla. Vestibulum
        rhoncus ac ex sit amet fringilla. Nullam gravida purus diam, et dictum
        <a href="/#foo">felis venenatis</a> efficitur. Not deletable :)
    </NotificationDisplay>

    <NotificationDisplay type="danger">
        <strong>Danger!</strong> Primar lorem ipsum dolor sit amet, consectetur adipiscing elit
        lorem ipsum dolor.
        <strong>Pellentesque risus mi</strong>, tempus quis placerat ut, porta nec nulla. Vestibulum
        rhoncus ac ex sit amet fringilla. Nullam gravida purus diam, et dictum
        <a href="/#foo">felis venenatis</a> efficitur.
    </NotificationDisplay>
</div>
