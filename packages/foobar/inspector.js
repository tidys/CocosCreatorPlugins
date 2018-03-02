"use strict";
Vue.component('foobar-inspector', {
    template: `
        <ui-prop v-prop="target.foo"></ui-prop>
        <ui-prop v-prop="target.bar"></ui-prop>
    `,
    props: {
        target: {
            twoWay: true,
            type: Object,
        }
    }
});