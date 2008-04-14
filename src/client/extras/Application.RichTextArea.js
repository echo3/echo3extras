/**
 * @class RichTextArea component.
 * @base Echo.Component
 */
Extras.RichTextArea = Core.extend(Echo.Component, {

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.RichTextArea", this);
    },

    componentType: "Extras.RichTextArea"
});

