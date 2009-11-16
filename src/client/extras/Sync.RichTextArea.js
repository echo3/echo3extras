/**
 * Component rendering peer: RichTextArea
 */
Extras.Sync.RichTextArea = Core.extend(Echo.Arc.ComponentSync, {
    
    $static: {

        /**
         * Default rendering values used when component does not specify a property value.
         */
        DEFAULTS: {
    
            /**
             * Default style object applied to control panes.
             */
            controlPaneStyle: {
                separatorColor: "#dfdfef",
                separatorHeight: 1,
                autoPositioned: true
            },
            
            /**
             * Default style object applied to control pane option button container rows.
             */
            controlPaneRowStyle: {
                insets: "2px 10px",
                cellSpacing: 3,
                layoutData: {
                    overflow: Echo.SplitPane.OVERFLOW_HIDDEN,
                    background: "#cfcfdf"
                }
            },
            
            /**
             * Default style object applied to control pane option buttons.
             */
            controlPaneButtonStyle: {
                insets: "0px 8px",
                lineWrap: false,
                foreground: "#000000",
                rolloverEnabled: true,
                rolloverForeground: "#6f0f0f"
            },
            
            /**
             * Default enabled feature set.
             */
            features: {
                menu: true, toolbar: true, undo: true, clipboard: true, alignment: true, foreground: true, background: true,
                list: true, table: true, image: true, horizontalRule: true, hyperlink: true, subscript: true, 
                bold: true, italic: true, underline: true, strikethrough: true, paragraphStyle: true, indent: true
            }
        },
        
        /**
         * Default localization strings.
         */
        resource: new Core.ResourceBundle({
            "ColorDialog.Title.Foreground":     "Text Color",
            "ColorDialog.Title.Background":     "Highlight Color",
            "ColorDialog.PromptForeground":     "Foreground:",
            "ColorDialog.PromptBackground":     "Background:",
            "Error.ClipboardAccessDisabled":    "This browser has clipboard access disabled. " + 
                                                "Use keyboard shortcuts or change your security settings.",
            "Generic.Cancel":                   "Cancel",
            "Generic.Error":                    "Error",
            "Generic.Ok":                       "Ok",
            "HyperlinkDialog.Title":            "Insert Hyperlink",
            "HyperlinkDialog.PromptURL":        "URL:",
            "HyperlinkDialog.PromptDescription":
                                                "Description Text:",
            "HyperlinkDialog.ErrorDialogTitle": "Cannot Insert Hyperlink",
            "HyperlinkDialog.ErrorDialog.URL":  "The URL entered is not valid.",
            "ImageDialog.Title":                "Insert Image",
            "ImageDialog.PromptURL":            "URL:",
            "ImageDialog.ErrorDialogTitle":     "Cannot Insert Image",
            "ImageDialog.ErrorDialog.URL":      "The URL entered is not valid.",
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
            "Menu.Table":                       "Table",
            "Menu.Table.New":                   "New Table...",
            "Menu.Table.DeleteRow":             "Delete Row",
            "Menu.Table.DeleteColumn":          "Delete Column",
            "Menu.Table.InsertRow":             "Insert Row",
            "Menu.Table.InsertColumn":          "Insert Column",
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
            "TableDialog.ErrorDialog.Columns":  "The entered columns value is not valid.  " +
                                                "Please specify a number between 1 and 50.",
            "TableDialog.ErrorDialog.Rows":     "The entered rows value is not valid.  Please specify a number between 1 and 50."
        })
    },
    
    /**
     * Method reference to _processDialogClose().
     * @type Function
     */
    _processDialogCloseRef: null,

    /**
     * Listener to receive execCommand events from component.
     * @type Function
     */
    _execCommandListener: null,

    $load: function() {
        Echo.Render.registerPeer("Extras.RichTextArea", this);
    },

    $virtual: {
    
        /**
         * Creates/returns the icon set for this RichTextArea.
         * 
         * @return the icon set (name to URL mapping) object
         */
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
         * 
         * @param e the event
         */
        processInsertHyperlink: function(e) {
            var hyperlinkDialog = new Extras.Sync.RichTextArea.HyperlinkDialog(this.component);
            hyperlinkDialog.addListener("insertHyperlink", Core.method(this, function(e) {
                this._richTextInput.insertHtml("<a href=\"" + e.data.url + "\">" +
                        (e.data.description ? e.data.description : e.data.url) + "</a>");
                this.focusDocument();
            }));
            this._openDialog(hyperlinkDialog);
        },
        
        /**
         * Event handler for user request (from menu/toolbar) to insert an image.
         * 
         * @param e the event
         */
        processInsertImage: function(e) {
            var imageDialog = new Extras.Sync.RichTextArea.ImageDialog(this.component);
            imageDialog.addListener("insertImage", Core.method(this, function(e) {
                this._richTextInput.insertHtml("<img src=\"" + e.data.url + "\">");
                this.focusDocument();
            }));
            this._openDialog(imageDialog);
        },

        /**
         * Event handler for user request (from menu/toolbar) to insert a table.
         * 
         * @param e the event
         */
        processInsertTable: function(e) {
            var tableDialog = new Extras.Sync.RichTextArea.TableDialog(this.component);
            tableDialog.addListener("insertTable", Core.method(this, function(e) {
                this.newTable(e.data.columns, e.data.rows);
                this.focusDocument();
            }));
            this._openDialog(tableDialog);
        },

        /**
         * Event handler for user request (from menu/toolbar) to set the background color.
         * 
         * @param e the event
         */
        processSetBackground: function(e) {
            var colorDialog = new Extras.Sync.RichTextArea.ColorDialog(this.component, true,
                    this._toolbarButtons.background.get("color"));
            colorDialog.addListener("colorSelect", Core.method(this, function(e) {
                this.execCommand("background", e.data);
                this._toolbarButtons.background.set("color", e.data);
                this.focusDocument();
            }));
            this._openDialog(colorDialog);
        },
        
        /**
         * Event handler for user request (from menu/toolbar) to set the foreground color.
         * 
         * @param e the event
         */
        processSetForeground: function(e) {
            var colorDialog = new Extras.Sync.RichTextArea.ColorDialog(this.component, false,
                    this._toolbarButtons.foreground.get("color"));
            colorDialog.addListener("colorSelect", Core.method(this, function(e) {
                this.execCommand("foreground", e.data);
                this._toolbarButtons.foreground.set("color", e.data);
                this.focusDocument();
            }));
            this._openDialog(colorDialog);
        }
    },
    
    /**
     * Localized messages for rendered locale.
     */
    msg: null,
    
    /**
     * Mapping between icon names and icon URLs.
     */
    icons: null,
    
    /**
     * {Boolean} Flag indicating whether the parent component is a pane, and thus whether the RichTextArea should consume
     * horizontal and vertical space.
     * @type Boolean
     */
    _paneRender: false,
    
    /**
     * Mapping between toolbar button action commands and toolbar buttons.
     */
    _toolbarButtons: null,
    
    /**
     * Style selection drop down.
     * @type Echo.SelectField
     */
    _styleSelect: null,
    
    /**
     * The rich text input component.
     * 
     * @type Extras.RichTextInput
     */
    _richTextInput: null,
    
    /**
     * Root rendered DIV element.
     */
    _mainDiv: null,
    
    /** Constructor. */
    $construct: function() {
        this._execCommandListener = Core.method(this, function(e) {
            this.execCommand(e.commandName, e.value);
        });
        this._processDialogCloseRef = Core.method(this, this._processDialogClose);
        this._toolbarButtons = { };
    },
    
    /**
     * Adds listeners to supported Extras.RichTextArea object.
     */
    _addComponentListeners: function() {
        this.component.addListener("execCommand", this._execCommandListener);
    },

    /** @see #Echo.Arc.ComponentSync#createComponent */
    createComponent: function() {
        var features = this.component.render("features", Extras.Sync.RichTextArea.DEFAULTS.features);

        var contentPane = new Echo.ContentPane();
        var cursor = contentPane;

        if (features.menu) {
            var menuSplitPane = new Echo.SplitPane({
                orientation: Echo.SplitPane.ORIENTATION_VERTICAL_TOP_BOTTOM,
                autoPositioned: true,
                children: [
                    this._createMenu()
                ]
            });
            cursor.add(menuSplitPane);
            cursor = menuSplitPane;
        }
        
        if (features.toolbar) {
            var toolbarContainer = new Echo.SplitPane({
                orientation: Echo.SplitPane.ORIENTATION_VERTICAL_TOP_BOTTOM,
                autoPositioned: true,
                children: [
                    this._createToolbar()
                ]
            });
            cursor.add(toolbarContainer);
            cursor = toolbarContainer;
        }
        
        this._richTextInput = new Extras.RichTextInput({
            layoutData: {
                overflow: Echo.SplitPane.OVERFLOW_HIDDEN
            },
            background: this.component.render("background"),
            backgroundImage: this.component.render("backgroundImage"),
            border: this.component.render("border"),
            foreground: this.component.render("foreground"),
            text: this.component.get("text"),
            events: {
                action: Core.method(this, function(e) {
                    this.component.doAction();
                }),
                cursorStyleChange: Core.method(this, this._processCursorStyleChange),
                property: Core.method(this, function(e) {
                    if (e.propertyName == "text") {
                        this._processTextUpdate(e);
                    }
                })
            }
        });
        cursor.add(this._richTextInput);
        
        return contentPane;
    },
    
    /**
     * Creates the model for the menu bar based on enable feature set.
     *
     * @return the menu model
     * @type Extras.MenuModel
     */
    _createMainMenuBarModel: function() {
        var features = this.component.render("features", Extras.Sync.RichTextArea.DEFAULTS.features);
        var menu = new Extras.MenuModel(null, null, null);
        
        if (features.undo || features.clipboard) {
            var editMenu = new Extras.MenuModel(null, this.msg["Menu.Edit"], null);
            if (features.undo) {
                editMenu.addItem(new Extras.OptionModel("/undo", this.msg["Menu.Undo"], this.icons.undo));
                editMenu.addItem(new Extras.OptionModel("/redo", this.msg["Menu.Redo"], this.icons.redo));
            }
            if (features.undo && features.clipboard) {
                editMenu.addItem(new Extras.SeparatorModel());
            }
            if (features.clipboard) {
                editMenu.addItem(new Extras.OptionModel("cut", this.msg["Menu.Cut"], this.icons.cut));
                editMenu.addItem(new Extras.OptionModel("copy", this.msg["Menu.Copy"], this.icons.copy));
                editMenu.addItem(new Extras.OptionModel("paste", this.msg["Menu.Paste"], this.icons.paste));
                editMenu.addItem(new Extras.OptionModel("delete", this.msg["Menu.Delete"], this.icons["delete"]));
                editMenu.addItem(new Extras.SeparatorModel());
                editMenu.addItem(new Extras.OptionModel("/selectall", this.msg["Menu.SelectAll"], this.icons.selectAll));
            }
            menu.addItem(editMenu);
        }
        
        if (features.list || features.horizontalRule || features.image || features.hyperlink) {
            var insertMenu = new Extras.MenuModel(null, this.msg["Menu.Insert"], null);
            if (features.list || features.unorderedList) {
                insertMenu.addItem(new Extras.OptionModel("/insertunorderedlist", this.msg["Menu.BulletedList"],
                        this.icons.bulletedList));
            }
            if (features.list || features.orderedList) {
                insertMenu.addItem(new Extras.OptionModel("/insertorderedlist", this.msg["Menu.NumberedList"],
                        this.icons.numberedList));
            }
            insertMenu.addItem(new Extras.SeparatorModel());
            if (features.horizontalRule) {
                insertMenu.addItem(new Extras.OptionModel("/inserthorizontalrule", this.msg["Menu.InsertHorizontalRule"],
                        this.icons.horizontalRule));
            }
            if (features.image) {
                insertMenu.addItem(new Extras.OptionModel("insertimage", this.msg["Menu.InsertImage"], this.icons.image));
            }
            if (features.hyperlink) {
                insertMenu.addItem(new Extras.OptionModel("inserthyperlink", this.msg["Menu.InsertHyperlink"],
                        this.icons.hyperlink));
            }
            menu.addItem(insertMenu);
        }
        
        if (features.bold || features.italic || features.underline || features.strikeThrough || 
                features.subscript || features.paragraphStyle || features.alignment || features.indent || 
                features.foreground || features.background) {
            var formatMenu =  new Extras.MenuModel(null, this.msg["Menu.Format"], null);
            if (features.bold || features.italic || features.underline || features.strikeThrough || 
                    features.subscript) {
            }
            if (features.paragraphStyle) {
                formatMenu.addItem(new Extras.MenuModel(null, this.msg["Menu.ParagraphStyle"], this.icons.paragraphStyle, [
                    new Extras.OptionModel("/formatblock/<p>", this.msg["Menu.Normal"], this.icons.styleNormal),
                    new Extras.OptionModel("/formatblock/<pre>", this.msg["Menu.Preformatted"], this.icons.stylePreformatted),
                    new Extras.OptionModel("/formatblock/<h1>", this.msg["Menu.Heading1"], this.icons.styleH1),
                    new Extras.OptionModel("/formatblock/<h2>", this.msg["Menu.Heading2"], this.icons.styleH2),
                    new Extras.OptionModel("/formatblock/<h3>", this.msg["Menu.Heading3"], this.icons.styleH3),
                    new Extras.OptionModel("/formatblock/<h4>", this.msg["Menu.Heading4"], this.icons.styleH4),
                    new Extras.OptionModel("/formatblock/<h5>", this.msg["Menu.Heading5"], this.icons.styleH5),
                    new Extras.OptionModel("/formatblock/<h6>", this.msg["Menu.Heading6"], this.icons.styleH6)
                ]));
            }
            if (features.bold || features.italic || features.underline || features.strikeThrough || features.subscript) {
                var textMenu = new Extras.MenuModel(null, this.msg["Menu.TextStyle"], this.icons.textStyle);
                textMenu.addItem(new Extras.OptionModel("/removeformat",  this.msg["Menu.PlainText"], this.icons.plainText));
                textMenu.addItem(new Extras.SeparatorModel());
                if (features.bold) {
                    textMenu.addItem(new Extras.OptionModel("/bold",  this.msg["Menu.Bold"], this.icons.bold));
                }
                if (features.italic) {
                    textMenu.addItem(new Extras.OptionModel("/italic",  this.msg["Menu.Italic"], this.icons.italic));
                }
                if (features.underline) {
                    textMenu.addItem(new Extras.OptionModel("/underline",  this.msg["Menu.Underline"], this.icons.underline));
                }
                if (features.strikethrough) {
                    textMenu.addItem(new Extras.OptionModel("/strikethrough",  this.msg["Menu.Strikethrough"],
                            this.icons.strikethrough));
                }
                textMenu.addItem(new Extras.SeparatorModel());
                if (features.subscript) {
                    textMenu.addItem(new Extras.OptionModel("/superscript", this.msg["Menu.Superscript"], 
                            this.icons.superscript));
                    textMenu.addItem(new Extras.OptionModel("/subscript", this.msg["Menu.Subscript"], this.icons.subscript));
                }
                formatMenu.addItem(textMenu);
            }
            if (features.alignment) {
                formatMenu.addItem(new Extras.MenuModel(null, this.msg["Menu.Alignment"], this.icons.alignment, [
                    new Extras.OptionModel("/justifyleft",  this.msg["Menu.Left"], this.icons.alignmentLeft),
                    new Extras.OptionModel("/justifycenter",  this.msg["Menu.Center"], this.icons.alignmentCenter),
                    new Extras.OptionModel("/justifyright",  this.msg["Menu.Right"], this.icons.alignmentRight),
                    new Extras.OptionModel("/justifyfull",  this.msg["Menu.Justified"], this.icons.alignmentJustify)
                ]));
            }
            formatMenu.addItem(new Extras.SeparatorModel());
            if (features.indent) {
                formatMenu.addItem(new Extras.OptionModel("/indent",  this.msg["Menu.Indent"], this.icons.indent));
                formatMenu.addItem(new Extras.OptionModel("/outdent",  this.msg["Menu.Outdent"], this.icons.outdent));
            }
            formatMenu.addItem(new Extras.SeparatorModel());
            if (features.foreground || features.background) {
                if (features.foreground) {
                    formatMenu.addItem(new Extras.OptionModel("foreground",  this.msg["Menu.SetForeground"], 
                            this.icons.foreground));
                }
                if (features.background) {
                    formatMenu.addItem(new Extras.OptionModel("background",  this.msg["Menu.SetBackground"], 
                            this.icons.background));
                }
            }
            menu.addItem(formatMenu);
        }

        if (features.table) {
            var tableMenu = new Extras.MenuModel(null, this.msg["Menu.Table"], null);
            tableMenu.addItem(new Extras.OptionModel("tableNew", this.msg["Menu.Table.New"], this.icons.table));
            tableMenu.addItem(new Extras.SeparatorModel());
            tableMenu.addItem(new Extras.OptionModel("/tableInsertRow", this.msg["Menu.Table.InsertRow"], 
                    this.icons.tableInsertRow));
            tableMenu.addItem(new Extras.OptionModel("/tableInsertColumn", this.msg["Menu.Table.InsertColumn"], 
                    this.icons.tableInsertColumn));
            tableMenu.addItem(new Extras.SeparatorModel());
            tableMenu.addItem(new Extras.OptionModel("/tableDeleteRow", this.msg["Menu.Table.DeleteRow"], 
                    this.icons.tableDeleteRow));
            tableMenu.addItem(new Extras.OptionModel("/tableDeleteColumn", this.msg["Menu.Table.DeleteColumn"], 
                    this.icons.tableDeleteColumn));
            
            menu.addItem(tableMenu);
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
        return new Extras.MenuBarPane({
            styleName: this.component.render("menuStyleName"),
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
        var row, button;
        var features = this.component.render("features", Extras.Sync.RichTextArea.DEFAULTS.features);
        var controlsRow;
        var panel = new Echo.Panel({
            styleName: this.component.render("toolbarPanelStyleName"),
            layoutData: {
                overflow: Echo.SplitPane.OVERFLOW_HIDDEN
            },
            insets: 2,
            children: [
                controlsRow = new Echo.Row({
                    styleName: this.component.render("toolbarRowStyleName"),
                    cellSpacing: 10
                })
            ]
        });
        
        // Style Dropdown.
        if (features.paragraphStyle) {
            var actionListener = Core.method(this, function(e) {
                var style = this._styleSelect.get("selectedId");
                this._richTextInput.execCommand("formatblock", "<" + style + ">");
            });
            this._styleSelect = new Echo.SelectField({
                items: [
                    { id: "p", text: this.msg["Menu.Normal"] },
                    { id: "pre", text: this.msg["Menu.Preformatted"] },
                    { id: "h1", text: this.msg["Menu.Heading1"] },
                    { id: "h2", text: this.msg["Menu.Heading2"] },
                    { id: "h3", text: this.msg["Menu.Heading3"] },
                    { id: "h4", text: this.msg["Menu.Heading4"] },
                    { id: "h5", text: this.msg["Menu.Heading5"] },
                    { id: "h6", text: this.msg["Menu.Heading6"] }
                ],
                events: {
                    action: actionListener
                }
            });
            controlsRow.add(this._styleSelect);
        }

        // Undo/Redo Tools
        if (features.undo) {
            controlsRow.add(new Echo.Row({
                children: [
                    this._createToolbarButton("<<<", this.icons.undo, this.msg["Menu.Undo"], this._processCommand, "undo"),
                    this._createToolbarButton(">>>", this.icons.redo, this.msg["Menu.Redo"], this._processCommand, "redo")
                ]
            }));
        }
        
        // Font Bold/Italic/Underline Tools
        if (features.bold || features.italic || features.underline) {
            row = new Echo.Row();
            if (features.bold) {
                button = this._createToolbarButton("B", this.icons.bold, this.msg["Menu.Bold"], this._processCommand, "bold");
                button.set("toggle", true);
                row.add(button);
            }
            if (features.italic) {
                button = this._createToolbarButton("I", this.icons.italic, this.msg["Menu.Italic"], 
                        this._processCommand, "italic");
                button.set("toggle", true);
                row.add(button);
            }
            if (features.underline) {
                button = this._createToolbarButton("U", this.icons.underline, this.msg["Menu.Underline"], 
                        this._processCommand, "underline");
                button.set("toggle", true);
                row.add(button);
            }
            controlsRow.add(row);
        }
        
        //Super/Subscript Tools
        if (features.subscript) {
            controlsRow.add(new Echo.Row({
                children: [
                    this._createToolbarButton("^", this.icons.superscript, this.msg["Menu.Superscript"], 
                            this._processCommand, "superscript"),
                    this._createToolbarButton("v", this.icons.subscript,this.msg["Menu.Subscript"], 
                            this._processCommand, "subscript")
                ]
            }));
        }
        
        // Alignment Tools
        if (features.alignment) {
            controlsRow.add(new Echo.Row({
                children: [
                    this._createToolbarButton("<-", this.icons.alignmentLeft, this.msg["Menu.Left"], 
                            this._processCommand, "justifyleft"),
                    this._createToolbarButton("-|-", this.icons.alignmentCenter, this.msg["Menu.Center"], 
                            this._processCommand, "justifycenter"),
                    this._createToolbarButton("->", this.icons.alignmentRight, this.msg["Menu.Right"], 
                            this._processCommand, "justifyright"),
                    this._createToolbarButton("||", this.icons.alignmentJustify, this.msg["Menu.Justified"], 
                            this._processCommand, "justifyfull")
                ]
            }));
        }
        
        // Color Tools
        if (features.foreground || features.background) {
            row = new Echo.Row();
            if (features.foreground) {
                row.add(this._createToolbarButton("FG", this.icons.foreground, this.msg["Menu.SetForeground"], 
                        this.processSetForeground, "foreground"));
            }
            if (features.background) {
                row.add(this._createToolbarButton("BG", this.icons.background, this.msg["Menu.SetBackground"], 
                        this.processSetBackground, "background"));
            }
            controlsRow.add(row);
        }
        
        // Insert Tools
        if (features.list || features.horizontalRule || features.image || features.hyperlink || features.table) {
            row = new Echo.Row();
            if (features.list || features.unorderedList) {
                row.add(this._createToolbarButton("Bulleted List", this.icons.bulletedList, this.msg["Menu.BulletedList"], 
                        this._processCommand, "insertunorderedlist"));
            }
            if (features.list || features.orderedList) {
                row.add(this._createToolbarButton("Numbered List", this.icons.numberedList, this.msg["Menu.NumberedList"], 
                        this._processCommand, "insertorderedlist"));
            }
            if (features.horizontalRule) {
                row.add(this._createToolbarButton("Horizontal Rule", this.icons.horizontalRule,
                        this.msg["Menu.InsertHorizontalRule"],  this._processCommand, "inserthorizontalrule"));
            }
            if (features.image) {
                row.add(this._createToolbarButton("Image", this.icons.image, this.msg["Menu.InsertImage"], 
                        this.processInsertImage));
            }
            if (features.hyperlink) {
                row.add(this._createToolbarButton("Hyperlink", this.icons.hyperlink, this.msg["Menu.InsertHyperlink"], 
                        this.processInsertHyperlink));
            }
            if (features.table) {
                row.add(this._createToolbarButton("Table", this.icons.table, this.msg["Menu.NewTable"], 
                        this.processInsertTable));
            }
            controlsRow.add(row);
        }
        
        return panel;
    },
    
    /**
     * Creates a toolbar button.
     * 
     * @param {String} text the button text
     * @param {#ImageReference} icon the button icon
     * @param {String} toolTipText the rollover tool tip text
     * @param {Function} eventMethod the method to invoke when the button is clicked (must be a method of this object,
     *        will automatically be wrapped using Core.method()) 
     * @param {String} actionCommand the action command to send in fired events
     * @return the toolbar button
     * @type Extras.Sync.RichTextArea.ToolbarButton
     */
    _createToolbarButton: function(text, icon, toolTipText, eventMethod, actionCommand) {
        var button = new Extras.Sync.RichTextArea.ToolbarButton({
            actionCommand: actionCommand,
            styleName: this.component.render("toolbarButtonStyleName"),
            text: icon ? null : text,
            icon: icon,
            toolTipText: toolTipText
        });
        if (eventMethod) {
            button.addListener("action", Core.method(this, eventMethod));
        }
        this._toolbarButtons[actionCommand] = button;
        return button;
    },
    
    /**
     * Executes a rich-text editing command.  Delegates to RichTextInput peer.
     * 
     * @param {String} commandName the command name
     * @param {String} value the (optional) value to send
     */
    execCommand: function(commandName, value) {
        this._richTextInput.execCommand(commandName, value);
    },
    
    /**
     * Focuses the edited document.  Delegates to RichTextInput peer.
     */
    focusDocument: function() {
        this.arcApplication.setFocusedComponent(this._richTextInput);
    },
    
    /** @see Echo.Arc.ComponentSync#getDomainElement */
    getDomainElement: function() { 
        return this._mainDiv;
    },
    
    /**
     * Creates and returns a default icon name to URL map object.
     * @type Object
     */
    _getDefaultIcons: function() {
        var iconNames = {
            "16": [ "alignment", "alignmentCenter", "alignmentJustify", "alignmentLeft", "alignmentRight",
                "background", "bold", "bulletedList", "cancel", "copy", "cut", "delete", "foreground", "horizontalRule",
                "hyperlink", "image", "indent", "italic", "numberedList", "ok", "outdent", "paragraphStyle", "paste", "plainText", 
                "redo", "selectAll", "strikethrough", 
                "subscript", "superscript", "table", "tableInsertRow", "tableDeleteRow", "tableInsertColumn", "tableDeleteColumn",
                "textStyle", "underline", "undo" ],
            "24": [ "ok", "cancel" ]
        };
        var defaultIcons = { };
        for (var size in iconNames) {
            for (var i = 0; i < iconNames[size].length; ++i) {
                var iconResource = iconNames[size][i].charAt(0).toUpperCase() + iconNames[size][i].substring(1);
                defaultIcons[iconNames[size][i]] = this.client.getResourceUrl("Extras", 
                        "image/richtext/Icon" + size + iconResource + ".png");
            }
        }
        return defaultIcons;
    },
    
    /**
     * Inserts an image at the cursor position.
     * 
     * @param {String} url the image URL
     */
    insertImage: function(url) {
        this._richTextInput.insertHtml("<img src=\"" + url + "\">");
    },
    
    /**
     * Inserts an HTML table at the cursor position.
     * 
     * @param {Number} columns the number of columns
     * @param {Number} rows the number of rows
     */
    newTable: function(columns, rows) {
        var rowHtml = "",
            i,
            cellContent = Core.Web.Env.ENGINE_MSHTML ? "" : "<br/>";
        for (i = 0; i < columns; ++i) {
            rowHtml += "<td>" + cellContent + "</td>";
        }
        rowHtml = "<tr>" + rowHtml + "</tr>";
        var tableHtml = "<table width=\"100%\" border=\"1\" cellspacing=\"0\" cellpadding=\"1\"><tbody>";
        for (i = 0; i < rows; ++i) {
            tableHtml += rowHtml;
        }
        tableHtml += "</tbody></table>";
        this._richTextInput.insertHtml(tableHtml);
    },
    
    /**
     * Opens a dialog window.  The dialog is displayed in an OverlayPane which shows
     * the dialog over the application, rather than simply over the RichTextArea itself. 
     * 
     * @param {Echo.WindowPane} dialogWindow the dialog to open 
     */
    _openDialog: function(dialogWindow) {
        // Activate overlay pane (if required).
        var contentPane;
        if (this._overlayPane == null) {
            this._overlayPane = new Extras.Sync.RichTextArea.OverlayPane();
            this._overlayPane.rta = this.component;
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
    
    /**
     * Processes a simple editor command action.  The event's actionCommand is sent to the input peer as the editor command name.
     * This method is registered as a listener to various toolbar buttons.
     * 
     * @param e the event
     */
    _processCommand: function(e) {
        this.execCommand(e.actionCommand);
        this.focusDocument();
    },
    
    /**
     * Updates the status of various press-able toolbar buttons to indicate the state of the text at the cursor position
     * (e.g., bold/italic/underline, color, style selection).  
     */
    _processCursorStyleChange: function(e) {
        if (this._toolbarButtons.bold) {
            this._toolbarButtons.bold.set("pressed", e.style.bold);
        }
        if (this._toolbarButtons.italic) {
            this._toolbarButtons.italic.set("pressed", e.style.italic);
        }
        if (this._toolbarButtons.underline) {
            this._toolbarButtons.underline.set("pressed", e.style.underline);
        }
        if (this._toolbarButtons.foreground) {
            this._toolbarButtons.foreground.set("color", e.style.foreground || "#000000");
        }
        if (this._toolbarButtons.background) {
            this._toolbarButtons.background.set("color", e.style.background || "#ffffff");
        }
        if (this._styleSelect) {
            this._styleSelect.set("selectedId", e.style.paragraphStyle);
        }
    },
    
    /**
     * Processes a dialog closing (de-parenting) event.
     * Removes the OverlayPane.
     * 
     * @param e the event
     */
    _processDialogClose: function(e) {
        if (e.newValue != null) {
            return;
        }
        
        // Deactivate overlay pane if it has no content.
        if (this._overlayPane.children[0].children.length === 0) {
            this.baseComponent.remove(this._overlayPane);
            this._overlayPane = null;
        }
        
        // Remove dialog parent-change listener.
        e.source.removeListener("parent", this._processDialogCloseRef);
    },
    
    /**
     * Processes an action received from the menu bar.
     * 
     * @param e the event
     */
    _processMenuAction: function(e) {
        if (e.modelId.charAt(0) == '/') {
            var separatorIndex = e.modelId.indexOf("/", 1);
            if (separatorIndex == -1) {
                this._richTextInput.execCommand(e.modelId.substring(1));
            } else {
                this._richTextInput.execCommand(e.modelId.substring(1, separatorIndex),
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
            case "tableNew":
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
                    this._richTextInput.execCommand(e.modelId);
                } catch (ex) {
                    this._openDialog(new Extras.Sync.RichTextArea.MessageDialog(this.component,
                            this.msg["Generic.Error"], this.msg["Error.ClipboardAccessDisabled"])); 
                }
            }
        }
    },
    
    _processTextUpdate: function(e) {
        this.component.set("text", e.newValue);
    },
    
    /**
     * Removes listeners from supported Extras.RichTextArea object.
     */
    _removeComponentListeners: function() {
        this.component.removeListener("execCommand", this._execCommandListener);
    },
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this._addComponentListeners();
        this.msg = Extras.Sync.RichTextArea.resource.get(this.component.getRenderLocale());

        this.icons = this.getIcons();
        if (!this.icons) {
            this.icons = {};
        }
        
        this._paneRender = this.component.parent.pane;
        
        this._mainDiv = document.createElement("div");
        this._mainDiv.id = this.component.renderId;

        if (this._paneRender) {
            this._mainDiv.style.cssText = "position:absolute;top:0px;left:0px;right:0px;bottom:0px;";
        } else {
            this._mainDiv.style.position = "relative";
            // FIXME. set height of component based on height setting.
            this._mainDiv.style.height = "300px";
        }
        
        parentElement.appendChild(this._mainDiv);
    },
    
    /** @see Echo.Render.ComponentSync#renderDisplay */
    renderDisplay: function() {
        Core.Web.VirtualPosition.redraw(this._mainDiv);
        Echo.Arc.ComponentSync.prototype.renderDisplay.call(this);
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        this._removeComponentListeners();
        Echo.Arc.ComponentSync.prototype.renderDispose.call(this, update);
        this._mainDiv = null;
    },
    
    /** @see Echo.Render.ComponentSync#renderFocus */
    renderFocus: function() {
        this.arcApplication.setFocusedComponent(this._richTextInput);
    },
    
    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        if (update.isUpdatedPropertySetIn({text: true })) {
            if (this._richTextInput) {
                this._richTextInput.set("text", this.component.get("text"));
            }
            update.renderContext.displayRequired = [];
            return;
        }
    
        var element = this._mainDiv;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
    }
});

/**
 * Abstract dialog message box.  Displays arbitrary content and  provides the user "Ok" and/or "Cancel" options.
 */
Extras.Sync.RichTextArea.AbstractDialog = Core.extend(Echo.WindowPane, {

    $static: {

        /**
         * Type flag indicating only an "Ok" option should be made available.
         */
        TYPE_OK: 0,

        /**
         * Type flag indicating both "Ok" and "Cancel" options should be made available.
         */
        TYPE_OK_CANCEL: 1
    },
    
    $abstract: true,
    
    /**
     * The owning RichTextArea.
     * @type Extras.RichTextArea
     */
    rta: null,

    /**
     * Constructor.
     * 
     * @param {Extras.RichTextArea} rta the owning RichTextArea
     * @param {Number} type the dialog type, either <code>TYPE_OK</code> or <code>TYPE_OK_CANCEL</code>
     * @param properties initial properties to be set on the WindowPane
     * @param {Echo.Component} content the component to display within the dialog 
     */
    $construct: function(rta, type, properties, content) {
        this.rta = rta;
    
        var controlPaneSplitPaneStyleName = rta.render("controlPaneSplitPaneStyleName");
        var controlPaneRowStyleName = rta.render("controlPaneRowStyleName");
        var controlPaneButtonStyleName = rta.render("controlPaneButtonStyleName"); 
        
        // Build control.
        Echo.WindowPane.call(this, {
            styleName: rta.render("windowPaneStyleName"),
            contentWidth: "25em",
            modal: true,
            resizable: false,
            events: {
                close: Core.method(this, this.processCancel)
            },
            children: [
                new Echo.SplitPane({
                    orientation: Echo.SplitPane.ORIENTATION_VERTICAL_BOTTOM_TOP,
                    autoPositioned: true,
                    styleName: controlPaneSplitPaneStyleName,
                    style: controlPaneSplitPaneStyleName ? null : Extras.Sync.RichTextArea.DEFAULTS.controlPaneStyle,
                    children: [
                        this.controlsRow = new Echo.Row({
                            styleName: controlPaneRowStyleName,
                            style: controlPaneRowStyleName ? null : Extras.Sync.RichTextArea.DEFAULTS.controlPaneRowStyle
                        }),
                        content
                    ]
                })
            ]
        });
        
        // Add OK button.
        this.controlsRow.add(new Echo.Button({
            styleName: controlPaneButtonStyleName,
            style: controlPaneButtonStyleName ? null : Extras.Sync.RichTextArea.DEFAULTS.controlPaneButtonStyle,
            text: rta.peer.msg["Generic.Ok"],
            icon: rta.peer.icons.ok,
            events: {
                action: Core.method(this, this.processOk)
            }
        }));
        
        // Add Cancel button.
        if (type == Extras.Sync.RichTextArea.AbstractDialog.TYPE_OK_CANCEL) {
            this.controlsRow.add(new Echo.Button({
                styleName: controlPaneButtonStyleName,
                style: controlPaneButtonStyleName ? null : Extras.Sync.RichTextArea.DEFAULTS.controlPaneButtonStyle,
                text: rta.peer.msg["Generic.Cancel"],
                icon: rta.peer.icons.cancel,
                events: {
                    action: Core.method(this, this.processCancel)
                }
            }));
        }
        
        // Set properties.
        for (var x in properties) {
            this.set(x, properties[x]);
        }
    },
    
    $virtual: {
        
        /**
         * Processes a user selection of the "Cancel" button.
         * 
         * @param e the event
         */
        processCancel: function(e) {
            this.parent.remove(this);
        },
        
        /**
         * Processes a user selection of the "OK" button.
         * 
         * @param e the event
         */
        processOk: function(e) {
            this.parent.remove(this);
        }
    }
});

/**
 * Color selection dialog.
 */
Extras.Sync.RichTextArea.ColorDialog = Core.extend(Extras.Sync.RichTextArea.AbstractDialog, {

    $static: {
    
        /**
         * Default color swatch values.  
         * Sourced from Tango color palete: http://tango.freedesktop.org/Tango_Icon_Theme_Guidelines
         * @type Array
         */
        COLORS: [ 
                "#fce94f", "#edd400", "#c4a000",
                "#fcaf3e", "#f57900", "#e8b86e",
                "#e9b96e", "#c17d11", "#8f5902",
                "#8ae234", "#73d216", "#4e9a06",
                "#729fcf", "#3465a4", "#204a87",
                "#ad7fa8", "#75507b", "#5c3566",
                "#ef2929", "#cc0000", "#a40000",
                "#eeeeec", "#d3d7cf", "#babdb6",
                "#888a85", "#555753", "#2e3436",
                "#ffffff", "#7f7f7f", "#000000"
        ]
    },
    
    /**
     * Constructor.
     * 
     * @param {Extras.RichTextArea} rta the RichTextArea
     * @param {Boolean} setBackground flag indicating whether background (true) or foreground (false) is being set
     * @param {#Color} initialColor the initially selected color
     */
    $construct: function(rta, setBackground, initialColor) {
        Extras.Sync.RichTextArea.AbstractDialog.call(this, rta,
                Extras.Sync.RichTextArea.AbstractDialog.TYPE_OK_CANCEL, 
                {
                    title: rta.peer.msg[setBackground ? 
                            "ColorDialog.Title.Background" : "ColorDialog.Title.Foreground"],
                    icon: setBackground ? rta.peer.icons.background : rta.peer.icons.foreground,
                    contentWidth: "32em"
                },
                new Echo.Row({
                    cellSpacing: "1em",
                    insets: "1em",
                    children: [
                        new Echo.Column({
                            children: [
                                new Echo.Label({
                                    text: rta.peer.msg[
                                            setBackground ? "ColorDialog.PromptBackground" : "ColorDialog.PromptForeground"]
                                }),
                                this._colorSelect = new Extras.ColorSelect({
                                    color: initialColor,
                                    displayValue: true
                                })
                            ]
                        }),
                        new Echo.Grid({
                            insets: 2,
                            size: 3,
                            children: this._createSwatches()
                        })
                    ]
                }));
    },
    
    /**
     * Creates and returns an array of Echo.Button components which are used to select pre-set color values.
     * 
     * @return the color swatch buttons
     * @type Array
     */
    _createSwatches: function() {
        var children = [];
        var COLORS = Extras.Sync.RichTextArea.ColorDialog.COLORS;
        var actionListener = Core.method(this, function(e) {
            this._colorSelect.set("color", e.actionCommand);
        });
        for (var i = 0; i < COLORS.length; ++i) {
            children.push(new Echo.Button({
                height: "1em",
                width: "3em",
                background: COLORS[i],
                border: "1px outset " + COLORS[i],
                actionCommand: COLORS[i],
                events: {
                    action: actionListener
                }
            }));
        }
        return children;
    },
    
    /** @see Extras.Sync.RichTextArea.AbstractDialog#processOk */
    processOk: function(e) {
        var color = this._colorSelect.get("color");
        this.parent.remove(this);
        this.fireEvent({type: "colorSelect", source: this, data : color});
    }
});

/**
 * Add Hyperlink Dialog.
 */
Extras.Sync.RichTextArea.HyperlinkDialog = Core.extend(Extras.Sync.RichTextArea.AbstractDialog, {

    /**
     * Constructor.
     * 
     * @param {Extras.RichTextArea} rta the RichTextArea
     */
    $construct: function(rta) {
        Extras.Sync.RichTextArea.AbstractDialog.call(this, rta,
                Extras.Sync.RichTextArea.AbstractDialog.TYPE_OK_CANCEL,
                {
                    title: rta.peer.msg["HyperlinkDialog.Title"], 
                    icon: rta.peer.icons.hyperlink
                },
                new Echo.Column({
                    insets: 10,
                    children: [
                        new Echo.Label({
                            text: rta.peer.msg["HyperlinkDialog.PromptURL"]
                        }),
                        this._urlField = new Echo.TextField({
                            width: "100%"
                        }),
                        new Echo.Label({
                            text: rta.peer.msg["HyperlinkDialog.PromptDescription"]
                        }),
                        this._descriptionField = new Echo.TextField({
                            width: "100%"
                        })
                    ]
                }));
    },
    
    /** @see Extras.Sync.RichTextArea.AbstractDialog#processOk */
    processOk: function(e) {
        var data = {
            url: this._urlField.get("text"),
            description: this._descriptionField.get("text")
        };
        if (!data.url) {
            this.parent.add(new Extras.Sync.RichTextArea.MessageDialog(this.rta, 
                    this.rta.peer.msg["HyperlinkDialog.ErrorDialogTitle"], 
                    this.rta.peer.msg["HyperlinkDialog.ErrorDialog.URL"]));
            return;
        }
        this.parent.remove(this);
        this.fireEvent({type: "insertHyperlink", source: this, data: data});
    }
});

/**
 * Add Image Dialog.
 */
Extras.Sync.RichTextArea.ImageDialog = Core.extend(Extras.Sync.RichTextArea.AbstractDialog, {

    /**
     * Constructor.
     * 
     * @param {Extras.RichTextArea} rta the RichTextArea
     */
    $construct: function(rta) {
        Extras.Sync.RichTextArea.AbstractDialog.call(this, rta,
                Extras.Sync.RichTextArea.AbstractDialog.TYPE_OK_CANCEL,
                {
                    title: rta.peer.msg["ImageDialog.Title"], 
                    icon: rta.peer.icons.image
                },
                new Echo.Column({
                    insets: 10,
                    children: [
                        new Echo.Label({
                            text: rta.peer.msg["ImageDialog.PromptURL"]
                        }),
                        this._urlField = new Echo.TextField({
                            width: "100%"
                        })
                    ]
                }));
    },
    
    /** @see Extras.Sync.RichTextArea.AbstractDialog#processOk */
    processOk: function(e) {
        var data = {
            url: this._urlField.get("text")
        };
        if (!data.url) {
            this.parent.add(new Extras.Sync.RichTextArea.MessageDialog(this.rta, 
                    this.rta.peer.msg["ImageDialog.ErrorDialogTitle"], 
                    this.rta.peer.msg["ImageDialog.ErrorDialog.URL"]));
            return;
        }
        this.parent.remove(this);
        this.fireEvent({type: "insertImage", source: this, data: data});
    }
});

/**
 * Pane which renders its content over the entire domain of the application.  
 */
Extras.Sync.RichTextArea.OverlayPane = Core.extend(Echo.Component, {

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.RichTextOverlayPane", this);
    },
    
    /**
     * The supported RichTextArea.
     * @type Extras.RichTextArea
     */
    rta: null,
    
    /** @see Echo.Component#componentType */
    componentType: "Extras.RichTextOverlayPane",
    
    /** @see Echo.Component#floatingPane */
    floatingPane: true,
    
    /** @see Echo.Component#pane */
    pane: true
});

/**
 * Component rendering peer: OverlayPane.
 * 
 * This component renders itself over the EchoClient's domainElement, rather than beneath its
 * specified parent element.
 */
Extras.Sync.RichTextArea.OverlayPanePeer = Core.extend(Echo.Render.ComponentSync, {

    /**
     * The rendered DIV.
     * @type Element
     */
    _div: null,

    $load: function() {
        Echo.Render.registerPeer("Extras.RichTextOverlayPane", this);
    },

    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this._div = document.createElement("div");
        this.client.addElement(this._div);
        this._div.style.cssText = "position:absolute;top:0;right:0;bottom:0;left:0;z-index:20000;";
        if (this.component.children.length == 1) {
            Echo.Render.renderComponentAdd(update, this.component.children[0], this._div);
        } else if (this.component.children.length > 1) {
            throw new Error("Too many children added to OverlayPane.");
        }
        document.body.appendChild(this._div);
    },
    
    /** @see Echo.Render.ComponentSync#renderDisplay */
    renderDisplay: function(update) {
        if (this._div.style.display != "block") {
            this._div.style.display = "block";
            this.client.forceRedraw();
        }
        Core.Web.VirtualPosition.redraw(this._div);
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        if (!this._div) {
            return;
        }
        this.client.removeElement(this._div);
        if (this._div.parentNode) {
            this._div.parentNode.removeChild(this._div);
        }
        this._div = null;
    },
    
    /** @see Echo.Render.ComponentSync#renderHide */
    renderHide: function() {
        this._div.style.display = "none";
    },
    
    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        var element = this._div;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    }
});

/**
 * Dialog window which displays a message.
 */
Extras.Sync.RichTextArea.MessageDialog = Core.extend(
        Extras.Sync.RichTextArea.AbstractDialog, {
   
    /**
     * Constructor.
     * 
     * @param {Extras.RichTextArea} the RichTextArea
     * @param {String} title the dialog title
     * @param {String} message the dialog message
     */
    $construct: function(rta, title, message) {
        Extras.Sync.RichTextArea.AbstractDialog.call(this, rta,
                Extras.Sync.RichTextArea.AbstractDialog.TYPE_OK, {
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

/**
 * Table creation dialog.  Prompts user for initial settings to insert table.
 */
Extras.Sync.RichTextArea.TableDialog = Core.extend(Extras.Sync.RichTextArea.AbstractDialog, {

    /**
     * Constructor.
     * 
     * @param {Extras.RichTextArea} rta the supported RichTextArea
     */
    $construct: function(rta) {
        Extras.Sync.RichTextArea.AbstractDialog.call(this, rta,
                Extras.Sync.RichTextArea.AbstractDialog.TYPE_OK_CANCEL, {
                    title: rta.peer.msg["TableDialog.Title"], 
                    icon: rta.peer.icons.table,
                    contentWidth: "35em"
                },
                new Echo.Row({
                    insets: "1em",
                    cellSpacing: "1em",
                    children: [
                        this._sizeSelector = new Extras.Sync.RichTextArea.TableSizeSelector({
                            rows: 2,
                            columns: 3,
                            events: {
                                property: Core.method(this, this._processSelectorUpdate)
                            }
                        }),
                        new Echo.Grid({
                            width: "100%",
                            insets: 3,
                            children: [
                                new Echo.Label({
                                    text: rta.peer.msg["TableDialog.PromptRows"],
                                    layoutData: {
                                        alignment: "trailing"
                                    }
                                }),
                                this._rowsField = new Echo.TextField({
                                    text: "2",
                                    alignment: "center",
                                    width: "5em",
                                    events: {
                                        property: Core.method(this, this._processTextUpdate)
                                    }
                                }),
                                new Echo.Label({
                                    text: rta.peer.msg["TableDialog.PromptColumns"],
                                    layoutData: {
                                        alignment: "trailing"
                                    }
                                }),
                                this._columnsField = new Echo.TextField({
                                    text: "3",
                                    alignment: "center",
                                    width: "5em",
                                    events: {
                                        property: Core.method(this, this._processTextUpdate)
                                    }
                                })
                            ]
                        })                    
                    ]
                }));
    },
    
    /** @see Extras.Sync.RichTextArea.AbstractDialog#processOk */
    processOk: function(e) {
        var data = {
            rows: parseInt(this._rowsField.get("text"), 10),
            columns: parseInt(this._columnsField.get("text"), 10)
        };
        if (isNaN(data.rows) || data.rows < 1 || data.rows > 50) {
            this.parent.add(new Extras.Sync.RichTextArea.MessageDialog(this.rta, 
                    this.rta.peer.msg["TableDialog.ErrorDialogTitle"], 
                    this.rta.peer.msg["TableDialog.ErrorDialog.Rows"]));
            return;
        }
        if (isNaN(data.columns) || data.columns < 1 || data.columns > 50) {
            this.parent.add(new Extras.Sync.RichTextArea.MessageDialog(this.rta, 
                    this.rta.peer.msg["TableDialog.ErrorDialogTitle"], 
                    this.rta.peer.msg["TableDialog.ErrorDialog.Columns"]));
            return;
        }
        this.parent.remove(this);
        this.fireEvent({type: "insertTable", source: this, data: data});
    },
    
    _processSelectorUpdate: function(e) {
        var columns = parseInt(this._sizeSelector.get("columns"), 10),
            rows = parseInt(this._sizeSelector.get("rows"), 10);
        this._columnsField.set("text", columns);
        this._rowsField.set("text", rows);
    },
    
    _processTextUpdate: function(e) {
        var columns = parseInt(this._columnsField.get("text"), 10),
            rows = parseInt(this._rowsField.get("text"), 10);
        if (!isNaN(columns)) {
            this._sizeSelector.set("columns", columns);
        }
        if (!isNaN(rows)) {
            this._sizeSelector.set("rows", rows);
        }
        return true;
    }
});

/**
 * Component to interactively select initial number of columns/rows for a table.
 * 
 * @cp {Number} rows the selected number of rows
 * @cp {Number} columns the selected number of columns
 * @sp {Number} rowSize the number of rows to display
 * @sp {Number} columnSize the number of columns to display
 * @sp {#Border} border the border to use for drawing table cells
 * @sp {#Color} selectedBackground the background color for drawing selected table cells
 * @sp {#Border} selectedBorder the border to use for drawing selected table cells
 */
Extras.Sync.RichTextArea.TableSizeSelector = Core.extend(Echo.Component, {
    
    $load: function() {
        Echo.ComponentFactory.registerType("Extras.RichTextTableSizeSelector", this);
    },
    
    /** @see Echo.Component#componentType */
    componentType: "Extras.RichTextTableSizeSelector"
});

Extras.Sync.RichTextArea.TableSizeSelectorPeer = Core.extend(Echo.Render.ComponentSync, {

    $load: function() {
        Echo.Render.registerPeer("Extras.RichTextTableSizeSelector", this);
    },
    
    /**
     * Main container DIV element.
     * @type Element
     */
    _div: null,
    
    /**
     * Table element.
     * @type Element
     */
    _table: null,
    
    _dragInProgress: false,
    
    _drawSelection: function() {
        var rows = parseInt(this.component.render("rows", 0), 10),
            columns = parseInt(this.component.render("columns", 0), 10),
            tr = this._table.firstChild.firstChild,
            y = 0,
            td, x, selected, border, background;
            
        while (tr) {
            td = tr.firstChild;
            x = 0;
            while (td) {
                selected = x < columns  && y < rows;
                background = selected ? this._selectedBackground : null;
                border = selected ? this._selectedBorder : this._border;
                Echo.Sync.Color.renderClear(background, td, "backgroundColor");
                Echo.Sync.Border.renderClear(border, td);
                td = td.nextSibling;
                ++x;
            }
            tr = tr.nextSibling;
            ++y;
        }
    },
    
    _processMouseDown: function(e) {
        this._dragInProgress = true;
        this._processMouseSelection(e);
        return true;
    },
    
    _processMouseMove: function(e) {
        if (this._dragInProgress) {
            this._processMouseSelection(e);
        }
        return true;
    },
    
    _processMouseSelection: function(e) {
        var x = 0, y = 0,
            element = e.target;
        if (!element.nodeName || element.nodeName.toLowerCase() != "td") {
            return;
        }
        while (element.previousSibling) {
            ++x;
            element = element.previousSibling;
        }
        element = element.parentNode;
        while (element.previousSibling) {
            ++y;
            element = element.previousSibling;
        }
        this.component.set("columns", x + 1);
        this.component.set("rows", y + 1);
        
    },
    
    _processMouseUp: function(e) {
        this._dragInProgress = false;
        return true;
    },
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        var tbody, protoTr, tr, td, y, x;
        
        this._rowSize = this.component.render("rowSize", 10);
        this._columnSize = this.component.render("columnSize", 15);
            
        this._border = this.component.render("border", "1px outset #dfdfdf");
        this._selectedBorder = this.component.render("selectedBorder", "1px outset #4f4f5f");
        this._selectedBackground = this.component.render("selectedBackground", "#4f4f5f");
        
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        
        this._table = document.createElement("table");
        this._table.cellPadding = 0;
        this._table.cellSpacing = 0;
        this._table.style.cssText = "padding:0;border:none;font-size:1px;";
        this._table.style.width = (this._columnSize * 18) + "px";
        Echo.Sync.Color.render(this.component.render("background", "#dfdfdf"), this._table, "backgroundColor");
        tbody = document.createElement("tbody");
        this._table.appendChild(tbody);
        
        protoTr = document.createElement("tr");
        for (x = 0; x < this._columnSize; ++x) {
            td = document.createElement("td");
            td.style.cssText = "padding:0;width:16px;height:16px;";
            td.appendChild(document.createTextNode("\u00a0"));
            Echo.Sync.Border.render(this._border, td);
            protoTr.appendChild(td);
        }
        
        for (y = 0; y < this._rowSize; ++y) {
            tbody.appendChild(protoTr.cloneNode(true));
        }
        
        this._div.appendChild(this._table);
        
        Core.Web.Event.Selection.disable(this._div);
        Core.Web.Event.add(this._div, "mousedown", Core.method(this, this._processMouseDown), false);
        Core.Web.Event.add(this._div, "mousemove", Core.method(this, this._processMouseMove), false);
        Core.Web.Event.add(this._div, "mouseup", Core.method(this, this._processMouseUp), false);
        parentElement.appendChild(this._div);
        
        this._drawSelection();
    },
    
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        Core.Web.Event.removeAll(this._div);
        this._table = null;
        this._div = null;
    },
    
    
    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        if (update.isUpdatedPropertySetIn({ columns: true, rows: true })) {
            this._drawSelection();
            return;
        }

        var element = this._div;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    }
});

/**
 * Toolbar button component: a simple button component which optionally provides the capability to be toggled on/off.
 * Additionally provides the capability to show a currently selected color value (used by color selection buttons).
 * 
 * @cp {Boolean} pressed flag indicating whether button should be displayed as pressed (toggled on)
 * @sp {Boolean} toggle flag indicating whether the button supports a toggled state.
 * @sp {#Color} color the selected color. 
 */
Extras.Sync.RichTextArea.ToolbarButton = Core.extend(Echo.Button, {

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.RichTextToolbarButton", this);
    },
    
    /** @see Echo.Component#componentType */
    componentType: "Extras.RichTextToolbarButton",
    
    /**
     * Programmatically performs a button action.
     */
    doAction: function() {
        if (this.render("toggle")) {
            this.set("pressed", !this.get("pressed"));
        } 
        this.fireEvent({ source: this, type: "action", actionCommand: this.render("actionCommand") });
    }
});

/**
 * Component rendering peer for ToolbarButton component. 
 */
Extras.Sync.RichTextArea.ToolbarButtonPeer = Core.extend(Echo.Render.ComponentSync, {

    $load: function() {
        Echo.Render.registerPeer("Extras.RichTextToolbarButton", this);
    },
    
    /**
     * Main DIV rendered DIV element.
     * @type Element
     */
    _div: null,

    /**
     * Processes a mouse click event.
     * 
     * @param e the event
     */
    _processClick: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true;
        }
        this.client.application.setFocusedComponent(this.component);
        this.component.doAction();
    },
    
    /**
     * Processes a mouse rollover enter event.
     * 
     * @param e the event
     */
    _processRolloverEnter: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true;
        }
        this._renderButtonState(true);
    },

    /**
     * Processes a mouse rollover exit event.
     * 
     * @param e the event
     */
    _processRolloverExit: function(e) {
        this._renderButtonState(false);
    },

    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        var icon = this.component.render("icon");
        
        this._div = document.createElement("div");
        this._div.style.cssText = "position:relative;";
        
        this._renderButtonState(false);
        if (this.component.render("color")) {
            this._renderColor();
        }
        
        Echo.Sync.Insets.render(this.component.render("insets"), this._div, "padding");
        
        if (icon) {
            var imgElement = document.createElement("img");
            Echo.Sync.ImageReference.renderImg(icon, imgElement);
            this._div.appendChild(imgElement);
        }
        
        Core.Web.Event.add(this._div, "click", Core.method(this, this._processClick), false);
        Core.Web.Event.add(this._div, "mouseover", Core.method(this, this._processRolloverEnter), false);
        Core.Web.Event.add(this._div, "mouseout", Core.method(this, this._processRolloverExit), false);
        
        parentElement.appendChild(this._div);
    },
       
    /**
     * Renders the state of the button (pressed/rollover effects).
     * 
     * @param {Boolean} rolloverState flag indicating whether component is currently rolled over.
     */
    _renderButtonState: function(rolloverState) {
        var foreground = this.component.render("foreground");
        var background = this.component.render("background");
        var border = this.component.render("border");
        var backgroundImage = this.component.render("backgroundImage");
        
        // Apply pressed effect.
        if (this.component.render("pressed")) {
            foreground = this.component.render("pressedForeground", foreground);
            background = this.component.render("presssedBackground", background);
            border = this.component.render("pressedBorder", border);
            backgroundImage = this.component.render("pressedBackgroundImage", backgroundImage);
        }
        
        // Apply rollover effect.
        if (rolloverState) {
            foreground = this.component.render("rolloverForeground", foreground);
            background = this.component.render("rolloverBackground", background);
            backgroundImage = this.component.render("rolloverBackgroundImage", backgroundImage);
        }
                        
        Echo.Sync.Color.renderClear(foreground, this._div, "color");
        Echo.Sync.Color.renderClear(background, this._div, "backgroundColor");
        Echo.Sync.Border.renderClear(border, this._div);
        Echo.Sync.FillImage.renderClear(backgroundImage, this._div);
    },
    
    /**
     * Renders the selected color of the button.
     */
    _renderColor: function() {
        var color = this.component.render("color");
        if (!this._colorDiv) {
            this._colorDiv = document.createElement("div");
            this._colorDiv.style.cssText = "position:absolute;bottom:0;left:0;right:0;height:5px;line-height:0px;font-size:1px;";
            if (Core.Web.Env.BROWSER_INTERNET_EXPLORER && Core.Web.Env.BROWSER_VERSION_MAJOR === 6) {
                this._colorDiv.style.width = "16px";
            }
            this._colorDiv.style.backgroundColor = color || "#ffffff";
            this._div.appendChild(this._colorDiv);
        }
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        Core.Web.Event.removeAll(this._div);
        this._div = null;
        this._colorDiv = null;
    },
    
    /** @see Echo.Render.ComponentSync#renderFocus */
    renderFocus: function() {
        // Empty implementation required due to supported component extending (focusable) Echo.Button.
    },
    
    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        var element = this._div;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    }
});
