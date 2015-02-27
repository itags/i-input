module.exports = function (window) {
    "use strict";

    require('./css/i-input.css');
    require('itags.core')(window);

    var itagName = 'i-input', // <-- define your own itag-name here
        DOCUMENT = window.document,
        ITSA = window.ITSA,
        Event = ITSA.Event,
        Itag, IFormElement;

    if (!window.ITAGS[itagName]) {

        IFormElement = require('i-formelement')(window);

        Event.before(itagName+':manualfocus', function(e) {
            // the i-select itself is unfocussable, but its button is
            // we need to patch `manualfocus`,
            // which is emitted on node.focus()
            // a focus by userinteraction will always appear on the button itself
            // so we don't bother that
            var element = e.target;
            e.preventDefault();
            element.itagReady().then(
                function() {
                    var input = element.getElement('input');
                    input && input.focus(true, true);
                }
            );
        });

        Event.after('valuechange', function(e) {
            var newValue = e.value,
                element = e.target.getParent(),
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
            // because `valuechange` does no finalize, we need to refresh
            // the itags manually:
            DOCUMENT.refreshItags();
        }, 'i-input > input');

        Itag = IFormElement.subClass(itagName, {
            attrs: {
                'i-prop': 'string',
                'reset-value': 'string',
                'placeholder': 'string',
                'readonly': 'boolean'
            },

            init: function() {
                var element = this,
                    designNode = element.getItagContainer(),
                    value = designNode.getText();

                element.defineWhenUndefined('value', value)
                       // set the reset-value to the inital-value in case `reset-value` was not present
                       .defineWhenUndefined('reset-value', value);
            },

            render: function() {
                this.setHTML('<input value="'+this.model.value+'" />');
            },

            sync: function() {
                var element = this,
                    model = element.model,
                    input = element.getElement('>input');
                // it is safe to use setValue --> when the content hasn't changed, `setValue` doesn't do anything
                input.setValue(model.value);

// model.placeholder && input.setAttr('placeholder', model.placeholder, true);
// model['reset-value'] && input.setAttr('reset-value', model['reset-value'], true);

            },

            currentToReset: function() {
                var model = this.model;
                model['reset-value'] = model.value;
            },

            reset: function() {
                var model = this.model;
                model.value = model['reset-value'];
                // no need to call `refreshItags` --> the reset()-method doesn't come out of the blue
                // so, the eventsystem will refresh it afterwards
            }
        });

        window.ITAGS[itagName] = Itag;
    }

    return window.ITAGS[itagName];
};
