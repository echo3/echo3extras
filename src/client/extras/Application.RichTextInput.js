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
    
    /**
     * Executes a rich-text editing command.
     * 
     * @param {String} commandName the command name
     * @param {String} value the (optional) value to send
     */
    execCommand: function(commandName, value) {
        this.fireEvent({type: "execCommand", source: this, commandName: commandName, value: value });
    },
    
    /**
     * Inserts HTML within the text area at the current cursor location.
     *
     * @param {String} html the HTML to be inserted 
     */
    insertHtml: function(html) {
        this.execCommand("insertHtml", html);
    }
});