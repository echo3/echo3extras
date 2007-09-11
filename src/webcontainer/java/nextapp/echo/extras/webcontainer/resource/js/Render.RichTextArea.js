/**
 * Component rendering peer: RichTextArea
 */
ExtrasRender.ComponentSync.RichTextArea = function() {
    this._rb = ExtrasRender.ComponentSync.RichTextArea.DEFAULT_RESOURCE_BUNDLE; 
};

ExtrasRender.ComponentSync.RichTextArea.prototype = EchoCore.derive(EchoRender.ComponentSync);
    
ExtrasRender.ComponentSync.RichTextArea.DEFAULT_RESOURCE_BUNDLE = new EchoCore.ResourceBundle({
    "ColorDialog.Title.Foreground":     "Text Color",
    "ColorDialog.Title.Background":     "Highlight Color",
    "ColorDialog.PromptForeground":     "Foreground:",
    "ColorDialog.PromptBackground":     "Background:",
    "Error.ClipboardAccess":            "This browser has clipboard access disabled."
    		                            + "Use keyboard shortcuts or change your security settings.",
    "Generic.Ok":                       "Ok",
    "Generic.Cancel":                   "Cancel",
    "HyperlinkDialog.Title":            "Insert Hyperlink",
    "HyperlinkDialog.PromptURL":        "URL:",
    "HyperlinkDialog.PromptDescription":
                                        "Description Text:",
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
    "Menu.SetForeground":               "Set Text Color...",
    "Menu.SetBackground":               "Set Highlight Color...",
    "Menu.Heading1":                    "Heading 1",
    "Menu.Heading2":                    "Heading 2",
    "Menu.Heading3":                    "Heading 3",
    "Menu.Heading4":                    "Heading 4",
    "Menu.Heading5":                    "Heading 5",
    "Menu.Heading6":                    "Heading 6",
    "Menu.Normal":                      "Normal",
    "Menu.Preformatted":                "Preformatted",
    "TableDialog.Title":                "Insert Table",
    "TableDialog.PromptRows":           "Rows:",
    "TableDialog.PromptColumns":        "Columns:",
    "TableDialog.ErrorDialogTitle":     "Cannot Insert Table",
    "TableDialog.ErrorDialog.Columns":  "The entered columns value is not valid.  Please specify a number between 1 and 50.",
    "TableDialog.ErrorDialog.Rows":     "The entered rows value is not valid.  Please specify a number between 1 and 50."
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
    insertMenu.addItem(new ExtrasApp.OptionModel("inserthyperlink", this._rb.get("Menu.InsertHyperlink"), null));
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
    formatMenu.addItem(new ExtrasApp.OptionModel("foreground",  this._rb.get("Menu.SetForeground"), null));
    formatMenu.addItem(new ExtrasApp.OptionModel("background",  this._rb.get("Menu.SetBackground"), null));
    
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
        var separatorIndex = e.modelId.indexOf("/", 1);
        if (separatorIndex == -1) {
            this._richTextInput.peer.doCommand(e.modelId.substring(1));
        } else {
            this._richTextInput.peer.doCommand(e.modelId.substring(1, separatorIndex),
                    e.modelId.substring(separatorIndex + 1));
        }
    } else {
        switch (e.modelId) {
        case "foreground":
            this._processSetForegroundDialog();
            break;
        case "background":
            this._processSetBackgroundDialog();
            break;
        case "inserttable":
            this._processInsertTableDialog();
            break;
        case "inserthyperlink":
            this._processInsertHyperlinkDialog();
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

/**
 * Event handler for color selection events from background ColorDialog.
 */
ExtrasRender.ComponentSync.RichTextArea.prototype._processSetBackground = function(e) {
    this._richTextInput.peer.doCommand("hilitecolor", e.data.value);
};

/**
 * Event handler for user request (from menu/toolbar) to set background color.
 */
ExtrasRender.ComponentSync.RichTextArea.prototype._processSetBackgroundDialog = function(e) {
    var colorDialog = new ExtrasRender.ComponentSync.RichTextArea.ColorDialog(this.component, true);
    colorDialog.addListener("colorSelect", new EchoCore.MethodRef(this, this._processSetBackground));
    this._contentPane.add(colorDialog);
};

/**
 * Event handler for color selection events from foreground ColorDialog.
 */
ExtrasRender.ComponentSync.RichTextArea.prototype._processSetForeground = function(e) {
    this._richTextInput.peer.doCommand("forecolor", e.data.value);
};

/**
 * Event handler for user request (from menu/toolbar) to set foreground color.
 */
ExtrasRender.ComponentSync.RichTextArea.prototype._processSetForegroundDialog = function(e) {
    var colorDialog = new ExtrasRender.ComponentSync.RichTextArea.ColorDialog(this.component, false);
    colorDialog.addListener("colorSelect", new EchoCore.MethodRef(this, this._processSetForeground));
    this._contentPane.add(colorDialog);
};

/**
 * Event handler for table insert events from foreground TableDialog.
 */
ExtrasRender.ComponentSync.RichTextArea.prototype._processInsertTable = function(e) {
    var rowHtml = "";
    for (var i = 0; i < e.data.columns; ++i) {
        rowHtml += "<td></td>";
    }
    rowHtml = "<tr>" + rowHtml + "</tr>";
    var tableHtml = "<table width=\"100%\" border=\"1\" cellspacing=\"0\" cellpadding=\"1\"><tbody>";
    for (var i = 0; i < e.data.rows; ++i) {
        tableHtml += rowHtml;
    }
    tableHtml += "</tbody></table>";
    this._richTextInput.peer._insertHtml(tableHtml);
};

/**
 * Event handler for user request (from menu/toolbar) to insert a table.
 */
ExtrasRender.ComponentSync.RichTextArea.prototype._processInsertTableDialog = function(e) {
    var tableDialog = new ExtrasRender.ComponentSync.RichTextArea.TableDialog(this.component);
    tableDialog.addListener("tableInsert", new EchoCore.MethodRef(this, this._processInsertTable));
    this._contentPane.add(tableDialog);
};

ExtrasRender.ComponentSync.RichTextArea.prototype._processInsertHyperlink = function(e) {
}

ExtrasRender.ComponentSync.RichTextArea.prototype._processInsertHyperlinkDialog = function(e) {
    var hyperlinkDialog = new ExtrasRender.ComponentSync.RichTextArea.HyperlinkDialog(this.component);
    hyperlinkDialog.addListener("hyperlnkInsert", new EchoCore.MethodRef(this, this._processInsertHyperlink));
    this._contentPane.add(hyperlinkDialog);
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

ExtrasRender.ComponentSync.RichTextArea.ColorDialog = function(richTextArea, setBackground) {
    EchoApp.WindowPane.call(this, {
        styleName: richTextArea.getRenderProperty("windowPaneStyleName"),
        title:     richTextArea.peer._rb.get(setBackground ? "ColorDialog.Title.Background" : "ColorDialog.Title.Foreground"),
        width:     new EchoApp.Property.Extent(280),
        height:    new EchoApp.Property.Extent(320)
    });
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
    
    var layoutColumn = new EchoApp.Column({
        insets: new EchoApp.Property.Insets(10)
    });
    splitPane.add(layoutColumn);
    
    layoutColumn.add(new EchoApp.Label({
        text: richTextArea.peer._rb.get(setBackground ? "ColorDialog.PromptBackground" : "ColorDialog.PromptForeground")
    }));

    this._colorSelect = new ExtrasApp.ColorSelect();
    this._colorSelect.setProperty("displayValue", true);
    layoutColumn.add(this._colorSelect);
};

ExtrasRender.ComponentSync.RichTextArea.ColorDialog.prototype = EchoCore.derive(EchoApp.WindowPane);

ExtrasRender.ComponentSync.RichTextArea.ColorDialog.prototype._processCancel = function(e) {
    this.parent.remove(this);
};

ExtrasRender.ComponentSync.RichTextArea.ColorDialog.prototype._processOk = function(e) {
    var color = this._colorSelect.getProperty("color");
    this.parent.remove(this);
    this.fireEvent(new EchoCore.Event("colorSelect", this, color));
};

ExtrasRender.ComponentSync.RichTextArea.HyperlinkDialog = function(richTextArea) {
    EchoApp.WindowPane.call(this, {
        styleName: richTextArea.getRenderProperty("windowPaneStyleName"),
        title:     richTextArea.peer._rb.get("HyperlinkDialog.Title"),
        width:     new EchoApp.Property.Extent(280),
        height:    new EchoApp.Property.Extent(320)
    });
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
    
    var layoutColumn = new EchoApp.Column({
        insets: new EchoApp.Property.Insets(10)
    });
    splitPane.add(layoutColumn);
    
    layoutColumn.add(new EchoApp.Label({
        text: richTextArea.peer._rb.get("HyperlinkDialog.PromptURL")
    }));
    
    this._urlField = new EchoApp.TextField({
        width: new EchoApp.Property.Extent("100%")
    });
    layoutColumn.add(this._urlField);
    
    layoutColumn.add(new EchoApp.Label({
        text: richTextArea.peer._rb.get("HyperlinkDialog.PromptDescription")
    }));
    
    this._descriptionField = new EchoApp.TextField({
        width: new EchoApp.Property.Extent("100%")
    });
    layoutColumn.add(this._descriptionField);
};

ExtrasRender.ComponentSync.RichTextArea.HyperlinkDialog.prototype = EchoCore.derive(EchoApp.WindowPane);

ExtrasRender.ComponentSync.RichTextArea.HyperlinkDialog.prototype._processCancel = function(e) {
    this.parent.remove(this);
};

ExtrasRender.ComponentSync.RichTextArea.HyperlinkDialog.prototype._processOk = function(e) {
    var url = this._urlField.getProperty("text");
    this.parent.remove(this);
    this.fireEvent(new EchoCore.Event("insertHyperlink", this, url));
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

ExtrasRender.ComponentSync.RichTextArea.InputPeer.prototype._insertHtml = function(html) {
    if (EchoWebCore.Environment.BROWSER_INTERNET_EXPLORER) {
        if (!this._selectionRange) {
            this._selectionRange = this._iframeElement.contentWindow.document.body.createTextRange();
        }
        this._selectionRange.select();
        this._selectionRange.pasteHTML(html);
    } else {
        this.doCommand("inserthtml", html);
    }
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
    }
};

ExtrasRender.ComponentSync.RichTextArea.MessageDialog = function(richTextArea, title, message) {
    EchoApp.WindowPane.call(this, {
        styleName: richTextArea.getRenderProperty("windowPaneStyleName"),
        title:     title,
        width:     new EchoApp.Property.Extent(280),
        height:    new EchoApp.Property.Extent(320)
    });
    this.addListener("close", new EchoCore.MethodRef(this, this._processClose));
    
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

    okButton.addListener("action", new EchoCore.MethodRef(this, this._processClose));
    ExtrasRender.configureStyle(okButton, richTextArea.getRenderProperty("controlPaneButtonStyleName"), 
            ExtrasRender.DEFAULT_CONTROL_PANE_BUTTON_STYLE);
    controlsRow.add(okButton);
    
    splitPane.add(new EchoApp.Label({
        text: message,
        layoutData: new EchoApp.LayoutData({
            insets: new EchoApp.Property.Insets(30)
        })
    }));
};

ExtrasRender.ComponentSync.RichTextArea.MessageDialog.prototype = EchoCore.derive(EchoApp.WindowPane);

ExtrasRender.ComponentSync.RichTextArea.MessageDialog.prototype._processClose = function(e) {
    this.parent.remove(this);
};

ExtrasRender.ComponentSync.RichTextArea.TableDialog = function(richTextArea, setBackground) {
    this._richTextArea = richTextArea;
    
    EchoApp.WindowPane.call(this, {
        styleName: richTextArea.getRenderProperty("windowPaneStyleName"),
        title:     richTextArea.peer._rb.get("TableDialog.Title"),
        width:     new EchoApp.Property.Extent(280),
        height:    new EchoApp.Property.Extent(320)
    });
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
    
    var layoutGrid = new EchoApp.Grid({
        insets: new EchoApp.Property.Insets(10)
    });
    splitPane.add(layoutGrid);
    
    layoutGrid.add(new EchoApp.Label({
        text: richTextArea.peer._rb.get("TableDialog.PromptRows"),
        layoutData: new EchoApp.LayoutData({
            alignment: new EchoApp.Property.Alignment(EchoApp.Property.Alignment.TRAILING)
        })
    }));
    
    this._rowsField = new EchoApp.TextField({
        text: "2",
        width: new EchoApp.Property.Extent("100px")   
    });
    layoutGrid.add(this._rowsField);
    
    layoutGrid.add( new EchoApp.Label({
        text: richTextArea.peer._rb.get("TableDialog.PromptColumns"),
        layoutData: new EchoApp.LayoutData({
            alignment: new EchoApp.Property.Alignment(EchoApp.Property.Alignment.TRAILING)
        })
    }));
    
    this._columnsField = new EchoApp.TextField({
        text: "3",
        width: new EchoApp.Property.Extent("100px")
    });
    layoutGrid.add(this._columnsField);
};

ExtrasRender.ComponentSync.RichTextArea.TableDialog.prototype = EchoCore.derive(EchoApp.WindowPane);

ExtrasRender.ComponentSync.RichTextArea.TableDialog.prototype._processCancel = function(e) {
    this.parent.remove(this);
};

ExtrasRender.ComponentSync.RichTextArea.TableDialog.prototype._processOk = function(e) {
    var data = {
        rows: parseInt(this._rowsField.getProperty("text")),
        columns: parseInt(this._columnsField.getProperty("text"))
    };
    if (isNaN(data.rows) || data.rows < 1 || data.rows > 50) {
        this.parent.add(new ExtrasRender.ComponentSync.RichTextArea.MessageDialog(this._richTextArea, 
                this._richTextArea.peer._rb.get("TableDialog.ErrorDialogTitle"), 
                this._richTextArea.peer._rb.get("TableDialog.ErrorDialog.Rows")));
        return;
    }
    if (isNaN(data.columns) || data.columns < 1 || data.columns > 50) {
        this.parent.add(new ExtrasRender.ComponentSync.RichTextArea.MessageDialog(this._richTextArea, 
                this._richTextArea.peer._rb.get("TableDialog.ErrorDialogTitle"), 
                this._richTextArea.peer._rb.get("TableDialog.ErrorDialog.Columns")));
        return;
    }
    this.parent.remove(this);
    this.fireEvent(new EchoCore.Event("tableInsert", this, data));
};

EchoApp.ComponentFactory.registerType("ExtrasApp.RichTextInput", ExtrasRender.ComponentSync.RichTextArea.InputComponent);

EchoRender.registerPeer("ExtrasApp.RichTextArea", ExtrasRender.ComponentSync.RichTextArea);
EchoRender.registerPeer("ExtrasApp.RichTextInput", ExtrasRender.ComponentSync.RichTextArea.InputPeer);
