/**
 * RichTextArea component: a rich text user input field which allows the user to
 * select text styles, and insert/manipulate objects such as links, images, enumerated
 * lists, or tables.  This component may not contain children.
 * 
 * Security warning: HTML input provided by this component should be considered
 * potentially malicious. Directly rendering the HTML entered by one user to
 * other users of a multi-user application without first "cleaning" it could be
 * disastrous to the other users. For example, a user could potentially embed
 * JavaScript code in URLs that would execute in the other users' browsers. Any
 * cleaning operations must be performed on the client that will render such
 * HTML (not the client sending it) or on a central trusted server.
 * 
 * @cp {String} text the content of the text area
 * @sp {#Border} border the border surrounding the text entry area
 * @sp {String} menuStyleName style name for menu bar
 * @sp {String} controlPaneStyleName style name for control panes used in
 *     dialogs
 * @sp {String} controlPaneRowStyleName style name for control pane row used in
 *     dialogs
 * @sp {String} controlPaneButtonStyleName style name for control pane buttons
 *     used in dialogs
 * @sp {String} toolbarButtonStyleName style name for main toolbar buttons
 * @sp {String} windowPaneStyleName style name for dialog
 *     <code>WindowPane</code>
 * @sp {Object} icons associative array mapping icon names to images
 * @sp {Object} features associative array describing which features should be
 *     enabled.
 * @event action An event fired when the enter/return key is pressed while the
 *        text area is focused.
 */
Extras.RichTextArea = Core.extend(Echo.Component, {

    $static: {
        DEFAULT_BORDER: "1px inset #7f7f7f"
    },

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.RichTextArea", this);
    },

    /** @see Echo.Component#componentType */
    componentType: "Extras.RichTextArea",

    /** @see Echo.Component#focusable */
    focusable: true,
    
    /**
     * Processes a user action (pressing enter within text entry area).
     */
    doAction: function() {
        this.fireEvent({source: this, type: "action"});
    },
    
    /**
     * Inserts HTML within the text area at the current cursor location.
     * 
     * @param {String} html the HTML to be inserted 
     */
    insertHtml: function(html) {
        this.fireEvent({type: "insertHtml", source: this, html: html}); 
    }
});

/**
 * RichTextInput component.  A chrome-less cross browser rich text editing component.  Provides no toolbars/menus/features of
 * any kind.  Designed to be used within an application-rendered component, e.g., Extras.Sync.RichTextArea.
 * 
 * @cp {String} text the content of the text area
 * @sp {#Border} border the border surrounding the text entry area
 * @event action An event fired when the enter/return key is pressed while the
 *        text area is focused.
 * @event cursorStyleChange An event fired when the cursor is moved over text that may have a different style.
 * @event execCommand An event fired to provide notification of a rich-text editing command being executed.
 * @event insertHtml An event fired to provide notification of HTML insertion. 
 */
Extras.RichTextInput = Core.extend(Echo.Component, {

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.RichTextInput", this);
    },
    
    /** @see Echo.Component#componentType */
    componentType: "Extras.RichTextInput",
    
    /** @see Echo.Component#focusable */
    focusable: true,

    /**
     * Processes a user action (pressing enter within text entry area).
     */
    doAction: function() {
        this.fireEvent({source: this, type: "action"});
    },
    
    /**
     * Processes a cursor style change (cursor has moved over content which may have new style). 
     */
    doCursorStyleChange: function(style) {
        this.fireEvent({source: this, type: "cursorStyleChange", style: style});
    },
    
    execCommand: function(commandName, value) {
        this.fireEvent({type: "execCommand", source: this, commandName: commandName, value: value });
    },

    /**
     * Inserts HTML within the text area at the current cursor location.
     * 
     * @param {String} html the HTML to be inserted 
     */
    insertHtml: function(html) {
        this.fireEvent({type: "insertHtml", source: this, html: html}); 
    }
});
