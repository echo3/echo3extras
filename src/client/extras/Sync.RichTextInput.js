/**
 * Component rendering peer: Extras.RichTextInput.
 * This class should not be extended by developers, the implementation is subject to change.
 */
Extras.Sync.RichTextInput = Core.extend(Echo.Render.ComponentSync, {
    
    $load: function() {
        Echo.Render.registerPeer("Extras.RichTextInput", this);
    },
    
    $static: {
        
        DEFAULTS: {
            border: "1px inset #7f7f7f"
        },
        
        /**
         * HTML block-style nodes.
         * Used for Gecko browsers for determining if insertion point is within a block-style node.
         */
        BLOCK_NODES: {
            p: true, h1: true, h2: true, h3: true, h4: true, h5: true, h6: true, pre: true, li: true
        },
        
        /**
         * Property containing browser-modified HTML, used for lazy-processing (cleaning).
         * Invoking toString() method returns processed HTML.
         */
        EditedHtml: Core.extend({
            
            /**
             * The supported RichTextInput peer.
             * @type Extras.Sync.RichTextInput
             */
            _peer: null,
            
            /**
             * Class name (for serialization).
             * @type String
             */
            className: "Extras.RichTextInput.EditedHtml",
            
            /**
             * Creates a new <code>EditedHtml</code> wrapper.
             * 
             * @param {Extras.Sync.RichTextInput} peer the peer
             */
            $construct: function(peer) {
                this._peer = peer;
            },

            /** @see Object#toString */
            toString: function() {
                return this._peer._getProcessedHtml();
            }
        }),
        
        /**
         * HTML manipulation/cleaning utilities.
         */
        Html: {
        
            //FIXME Verify no illegal tags are present or correct.
            //FIXME Verify no unclosed tags are present or correct.
            //FIXME Verify no illegal characters are present or correct.
            //FIXME Provide option to only remove the one trailing BR we add by default.
            
            /**
             * Regular expression to capture leading whitespace.
             * @type RegExp
             */
            _LEADING_WHITESPACE: /^(\s|<br\/?>|&nbsp;)+/i,
        
            /**
             * Regular expression to capture trailing whitespace.
             * @type RegExp
             */
            _TRAILING_WHITESPACE: /(\s|<br\/?>|&nbsp;)+$/i,
            
            /**
             * Regular expression used to correct MSIE's FONT element color attributes which do not enclose attribute values 
             * in quotes.
             * @type RegExp
             */
            _MSIE_INVALID_FONT_COLOR_REPL: /(<font .*?color\=)(#[0-9a-fA-F]{3,6})(.*?>)/ig,
        
            /**
             * Regular expression used to correct MSIE's FONT element background attributes which do not enclose attribute values 
             * in quotes.
             * @type RegExp
             */
            _MSIE_INVALID_FONT_BACKGROUND_REPL: /(<font .*?)(background-color)/ig,
            
            /**
             * Regular expression to determine if a style attribute is setting a bold font.
             * @type RegExp 
             */
            _CSS_BOLD: /font-weight\:\s*bold/i,
    
            /**
             * Regular expression to determine if a style attribute is setting a foreground color.
             * @type RegExp 
             */
            _CSS_FOREGROUND_TEST: /^-?color\:/i,
            
            /**
             * Regular expression to determine the foreground color being set by a style attribute.
             * @type RegExp 
             */
            _CSS_FOREGROUND_RGB: /^-?color\:\s*rgb\s*\(\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})/i,
                    
            /**
             * Regular expression to determine if a style attribute is setting a background color.
             * @type RegExp 
             */
            _CSS_BACKGROUND_TEST: /background-color\:/i,
    
            /**
             * Regular expression to determine the background color being set by a style attribute.
             * @type RegExp 
             */
            _CSS_BACKGROUND_RGB: /background-color\:\s*rgb\s*\(\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})/i,
                    
            /**
             * Regular expression to determine if a style attribute is setting an italic font.
             * @type RegExp 
             */
            _CSS_ITALIC: /font-style\:\s*italic/i,
            
            /**
             * Regular expression to determine if a style attribute is setting an underline font.
             * @type RegExp 
             */
            _CSS_UNDERLINE: /text-decoration\:\s*underline/i,
            
            /**
             * An object which reports style information about a specific node's text content, including inherited style properties.
             */
            StyleData: Core.extend({
                
                /**
                 * Flag indicating whether the text is bold.
                 * @type Boolean
                 */
                bold: false,
                
                /**
                 * Flag indicating whether the text is italicized.
                 * @type Boolean
                 */
                italic: false,
                
                /**
                 * Flag indicating whether the text is underlined.
                 * @type Boolean
                 */
                underline: false,
                
                /**
                 * The paragraph style, one of the following values:
                 * <ul>
                 *  <li>p</li>
                 *  <li>pre</li>
                 *  <li>h1</li>
                 *  <li>h2</li>
                 *  <li>h3</li>
                 *  <li>h4</li>
                 *  <li>h5</li>
                 *  <li>h6</li>
                 * </ul>
                 * 
                 * @type String
                 */
                paragraphStyle: null,
                
                /**
                 * The text foreground color.
                 * @type #Color
                 */
                foreground: null,
                
                /**
                 * The text background color.
                 * @type #Color
                 */
                background: null,
                
                /**
                 * Creates a new style for a specific DOM node.
                 * 
                 * @param {Node} node the node
                 */
                $construct: function(node) {
                    var rgb;
            
                    while (node) { 
                        if (node.nodeType == 1) {
                            switch (node.nodeName.toLowerCase()) {
                            case "b": case "strong":
                                this.bold = true;
                                break;
                            case "i": case "em":
                                this.italic = true;
                                break;
                            case "u":
                                this.underline = true;
                                break;
                            case "h1": case "h2": case "h3": case "h4": case "h5": case "h6": case "p": case "pre":
                                if (!this.paragraphStyle) {
                                    this.paragraphStyle = node.nodeName.toLowerCase();
                                }
                                break;
                            }
                        
                            var css = node.style.cssText;
                            this.bold |= Extras.Sync.RichTextInput.Html._CSS_BOLD.test(css);
                            this.italic |= Extras.Sync.RichTextInput.Html._CSS_ITALIC.test(css);
                            this.underline |= Extras.Sync.RichTextInput.Html._CSS_UNDERLINE.test(css);
                            
                            if (!this.foreground && Extras.Sync.RichTextInput.Html._CSS_FOREGROUND_TEST.test(css)) {
                                rgb = Extras.Sync.RichTextInput.Html._CSS_FOREGROUND_RGB.exec(css);
                                if (rgb) {
                                    this.foreground = Echo.Sync.Color.toHex(
                                            parseInt(rgb[1], 10), parseInt(rgb[2], 10), parseInt(rgb[3], 10));
                                }
                            }
            
                            if (!this.background && Extras.Sync.RichTextInput.Html._CSS_BACKGROUND_TEST.test(css)) {
                                rgb = Extras.Sync.RichTextInput.Html._CSS_BACKGROUND_RGB.exec(css);
                                if (rgb) {
                                    this.background = Echo.Sync.Color.toHex(
                                            parseInt(rgb[1], 10), parseInt(rgb[2], 10), parseInt(rgb[3], 10));
                                }
                            }
                        }
                        node = node.parentNode;
                    }
                }
            }),
            
            /**
             * Cleans HTML input/output.
             * 
             * @param {String} html the HTML to clean
             * @return the cleaned HTML
             * @type String
             */
            clean: function(html) {
                html = html || "<p></p>";
                html = html.replace(Extras.Sync.RichTextInput.Html._LEADING_WHITESPACE, "");
                html = html.replace(Extras.Sync.RichTextInput.Html._TRAILING_WHITESPACE, "");
                if (Core.Web.Env.ENGINE_MSHTML) {
                    html = html.replace(Extras.Sync.RichTextInput.Html._MSIE_INVALID_FONT_COLOR_REPL, "$1\"$2\"$3");
                    html = html.replace(Extras.Sync.RichTextInput.Html._MSIE_INVALID_FONT_BACKGROUND_REPL, "$1background-color");
                }
                return html;
            }
        },
        
        /**
         * A cross-platform range implementation, which provides a subset of functionality available from W3C DOM Range and
         * Internet Explorer's TextRange objects. 
         */
        Range: Core.extend({
            
            /**
             * An Internet Explorer-specific proprietary <code>TextRange</code> object.  Available only when DOM range API is 
             * unavailable, in MSIE-based browsers.
             *
             * @type TextRange
             */
            ieRange: null,
            
            /**
             * W3C DOM Range.  Available on all browsers where supported (i.e., not IE).
             * 
             * @type Range
             */
            domRange: null,
            
            /**
             * The <code>Window</code> containing the range.
             * 
             * @type Window
             */
            window: null,
            
            /**
             * Creates a new <code>Range</code> withing the target <code>Window</code>.
             * 
             * @param {Window} targetWindow the browser window in which the range should exist
             */
            $construct: function(targetWindow) {
                this.window = targetWindow;
                if (Core.Web.Env.ENGINE_MSHTML) {
                    this.ieRange = targetWindow.document.selection.createRange();
                    if (this.ieRange.parentElement().ownerDocument != targetWindow.document) {
                        targetWindow.focus();
                        this.ieRange = targetWindow.document.selection.createRange();
                        if (this.ieRange.parentElement().ownerDocument != targetWindow.document) {
                            this.ieRange = null;
                        }
                    }
                } else {
                    this.domRange = targetWindow.getSelection().getRangeAt(0);
                }
            },
            
            /**
             * Activates the range, moving the client's cursor/selection positions to it.
             */
            activate: function() {
                if (this.domRange) {
                    var selection = this.window.getSelection();
                    if (!selection) {
                        return;
                    }
                    selection.removeAllRanges();
                    selection.addRange(this.domRange);
                } else if (this.ieRange) {
                    this.ieRange.select();
                }
            },
            
            /**
             * Disposes of the range.
             */
            dispose: function() {
                this.domRange = null;
                this.ieRange = null;
                this.window = null;
            },
            
            /**
             * Returns the element/node which contains the range.
             * If an <code>elementName</code> is specified, the returned node will be an element of the specified name,
             * or null if none exists.
             * 
             * @param {String} elementName (optional) the enclosing element name
             */
            getContainingNode: function(elementName) {
                var node;
                if (this.domRange) {
                    node = this.domRange.commonAncestorContainer;
                } else if (this.ieRange) {
                    node = this.ieRange.parentElement();
                }
                
                if (elementName) {
                    while (node != null) {
                        if (node.nodeType == 1 && node.nodeName.toLowerCase() == elementName) {
                            return node;
                        }
                        node = node.parentNode;
                    }
                }
                
                return node;
            }
        }),
        
        /**
         * Key codes which may result in cursor navigating into new style, resulting in a "cursorStyleChange" event being fired.
         */
        _NAVIGATION_KEY_CODES: {
            38: 1, 40: 1, 37: 1, 39: 1, 33: 1, 34: 1, 36: 1, 35: 1, 8: 1, 46: 1
        }
    },
    
    /**
     * Flag indicating whether a style information update is required due to the cursor/selection having been moved/changed.
     * @type Boolean
     */
    _cursorStyleUpdateRequired: false,

    /**
     * Flag indicating whether an action event should be fired.
     * Set by _processKeyPress(), used by _processKeyUp().
     * @type Boolean
     */
    _fireAction: false,
    
    /**
     * The most recently retrieved document HTML.
     * @type String 
     */
    _renderedHtml: null,
    
    /**
     * Listener to receive property events from component.
     * @type Function
     */
    _propertyListener: null,

    /**
     * Listener to receive execCommand events from component.
     * @type Function
     */
    _execCommandListener: null,
    
    /**
     * Root DIV element of rendered DOM hierarchy.
     * @type Element
     */
    _div: null,
    
    /**
     * Rendered IFRAME element containing editable document.
     * @type Element
     */
    _iframe: null,
    
    /**
     * The IFRAME's contained document.
     * @type Document
     */
    _document: null,
    
    _temporaryCssStyleEnabled: false,

    /**
     * Constructor.
     */
    $construct: function() { 
        this._propertyListener = Core.method(this, function(e) {
            if (e.propertyName == "text") {
                this._loadData();
            }
        });
        this._execCommandListener = Core.method(this, function(e) {
            this._execCommand(e.commandName, e.value);
        });
    },
    
    /**
     * Adds listeners to supported Extras.RichTextInput object.
     */
    _addComponentListeners: function() {
        this.component.addListener("execCommand", this._execCommandListener);
        this.component.addListener("property", this._propertyListener);
    },
    

    /**
     * Deletes a column from an HTML table containing the current selection.
     * Takes no action in the event that the selection is not in a table cell. 
     * This method assumes no column or row spans.
     */
    _deleteTableColumn: function() {
        var action = Core.method(this, function(td) {
            td.parentNode.removeChild(td);
        });
        this._updateSelectedTableColumn(action);
    },
    
    /**
     * Deletes a row from an HTML table containing the current selection.
     * Takes no action in the event that the selection is not in a table cell.
     * This method assumes no column or row spans.
     */
    _deleteTableRow: function() {
        var tr = this._selectionRange.getContainingNode("tr");
        if (!tr) {
            return;
        }
        tr.parentNode.removeChild(tr);
    },

    /**
     * Disposes of current selection range.
     */
    _disposeRange: function() {
        if (this._selectionRange) {
            //FIXME 
            this._selectionRange.dispose();
        }
    },
    
    /**
     * Executes a rich text editing command (via document.execCommand()).
     * 
     * @param {String} commandName the command name
     * @param {String} value the command value
     */
    _execCommand: function(commandName, value) {
        if (this._temporaryCssStyleEnabled) {
            this._document.execCommand("styleWithCSS", false, false);
            this._temporaryCssStyleEnabled = false;
        }
        
        if (this._selectionRange) {
            // Select range if it exists.
            this._loadRange();
        } else {
            // Create range if none exists.
            this._storeRange();
        }
        
        switch (commandName) {
        case "tableDeleteColumn":
            this._deleteTableColumn();
            break;
        case "tableDeleteRow":
            this._deleteTableRow();
            break;
        case "tableInsertColumn":
            this._insertTableColumn();
            break;
        case "tableInsertRow":
            this._insertTableRow();
            break;
        case "foreground":
            this._document.execCommand("forecolor", false, value);
            break;
        case "background":
            if (Core.Web.Env.ENGINE_GECKO) {
                this._document.execCommand("styleWithCSS", false, true);
                this._document.execCommand("hilitecolor", false, value);
                this._temporaryCssStyleEnabled = true;
            } else {
                this._document.execCommand(Core.Web.Env.ENGINE_MSHTML ? "backcolor" : "hilitecolor", false, value);
            }
            break;
        case "insertHtml":
            if (Core.Web.Env.ENGINE_MSHTML) {
                if (!this._selectionRange) {
                    this._storeRange(); 
                }
                this._selectionRange.ieRange.pasteHTML(value);
            } else {
                this._document.execCommand("inserthtml", false, value);
            }
            this._storeRange();
            break;
        default: 
            this._document.execCommand(commandName, false, value);
            break;
        }
        
        this._storeData();
        
        this.client.forceRedraw();
        
        // Flag that cursor style update is required.  Some browsers will not render nodes until text is inserted.
        this._cursorStyleUpdateRequired = true;
    },
    
    /**
     * Focuses the rich text input document.
     */
    focusDocument: function() {
        this.client.application.setFocusedComponent(this.component);
        this.client.forceRedraw();
    },
    
    /**
     * Returns a processed version of the currently edited HTML.
     * 
     * @return the processed HTML
     * @type String
     */
    _getProcessedHtml: function() {
        if (this._renderedHtml == null) {
            this._renderedHtml = this._document.body.innerHTML; 
        }
        return Extras.Sync.RichTextInput.Html.clean(this._renderedHtml);
    },
    
    /**
     * Determines the column index of the specified TD or TH element.
     * TD or TH elements contained in a TR are considered columns.
     * This method assumes no column or row spans.
     * 
     * @param {Element} td the TD element
     * @return the column index, or -1 if it cannot be found
     * @type Number 
     */
    _getTableColumnIndex: function(td) {
        var tr = td.parentNode;
        if (tr.nodeName.toLowerCase() != "tr") {
            // Sanity check; should not occur.
            return -1;
        }
        var index = 0;
        var node = tr.firstChild;
        while (node && node != td) {
            var nodeName = node.nodeName.toLowerCase();
            if (nodeName == "td" || nodeName == "th") {
                ++index;
            }
            node = node.nextSibling;
        }
        if (!node) {
            return -1;
        }
        return index;
    },
    
    /**
     * Inserts a column into an HTML table containing the current selection.
     * Takes no action in the event that the selection is not in a table.
     * This method assumes no column or row spans.
     */
    _insertTableColumn: function() {
        var action = Core.method(this, function(td) {
            var newTd = this._document.createElement("td");
            if (!Core.Web.Env.ENGINE_MSHTML) {
                newTd.appendChild(this._document.createElement("br"));
            }
            td.parentNode.insertBefore(newTd, td);
        });
        this._updateSelectedTableColumn(action);
    },
    
    /**
     * Inserts a row into an HTML table containing the current selection.
     * Takes no action in the event that the selection is not in a table.
     * This method assumes no column or row spans.
     */
    _insertTableRow: function() {
        var tr = this._selectionRange.getContainingNode("tr");
        
        var table = this._selectionRange.getContainingNode("table");
        if (!tr || !table) {
            return;
        }
        
        var newTr = this._document.createElement("tr");
        var node = tr.firstChild;
        while (node) {
            if (node.nodeType == 1 && (node.nodeName.toLowerCase() == "td" || node.nodeName.toLowerCase() == "th")) {
                var newTd = this._document.createElement("td");
                if (!Core.Web.Env.ENGINE_MSHTML) {
                    newTd.appendChild(this._document.createElement("br"));
                }
                newTr.appendChild(newTd);
            }
            node = node.nextSibling;
        }
        
        tr.parentNode.insertBefore(newTr, tr);
    },
    
    /**
     * Loads the text data in the component's "text" property into the rendered editable document.
     * @see #_storeData
     */
    _loadData: function() {
        var text = this.component.get("text") || (Core.Web.Env.ENGINE_GECKO ? "<p><br/></p>" : "<p></p>");
        
        if (text instanceof Extras.Sync.RichTextInput.EditedHtml) {
            // Current component text is represented by an EditedHtml object, which references the editable text document 
            // itself: do nothing.
            return;
        }
        
        if (this._renderedHtml == null) {
            this._renderedHtml = this._document.body.innerHTML; 
        }

        if (text == this._renderedHtml) {
            // No update necessary.
            return;
        }

        this._renderedHtml = text;
        this._document.body.innerHTML = text;
        
        if (this._selectionRange) {
            this.component.doCursorStyleChange(new Extras.Sync.RichTextInput.Html.StyleData(
                    this._selectionRange.getContainingNode()));
        }
    },
    
    /**
     * Selects (only) the current stored range.
     * @see #_storeRange
     */
    _loadRange: function() {
        if (this._selectionRange) {
            this._selectionRange.activate();
            if (Core.Web.Env.ENGINE_MSHTML && this.component.application.getFocusedComponent() != this.component) {
                // MSIE: Blur focus from content window in the event that it is not currently focused.
                // If this operation is not performed, text may be entered into the window, but key events
                // will not be processed by listeners, resulting in an out-of-sync condition.
                this._iframe.contentWindow.blur();
            }
        }
    },
    
    /**
     * Notifies component object of a potential cursor style change (such that it may notify registered listeners).
     */
    _notifyCursorStyleChange: function() {
        this._cursorStyleUpdateRequired = false;
        Core.Web.Scheduler.run(Core.method(this, function() {
            this.component.doCursorStyleChange(new Extras.Sync.RichTextInput.Html.StyleData(
                  this._selectionRange.getContainingNode()));
        }));
    },
    
    /**
     * Processes a focus event within the input document.
     * 
     * @param e the event
     */
    _processFocus: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            Core.Web.DOM.preventEventDefault(e);
            return;
        }
        this.client.application.setFocusedComponent(this.component);
    },
    
    /**
     * Processes a key press event within the input document.
     * 
     * @param e the event
     */
    _processKeyDown: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            Core.Web.DOM.preventEventDefault(e);
            return;
        }
        if (e.keyCode == 13) {
            this._processNewLine();
            this._fireAction = true;
        }
    },
    
    /**
     * Processes a key press event within the input document.
     * 
     * @param e the event
     */
    _processKeyPress: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            Core.Web.DOM.preventEventDefault(e);
            return;
        }
    },
    
    /**
     * Processes a key up event within the input document.
     * 
     * @param e the event
     */
    _processKeyUp: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return;
        }

        this._storeData();
        this._storeRange();
        
        if (this._cursorStyleUpdateRequired || Extras.Sync.RichTextInput._NAVIGATION_KEY_CODES[e.keyCode]) {
            this._notifyCursorStyleChange();
        }
        
        if (this._fireAction) {
            this._fireAction = false;
            this.component.doAction();
        }
    },
    
    /**
     * Processes a mouse down event within the input document.
     * 
     * @param e the event
     */
    _processMouseDown: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            Core.Web.DOM.preventEventDefault(e);
            return;
        }
        this.client.application.setFocusedComponent(this.component);
    },

    /**
     * Processes a mouse up event within the input document.
     * 
     * @param e the event
     */
    _processMouseUp: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            Core.Web.DOM.preventEventDefault(e);
            return;
        }

        this._storeRange();
        
        this._notifyCursorStyleChange();
    },
    
    /**
     * Processes a user newline entry keyboard event (pressing return/enter).
     * Handles special case in Gecko/WebKit browser where cursor is not within
     * a block element (e.g., "p" tag), which will cause enter key to 
     * insert "<br>" (Gecko) or "<div>" (WebKit) tags.  Such behavior is undesirable for cross-browser
     * editing of content (i.e., editing same rich text document by different
     * browsers).
     */
    _processNewLine: function() {
        var node, inBlock;
        
        if (!Core.Web.Env.ENGINE_GECKO && !Core.Web.Env.ENGINE_WEBKIT) {
            // Allow normal operation in non-Gecko browsers.
            return;
        }
        
        this._storeRange();
        node = this._selectionRange.domRange.endContainer;
        inBlock = false;
        while (node.nodeType != 1 || node.nodeName.toLowerCase() != "body") {
            if (node.nodeType == 1 && Extras.Sync.RichTextInput.BLOCK_NODES[node.nodeName.toLowerCase()]) {
                inBlock = true;
                break;
            }
            node = node.parentNode;
        }
        
        if (inBlock) {
            // In block: Gecko browsers will work properly as 'insertbronreturn' flag has been set false.
            return;
        }
        
        this._document.execCommand("formatblock", null, "<p>");
    },
    
    /**
     * Removes listeners from supported Extras.RichTextInput object.
     */
    _removeComponentListeners: function() {
        this.component.removeListener("execCommand", this._execCommandListener);
        this.component.removeListener("property", this._propertyListener);
    },
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this._addComponentListeners();
        
        // Create IFRAME container DIV element.
        this._div = document.createElement("div");
        Echo.Sync.Border.render(this.component.render("border", Extras.Sync.RichTextInput.DEFAULTS.border), this._div);
        
        // Create IFRAME element.
        this._iframe = document.createElement("iframe");
        this._iframe.style.width = this.width ? this.width : "100%";

        if (!this.component.get("paneRender")) {
            this._iframe.style.height = this.height ? this.height : "200px";
        }

        this._iframe.style.border = "0px none";
        this._iframe.frameBorder = "0";
    
        this._div.appendChild(this._iframe);
    
        parentElement.appendChild(this._div);
    },
    
    /**
     * Renders the editable content document within the created IFRAME.
     */
    _renderDocument: function() {
        // Ensure element is on-screen before rendering content/enabling design mode.
        var element = this._iframe;
        while (element != document.body) {
            if (element == null) {
                // Not added to parent.
                return;
            }
            if (element.nodeType == 1 && element.style.display == "none") {
                // Not rendered.
                return;
            }
            element = element.parentNode;
        }
        
        var style = "height:100%;width:100%;margin:0px;padding:0px;";
        var foreground = this.component.render("foreground");
        if (foreground) {
            style += "color:" + foreground + ";";
        }
        var background = this.component.render("background");
        if (background) {
            style += "background-color:" + background + ";";
        }
        var backgroundImage = this.component.render("backgroundImage");
        if (backgroundImage) {
            style += "background-attachment: fixed;";
            style += "background-image:url(" + Echo.Sync.FillImage.getUrl(backgroundImage) + ");";
            var backgroundRepeat = Echo.Sync.FillImage.getRepeat(backgroundImage);
            if (backgroundRepeat) {
                style += "background-repeat:" + backgroundRepeat + ";";
            }
            var backgroundPosition = Echo.Sync.FillImage.getPosition(backgroundImage);
            if (backgroundPosition) {
                style += "background-position:" + backgroundPosition + ";";
            }
        }
        
        var text = this.component.get("text");
        this._document = this._iframe.contentWindow.document;
        this._document.open();
        this._document.write("<html><body tabindex=\"0\" width=\"100%\" height=\"100%\"" +
                (style ? (" style=\"" + style + "\"") : "") + ">" + (text || "") + "</body></html>");
        this._document.close();
        if (Core.Web.Env.BROWSER_MOZILLA && !Core.Web.Env.BROWSER_FIREFOX) {
            // workaround for Mozilla (not Firefox)
            var setDesignModeOn = function() {
                this._document.designMode = "on";
            };
            setTimeout(setDesignModeOn, 0);
        } else {
            this._document.designMode = "on";
            if (Core.Web.Env.ENGINE_GECKO || Core.Web.Env.ENGINE_WEBKIT) {
                this._document.execCommand("insertbronreturn", false, false);
                this._document.execCommand("stylewithcss", false, false);
                this._document.execCommand("enableObjectResizing", false, false);
                this._document.execCommand("enableInlineTableEditing", false, false);
            }
        }
        
        Core.Web.Event.add(this._document, "focus",  Core.method(this, this._processFocus), false);
        Core.Web.Event.add(this._document, "keydown",  Core.method(this, this._processKeyDown), false);
        Core.Web.Event.add(this._document, "keypress",  Core.method(this, this._processKeyPress), false);
        Core.Web.Event.add(this._document, "keyup", Core.method(this, this._processKeyUp), false);
        Core.Web.Event.add(this._document, "mousedown", Core.method(this, this._processMouseDown), false);
        Core.Web.Event.add(this._document, "mouseup", Core.method(this, this._processMouseUp), false);

        this._documentRendered = true;
    },
    
    /**
     * Clears the editable document, disposing any resources related to it.
     * Invoked by renderHide() implementation.
     */
    _renderDocumentRemove: function() {
        Core.Web.Event.removeAll(this._document);
        while (this._document.body.firstChild) {
            this._document.body.removeChild(this._document.body.firstChild);
        }
        this._documentRendered = false;
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        this._removeComponentListeners();
        Core.Web.Event.removeAll(this._document);
        this._div = null;
        this._iframe = null;
        this._document = null;
        this._documentRendered = false;
        this._selectionRange = null;
    },
    
    /** @see Echo.Render.ComponentSync#renderDisplay */
    renderDisplay: function() {
        if (!this._documentRendered) {
            this._renderDocument();
        }

        this.client.forceRedraw();
        
        var bounds = new Core.Web.Measure.Bounds(this._div.parentNode);
        
        if (bounds.height) {
            var border = this.component.render("border", Extras.Sync.RichTextInput.DEFAULTS.border);
            var borderSize = Echo.Sync.Border.getPixelSize(border, "top") + Echo.Sync.Border.getPixelSize(border, "bottom");
    
            var calculatedHeight = (bounds.height < 100 ? 100 : bounds.height - borderSize) + "px";
            if (this._iframe.style.height != calculatedHeight) {
                this._iframe.style.height = calculatedHeight; 
            }
        }
    },
    
    /** @see Echo.Render.ComponentSync#renderFocus */
    renderFocus: function() {
        if (Core.Web.Env.BROWSER_SAFARI) {
            // Focus window first to avoid issue where Safari issue with updating content and then focusing.
            window.focus();
        }
        Core.Web.DOM.focusElement(this._iframe.contentWindow);
        this.client.forceRedraw();
    },
    
    /** @see Echo.Render.ComponentSync#renderHide */
    renderHide: function() {
        // Dispose selection range (critical for MSIE).
        this._disposeRange();
        
        // Store state.
        this._renderedHtml = this._document.body.innerHTML;
        
        // Clear editable document and dispose resources.
        this._renderDocumentRemove();
    },
    
    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        if (update.isUpdatedPropertySetIn({text: true })) {
            this._loadData();
            update.renderContext.displayRequired = [];
            return;
        }
    
        var element = this._div;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
    },
        
    /**
     * Stores the state of the editable document into the "text" property of the component.
     * The HTML is cleaned first.
     * @see #_loadData
     */
    _storeData: function() {
        this._renderedHtml = null;
        this.component.set("text", new Extras.Sync.RichTextInput.EditedHtml(this), true);
    },
    
    /**
     * Stores the current selection range.
     * @see #_loadRange
     */
    _storeRange: function() {
        this._disposeRange();
        this._selectionRange = new Extras.Sync.RichTextInput.Range(this._iframe.contentWindow);
    },

    /**
     * Updates the selected table column, passing each TD/TH element at the column index
     * to the specified action method.
     * 
     * @param {Function} action function to invoke on each TD/TH element of column, the
     *        TD/TH element will be provided as the only parameter to the function
     */
    _updateSelectedTableColumn: function(action) {
        var td = this._selectionRange.getContainingNode("td");
        if (!td) {
            return;
        }
        var index = this._getTableColumnIndex(td);
        if (index === -1) {
            return;
        }
        var table = this._selectionRange.getContainingNode("table");
        this._updateTableColumnFromTbody(table, index, action);
    },

    /**
     * Work method for <code>_updateSelectedTableColumn</code>.
     * Processes TBODY/TABLE elements, searching for TD/TH elements representing the table column
     * specified by <code>index</code>.
     * 
     * @param {Element} tbody the TABLE or TBODY element
     * @param {Number} index the column index
     * @param {Function} action function to invoke on each TD/TH element of column, the
     *        TD/TH element will be provided as the only parameter to the function
     */
    _updateTableColumnFromTbody: function(tbody, index, action) {
        var node = tbody.firstChild;
        while (node) {
            if (node.nodeType == 1) {
                var nodeName = node.nodeName.toLowerCase();
                if (nodeName == "tbody") {
                    this._updateTableColumnFromTbody(node, index, action);
                } else if (nodeName == "tr") {
                    this._updateTableColumnFromTr(node, index, action);
                }
            }
            node = node.nextSibling;
        }
    },
    
    /**
     * Work method for <code>_updateSelectedTableColumn</code>.
     * Processes TR elements, searching for TD/TH elements representing the table column
     * specified by <code>index</code>.
     * 
     * @param {Element} tr the TR element
     * @param {Number} index the column index
     * @param {Function} action function to invoke on each TD/TH element of column, the
     *        TD/TH element will be provided as the only parameter to the function
     */
    _updateTableColumnFromTr: function(tr, index, action) {
        var i = -1;
        var node = tr.firstChild;
        while (node) {
            if (node.nodeType == 1) {
                var nodeName = node.nodeName.toLowerCase();
                if (nodeName == "td" || nodeName == "th") {
                    ++i;
                    if (i == index) {
                        action(node);
                        return;
                    }
                }
            }
            node = node.nextSibling;
        }
    }
});
