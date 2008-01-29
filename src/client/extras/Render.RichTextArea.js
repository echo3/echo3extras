/**
 * Component rendering peer: RichTextArea
 */
ExtrasRender.ComponentSync.RichTextArea = Core.extend(EchoArc.ComponentSync, {

    $static: {
        MESSAGES: new Core.ResourceBundle({
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

    $load: function() {
        EchoRender.registerPeer("ExtrasApp.RichTextArea", this);
    },

    $virtual: {
        getIcons: function() {
            return this.component.get("icons");
        }
    },
    
    $construct: function() {
        this._msg = ExtrasRender.ComponentSync.RichTextArea.MESSAGES.get(null);
    },
    
    /**
     * Localized messages for rendered locale.
     */
    _msg: null,

    createComponent: function() {
        var controlsRow;
        
        var contentPane = new EchoApp.ContentPane({
            children: [
                // Menu SplitPane
                new EchoApp.SplitPane({
                    orientation: EchoApp.SplitPane.ORIENTATION_VERTICAL_TOP_BOTTOM,
                    separatorPosition: 26,
                    children: [
                        // Menu Bar
                        new ExtrasApp.MenuBarPane({
                            styleName: this.component.render("menuStyleName"),
                            layoutData: {
                                overflow: EchoApp.SplitPane.OVERFLOW_HIDDEN
                            },
                            model: this._createMainMenuBarModel(),
                            events: {
                                action: Core.method(this, this._processMenuAction)
                            }
                        }),
                        // Main Layout Container
                        new EchoApp.Column({
                            layoutData: {
                                overflow: EchoApp.SplitPane.OVERFLOW_HIDDEN
                            },
                            children: [
                                // Controls Row (control groups added later)
                                controlsRow = new EchoApp.Row({
                                    styleName: this.component.render("toolbarRowStyleName"),
                                    cellSpacing: 10,
                                    insets: 2
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
                this._createToolbarButton("<<<", this._icons.undo, this._msg["Menu.Undo"], this._processCommand, "undo"),
                this._createToolbarButton(">>>", this._icons.redo, this._msg["Menu.Redo"], this._processCommand, "redo")
            ]
        }));
        
        // Font Bold/Italic/Underline Tools
        controlsRow.add(new EchoApp.Row({
            children: [
                this._createToolbarButton("B", this._icons.bold, this._msg["Menu.Bold"], this._processCommand, "bold"),
                this._createToolbarButton("I", this._icons.italic, this._msg["Menu.Italic"], this._processCommand, "italic"),
                this._createToolbarButton("U", this._icons.underline, this._msg["Menu.Underline"], 
                        this._processCommand, "underline")
            ]
        }));
        
        //Super/Subscript Tools
        controlsRow.add(new EchoApp.Row({
            children: [
                this._createToolbarButton("^", this._icons.superscript, this._msg["Menu.Superscript"], 
                        this._processCommand, "superscript"),
                this._createToolbarButton("v", this._icons.subscript,this._msg["Menu.Subscript"], 
                        this._processCommand, "subscript")
            ]
        }));
        
        // Alignment Tools
        controlsRow.add(new EchoApp.Row({
            children: [
                this._createToolbarButton("<-", this._icons.alignmentLeft, this._msg["Menu.Left"], 
                        this._processCommand, "justifyleft"),
                this._createToolbarButton("-|-", this._icons.alignmentCenter, this._msg["Menu.Center"], 
                        this._processCommand, "justifycenter"),
                this._createToolbarButton("->", this._icons.alignmentRight, this._msg["Menu.Right"], 
                        this._processCommand, "justifyright"),
                this._createToolbarButton("||", this._icons.alignmentJustify, this._msg["Menu.Justified"], 
                        this._processCommand, "justifyfull")
            ]
        }));
        
        // Color Tools
        controlsRow.add(new EchoApp.Row({
            children: [
                this._createToolbarButton("FG", this._icons.foreground, this._msg["Menu.SetForeground"], 
                        this._processSetForegroundDialog),
                this._createToolbarButton("BG", this._icons.background, this._msg["Menu.SetBackground"], 
                        this._processSetBackgroundDialog)
            ]
        }));
        
        // Insert Tools
        controlsRow.add(new EchoApp.Row({
            children: [
                this._createToolbarButton("Bulleted List", this._icons.bulletedList, this._msg["Menu.BulletedList"], 
                        this._processCommand, "insertunorderedlist"),
                this._createToolbarButton("Numbered List", this._icons.numberedList, this._msg["Menu.NumberedList"], 
                        this._processCommand, "insertorderedlist"),
                this._createToolbarButton("Horizontal Rule", this._icons.horizontalRule, this._msg["Menu.InsertHorizontalRule"], 
                        this._processCommand, "inserthorizontalrule"),
                this._createToolbarButton("Image", this._icons.image, this._msg["Menu.InsertImage"], 
                        this._processInsertImageDialog),
                this._createToolbarButton("Hyperlink", this._icons.hyperlink, this._msg["Menu.InsertHyperlink"], 
                        this._processInsertHyperlinkDialog),
                this._createToolbarButton("Table", this._icons.table, this._msg["Menu.InsertTable"], 
                        this._processInsertTableDialog)
            ]
        }));
    
        this._richTextInput._richTextArea = this.component;
        
        return contentPane;
    },
    
    _createMainMenuBarModel: function() {
        return new ExtrasApp.MenuModel(null, null, null, [
            new ExtrasApp.MenuModel(null, this._msg["Menu.Edit"], null, [
                new ExtrasApp.OptionModel("/undo", this._msg["Menu.Undo"], this._icons.undo),
                new ExtrasApp.OptionModel("/redo", this._msg["Menu.Redo"], this._icons.redo),
                new ExtrasApp.SeparatorModel(),
                new ExtrasApp.OptionModel("cut", this._msg["Menu.Cut"], this._icons.cut),
                new ExtrasApp.OptionModel("copy", this._msg["Menu.Copy"], this._icons.copy),
                new ExtrasApp.OptionModel("paste", this._msg["Menu.Paste"], this._icons.paste),
                new ExtrasApp.OptionModel("delete", this._msg["Menu.Delete"], this._icons["delete"]),
                new ExtrasApp.SeparatorModel(),
                new ExtrasApp.OptionModel("/selectall", this._msg["Menu.SelectAll"], this._icons.selectAll)
            ]),
            new ExtrasApp.MenuModel(null, this._msg["Menu.Insert"], null, [
                new ExtrasApp.OptionModel("/insertunorderedlist", this._msg["Menu.BulletedList"], this._icons.bulletedList),
                new ExtrasApp.OptionModel("/insertorderedlist", this._msg["Menu.NumberedList"], this._icons.numberedList),
                new ExtrasApp.SeparatorModel(),
                new ExtrasApp.OptionModel("/inserthorizontalrule", this._msg["Menu.InsertHorizontalRule"],
                        this._icons.horizontalRule),
                new ExtrasApp.OptionModel("insertimage", this._msg["Menu.InsertImage"], this._icons.image),
                new ExtrasApp.OptionModel("inserthyperlink", this._msg["Menu.InsertHyperlink"], this._icons.hyperlink),
                new ExtrasApp.SeparatorModel(),
                new ExtrasApp.OptionModel("inserttable", this._msg["Menu.InsertTable"], this._icons.table)
            ]),
            new ExtrasApp.MenuModel(null, this._msg["Menu.Format"], null, [
                new ExtrasApp.MenuModel(null, this._msg["Menu.TextStyle"], null, [
                    new ExtrasApp.OptionModel("/removeformat",  this._msg["Menu.PlainText"], null),
                    new ExtrasApp.SeparatorModel(),
                    new ExtrasApp.OptionModel("/bold",  this._msg["Menu.Bold"], this._icons.bold),
                    new ExtrasApp.OptionModel("/italic",  this._msg["Menu.Italic"], this._icons.italic),
                    new ExtrasApp.OptionModel("/underline",  this._msg["Menu.Underline"], this._icons.underline),
                    new ExtrasApp.OptionModel("/strikethrough",  this._msg["Menu.Strikethrough"], this._icons.strikethrough),
                    new ExtrasApp.SeparatorModel(),
                    new ExtrasApp.OptionModel("/superscript", this._msg["Menu.Superscript"], this._icons.superscript),
                    new ExtrasApp.OptionModel("/subscript", this._msg["Menu.Subscript"], this._icons.subscript)
                ]),
                new ExtrasApp.MenuModel(null, this._msg["Menu.Format"], null, [
                    new ExtrasApp.OptionModel("/formatblock/<p>", this._msg["Menu.ParagraphStyle"], null),
                    new ExtrasApp.OptionModel("/formatblock/<pre>", this._msg["Menu.Preformatted"], null),
                    new ExtrasApp.OptionModel("/formatblock/<h1>", this._msg["Menu.Heading1"], null),
                    new ExtrasApp.OptionModel("/formatblock/<h2>", this._msg["Menu.Heading2"], null),
                    new ExtrasApp.OptionModel("/formatblock/<h3>", this._msg["Menu.Heading3"], null),
                    new ExtrasApp.OptionModel("/formatblock/<h4>", this._msg["Menu.Heading4"], null),
                    new ExtrasApp.OptionModel("/formatblock/<h5>", this._msg["Menu.Heading5"], null),
                    new ExtrasApp.OptionModel("/formatblock/<h6>", this._msg["Menu.Heading6"], null)
                ]),
                new ExtrasApp.MenuModel(null, this._msg["Menu.Alignment"], null, [
                    new ExtrasApp.OptionModel("/justifyleft",  this._msg["Menu.Left"], this._icons.alignmentLeft),
                    new ExtrasApp.OptionModel("/justifycenter",  this._msg["Menu.Center"], this._icons.alignmentCenter),
                    new ExtrasApp.OptionModel("/justifyright",  this._msg["Menu.Right"], this._icons.alignmentRight),
                    new ExtrasApp.OptionModel("/justifyfull",  this._msg["Menu.Justified"], this._icons.alignmentJustify)
                ]),
                new ExtrasApp.SeparatorModel(),
                new ExtrasApp.OptionModel("/indent",  this._msg["Menu.Indent"], this._icons.indent),
                new ExtrasApp.OptionModel("/outdent",  this._msg["Menu.Outdent"], this._icons.outdent),
                new ExtrasApp.SeparatorModel(),
                new ExtrasApp.OptionModel("foreground",  this._msg["Menu.SetForeground"], this._icons.foreground),
                new ExtrasApp.OptionModel("background",  this._msg["Menu.SetBackground"], this._icons.background)
            ])
        ]);
    },
    
    _createToolbarButton: function(text, icon, toolTipText, eventMethod, actionCommand) {
        var button = new EchoApp.Button({
            actionCommand: actionCommand,
            styleName: this.component.render("toolbarButtonStyleName"),
            text: icon ? null : text,
            icon: icon,
            toolTipText: toolTipText
        });
        if (eventMethod) {
            button.addListener("action", Core.method(this, eventMethod));
        }
        return button;
    },
    
    getDomainElement: function() { 
        return this._mainDivElement;
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
                            this._msg["Generic.Error"], this._msg["Error.ClipboardAccessDisabled"])); 
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
        colorDialog.addListener("colorSelect", Core.method(this, this._processSetBackground));
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
        colorDialog.addListener("colorSelect", Core.method(this, this._processSetForeground));
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
        tableDialog.addListener("tableInsert", Core.method(this, this._processInsertTable));
        this.baseComponent.add(tableDialog);
    },
    
    _processInsertHyperlink: function(e) {
        this._richTextInput.peer._insertHtml("<a href=\"" + e.data.url + "\">"
                + (e.data.description ? e.data.description : e.data.url) + "</a>");
    },
    
    _processInsertHyperlinkDialog: function(e) {
        var hyperlinkDialog = new ExtrasRender.ComponentSync.RichTextArea.HyperlinkDialog(this.component);
        hyperlinkDialog.addListener("insertHyperlink", Core.method(this, this._processInsertHyperlink));
        this.baseComponent.add(hyperlinkDialog);
    },
    
    _processInsertImage: function(e) {
        this._richTextInput.peer._insertHtml("<img src=\"" + e.data.url + "\">");
    },
    
    _processInsertImageDialog: function(e) {
        var imageDialog = new ExtrasRender.ComponentSync.RichTextArea.ImageDialog(this.component);
        imageDialog.addListener("insertImage", Core.method(this, this._processInsertImage));
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

ExtrasRender.ComponentSync.RichTextArea.AbstractDialog = Core.extend(EchoApp.WindowPane, {

    $static: {
        TYPE_OK: 0,
        TYPE_OK_CANCEL: 1
    },

    $construct: function(richTextArea, type, properties, content) {
        this._richTextArea = richTextArea;
    
        var controlPaneSplitPaneStyleName = richTextArea.render("controlPaneSplitPaneStyleName");
        var controlPaneRowStyleName = richTextArea.render("controlPaneRowStyleName");
        var controlPaneButtonStyleName = richTextArea.render("controlPaneButtonStyleName"); 
        
        EchoApp.WindowPane.call(this, {
            styleName: richTextArea.render("windowPaneStyleName"),
            iconInsets: "6px 10px",
            width: 280,
            height: 200,
            resizable: false,
            events: {
                close: Core.method(this, this.processCancel)
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
                        content
                    ]
                })
            ]
        });
        
        this.controlsRow.add(new EchoApp.Button({
            styleName: controlPaneButtonStyleName,
            style: controlPaneButtonStyleName ? null : ExtrasRender.DEFAULT_CONTROL_PANE_BUTTON_STYLE,
            text: richTextArea.peer._msg["Generic.Ok"],
            icon: richTextArea.peer._icons.ok,
            events: {
                action: Core.method(this, this.processOk)
            }
        }));
        
        if (type == ExtrasRender.ComponentSync.RichTextArea.AbstractDialog.TYPE_OK_CANCEL) {
            this.controlsRow.add(new EchoApp.Button({
                styleName: controlPaneButtonStyleName,
                style: controlPaneButtonStyleName ? null : ExtrasRender.DEFAULT_CONTROL_PANE_BUTTON_STYLE,
                text: richTextArea.peer._msg["Generic.Cancel"],
                icon: richTextArea.peer._icons.cancel,
                events: {
                    action: Core.method(this, this.processCancel)
                }
            }));
        }
        
        for (var x in properties) {
            this.set(x, properties[x]);
        }
    },
    
    $virtual: {
        
        processCancel: function(e) {
            this.parent.remove(this);
        },
        
        processOk: function(e) {
            this.parent.remove(this);
        }
    }
});

ExtrasRender.ComponentSync.RichTextArea.ColorDialog = Core.extend(
        ExtrasRender.ComponentSync.RichTextArea.AbstractDialog, {

    $construct: function(richTextArea, setBackground) {
        ExtrasRender.ComponentSync.RichTextArea.AbstractDialog.call(this, richTextArea,
                ExtrasRender.ComponentSync.RichTextArea.AbstractDialog.TYPE_OK_CANCEL, 
                {
                    title: richTextArea.peer._msg[setBackground ? 
                            "ColorDialog.Title.Background" : "ColorDialog.Title.Foreground"],
                    icon: setBackground ? richTextArea.peer._icons.background : richTextArea.peer._icons.foreground,
                    width: 280,
                    height: 320
                },
                new EchoApp.Column({
                    insets: 10,
                    children: [
                        new EchoApp.Label({
                            text: richTextArea.peer._msg[
                                    setBackground ? "ColorDialog.PromptBackground" : "ColorDialog.PromptForeground"]
                        }),
                        this._colorSelect = new ExtrasApp.ColorSelect({
                            displayValue: true
                        })
                    ]
                }));
    },
    
    processOk: function(e) {
        var color = this._colorSelect.get("color");
        this.parent.remove(this);
        this.fireEvent({type: "colorSelect", source: this, data : color});
    }
});

ExtrasRender.ComponentSync.RichTextArea.HyperlinkDialog = Core.extend(
        ExtrasRender.ComponentSync.RichTextArea.AbstractDialog, {

    $construct: function(richTextArea) {
        ExtrasRender.ComponentSync.RichTextArea.AbstractDialog.call(this, richTextArea,
                ExtrasRender.ComponentSync.RichTextArea.AbstractDialog.TYPE_OK_CANCEL,
                {
                    title: richTextArea.peer._msg["HyperlinkDialog.Title"], 
                    icon: richTextArea.peer._icons.hyperlink
                },
                new EchoApp.Column({
                    insets: 10,
                    children: [
                        new EchoApp.Label({
                            text: richTextArea.peer._msg["HyperlinkDialog.PromptURL"]
                        }),
                        this._urlField = new EchoApp.TextField({
                            width: "100%"
                        }),
                        new EchoApp.Label({
                            text: richTextArea.peer._msg["HyperlinkDialog.PromptDescription"]
                        }),
                        this._descriptionField = new EchoApp.TextField({
                            width: "100%"
                        })
                    ]
                }));
    },
    
    processOk: function(e) {
        var data = {
            url: this._urlField.get("text"),
            description: this._descriptionField.get("text")
        };
        if (!data.url) {
            this.parent.add(new ExtrasRender.ComponentSync.RichTextArea.MessageDialog(this._richTextArea, 
                    this._richTextArea.peer._msg["HyperlinkDialog.ErrorDialogTitle"], 
                    this._richTextArea.peer._msg["HyperlinkDialog.ErrorDialog.URL"]));
            return;
        }
        this.parent.remove(this);
        this.fireEvent({type: "insertHyperlink", source: this, data: data});
    }
});

ExtrasRender.ComponentSync.RichTextArea.ImageDialog = Core.extend(
        ExtrasRender.ComponentSync.RichTextArea.AbstractDialog, {

    $construct: function(richTextArea) {
        ExtrasRender.ComponentSync.RichTextArea.AbstractDialog.call(this, richTextArea,
                ExtrasRender.ComponentSync.RichTextArea.AbstractDialog.TYPE_OK_CANCEL,
                {
                    title: richTextArea.peer._msg["ImageDialog.Title"], 
                    image: richTextArea.peer._icons.image
                },
                new EchoApp.Column({
                    insets: 10,
                    children: [
                        new EchoApp.Label({
                            text: richTextArea.peer._msg["ImageDialog.PromptURL"]
                        }),
                        this._urlField = new EchoApp.TextField({
                            width: "100%"
                        })
                    ]
                }));
    },
    
    processOk: function(e) {
        var data = {
            url: this._urlField.get("text")
        };
        if (!data.url) {
            this.parent.add(new ExtrasRender.ComponentSync.RichTextArea.MessageDialog(this._richTextArea, 
                    this._richTextArea.peer._msg["ImageDialog.ErrorDialogTitle"], 
                    this._richTextArea.peer._msg["ImageDialog.ErrorDialog.URL"]));
            return;
        }
        this.parent.remove(this);
        this.fireEvent({type: "insertImage", source: this, data: data});
    }
});

ExtrasRender.ComponentSync.RichTextArea.InputComponent = Core.extend(EchoApp.Component, {

    $load: function() {
        EchoApp.ComponentFactory.registerType("ExtrasApp.RichTextInput", this);
    },
    
    componentType: "ExtrasApp.RichTextInput"
});

ExtrasRender.ComponentSync.RichTextArea.InputPeer = Core.extend(EchoRender.ComponentSync, {

    $load: function() {
        EchoRender.registerPeer("ExtrasApp.RichTextInput", this);
    },

    $construct: function() { },
    
    doCommand: function(command, value) {
        this._loadRange();
        this._iframeElement.contentWindow.document.execCommand(command, false, value);
        this._storeData();
    },
    
    _insertHtml: function(html) {
        if (WebCore.Environment.BROWSER_INTERNET_EXPLORER) {
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
        if (WebCore.Environment.BROWSER_INTERNET_EXPLORER) {
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
        WebCore.EventProcessor.removeAll(this._iframeElement.contentWindow.document);
        this._mainDivElement = null;
        this._iframeElement = null;
        this._contentDocumentRendered = false;
        this._selectionRange = null;
    },
    
    _renderContentDocument: function() {
        var text = this.component._richTextArea.get("text");
        
        var contentDocument = this._iframeElement.contentWindow.document;
        contentDocument.open();
        contentDocument.write("<html><body>" + (text == null ? "" : text) + "</body></html>");
        contentDocument.close();
        // workaround for Mozilla (not Firefox)
        var setDesignModeOn = function() {
            contentDocument.designMode = "on";
        };
        setTimeout(setDesignModeOn, 0);
        WebCore.EventProcessor.add(this._iframeElement.contentWindow.document, "keyup", 
                Core.method(this, this._processKeyUp), false);
        WebCore.EventProcessor.add(this._iframeElement.contentWindow.document, "mouseup", 
                Core.method(this, this._processMouseUp), false);
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
        this.component._richTextArea.set("text", html);
    },
    
    _storeRange: function() {
        if (WebCore.Environment.BROWSER_INTERNET_EXPLORER) {
            this._selectionRange = this._iframeElement.contentWindow.document.selection.createRange();
        }
    }
});

ExtrasRender.ComponentSync.RichTextArea.MessageDialog = Core.extend(
        ExtrasRender.ComponentSync.RichTextArea.AbstractDialog, {
    
    $construct: function(richTextArea, title, message) {
        ExtrasRender.ComponentSync.RichTextArea.AbstractDialog.call(this, richTextArea,
                ExtrasRender.ComponentSync.RichTextArea.AbstractDialog.TYPE_OK,
                {
                    title: title
                },
                new EchoApp.Label({
                    text: message,
                    layoutData: {
                        insets: 30 
                    }
                }));
    }
});

ExtrasRender.ComponentSync.RichTextArea.TableDialog = Core.extend(
        ExtrasRender.ComponentSync.RichTextArea.AbstractDialog, {

    $construct: function(richTextArea) {
        ExtrasRender.ComponentSync.RichTextArea.AbstractDialog.call(this, richTextArea,
                ExtrasRender.ComponentSync.RichTextArea.AbstractDialog.TYPE_OK_CANCEL,
                {
                    title: richTextArea.peer._msg["TableDialog.Title"], 
                    icon: richTextArea.peer._icons.table
                },
                new EchoApp.Grid({
                    insets: 10,
                    children: [
                        new EchoApp.Label({
                            text: richTextArea.peer._msg["TableDialog.PromptRows"],
                            layoutData: {
                                alignment: "trailing"
                            }
                        }),
                        this._rowsField = new EchoApp.TextField({
                            text: "2",
                            width: 100   
                        }),
                        new EchoApp.Label({
                            text: richTextArea.peer._msg["TableDialog.PromptColumns"],
                            layoutData: {
                                alignment: "trailing"
                            }
                        }),
                        this._columnsField = new EchoApp.TextField({
                            text: "3",
                            width: 100
                        })
                    ]
                }));
    },
    
    processOk: function(e) {
        var data = {
            rows: parseInt(this._rowsField.get("text")),
            columns: parseInt(this._columnsField.get("text"))
        };
        if (isNaN(data.rows) || data.rows < 1 || data.rows > 50) {
            this.parent.add(new ExtrasRender.ComponentSync.RichTextArea.MessageDialog(this._richTextArea, 
                    this._richTextArea.peer._msg["TableDialog.ErrorDialogTitle"], 
                    this._richTextArea.peer._msg["TableDialog.ErrorDialog.Rows"]));
            return;
        }
        if (isNaN(data.columns) || data.columns < 1 || data.columns > 50) {
            this.parent.add(new ExtrasRender.ComponentSync.RichTextArea.MessageDialog(this._richTextArea, 
                    this._richTextArea.peer._msg["TableDialog.ErrorDialogTitle"], 
                    this._richTextArea.peer._msg["TableDialog.ErrorDialog.Columns"]));
            return;
        }
        this.parent.remove(this);
        this.fireEvent({type: "tableInsert", source: this, data: data});
    }
});
