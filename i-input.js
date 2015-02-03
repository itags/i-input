module.exports = function (window) {
    "use strict";

    require('polyfill/polyfill-base.js');
    require('./css/i-input.css');

    var itagCore =  require('itags.core')(window),
        itagName = 'i-input', // <-- define your own itag-name here
        DOCUMENT = window.document,
        Event = require('event-dom/extra/valuechange.js')(window),
        Itag;

    if (!window.ITAGS[itagName]) {

        Event.after('valuechange', function(e) {
            var newValue = e.value,
                element = e.target,
                model = element.model;

            model.value = newValue;
        }, 'i-select > input');

        Itag = DOCUMENT.createItag(itagName, {
            attrs: {
                'reset-value': 'string',
                'placeholder': 'string',
                'readonly': 'boolean',
                'fm-lastitem': 'boolean',
                'fm-selectionstart': 'number',
                'fm-selectionend': 'number'
            },

            init: function() {
                var element = this,
                    value = element.getText(),
                    content;

                element.setValueOnce('value', value);

                // building the template of the itag:
                content = '<input>' + value + '</input>';

                // set the content:
                element.setHTML(content);
            },

            sync: function() {
                var element = this,
                    model = element.model,
                    input = element.getElement('>input');
                input.setValue(model.value);
                model.placeholder && input.setAttr('placeholder', model.placeholder, true);
                model['reset-value'] && input.setAttr('reset-value', model['reset-value'], true);
            },

            reset: function() {
                var model = this.model;
                model.value = model['reset-value'] || '';
                DOCUMENT.refreshItags(); // won't run when object.observe is available
            }
        });

        window.ITAGS[itagName] = Itag;
    }

    return window.ITAGS[itagName];
};
