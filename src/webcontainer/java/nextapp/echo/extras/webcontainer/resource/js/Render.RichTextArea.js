/**
 * Component rendering peer: RichTextArea
 */
ExtrasRender.ComponentSync.RichTextArea = function() {
    this._rb = ExtrasRender.ComponentSync.RichTextArea.DEFAULT_RESOURCE_BUNDLE; 
};

ExtrasRender.ComponentSync.RichTextArea.prototype = EchoCore.derive(EchoRender.ComponentSync);
    
ExtrasRender.ComponentSync.RichTextArea.DEFAULT_RESOURCE_BUNDLE = new EchoCore.ResourceBundle({
    "ColorDialog.Title":                "Color",
    "ColorDialog.PromptForeground":     "Foreground:",
    "ColorDialog.PromptBackground":     "Background:",
    "Error.ClipboardAccess":            "This browser has clipboard access disabled."
    		                            + "Use keyboard shortcuts or change your security settings.",
    "Generic.Ok":                       "Ok",
    "Generic.Cancel":                   "Cancel",
    "Menu.Edit":                        "Edit",
    "Menu.Undo":                        "Undo",
    "Menu.Redo":                        "Redo",
    "Menu.Cut":                         "Cut",
    "Menu.Copy":                        "Copy",
    "Menu.Paste":                       "Paste",
    "Menu.Delete":                      "Delete",
    "Menu.SelectAll":                   "Select All",
    "Menu.Insert":                      "Insert",
    "Menu.InsertImage":                 "Image...",
    "Menu.InsertHyperlink":             "Hyperlink...",
    "Menu.InsertHorizontalRule":        "Horziontal Rule",
    "Menu.InsertTable":                 "Table...",
    "Menu.BulletedList":                "Bulleted List",
    "Menu.NumberedList":                "Numbered List",
    "Menu.Format":                      "Format",
    "Menu.Bold":                        "Bold",
    "Menu.Italic":                      "Italic",
    "Menu.Underline":                   "Underline",
    "Menu.Strikethrough":               "Strikethrough",
    "Menu.Superscript":                 "Superscript",
    "Menu.Subscript":                   "Subscript",
    "Menu.PlainText":                   "Plain Text",
    "Menu.TextStyle":                   "Text Style",
    "Menu.ParagraphStyle":              "Paragraph Style",
    "Menu.Alignment":                   "Alignment",
    "Menu.Left":                        "Left",
    "Menu.Right":                       "Right",
    "Menu.Center":                      "Center",
    "Menu.Justified":                   "Justified",
    "Menu.Indent":                      "Indent",
    "Menu.Outdent":                     "Outdent",
    "Menu.SetColor":                    "Set Color...",
    "Menu.Heading1":                    "Heading 1",
    "Menu.Heading2":                    "Heading 2",
    "Menu.Heading3":                    "Heading 3",
    "Menu.Heading4":                    "Heading 4",
    "Menu.Heading5":                    "Heading 5",
    "Menu.Heading6":                    "Heading 6",
    "Menu.Normal":                      "Normal",
    "Menu.Preformatted":                "Preformatted"
});

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
    var bar = new ExtrasApp.MenuModel();
    
    var editMenu = new ExtrasApp.MenuModel(null, this._rb.get("Menu.Edit"), null);
    editMenu.addItem(new ExtrasApp.OptionModel("/undo", this._rb.get("Menu.Undo"), null));
    editMenu.addItem(new ExtrasApp.OptionModel("/redo", this._rb.get("Menu.Redo"), null));
    editMenu.addItem(new ExtrasApp.SeparatorModel());
    editMenu.addItem(new ExtrasApp.OptionModel("cut", this._rb.get("Menu.Cut"), null));
    editMenu.addItem(new ExtrasApp.OptionModel("copy", this._rb.get("Menu.Copy"), null));
    editMenu.addItem(new ExtrasApp.OptionModel("paste", this._rb.get("Menu.Paste"), null));
    editMenu.addItem(new ExtrasApp.OptionModel("delete", this._rb.get("Menu.Delete"), null));
    editMenu.addItem(new ExtrasApp.SeparatorModel());
    editMenu.addItem(new ExtrasApp.OptionModel("/selectall", this._rb.get("Menu.SelectAll"), null));
    bar.addItem(editMenu);
    
    var insertMenu = new ExtrasApp.MenuModel(null, this._rb.get("Menu.Insert"), null);
    insertMenu.addItem(new ExtrasApp.OptionModel("/insertunorderedlist", this._rb.get("Menu.BulletedList"), null));
    insertMenu.addItem(new ExtrasApp.OptionModel("/insertorderedlist", this._rb.get("Menu.NumberedList"), null));
    insertMenu.addItem(new ExtrasApp.SeparatorModel());
    insertMenu.addItem(new ExtrasApp.OptionModel("/inserthorizontalrule", this._rb.get("Menu.InsertHorizontalRule"), null));
    insertMenu.addItem(new ExtrasApp.OptionModel("insertimage", this._rb.get("Menu.InsertImage"), null));
    insertMenu.addItem(new ExtrasApp.OptionModel("insertlink", this._rb.get("Menu.InsertHyperlink"), null));
    insertMenu.addItem(new ExtrasApp.SeparatorModel());
    insertMenu.addItem(new ExtrasApp.OptionModel("inserttable", this._rb.get("Menu.InsertTable"), null));
    bar.addItem(insertMenu);

    var formatMenu = new ExtrasApp.MenuModel(null,  this._rb.get("Menu.Format"), null);
    var formatTextMenu = new ExtrasApp.MenuModel(null,  this._rb.get("Menu.TextStyle"), null);
    formatTextMenu.addItem(new ExtrasApp.OptionModel("/removeformat",  this._rb.get("Menu.PlainText"), null));
    formatTextMenu.addItem(new ExtrasApp.SeparatorModel());
    formatTextMenu.addItem(new ExtrasApp.OptionModel("/bold",  this._rb.get("Menu.Bold"), null));
    formatTextMenu.addItem(new ExtrasApp.OptionModel("/italic",  this._rb.get("Menu.Italic"), null));
    formatTextMenu.addItem(new ExtrasApp.OptionModel("/underline",  this._rb.get("Menu.Underline"), null));
    formatTextMenu.addItem(new ExtrasApp.OptionModel("/strikethrough",  this._rb.get("Menu.Strikethrough"), null));
    formatTextMenu.addItem(new ExtrasApp.SeparatorModel());
    formatTextMenu.addItem(new ExtrasApp.OptionModel("/superscript",  this._rb.get("Menu.Superscript"), null));
    formatTextMenu.addItem(new ExtrasApp.OptionModel("/subscript",  this._rb.get("Menu.Subscript"), null));
    formatMenu.addItem(formatTextMenu);
    formatParagraphMenu = new ExtrasApp.MenuModel(null, this._rb.get("Menu.ParagraphStyle"), null);
    formatParagraphMenu.addItem(new ExtrasApp.OptionModel("/formatblock/<p>", this._rb.get("Menu.ParagraphStyle"), null));
    formatParagraphMenu.addItem(new ExtrasApp.OptionModel("/formatblock/<pre>", this._rb.get("Menu.Preformatted"), null));
    formatParagraphMenu.addItem(new ExtrasApp.OptionModel("/formatblock/<h1>", this._rb.get("Menu.Heading1"), null));
    formatParagraphMenu.addItem(new ExtrasApp.OptionModel("/formatblock/<h2>", this._rb.get("Menu.Heading2"), null));
    formatParagraphMenu.addItem(new ExtrasApp.OptionModel("/formatblock/<h3>", this._rb.get("Menu.Heading3"), null));
    formatParagraphMenu.addItem(new ExtrasApp.OptionModel("/formatblock/<h4>", this._rb.get("Menu.Heading4"), null));
    formatParagraphMenu.addItem(new ExtrasApp.OptionModel("/formatblock/<h5>", this._rb.get("Menu.Heading5"), null));
    formatParagraphMenu.addItem(new ExtrasApp.OptionModel("/formatblock/<h6>", this._rb.get("Menu.Heading6"), null));
    formatMenu.addItem(formatParagraphMenu);
    formatAlignmentMenu = new ExtrasApp.MenuModel(null,  this._rb.get("Menu.Alignment"), null);
    formatAlignmentMenu.addItem(new ExtrasApp.OptionModel("/justifyleft",  this._rb.get("Menu.Left"), null));
    formatAlignmentMenu.addItem(new ExtrasApp.OptionModel("/justifycenter",  this._rb.get("Menu.Center"), null));
    formatAlignmentMenu.addItem(new ExtrasApp.OptionModel("/justifyright",  this._rb.get("Menu.Right"), null));
    formatAlignmentMenu.addItem(new ExtrasApp.OptionModel("/justifyfull",  this._rb.get("Menu.Justified"), null));
    formatMenu.addItem(formatAlignmentMenu);
    formatMenu.addItem(new ExtrasApp.SeparatorModel());
    formatMenu.addItem(new ExtrasApp.OptionModel("/indent",  this._rb.get("Menu.Indent"), null));
    formatMenu.addItem(new ExtrasApp.OptionModel("/outdent",  this._rb.get("Menu.Outdent"), null));
    formatMenu.addItem(new ExtrasApp.SeparatorModel());
    formatMenu.addItem(new ExtrasApp.OptionModel("color",  this._rb.get("Menu.SetColor"), null));
    
    bar.addItem(formatMenu);
    
    return bar;
};

ExtrasRender.ComponentSync.RichTextArea.prototype._processBold = function(e) {
    this._richTextInput.peer.doCommand("bold");
};

/**
 * Event handler for color selection events from ColorDialog.
 */
ExtrasRender.ComponentSync.RichTextArea.prototype._processColorSelection = function(e) {
    this._richTextInput.peer.doCommand("forecolor", e.data.value);
};

ExtrasRender.ComponentSync.RichTextArea.prototype._processItalic = function(e) {
    this._richTextInput.peer.doCommand("italic");
};

ExtrasRender.ComponentSync.RichTextArea.prototype._processMenuAction = function(e) {
    if (e.modelId.charAt(0) == '/') {
        var separatorIndex = e.modelId.indexOf("/", 1);
        if (separatorIndex == -1) {
            this._richTextInput.peer.doCommand(e.modelId.substring(1));
        } else {
            this._richTextInput.peer.doCommand(e.modelId.substring(1, separatorIndex),
                    e.modelId.substring(separatorIndex + 1));
        }
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
                alert(this._rb.get("Error.ClipboardAccessDisabled"));
            }
        }
    }
};

ExtrasRender.ComponentSync.RichTextArea.prototype._processSetColor = function(e) {
    var colorDialog = new ExtrasRender.ComponentSync.RichTextArea.ColorDialog(this.component);
    colorDialog.addListener("colorSelection", new EchoCore.MethodRef(this, this._processColorSelection));
    this._contentPane.add(colorDialog);
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

ExtrasRender.ComponentSync.RichTextArea.ColorDialog = function(richTextArea) {
    EchoApp.WindowPane.call(this, {
        title: richTextArea.peer._rb.get("ColorDialog.Title"),
        width: new EchoApp.Property.Extent(500),
        height: new EchoApp.Property.Extent(320)
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
    
    var okButton = new EchoApp.Button({
        text: richTextArea.peer._rb.get("Generic.Ok")
    });
    okButton.addListener("action", new EchoCore.MethodRef(this, this._processOk));
    ExtrasRender.configureStyle(okButton, richTextArea.getRenderProperty("controlPaneButtonStyleName"), 
            ExtrasRender.DEFAULT_CONTROL_PANE_BUTTON_STYLE);
    controlsRow.add(okButton);
    
    var cancelButton = new EchoApp.Button({
        text: richTextArea.peer._rb.get("Generic.Cancel")
    });
    cancelButton.addListener("action", new EchoCore.MethodRef(this, this._processCancel));
    ExtrasRender.configureStyle(cancelButton, richTextArea.getRenderProperty("controlPaneButtonStyleName"), 
            ExtrasRender.DEFAULT_CONTROL_PANE_BUTTON_STYLE);
    controlsRow.add(cancelButton);
    
    var layoutGrid = new EchoApp.Grid();
    layoutGrid.setProperty("insets", new EchoApp.Property.Insets(5, 10));
    splitPane.add(layoutGrid);
    
    var foregroundLabel = new EchoApp.Label({
        text: richTextArea.peer._rb.get("ColorDialog.PromptForeground")
    });
    layoutGrid.add(foregroundLabel);
    
    var backgroundLabel = new EchoApp.Label({
        text: richTextArea.peer._rb.get("ColorDialog.PromptBackground")
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
    var color = this._foregroundSelect.getProperty("color");
    this.parent.remove(this);
    this.fireEvent(new EchoCore.Event(this, "colorSelection", color));
};

ExtrasRender.ComponentSync.RichTextArea.InputComponent = function(properties) {
    EchoApp.Component.call(this, properties);
    this.componentType = "ExtrasApp.RichTextInput";
};

ExtrasRender.ComponentSync.RichTextArea.InputComponent.prototype = EchoCore.derive(EchoApp.Component);

ExtrasRender.ComponentSync.RichTextArea.InputPeer = function() { };

ExtrasRender.ComponentSync.RichTextArea.InputPeer.prototype = EchoCore.derive(EchoRender.ComponentSync);

ExtrasRender.ComponentSync.RichTextArea.InputPeer.prototype.doCommand = function(command, value) {
    this._loadRange();
    this._iframeElement.contentWindow.document.execCommand(command, false, value);
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
