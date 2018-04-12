'use strict';

exports.load = function () {

};

exports.unload = function () {

};

exports.messages = {
    open () {
        Editor.Panel.open('resource');
        Editor.Metrics.trackEvent({
            category: 'Packages',
            label: 'resource',
            action: 'Panel Open'
        }, null);
    }
};