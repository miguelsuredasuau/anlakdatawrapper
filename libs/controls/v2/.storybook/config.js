import { addParameters, configure } from '@datawrapper/storybook-svelte2';
import localeEN from '../stories/static/locale.en.json';
import localeDE from '../stories/static/locale.de.json';

function loadStories() {
    require('../stories/index.js');

    if (!document.querySelector('.container-fluid')) {
        // todo: use a nice jquery-like framework instead of vanilla DOM
        const d1 = document.createElement('div');
        d1.setAttribute('class', 'container-fluid');
        d1.innerHTML = `<div class='dw-create-visualize chart-editor chart-editor-web'>
    <div class='visconfig'>
        <div class='vis-options form-horizontal'>
            <div class='row'>
                <div class='span4'></span>
            </div>
        </div>
    </div>
</div>`;
        d1.querySelector('.span4').appendChild(document.querySelector('#root'));
        d1.querySelector('.span4').style.marginRight = '20px';
        document.body.appendChild(d1);
    }

    // You can require as many stories as you need.
}

addParameters({
    options: {
        showPanel: false
    }
});

// fake userdata API
const __userData = JSON.parse(window.localStorage.getItem('datawrapper/userData') || '{}');

global.dw = {
    backend: {
        __messages: {
            core: localeEN
        },
        __userData,
        setUserData(key, value) {
            __userData[key] = value;
            window.localStorage.setItem('datawrapper/userData', JSON.stringify(__userData));
        }
    }
};

global.setLanguage = lang => {
    const locale = lang === 'en' ? localeEN : localeDE;
    Object.keys(locale).forEach(key => (global.dw.backend.__messages.core[key] = locale[key]));
};

configure(loadStories, module);
