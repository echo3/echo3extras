/**
 * Component rendering peer: RichTextArea
 */
Extras.Sync.RichTextArea = Core.extend(Echo.Arc.ComponentSync, {

    $static: {
    
        defaultFeatures: {
            menu: true, toolbar: true, undo: true, clipboard: true, alignment: true, foreground: true, background: true,
            list: true, table: true, image: true, horizontalRule: true, hyperlink: true, subscript: true, 
            bold: true, italic: true, underline: true, strikethrough: true, paragraphStyle: true, indent: true
        },

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
    
    _processDialogCloseRef: null,
    _processComponentInsertHtmlRef: null,

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
        },
        
        /**
         * Event handler for user request (from menu/toolbar) to insert a hyperlink.
         */
        processInsertHyperlink: function(e) {
            var hyperlinkDialog = new Extras.Sync.RichTextArea.HyperlinkDialog(this.component);
            hyperlinkDialog.addListener("insertHyperlink", Core.method(this, function(e) {
                this._richTextInput.peer._insertHtml("<a href=\"" + e.data.url + "\">"
                        + (e.data.description ? e.data.description : e.data.url) + "</a>");
                this.focusDocument();
            }));
            this._openDialog(hyperlinkDialog);
        },
        
        /**
         * Event handler for user request (from menu/toolbar) to insert an image.
         */
        processInsertImage: function(e) {
            var imageDialog = new Extras.Sync.RichTextArea.ImageDialog(this.component);
            imageDialog.addListener("insertImage", Core.method(this, function(e) {
                this._richTextInput.peer._insertHtml("<img src=\"" + e.data.url + "\">");
                this.focusDocument();
            }));
            this._openDialog(imageDialog);
        },

        /**
         * Event handler for user request (from menu/toolbar) to insert a table.
         */
        processInsertTable: function(e) {
            var tableDialog = new Extras.Sync.RichTextArea.TableDialog(this.component);
            tableDialog.addListener("tableInsert", Core.method(this, function(e) {
                this.insertTable(e.data.columns, e.data.rows);
                this.focusDocument();
            }));
            this._openDialog(tableDialog);
        },

        /**
         * Event handler for user request (from menu/toolbar) to set the background color.
         */
        processSetBackground: function(e) {
            var colorDialog = new Extras.Sync.RichTextArea.ColorDialog(this.component, true);
            colorDialog.addListener("colorSelect", Core.method(this, function(e) {
                if (Core.Web.Env.BROWSER_INTERNET_EXPLORER) {
                    Core.Web.Scheduler.run(Core.method(this, function() {
                        this.execCommand("backcolor", e.data);
                    }));
                } else {
                    this.execCommand("hilitecolor", e.data);
                }
                this.focusDocument();
            }));
            this._openDialog(colorDialog);
        },
        
        /**
         * Event handler for user request (from menu/toolbar) to set the foreground color.
         */
        processSetForeground: function(e) {
            var colorDialog = new Extras.Sync.RichTextArea.ColorDialog(this.component, false);
            colorDialog.addListener("colorSelect", Core.method(this, function(e) {
                this.execCommand("forecolor", e.data);
                this.focusDocument();
            }));
            this._openDialog(colorDialog);
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
    
    _trimHeight: null,
    
    _reinitRunnable: null,
    
    $construct: function() {
        this._processComponentInsertHtmlRef = Core.method(this, this._processComponentInsertHtml);
        this._processDialogCloseRef = Core.method(this, this._processDialogClose);
        
        if (Core.Web.Env.BROWSER_MOZILLA) {
            this._reinitRunnable = new Core.Web.Scheduler.MethodRunnable( 
                    Core.method(this, function() {
                        if (this._richTextInput && this._richTextInput.peer) {
                            this._richTextInput.peer._reinitListeners();    
                        }
                    }), 3000, true);
        }
    },
    
    _addComponentListeners: function() {
        this.component.addListener("insertHtml", this._processComponentInsertHtmlRef);
    },

    createComponent: function() {
        var borderSize = Echo.Sync.Border.getPixelSize(this.component.render("border", Extras.RichTextArea.DEFAULT_BORDER), "top")
                + Echo.Sync.Border.getPixelSize(this.component.render("border", Extras.RichTextArea.DEFAULT_BORDER), "bottom");
        this._trimHeight = borderSize;
    
        var features = this.component.render("features", Extras.Sync.RichTextArea.defaultFeatures);

        var contentPane = new Echo.ContentPane();
        var cursor = contentPane;

        if (features.menu) {
            var menuSplitPane = new Echo.SplitPane({
                orientation: Echo.SplitPane.ORIENTATION_VERTICAL_TOP_BOTTOM,
                children: [
                    this._createMenu()
                ]
            });
            cursor.add(menuSplitPane);
            cursor = menuSplitPane;
        }
        
        if (features.toolbar) {
            var toolbarContainer = new Echo.Column({
                layoutData: {
                    overflow: Echo.SplitPane.OVERFLOW_HIDDEN
                },
                children: [
                    this._createToolbar()
                ]
            })
            cursor.add(toolbarContainer);
            cursor = toolbarContainer;
        }
        
        this._richTextInput = new Extras.Sync.RichTextArea.InputComponent()
        this._richTextInput._richTextArea = this.component;
        cursor.add(this._richTextInput);
        
        return contentPane;
    },
    
    /**
     * Returns default icon set map object.
     * @type object
     */
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
    
    /**
     * Creates the model for the menu bar based on enable feature set.
     *
     * @return the menu model
     * @type Extras.MenuModel
     */
    _createMainMenuBarModel: function() {
        var features = this.component.render("features", Extras.Sync.RichTextArea.defaultFeatures);
        var menu = new Extras.MenuModel(null, null, null);
        
        if (features.undo || features.clipboard) {
            var editMenu = new Extras.MenuModel(null, this._msg["Menu.Edit"], null);
            if (features.undo) {
                editMenu.addItem(new Extras.OptionModel("/undo", this._msg["Menu.Undo"], this._icons.undo));
                editMenu.addItem(new Extras.OptionModel("/redo", this._msg["Menu.Redo"], this._icons.redo));
            }
            if (features.undo && features.clipboard) {
                editMenu.addItem(new Extras.SeparatorModel());
            }
            if (features.clipboard) {
                editMenu.addItem(new Extras.OptionModel("cut", this._msg["Menu.Cut"], this._icons.cut));
                editMenu.addItem(new Extras.OptionModel("copy", this._msg["Menu.Copy"], this._icons.copy));
                editMenu.addItem(new Extras.OptionModel("paste", this._msg["Menu.Paste"], this._icons.paste));
                editMenu.addItem(new Extras.OptionModel("delete", this._msg["Menu.Delete"], this._icons["delete"]));
                editMenu.addItem(new Extras.SeparatorModel());
                editMenu.addItem(new Extras.OptionModel("/selectall", this._msg["Menu.SelectAll"], this._icons.selectAll));
            }
            menu.addItem(editMenu);
        }
        
        if (features.list || features.horizontalRule || features.image || features.hyperlink || features.table) {
            var insertMenu = new Extras.MenuModel(null, this._msg["Menu.Insert"], null);
            if (features.list) {
                insertMenu.addItem(new Extras.OptionModel("/insertunorderedlist", this._msg["Menu.BulletedList"],
                        this._icons.bulletedList));
                insertMenu.addItem(new Extras.OptionModel("/insertorderedlist", this._msg["Menu.NumberedList"],
                        this._icons.numberedList));
            }
            insertMenu.addItem(new Extras.SeparatorModel);
            if (features.horizontalRule) {
                insertMenu.addItem(new Extras.OptionModel("/inserthorizontalrule", this._msg["Menu.InsertHorizontalRule"],
                        this._icons.horizontalRule));
            }
            if (features.image) {
                insertMenu.addItem(new Extras.OptionModel("insertimage", this._msg["Menu.InsertImage"], this._icons.image));
            }
            if (features.hyperlink) {
                insertMenu.addItem(new Extras.OptionModel("inserthyperlink", this._msg["Menu.InsertHyperlink"],
                        this._icons.hyperlink));
            }
            insertMenu.addItem(new Extras.SeparatorModel);
            if (features.table) {
                insertMenu.addItem(new Extras.OptionModel("inserttable", this._msg["Menu.InsertTable"], this._icons.table));
            }
            menu.addItem(insertMenu);
        }
        
        if (features.bold || features.italic || features.underline || features.strikeThrough 
                || features.subscript || features.paragraphStyle || features.alignment || features.indent 
                || features.foreground || features.background) {
            var formatMenu =  new Extras.MenuModel(null, this._msg["Menu.Format"], null);
            if (features.bold || features.italic || features.underline || features.strikeThrough 
                    || features.subscript) {
            }
            if (features.paragraphStyle) {
                formatMenu.addItem(new Extras.MenuModel(null, this._msg["Menu.ParagraphStyle"], this._icons.paragraphStyle, [
                    new Extras.OptionModel("/formatblock/<p>", this._msg["Menu.Normal"], this._icons.styleNormal),
                    new Extras.OptionModel("/formatblock/<pre>", this._msg["Menu.Preformatted"], this._icons.stylePreformatted),
                    new Extras.OptionModel("/formatblock/<h1>", this._msg["Menu.Heading1"], this._icons.styleH1),
                    new Extras.OptionModel("/formatblock/<h2>", this._msg["Menu.Heading2"], this._icons.styleH2),
                    new Extras.OptionModel("/formatblock/<h3>", this._msg["Menu.Heading3"], this._icons.styleH3),
                    new Extras.OptionModel("/formatblock/<h4>", this._msg["Menu.Heading4"], this._icons.styleH4),
                    new Extras.OptionModel("/formatblock/<h5>", this._msg["Menu.Heading5"], this._icons.styleH5),
                    new Extras.OptionModel("/formatblock/<h6>", this._msg["Menu.Heading6"], this._icons.styleH6)
                ]));
            }
            if (features.bold || features.italic || freatures.underline || features.strikeThrough || features.subscript) {
                var textMenu = new Extras.MenuModel(null, this._msg["Menu.TextStyle"], this._icons.textStyle);
                textMenu.addItem(new Extras.OptionModel("/removeformat",  this._msg["Menu.PlainText"], this._icons.plainText));
                textMenu.addItem(new Extras.SeparatorModel());
                if (features.bold) {
                    textMenu.addItem(new Extras.OptionModel("/bold",  this._msg["Menu.Bold"], this._icons.bold));
                }
                if (features.italic) {
                    textMenu.addItem(new Extras.OptionModel("/italic",  this._msg["Menu.Italic"], this._icons.italic));
                }
                if (features.underline) {
                    textMenu.addItem(new Extras.OptionModel("/underline",  this._msg["Menu.Underline"], this._icons.underline));
                }
                if (features.strikethrough) {
                    textMenu.addItem(new Extras.OptionModel("/strikethrough",  this._msg["Menu.Strikethrough"],
                            this._icons.strikethrough));
                }
                textMenu.addItem(new Extras.SeparatorModel());
                if (features.subscript) {
                    textMenu.addItem(new Extras.OptionModel("/superscript", this._msg["Menu.Superscript"], 
                            this._icons.superscript));
                    textMenu.addItem(new Extras.OptionModel("/subscript", this._msg["Menu.Subscript"], this._icons.subscript));
                }
                formatMenu.addItem(textMenu);
            }
            if (features.alignment) {
                formatMenu.addItem(new Extras.MenuModel(null, this._msg["Menu.Alignment"], this._icons.alignment, [
                    new Extras.OptionModel("/justifyleft",  this._msg["Menu.Left"], this._icons.alignmentLeft),
                    new Extras.OptionModel("/justifycenter",  this._msg["Menu.Center"], this._icons.alignmentCenter),
                    new Extras.OptionModel("/justifyright",  this._msg["Menu.Right"], this._icons.alignmentRight),
                    new Extras.OptionModel("/justifyfull",  this._msg["Menu.Justified"], this._icons.alignmentJustify)
                ]));
            }
            formatMenu.addItem(new Extras.SeparatorModel());
            if (features.indent) {
                formatMenu.addItem(new Extras.OptionModel("/indent",  this._msg["Menu.Indent"], this._icons.indent));
                formatMenu.addItem(new Extras.OptionModel("/outdent",  this._msg["Menu.Outdent"], this._icons.outdent));
            }
            formatMenu.addItem(new Extras.SeparatorModel());
            if (features.foreground || features.background) {
                if (features.foreground) {
                    formatMenu.addItem(new Extras.OptionModel("foreground",  this._msg["Menu.SetForeground"], 
                            this._icons.foreground));
                }
                if (features.background) {
                    formatMenu.addItem(new Extras.OptionModel("background",  this._msg["Menu.SetBackground"], 
                            this._icons.background));
                }
            }
            menu.addItem(formatMenu);
        }
        
        return menu;
    },
    
    /**
     * Creates main menu bar component.
     *
     * @return the main menu bar
     * @type Extras.MenuBarPane
     */
    _createMenu: function() {
        this._trimHeight += 26;
        return new Extras.MenuBarPane({
            styleName: this.component.render("menuStyleName"),
            layoutData: {
                minimumSize: 26,
                overflow: Echo.SplitPane.OVERFLOW_HIDDEN
            },
            model: this._createMainMenuBarModel(),
            events: {
                action: Core.method(this, this._processMenuAction)
            }
        });
    },
    
    /**
     * Creates tool bar component.
     * 
     * @return the toolbar
     * @type Echo.Component
     */
    _createToolbar: function() {
        this._trimHeight += 24;
        var features = this.component.render("features", Extras.Sync.RichTextArea.defaultFeatures);

        var controlsRow = new Echo.Row({
            styleName: this.component.render("toolbarRowStyleName"),
            cellSpacing: 10,
            insets: 2
        });

        // Undo/Redo Tools
        if (features.undo) {
            controlsRow.add(new Echo.Row({
                children: [
                    this._createToolbarButton("<<<", this._icons.undo, this._msg["Menu.Undo"], this._processCommand, "undo"),
                    this._createToolbarButton(">>>", this._icons.redo, this._msg["Menu.Redo"], this._processCommand, "redo")
                ]
            }));
        }
        
        // Font Bold/Italic/Underline Tools
        if (features.bold || features.italic || features.underline) {
            var row = new Echo.Row();
            if (features.bold) {
                row.add(this._createToolbarButton("B", this._icons.bold, this._msg["Menu.Bold"], this._processCommand, "bold"));
            }
            if (features.italic) {
                row.add(this._createToolbarButton("I", this._icons.italic, this._msg["Menu.Italic"], 
                        this._processCommand, "italic"));
            }
            if (features.underline) {
                row.add(this._createToolbarButton("U", this._icons.underline, this._msg["Menu.Underline"], 
                        this._processCommand, "underline"));
            }
            controlsRow.add(row);
        }
        
        //Super/Subscript Tools
        if (features.subscript) {
            controlsRow.add(new Echo.Row({
                children: [
                    this._createToolbarButton("^", this._icons.superscript, this._msg["Menu.Superscript"], 
                            this._processCommand, "superscript"),
                    this._createToolbarButton("v", this._icons.subscript,this._msg["Menu.Subscript"], 
                            this._processCommand, "subscript")
                ]
            }));
        }
        
        // Alignment Tools
        if (features.alignment) {
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
        }
        
        // Color Tools
        if (features.foreground || features.background) {
            var row = new Echo.Row();
            if (features.foreground) {
                row.add(this._createToolbarButton("FG", this._icons.foreground, this._msg["Menu.SetForeground"], 
                        this.processSetForeground));
            }
            if (features.background) {
                row.add(this._createToolbarButton("BG", this._icons.background, this._msg["Menu.SetBackground"], 
                        this.processSetBackground));
            }
            controlsRow.add(row);
        }
        
        // Insert Tools
        if (features.list || features.horizontalRule || features.image || features.hyperlink || features.table) {
            var row = new Echo.Row();
            if (features.list) {
                row.add(this._createToolbarButton("Bulleted List", this._icons.bulletedList, this._msg["Menu.BulletedList"], 
                        this._processCommand, "insertunorderedlist"));
                row.add(this._createToolbarButton("Numbered List", this._icons.numberedList, this._msg["Menu.NumberedList"], 
                        this._processCommand, "insertorderedlist"));
            }
            if (features.horizontalRule) {
                row.add(this._createToolbarButton("Horizontal Rule", this._icons.horizontalRule,
                        this._msg["Menu.InsertHorizontalRule"],  this._processCommand, "inserthorizontalrule"));
            }
            if (features.image) {
                row.add(this._createToolbarButton("Image", this._icons.image, this._msg["Menu.InsertImage"], 
                        this.processInsertImage));
            }
            if (features.hyperlink) {
                row.add(this._createToolbarButton("Hyperlink", this._icons.hyperlink, this._msg["Menu.InsertHyperlink"], 
                        this.processInsertHyperlink));
            }
            if (features.table) {
                row.add(this._createToolbarButton("Table", this._icons.table, this._msg["Menu.InsertTable"], 
                        this.processInsertTable));
            }
            controlsRow.add(row);
        }
        
        return controlsRow;
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
    
    execCommand: function(commandName, value) {
        this._richTextInput.peer.execCommand(commandName, value);
    },
    
    focusDocument: function() {
        this._richTextInput.peer.focusDocument();
    },
    
    getDomainElement: function() { 
        return this._mainDivElement;
    },
    
    insertHtml: function(html) {
        this._richTextInput.peer._insertHtml(html);
    },
    
    insertImage: function(url) {
        this.insertHtml("<img src=\"" + url + "\">");
    },
    
    insertTable: function(columns, rows) {
        var rowHtml = "";
        for (var i = 0; i < columns; ++i) {
            rowHtml += "<td></td>";
        }
        rowHtml = "<tr>" + rowHtml + "</tr>";
        var tableHtml = "<table width=\"100%\" border=\"1\" cellspacing=\"0\" cellpadding=\"1\"><tbody>";
        for (var i = 0; i < rows; ++i) {
            tableHtml += rowHtml;
        }
        tableHtml += "</tbody></table>";
        this.insertHtml(tableHtml);
    },
    
    _processCommand: function(e) {
        this.execCommand(e.actionCommand);
        this.focusDocument();
    },
    
    _openDialog: function(dialogWindow) {
        // Activate overlay pane (if required).
        var contentPane;
        if (this._overlayPane == null) {
            this._overlayPane = new Extras.Sync.RichTextArea.OverlayPane();
            contentPane = new Echo.ContentPane();
            this._overlayPane.add(contentPane);
            this.baseComponent.add(this._overlayPane);
        } else {
            contentPane = this._overlayPane.children[0];
        }
        
        // Add dialog to overlay pane.
        contentPane.add(dialogWindow);

        // Add parent-change listener to dialog so that overlay pane can be
        // deactivated when necessary.
        dialogWindow.addListener("parent", this._processDialogCloseRef);
    },
    
    _processComponentInsertHtml: function(e) {
        this._richTextInput.peer._insertHtml(e.html);
    },
    
    _processDialogClose: function(e) {
        if (e.newValue != null) {
            return;
        }
        
        // Deactivate overlay pane if it has no content.
        if (this._overlayPane.children[0].children.length == 0) {
            this.baseComponent.remove(this._overlayPane);
            this._overlayPane = null;
        }
        
        // Remove dialog parent-change listener.
        e.source.removeListener("parent", this._processDialogCloseRef);
    },
    
    _processMenuAction: function(e) {
        if (e.modelId.charAt(0) == '/') {
            var separatorIndex = e.modelId.indexOf("/", 1);
            if (separatorIndex == -1) {
                this._richTextInput.peer.execCommand(e.modelId.substring(1));
            } else {
                this._richTextInput.peer.execCommand(e.modelId.substring(1, separatorIndex),
                        e.modelId.substring(separatorIndex + 1));
            }
        } else {
            switch (e.modelId) {
            case "foreground":
                this.processSetForeground();
                break;
            case "background":
                this.processSetBackground();
                break;
            case "inserttable":
                this.processInsertTable();
                break;
            case "inserthyperlink":
                this.processInsertHyperlink();
                break;
            case "insertimage":
                this.processInsertImage();
                break;
            case "cut":
            case "copy":
            case "paste":
            case "delete":
                try {
                    this._richTextInput.peer.execCommand(e.modelId);
                } catch (ex) {
                    this._openDialog(new Extras.Sync.RichTextArea.MessageDialog(this.component,
                            this._msg["Generic.Error"], this._msg["Error.ClipboardAccessDisabled"])); 
                }
            }
        }
    },
    
    _removeComponentListeners: function() {
        this.component.removeListener("insertHtml", this._processComponentInsertHtmlRef);
    },
    
    renderAdd: function(update, parentElement) {
        this._addComponentListeners();
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
        
        if (this._reinitRunnable) {
            Core.Web.Scheduler.add(this._reinitRunnable);
        }
        
        parentElement.appendChild(this._mainDivElement);
    },
    
    renderDispose: function(update) {
        this._removeComponentListeners();
        if (this._reinitRunnable) {
            Core.Web.Scheduler.remove(this._reinitRunnable);
        }
        Echo.Arc.ComponentSync.prototype.renderDispose.call(this, update);
        this._mainDivElement = null;
    },
    
    renderDisplay: function() {
        Core.Web.VirtualPosition.redraw(this._mainDivElement);
        Echo.Arc.ComponentSync.prototype.renderDisplay.call(this);
    },
    
    renderUpdate: function(update) {
        if (update.isUpdatedPropertySetIn({text: true })) {
            this._richTextInput.peer._loadData();
            return;
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

Extras.Sync.RichTextArea.Html = {

    //FIXME Verify no illegal tags are present or correct.
    //FIXME Verify no unclosed tags are present or correct.
    //FIXME Verify no illegal characters are present or correct.
    //FIXME Provide option to only remove the one trailing BR we add by default.
    
    _P_BLOCK_FIND: /<p\b[^>]*>(.*?)<\/p>/ig,
    _P_STANDALONE_FIND: /<p\/?>/ig,
    _LEADING_WHITESPACE: /^(\s|<br\/?>|&nbsp;)+/i,
    _TRAILING_WHITESPACE: /(\s|<br\/?>|&nbsp;)+$/i,
    
    /**
     * Cleans HTML input/output.
     */
    clean: function(html) {
        html = html.replace(Extras.Sync.RichTextArea.Html._P_BLOCK_FIND, "$1<br/>");
        html = html.replace(Extras.Sync.RichTextArea.Html._P_STANDALONE_FIND, "<br/>");
        html = html.replace(Extras.Sync.RichTextArea.Html._LEADING_WHITESPACE, "");
        html = html.replace(Extras.Sync.RichTextArea.Html._TRAILING_WHITESPACE, "");
        return html;
    }
};

Extras.Sync.RichTextArea.ColorDialog = Core.extend(Extras.Sync.RichTextArea.AbstractDialog, {

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

Extras.Sync.RichTextArea.HyperlinkDialog = Core.extend(Extras.Sync.RichTextArea.AbstractDialog, {

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

Extras.Sync.RichTextArea.ImageDialog = Core.extend(Extras.Sync.RichTextArea.AbstractDialog, {

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

/**
 * Pane which renders its content over the body of the application.  
 * This component breaks out of the element-based component hierarchy.
 */
Extras.Sync.RichTextArea.OverlayPane = Core.extend(Echo.Component, {

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.RichTextOverlayPane", this);
    },
    
    componentType: "Extras.RichTextOverlayPane",
    floatingPane: true,
    pane: true
});

Extras.Sync.RichTextArea.OverlayPanePeer = Core.extend(Echo.Render.ComponentSync, {

    _div: null,

    $load: function() {
        Echo.Render.registerPeer("Extras.RichTextOverlayPane", this);
    },

    renderAdd: function(update, parentElement) {
        this._div = document.createElement("div");
        this._div.style.cssText = "position:absolute;top:0;right:0;bottom:0;left:0;z-index:32767";
        if (this.component.children.length == 1) {
            Echo.Render.renderComponentAdd(update, this.component.children[0], this._div);
        } else if (this.component.children.length > 1) {
            throw new Error("Too many children added to OverlayPane.");
        }
       
        document.body.appendChild(this._div);
    },
    
    renderDispose: function(update) {
        if (this._div && this._div.parentNode) {
            this._div.parentNode.removeChild(this._div);
        }
    },
    
    renderDisplay: function(update) {
        Core.Web.VirtualPosition.redraw(this._div);
    },
    
    renderUpdate: function(update) {
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, null);
        return false;
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
    
    componentType: "Extras.RichTextInput",
    focusable: true
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
    
    _fireAction: false,
    
    _renderedHtml: null,

    $construct: function() { },
    
    execCommand: function(commandName, value) {
        this._loadRange();
        this._iframeElement.contentWindow.document.execCommand(commandName, false, value);
        this._storeData();
    },
    
    focusDocument: function() {
        this.component.application.setFocusedComponent(this.component);
    },
    
    _insertHtml: function(html) {
        if (Core.Web.Env.BROWSER_INTERNET_EXPLORER) {
            if (!this._selectionRange) {
                this._selectionRange = this._iframeElement.contentWindow.document.body.createTextRange();
            }
            this._selectionRange.select();
            this._selectionRange.pasteHTML(html);
        } else {
            this.execCommand("inserthtml", html);
        }
    },
    
    _loadData: function() {
        var html = this.component._richTextArea.get("text");
        if (html == null) {
            // Mozilla and Opera has issues with cursor appearing in proper location when text area is devoid of content.
            html = (Core.Web.Env.BROWSER_MOZILLA || Core.Web.Env.BROWSER_OPERA) ? "<br/>" : "";
        }
        if (html == this._renderedHtml) {
            // No update necessary.
            return;
        }

        var contentDocument = this._iframeElement.contentWindow.document;
        contentDocument.body.innerHTML = html;
        this._renderedHtml = html;
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

        if (e.keyCode == 13) {
            // Fire event in new execution context. 
            Core.Web.Scheduler.run(Core.method(this, function() {
                this._fireAction = true;
            }));
        }
    },
    
    _processKeyUp: function(e) {
        if (!this.client.verifyInput(this.component)) {
            Core.Web.DOM.preventEventDefault(e);
            return;
        }
    
        this._storeData();
        this._storeRange();
        
        if (this._fireAction) {
            this._fireAction = false;
            this.component._richTextArea.doAction();
        }
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
    
    _reinitListeners: function() {
        Core.Web.Event.removeAll(this._iframeElement.contentWindow.document);
        Core.Web.Event.add(this._iframeElement.contentWindow.document, "keypress", 
                Core.method(this, this._processKeyPress), false);
        Core.Web.Event.add(this._iframeElement.contentWindow.document, "keyup", 
                Core.method(this, this._processKeyUp), false);
        Core.Web.Event.add(this._iframeElement.contentWindow.document, "mousedown", 
                Core.method(this, this._processMouseDown), false);
        Core.Web.Event.add(this._iframeElement.contentWindow.document, "mouseup", 
                Core.method(this, this._processMouseUp), false);
    },
    
    renderAdd: function(update, parentElement) {
        // Create IFRAME container DIV element.
        this._mainDivElement = document.createElement("div");
        Echo.Sync.Border.render(this.component._richTextArea.render("border", Extras.RichTextArea.DEFAULT_BORDER),
                this._mainDivElement);
        
        // Create IFRAME element.
        this._iframeElement = document.createElement("iframe");
        this._iframeElement.style.width = this.width ? this.width : "100%";

        this._paneRender = this.component._richTextArea.peer._paneRender;
        if (!this._paneRender) {
            this._iframeElement.style.height = this.height ? this.height : "200px";
        }

        this._iframeElement.style.border = "0px none";
        this._iframeElement.frameBorder = "0";
    
        this._mainDivElement.appendChild(this._iframeElement);
    
        parentElement.appendChild(this._mainDivElement);
    },
    
    _renderContentDocument: function() {
        // Ensure element is on-screen before rendering content/enabling design mode.
        var element = this._iframeElement;
        while (element != document.body) {
            if (element == null) {
                // Not added to parent.
                return;
            }
            if (element.style.display == "none") {
                // Not rendered.
                return;
            }
            element = element.parentNode;
        }
        
        var text = this.component._richTextArea.get("text");
        
        var contentDocument = this._iframeElement.contentWindow.document;
        
        var bodyStyleAttribute = "height:100%;width:100%;margin:0px;padding:0px;";
        
        var foreground = this.component._richTextArea.render("foreground");
        if (foreground) {
            bodyStyleAttribute += "color:" + foreground + ";"
        }

        var background = this.component._richTextArea.render("background");
        if (background) {
            bodyStyleAttribute += "background-color:" + background + ";"
        }

        var backgroundImage = this.component._richTextArea.render("backgroundImage");
        if (backgroundImage) {
            bodyStyleAttribute += "background-attachment: fixed;";
            bodyStyleAttribute += "background-image:url(" + Echo.Sync.FillImage.getUrl(backgroundImage) + ");";
            var backgroundRepeat = Echo.Sync.FillImage.getRepeat(backgroundImage);
            if (backgroundRepeat) {
                bodyStyleAttribute += "background-repeat:" + backgroundRepeat + ";";
            }
            var backgroundPosition = Echo.Sync.FillImage.getPosition(backgroundImage);
            if (backgroundPosition) {
                bodyStyleAttribute += "background-position:" + backgroundPosition + ";";
            }
        }
        
        contentDocument.open();
        contentDocument.write("<html><body tabindex=\"0\" width=\"100%\" height=\"100%\""
                + (bodyStyleAttribute ? (" style=\"" + bodyStyleAttribute + "\"") : "")
                + ">" + (text == null ? "" : text) + "</body></html>");
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
            var trimHeight = this.component._richTextArea.peer._trimHeight;
            var calculatedHeight = (bounds.height < trimHeight + 100 ? 100 : bounds.height - trimHeight) + "px";
            if (this._iframeElement.style.height != calculatedHeight) {
                this._iframeElement.style.height = calculatedHeight; 
            }
        }
    },

    renderFocus: function() {
        Core.Web.DOM.focusElement(this._iframeElement.contentWindow);
    },
    
    renderUpdate: function(update) {
        // Not invoked.
    },
    
    _storeData: function() {
        var contentDocument = this._iframeElement.contentWindow.document;
        var html = contentDocument.body.innerHTML;
        var cleanHtml = Extras.Sync.RichTextArea.Html.clean(html);
        this._renderedHtml = cleanHtml;
        this.component._richTextArea.set("text", cleanHtml);
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
