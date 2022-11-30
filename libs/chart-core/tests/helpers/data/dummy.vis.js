/* globals dw */
dw.visualization.register('dummy', function () {
    return {
        /**
         * called whenever the visualization needs to render
         * inside a given element
         */
        render(el) {
            el.innerHTML =
                '<div style="background:#dddddd; padding:5em; font-size:30px;text-align:center;color:#bbb;">Visualization<br>Placeholder</div>';
            this.renderingComplete();
        }
    };
});
