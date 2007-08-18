/**
 * Component rendering peer: RichTextArea
 */
ExtrasRender.ComponentSync.RichTextArea = function() {
};

ExtrasRender.ComponentSync.RichTextArea.prototype = EchoCore.derive(EchoRender.ComponentSync);

ExtrasRender.ComponentSync.RichTextArea.prototype.renderAdd = function(update, parentElement) {
    this._mainElement = document.createElement("div");
    this._mainElement.appendChild(document.createTextNode("I'm a rich text area, really!"));
    parentElement.appendChild(this._mainElement);
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