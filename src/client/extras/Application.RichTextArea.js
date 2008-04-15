/**
 * RichTextArea component.
 *
 * @cp {String} text the content of the text area
 * @sp {String} menuStyleName style name for menu bar
 * @sp {String} controlPaneStyleName style name for control panes used in dialogs
 * @sp {String} controlPaneRowStyleName style name for control pane row used in dialogs
 * @sp {String} controlPaneButtonStyleName style name for control pane buttons used in dialogs
 * @sp {String} toolbarButtonStyleName style name for main toolbar buttons
 * @sp {String} windowPaneStyleName style name for dialog <code>WindowPane</code>
 * @sp {Object} icons associative array mapping icon names to images
 */
Extras.RichTextArea = Core.extend(Echo.Component, {

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.RichTextArea", this);
    },

    componentType: "Extras.RichTextArea"
});

