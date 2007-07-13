/**
 * Component rendering peer: Tree (Remote)
 */
ExtrasRender.ComponentSync.RemoteTree = function() {
};

ExtrasRender.ComponentSync.RemoteTree.prototype = new EchoRender.ComponentSync;

ExtrasRender.ComponentSync.RemoteTree._supportedPartialProperties = new Array("treeStructure");

/**
 * Gets an URI for default tree images
 * 
 * @param {String} identifier the image identifier
 * @return the image URI
 * @type {String}
 */
ExtrasRender.ComponentSync.RemoteTree.prototype._getImageUri = function(identifier) {
	// FIXME abstract this somehow so it works with FreeClient too
	return "?sid=Echo.Image&iid=" + identifier;
};

ExtrasRender.ComponentSync.RemoteTree.prototype.renderAdd = function(update, parentElement) {
    var lineStyle = this.component.getRenderProperty("lineStyle", 1);
    var lineImageIdSuffix = lineStyle == 0 ? "Solid" : "Dotted";
    this.verticalLineImage = this._getImageUri("EchoExtras.Tree.lineVertical" + lineImageIdSuffix);
    this.horizontalLineImage = this._getImageUri("EchoExtras.Tree.lineHorizontal" + lineImageIdSuffix);
    this._headerVisible = this.component.getProperty("headerVisible");
    this._rolloverEnabled = this.component.getRenderProperty("rolloverEnabled");
    
    this._defaultInsets = this.component.getRenderProperty("insets");
    if (!this._defaultInsets) {
        this._defaultInsets = new EchoApp.Property.Insets(0);
    }
    this._defaultCellPadding = EchoRender.Property.Insets.toCssValue(this._defaultInsets);
    
    var tableElement = document.createElement("table");
    this._element = tableElement;
    this._element.id = this.component.renderId;
    tableElement.style.borderCollapse = "collapse";
    EchoRender.Property.Border.renderComponentProperty(this.component, "border", null, tableElement);
    
    var tbodyElement = document.createElement("tbody");
    tableElement.appendChild(tbodyElement);
    this._tbodyElement = tbodyElement;
    
    this._treeStructure = this.component.getProperty("treeStructure");
    this.columnCount = this.component.getProperty("columnCount");
    
    if (this._headerVisible) {
        this._renderNode(update, this._treeStructure.getHeaderNode());
    }
    var rootNode = this._treeStructure.getRootNode();
    this._renderNode(update, rootNode);
    
    parentElement.appendChild(tableElement);
};

ExtrasRender.ComponentSync.RemoteTree.prototype.renderSizeUpdate = function() {
    if (!this._vpElements) {
        return;
    }
    for (var i in this._vpElements) {
        var parentHeight = this._vpElements[i].parentNode.offsetHeight;
        var height = parentHeight;
        if (this._vpElements[i].style.bottom == "50%") {
            height /= 2;
        }
        this._vpElements[i].style.height = height + "px";
    }
    delete this._vpElements;
};

/**
 * Creates an iterator object for easy navigating through the tree table.
 * 
 * @param startRow the row element to start with, 
 *          this element will be returned on the first call to nextRow().
 * @param endRow the row that ends the iteration. When endRow is encountered 
 *          while iterating the iterator will return null, and will not advance to the next row.
 */
ExtrasRender.ComponentSync.RemoteTree.prototype._elementIterator = function(startRow, endRow) {
    return {
        startRow : startRow,
        rowElement : null,
        
        nextRow : function() {
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
};

ExtrasRender.ComponentSync.RemoteTree.prototype._renderNode = function(update, node) {
    var rowElement = this._getRowElementForNodeId(node.getId());
    var nodeDepth = this._treeStructure.getNodeDepth(node);
    
    var insertBefore = null;
    if (rowElement) {
        insertBefore = rowElement.nextSibling;
    }

    var nodeSibling = this._treeStructure.getNodeNextSibling(node, true);
    var endRow = null;
    if (nodeSibling) {
        endRow = this._getRowElementForNodeId(nodeSibling.getId());
    }
    var iterator = this._elementIterator(rowElement, endRow);
    this._renderNodeRecursive(update, node, iterator, nodeDepth, insertBefore);
    
    this._updateSpans(node);
};

ExtrasRender.ComponentSync.RemoteTree.prototype._renderNodeRecursive = function(update, node, iterator, depth, insertBefore) {
    var trElement = iterator.nextRow();
    var tdElement;
    var expandoElement;
    
    if (!trElement) {
        var elems = this._renderNodeRowStructure(insertBefore, node, depth);
        // skip the just created row element
        iterator.nextRow();
        trElement = elems.trElement;
        tdElement = elems.tdElement;
        expandoElement = elems.expandoElement;
    } else {
        trElement.style.display = ""; // unhide
        tdElement = iterator.currentNodeElement();
        expandoElement = iterator.currentExpandoElement();
    }

    if (expandoElement) {
        this._renderExpandoElement(node, expandoElement);
    }
    
    // check whether the components of the row are already rendered 
    if (!tdElement.firstChild) {
        var component = this.component.application.getComponentByRenderId(node.getId());
        EchoRender.renderComponentAdd(update, component, tdElement);
        
        if (this.columnCount > 1) {
            for (var c = 0; c < this.columnCount - 1; ++c) {
                var columnElement = document.createElement("td");
                EchoRender.Property.Border.renderComponentProperty(this.component, "border", null, columnElement);
                EchoRender.Property.Insets.renderPixel(this._defaultInsets, columnElement, "padding");
                
                var columnComponent = this.component.application.getComponentByRenderId(node.getColumn(c));
                EchoRender.renderComponentAdd(update, columnComponent, columnElement);
                
                trElement.appendChild(columnElement);
            }
        }
    }
    
    var expanded = node.isExpanded();    
    var childCount = node.getChildNodeCount();
    for (var i = 0; i < childCount; ++i) {
        var childNode = node.getChildNode(i);
        if (expanded) {
            this._renderNodeRecursive(update, childNode, iterator, depth + 1, insertBefore);
        } else {
            this._hideNode(childNode, iterator);
        }
    }
};

ExtrasRender.ComponentSync.RemoteTree.prototype._renderExpandoElement = function(node, expandoElement) {
    EchoWebCore.DOM.removeAllChildren(expandoElement);
        
    var expandoText = "\u00a0";
    expandoElement.style.height = "100%"; // IE hacking
    var wrapperElement = document.createElement("div");
    var verticalLineElement;
    if (node.getParentId()) { // don't show tree lines for the root
        var horizontalLineElement = document.createElement("div");
        verticalLineElement = document.createElement("div");
        
        wrapperElement.style.position = "relative";
        wrapperElement.style.height = "100%";
        wrapperElement.style.width = "100%";
        this._applyInsets(this._defaultInsets, [0,2], wrapperElement);
        
        verticalLineElement.style.position = "absolute";
        verticalLineElement.style.top = "0";
        if (this._treeStructure.hasNodeNextSibling(node)) {
            verticalLineElement.style.bottom = "0";
        } else {
            verticalLineElement.style.bottom = "50%";
        }
        if (EchoWebCore.Environment.BROWSER_INTERNET_EXPLORER && EchoWebCore.Environment.BROWSER_MAJOR_VERSION <= 6) {
            if (!this._vpElements) {
                this._vpElements = new Array();
            }
            this._vpElements.push(verticalLineElement);
            verticalLineElement.style.fontSize = "1px";
            this._vpElements.push(horizontalLineElement);
            horizontalLineElement.style.fontSize = "1px";
        }
        verticalLineElement.style.width = "100%";
        var verticalLineFillImage = new EchoApp.Property.FillImage(this.verticalLineImage, EchoApp.Property.FillImage.REPEAT_VERTICAL, "50%", 0);
        EchoRender.Property.FillImage.render(verticalLineFillImage, verticalLineElement);
                
        horizontalLineElement.style.position = "absolute";
        horizontalLineElement.style.top = "0";
        horizontalLineElement.style.bottom = "0";
        horizontalLineElement.style.left = "50%";
        horizontalLineElement.style.width = "50%";
        var horizontalLineFillImage = new EchoApp.Property.FillImage(this.horizontalLineImage, EchoApp.Property.FillImage.REPEAT_HORIZONTAL, "50%", "50%");
        EchoRender.Property.FillImage.render(horizontalLineFillImage, horizontalLineElement);
        
        verticalLineElement.appendChild(document.createTextNode(expandoText));
        horizontalLineElement.appendChild(document.createTextNode(expandoText));

        wrapperElement.appendChild(verticalLineElement);
        wrapperElement.appendChild(horizontalLineElement);
    }
    if (!node.isLeaf()) {
        expandoText = node.isExpanded() ? "-" : "+";
    }
    wrapperElement.appendChild(document.createTextNode(expandoText));
    expandoElement.appendChild(wrapperElement);
};

ExtrasRender.ComponentSync.RemoteTree.prototype._hideNode = function(node, iterator) {
    var rowElement = iterator.nextRow();
    if (!rowElement || rowElement.style.display == "none") {
        return;
    }
    rowElement.style.display = "none";
    var childCount = node.getChildNodeCount();
    for (var i = 0; i < childCount; ++i) {
        var childNode = node.getChildNode(i);
        this._hideNode(childNode, iterator);
    }
};

ExtrasRender.ComponentSync.RemoteTree.prototype._createMultiSidedBorder = function(border) {
    if (!border) {
        return null;
    }
    
    if (border.multisided) {
        return border;
    } else {
        var side = new EchoApp.Property.Border.Side();
        side.size = border.size;
        side.style = border.style;
        side.color = border.color;
        return new EchoApp.Property.Border(new Array(side));
    }
};
ExtrasRender.ComponentSync.RemoteTree._BORDER_SIDE_STYLE_NAMES = new Array("borderTop", "borderRight", "borderBottom", "borderLeft");

ExtrasRender.ComponentSync.RemoteTree.prototype._applyBorder = function(border, sides, element) {
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
        EchoRender.Property.Border.renderSide(border.sides[index], element, ExtrasRender.ComponentSync.RemoteTree._BORDER_SIDE_STYLE_NAMES[sides[i]]);
    }
};

ExtrasRender.ComponentSync.RemoteTree.prototype._applyInsets = function(insets, sides, element) {
    var newValues = new Array();
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
        if (!insets || EchoCore.Arrays.indexOf(sides, i) == -1) {
            setInset(i, new EchoApp.Property.Extent(0, "px"));
        } else {
            setInset(i, null);
        }
    }
    var newInsets = new EchoApp.Property.Insets(newValues);
    EchoRender.Property.Insets.renderPixel(newInsets, element, "padding");
};

ExtrasRender.ComponentSync.RemoteTree.prototype._renderNodeRowStructure = function(insertBefore, node, depth) {
    var trElement = document.createElement("tr");
    if (EchoWebCore.Environment.BROWSER_INTERNET_EXPLORER) {
        trElement.style.heigth = "100%";
    }
    trElement.id = this.component.renderId + "_tr_" + node.getId();
    
    var border = this._createMultiSidedBorder(this.component.getRenderProperty("border"));
    var insets = this._defaultInsets;

    var parentNode = this._treeStructure.getNode(node.getParentId());
    for (var c = 0; c < depth - 1; ++c) {
        var rowHeaderElement = document.createElement("td");
        rowHeaderElement.style.padding = "0";
        rowHeaderElement.style.width = "0.6em";
        rowHeaderElement.style.height = "100%";
        
        // apply top and bottom border style
        this._applyBorder(border, [0,2], rowHeaderElement);

        if (parentNode) {
            if (this._treeStructure.hasNodeNextSibling(parentNode)) {
                var verticalLineFillImage = new EchoApp.Property.FillImage(this.verticalLineImage, EchoApp.Property.FillImage.REPEAT_VERTICAL, "50%", 0);
                var verticalLineElement = document.createElement("div");
                verticalLineElement.style.position = "relative";
                verticalLineElement.style.height = "100%";
                verticalLineElement.style.width = "100%";
                this._applyInsets(this._defaultInsets, [0, 2], verticalLineElement);
                
                verticalLineElement.appendChild(document.createTextNode("\u00a0"));
                
                EchoRender.Property.FillImage.render(verticalLineFillImage, verticalLineElement);
                rowHeaderElement.appendChild(verticalLineElement);
            }
            parentNode = this._treeStructure.getNode(parentNode.getParentId());
        }
        trElement.insertBefore(rowHeaderElement, trElement.firstChild);
    }
    
    var isHeader = node == this._treeStructure.getHeaderNode();
    var expandoElement;
    if (!isHeader) {
        expandoElement = document.createElement("td");
        expandoElement.__ExtrasTreeCellType = "expando";
        // apply border and bottom style
        this._applyBorder(border, [0,2], expandoElement);
        expandoElement.style.padding = "0";
        expandoElement.style.width = "0.6em";
        expandoElement.style.height = "100%";
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
};

ExtrasRender.ComponentSync.RemoteTree.prototype._updateSpans = function(node) {
    // update the col spans of the node cells
    if (node == this._treeStructure.getHeaderNode()) {
        // don't touch the spans if only the header node is re-rendered
        return;
    }
    var maxDepth = this._treeStructure.getMaxDepth();
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
    var element = this._getRowElementForNodeId(startNode.getId());
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
};

ExtrasRender.ComponentSync.RemoteTree.prototype._updateSpansRecursive = function(startNode, maxDepth, iterator) {
    var depth = this._treeStructure.getNodeDepth(startNode);
    var span = maxDepth - depth + 1;
    if (startNode == this._treeStructure.getHeaderNode()) {
        // the header row has no expando cell, it needs to span one extra column
        ++span;
    }
    var nodeElement = iterator.nextNodeElement();
    if (!nodeElement) {
        return;
    }
    nodeElement.colSpan = span;
    
    if (!startNode.isExpanded()) {
        return;
    }
    
    var childCount = startNode.getChildNodeCount();
    for (var i = 0; i < childCount; ++i) {
        var childNode = startNode.getChildNode(i);
        this._updateSpansRecursive(childNode, maxDepth, iterator);
    }
};

ExtrasRender.ComponentSync.RemoteTree.prototype._setRolloverState = function(rowElement, rolloverState) {
    var foreground = EchoRender.Property.getEffectProperty(this.component, "foreground", "rolloverForeground", rolloverState);
    var background = EchoRender.Property.getEffectProperty(this.component, "background", "rolloverBackground", rolloverState);
    var backgroundImage = EchoRender.Property.getEffectProperty(this.component, "backgroundImage", "rolloverBackgroundImage", rolloverState);
    var font = EchoRender.Property.getEffectProperty(this.component, "font", "rolloverFont", rolloverState);
    
    var cellElement = rowElement.firstChild;
    while (cellElement) {
        EchoRender.Property.Color.renderClear(foreground, cellElement, "color");
        EchoRender.Property.Color.renderClear(background, cellElement, "backgroundColor");
        EchoRender.Property.FillImage.renderClear(backgroundImage, cellElement, "backgroundColor");
        EchoRender.Property.Font.renderClear(font, cellElement);
        
        cellElement = cellElement.nextSibling;
    }
};

ExtrasRender.ComponentSync.RemoteTree.prototype._getNodeIdFromElement = function(element) {
    var id = element.id;
    var nodeId;
    if (id.indexOf("_tr_") != -1) {
        nodeId = id.substring(id.indexOf("_tr_") + 4);
    }
    return nodeId;
};

ExtrasRender.ComponentSync.RemoteTree.prototype._getRowElementForNodeId = function(nodeId) {
    return document.getElementById(this.component.renderId + "_tr_" + nodeId);
};

ExtrasRender.ComponentSync.RemoteTree.prototype._getRowIndex = function(element) {
    if (element.style.display == "none") {
        return null;
    }
    var testElement = this._tbodyElement.firstChild;
    
    var index = this._headerVisible ? -1 : 0;
    while (testElement) {
        if (testElement == element) {
            return index;
        }
        testElement = testElement.nextSibling;
        if (testElement.style.display != "none") {
            // non-expanded nodes should not be taken into account
            ++index;
        }
    }
    return null;
};

ExtrasRender.ComponentSync.RemoteTree.prototype._addEventListeners = function(elements) {
    var clickRef = new EchoCore.MethodRef(this, this._processClick);
    
    if (elements.expandoElement) {
        EchoWebCore.EventProcessor.add(elements.expandoElement, "click", clickRef, false);
    }
    EchoWebCore.EventProcessor.add(elements.tdElement, "click", clickRef, false);
    
    if (this._selectionEnabled || this._rolloverEnabled) {
        if (this._rowCount == 0) {
            return;
        }
        var mouseEnterLeaveSupport = EchoWebCore.Environment.PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED;
        var enterEvent = mouseEnterLeaveSupport ? "mouseenter" : "mouseover";
        var exitEvent = mouseEnterLeaveSupport ? "mouseleave" : "mouseout";
        var rolloverEnterRef = new EchoCore.MethodRef(this, this._processRolloverEnter);
        var rolloverExitRef = new EchoCore.MethodRef(this, this._processRolloverExit);
        
        if (this._rolloverEnabled) {
            EchoWebCore.EventProcessor.add(elements.trElement, enterEvent, rolloverEnterRef, false);
            EchoWebCore.EventProcessor.add(elements.trElement, exitEvent, rolloverExitRef, false);
        }
        if (this._selectionEnabled) {
            EchoWebCore.EventProcessor.add(elements.trElement, "click", clickRef, false);
//            EchoWebCore.EventProcessor.addSelectionDenialListener(trElement);
        }
    }
};

ExtrasRender.ComponentSync.RemoteTree.prototype._doAction = function(node, e) {
    if (node.isLeaf()) {
        // FIXME selection event?
        return;
    }
    var eventType = "action";
    if (node.isExpanded()) {
        node.setExpanded(false);
        // no other peers will be called, so update may be null
        this._renderNode(null, node);
    } else if (node.getChildNodeCount() > 0) {
        node.setExpanded(true);
        // no other peers will be called, so update may be null
        this._renderNode(null, node);
    } else {
        eventType += "Load";
    }
    var rowIndex = this._getRowIndex(e.registeredTarget.parentNode);
    if (rowIndex != -1) {
        this.component.fireEvent(new EchoCore.Event(this.component, eventType, rowIndex));
    }
};

ExtrasRender.ComponentSync.RemoteTree.prototype._processClick = function(e) {
    if (!this.component.isActive()) {
        return;
    }
    var isRow = e.registeredTarget.nodeName.toLowerCase() == "tr";
    if (isRow) {
        EchoCore.Debug.consoleWrite("selection rowid: " + e.registeredTarget.id);
    } else {
        var nodeId = this._getNodeIdFromElement(e.registeredTarget.parentNode);
        var node = this._treeStructure.getNode(nodeId);
        
        this._doAction(node, e);
        return true;
    }
};

ExtrasRender.ComponentSync.RemoteTree.prototype._processRolloverEnter = function(e) {
    if (!this.component.isActive()) {
        return;
    }
    this._setRolloverState(e.registeredTarget, true);
};

ExtrasRender.ComponentSync.RemoteTree.prototype._processRolloverExit = function(e) {
    if (!this.component.isActive()) {
        return;
    }
    this._setRolloverState(e.registeredTarget, false);
};

ExtrasRender.ComponentSync.RemoteTree.prototype._removeRowListeners = function(rowElement) {
    EchoWebCore.EventProcessor.removeAll(rowElement);
    var tdElement = rowElement.firstChild;
    while (tdElement) {
        if (tdElement.id) {
            EchoWebCore.EventProcessor.removeAll(tdElement);
        }
        tdElement = tdElement.nextSibling;
    }
}

ExtrasRender.ComponentSync.RemoteTree.prototype.renderDispose = function(update) {
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
};

ExtrasRender.ComponentSync.RemoteTree.prototype.renderUpdate = function(update) {
    if (EchoCore.Arrays.containsAll(ExtrasRender.ComponentSync.RemoteTree._supportedPartialProperties, update.getUpdatedPropertyNames(), true)) {
        // partial update
        var treeStructureUpdate = update.getUpdatedProperty("treeStructure");
        if (treeStructureUpdate) {
            this._renderTreeStructureUpdate(treeStructureUpdate.newValue, update);
        }
        return false;
    }
    // FIXME partial update / lazy rendering
    var element = this._element;
    var containerElement = element.parentNode;
    EchoRender.renderComponentDispose(update, update.parent);
    containerElement.removeChild(element);
    this.renderAdd(update, containerElement);
    
    return true;
};

ExtrasRender.ComponentSync.RemoteTree.prototype._renderTreeStructureUpdate = function(treeStructureUpdate, update) {
    var updateRootNode = treeStructureUpdate.getRootNode();
    var node = this._treeStructure.getNode(updateRootNode.getId());
    this._treeStructure.addChildNodes(updateRootNode);
    node.setExpanded(updateRootNode.isExpanded());
    this._renderNode(update, node);
    this.component.setProperty("treeStructure", this._treeStructure);
};

EchoRender.registerPeer("nextapp.echo.extras.app.RemoteTree", ExtrasRender.ComponentSync.RemoteTree);
