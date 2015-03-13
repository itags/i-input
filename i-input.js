module.exports = function (window) {
    "use strict";

    require('./css/i-input.css');
    require('itags.core')(window);

    var itagName = 'i-input', // <-- define your own itag-name here
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
                    input && input.focus(true); // MUST be silent
                }
            );
        });

        Event.after(['keypress', 'mouseup', 'panup', 'mousedown', 'pandown'], function(e) {
            var inputNode = e.target,
                element = inputNode.getParent(),
                model = element.model;
            model['selection-start'] = inputNode.selectionStart || 0;
            model['selection-end'] = inputNode.selectionEnd || 0;
        }, 'i-input input');

        Event.after('valuechange', function(e) {
            var element = e.target.getParent(),
                newValue = e.value,
                model = element.model,
                prevValue = model.value,
                validNumber, min, max;
            model.value = newValue;
            switch (model.type) {
                case 'number':
                    validNumber = model.floated ? newValue.validateFloat() : newValue.validateNumber();
                    if (validNumber) {
                        min = model.min;
                        max = model.max;
                        if ((typeof min==='number') && (newValue<min)) {
                            validNumber = false;
                        }
                        else if ((typeof max==='number') && (newValue>max)) {
                            validNumber = false;
                        }
                    }
                    model.invalid = !validNumber;
                    break;
                case 'email':
                    model.invalid = !newValue.validateEmail();
                    break;
                case 'url':
                    model.invalid = !newValue.validateURL();
                    break;
                default:
                    model.invalid = false;
            }
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
        }, 'i-input > input');

        Itag = IFormElement.subClass(itagName, {
            attrs: {
                'i-prop': 'string',
                'reset-value': 'string',
                placeholder: 'string',
                readonly: 'boolean',
                primaryonenter: 'boolean',
                min: 'number',
                max: 'number',
                floated: 'boolean',
                type: 'string',
                invalid: 'boolean',
                format: 'string',
                'selection-start': 'number',
                'selection-end': 'number'
            },

            init: function() {
                var element = this,
                    designNode = element.getItagContainer(),
                    model = element.model,
                    value = designNode.getText(),
                    validNumber, min, max;

                element.defineWhenUndefined('value', value)
                       // set the reset-value to the inital-value in case `reset-value` was not present
                       .defineWhenUndefined('reset-value', value);
                value = model.value;
                switch (model.type) {
                    case 'number':
                        validNumber = model.floated ? value.validateFloat() : value.validateNumber();
                        if (validNumber) {
                            min = model.min;
                            max = model.max;
                            if ((typeof min==='number') && (value<min)) {
                                validNumber = false;
                            }
                            else if ((typeof max==='number') && (value>max)) {
                                validNumber = false;
                            }
                        }
                        model.invalid = !validNumber;
                        break;
                    case 'email':
                        model.invalid = !value.validateEmail();
                        break;
                    case 'url':
                        model.invalid = !value.validateURL();
                        break;
                    default:
                        model.invalid = false;
                }
            },

            render: function() {
                this.setHTML('<input type="text" value="'+this.model.value+'" />');
            },

            sync: function() {
                var element = this,
                    model = element.model,
                    input = element.getElement('>input'),
                    selectionEnd, selectionStart;
                // it is safe to use setValue --> when the content hasn't changed, `setValue` doesn't do anything
                input.setValue(model.value);

                // cautious: fm-selectionstart can be 0 --> which would lead into a falsy value
                selectionStart = model['selection-start'];
                (selectionStart===undefined) && (selectionStart=String(model.value).length);
                selectionEnd = Math.max(model['selection-end'] || selectionStart, selectionStart);
                input.selectionEnd = selectionEnd;
                input.selectionStart = selectionStart;

                if (model.placeholder) {
                    input.setAttr('placeholder', model.placeholder, true);
                }
                else {
                    input.removeAttr('placeholder', true);
                }
                if (model.primaryonenter) {
                    input.setAttr('fm-primaryonenter', model.primaryonenter, true);
                }
                else {
                    input.removeAttr('fm-primaryonenter', true);
                }
                if (model.readonly) {
                    input.setAttr('readonly', model.readonly, true);
                }
                else {
                    input.removeAttr('readonly', true);
                }
            },

            currentToReset: function() {
                var model = this.model;
                model['reset-value'] = model.value;
            },

            reset: function() {
                var model = this.model;
                model.value = model['reset-value'];
            },

            invalid: function() {
                return this.model.invalid;
            }
        });

        window.ITAGS[itagName] = Itag;
    }

    return window.ITAGS[itagName];
};
