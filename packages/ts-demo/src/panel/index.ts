import Vue from 'vue'
import App from './index.vue'

Editor.Panel.extend({
    style: `
    :host { margin: 5px; }
    h2 { color: #f90; }
  `,

    template: "<div id='app'></div>",
    ready() {
        new Vue({
            render: h => h(App),
        }).$mount('#app')
    },

    messages: {
        'ts-demo:hello'(event) {
            this.$label.innerText = 'Hello!';
        }
    }
});
