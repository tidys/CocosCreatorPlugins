cc.Class({
    extends: cc.Component,
    editor: CC_EDITOR && {
        inspector: "packages://foobar/inspector.js",
    },
    properties: {
        foo: 'Foo',
        bar: 'Bar'
    }
});
