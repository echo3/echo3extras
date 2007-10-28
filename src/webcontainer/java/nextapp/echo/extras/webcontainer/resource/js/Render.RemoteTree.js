/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2007 NextApp, Inc.
 *
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 */
 
/**
 * Component rendering peer: Tree (Remote)
 */
ExtrasRender.ComponentSync.RemoteTree = Core.extend(EchoRender.ComponentSync, {

    $static: {
        _BORDER_SIDE_STYLE_NAMES: ["borderTop", "borderRight", "borderBottom", "borderLeft"],
        
        LINE_STYLE_NONE: 0,
        LINE_STYLE_SOLID: 1,
        LINE_STYLE_DOTTED: 2,
    
        _supportedPartialProperties: ["treeStructure", "selection"]
    },
    
    $staticConstruct: function() {
        EchoRender.registerPeer("nextapp.echo.extras.app.RemoteTree", this);
    },

    /**
     * Gets an URI for default tree images
     * 
     * @param {String} identifier the image identifier
     * @return the image URI
     * @type {String}
     */
    _getImageUri: function(identifier) {
    	// FIXME abstract this somehow so it works with FreeClient too
    	return "?sid=Echo.Image&iid=EchoExtras.Tree." + identifier;
    },
    
    renderAdd: function(update, parentElement) {
        this._lineStyle = this.component.getRenderProperty("lineStyle", 2);
        this._showLines = this._lineStyle != ExtrasRender.ComponentSync.RemoteTree.LINE_STYLE_NONE;
        if (this._showLines) {
            var lineImageIdSuffix = this._lineStyle == ExtrasRender.ComponentSync.RemoteTree.LINE_STYLE_SOLID ? "Solid" : "Dotted";
            this.verticalLineImage = this._getImageUri("lineVertical" + lineImageIdSuffix);
            this.horizontalLineImage = this._getImageUri("lineHorizontal" + lineImageIdSuffix);
        }
        this._showsRootHandle = this.component.getRenderProperty("showsRootHandle", false);
        this._rootVisible = this.component.getRenderProperty("rootVisible", true);
        this._headerVisible = this.component.getRenderProperty("headerVisible", false);
        this._rolloverEnabled = this.component.getRenderProperty("rolloverEnabled");
        this._selectionEnabled = this.component.getRenderProperty("selectionEnabled");
        if (this._selectionEnabled) {
            this.selectionModel = new ExtrasApp.TreeSelectionModel(parseInt(this.component.getProperty("selectionMode")));
        }
        
        this._defaultInsets = this.component.getRenderProperty("insets");
        if (!this._defaultInsets) {
            this._defaultInsets = new EchoApp.Insets(0);
        }
        this._defaultCellPadding = EchoAppRender.Insets.toCssValue(this._defaultInsets);
        
        var tableElement = document.createElement("table");
        this._element = tableElement;
        this._element.id = this.component.renderId;
        tableElement.style.borderCollapse = "collapse";
        EchoAppRender.Border.renderComponentProperty(this.component, "border", null, tableElement);
        
        var tbodyElement = document.createElement("tbody");
        tableElement.appendChild(tbodyElement);
        this._tbodyElement = tbodyElement;
        
        if (!this._treeStructure) {
            this._treeStructure = this.component.getProperty("treeStructure")[0];
        }
        this.columnCount = this.component.getProperty("columnCount");
        
        if (this._headerVisible) {
            this._renderNode(update, this._treeStructure.getHeaderNode());
        }
        var rootNode = this._treeStructure.getRootNode();
        this._renderNode(update, rootNode);
        
        parentElement.appendChild(tableElement);
    
        var selection = this.component.getRenderProperty("selection");
        if (selection && this._selectionEnabled) {
            this._setSelectedFromProperty(selection);
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
             * found that node is rendered to.
             */
            nextRow : function(node) {
                var result = this._nextRow();
                if (!node) {
                    return result;
                }
                var id = component.renderId + "_tr_" + node.getId();
                while (result && result.id != id) {
                    result = this._nextRow();
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
            
            nextNodeElement : function() {
                this.nextRow();
                if (!this.rowElement) {
                    return null;
                }
                return this.currentNodeElement();
            },
            
            currentNodeElement : function() {
                var cellElement = this.rowElement.firstChild;
                while (cellElement) {
                    if (cellElement.__ExtrasTreeCellType == "node") {
                        return cellElement;
                    }
                    cellElement = cellElement.nextSibling;
                }
                return null;
            },
    
            currentExpandoElement : function() {
                var cellElement = this.rowElement.firstChild;
                while (cellElement) {
                    if (cellElement.__ExtrasTreeCellType == "expando") {
                        return cellElement;
                    }
                    cellElement = cellElement.nextSibling;
                }
                return null;
            }
        };
    },
    
    _renderNode: function(update, node) {
        var rowElement = this._getRowElementForNode(node);
        var nodeDepth = this._treeStructure.getNodeDepth(node);
        
        var insertBefore = null;
        if (rowElement) {
            insertBefore = rowElement.nextSibling;
        }
    
        var nodeSibling = this._treeStructure.getNodeNextSibling(node, true);
        var endRow = null;
        if (nodeSibling) {
            endRow = this._getRowElementForNode(nodeSibling);
        }
        var iterator = this._elementIterator(rowElement, endRow);
        this._renderNodeRecursive(update, node, iterator, nodeDepth, insertBefore);
        
        this._updateSpans(node);
    },
    
    _renderNodeRecursive: function(update, node, iterator, depth, insertBefore, visible) {
        if (visible == null) {
            visible = true;
        }
        if (!this._rootVisible && node == this._treeStructure.getRootNode()) {
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
            EchoRender.renderComponentAdd(update, component, tdElement);
            
            if (this.columnCount > 1) {
                for (var c = 0; c < this.columnCount - 1; ++c) {
                    var columnElement = document.createElement("td");
                    EchoAppRender.Border.renderComponentProperty(this.component, "border", null, columnElement);
                    EchoAppRender.Insets.renderPixel(this._defaultInsets, columnElement, "padding");
                    
                    var columnComponent = this.component.application.getComponentByRenderId(node.getColumn(c));
                    EchoRender.renderComponentAdd(update, columnComponent, columnElement);
                    
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
        for (var i = 0; i < childCount; ++i) {
            var childNode = node.getChildNode(i);
            if (expanded || !rendered) {
                this._renderNodeRecursive(update, childNode, iterator, depth + 1, insertBefore, expanded);
            } else {
                // child node should not be visible
                this._hideNode(childNode, iterator);
            }
        }
    },
    
    _getImage: function(property, defaultImageName) {
        var image = this.component.getRenderProperty(property);
        if (!image) {
            image = new EchoApp.ImageReference(this._getImageUri(defaultImageName ? defaultImageName : property));
        }
        return image;
    },
    
    _getIconLineStyleSuffix: function() {
        switch (this._lineStyle) {
            case ExtrasRender.ComponentSync.RemoteTree.LINE_STYLE_NONE:
                return "";
            case ExtrasRender.ComponentSync.RemoteTree.LINE_STYLE_SOLID:
                return "Solid";
            case ExtrasRender.ComponentSync.RemoteTree.LINE_STYLE_DOTTED:
                return "Dotted";
        }
    },
    
    _getToggleIcon: function(node) {
        var imageSuffix = this._getIconLineStyleSuffix();
        var bottom = "";
        if (this._showLines && !this._treeStructure.hasNodeNextSibling(node)) {
            bottom = "Bottom";
        }
        if (node.isExpanded()) {
            return this._getImage("nodeOpen" + bottom + "Icon", "nodeOpen" + bottom + imageSuffix);
        } else {
            return this._getImage("nodeClosed" + bottom + "Icon", "nodeClosed" + bottom + imageSuffix);
        }
    },
    
    _getJoinIcon: function(node) {
        var imageSuffix = this._getIconLineStyleSuffix();
        var bottom = "";
        if (!this._treeStructure.hasNodeNextSibling(node)) {
            bottom = "Bottom";
        }
        return this._getImage("lineJoin" + bottom + "Icon", "lineJoin" + bottom + imageSuffix);
    },
    
    _renderExpandoElement: function(node, expandoElement) {
        if (node.isLeaf()) {
            var joinIcon = this._getJoinIcon(node);
            var joinFillImage = new EchoApp.FillImage(joinIcon, EchoApp.FillImage.NO_REPEAT);
            EchoAppRender.FillImage.render(joinFillImage, expandoElement);
        } else {
            var toggleIcon = this._getToggleIcon(node);
            var toggleFillImage = new EchoApp.FillImage(toggleIcon, EchoApp.FillImage.NO_REPEAT);
            EchoAppRender.FillImage.render(toggleFillImage, expandoElement);
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
     * Creates a multisided border based on the given border. If the provided border is not
     * multisided, a new border will be created with the values set to one side. If the border
     * is multisided, no new border will be created.
     * <p>
     * If border is null, this method returns silently.
     * 
     * @param {EchoApp.Border} border the border
     * 
     * @return the resulting multisided border
     * @type EchoApp.Border
     */
    _createMultiSidedBorder: function(border) {
        if (!border) {
            return null;
        }
        
        if (border.multisided) {
            return border;
        } else {
            var side = new EchoApp.Border.Side();
            side.size = border.size;
            side.style = border.style;
            side.color = border.color;
            return new EchoApp.Border([side]);
        }
    },
    
    /**
     * Renders border to element, only the sides provided in the sides argument will be applied.
     * <p>
     * If border is null, this method returns silently.
     * 
     * @param {EchoApp.Border} border the border to render
     * @param {Array} sides the indices of the border sides to render, possible values are:
     *          <ul>
     *              <li>0 (top)</li>
     *              <li>1 (right)</li>
     *              <li>2 (bottom)</li>
     *              <li>3 (left)</li>
     *          </ul>
     *          The elements of the array need not be ordered.
     * @param element the element to render border to
     */
    _applyBorder: function(border, sides, element) {
        if (!border) {
            return;
        }
        
        for (var i in sides) {
            var index = sides[i];
            if (border.sides.length == 1) {
                index = 0;
            } else if (index == 2 && border.sides.length <= 2) {
                index = 0;
            } else if (index == 3 && border.sides.length <= 3) {
                index = 1;
            }
            EchoAppRender.Border.renderSide(border.sides[index], element, 
                    ExtrasRender.ComponentSync.RemoteTree._BORDER_SIDE_STYLE_NAMES[sides[i]]);
        }
    },
    
    /**
     * Renders insets to element, only the sides provided in the sides argument will be applied.
     * 
     * @param {EchoApp.Insets} insets the insets to render, may not be null
     * @param {Array} sides the indices of the insets sides to render, possible values are:
     *          <ul>
     *              <li>0 (top)</li>
     *              <li>1 (right)</li>
     *              <li>2 (bottom)</li>
     *              <li>3 (left)</li>
     *          </ul>
     *          The elements of the array need not be ordered.
     * @param element the element to render insets to
     */
    _applyInsets: function(insets, sides, element) {
        var newValues = [];
        var setInset = function(side, value) {
            switch (side) {
                case 0:
                    newValues[0] = value ? value : insets.top;
                    break;
                case 1:
                    newValues[1] = value ? value : insets.right;
                    break;
                case 2:
                    newValues[2] = value ? value : insets.bottom;
                    break;
                case 3:
                    newValues[3] = value ? value : insets.left;
                    break;
            }
        };
        for (var i = 0; i < 4; ++i) {
            if (!insets || Core.Arrays.indexOf(sides, i) == -1) {
                setInset(i, new EchoApp.Extent(0, "px"));
            } else {
                setInset(i, null);
            }
        }
        var newInsets = new EchoApp.Insets(newValues);
        EchoAppRender.Insets.renderPixel(newInsets, element, "padding");
    },
    
    /**
     * Creates the row structure for node. The resulting row will be inserted in the current table element
     * (this._element) before insertBefore. If insertBefore is null, the row will be appended to the end
     * of the table.
     * 
     * @param {HTMLTableRowElement} insertBefore the row element to insert the resulting row before, if null
     *          the resulting row will be appended to the end of the table
     * @param {ExtrasApp.RemoteTree.TreeNode} node the node to create the row structure for
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
        var trElement = document.createElement("tr");
        trElement.id = this.component.renderId + "_tr_" + node.getId();
        
        var border = this._createMultiSidedBorder(this.component.getRenderProperty("border"));
        var insets = this._defaultInsets;
    
        if (!this._rootVisible || (!this._showsRootHandle && node != this._treeStructure.getRootNode())) {
            --depth;
        }
        var parentNode = this._treeStructure.getNode(node.getParentId());
        for (var c = 0; c < depth - 1; ++c) {
            var rowHeaderElement = document.createElement("td");
            rowHeaderElement.style.padding = "0";
            rowHeaderElement.style.width = "19px";
            
            // apply top and bottom border style
            this._applyBorder(border, [0, 2], rowHeaderElement);
    
            if (parentNode) {
                if (this._showLines && this._treeStructure.hasNodeNextSibling(parentNode)) {
                    var verticalLineFillImage = new EchoApp.FillImage(this.verticalLineImage, EchoApp.FillImage.REPEAT_VERTICAL, "50%", 0);
                    this._applyInsets(this._defaultInsets, [0, 2], rowHeaderElement);
                    EchoAppRender.FillImage.render(verticalLineFillImage, rowHeaderElement);
                }
                parentNode = this._treeStructure.getNode(parentNode.getParentId());
            }
            trElement.insertBefore(rowHeaderElement, trElement.firstChild);
        }
        
        var isHeader = node == this._treeStructure.getHeaderNode();
        var expandoElement;
        if (!isHeader && !(!this._showsRootHandle && node == this._treeStructure.getRootNode())) {
            expandoElement = document.createElement("td");
            expandoElement.__ExtrasTreeCellType = "expando";
            // apply border and bottom style
            this._applyBorder(border, [0, 2], expandoElement);
            expandoElement.style.padding = "0";
            expandoElement.style.width = "19px";
            expandoElement.style.textAlign = "center";
            trElement.appendChild(expandoElement);
        }
        
        var tdElement = document.createElement("td");
        tdElement.__ExtrasTreeCellType = "node";
        trElement.appendChild(tdElement);
    
        if (tdElement == trElement.firstChild) {
            // apply border, bottom and right style
            this._applyBorder(border, [0,1,2,3], tdElement);
            this._applyInsets(insets, [0,1,2,3], tdElement);
        } else {
            this._applyBorder(border, [0,1,2], tdElement);
            this._applyInsets(insets, [0,1,2], tdElement);
            
            // apply border left side
            this._applyBorder(border, [3], trElement.firstChild);
            this._applyInsets(insets, [3], trElement.firstChild);
        }   
        
        this._tbodyElement.insertBefore(trElement, insertBefore);
    
        var elements = {
            trElement: trElement,
            tdElement: tdElement,
            expandoElement: expandoElement
        };
        if (!isHeader) {
            this._addEventListeners(elements);
        }
        
        return elements;
    },
    
    /**
     * Updates the column spans of the node cell element. This ensures all subsequent columns
     * will be lined out correctly.
     * <p>
     * If the maximum depth (depth of the deepest visible node) is changed, all nodes will be 
     * updated (including the header), if not, only the changed node 
     * and the nodes below will be updated.
     * 
     * @param {ExtrasApp.RemoteTree.TreeNode} node the changed node, if node is the header node
     *          nothing is done. 
     */
    _updateSpans: function(node) {
        // update the col spans of the node cells
        if (node == this._treeStructure.getHeaderNode()) {
            // don't touch the spans if only the header node is re-rendered
            return;
        }
        var maxDepth = this._treeStructure.getMaxDepth();
        if (!this._rootVisible) {
            --maxDepth;
        }
        var tbodyElement = this._tbodyElement;
        // iterator object for easy navigating through the tree structure
        var iterator = this._elementIterator(tbodyElement.firstChild);
        var startNode;
        if (this._prevMaxDepth == maxDepth) {
            // no need to traverse the whole tree, update only changed nodes
            startNode = node;
        } else {
            // max depth has changed, update all nodes
            startNode = this._treeStructure.getRootNode();
            if (this._headerVisible) {
                // the header node is not part of the tree node structure, so it needs to be handled separately
                this._updateSpansRecursive(this._treeStructure.getHeaderNode(), maxDepth, iterator);
            }
        }
        // find the row to start with. The table element may not have been added to the DOM, 
        // so navigate it's children to find the correct row.
        var element = this._getRowElementForNode(startNode);
        if (element) {
            iterator.startRow = element;
        } else {
            while (iterator.startRow) {
                if (iterator.startRow.id == this.component.renderId + "_tr_" + startNode.getId()) {
                    break;
                }
                iterator.startRow = iterator.startRow.nextSibling;
            }
        }
        
        this._updateSpansRecursive(startNode, maxDepth, iterator);
        this._prevMaxDepth = maxDepth;
    },
    
    _updateSpansRecursive: function(startNode, maxDepth, iterator) {
        var depth = this._treeStructure.getNodeDepth(startNode);
        if (!this._rootVisible) {
            --depth;
        }
        var span = maxDepth - depth + 1;
        if (startNode == this._treeStructure.getHeaderNode() && this._rootVisible && this.showsRootHandle) {
            // the header row has no expando cell, it needs to span one extra column
            ++span;
        }
        if (this._rootVisible || startNode != this._treeStructure.getRootNode()) {
            do {
                var nodeElement = iterator.nextNodeElement();
            } while (iterator.rowElement.style.display == "none")
            if (!nodeElement) {
                return;
            }
            nodeElement.colSpan = span;
        }
        
        if (!startNode.isExpanded()) {
            return;
        }
        
        var childCount = startNode.getChildNodeCount();
        for (var i = 0; i < childCount; ++i) {
            var childNode = startNode.getChildNode(i);
            this._updateSpansRecursive(childNode, maxDepth, iterator);
        }
    },
    
    /**
     * Applies the default style for rowElement. This method renders the following css properties:
     * <ul>
     *  <li>foreground</li>
     *  <li>background</li>
     *  <li>backgroundImage</li>
     *  <li>font</li>
     * </ul>
     * 
     * @param {HTMLTableRowElement} rowElement the row element to apply the style on
     */
    _setDefaultRowStyle: function(rowElement) {
        // HACKHACK
        this._setRowStyle(rowElement, "rollover", false);
    },
    
    /**
     * Sets the style for rowElement. This method renders the following css properties:
     * <ul>
     *  <li>foreground</li>
     *  <li>background</li>
     *  <li>backgroundImage</li>
     *  <li>font</li>
     * </ul>
     * 
     * @param {HTMLTableRowElement} rowElement the row element to apply the style on
     * @param {Boolean} state the effect state, true if the effect should be rendered, false if not
     * @param {String} prefix the prefix used for the component properties. For example, when rendering
     *          a rollover effect prefix should be "rollover", this will result in rendering of 
     *          "rolloverForeground"
     */
    _setRowStyle: function(rowElement, state, prefix) {
        var foreground = EchoAppRender.getEffectProperty(this.component, "foreground", prefix + "Foreground", state);
        var background = EchoAppRender.getEffectProperty(this.component, "background", prefix + "Background", state);
        var backgroundImage = EchoAppRender.getEffectProperty(this.component, "backgroundImage", prefix + "BackgroundImage", state);
        var font = EchoAppRender.getEffectProperty(this.component, "font", prefix + "Font", state);
        
        var cellElement = rowElement.firstChild;
        var visitedNodeCell = false;
        while (cellElement) {
            visitedNodeCell |= cellElement.__ExtrasTreeCellType == "node";
            if (visitedNodeCell) {
                EchoAppRender.Color.renderClear(foreground, cellElement, "color");
                EchoAppRender.Color.renderClear(background, cellElement, "backgroundColor");
                EchoAppRender.FillImage.renderClear(backgroundImage, cellElement, "backgroundColor");
            }
            EchoAppRender.Font.renderClear(null, cellElement);
            EchoAppRender.Font.renderClear(font, cellElement);
            
            // prevent text decoration for spacing cells, otherwise the nbsp will show up
            if (!visitedNodeCell) {
                cellElement.style.textDecoration = "none";
            }
            
            cellElement = cellElement.nextSibling;
        }
    },
    
    /**
     * Sets the selection state for the given node.
     * 
     * @param {ExtrasApp.RemoteTree.TreeNode} node the node to set the selection state for
     * @param {Boolean} selectionState the new selection state of node
     * @param {HTMLTableRowElement} rowElement (optional) the row element node is rendered to,
     *          if not provided this method will look it up automatically.
     */
    _setSelectionState: function(node, selectionState, rowElement) {
        if (!rowElement) {
            rowElement = this._getRowElementForNode(node);
        }
        this.selectionModel.setSelectionState(node, selectionState);
        this._setRowStyle(rowElement, selectionState, "selection");
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
            if (selectedIds[i] == "") {
                continue;
            }
            var node = this._treeStructure.getNode(selectedIds[i]);
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
        if (this._selectionEnabled && !rolloverState && this.selectionModel.isNodeSelected(node)) {
            this._setRowStyle(rowElement, true, "selection");
        } else {
            this._setRowStyle(rowElement, rolloverState, "rollover");
        }
    },
    
    /**
     * Gets the node that is rendered to the given element.
     */
    _getNodeFromElement: function(element) {
        var id = element.id;
        var nodeId;
        if (id.indexOf("_tr_") != -1) {
            nodeId = id.substring(id.indexOf("_tr_") + 4);
        }
        return this._treeStructure.getNode(nodeId);
    },
    
    /**
     * Gets the row element the node is rendered to.
     * 
     * @param {ExtrasApp.RemoteTree.TreeNode} node the node to get the row element for
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
     * @param {ExtrasApp.RemoteTree.TreeNode} node the node to get the row index for
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
        var clickRef = new Core.MethodRef(this, this._processClick);
        
        if (elements.expandoElement) {
            WebCore.EventProcessor.add(elements.expandoElement, "click", clickRef, false);
        }
        WebCore.EventProcessor.add(elements.tdElement, "click", clickRef, false);
        
        if (this._selectionEnabled || this._rolloverEnabled) {
            var mouseEnterLeaveSupport = WebCore.Environment.PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED;
            var enterEvent = mouseEnterLeaveSupport ? "mouseenter" : "mouseover";
            var exitEvent = mouseEnterLeaveSupport ? "mouseleave" : "mouseout";
            var rolloverEnterRef = new Core.MethodRef(this, this._processRolloverEnter);
            var rolloverExitRef = new Core.MethodRef(this, this._processRolloverExit);
            
            if (this._rolloverEnabled) {
                WebCore.EventProcessor.add(elements.trElement, enterEvent, rolloverEnterRef, false);
                WebCore.EventProcessor.add(elements.trElement, exitEvent, rolloverExitRef, false);
            }
            if (this._selectionEnabled) {
                WebCore.EventProcessor.add(elements.trElement, "click", clickRef, false);
                WebCore.EventProcessor.addSelectionDenialListener(elements.trElement);
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
            node.setExpanded(true);
            // no other peers will be called, so update may be null
            this._renderNode(null, node);
        }
        var rowIndex = this._getRowIndex(e.registeredTarget.parentNode);
        this.component.setProperty("expansion", rowIndex);
        return true;
    },
    
    _doSelection: function(node, e) {
        var trElement = e.registeredTarget;
        var rowIndex = this._getRowIndex(trElement);
        
        WebCore.DOM.preventEventDefault(e);
        
        var update = new ExtrasApp.RemoteTree.SelectionUpdate();
    
        if (!this.selectionModel.isSelectionEmpty() && (this.selectionModel.isSingleSelection() || !(e.shiftKey || e.ctrlKey || e.metaKey || e.altKey))) {
            update.clear = true;
            this._clearSelected();
        }
    
        if (!this.selectionModel.isSingleSelection() && e.shiftKey && this.lastSelectedNode) {
            if (this.lastSelectedNode.equals(node)) {
                return;
            }
            var startNode;
            var endNode;
            var row = trElement;
            var lastSelectedIndex = this._getRowIndexForNode(this.lastSelectedNode);
            if (lastSelectedIndex < rowIndex) {
                startNode = this.lastSelectedNode;
                endNode = node;
            } else {
                startNode = node;
                endNode = this.lastSelectedNode;
            }
            
            var iterator = this._treeStructure.iterator(startNode, false, endNode);
            var i = lastSelectedIndex < rowIndex ? lastSelectedIndex : rowIndex;
            trElement = this._getRowElementForNode(startNode);
            while (iterator.hasNext()) {
                node = iterator.nextNode();
                this._setSelectionState(node, true, trElement);
                update.addSelection(i++);
                do {
                    trElement = trElement.nextSibling;
                } while (trElement && trElement.style.display == "none")
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
        
        this.component.setProperty("selectionUpdate", update);
        return true;
    },
    
    _processClick: function(e) {
        if (!this.component.isActive()) {
            return;
        }
        var doAction = true;
        var isRow = e.registeredTarget.nodeName.toLowerCase() == "tr";
        
        if (isRow && this._selectionEnabled) { // click event on row element means selection
            var node = this._getNodeFromElement(e.registeredTarget);
            this._doSelection(node, e);
        } else if (!isRow) {
            var node = this._getNodeFromElement(e.registeredTarget.parentNode);
            this._doExpansion(node, e);
            // the selection listener is on the row element, so do not fire on expansion because the selection
            // listener will handle that. Unless selection is disabled. 
            doAction = !this._selectionEnabled;
        }
        
        if (doAction) {
            //FIXME Fire from component.
            this.component.fireEvent(new Core.Event("action", this.component));
        }
        return true;
    },
    
    _processRolloverEnter: function(e) {
        if (!this.component.isActive()) {
            return;
        }
        this._setRolloverState(e.registeredTarget, true);
    },
    
    _processRolloverExit: function(e) {
        if (!this.component.isActive()) {
            return;
        }
        this._setRolloverState(e.registeredTarget, false);
    },
    
    _removeRowListeners: function(rowElement) {
        WebCore.EventProcessor.removeAll(rowElement);
        var tdElement = rowElement.firstChild;
        while (tdElement) {
            if (tdElement.id) {
                WebCore.EventProcessor.removeAll(tdElement);
            }
            tdElement = tdElement.nextSibling;
        }
    },
    
    renderDispose: function(update) {
        //FIXME this might blow up performance, maybe cache all elements that have a click listener, 
        // but that will probably blow memory usage...
        var trElement = this._tbodyElement.firstChild;
        while (trElement) {
            this._removeRowListeners(trElement);
            trElement = trElement.nextSibling;
        }
        this._prevMaxDepth = null;
        this._treeStructure = null;
        this._tbodyElement = null;
        this._element = null;
    },
    
    renderUpdate: function(update) {
        var propertyNames = update.getUpdatedPropertyNames();
        // remove properties that are only changed on the client
        Core.Arrays.remove(propertyNames, "expansion");
        Core.Arrays.remove(propertyNames, "selectionUpdate");
        if (propertyNames.length == 0 && !update.getRemovedChildren()) {
            return false;
        }
        // end of the hack
        
        var treeStructureUpdate = update.getUpdatedProperty("treeStructure");
        var fullStructure = (treeStructureUpdate && treeStructureUpdate.newValue && treeStructureUpdate.newValue.fullRefresh);
        if (!fullStructure) {
            // removal of children indicates that the tree was invalidated, 
            // and thus all components are re-rendered, and the tree structure we have at the client 
            // is no longer valid.
            var treeStructureUpdate = update.getUpdatedProperty("treeStructure");
            if (treeStructureUpdate && treeStructureUpdate.newValue) {
                // tree structure updates are always partial, even when there are other updates we can't handle
                this._renderTreeStructureUpdate(treeStructureUpdate.newValue, update);
            }
            
            if (Core.Arrays.containsAll(ExtrasRender.ComponentSync.RemoteTree._supportedPartialProperties, propertyNames, true)) {
                var selection = update.getUpdatedProperty("selection");
                if (selection && this._selectionEnabled) {
                    this._setSelectedFromProperty(selection.newValue, true);
                }
                
                // partial update
                return false;
            }
        }
        
        var element = this._element;
        var containerElement = element.parentNode;
        var treeStructure = this._treeStructure;
        EchoRender.renderComponentDispose(update, update.parent);
        if (!fullStructure) {
            this._treeStructure = treeStructure;
        }
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        
        return true;
    },
    
    _renderTreeStructureUpdate: function(treeStructureUpdate, update) {
        var structs = treeStructureUpdate;
        for (var i = 0; i < structs.length; ++i) {
            var struct = structs[i]; 
            var updateRootNode = struct.getRootNode();
            var node = this._treeStructure.getNode(updateRootNode.getId());
            if (node) {
                this._treeStructure.addChildNodes(updateRootNode);
                node.setExpanded(updateRootNode.isExpanded());
            } else {
                node = this._treeStructure.getNode(updateRootNode.getParentId());
                node.setExpanded(true);
                this._treeStructure.addNode(updateRootNode);
            }
            this._renderNode(update, node);
        }
    }
});
