cc.Class({
    extends: cc.Component,
    editor: CC_EDITOR && {
        inspector: "packages://foobar/inspector.js",
    },
    properties: {
        foo: {
            default: "foo",
            type: cc.String,
            notify() {
                console.log("change");
            },
        },
        bar: 'Bar'
    }
});
