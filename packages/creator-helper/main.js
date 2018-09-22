'use strict';

module.exports = {
  load () {
    // execute when package loaded
  },

  unload () {
    // execute when package unloaded
  },

  // register your ipc messages here
  messages: {
    'open-docs' () {
      // open entry panel registered in package.json
      Editor.Panel.open('creator-helper.docs');
    },
    'say-hello' () {
      Editor.log('Hello World!');
      // send ipc message to panel
      Editor.Ipc.sendToPanel('creator-helper', 'creator-helper:hello');
    },
    'clicked' () {
      Editor.log('Button clicked!');
    }
  },
};