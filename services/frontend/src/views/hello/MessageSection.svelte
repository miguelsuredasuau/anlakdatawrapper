<script>
    import MessageDisplay from '_partials/displays/MessageDisplay.svelte';
</script>

<div class="section pl-0 pt-0">
    <h3 id="message" class="title is-3">Message</h3>
    <p class="subtitle is-5">
        Use wrapper component <tt>&lt;Message /&gt;</tt>
    </p>

    <div class="columns">
        <div class="column">
            <MessageDisplay title="New locator maps">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. <strong
                    >Pellentesque risus mi</strong
                >, tempus quis placerat ut, porta nec nulla. Vestibulum rhoncus ac ex sit amet
                fringilla. Nullam gravida purus diam, et dictum
                <a href="#/link">felis venenatis</a>
                efficitur. Aenean ac <em>eleifend lacus</em>, in mollis lectus. Donec sodales, arcu
                et sollicitudin porttitor, tortor urna tempor ligula, id porttitor mi magna a neque.
                Donec dui urna, vehicula et sem eget, facilisis sodales sem.
            </MessageDisplay>
        </div>
        <div class="column">
            <MessageDisplay title="Heads up!" type="warning">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. <strong
                    >Pellentesque risus mi</strong
                >, tempus quis placerat ut, porta nec nulla. Vestibulum rhoncus ac ex sit amet
                fringilla. Nullam gravida purus diam, et dictum
                <a href="#/link">felis venenatis</a> efficitur.
            </MessageDisplay>
        </div>
        <div class="column">
            <MessageDisplay type="">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. <strong
                    >Pellentesque risus mi</strong
                >, tempus quis placerat ut, porta nec nulla. Vestibulum rhoncus ac ex sit amet
                fringilla. Nullam gravida purus diam, et dictum
                <a href="#/link">felis venenatis</a> efficitur.
            </MessageDisplay>
        </div>
    </div>
</div>
