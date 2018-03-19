'use strict';

module.exports = {
  load () {
  },

  unload () {
  },

  messages: {
    open() {
      Editor.Panel.open('replace-icons');
      Editor.Metrics.trackEvent({
        category: 'Packages',
        label: 'replace-icons',
        action: 'Panel Open'
      }, null);
    },
  }
};
