/**
 * Component rendering peer: RichTextArea
 */
ExtrasRender.ComponentSync.RichTextArea = function() {
    
};

ExtrasRender.ComponentSync.RichTextArea.prototype = EchoCore.derive(EchoRender.ComponentSync);

ExtrasRender.ComponentSync.RichTextArea.DEFAULT_TOOLBAR_BUTTON_CSS 
        = "border:1px outset #abcdef; padding: 1px 5px; background-color: #abcdef; color: #000000;";

ExtrasRender.ComponentSync.RichTextArea.prototype.addToolbarItem = function(toolbarItem) {
    var divElement = document.createElement("div");
    divElement.appendChild(document.createTextNode(toolbarItem.content));
    divElement.style.cssText = "float: left;" + this._baseCssText + (toolbarItem.cssText ? toolbarItem.cssText : "");
    this._toolbarContainerDivElement.appendChild(divElement);
};

ExtrasRender.ComponentSync.RichTextArea.prototype.renderAdd = function(update, parentElement) {
    this._baseCssText = ExtrasRender.ComponentSync.RichTextArea.DEFAULT_TOOLBAR_BUTTON_CSS;

    this._mainElement = document.createElement("div");
    
    // Create tool bar.
    this._toolbarContainerDivElement = document.createElement("div");
    this._mainElement.appendChild(this._toolbarContainerDivElement);

    // Create tool bar buttons.
    var boldItem = new ExtrasRender.ComponentSync.RichTextArea.ToolbarItem("bold", "B", "font-weight: bold;");
    this.addToolbarItem(boldItem);
    var italicItem = new ExtrasRender.ComponentSync.RichTextArea.ToolbarItem("italic", "I", "font-style: italic;");
    this.addToolbarItem(italicItem);
    var underlineItem = new ExtrasRender.ComponentSync.RichTextArea.ToolbarItem("underline", "U", "text-decoration: underline;");
    this.addToolbarItem(underlineItem);
    var strikethroughItem = new ExtrasRender.ComponentSync.RichTextArea.ToolbarItem("strikethrough", "S", 
            "text-decoration: line-through;");
    this.addToolbarItem(strikethroughItem);
    
    // Create IFRAME container DIV element.
    var iframeContainerElement = document.createElement("div");
    iframeContainerElement.style.border = "1px inset";
    this._mainElement.appendChild(iframeContainerElement);
    
    // Create IFRAME element.
    this._iframeElement = document.createElement("iframe");
    this._iframeElement.style.backgroundColor = "white";
    this._iframeElement.style.color = "black";
    this._iframeElement.style.width = this.width ? this.width : "100%";
    this._iframeElement.style.height = this.height ? this.height: "200px";
    this._iframeElement.style.border = "0px none";

    iframeContainerElement.appendChild(this._iframeElement);

    parentElement.appendChild(this._mainElement);
};

ExtrasRender.ComponentSync.RichTextArea.prototype._renderPostAdd = function() {
    var contentDocument = this._iframeElement.contentWindow.document;
    contentDocument.open();
    contentDocument.write("<html><body></body></html>");
    contentDocument.close();

    contentDocument.designMode = "on";

    contentDocument.execCommand("undo", false, null);

    this._renderPostAddComplete = true;
};

ExtrasRender.ComponentSync.RichTextArea.prototype.renderSizeUpdate = function() {
    if (!this._renderPostAddComplete) {
        this._renderPostAdd();
    }
};

ExtrasRender.ComponentSync.RichTextArea.prototype._addToolbarItem = function(toolbarItem) {
    this._toolbarContainerDivElement.appendChild(toolbarItem.divElement);
};
    
ExtrasRender.ComponentSync.RichTextArea.prototype.renderDispose = function(update) {
    this._mainElement = null;
};

ExtrasRender.ComponentSync.RichTextArea.prototype.renderUpdate = function(update) {
    var mainElement = this._mainElement;
    var containerElement = mainElement.parentNode;
    EchoRender.renderComponentDispose(update, update.parent);
    containerElement.removeChild(mainElement);
    this.renderAdd(update, containerElement);
    return false;
};

ExtrasRender.ComponentSync.RichTextArea.ToolbarItem = function(id, content, cssText) {
    this.id = id;
    this.content = content;
    this.cssText = cssText;
};

EchoRender.registerPeer("ExtrasApp.RichTextArea", ExtrasRender.ComponentSync.RichTextArea);