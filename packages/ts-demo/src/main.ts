export default {
    load() {
    },

    unload() {
    },

    messages: {
        'open'() {
            Editor.Panel.open('ts-demo');
        },
        'say-hello'() {
            Editor.log('Hello World!');
            Editor.Ipc.sendToPanel('ts-demo', 'ts-demo:hello');
        },
        'clicked'() {
            Editor.log('Button clicked!');
        }
    },
}

