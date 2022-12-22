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
                <span class="label legend-text">First label</span>
                <span class="label legend-text">Another label</span>
                <span class="label value">100</span>
                <span class="label value">200</span>
                <span class="label inverted"><span>Inverted inside label</span></span>
                <span class="label inverted"><span>Another inverted inside label</span></span>
                <span class="label inside"><span>Non-inverted inside label</span></span>
                <span class="label inside"><span>Another non-inverted inside label</span></span>
                </div>`;
            this.renderingComplete();
        }
    };
});
