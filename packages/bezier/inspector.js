Vue.component('bezier-editor-inspector', {
    template: `
<ui-prop name="Line Color" type="cc.Color">
    <ui-color class ='flex-1'></ui-color>
</ui-prop>
  `,

    props: {
        target: {
            twoWay: true,
            type: Object,
        },
    },
});
