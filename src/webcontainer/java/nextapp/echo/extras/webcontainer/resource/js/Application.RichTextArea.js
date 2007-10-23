/**
 * @class RichTextArea component.
 */
ExtrasApp.RichTextArea = EchoCore.extend(EchoApp.Component, {

    componentType: "ExtrasApp.RichTextArea",

    globalInitialize: function() {
        EchoApp.ComponentFactory.registerType("ExtrasApp.RichTextArea", this);
    },

    /**
     * Creates a new RichTextArea.
     * 
     * @constructor
     * @base EchoApp.Component
     */
    initialize: function(properties) {
        EchoApp.Component.prototype.initialize.call(this, properties);
    }
});

