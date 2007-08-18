/**
 * Component rendering peer: RichTextArea
 */
ExtrasRender.ComponentSync.RichTextArea = function() {
};

ExtrasRender.ComponentSync.RichTextArea.prototype = EchoCore.derive(EchoRender.ComponentSync);

ExtrasRender.ComponentSync.RichTextArea.prototype.renderAdd = function(update, parentElement) {
    this._mainElement = document.createElement("div");
    
    // Create tool bar.
    this._toolbarContainerDivElement = document.createElement("div");
    this._mainElement.appendChild(this._toolbarContainerDivElement);

    // Create tool bar buttons.
    this._createToolbarTextButton("bold");

    // Create IFRAME container DIV element.
    var iframeContainerElement = document.createElement("div");
    iframeContainerElement.style.border = "1px inset";
    this._mainElement.appendChild(iframeContainerElement);
    
    // Create IFRAME element.
    this._iframeElement = document.createElement("iframe");
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

ExtrasRender.ComponentSync.RichTextArea.prototype._createToolbarTextButton = function(label) {
    var spanElement = document.createElement("span");
    spanElement.appendChild(document.createTextNode(label));
    this._toolbarContainerDivElement.appendChild(spanElement);
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

EchoRender.registerPeer("ExtrasApp.RichTextArea", ExtrasRender.ComponentSync.RichTextArea);