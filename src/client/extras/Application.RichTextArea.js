/**
 * RichTextArea component.
 */
Extras.RichTextArea = Core.extend(Echo.Component, {

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.RichTextArea", this);
    },

    componentType: "Extras.RichTextArea"
});

