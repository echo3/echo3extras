/**
 * Component rendering peer: RichTextArea
 */
ExtrasRender.ComponentSync.RichTextArea = function() {
    
};

ExtrasRender.ComponentSync.RichTextArea.prototype = EchoCore.derive(EchoRender.ComponentSync);

ExtrasRender.ComponentSync.RichTextArea.prototype._createApp = function() {
    this._app = new EchoApp.Application();
    this._app.setStyleSheet(this.client.application.getStyleSheet());
    
    this._contentPane = new EchoApp.ContentPane();
    this._app.rootComponent.add(this._contentPane);
    
    var splitPane = new EchoApp.SplitPane();
    splitPane.setProperty("orientation", EchoApp.SplitPane.ORIENTATION_VERTICAL_TOP_BOTTOM);
    splitPane.setProperty("separatorPosition", new EchoApp.Property.Extent("26px"));
    this._contentPane.add(splitPane);

    var menuBarPane = new ExtrasApp.MenuBarPane();
    menuBarPane.setStyleName(this.component.getRenderProperty("menuStyleName"));
    menuBarPane.setProperty("model", this._createMainMenuModel());
    menuBarPane.addListener("action", new EchoCore.MethodRef(this, this._processMenuAction));
    splitPane.add(menuBarPane);
    
    var mainColumn = new EchoApp.Column();
    mainColumn.setProperty("cellSpacing", new EchoApp.Property.Extent("5px"));
    splitPane.add(mainColumn);
    
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
    this._richTextInput._richTextArea = this.component;
    mainColumn.add(this._richTextInput);

    this._freeClient = new EchoFreeClient(this._app, this._mainDivElement);
    this._freeClient.parent = this.client;
    this._freeClient.init();
};

ExtrasRender.ComponentSync.RichTextArea.prototype._createMainMenuModel = function() {
    //FIXME I18N
    var bar = new ExtrasApp.MenuModel();
    
    var editMenu = new ExtrasApp.MenuModel(null, "Edit", null);
    editMenu.addItem(new ExtrasApp.OptionModel("/undo", "Undo", null));
    editMenu.addItem(new ExtrasApp.OptionModel("/redo", "Redo", null));
    editMenu.addItem(new ExtrasApp.SeparatorModel());
    editMenu.addItem(new ExtrasApp.OptionModel("cut", "Cut", null));
    editMenu.addItem(new ExtrasApp.OptionModel("copy", "Copy", null));
    editMenu.addItem(new ExtrasApp.OptionModel("paste", "Paste", null));
    editMenu.addItem(new ExtrasApp.OptionModel("delete", "Delete", null));
    editMenu.addItem(new ExtrasApp.SeparatorModel());
    editMenu.addItem(new ExtrasApp.OptionModel("/selectall", "Select All", null));
    bar.addItem(editMenu);
    
    var insertMenu = new ExtrasApp.MenuModel(null, "Insert", null);
    insertMenu.addItem(new ExtrasApp.OptionModel("/insertunorderedlist", "Bulleted List", null));
    insertMenu.addItem(new ExtrasApp.OptionModel("/insertorderedlist", "Numbered List", null));
    insertMenu.addItem(new ExtrasApp.OptionModel("/inserthorizontalrule", "Horizontal Rule", null));
    bar.addItem(insertMenu);

    var formatMenu = new ExtrasApp.MenuModel(null, "Format", null);
    var formatTextMenu = new ExtrasApp.MenuModel(null, "Text", null);
    formatTextMenu.addItem(new ExtrasApp.OptionModel("/removeformat", "Plain Text", null));
    formatTextMenu.addItem(new ExtrasApp.SeparatorModel());
    formatTextMenu.addItem(new ExtrasApp.OptionModel("/bold", "Bold", null));
    formatTextMenu.addItem(new ExtrasApp.OptionModel("/italic", "Italic", null));
    formatTextMenu.addItem(new ExtrasApp.OptionModel("/underline", "Underline", null));
    formatTextMenu.addItem(new ExtrasApp.OptionModel("/strikethrough", "Strikethrough", null));
    formatTextMenu.addItem(new ExtrasApp.SeparatorModel());
    formatTextMenu.addItem(new ExtrasApp.OptionModel("/superscript", "Superscript", null));
    formatTextMenu.addItem(new ExtrasApp.OptionModel("/subscript", "Subscript", null));
    formatMenu.addItem(formatTextMenu);
    formatMenu.addItem(new ExtrasApp.SeparatorModel());
    formatMenu.addItem(new ExtrasApp.OptionModel("/indent", "Indent", null));
    formatMenu.addItem(new ExtrasApp.OptionModel("/outdent", "Outdent", null));
    formatMenu.addItem(new ExtrasApp.SeparatorModel());
    formatMenu.addItem(new ExtrasApp.OptionModel("color", "Set Color...", null));
    
    bar.addItem(formatMenu);
    
    return bar;
};

ExtrasRender.ComponentSync.RichTextArea.prototype._processBold = function(e) {
    this._richTextInput.peer.doCommand("bold");
};

ExtrasRender.ComponentSync.RichTextArea.prototype._processItalic = function(e) {
    this._richTextInput.peer.doCommand("italic");
};

ExtrasRender.ComponentSync.RichTextArea.prototype._processMenuAction = function(e) {
    if (e.modelId.charAt(0) == '/') {
        this._richTextInput.peer.doCommand(e.modelId.substring(1));
    } else {
        switch (e.modelId) {
        case "color":
            this._processSetColor();
            break;
        case "cut":
        case "copy":
        case "paste":
        case "delete":
            try {
                this._richTextInput.peer.doCommand(e.modelId);
            } catch (ex) {
                alert("This browser has clipboard access disabled.  Use keyboard shortcuts or change your security settings.");
            }
        }
    }
};

ExtrasRender.ComponentSync.RichTextArea.prototype._processSetColor = function(e) {
    this._contentPane.add(new ExtrasRender.ComponentSync.RichTextArea.ColorDialog(null, this.component));
};

ExtrasRender.ComponentSync.RichTextArea.prototype._processUnderline = function(e) {
    this._richTextInput.peer.doCommand("underline");
};

ExtrasRender.ComponentSync.RichTextArea.prototype._processStrikeThrough = function(e) {
    this._richTextInput.peer.doCommand("strikethrough");
};

ExtrasRender.ComponentSync.RichTextArea.prototype.renderAdd = function(update, parentElement) {
    this._mainDivElement = document.createElement("div");
    this._mainDivElement.style.height = "300px";
    parentElement.appendChild(this._mainDivElement);
};

ExtrasRender.ComponentSync.RichTextArea.prototype.renderDispose = function(update) {
    if (this._freeClient) {
        this._freeClient.dispose();
        this._freeClient = null;
    }
    if (this._app) {
        this._contentPane = null;
        this._app.dispose();
        this._app = null;
    }
    this._mainDivElement = null;
};

ExtrasRender.ComponentSync.RichTextArea.prototype.renderDisplay = function() {
    if (!this._app) {
        this._createApp();
    }
};

ExtrasRender.ComponentSync.RichTextArea.prototype.renderUpdate = function(update) {
    var element = this._mainDivElement;
    var containerElement = element.parentNode;
    EchoRender.renderComponentDispose(update, update.parent);
    containerElement.removeChild(element);
    this.renderAdd(update, containerElement);
};

ExtrasRender.ComponentSync.RichTextArea.ColorDialog = function(renderId, richTextArea) {
    EchoApp.WindowPane.call(this, renderId, {
        title: "Color",
        width: new EchoApp.Property.Extent(500),
        height: new EchoApp.Property.Extent(300)
    });

    this.setStyleName(richTextArea.getRenderProperty("windowPaneStyleName"));
    this.addListener("close", new EchoCore.MethodRef(this, this._processCancel));
    
    var splitPane = new EchoApp.SplitPane();
    ExtrasRender.configureStyle(splitPane, richTextArea.getRenderProperty("controlPaneSplitPaneStyleName"), 
            ExtrasRender.DEFAULT_CONTROL_PANE_SPLIT_PANE_STYLE);
    this.add(splitPane);
    
    var controlsRow = new EchoApp.Row();
    ExtrasRender.configureStyle(controlsRow, richTextArea.getRenderProperty("controlPaneRowStyleName"), 
            ExtrasRender.DEFAULT_CONTROL_PANE_ROW_STYLE);
    splitPane.add(controlsRow);
    
    var okButton = new EchoApp.Button(null, {
        text: "Ok"
    });
    okButton.addListener("action", new EchoCore.MethodRef(this, this._processOk));
    ExtrasRender.configureStyle(okButton, richTextArea.getRenderProperty("controlPaneButtonStyleName"), 
            ExtrasRender.DEFAULT_CONTROL_PANE_BUTTON_STYLE);
    controlsRow.add(okButton);
    
    var cancelButton = new EchoApp.Button(null, {
        text: "Cancel"
    });
    cancelButton.addListener("action", new EchoCore.MethodRef(this, this._processCancel));
    ExtrasRender.configureStyle(cancelButton, richTextArea.getRenderProperty("controlPaneButtonStyleName"), 
            ExtrasRender.DEFAULT_CONTROL_PANE_BUTTON_STYLE);
    controlsRow.add(cancelButton);
    
    var layoutGrid = new EchoApp.Grid();
    layoutGrid.setProperty("insets", new EchoApp.Property.Insets(5, 10));
    splitPane.add(layoutGrid);
    
    var foregroundLabel = new EchoApp.Label(null, {
        text: "Foreground"
    });
    layoutGrid.add(foregroundLabel);
    
    var backgroundLabel = new EchoApp.Label(null, {
        text: "Background"
    });
    layoutGrid.add(backgroundLabel);

    this._foregroundSelect = new ExtrasApp.ColorSelect();
    this._foregroundSelect.setProperty("displayValue", true);
    layoutGrid.add(this._foregroundSelect);

    this._backgroundSelect = new ExtrasApp.ColorSelect();
    this._backgroundSelect.setProperty("displayValue", true);
    layoutGrid.add(this._backgroundSelect);
};

ExtrasRender.ComponentSync.RichTextArea.ColorDialog.prototype = EchoCore.derive(EchoApp.WindowPane);

ExtrasRender.ComponentSync.RichTextArea.ColorDialog.prototype._processCancel = function(e) {
    this.parent.remove(this);
};

ExtrasRender.ComponentSync.RichTextArea.ColorDialog.prototype._processOk = function(e) {
    this.parent.remove(this);
};

ExtrasRender.ComponentSync.RichTextArea.InputComponent = function(renderId, properties) {
    EchoApp.Component.call(this, renderId, properties);
    this.componentType = "ExtrasApp.RichTextInput";
};

ExtrasRender.ComponentSync.RichTextArea.InputComponent.prototype = EchoCore.derive(EchoApp.Component);

ExtrasRender.ComponentSync.RichTextArea.InputPeer = function() { };

ExtrasRender.ComponentSync.RichTextArea.InputPeer.prototype = EchoCore.derive(EchoRender.ComponentSync);

ExtrasRender.ComponentSync.RichTextArea.InputPeer.prototype.doCommand = function(command) {
    this._loadRange();
    this._iframeElement.contentWindow.document.execCommand(command, false, null);
    this._storeData();
};

ExtrasRender.ComponentSync.RichTextArea.InputPeer.prototype._loadRange = function() {
    if (EchoWebCore.Environment.BROWSER_INTERNET_EXPLORER) {
        if (this._selectionRange) {
            this._selectionRange.select();
        }
    }
};

ExtrasRender.ComponentSync.RichTextArea.InputPeer.prototype._processKeyUp = function(e) {
    this._storeData();
    this._storeRange();
};

ExtrasRender.ComponentSync.RichTextArea.InputPeer.prototype._processMouseUp = function(e) {
    this._storeRange();
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
    this._iframeElement.style.height = this.height ? this.height: "250px";
    this._iframeElement.style.border = "0px none";

    this._mainDivElement.appendChild(this._iframeElement);

    parentElement.appendChild(this._mainDivElement);
};

ExtrasRender.ComponentSync.RichTextArea.InputPeer.prototype.renderDispose = function(update) {
    EchoWebCore.EventProcessor.removeAll(this._iframeElement.contentWindow.document);
    this._mainDivElement = null;
    this._iframeElement = null;
    this._contentDocumentRendered = false;
    this._selectionRange = null;
};

ExtrasRender.ComponentSync.RichTextArea.InputPeer.prototype._renderContentDocument = function() {
    var text = this.component._richTextArea.getProperty("text");
    
    var contentDocument = this._iframeElement.contentWindow.document;
    contentDocument.open();
    contentDocument.write("<html><body>" + (text == null ? "" : text) + "</body></html>");
    contentDocument.close();
    contentDocument.designMode = "on";
    EchoWebCore.EventProcessor.add(this._iframeElement.contentWindow.document, "keyup", 
            new EchoCore.MethodRef(this, this._processKeyUp), false);
    EchoWebCore.EventProcessor.add(this._iframeElement.contentWindow.document, "mouseup", 
            new EchoCore.MethodRef(this, this._processMouseUp), false);
    this._contentDocumentRendered = true;
};

ExtrasRender.ComponentSync.RichTextArea.InputPeer.prototype.renderDisplay = function() {
    if (!this._contentDocumentRendered) {
        this._renderContentDocument();
    }
};

ExtrasRender.ComponentSync.RichTextArea.InputPeer.prototype.renderUpdate = function(update) {
    // Not invoked.
};

ExtrasRender.ComponentSync.RichTextArea.InputPeer.prototype._storeData = function() {
    var contentDocument = this._iframeElement.contentWindow.document;
    var html = contentDocument.body.innerHTML;
    this.component._richTextArea.setProperty("text", html);
};

ExtrasRender.ComponentSync.RichTextArea.InputPeer.prototype._storeRange = function() {
    if (EchoWebCore.Environment.BROWSER_INTERNET_EXPLORER) {
        this._selectionRange = this._iframeElement.contentWindow.document.selection.createRange();
        EchoCore.Debug.consoleWrite("RANGE=" + this._selectionRange.text);
    }
};



EchoApp.ComponentFactory.registerType("ExtrasApp.RichTextInput", ExtrasRender.ComponentSync.RichTextArea.InputComponent);

EchoRender.registerPeer("ExtrasApp.RichTextArea", ExtrasRender.ComponentSync.RichTextArea);
EchoRender.registerPeer("ExtrasApp.RichTextInput", ExtrasRender.ComponentSync.RichTextArea.InputPeer);
