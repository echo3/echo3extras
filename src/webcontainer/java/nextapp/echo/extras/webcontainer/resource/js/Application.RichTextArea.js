/**
 * @class RichTextArea component.
 * @base EchoApp.Component
 */
ExtrasApp.RichTextArea = EchoCore.extend(EchoApp.Component, {

    $staticConstruct: function() {
        EchoApp.ComponentFactory.registerType("ExtrasApp.RichTextArea", this);
    },

    componentType: "ExtrasApp.RichTextArea"
});

