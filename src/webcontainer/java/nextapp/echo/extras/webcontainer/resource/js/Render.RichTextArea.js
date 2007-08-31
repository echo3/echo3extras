/**
 * Component rendering peer: RichTextArea
 */
ExtrasRender.ComponentSync.RichTextArea = function() {
    
};

ExtrasRender.ComponentSync.RichTextArea.prototype = EchoCore.derive(EchoRender.ComponentSync);

ExtrasRender.ComponentSync.RichTextArea.prototype._createApp = function() {
    this._app = new EchoApp.Application();
    this._app.setStyleSheet(this.client.application.getStyleSheet());
    
    var mainColumn = new EchoApp.Column();
    mainColumn.setProperty("cellSpacing", new EchoApp.Property.Extent("5px"));
    this._app.rootComponent.add(mainColumn);
    
    var controlsRow = new EchoApp.Row();
    controlsRow.setProperty("cellSpacing", new EchoApp.Property.Extent("10px"));
    mainColumn.add(controlsRow);
    
    var fontStyleRow = new EchoApp.Row();
    controlsRow.add(fontStyleRow);
    
    var boldButton = new EchoApp.Button();
    boldButton.setProperty("text", "B");
    boldButton.setStyleName(this.component.getRenderProperty("toolbarButtonStyleName"));
    boldButton.addListener("action", new EchoCore.MethodRef(this, this._processBold));
    fontStyleRow.add(boldButton);
    
    var italicButton = new EchoApp.Button();
    italicButton.setProperty("text", "I");
    italicButton.setStyleName(this.component.getRenderProperty("toolbarButtonStyleName"));
    italicButton.addListener("action", new EchoCore.MethodRef(this, this._processItalic));
    fontStyleRow.add(italicButton);
    
    var underlineButton = new EchoApp.Button();
    underlineButton.setProperty("text", "U");
    underlineButton.setStyleName(this.component.getRenderProperty("toolbarButtonStyleName"));
    underlineButton.addListener("action", new EchoCore.MethodRef(this, this._processUnderline));
    fontStyleRow.add(underlineButton);
    
    var strikethroughButton = new EchoApp.Button();
    strikethroughButton.setProperty("text", "S");
    strikethroughButton.setStyleName(this.component.getRenderProperty("toolbarButtonStyleName"));
    strikethroughButton.addListener("action", new EchoCore.MethodRef(this, this._processStrikeThrough));
    fontStyleRow.add(strikethroughButton);
    
    this._richTextInput = new ExtrasRender.ComponentSync.RichTextArea.InputComponent();
    mainColumn.add(this._richTextInput);

    this._freeClient = new EchoFreeClient(this._app, this._mainDivElement); 
    this._freeClient.init();
};

ExtrasRender.ComponentSync.RichTextArea.prototype._processBold = function(e) {
    this._richTextInput.peer.doBold();
};

ExtrasRender.ComponentSync.RichTextArea.prototype._processItalic = function(e) {
    this._richTextInput.peer.doItalic();
};

ExtrasRender.ComponentSync.RichTextArea.prototype._processUnderline = function(e) {
    this._richTextInput.peer.doUnderline();
};

ExtrasRender.ComponentSync.RichTextArea.prototype._processStrikeThrough = function(e) {
    this._richTextInput.peer.doStrikeThrough();
};

ExtrasRender.ComponentSync.RichTextArea.prototype.renderAdd = function(update, parentElement) {
    this._mainDivElement = document.createElement("div");
    parentElement.appendChild(this._mainDivElement);
};

ExtrasRender.ComponentSync.RichTextArea.prototype.renderDispose = function(update) {
    if (this._freeClient) {
        this._freeClient.dispose();
        this._freeClient = null;
    }
    if (this._appInitialized) {
        this._app.dispose();
        this._appInitialized = false;
        this._app = null;
    }
    this._mainDivElement = null;
};

ExtrasRender.ComponentSync.RichTextArea.prototype.renderSizeUpdate = function() {
    if (!this._appInitialized) {
        this._createApp();
        this._appInitialized = true;
    }
};

ExtrasRender.ComponentSync.RichTextArea.prototype.renderUpdate = function(update) {
};

ExtrasRender.ComponentSync.RichTextArea.InputComponent = function(renderId) {
    EchoApp.Component.call(this, renderId);
    this.componentType = "ExtrasApp.RichTextInput";
};

ExtrasRender.ComponentSync.RichTextArea.InputComponent.prototype = EchoCore.derive(EchoApp.Component);

ExtrasRender.ComponentSync.RichTextArea.InputPeer = function() { };

ExtrasRender.ComponentSync.RichTextArea.InputPeer.prototype = EchoCore.derive(EchoRender.ComponentSync);

ExtrasRender.ComponentSync.RichTextArea.InputPeer.prototype.doBold = function() {
    this._iframeElement.contentWindow.document.execCommand("bold", false, null);
};

ExtrasRender.ComponentSync.RichTextArea.InputPeer.prototype.doItalic = function() {
    this._iframeElement.contentWindow.document.execCommand("italic", false, null);
};

ExtrasRender.ComponentSync.RichTextArea.InputPeer.prototype.doUnderline = function() {
    this._iframeElement.contentWindow.document.execCommand("underline", false, null);
};

ExtrasRender.ComponentSync.RichTextArea.InputPeer.prototype.doStrikeThrough = function() {
    this._iframeElement.contentWindow.document.execCommand("strikethrough", false, null);
};

ExtrasRender.ComponentSync.RichTextArea.InputPeer.prototype.renderAdd = function(update, parentElement) {
    // Create IFRAME container DIV element.
    this._mainDivElement = document.createElement("div");
    this._mainDivElement.style.border = "1px inset";
    
    // Create IFRAME element.
    this._iframeElement = document.createElement("iframe");
    this._iframeElement.style.backgroundColor = "white";
    this._iframeElement.style.color = "black";
    this._iframeElement.style.width = this.width ? this.width : "100%";
    this._iframeElement.style.height = this.height ? this.height: "200px";
    this._iframeElement.style.border = "0px none";

    this._mainDivElement.appendChild(this._iframeElement);

    parentElement.appendChild(this._mainDivElement);
};

ExtrasRender.ComponentSync.RichTextArea.InputPeer.prototype.renderDispose = function(update) {
    this._mainElement = null;
    this._iframeElement = null;
};

ExtrasRender.ComponentSync.RichTextArea.InputPeer.prototype._renderPostAdd = function() {
    var contentDocument = this._iframeElement.contentWindow.document;
    contentDocument.open();
    contentDocument.write("<html><body></body></html>");
    contentDocument.close();

    contentDocument.designMode = "on";

    contentDocument.execCommand("undo", false, null);

    this._renderPostAddComplete = true;
};

ExtrasRender.ComponentSync.RichTextArea.InputPeer.prototype.renderSizeUpdate = function() {
    if (!this._renderPostAddComplete) {
        this._renderPostAdd();
    }
};

ExtrasRender.ComponentSync.RichTextArea.InputPeer.prototype.renderUpdate = function(update) {
};

EchoApp.ComponentFactory.registerType("ExtrasApp.RichTextInput", ExtrasRender.ComponentSync.RichTextArea.InputComponent);
EchoRender.registerPeer("ExtrasApp.RichTextArea", ExtrasRender.ComponentSync.RichTextArea);
EchoRender.registerPeer("ExtrasApp.RichTextInput", ExtrasRender.ComponentSync.RichTextArea.InputPeer);