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
                model = element.model,
                prevValue = model.value;

            model.value = newValue;
            /**
            * Emitted when a the i-select changes its value
            *
            * @event i-select:valuechange
            * @param e {Object} eventobject including:
            * @param e.target {HtmlElement} the i-input element
            * @param e.prevValue {String}
            * @param e.newValue {String}
            * @since 0.1
            */
            element.emit('valuechange', {
                prevValue: prevValue,
                newValue: newValue
            });
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
                // it is safe to use setValue --> when the content hasn't changed, `setValue` doesn't do anything
                input.setValue(model.value);
                model.placeholder && input.setAttr('placeholder', model.placeholder, true);
                model['reset-value'] && input.setAttr('reset-value', model['reset-value'], true);
            },

            reset: function() {
                var model = this.model;
                model.value = model['reset-value'] || '';
                // no need to call `refreshItags` --> the reset()-method doesn't come out of the blue
                // so, the eventsystem will refresh it afterwards
            }
        });

        window.ITAGS[itagName] = Itag;
    }

    return window.ITAGS[itagName];
};
