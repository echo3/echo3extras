/**
 * Component rendering peer: Tree (Remote)
 */
Extras.Sync.RemoteTree = Core.extend(Echo.Render.ComponentSync, {

    $static: {
        _BORDER_SIDE_STYLE_NAMES: ["borderTop", "borderRight", "borderBottom", "borderLeft"],

        _SIDE_TO_PADDING_MAP: { "top": "paddingTop", "right" : "paddingRight", "bottom" : "paddingBottom", "left" : "paddingLeft" },
        
        LINE_STYLE_NONE: 0,
        LINE_STYLE_SOLID: 1,
        LINE_STYLE_DOTTED: 2,
    
        _supportedPartialProperties: ["treeStructure", "selection"],
        
        TREE_IMAGES: {
            0: {
                open: "image/tree/Open.gif",
                openBottom: "image/tree/Open.gif",
                closed: "image/tree/Closed.gif",
                closedBottom: "image/tree/Closed.gif",
                join: "image/tree/Transparent.gif",
                joinBottom: "image/tree/Transparent.gif"
            },
            1: {
                vertical: "image/tree/VerticalSolid.gif",
                open: "image/tree/OpenSolid.gif",
                openBottom: "image/tree/OpenBottomSolid.gif",
                closed: "image/tree/ClosedSolid.gif",
                closedBottom: "image/tree/ClosedBottomSolid.gif",
                join: "image/tree/JoinSolid.gif",
                joinBottom: "image/tree/JoinBottomSolid.gif"
            },
            2: {
                vertical: "image/tree/VerticalDotted.gif",
                open: "image/tree/OpenDotted.gif",
                openBottom: "image/tree/OpenBottomDotted.gif",
                closed: "image/tree/ClosedDotted.gif",
                closedBottom: "image/tree/ClosedBottomDotted.gif",
                join: "image/tree/JoinDotted.gif",
                joinBottom: "image/tree/JoinBottomDotted.gif"
            } 
        }
    },
    
    $load: function() {
        Echo.Render.registerPeer("Extras.RemoteTree", this);
    },
    
    renderAdd: function(update, parentElement) {
        this._lineStyle = this.component.render("lineStyle", Extras.Sync.RemoteTree.LINE_STYLE_DOTTED);
        this._imageSet = { };
        for (var x in Extras.Sync.RemoteTree.TREE_IMAGES[this._lineStyle]) {
            this._imageSet[x] = this.client.getResourceUrl("Extras", 
                    Extras.Sync.RemoteTree.TREE_IMAGES[this._lineStyle][x]);
        }
        this._showLines = this._lineStyle != Extras.Sync.RemoteTree.LINE_STYLE_NONE;

        this._showsRootHandle = this.component.render("showsRootHandle", false);
        this._rootVisible = this.component.render("rootVisible", true);
        this._headerVisible = this.component.render("headerVisible", false);
        this._rolloverEnabled = this.component.render("rolloverEnabled");
        this._selectionEnabled = this.component.render("selectionEnabled");
        if (this._selectionEnabled) {
            this.selectionModel = new Extras.TreeSelectionModel(parseInt(this.component.get("selectionMode"), 10));
        }
        
        this._defaultInsets = this.component.render("insets");
        if (!this._defaultInsets) {
            this._defaultInsets = "0px";
        }
        this._defaultCellPadding = Echo.Sync.Insets.toCssValue(this._defaultInsets);
        
        var width = this.component.render("width");
        if (width && Core.Web.Env.QUIRK_IE_TABLE_PERCENT_WIDTH_SCROLLBAR_ERROR && Echo.Sync.Extent.isPercent(width)) {
            this._renderPercentWidthByMeasure = parseInt(width, 10);
            width = null;
        }
        
        var tableElement = document.createElement("table");
        this._element = tableElement;
        this._element.id = this.component.renderId;
        tableElement.style.borderSpacing = "0px";
        tableElement.cellSpacing = "0";
        tableElement.cellPadding = "0";
        Echo.Sync.Border.render(this.component.render("border"), tableElement);
        
        this._computeEffectBorderCompensation();
        
        if (width) {
            this._element.style.width = width;
        }
        
        var tbodyElement = document.createElement("tbody");
        tableElement.appendChild(tbodyElement);
        this._tbodyElement = tbodyElement;
        
        //-- element needed for FF-specific hack, see _doExpansion function
        this._buggerTBody = document.createElement("tbody");
        this._buggerTBody.style.display = "none";
        this._buggerRow = document.createElement("tr");
        this._buggerTBody.appendChild(this._buggerRow);
        tableElement.appendChild(this._buggerTBody);
        //--
        
        var localStructure = this.component.get("treeStructure");
        var fullLocalStructure = localStructure != null && localStructure.fullRefresh;
        if (fullLocalStructure) {
            // tree structure in local style is a full structure
            this.component.treeStructure = localStructure[0];
        } else {
            // local style structure contains a partial update
            this._mergeTreeStructureUpdate(localStructure);
        }
        this.columnCount = this.component.get("columnCount");
        
        this._renderColumnWidths();
        
        if (this._headerVisible) {
            this._renderNode(update, this.component.treeStructure.getHeaderNode());
        }
        var rootNode = this.component.treeStructure.getRootNode();
        this._renderNode(update, rootNode);
        
        parentElement.appendChild(tableElement);
    
        var selection = this.component.render("selection");
        if (selection && this._selectionEnabled) {
            this._setSelectedFromProperty(selection);
        }
    },
    
    _computeEffectBorderCompensation: function() {
        var selectionBorder = this.component.render("selectionBorder");
        var rolloverBorder = this.component.render("rolloverBorder");
        var selectionBorderLeft = 0;
        if (selectionBorder && this._selectionEnabled) {
            selectionBorderLeft = Echo.Sync.Border.getPixelSize(selectionBorder, "left");
        }
        var rolloverBorderLeft = 0;
        if (rolloverBorder && this._rolloverEnabled) {
            rolloverBorderLeft = Echo.Sync.Border.getPixelSize(rolloverBorder, "left");
        }
        this._effectBorderCompensation = Math.max(selectionBorderLeft, rolloverBorderLeft);
    },
    
    _renderColumnWidths: function() {
        if (!this.component.render("columnWidth")) {
            return;
        }
        // If any column widths are set, render colgroup.
        var columnPixelAdjustment;
        if (Core.Web.Env.QUIRK_TABLE_CELL_WIDTH_EXCLUDES_PADDING) {
            var pixelInsets = Echo.Sync.Insets.toPixels(this._defaultInsets);
            columnPixelAdjustment = pixelInsets.left + pixelInsets.right;
        }
        
        this._colGroupElement = document.createElement("colgroup");
        var renderRelative = !Core.Web.Env.NOT_SUPPORTED_RELATIVE_COLUMN_WIDTHS;
        for (var i = 0; i < this.columnCount; ++i) {
            var colElement = document.createElement("col");
            var width = this.component.renderIndex("columnWidth", i); 
            if (width != null) {
                if (Echo.Sync.Extent.isPercent(width)) {
                    colElement.width = parseFloat(width) + (renderRelative ? "*" : "%");
                } else {
                    var columnPixels = Echo.Sync.Extent.toPixels(width, true);
                    if (columnPixelAdjustment) {
                        colElement.width = columnPixels - columnPixelAdjustment + "px";
                    } else {
                        colElement.width = columnPixels + "px";
                    }
                }
            }
            this._colGroupElement.appendChild(colElement);
        }
        this._element.appendChild(this._colGroupElement);
    },
    
    renderDisplay: function() {
        if (this._renderPercentWidthByMeasure) {
            this._element.style.width = "";
            var percentWidth = (this._element.parentNode.offsetWidth * this._renderPercentWidthByMeasure) / 100;
            this._element.style.width = percentWidth + "px";
        }
    },
    
    /**
     * Creates an iterator object for easy navigating through the tree table.
     * 
     * @param startRow the row element to start with, 
     *          this element will be returned on the first call to nextRow().
     *          If null, the iteration will start at the first row.
     * @param endRow the row that ends the iteration. When endRow is encountered 
     *          while iterating the iterator will return null, and will not advance to the next row.
     */
    _elementIterator: function(startRow, endRow) {
        var component = this.component;
        if (!startRow && this._tbodyElement.firstChild) {
            startRow = this._tbodyElement.firstChild;
        }
        return {
            startRow : startRow,
            rowElement : null,
            
            /**
             * Advance to the next row. If node is provided rows will be skipped until the row is 
             * found that node is rendered to. If no row is found for the node, null is returned,
             * and the cursor is reset to its current state.
             */
            nextRow : function(node) {
                var cursor = this.rowElement;
                var result = this._nextRow();
                if (!node) {
                    return result;
                }
                var id = component.renderId + "_tr_" + node.getId();
                while (result && result.id != id) {
                    result = this._nextRow();
                }
                if (!result && node) {
                    this.rowElement = cursor;
                }
                return result;
            },
            
            _nextRow : function() {
                if (this.rowElement) {
                    if (this.rowElement.nextSibling == endRow) {
                        return null;
                    }
                    this.rowElement = this.rowElement.nextSibling;
                } else {
                    this.rowElement = this.startRow;
                }
                
                return this.rowElement;
            },
            
            /**
             * Advance to the next row, and return the node element of that row.
             */
            nextNodeElement : function() {
                this.nextRow();
                if (!this.rowElement) {
                    return null;
                }
                return this.currentNodeElement();
            },
            
            /**
             * Returns the node element on the current row.
             */
            currentNodeElement : function() {
                var cellElement = this._nestedTdElement(this.rowElement);
                while (cellElement) {
                    if (cellElement.__ExtrasTreeCellType == "node") {
                        return cellElement;
                    }
                    cellElement = cellElement.nextSibling;
                }
                return null;
            },
    
            /**
             * Returns the expando element on the current row, if the current
             * row does not contain an expando element, null is returned.
             */
            currentExpandoElement : function() {
                var cellElement = this._nestedTdElement(this.rowElement);
                while (cellElement) {
                    if (cellElement.__ExtrasTreeCellType == "expando") {
                        return cellElement;
                    }
                    cellElement = cellElement.nextSibling;
                }
                return null;
            },
            
            _nestedTdElement : function(rowElement) {
                var count = 0;
                var e = rowElement;
                do {
                    e = e.firstChild;
                    if (e.tagName.toLowerCase() == "td") {
                        ++count;
                    }
                } while (count < 2);
                return e;
            }
        };
    },
    
    _renderNode: function(update, node) {
        var rowElement = this._getRowElementForNode(node);
        var nodeDepth = this.component.treeStructure.getNodeDepth(node);
        
        var insertBefore = null;
        if (rowElement) {
            insertBefore = rowElement.nextSibling;
        }
    
        var nodeSibling = this.component.treeStructure.getNodeNextSibling(node, true);
        var endRow = null;
        if (nodeSibling) {
            endRow = this._getRowElementForNode(nodeSibling);
        }
        var iterator = this._elementIterator(rowElement, endRow);
        var visible = true;
        var parentNode = this.component.treeStructure.getNode(node.getParentId());
        if (parentNode) {
            visible = parentNode.isExpanded();
        }
        this._renderNodeRecursive(update, node, iterator, nodeDepth, insertBefore, visible);
    },
    
    _renderNodeRecursive: function(update, node, iterator, depth, insertBefore, visible) {
        if (visible == null) {
            visible = true;
        }
        if (!this._rootVisible && node == this.component.treeStructure.getRootNode()) {
            visible = false;
        }
        var trElement = iterator.nextRow(node);
        var tdElement;
        var expandoElement;
        
        var rendered = trElement != null;
        
        if (!rendered) {
            var elems = this._renderNodeRowStructure(insertBefore, node, depth);
            // skip the just created row element
            iterator.nextRow();
            trElement = elems.trElement;
            tdElement = elems.tdElement;
            expandoElement = elems.expandoElement;
            
            var component = this.component.application.getComponentByRenderId(node.getId());
            Echo.Render.renderComponentAdd(update, component, tdElement);
            
            if (this.columnCount > 1) {
                for (var c = 0; c < this.columnCount - 1; ++c) {
                    var columnElement = document.createElement("td");
                    
                    var columnComponent = this.component.application.getComponentByRenderId(node.getColumn(c));
                    Echo.Render.renderComponentAdd(update, columnComponent, columnElement);
                    
                    trElement.appendChild(columnElement);
                }
            }
            this._setDefaultRowStyle(trElement);
        } else {
            trElement.style.display = ""; // unhide
            tdElement = iterator.currentNodeElement();
            expandoElement = iterator.currentExpandoElement();
        }
    
        if (expandoElement) {
            this._renderExpandoElement(node, expandoElement);
        }
        if (!visible) {
            trElement.style.display = "none";
        }
        
        // render child nodes
        var expanded = node.isExpanded();    
        var childCount = node.getChildNodeCount();
        insertBefore = trElement.nextSibling;
        for (var i = 0; i < childCount; ++i) {
            var childNode = node.getChildNode(i);
            if (insertBefore) {
                if (insertBefore.id == (this.component.renderId + "_tr_" + childNode.getId())) {
                    insertBefore = insertBefore.nextSibling;
                }
            }
            if (expanded || !rendered) {
                this._renderNodeRecursive(update, childNode, iterator, depth + 1, insertBefore, expanded);
            } else {
                // child node should not be visible
                this._hideNode(childNode, iterator);
            }
        }
    },
    
    _getIconLineStyleSuffix: function() {
        switch (this._lineStyle) {
            case Extras.Sync.RemoteTree.LINE_STYLE_NONE:
                return "";
            case Extras.Sync.RemoteTree.LINE_STYLE_SOLID:
                return "Solid";
            case Extras.Sync.RemoteTree.LINE_STYLE_DOTTED:
                return "Dotted";
        }
    },
    
    _getToggleIcon: function(node) {
        var imageSuffix = this._getIconLineStyleSuffix();
        var bottom = "";
        if (this._showLines && !this.component.treeStructure.hasNodeNextSibling(node)) {
            bottom = "Bottom";
        }
        if (node.isExpanded()) {
            return this.component.render("nodeOpen" + bottom + "Icon", this._imageSet["open" + bottom]);
        } else {
            return this.component.render("nodeClosed" + bottom + "Icon", this._imageSet["closed" + bottom]);
        }
    },
    
    _getJoinIcon: function(node) {
        var imageSuffix = this._getIconLineStyleSuffix();
        var bottom = "";
        if (!this.component.treeStructure.hasNodeNextSibling(node)) {
            bottom = "Bottom";
        }
        return this.component.render("lineJoin" + bottom + "Icon", this._imageSet["join" + bottom]);
    },
    
    _renderExpandoElement: function(node, expandoElement) {
        if (node.isLeaf()) {
            var joinIcon = this._getJoinIcon(node);
            var joinFillImage = { url: joinIcon.url ? joinIcon.url : joinIcon, repeat: "no-repeat", x: "50%", y: 0 };
            Echo.Sync.FillImage.render(joinFillImage, expandoElement);
        } else {
            var toggleIcon = this._getToggleIcon(node);
            var toggleFillImage = { url: toggleIcon.url ? toggleIcon.url : toggleIcon, repeat: "no-repeat", x: "50%", y: 0 };
            Echo.Sync.FillImage.render(toggleFillImage, expandoElement);
        }
    },
    
    _hideNode: function(node, iterator) {
        var rowElement = iterator.nextRow(node);
        if (!rowElement || rowElement.style.display == "none") {
            return;
        }
        rowElement.style.display = "none";
        var childCount = node.getChildNodeCount();
        for (var i = 0; i < childCount; ++i) {
            var childNode = node.getChildNode(i);
            this._hideNode(childNode, iterator);
        }
    },
        
    /**
     * Renders border to element, only the sides provided in the sides argument will be applied.
     * <p>
     * If border is null, this method returns silently.
     * 
     * @param border the border to render
     * @param {Array} side names to render, (borderLeft/borderRight/borderTop/borderBottom)
     *          The elements of the array need not be ordered.
     * @param element the element to render border to
     */
    _applyBorder: function(border, sides, element) {
        if (!border) {
            return;
        }
        
        for (var i in sides) {
            Echo.Sync.Border.render(border, element, sides[i]);
        }
    },
    
    /**
     * Renders insets to element, only the sides provided in the sides argument will be applied.
     * 
     * @param {String} insets the insets to render, may not be null
     * @param {Array} sides the indices of the insets sides to render, possible values are:
     *          <ul>
     *              <li>top</li>
     *              <li>right</li>
     *              <li>bottom</li>
     *              <li>left</li>
     *          </ul>
     *          The elements of the array need not be ordered.
     * @param element the element to render insets to
     */
    _applyInsets: function(insets, sides, element) {
        var pixelInsets = Echo.Sync.Insets.toPixels(insets);
        for (var i = 0; i < sides.length; ++i) {
            var padding = Extras.Sync.RemoteTree._SIDE_TO_PADDING_MAP[sides[i]];
            element.style[padding] = pixelInsets[sides[i]] + "px";
        }
    },
    
    /**
     * Creates the row structure for node. The resulting row will be inserted in the current table element
     * (this._element) before insertBefore. If insertBefore is null, the row will be appended to the end
     * of the table.
     * 
     * @param {HTMLTableRowElement} insertBefore the row element to insert the resulting row before, if null
     *          the resulting row will be appended to the end of the table
     * @param {Extras.RemoteTree.TreeNode} node the node to create the row structure for
     * @param {Integer} depth the depth of this node, the root node has depth 1
     * 
     * @return an object containing three elements that were created in this method. The object
     *          the following elements:
     *          <ul>
     *              <li>trElement (the row element)</li>
     *              <li>tdElement (the cell element in which the node component is rendered (column 0))</li>
     *              <li>expandoElement (the cell element in which the expando icon is rendered, 
     *                                  this element is null for the header row)</li>
     *          </ul>
     * @type Object
     */
    _renderNodeRowStructure: function(insertBefore, node, depth) {
        var img;
        
        var isHeader = node == this.component.treeStructure.getHeaderNode();
        var trElement = document.createElement("tr");
        trElement.id = this.component.renderId + "_tr_" + node.getId();
        trElement.style.cursor = isHeader || !this._selectionEnabled ? "default" : "pointer";
        trElement.style.verticalAlign = "top";
        
        var nodeTable = document.createElement("table");
        nodeTable.style.borderCollapse = "collapse";
        nodeTable.style.cellPadding = "0px";
        nodeTable.style.cellSpacing = "0px";
        nodeTable.style.padding = "0px";
        nodeTable.appendChild(document.createElement("tbody"));
        var nodeRowElement = document.createElement("tr");
        
        if (!this._rootVisible || (!this._showsRootHandle && node != this.component.treeStructure.getRootNode())) {
            --depth;
        }
        var parentNode = this.component.treeStructure.getNode(node.getParentId());
        for (var c = 0; c < depth - 1; ++c) {
            var rowHeaderElement = document.createElement("td");
            rowHeaderElement.id = "tree_" + node.getId() + "_" + c;
            rowHeaderElement.style.padding = "0px";
            rowHeaderElement.style.width = "19px";
            img = document.createElement("img");
            img.src = this.client.getResourceUrl("Extras", "image/tree/Transparent.gif");
            img.style.width = "19px";
//            img.style.height = "10px";
            rowHeaderElement.appendChild(img);
    
            if (parentNode) {
                if (this._showLines && this.component.treeStructure.hasNodeNextSibling(parentNode) && this._imageSet.vertical) {
                    var verticalLineFillImage = { url: this._imageSet.vertical, repeat: "no-repeat", x: "50%", y: 0 };
                    Echo.Sync.FillImage.render(verticalLineFillImage, rowHeaderElement);
                }
                parentNode = this.component.treeStructure.getNode(parentNode.getParentId());
            }
            nodeRowElement.insertBefore(rowHeaderElement, nodeRowElement.firstChild);
        }
        
        var expandoElement;
        if (!isHeader && !(!this._showsRootHandle && node == this.component.treeStructure.getRootNode())) {
            expandoElement = document.createElement("td");
            expandoElement.id = "tree_" + node.getId() + "_expando";
            expandoElement.__ExtrasTreeCellType = "expando";
            expandoElement.style.padding = "0";
            expandoElement.style.width = "19px";
            expandoElement.style.textAlign = "center";
            img = document.createElement("img");
            img.src = this.client.getResourceUrl("Extras", "image/tree/Transparent.gif");
            img.style.width = "19px";
//            img.style.height = "10px";
            expandoElement.appendChild(img);
            nodeRowElement.appendChild(expandoElement);
        }
        
        var tdElement = document.createElement("td");
        tdElement.style.padding = "0px";
        trElement.appendChild(tdElement);
        var nodeCellElement = document.createElement("td");
        nodeCellElement.__ExtrasTreeCellType = "node";
        nodeRowElement.appendChild(nodeCellElement);
        nodeTable.firstChild.appendChild(nodeRowElement);
        tdElement.appendChild(nodeTable);
        tdElement.style.overflow = "hidden";
        
        trElement.firstChild.style.paddingLeft = this._effectBorderCompensation + "px";
        
        this._tbodyElement.insertBefore(trElement, insertBefore);
    
        var elements = {
            trElement: trElement,
            tdElement: nodeCellElement,
            expandoElement: expandoElement
        };
        if (!isHeader) {
            this._addEventListeners(elements);
        }
        
        return elements;
    },
    
    /**
     * Applies the default style for rowElement. This method renders the following css properties:
     * <ul>
     *  <li>foreground</li>
     *  <li>background</li>
     *  <li>backgroundImage</li>
     *  <li>border</li>
     *  <li>font</li>
     * </ul>
     * 
     * @param {HTMLTableRowElement} rowElement the row element to apply the style on
     */
    _setDefaultRowStyle: function(rowElement) {
        // HACKHACK
        this._setRolloverState(rowElement, false);
    },
    
    _resolvePropertyName: function(effect, propName, state) {
        if (effect && state) {
            return effect + propName.charAt(0).toUpperCase() + propName.substring(1);
        } else {
            return propName.charAt(0).toLowerCase() + propName.substring(1);
        }
    },
    
    _getProperty: function(propName, context, layoutData, onlyEffectProps) {
        var result;
        var effect = context.getDefaultEffect();
        var resolvedName = this._resolvePropertyName(effect, propName, false);
        while (!result && effect) {
            var state = context.isEffect(effect);
            var resolvedEffectName = this._resolvePropertyName(effect, propName, state);
            if (state) {
                result = this.component.render(resolvedEffectName);
            }
            effect = context.getEffect(effect);
        }
        if (!result && layoutData) {
            result = layoutData[resolvedName];
        }
        if (!result && !onlyEffectProps) {
            result = this.component.render(resolvedName);
        }
        return result;
    },
    
    /**
     * Creates a context object for rendering row styles.
     * 
     * @param {HTMLTableRowElement} rowElement the row element to apply the style on
     * @param {String} effect the most significant effect (the effect that should be
     *          rendered first, before trying the other effects)
     * @param {Boolean} state the effect state, true if the effect should be rendered, false if not
     */
    _createRowStyleContext: function(rowElement, effect, state) {
        var context = {
            rowElement: rowElement,
            effects: {},
            effectOrder: [],
            
            /**
             * Returns the default effect (the first effect of which the state is enabled)
             */
            getDefaultEffect: function() {
                for (var i = 0; i < this.effectOrder.length; i++) {
                    var effect = this.effectOrder[i];
                    if (this.isEffect(effect)) {
                        return effect;
                    }
                }
                return null;
            },
            
            /**
             * Gets the effect that should be applied after the given effect 
             */
            getEffect: function(effect) {
                var index;
                if (effect) {
                    index = Core.Arrays.indexOf(this.effectOrder, effect) + 1;
                } else {
                    index = 0;
                }
                return this.effectOrder[index];
            },
            
            /**
             * Checks if the given effect is enabled
             */
            isEffect: function(effect) {
                return this.effects[effect];
            },
            
            /**
             * Add an affect
             */
            addEffect: function(effect, state) {
                this.effectOrder.push(effect);
                this.effects[effect] = state;
            }
        };
        if (effect) {
            context.addEffect(effect, state == null ? true : state);
        }
        return context;
    },
    
    /**
     * Sets the style for rowElement. This method renders the following css properties:
     * <ul>
     *  <li>foreground</li>
     *  <li>background</li>
     *  <li>backgroundImage</li>
     *  <li>border</li>
     *  <li>font</li>
     * </ul>
     * 
     * @param {Object} context a context object created with #_createRowStyleContext()
     */
    _setRowStyle: function(context) {
        var node = this._getNodeFromElement(context.rowElement);
        var nodeComponent = this.component.application.getComponentByRenderId(node.getId());
        var nodeLayout = nodeComponent.render("layoutData");
        var effect = context.getDefaultEffect();
        var index = -1;
        var cellElement = context.rowElement.firstChild;
        var visitedNodeCell = false;
        while (cellElement) {
            visitedNodeCell = index > -1;
            var columnLayout;
            if (index > -1) {
                var columnComponent = this.component.application.getComponentByRenderId(node.getColumn(index));
                columnLayout = columnComponent.render("layoutData");
            } else {
                this._renderNodeCellInsets(cellElement, nodeLayout);
            }
            var layout = visitedNodeCell ? columnLayout : nodeLayout;
            var foreground = this._getProperty("foreground", context, layout);
            var background = this._getProperty("background", context, layout);
            var backgroundImage = this._getProperty("backgroundImage", context, layout);
            var border = this._getProperty("border", context, layout, true);
            Echo.Sync.Color.renderClear(foreground, cellElement, "color");
            Echo.Sync.Color.renderClear(background, cellElement, "backgroundColor");
            Echo.Sync.FillImage.renderClear(backgroundImage, cellElement);
            if (visitedNodeCell) {
                var insets;
                if (columnLayout) {
                    insets = columnLayout.insets;
                } else {
                    insets = this._defaultInsets;
                }
                Echo.Sync.Insets.render(insets, cellElement, "padding");
            }
            ++index;
            
            var font = this.component.render(this._resolvePropertyName(effect, "font", true));
            if (font || !effect) {
                Echo.Sync.Font.renderClear(null, cellElement);
                if (font) {
                    Echo.Sync.Font.renderClear(font, cellElement);
                }
            }
            
            // prevent text decoration for spacing cells, otherwise the nbsp will show up (underlined or striked through)
            if (!visitedNodeCell) {
                cellElement.style.textDecoration = "none";
            }
            
            if (!cellElement.firstChild) {
                cellElement.appendChild(document.createTextNode("\u00a0"));
            }
            
            cellElement = cellElement.nextSibling;
        }
        this._renderRowBorder(context);
    },
    
    /**
     * Renders a border to a whole row. Mimicks border collapse, setting border-collapse to collapse
     * causes bugs in Firefox, and the border would add to the total size of the table.
     */
    _renderRowBorder: function(context, override) {
        if (!this._effectBorderRows) {
            this._effectBorderRows = new Core.Arrays.LargeMap();
        }
        var effectBorder = this._getProperty("border", context, null, true);
        var defaultBorder = this.component.render("border");
        var hadEffect = this._effectBorderRows.map[context.rowElement.id];
        if (effectBorder) {
            var node = this._getNodeFromElement(context.rowElement);
            this._effectBorderRows.map[context.rowElement.id] = true;
        } else {
            if (hadEffect) {
                this._effectBorderRows.remove(context.rowElement.id);
            }
        }
        var prevRowHasEffect;
        if (context.rowElement.previousSibling) {
            prevRowHasEffect = this._effectBorderRows.map[context.rowElement.previousSibling.id];
        }
        if (!prevRowHasEffect && context.rowElement.previousSibling && (effectBorder || hadEffect)) {
            var prevRowContext = this._createRowStyleContext(context.rowElement.previousSibling);
            this._renderRowBorder(prevRowContext, effectBorder != null);
        }
        var cellE = context.rowElement.firstChild;
        while (cellE) {
            Echo.Sync.Border.renderClear(null, cellE);
            this._renderBorder(cellE, defaultBorder, true, false, override);
            this._renderBorder(cellE, effectBorder, false, true);
            cellE = cellE.nextSibling;
        }
        var compensation = this._effectBorderCompensation;
        if (effectBorder) {
            var currentCompensation = Echo.Sync.Border.getPixelSize(effectBorder, "left");
            if (currentCompensation === 0) {
                compensation = 0;
            } else {
                compensation -= currentCompensation;
            }
        }
        context.rowElement.firstChild.style.paddingLeft = compensation + "px";
    },
    
    _renderBorder: function(cellElement, border, renderCellBorders, override, overrideBottom) {
        var sides = [];
        if (override || cellElement.parentNode.previousSibling) {
            sides.push("borderTop");
        }
        if (override || overrideBottom) {
            sides.push("borderBottom");
        }
        if (override && !cellElement.previousSibling) {
            sides.push("borderLeft");
        }
        if ((override && !cellElement.nextSibling) || (renderCellBorders && cellElement.nextSibling)) {
            sides.push("borderRight");
        }
        this._applyBorder(border, sides, cellElement);
    },
    
    _renderNodeCellInsets: function(cellElement, nodeLayout) {
        // Special handling for the first cell in a row (the 'node cell')
        // because the node is rendered as a table within the td
        var insets;
        if (nodeLayout) {
            insets = nodeLayout.insets;
        } else {
            insets = this._defaultInsets;
        }
        var subRow = cellElement.firstChild.firstChild.firstChild; // cellElement.table.tbody.tr
        var subCell = subRow.firstChild; 
        while (subCell) {
            // don't render insets on expando cell, would result in gapped lines
            if (subCell.__ExtrasTreeCellType != "expando") {
                if (subCell == subRow.firstChild && subCell == subRow.lastChild) {
                    this._applyInsets(insets, ["top", "right", "left", "bottom"], subCell);
                } else if (subCell == subRow.firstChild) {
                    this._applyInsets(insets, ["top", "bottom", "left"], subCell);
                } else if (subCell != subRow.lastChild) {
                    this._applyInsets(insets, ["top", "bottom"], subCell);
                } else if (subCell == subRow.lastChild) {
                    this._applyInsets(insets, ["top", "bottom", "right"], subCell);
                }
            }
            subCell = subCell.nextSibling;
        }
    },
    
    /**
     * Sets the selection state for the given node.
     * 
     * @param {Extras.RemoteTree.TreeNode} node the node to set the selection state for
     * @param {Boolean} selectionState the new selection state of node
     * @param {HTMLTableRowElement} rowElement (optional) the row element node is rendered to,
     *          if not provided this method will look it up automatically.
     */
    _setSelectionState: function(node, selectionState, rowElement) {
        if (!rowElement) {
            rowElement = this._getRowElementForNode(node);
        }
        this.selectionModel.setSelectionState(node, selectionState);
        var context = this._createRowStyleContext(rowElement, "selection", selectionState);
        this._setRowStyle(context);
    },
    
    /**
     * Deselects all selected rows.
     */
    _clearSelected: function() {
        var selected = this.selectionModel.getSelectedNodes();
        while (selected.length > 0) {
            this._setSelectionState(selected[0], false);
        }
    },
    
    /**
     * Sets the selection state based on the given selection property value.
     *
     * @param {String} value the value of the selection property
     * @param {Boolean} clearPrevious if the previous selection state should be overwritten
     */
    _setSelectedFromProperty: function(value, clearPrevious) {
        var selectedIds = value.split(",");
        if (this.selectionModel.equalsSelectionIdArray(selectedIds)) {
            return;
        }
        if (clearPrevious) {
            this._clearSelected();
        }
        for (var i = 0; i < selectedIds.length; i++) {
            if (selectedIds[i] === "") {
                continue;
            }
            var node = this.component.treeStructure.getNode(selectedIds[i]);
            this._setSelectionState(node, true);
        }
    },
    
    /**
     * Renders the rollover state for the given row element. If rolloverState is false,
     * and the node is selected, the selected state will be rendered.
     * 
     * @param {HTMLTableRowElement} rowElement the element to render the rollover state to
     * @param {Boolean} rolloverState true if the rollover state should be rendered, false
     *          for the default (or selection) state
     */
    _setRolloverState: function(rowElement, rolloverState) {
        var node = this._getNodeFromElement(rowElement);
        var context = this._createRowStyleContext(rowElement, "rollover", rolloverState);
        if (this._selectionEnabled && this.selectionModel.isNodeSelected(node)) {
            context.addEffect("selection", true);
        }
        this._setRowStyle(context);
    },
    
    /**
     * Gets the node that is rendered to the given element.
     * If the given element is not a tr, this method will walk upwards through the 
     * hierarchy until a tr element is found, it will then use that element
     * to find the node rendered to that tr.
     */
    _getNodeFromElement: function(element) {
        var id = element.id;
        var nodeId;
        if (id.indexOf("_tr_") == -1) {
            var e = element;
            while ((e = e.parentNode)) {
                if (e.nodeName.toLowerCase() == "tr") {
                    return this._getNodeFromElement(e);
                }
            }
        } else {
            nodeId = id.substring(id.indexOf("_tr_") + 4);
        }
        return this.component.treeStructure.getNode(nodeId);
    },
    
    /**
     * Gets the row element the node is rendered to.
     * 
     * @param {Extras.RemoteTree.TreeNode} node the node to get the row element for
     * 
     * @return the row element
     * @type HTMLTableRowElement  
     */
    _getRowElementForNode: function(node) {
        var testId = this.component.renderId + "_tr_" + node.getId();
        var rowElement = document.getElementById(testId);
        if (rowElement) {
            return rowElement;
        }
        // the table element is not yet added to the dom structure, iterate over the rows.
        var iterator = this._elementIterator();
        rowElement = iterator.nextRow();
        while (rowElement) {
            if (rowElement.id == testId) {
                return rowElement;
            }
            rowElement = iterator.nextRow();
        }
        return null;
    },
    
    /**
     * Gets the visible row index of node. If node is not visible, -1 is returned.
     * 
     * @param {Extras.RemoteTree.TreeNode} node the node to get the row index for
     * 
     * @return the row index
     * @type Integer 
     */
    _getRowIndexForNode: function(node) {
        var testElement = this._tbodyElement.firstChild;
        
        var index = this._headerVisible ? -1 : 0;
        while (testElement) {
            if (testElement.id == this.component.renderId + "_tr_" + node.getId()) {
                if (index != -1 && !this._rootVisible && this._headerVisible) {
                    ++index;
                }
                return index;
            }
            testElement = testElement.nextSibling;
            if (testElement.style.display != "none") {
                // non-expanded nodes should not be taken into account
                ++index;
            }
        }
        return null;
    },
    
    /**
     * Gets the visible row index of element. If element is not visible, -1 is returned.
     * 
     * @param {HTMLTableRowElement} element the row element to get the row index for
     * 
     * @return the row index
     * @type Integer 
     */
    _getRowIndex: function(element) {
        if (element.style.display == "none") {
            return null;
        }
        var testElement = this._tbodyElement.firstChild;
        
        var index = this._headerVisible ? -1 : 0;
        while (testElement) {
            if (testElement == element) {
                if (index != -1 && !this._rootVisible && this._headerVisible) {
                    ++index;
                }
                return index;
            }
            testElement = testElement.nextSibling;
            if (testElement.style.display != "none") {
                // non-expanded nodes should not be taken into account
                ++index;
            }
        }
        return null;
    },
    
    _addEventListeners: function(elements) {
        var expansionRef = Core.method(this, this._expansionHandler);
        var selectionRef = Core.method(this, this._selectionHandler);
        
        if (this._selectionEnabled) {
            Core.Web.Event.add(elements.trElement, "click", selectionRef, false);
            Core.Web.Event.Selection.disable(elements.trElement);
        }
        if (elements.expandoElement) {
            Core.Web.Event.add(elements.expandoElement, "click", expansionRef, false);
        }
        Core.Web.Event.add(elements.tdElement, "click", expansionRef, false);
        
        if (this._selectionEnabled || this._rolloverEnabled) {
            var mouseEnterLeaveSupport = Core.Web.Env.PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED;
            var enterEvent = mouseEnterLeaveSupport ? "mouseenter" : "mouseover";
            var exitEvent = mouseEnterLeaveSupport ? "mouseleave" : "mouseout";
            var rolloverEnterRef = Core.method(this, this._processRolloverEnter);
            var rolloverExitRef = Core.method(this, this._processRolloverExit);
            
            if (this._rolloverEnabled) {
                Core.Web.Event.add(elements.trElement, enterEvent, rolloverEnterRef, false);
                Core.Web.Event.add(elements.trElement, exitEvent, rolloverExitRef, false);
            }
        }
    },
    
    _doExpansion: function(node, e) {
        if (node.isLeaf()) {
            return false;
        }
        if (node.isExpanded() && e.registeredTarget.__ExtrasTreeCellType == "node") {
            // only collapse when the expando element is clicked
            // this behavior is consistent with at least Windows Explorer and qooxdoo tree
            return false;
        } 
        if (node.isExpanded()) {
            node.setExpanded(false);
            // no other peers will be called, so update may be null
            this._renderNode(null, node);
        } else if (node.getChildNodeCount() > 0) {
            // we already have the children of this node, expand and render direct
            node.setExpanded(true);
            // no other peers will be called, so update may be null
            this._renderNode(null, node);
        }
        
        // Hack to make sure FF renders the whole table after expanding / collapsing a node
        if (Core.Web.Env.BROWSER_FIREFOX && Core.Web.Env.BROWSER_VERSION_MAJOR == 3 && Core.Web.Env.BROWSER_VERSION_MINOR === 0) {
            var elem = this._buggerTBody;
            var oldDisplay = elem.style.display;
            elem.style.display = "";
            setTimeout(function() {
                elem.style.display = oldDisplay;
            }, 0);
        }
        // hack ends here
        
        var rowIndex = this._getRowIndexForNode(node);
        // make sure the property is sent to the server, it might be better to use an action for this
        // but we also want to send a selection of the just expanded node.
        this.component.set("expansion", -1);
        this.component.set("expansion", rowIndex);
        return true;
    },
    
    _doSelection: function(node, e) {
        var trElement = this._getRowElementForNode(node);
        var rowIndex = this._getRowIndexForNode(node);
        
        Core.Web.DOM.preventEventDefault(e);
        
        var update = new Extras.RemoteTree.SelectionUpdate();
        
        var specialKey = e.shiftKey || e.ctrlKey || e.metaKey || e.altKey;    
        if (!this.selectionModel.isSelectionEmpty() && (this.selectionModel.isSingleSelection() || !(specialKey))) {
            update.clear = true;
            this._clearSelected();
        }
    
        if (!this.selectionModel.isSingleSelection() && e.shiftKey && this.lastSelectedNode) {
            if (this.lastSelectedNode.equals(node)) {
                return;
            }
            var startNode;
            var endNode;
            var lastSelectedIndex = this._getRowIndexForNode(this.lastSelectedNode);
            if (lastSelectedIndex < rowIndex) {
                startNode = this.lastSelectedNode;
                endNode = node;
            } else {
                startNode = node;
                endNode = this.lastSelectedNode;
            }
            
            var iterator = this.component.treeStructure.iterator(startNode, false, endNode);
            var i = lastSelectedIndex < rowIndex ? lastSelectedIndex : rowIndex;
            trElement = this._getRowElementForNode(startNode);
            while (iterator.hasNext()) {
                node = iterator.nextNode();
                this._setSelectionState(node, true, trElement);
                update.addSelection(i++);
                do {
                    trElement = trElement.nextSibling;
                } while (trElement && trElement.style.display == "none");
            }
        } else {
            this.lastSelectedNode = node;
            var selected = !this.selectionModel.isNodeSelected(node);
            if (selected || !update.clear) {
                this._setSelectionState(node, selected, trElement);
            }
            if (selected) {
                update.addSelection(rowIndex);
            } else if (!update.clear) {
                update.removeSelection(rowIndex);
            }
        }
        
        this.component.set("selectionUpdate", update);
        return true;
    },
    
    _expansionHandler: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return;
        }
        var node = this._getNodeFromElement(e.registeredTarget);
        this._doExpansion(node, e);
        var type = e.registeredTarget.__ExtrasTreeCellType;
        if (this._selectionEnabled && type && type != "expando") {
            this._doSelection(node, e);
        }
        this.component.doAction();
        return false;
    },
    
    _selectionHandler: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return;
        }
        var node = this._getNodeFromElement(e.registeredTarget);
        this._doSelection(node, e);
        this.component.doAction();
        return false;
    },
    
    _processRolloverEnter: function(e) {
        if (!this.client || !this.client.verifyInput(this.component) || Core.Web.dragInProgress) {
            return;
        }
        this._setRolloverState(e.registeredTarget, true);
    },
    
    _processRolloverExit: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return;
        }
        this._setRolloverState(e.registeredTarget, false);
    },
    
    renderDispose: function(update) {
        //FIXME this might blow up performance, maybe cache all elements that have a click listener, 
        // but that will probably blow memory usage...
        var it = this._elementIterator();
        var row;
        while ((row = it.nextRow())) {
            Core.Web.Event.removeAll(row);
            var e = it.currentNodeElement();
            if (e) {
                Core.Web.Event.removeAll(e);
            }
            e = it.currentExpandoElement();
            if (e) {
                Core.Web.Event.removeAll(e);
            }
        }
        this._effectBorderRows = null;
        this._prevMaxDepth = null;
        //this.component.treeStructure = null;
        this._tbodyElement = null;
        this._element = null;
    },
    
    renderUpdate: function(update) {
        var propertyNames = update.getUpdatedPropertyNames();
        // remove properties that are only changed on the client
        Core.Arrays.remove(propertyNames, "expansion");
        Core.Arrays.remove(propertyNames, "selectionUpdate");
        if (propertyNames.length === 0 && !update.getRemovedChildren()) {
            return false;
        }
        // end of the hack
        
        var treeStructureUpdate = update.getUpdatedProperty("treeStructure");
        var fullStructure = (treeStructureUpdate && treeStructureUpdate.newValue && 
                treeStructureUpdate.newValue.fullRefresh);
        if (!fullStructure) {
            // removal of children indicates that the tree was invalidated, 
            // and thus all components are re-rendered, and the tree structure we have at the client 
            // is no longer valid.
            if (treeStructureUpdate && treeStructureUpdate.newValue) {
                // tree structure updates are always partial, even when there are other updates we can't handle
                this._renderTreeStructureUpdate(treeStructureUpdate.newValue, update);
            }
            
            if (Core.Arrays.containsAll(Extras.Sync.RemoteTree._supportedPartialProperties, 
                    propertyNames, true)) {
                var selection = update.getUpdatedProperty("selection");
                if (selection && this._selectionEnabled) {
                    this._setSelectedFromProperty(selection.newValue, true);
                }
                
                // partial update
                return false;
            }
        } else {
            // we have a full structure property sent down from the server, reset current structure
            this.component.treeStructure = null;
        }
        
        var element = this._element;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        
        return true;
    },
    
    _mergeTreeStructureUpdate: function(treeStructureUpdate) {
        var nodes = [];
        var structs = treeStructureUpdate;
        for (var i = 0; i < structs.length; ++i) {
            var struct = structs[i]; 
            var updateRootNode = struct.getRootNode();
            var node = this.component.treeStructure.getNode(updateRootNode.getId());
            if (node) {
                this.component.treeStructure.addOrUpdateChildNodes(updateRootNode);
                node.setExpanded(updateRootNode.isExpanded());
            } else {
                node = this.component.treeStructure.getNode(updateRootNode.getParentId());
                node.setExpanded(true);
                this.component.treeStructure.addOrUpdateNode(updateRootNode);
            }
            nodes.push(node);
        }
        return nodes;
    },
    
    _renderTreeStructureUpdate: function(treeStructureUpdate, update) {
        var nodes = this._mergeTreeStructureUpdate(treeStructureUpdate);
        for (var i = 0; i < nodes.length; ++i) {
            var node = nodes[i];
            this._renderNode(update, node);
        }
    }
});
