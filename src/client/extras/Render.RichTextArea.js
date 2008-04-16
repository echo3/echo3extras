/**
 * Component rendering peer: RichTextArea
 */
Extras.Sync.RichTextArea = Core.extend(EchoArc.ComponentSync, {

    $static: {
        resource: new Core.ResourceBundle({
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
        Echo.Render.registerPeer("Extras.RichTextArea", this);
    },

    $virtual: {
        getIcons: function() {
            var icons = this._getDefaultIcons();
            var customIcons = this.component.get("icons");
            if (customIcons) {
                for (var x in customIcons) {
                    icons[x] = customIcons[x];
                }
            }
            return icons;
        }
    },
    
    /**
     * Localized messages for rendered locale.
     */
    _msg: null,
    
    /**
     * {Boolean} Flag indicating whether the parent component is a pane, and thus whether the RichTextArea should consume
     * horizontal and vertical space.
     */
    _paneRender: false,

    createComponent: function() {
        var controlsRow;
        
        var contentPane = new Echo.ContentPane({
            children: [
                // Menu SplitPane
                new Echo.SplitPane({
                    orientation: Echo.SplitPane.ORIENTATION_VERTICAL_TOP_BOTTOM,
                    separatorPosition: 26,
                    children: [
                        // Menu Bar
                        new Extras.MenuBarPane({
                            styleName: this.component.render("menuStyleName"),
                            layoutData: {
                                overflow: Echo.SplitPane.OVERFLOW_HIDDEN
                            },
                            model: this._createMainMenuBarModel(),
                            events: {
                                action: Core.method(this, this._processMenuAction)
                            }
                        }),
                        // Main Layout Container
                        new Echo.Column({
                            layoutData: {
                                overflow: Echo.SplitPane.OVERFLOW_HIDDEN
                            },
                            children: [
                                // Controls Row (control groups added later)
                                controlsRow = new Echo.Row({
                                    styleName: this.component.render("toolbarRowStyleName"),
                                    cellSpacing: 10,
                                    insets: 2
                                }),
                                // Text Input Field
                                this._richTextInput = new Extras.Sync.RichTextArea.InputComponent()
                            ]
                        })
                    ]
                })
            ]
        });
        
        // Undo/Redo Tools
        controlsRow.add(new Echo.Row({
            children: [
                this._createToolbarButton("<<<", this._icons.undo, this._msg["Menu.Undo"], this._processCommand, "undo"),
                this._createToolbarButton(">>>", this._icons.redo, this._msg["Menu.Redo"], this._processCommand, "redo")
            ]
        }));
        
        // Font Bold/Italic/Underline Tools
        controlsRow.add(new Echo.Row({
            children: [
                this._createToolbarButton("B", this._icons.bold, this._msg["Menu.Bold"], this._processCommand, "bold"),
                this._createToolbarButton("I", this._icons.italic, this._msg["Menu.Italic"], this._processCommand, "italic"),
                this._createToolbarButton("U", this._icons.underline, this._msg["Menu.Underline"], 
                        this._processCommand, "underline")
            ]
        }));
        
        //Super/Subscript Tools
        controlsRow.add(new Echo.Row({
            children: [
                this._createToolbarButton("^", this._icons.superscript, this._msg["Menu.Superscript"], 
                        this._processCommand, "superscript"),
                this._createToolbarButton("v", this._icons.subscript,this._msg["Menu.Subscript"], 
                        this._processCommand, "subscript")
            ]
        }));
        
        // Alignment Tools
        controlsRow.add(new Echo.Row({
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
        controlsRow.add(new Echo.Row({
            children: [
                this._createToolbarButton("FG", this._icons.foreground, this._msg["Menu.SetForeground"], 
                        this._processSetForegroundDialog),
                this._createToolbarButton("BG", this._icons.background, this._msg["Menu.SetBackground"], 
                        this._processSetBackgroundDialog)
            ]
        }));
        
        // Insert Tools
        controlsRow.add(new Echo.Row({
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
    
    _getDefaultIcons: function() {
        return { 
            alignmentCenter: this.client.getResourceUrl("Extras", "image/richtext/AlignCenter.gif"),
            alignmentJustify: this.client.getResourceUrl("Extras", "image/richtext/AlignJustify.gif"),
            alignmentLeft: this.client.getResourceUrl("Extras", "image/richtext/AlignLeft.gif"),
            alignmentRight: this.client.getResourceUrl("Extras", "image/richtext/AlignRight.gif"),
            background: this.client.getResourceUrl("Extras", "image/richtext/Background.gif"),
            bold: this.client.getResourceUrl("Extras", "image/richtext/Bold.gif"),
            bulletedList: this.client.getResourceUrl("Extras", "image/richtext/BulletedList.gif"),
            cancel: this.client.getResourceUrl("Extras", "image/richtext/Cancel.gif"),
            copy: this.client.getResourceUrl("Extras", "image/richtext/Copy.gif"),
            cut: this.client.getResourceUrl("Extras", "image/richtext/Cut.gif"),
            foreground: this.client.getResourceUrl("Extras", "image/richtext/Foreground.gif"),
            horizontalRule: this.client.getResourceUrl("Extras", "image/richtext/HorizontalRule.gif"),
            hyperlink: this.client.getResourceUrl("Extras", "image/richtext/Hyperlink.gif"),
            image: this.client.getResourceUrl("Extras", "image/richtext/Image.gif"),
            indent: this.client.getResourceUrl("Extras", "image/richtext/Indent.gif"),
            italic: this.client.getResourceUrl("Extras", "image/richtext/Italic.gif"),
            numberedList: this.client.getResourceUrl("Extras", "image/richtext/NumberedList.gif"),
            ok: this.client.getResourceUrl("Extras", "image/richtext/Ok.gif"),
            outdent: this.client.getResourceUrl("Extras", "image/richtext/Outdent.gif"),
            paste: this.client.getResourceUrl("Extras", "image/richtext/Paste.gif"),
            redo: this.client.getResourceUrl("Extras", "image/richtext/Redo.gif"),
            subscript: this.client.getResourceUrl("Extras", "image/richtext/Subscript.gif"),
            superscript: this.client.getResourceUrl("Extras", "image/richtext/Superscript.gif"),
            table: this.client.getResourceUrl("Extras", "image/richtext/Table.gif"),
            underline: this.client.getResourceUrl("Extras", "image/richtext/Underline.gif"),
            undo: this.client.getResourceUrl("Extras", "image/richtext/Undo.gif")
        };
    },
    
    _createMainMenuBarModel: function() {
        return new Extras.MenuModel(null, null, null, [
            new Extras.MenuModel(null, this._msg["Menu.Edit"], null, [
                new Extras.OptionModel("/undo", this._msg["Menu.Undo"], this._icons.undo),
                new Extras.OptionModel("/redo", this._msg["Menu.Redo"], this._icons.redo),
                new Extras.SeparatorModel(),
                new Extras.OptionModel("cut", this._msg["Menu.Cut"], this._icons.cut),
                new Extras.OptionModel("copy", this._msg["Menu.Copy"], this._icons.copy),
                new Extras.OptionModel("paste", this._msg["Menu.Paste"], this._icons.paste),
                new Extras.OptionModel("delete", this._msg["Menu.Delete"], this._icons["delete"]),
                new Extras.SeparatorModel(),
                new Extras.OptionModel("/selectall", this._msg["Menu.SelectAll"], this._icons.selectAll)
            ]),
            new Extras.MenuModel(null, this._msg["Menu.Insert"], null, [
                new Extras.OptionModel("/insertunorderedlist", this._msg["Menu.BulletedList"], this._icons.bulletedList),
                new Extras.OptionModel("/insertorderedlist", this._msg["Menu.NumberedList"], this._icons.numberedList),
                new Extras.SeparatorModel(),
                new Extras.OptionModel("/inserthorizontalrule", this._msg["Menu.InsertHorizontalRule"],
                        this._icons.horizontalRule),
                new Extras.OptionModel("insertimage", this._msg["Menu.InsertImage"], this._icons.image),
                new Extras.OptionModel("inserthyperlink", this._msg["Menu.InsertHyperlink"], this._icons.hyperlink),
                new Extras.SeparatorModel(),
                new Extras.OptionModel("inserttable", this._msg["Menu.InsertTable"], this._icons.table)
            ]),
            new Extras.MenuModel(null, this._msg["Menu.Format"], null, [
                new Extras.MenuModel(null, this._msg["Menu.TextStyle"], this._icons.textStyle, [
                    new Extras.OptionModel("/removeformat",  this._msg["Menu.PlainText"], this._icons.plainText),
                    new Extras.SeparatorModel(),
                    new Extras.OptionModel("/bold",  this._msg["Menu.Bold"], this._icons.bold),
                    new Extras.OptionModel("/italic",  this._msg["Menu.Italic"], this._icons.italic),
                    new Extras.OptionModel("/underline",  this._msg["Menu.Underline"], this._icons.underline),
                    new Extras.OptionModel("/strikethrough",  this._msg["Menu.Strikethrough"], this._icons.strikethrough),
                    new Extras.SeparatorModel(),
                    new Extras.OptionModel("/superscript", this._msg["Menu.Superscript"], this._icons.superscript),
                    new Extras.OptionModel("/subscript", this._msg["Menu.Subscript"], this._icons.subscript)
                ]),
                new Extras.MenuModel(null, this._msg["Menu.ParagraphStyle"], this._icons.paragraphStyle, [
                    new Extras.OptionModel("/formatblock/<p>", this._msg["Menu.Normal"], this._icons.styleNormal),
                    new Extras.OptionModel("/formatblock/<pre>", this._msg["Menu.Preformatted"], this._icons.stylePreformatted),
                    new Extras.OptionModel("/formatblock/<h1>", this._msg["Menu.Heading1"], this._icons.styleH1),
                    new Extras.OptionModel("/formatblock/<h2>", this._msg["Menu.Heading2"], this._icons.styleH2),
                    new Extras.OptionModel("/formatblock/<h3>", this._msg["Menu.Heading3"], this._icons.styleH3),
                    new Extras.OptionModel("/formatblock/<h4>", this._msg["Menu.Heading4"], this._icons.styleH4),
                    new Extras.OptionModel("/formatblock/<h5>", this._msg["Menu.Heading5"], this._icons.styleH5),
                    new Extras.OptionModel("/formatblock/<h6>", this._msg["Menu.Heading6"], this._icons.styleH6)
                ]),
                new Extras.MenuModel(null, this._msg["Menu.Alignment"], this._icons.alignment, [
                    new Extras.OptionModel("/justifyleft",  this._msg["Menu.Left"], this._icons.alignmentLeft),
                    new Extras.OptionModel("/justifycenter",  this._msg["Menu.Center"], this._icons.alignmentCenter),
                    new Extras.OptionModel("/justifyright",  this._msg["Menu.Right"], this._icons.alignmentRight),
                    new Extras.OptionModel("/justifyfull",  this._msg["Menu.Justified"], this._icons.alignmentJustify)
                ]),
                new Extras.SeparatorModel(),
                new Extras.OptionModel("/indent",  this._msg["Menu.Indent"], this._icons.indent),
                new Extras.OptionModel("/outdent",  this._msg["Menu.Outdent"], this._icons.outdent),
                new Extras.SeparatorModel(),
                new Extras.OptionModel("foreground",  this._msg["Menu.SetForeground"], this._icons.foreground),
                new Extras.OptionModel("background",  this._msg["Menu.SetBackground"], this._icons.background)
            ])
        ]);
    },
    
    _createToolbarButton: function(text, icon, toolTipText, eventMethod, actionCommand) {
        var button = new Echo.Button({
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
        this._richTextInput.peer.doCommand(e.actionCommand);
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
                    this.baseComponent.add(new Extras.Sync.RichTextArea.MessageDialog(this.component,
                            this._msg["Generic.Error"], this._msg["Error.ClipboardAccessDisabled"])); 
                }
            }
        }
    },
    
    /**
     * Event handler for color selection events from background ColorDialog.
     */
    _processSetBackground: function(e) {
        if (Core.Web.Env.BROWSER_INTERNET_EXPLORER) {
            this._richTextInput.peer.doCommand("backcolor", e.data);
        } else {
            this._richTextInput.peer.doCommand("hilitecolor", e.data);
        }
    },
    
    /**
     * Event handler for user request (from menu/toolbar) to set background color.
     */
    _processSetBackgroundDialog: function(e) {
        var colorDialog = new Extras.Sync.RichTextArea.ColorDialog(this.component, true);
        colorDialog.addListener("colorSelect", Core.method(this, this._processSetBackground));
        this.baseComponent.add(colorDialog);
    },
    
    /**
     * Event handler for color selection events from foreground ColorDialog.
     */
    _processSetForeground: function(e) {
        this._richTextInput.peer.doCommand("forecolor", e.data);
    },
    
    /**
     * Event handler for user request (from menu/toolbar) to set foreground color.
     */
    _processSetForegroundDialog: function(e) {
        var colorDialog = new Extras.Sync.RichTextArea.ColorDialog(this.component, false);
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
        var tableDialog = new Extras.Sync.RichTextArea.TableDialog(this.component);
        tableDialog.addListener("tableInsert", Core.method(this, this._processInsertTable));
        this.baseComponent.add(tableDialog);
    },
    
    _processInsertHyperlink: function(e) {
        this._richTextInput.peer._insertHtml("<a href=\"" + e.data.url + "\">"
                + (e.data.description ? e.data.description : e.data.url) + "</a>");
    },
    
    _processInsertHyperlinkDialog: function(e) {
        var hyperlinkDialog = new Extras.Sync.RichTextArea.HyperlinkDialog(this.component);
        hyperlinkDialog.addListener("insertHyperlink", Core.method(this, this._processInsertHyperlink));
        this.baseComponent.add(hyperlinkDialog);
    },
    
    _processInsertImage: function(e) {
        this._richTextInput.peer._insertHtml("<img src=\"" + e.data.url + "\">");
    },
    
    _processInsertImageDialog: function(e) {
        var imageDialog = new Extras.Sync.RichTextArea.ImageDialog(this.component);
        imageDialog.addListener("insertImage", Core.method(this, this._processInsertImage));
        this.baseComponent.add(imageDialog);
    },
    
    renderAdd: function(update, parentElement) {
        this._msg = Extras.Sync.RichTextArea.resource.get(this.component.getRenderLocale());

        this._icons = this.getIcons();
        if (!this._icons) {
            this._icons = {};
        }
        
        this._paneRender = this.component.parent.pane;
        
        this._mainDivElement = document.createElement("div");

        if (this._paneRender) {
            this._mainDivElement.style.cssText = "position:absolute;top:0px;left:0px;right:0px;bottom:0px;";
        } else {
            this._mainDivElement.style.position = "relative";
            // FIXME. set height of component based on height setting.
            this._mainDivElement.style.height = "300px";
        }
        
        parentElement.appendChild(this._mainDivElement);
    },
    
    renderDispose: function(update) {
        EchoArc.ComponentSync.prototype.renderDispose.call(this, update);
        this._mainDivElement = null;
    },
    
    renderDisplay: function() {
        Core.Web.VirtualPosition.redraw(this._mainDivElement);
        EchoArc.ComponentSync.prototype.renderDisplay.call(this);
    },
    
    renderUpdate: function(update) {
        if (update.isUpdatedPropertySetIn({text: true })) {
            if (update.getUpdatedProperty("text").newValue == this._richTextInput.peer._renderedHtml) {
                return;
            }
        }
    
        var element = this._mainDivElement;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
    }
});

Extras.Sync.RichTextArea.AbstractDialog = Core.extend(Echo.WindowPane, {

    $static: {
        TYPE_OK: 0,
        TYPE_OK_CANCEL: 1
    },

    $construct: function(richTextArea, type, properties, content) {
        this._richTextArea = richTextArea;
    
        var controlPaneSplitPaneStyleName = richTextArea.render("controlPaneSplitPaneStyleName");
        var controlPaneRowStyleName = richTextArea.render("controlPaneRowStyleName");
        var controlPaneButtonStyleName = richTextArea.render("controlPaneButtonStyleName"); 
        
        Echo.WindowPane.call(this, {
            styleName: richTextArea.render("windowPaneStyleName"),
            iconInsets: "6px 10px",
            width: 280,
            height: 200,
            resizable: false,
            events: {
                close: Core.method(this, this.processCancel)
            },
            children: [
                new Echo.SplitPane({
                    styleName: controlPaneSplitPaneStyleName,
                    style: controlPaneSplitPaneStyleName ? null : Extras.Sync.DEFAULT_CONTROL_PANE_SPLIT_PANE_STYLE,
                    children: [
                        this.controlsRow = new Echo.Row({
                            styleName: controlPaneRowStyleName,
                            style: controlPaneRowStyleName ? null : Extras.Sync.DEFAULT_CONTROL_PANE_ROW_STYLE
                        }),
                        content
                    ]
                })
            ]
        });
        
        this.controlsRow.add(new Echo.Button({
            styleName: controlPaneButtonStyleName,
            style: controlPaneButtonStyleName ? null : Extras.Sync.DEFAULT_CONTROL_PANE_BUTTON_STYLE,
            text: richTextArea.peer._msg["Generic.Ok"],
            icon: richTextArea.peer._icons.ok,
            events: {
                action: Core.method(this, this.processOk)
            }
        }));
        
        if (type == Extras.Sync.RichTextArea.AbstractDialog.TYPE_OK_CANCEL) {
            this.controlsRow.add(new Echo.Button({
                styleName: controlPaneButtonStyleName,
                style: controlPaneButtonStyleName ? null : Extras.Sync.DEFAULT_CONTROL_PANE_BUTTON_STYLE,
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

Extras.Sync.RichTextArea.ColorDialog = Core.extend(
        Extras.Sync.RichTextArea.AbstractDialog, {

    $construct: function(richTextArea, setBackground) {
        Extras.Sync.RichTextArea.AbstractDialog.call(this, richTextArea,
                Extras.Sync.RichTextArea.AbstractDialog.TYPE_OK_CANCEL, 
                {
                    title: richTextArea.peer._msg[setBackground ? 
                            "ColorDialog.Title.Background" : "ColorDialog.Title.Foreground"],
                    icon: setBackground ? richTextArea.peer._icons.background : richTextArea.peer._icons.foreground,
                    width: 280,
                    height: 320
                },
                new Echo.Column({
                    insets: 10,
                    children: [
                        new Echo.Label({
                            text: richTextArea.peer._msg[
                                    setBackground ? "ColorDialog.PromptBackground" : "ColorDialog.PromptForeground"]
                        }),
                        this._colorSelect = new Extras.ColorSelect({
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

Extras.Sync.RichTextArea.HyperlinkDialog = Core.extend(
        Extras.Sync.RichTextArea.AbstractDialog, {

    $construct: function(richTextArea) {
        Extras.Sync.RichTextArea.AbstractDialog.call(this, richTextArea,
                Extras.Sync.RichTextArea.AbstractDialog.TYPE_OK_CANCEL,
                {
                    title: richTextArea.peer._msg["HyperlinkDialog.Title"], 
                    icon: richTextArea.peer._icons.hyperlink
                },
                new Echo.Column({
                    insets: 10,
                    children: [
                        new Echo.Label({
                            text: richTextArea.peer._msg["HyperlinkDialog.PromptURL"]
                        }),
                        this._urlField = new Echo.TextField({
                            width: "100%"
                        }),
                        new Echo.Label({
                            text: richTextArea.peer._msg["HyperlinkDialog.PromptDescription"]
                        }),
                        this._descriptionField = new Echo.TextField({
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
            this.parent.add(new Extras.Sync.RichTextArea.MessageDialog(this._richTextArea, 
                    this._richTextArea.peer._msg["HyperlinkDialog.ErrorDialogTitle"], 
                    this._richTextArea.peer._msg["HyperlinkDialog.ErrorDialog.URL"]));
            return;
        }
        this.parent.remove(this);
        this.fireEvent({type: "insertHyperlink", source: this, data: data});
    }
});

Extras.Sync.RichTextArea.ImageDialog = Core.extend(
        Extras.Sync.RichTextArea.AbstractDialog, {

    $construct: function(richTextArea) {
        Extras.Sync.RichTextArea.AbstractDialog.call(this, richTextArea,
                Extras.Sync.RichTextArea.AbstractDialog.TYPE_OK_CANCEL,
                {
                    title: richTextArea.peer._msg["ImageDialog.Title"], 
                    image: richTextArea.peer._icons.image
                },
                new Echo.Column({
                    insets: 10,
                    children: [
                        new Echo.Label({
                            text: richTextArea.peer._msg["ImageDialog.PromptURL"]
                        }),
                        this._urlField = new Echo.TextField({
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
            this.parent.add(new Extras.Sync.RichTextArea.MessageDialog(this._richTextArea, 
                    this._richTextArea.peer._msg["ImageDialog.ErrorDialogTitle"], 
                    this._richTextArea.peer._msg["ImageDialog.ErrorDialog.URL"]));
            return;
        }
        this.parent.remove(this);
        this.fireEvent({type: "insertImage", source: this, data: data});
    }
});

Extras.Sync.RichTextArea.InputComponent = Core.extend(Echo.Component, {

    /**
     * The containing RichTextArea component.
     */
    _richTextArea: null,

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.RichTextInput", this);
    },
    
    componentType: "Extras.RichTextInput"
});

Extras.Sync.RichTextArea.InputPeer = Core.extend(Echo.Render.ComponentSync, {

    $load: function() {
        Echo.Render.registerPeer("Extras.RichTextInput", this);
    },

    /**
     * {Boolean} Flag indicating whether the parent component of the associated RichTextArea is a pane, 
     * and thus whether the RichTextArea's input region should consume available vertical space.
     */
    _paneRender: false,
    
    //FIXME.  Calculate (rather than hardcode) trimHeight value.
    /**
     * Height of trim for RichTextArea, i.e., menu bar, toolbars, etc.
     */
    _trimHeight: 60,
    
    _renderedHtml: null,

    $construct: function() { },
    
    doCommand: function(command, value) {
        this._loadRange();
        this._iframeElement.contentWindow.document.execCommand(command, false, value);
        this._storeData();
    },
    
    _insertHtml: function(html) {
        if (Core.Web.Env.BROWSER_INTERNET_EXPLORER) {
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
        if (Core.Web.Env.BROWSER_INTERNET_EXPLORER) {
            if (this._selectionRange) {
                this._selectionRange.select();
            }
        }
    },
    
    _processKeyPress: function(e) {
        if (!this.client.verifyInput(this.component)) {
            Core.Web.DOM.preventEventDefault(e);
            return;
        }
    },
    
    _processKeyUp: function(e) {
        if (!this.client.verifyInput(this.component)) {
            Core.Web.DOM.preventEventDefault(e);
            return;
        }
    
        this._storeData();
        this._storeRange();
    },
    
    _processMouseDown: function(e) {
        if (!this.client.verifyInput(this.component)) {
            Core.Web.DOM.preventEventDefault(e);
            return;
        }
    },

    _processMouseUp: function(e) {
        if (!this.client.verifyInput(this.component)) {
            Core.Web.DOM.preventEventDefault(e);
            return;
        }

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
        
        this._paneRender = this.component._richTextArea.peer._paneRender;
        
        if (this._paneRender) {
        //FIXME testing hack
            this._iframeElement.style.height = "400px";
        } else {
            this._iframeElement.style.height = this.height ? this.height : "200px";
        }
        this._iframeElement.style.border = "0px none";
        this._iframeElement.frameBorder = "0";
    
        this._mainDivElement.appendChild(this._iframeElement);
    
        parentElement.appendChild(this._mainDivElement);
    },
    
    _renderContentDocument: function() {
        var text = this.component._richTextArea.get("text");
        
        var contentDocument = this._iframeElement.contentWindow.document;
        contentDocument.open();
        contentDocument.write("<html><body>" + (text == null ? "" : text) + "</body></html>");
        contentDocument.close();
        if (Core.Web.Env.BROWSER_MOZILLA && !Core.Web.Env.BROWSER_FIREFOX) {
            // workaround for Mozilla (not Firefox)
            var setDesignModeOn = function() {
                contentDocument.designMode = "on";
            };
            setTimeout(setDesignModeOn, 0);
        } else {
            contentDocument.designMode = "on";
        }
        Core.Web.Event.add(this._iframeElement.contentWindow.document, "keypress", 
                Core.method(this, this._processKeyPress), false);
        Core.Web.Event.add(this._iframeElement.contentWindow.document, "keyup", 
                Core.method(this, this._processKeyUp), false);
        Core.Web.Event.add(this._iframeElement.contentWindow.document, "mousedown", 
                Core.method(this, this._processMouseDown), false);
        Core.Web.Event.add(this._iframeElement.contentWindow.document, "mouseup", 
                Core.method(this, this._processMouseUp), false);
        this._contentDocumentRendered = true;
    },
    
    renderDispose: function(update) {
        Core.Web.Event.removeAll(this._iframeElement.contentWindow.document);
        this._mainDivElement = null;
        this._iframeElement = null;
        this._contentDocumentRendered = false;
        this._selectionRange = null;
    },
    
    renderDisplay: function() {
        if (!this._contentDocumentRendered) {
            this._renderContentDocument();
        }
        
        var rtaMainDivElement = this.component._richTextArea.peer._mainDivElement;
        var bounds = new Core.Web.Measure.Bounds(rtaMainDivElement.parentNode);
        
        if (bounds.height) {
            var calculatedHeight = (bounds.height < this._trimHeight + 100 ? 100 : bounds.height - this._trimHeight) + "px";
            if (this._iframeElement.style.height != calculatedHeight) {
                this._iframeElement.style.height = calculatedHeight; 
            }
        }
    },
    
    renderUpdate: function(update) {
        // Not invoked.
    },
    
    _storeData: function() {
        var contentDocument = this._iframeElement.contentWindow.document;
        var html = contentDocument.body.innerHTML;
        this._renderedHtml = html;
        this.component._richTextArea.set("text", html);
    },
    
    _storeRange: function() {
        if (Core.Web.Env.BROWSER_INTERNET_EXPLORER) {
            this._selectionRange = this._iframeElement.contentWindow.document.selection.createRange();
        }
    }
});

Extras.Sync.RichTextArea.MessageDialog = Core.extend(
        Extras.Sync.RichTextArea.AbstractDialog, {
    
    $construct: function(richTextArea, title, message) {
        Extras.Sync.RichTextArea.AbstractDialog.call(this, richTextArea,
                Extras.Sync.RichTextArea.AbstractDialog.TYPE_OK,
                {
                    title: title
                },
                new Echo.Label({
                    text: message,
                    layoutData: {
                        insets: 30 
                    }
                }));
    }
});

Extras.Sync.RichTextArea.TableDialog = Core.extend(
        Extras.Sync.RichTextArea.AbstractDialog, {

    $construct: function(richTextArea) {
        Extras.Sync.RichTextArea.AbstractDialog.call(this, richTextArea,
                Extras.Sync.RichTextArea.AbstractDialog.TYPE_OK_CANCEL,
                {
                    title: richTextArea.peer._msg["TableDialog.Title"], 
                    icon: richTextArea.peer._icons.table
                },
                new Echo.Grid({
                    insets: 10,
                    children: [
                        new Echo.Label({
                            text: richTextArea.peer._msg["TableDialog.PromptRows"],
                            layoutData: {
                                alignment: "trailing"
                            }
                        }),
                        this._rowsField = new Echo.TextField({
                            text: "2",
                            width: 100   
                        }),
                        new Echo.Label({
                            text: richTextArea.peer._msg["TableDialog.PromptColumns"],
                            layoutData: {
                                alignment: "trailing"
                            }
                        }),
                        this._columnsField = new Echo.TextField({
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
            this.parent.add(new Extras.Sync.RichTextArea.MessageDialog(this._richTextArea, 
                    this._richTextArea.peer._msg["TableDialog.ErrorDialogTitle"], 
                    this._richTextArea.peer._msg["TableDialog.ErrorDialog.Rows"]));
            return;
        }
        if (isNaN(data.columns) || data.columns < 1 || data.columns > 50) {
            this.parent.add(new Extras.Sync.RichTextArea.MessageDialog(this._richTextArea, 
                    this._richTextArea.peer._msg["TableDialog.ErrorDialogTitle"], 
                    this._richTextArea.peer._msg["TableDialog.ErrorDialog.Columns"]));
            return;
        }
        this.parent.remove(this);
        this.fireEvent({type: "tableInsert", source: this, data: data});
    }
});
