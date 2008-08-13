/**
 * RichTextArea component.
 *
 * Security warning: HTML input provided by this component should be considered potentially malicious.
 * Directly rendering the HTML entered by one user to other users of a multi-user application without
 * first "cleaning" it could be disastrous to the other users.  For example, a user could potentially embed
 * JavaScript code in URLs that would execute in the other users' browsers.  Any cleaning operations must
 * be perfomed on the client that will render such HTML (not the client sending it) or on a central trusted 
 * server.
 *
 * @cp {String} text the content of the text area
 * @sp {#Border} border the border surrounding the text entry area
 * @sp {String} menuStyleName style name for menu bar
 * @sp {String} controlPaneStyleName style name for control panes used in dialogs
 * @sp {String} controlPaneRowStyleName style name for control pane row used in dialogs
 * @sp {String} controlPaneButtonStyleName style name for control pane buttons used in dialogs
 * @sp {String} toolbarButtonStyleName style name for main toolbar buttons
 * @sp {String} windowPaneStyleName style name for dialog <code>WindowPane</code>
 * @sp {Object} icons associative array mapping icon names to images
 * @sp {Object} features associative array describing which features should be enabled.
 * @event action An event fired when the enter/return key is pressed while the text area is focused.
 */
Extras.RichTextArea = Core.extend(Echo.Component, {

    $static: {
        DEFAULT_BORDER: "1px inset #7f7f7f"
    },

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.RichTextArea", this);
    },

    componentType: "Extras.RichTextArea",
    focusable: true,
    
    doAction: function() {
        this.fireEvent({source: this, type: "action"});
    },
    
    insertHtml: function(html) {
        this.fireEvent({type: "insertHtml", source: this, html: html}); 
    }
});

