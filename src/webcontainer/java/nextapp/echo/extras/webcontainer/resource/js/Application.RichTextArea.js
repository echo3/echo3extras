/**
 * @class RichTextArea component.
 * @base EchoApp.Component
 */
ExtrasApp.RichTextArea = EchoCore.extend(EchoApp.Component, {

    globalInitialize: function() {
        EchoApp.ComponentFactory.registerType("ExtrasApp.RichTextArea", this);
    },

    componentType: "ExtrasApp.RichTextArea"
});

