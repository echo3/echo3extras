/**
 * @class RichTextArea component.
 * @base EchoApp.Component
 */
ExtrasApp.RichTextArea = Core.extend(EchoApp.Component, {

    $load: function() {
        EchoApp.ComponentFactory.registerType("ExtrasApp.RichTextArea", this);
    },

    componentType: "ExtrasApp.RichTextArea"
});

