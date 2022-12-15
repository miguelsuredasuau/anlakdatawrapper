/* globals dw */
dw.visualization.register('dummy', function () {
    return {
        /**
         * called whenever the visualization needs to render
         * inside a given element
         */
        render(el) {
            const themeData = this.theme();
            el.innerHTML = `<div style="background:#dddddd; padding:5em; font-size:30px;text-align:center;color:#bbb;">
                Visualization<br>Placeholder
                <div class="rotate-limit">${themeData.colors?.mode?.rotateLimit ?? 0}</div>
                </div>`;
            this.renderingComplete();
        }
    };
});
