/**
 * @class RichTextArea component.
 */
ExtrasApp.RichTextArea = EchoCore.extend(EchoApp.Component, {

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
        EchoApp.Component.call(this, properties);
        this.componentType = "ExtrasApp.RichTextArea";
    }
});

