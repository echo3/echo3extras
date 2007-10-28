/**
 * Component rendering peer: RichTextArea
 */
ExtrasRender.ComponentSync.RichTextArea = EchoCore.extend(EchoArc.ComponentSync, {

    global: {

        DEFAULT_RESOURCE_BUNDLE: new EchoCore.ResourceBundle({
            "ColorDialog.Title.Foreground":     "Text Color",
            "ColorDialog.Title.Background":     "Highlight Color",
            "ColorDialog.PromptForeground":     "Foreground:",
            "ColorDialog.PromptBackground":     "Background:",
            "Error.ClipboardAccessDisabled":    "This browser has clipboard access disabled. "
                                                + "Use keyboard shortcuts or change your security settings.",
            "Generic.Cancel":                   "Cancel",
            "Generic.Error":                    "Error",
            "Generic.Ok":                       "Ok",
            "HyperlinkDialog.Title":            "Insert Hyperlink",
            "HyperlinkDialog.PromptURL":        "URL:",
            "HyperlinkDialog.PromptDescription":
                                                "Description Text:",
            "HyperlinkDialog.ErrorDialogTitle": "Cannot Insert Hyperlink",
            "HyperlinkDialog.ErrorDialog.URL":  
                                                "The URL entered is not valid.",
            "ImageDialog.Title":                "Insert Image",
            "ImageDialog.PromptURL":            "URL:",
            "ImageDialog.ErrorDialogTitle":     "Cannot Insert Image",
            "ImageDialog.ErrorDialog.URL":  
                                                "The URL entered is not valid.",
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
            "Menu.InsertHorizontalRule":        "Horizontal Rule",
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
            "TableDialog.ErrorDialog.Columns":  "The entered columns value is not valid.  "
                                                + "Please specify a number between 1 and 50.",
            "TableDialog.ErrorDialog.Rows":     "The entered rows value is not valid.  Please specify a number between 1 and 50."
        })
    },
    
    globalInitialize: function() {
        EchoRender.registerPeer("ExtrasApp.RichTextArea", this);
    },

    initialize: function() {
        EchoArc.ComponentSync.prototype.initialize.call(this);
        this._rb = ExtrasRender.ComponentSync.RichTextArea.DEFAULT_RESOURCE_BUNDLE; 
    },

    createBaseComponent: function() {
        var controlsRow;
        
        var contentPane = new EchoApp.ContentPane({
            children: [
                // Menu SplitPane
                new EchoApp.SplitPane({
                    orientation: EchoApp.SplitPane.ORIENTATION_VERTICAL_TOP_BOTTOM,
                    separatorPosition: new EchoApp.Extent(26),
                    children: [
                        // Menu Bar
                        new ExtrasApp.MenuBarPane({
                            styleName: this.component.getRenderProperty("menuStyleName"),
                            layoutData: new EchoApp.LayoutData({
                                overflow: EchoApp.SplitPane.OVERFLOW_HIDDEN
                            }),
                            model: this._createMainMenuBarModel(),
                            events: {
                                action: new EchoCore.MethodRef(this, this._processMenuAction)
                            }
                        }),
                        // Main Layout Container
                        new EchoApp.Column({
                            layoutData: new EchoApp.LayoutData({
                                overflow: EchoApp.SplitPane.OVERFLOW_HIDDEN
                            }),
                            children: [
                                // Controls Row (control groups added later)
                                controlsRow = new EchoApp.Row({
                                    styleName: this.component.getRenderProperty("toolbarRowStyleName"),
                                    cellSpacing: new EchoApp.Extent(10),
                                    insets: new EchoApp.Insets(2)
                                }),
                                // Text Input Field
                                this._richTextInput = new ExtrasRender.ComponentSync.RichTextArea.InputComponent()
                            ]
                        })
                    ]
                })
            ]
        });
        
        // Undo/Redo Tools
        controlsRow.add(new EchoApp.Row({
            children: [
                this._createToolbarButton("<<<", this._icons.undo, this._rb.get("Menu.Undo"), this._processCommand, "undo"),
                this._createToolbarButton(">>>", this._icons.redo, this._rb.get("Menu.Redo"), this._processCommand, "redo")
            ]
        }));
        
        // Font Bold/Italic/Underline Tools
        controlsRow.add(new EchoApp.Row({
            children: [
                this._createToolbarButton("B", this._icons.bold, this._rb.get("Menu.Bold"), this._processCommand, "bold"),
                this._createToolbarButton("I", this._icons.italic, this._rb.get("Menu.Italic"), this._processCommand, "italic"),
                this._createToolbarButton("U", this._icons.underline, this._rb.get("Menu.Underline"), 
                        this._processCommand, "underline")
            ]
        }));
        
        //Super/Subscript Tools
        controlsRow.add(new EchoApp.Row({
            children: [
                this._createToolbarButton("^", this._icons.superscript, this._rb.get("Menu.Superscript"), 
                        this._processCommand, "superscript"),
                this._createToolbarButton("v", this._icons.subscript,this._rb.get("Menu.Subscript"), 
                        this._processCommand, "subscript")
            ]
        }));
        
        // Alignment Tools
        controlsRow.add(new EchoApp.Row({
            children: [
                this._createToolbarButton("<-", this._icons.alignmentLeft, this._rb.get("Menu.Left"), 
                        this._processCommand, "justifyleft"),
                this._createToolbarButton("-|-", this._icons.alignmentCenter, this._rb.get("Menu.Center"), 
                        this._processCommand, "justifycenter"),
                this._createToolbarButton("->", this._icons.alignmentRight, this._rb.get("Menu.Right"), 
                        this._processCommand, "justifyright"),
                this._createToolbarButton("||", this._icons.alignmentJustify, this._rb.get("Menu.Justified"), 
                        this._processCommand, "justifyfull")
            ]
        }));
        
        // Color Tools
        controlsRow.add(new EchoApp.Row({
            children: [
                this._createToolbarButton("FG", this._icons.foreground, this._rb.get("Menu.SetForeground"), 
                        this._processSetForegroundDialog),
                this._createToolbarButton("BG", this._icons.background, this._rb.get("Menu.SetBackground"), 
                        this._processSetBackgroundDialog)
            ]
        }));
        
        // Insert Tools
        controlsRow.add(new EchoApp.Row({
            children: [
                this._createToolbarButton("Bulleted List", this._icons.bulletedList, this._rb.get("Menu.BulletedList"), 
                        this._processCommand, "insertunorderedlist"),
                this._createToolbarButton("Numbered List", this._icons.numberedList, this._rb.get("Menu.NumberedList"), 
                        this._processCommand, "insertorderedlist"),
                this._createToolbarButton("Horizontal Rule", this._icons.horizontalRule, this._rb.get("Menu.InsertHorizontalRule"), 
                        this._processCommand, "inserthorizontalrule"),
                this._createToolbarButton("Image", this._icons.image, this._rb.get("Menu.InsertImage"), 
                        this._processInsertImageDialog),
                this._createToolbarButton("Hyperlink", this._icons.hyperlink, this._rb.get("Menu.InsertHyperlink"), 
                        this._processInsertHyperlinkDialog),
                this._createToolbarButton("Table", this._icons.table, this._rb.get("Menu.InsertTable"), 
                        this._processInsertTableDialog)
            ]
        }));
    
        this._richTextInput._richTextArea = this.component;
        
        return contentPane;
    },
    
    _createMainMenuBarModel: function() {
        return new ExtrasApp.MenuModel(null, null, null, [
            new ExtrasApp.MenuModel(null, this._rb.get("Menu.Edit"), null, [
                new ExtrasApp.OptionModel("/undo", this._rb.get("Menu.Undo"), this._icons.undo),
                new ExtrasApp.OptionModel("/redo", this._rb.get("Menu.Redo"), this._icons.redo),
                new ExtrasApp.SeparatorModel(),
                new ExtrasApp.OptionModel("cut", this._rb.get("Menu.Cut"), this._icons.cut),
                new ExtrasApp.OptionModel("copy", this._rb.get("Menu.Copy"), this._icons.copy),
                new ExtrasApp.OptionModel("paste", this._rb.get("Menu.Paste"), this._icons.paste),
                new ExtrasApp.OptionModel("delete", this._rb.get("Menu.Delete"), this._icons["delete"]),
                new ExtrasApp.SeparatorModel(),
                new ExtrasApp.OptionModel("/selectall", this._rb.get("Menu.SelectAll"), this._icons.selectAll)
            ]),
            new ExtrasApp.MenuModel(null, this._rb.get("Menu.Insert"), null, [
                new ExtrasApp.OptionModel("/insertunorderedlist", this._rb.get("Menu.BulletedList"), this._icons.bulletedList),
                new ExtrasApp.OptionModel("/insertorderedlist", this._rb.get("Menu.NumberedList"), this._icons.numberedList),
                new ExtrasApp.SeparatorModel(),
                new ExtrasApp.OptionModel("/inserthorizontalrule", this._rb.get("Menu.InsertHorizontalRule"),
                        this._icons.horizontalRule),
                new ExtrasApp.OptionModel("insertimage", this._rb.get("Menu.InsertImage"), this._icons.image),
                new ExtrasApp.OptionModel("inserthyperlink", this._rb.get("Menu.InsertHyperlink"), this._icons.hyperlink),
                new ExtrasApp.SeparatorModel(),
                new ExtrasApp.OptionModel("inserttable", this._rb.get("Menu.InsertTable"), this._icons.table)
            ]),
            new ExtrasApp.MenuModel(null, this._rb.get("Menu.Format"), null, [
                new ExtrasApp.MenuModel(null, this._rb.get("Menu.TextStyle"), null, [
                    new ExtrasApp.OptionModel("/removeformat",  this._rb.get("Menu.PlainText"), null),
                    new ExtrasApp.SeparatorModel(),
                    new ExtrasApp.OptionModel("/bold",  this._rb.get("Menu.Bold"), this._icons.bold),
                    new ExtrasApp.OptionModel("/italic",  this._rb.get("Menu.Italic"), this._icons.italic),
                    new ExtrasApp.OptionModel("/underline",  this._rb.get("Menu.Underline"), this._icons.underline),
                    new ExtrasApp.OptionModel("/strikethrough",  this._rb.get("Menu.Strikethrough"), this._icons.strikethrough),
                    new ExtrasApp.SeparatorModel(),
                    new ExtrasApp.OptionModel("/superscript", this._rb.get("Menu.Superscript"), this._icons.superscript),
                    new ExtrasApp.OptionModel("/subscript", this._rb.get("Menu.Subscript"), this._icons.subscript)
                ]),
                new ExtrasApp.MenuModel(null, this._rb.get("Menu.Format"), null, [
                    new ExtrasApp.OptionModel("/formatblock/<p>", this._rb.get("Menu.ParagraphStyle"), null),
                    new ExtrasApp.OptionModel("/formatblock/<pre>", this._rb.get("Menu.Preformatted"), null),
                    new ExtrasApp.OptionModel("/formatblock/<h1>", this._rb.get("Menu.Heading1"), null),
                    new ExtrasApp.OptionModel("/formatblock/<h2>", this._rb.get("Menu.Heading2"), null),
                    new ExtrasApp.OptionModel("/formatblock/<h3>", this._rb.get("Menu.Heading3"), null),
                    new ExtrasApp.OptionModel("/formatblock/<h4>", this._rb.get("Menu.Heading4"), null),
                    new ExtrasApp.OptionModel("/formatblock/<h5>", this._rb.get("Menu.Heading5"), null),
                    new ExtrasApp.OptionModel("/formatblock/<h6>", this._rb.get("Menu.Heading6"), null)
                ]),
                new ExtrasApp.MenuModel(null, this._rb.get("Menu.Alignment"), null, [
                    new ExtrasApp.OptionModel("/justifyleft",  this._rb.get("Menu.Left"), this._icons.alignmentLeft),
                    new ExtrasApp.OptionModel("/justifycenter",  this._rb.get("Menu.Center"), this._icons.alignmentCenter),
                    new ExtrasApp.OptionModel("/justifyright",  this._rb.get("Menu.Right"), this._icons.alignmentRight),
                    new ExtrasApp.OptionModel("/justifyfull",  this._rb.get("Menu.Justified"), this._icons.alignmentJustify)
                ]),
                new ExtrasApp.SeparatorModel(),
                new ExtrasApp.OptionModel("/indent",  this._rb.get("Menu.Indent"), this._icons.indent),
                new ExtrasApp.OptionModel("/outdent",  this._rb.get("Menu.Outdent"), this._icons.outdent),
                new ExtrasApp.SeparatorModel(),
                new ExtrasApp.OptionModel("foreground",  this._rb.get("Menu.SetForeground"), this._icons.foreground),
                new ExtrasApp.OptionModel("background",  this._rb.get("Menu.SetBackground"), this._icons.background)
            ])
        ]);
    },
    
    _createToolbarButton: function(text, icon, toolTipText, eventMethod, actionCommand) {
        var button = new EchoApp.Button({
            actionCommand: actionCommand,
            styleName: this.component.getRenderProperty("toolbarButtonStyleName"),
            text: icon ? null : text,
            icon: icon,
            toolTipText: toolTipText
        });
        if (eventMethod) {
            button.addListener("action", new EchoCore.MethodRef(this, eventMethod));
        }
        return button;
    },
    
    getDomainElement: function() { 
        return this._mainDivElement;
    },
    
    getIcons: function() {
        return this.component.getProperty("icons");
    },
    
    _processCommand: function(e) {
        this._richTextInput.peer.doCommand(e.data);
    },
    
    _processMenuAction: function(e) {
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
            case "insertimage":
                this._processInsertImageDialog();
                break;
            case "cut":
            case "copy":
            case "paste":
            case "delete":
                try {
                    this._richTextInput.peer.doCommand(e.modelId);
                } catch (ex) {
                    this.baseComponent.add(new ExtrasRender.ComponentSync.RichTextArea.MessageDialog(this.component,
                            this._rb.get("Generic.Error"), this._rb.get("Error.ClipboardAccessDisabled"))); 
                }
            }
        }
    },
    
    /**
     * Event handler for color selection events from background ColorDialog.
     */
    _processSetBackground: function(e) {
        this._richTextInput.peer.doCommand("hilitecolor", e.data.value);
    },
    
    /**
     * Event handler for user request (from menu/toolbar) to set background color.
     */
    _processSetBackgroundDialog: function(e) {
        var colorDialog = new ExtrasRender.ComponentSync.RichTextArea.ColorDialog(this.component, true);
        colorDialog.addListener("colorSelect", new EchoCore.MethodRef(this, this._processSetBackground));
        this.baseComponent.add(colorDialog);
    },
    
    /**
     * Event handler for color selection events from foreground ColorDialog.
     */
    _processSetForeground: function(e) {
        this._richTextInput.peer.doCommand("forecolor", e.data.value);
    },
    
    /**
     * Event handler for user request (from menu/toolbar) to set foreground color.
     */
    _processSetForegroundDialog: function(e) {
        var colorDialog = new ExtrasRender.ComponentSync.RichTextArea.ColorDialog(this.component, false);
        colorDialog.addListener("colorSelect", new EchoCore.MethodRef(this, this._processSetForeground));
        this.baseComponent.add(colorDialog);
    },
    
    /**
     * Event handler for table insert events from foreground TableDialog.
     */
    _processInsertTable: function(e) {
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
    },
    
    /**
     * Event handler for user request (from menu/toolbar) to insert a table.
     */
    _processInsertTableDialog: function(e) {
        var tableDialog = new ExtrasRender.ComponentSync.RichTextArea.TableDialog(this.component);
        tableDialog.addListener("tableInsert", new EchoCore.MethodRef(this, this._processInsertTable));
        this.baseComponent.add(tableDialog);
    },
    
    _processInsertHyperlink: function(e) {
        this._richTextInput.peer._insertHtml("<a href=\"" + e.data.url + "\">"
                + (e.data.description ? e.data.description : e.data.url) + "</a>");
    },
    
    _processInsertHyperlinkDialog: function(e) {
        var hyperlinkDialog = new ExtrasRender.ComponentSync.RichTextArea.HyperlinkDialog(this.component);
        hyperlinkDialog.addListener("insertHyperlink", new EchoCore.MethodRef(this, this._processInsertHyperlink));
        this.baseComponent.add(hyperlinkDialog);
    },
    
    _processInsertImage: function(e) {
        this._richTextInput.peer._insertHtml("<img src=\"" + e.data.url + "\">");
    },
    
    _processInsertImageDialog: function(e) {
        var imageDialog = new ExtrasRender.ComponentSync.RichTextArea.ImageDialog(this.component);
        imageDialog.addListener("insertImage", new EchoCore.MethodRef(this, this._processInsertImage));
        this.baseComponent.add(imageDialog);
    },
    
    renderAdd: function(update, parentElement) {
        this._icons = this.getIcons();
        if (!this._icons) {
            this._icons = {};
        }
        
        this._mainDivElement = document.createElement("div");
        this._mainDivElement.style.height = "300px";
        parentElement.appendChild(this._mainDivElement);
    },
    
    renderDispose: function(update) {
        EchoArc.ComponentSync.prototype.renderDispose.call(this, update);
        this._mainDivElement = null;
    },
    
    renderDisplay: function() {
        EchoArc.ComponentSync.prototype.renderDisplay.call(this);
    },
    
    renderUpdate: function(update) {
        var element = this._mainDivElement;
        var containerElement = element.parentNode;
        EchoRender.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
    }
});

ExtrasRender.ComponentSync.RichTextArea.AbstractDialog = EchoCore.extend(EchoApp.WindowPane, {

    global: {
        TYPE_OK: 0,
        TYPE_OK_CANCEL: 1,
    },

    initialize: function(richTextArea, type, properties, content) {
        this._richTextArea = richTextArea;
    
        var controlPaneSplitPaneStyleName = richTextArea.getRenderProperty("controlPaneSplitPaneStyleName");
        var controlPaneRowStyleName = richTextArea.getRenderProperty("controlPaneRowStyleName");
        var controlPaneButtonStyleName = richTextArea.getRenderProperty("controlPaneButtonStyleName"); 
        
        EchoApp.WindowPane.prototype.initialize.call(this, {
            styleName: richTextArea.getRenderProperty("windowPaneStyleName"),
            iconInsets: new EchoApp.Insets(6, 10),
            width: new EchoApp.Extent(280),
            height: new EchoApp.Extent(200),
            resizable: false,
            events: {
                close: new EchoCore.MethodRef(this, this._processCancel)
            },
            children: [
                new EchoApp.SplitPane({
                    styleName: controlPaneSplitPaneStyleName,
                    style: controlPaneSplitPaneStyleName ? null : ExtrasRender.DEFAULT_CONTROL_PANE_SPLIT_PANE_STYLE,
                    children: [
                        this.controlsRow = new EchoApp.Row({
                            styleName: controlPaneRowStyleName,
                            style: controlPaneRowStyleName ? null : ExtrasRender.DEFAULT_CONTROL_PANE_ROW_STYLE
                        }),
                        content,
                    ]
                })
            ]
        });
        
        this.controlsRow.add(new EchoApp.Button({
            styleName: controlPaneButtonStyleName,
            style: controlPaneButtonStyleName ? null : DEFAULT_CONTROL_PANE_BUTTON_STYLE,
            text: richTextArea.peer._rb.get("Generic.Ok"),
            icon: richTextArea.peer._icons.ok,
            events: {
                action: new EchoCore.MethodRef(this, this._processOk)
            }
        }));
        
        if (type == ExtrasRender.ComponentSync.RichTextArea.AbstractDialog.TYPE_OK_CANCEL) {
            this.controlsRow.add(new EchoApp.Button({
                styleName: controlPaneButtonStyleName,
                style: controlPaneButtonStyleName ? null : DEFAULT_CONTROL_PANE_BUTTON_STYLE,
                text: richTextArea.peer._rb.get("Generic.Cancel"),
                icon: richTextArea.peer._icons.cancel,
                events: {
                    action: new EchoCore.MethodRef(this, this._processCancel)
                }
            }));
        }
        
        for (var x in properties) {
            this.setProperty(x, properties[x]);
        }
    },
    
    _processCancel: function(e) {
        this.parent.remove(this);
    },
    
    _processOk: function(e) {
        this.parent.remove(this);
    }
});

ExtrasRender.ComponentSync.RichTextArea.ColorDialog = EchoCore.extend(
        ExtrasRender.ComponentSync.RichTextArea.AbstractDialog, {

    initialize: function(richTextArea, setBackground) {
        ExtrasRender.ComponentSync.RichTextArea.AbstractDialog.prototype.initialize.call(this, richTextArea,
                ExtrasRender.ComponentSync.RichTextArea.AbstractDialog.TYPE_OK_CANCEL, 
                {
                    title: richTextArea.peer._rb.get(setBackground ? 
                            "ColorDialog.Title.Background" : "ColorDialog.Title.Foreground"),
                    icon: setBackground ? richTextArea.peer._icons.background : richTextArea.peer._icons.foreground,
                    width: new EchoApp.Extent(280),
                    height: new EchoApp.Extent(320)
                },
                new EchoApp.Column({
                    insets: new EchoApp.Insets(10),
                    children: [
                        new EchoApp.Label({
                            text: richTextArea.peer._rb.get(
                                    setBackground ? "ColorDialog.PromptBackground" : "ColorDialog.PromptForeground")
                        }),
                        this._colorSelect = new ExtrasApp.ColorSelect({
                            displayValue: true
                        })
                    ]
                }));
    },
    
    _processOk: function(e) {
        var color = this._colorSelect.getProperty("color");
        this.parent.remove(this);
        this.fireEvent(new EchoCore.Event("colorSelect", this, color));
    }
});

ExtrasRender.ComponentSync.RichTextArea.HyperlinkDialog = EchoCore.extend(
        ExtrasRender.ComponentSync.RichTextArea.AbstractDialog, {

    initialize: function(richTextArea) {
        ExtrasRender.ComponentSync.RichTextArea.AbstractDialog.prototype.initialize.call(this, richTextArea,
                ExtrasRender.ComponentSync.RichTextArea.AbstractDialog.TYPE_OK_CANCEL,
                {
                    title: richTextArea.peer._rb.get("HyperlinkDialog.Title"), 
                    icon: richTextArea.peer._icons.hyperlink
                },
                new EchoApp.Column({
                    insets: new EchoApp.Insets(10),
                    children: [
                        new EchoApp.Label({
                            text: richTextArea.peer._rb.get("HyperlinkDialog.PromptURL")
                        }),
                        this._urlField = new EchoApp.TextField({
                            width: new EchoApp.Extent("100%")
                        }),
                        new EchoApp.Label({
                            text: richTextArea.peer._rb.get("HyperlinkDialog.PromptDescription")
                        }),
                        this._descriptionField = new EchoApp.TextField({
                            width: new EchoApp.Extent("100%")
                        })
                    ]
                }));

    },
    
    _processOk: function(e) {
        var data = {
            url: this._urlField.getProperty("text"),
            description: this._descriptionField.getProperty("text")
        };
        if (!data.url) {
            this.parent.add(new ExtrasRender.ComponentSync.RichTextArea.MessageDialog(this._richTextArea, 
                    this._richTextArea.peer._rb.get("HyperlinkDialog.ErrorDialogTitle"), 
                    this._richTextArea.peer._rb.get("HyperlinkDialog.ErrorDialog.URL")));
            return;
        }
        this.parent.remove(this);
        this.fireEvent(new EchoCore.Event("insertHyperlink", this, data));
    }
});

ExtrasRender.ComponentSync.RichTextArea.ImageDialog = EchoCore.extend(
        ExtrasRender.ComponentSync.RichTextArea.AbstractDialog, {

    initialize: function(richTextArea) {
        ExtrasRender.ComponentSync.RichTextArea.AbstractDialog.prototype.initialize.call(this, richTextArea,
                ExtrasRender.ComponentSync.RichTextArea.AbstractDialog.TYPE_OK_CANCEL,
                {
                    title: richTextArea.peer._rb.get("ImageDialog.Title"), 
                    image: richTextArea.peer._icons.image
                },
                new EchoApp.Column({
                    insets: new EchoApp.Insets(10),
                    children: [
                        new EchoApp.Label({
                            text: richTextArea.peer._rb.get("ImageDialog.PromptURL")
                        }),
                        this._urlField = new EchoApp.TextField({
                            width: new EchoApp.Extent("100%")
                        })
                    ]
                }));
    },
    
    _processOk: function(e) {
        var data = {
            url: this._urlField.getProperty("text")
        };
        if (!data.url) {
            this.parent.add(new ExtrasRender.ComponentSync.RichTextArea.MessageDialog(this._richTextArea, 
                    this._richTextArea.peer._rb.get("ImageDialog.ErrorDialogTitle"), 
                    this._richTextArea.peer._rb.get("ImageDialog.ErrorDialog.URL")));
            return;
        }
        this.parent.remove(this);
        this.fireEvent(new EchoCore.Event("insertImage", this, data));
    }
});

ExtrasRender.ComponentSync.RichTextArea.InputComponent = EchoCore.extend(EchoApp.Component, {

    globalInitialize: function() {
        EchoApp.ComponentFactory.registerType("ExtrasApp.RichTextInput", this);
    },

    initialize: function(properties) {
        EchoApp.Component.prototype.initialize.call(this, properties);
        this.componentType = "ExtrasApp.RichTextInput";
    }
});

ExtrasRender.ComponentSync.RichTextArea.InputPeer = EchoCore.extend(EchoRender.ComponentSync, {

    globalInitialize: function() {
        EchoRender.registerPeer("ExtrasApp.RichTextInput", this);
    },

    initialize: function() { },
    
    doCommand: function(command, value) {
        this._loadRange();
        this._iframeElement.contentWindow.document.execCommand(command, false, value);
        this._storeData();
    },
    
    _insertHtml: function(html) {
        if (EchoWebCore.Environment.BROWSER_INTERNET_EXPLORER) {
            if (!this._selectionRange) {
                this._selectionRange = this._iframeElement.contentWindow.document.body.createTextRange();
            }
            this._selectionRange.select();
            this._selectionRange.pasteHTML(html);
        } else {
            this.doCommand("inserthtml", html);
        }
    },
    
    _loadRange: function() {
        if (EchoWebCore.Environment.BROWSER_INTERNET_EXPLORER) {
            if (this._selectionRange) {
                this._selectionRange.select();
            }
        }
    },
    
    _processKeyUp: function(e) {
        this._storeData();
        this._storeRange();
    },
    
    _processMouseUp: function(e) {
        this._storeRange();
    },
    
    renderAdd: function(update, parentElement) {
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
        this._iframeElement.frameBorder = "0";
    
        this._mainDivElement.appendChild(this._iframeElement);
    
        parentElement.appendChild(this._mainDivElement);
    },
    
    renderDispose: function(update) {
        EchoWebCore.EventProcessor.removeAll(this._iframeElement.contentWindow.document);
        this._mainDivElement = null;
        this._iframeElement = null;
        this._contentDocumentRendered = false;
        this._selectionRange = null;
    },
    
    _renderContentDocument: function() {
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
    },
    
    renderDisplay: function() {
        if (!this._contentDocumentRendered) {
            this._renderContentDocument();
        }
    },
    
    renderUpdate: function(update) {
        // Not invoked.
    },
    
    _storeData: function() {
        var contentDocument = this._iframeElement.contentWindow.document;
        var html = contentDocument.body.innerHTML;
        this.component._richTextArea.setProperty("text", html);
    },
    
    _storeRange: function() {
        if (EchoWebCore.Environment.BROWSER_INTERNET_EXPLORER) {
            this._selectionRange = this._iframeElement.contentWindow.document.selection.createRange();
        }
    }
});

ExtrasRender.ComponentSync.RichTextArea.MessageDialog = EchoCore.extend(
        ExtrasRender.ComponentSync.RichTextArea.AbstractDialog, {
    
    initialize: function(richTextArea, title, message) {
        ExtrasRender.ComponentSync.RichTextArea.AbstractDialog.prototype.initialize.call(this, richTextArea,
                ExtrasRender.ComponentSync.RichTextArea.AbstractDialog.TYPE_OK,
                {
                    title: title,
                },
                new EchoApp.Label({
                    text: message,
                    layoutData: new EchoApp.LayoutData({
                        insets: new EchoApp.Insets(30)
                    })
                }));
    }
});

ExtrasRender.ComponentSync.RichTextArea.TableDialog = EchoCore.extend(
        ExtrasRender.ComponentSync.RichTextArea.AbstractDialog, {

    initialize: function(richTextArea) {
        ExtrasRender.ComponentSync.RichTextArea.AbstractDialog.prototype.initialize.call(this, richTextArea,
                ExtrasRender.ComponentSync.RichTextArea.AbstractDialog.TYPE_OK_CANCEL,
                {
                    title: richTextArea.peer._rb.get("TableDialog.Title"), 
                    icon: richTextArea.peer._icons.table
                },
                new EchoApp.Grid({
                    insets: new EchoApp.Insets(10),
                    children: [
                        new EchoApp.Label({
                            text: richTextArea.peer._rb.get("TableDialog.PromptRows"),
                            layoutData: new EchoApp.LayoutData({
                                alignment: new EchoApp.Alignment(EchoApp.Alignment.TRAILING)
                            })
                        }),
                        this._rowsField = new EchoApp.TextField({
                            text: "2",
                            width: new EchoApp.Extent("100px")   
                        }),
                        new EchoApp.Label({
                            text: richTextArea.peer._rb.get("TableDialog.PromptColumns"),
                            layoutData: new EchoApp.LayoutData({
                                alignment: new EchoApp.Alignment(EchoApp.Alignment.TRAILING)
                            })
                        }),
                        this._columnsField = new EchoApp.TextField({
                            text: "3",
                            width: new EchoApp.Extent("100px")
                        })
                    ]
                }));
    },
    
    _processOk: function(e) {
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
    }
});
