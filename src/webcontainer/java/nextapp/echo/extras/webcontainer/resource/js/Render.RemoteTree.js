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
    
    var tableElement = document.createElement("table");
    this._element = tableElement;
    tableElement.style.borderCollapse = "collapse";
//    tableElement.style.border = "1px solid black";
    
    var tbodyElement = document.createElement("tbody");
    tableElement.appendChild(tbodyElement);
    this._tbodyElement = tbodyElement;
    
    this._treeStructure = this.component.getProperty("treeStructure");
    this.columnCount = this.component.getProperty("columnCount");
    
    var rootNode = this._treeStructure.getRootNode();
    this._rerenderNode(update, this._treeStructure.getHeaderNode());
    this._rerenderNode(update, rootNode);
    
    parentElement.appendChild(tableElement);
};

ExtrasRender.ComponentSync.RemoteTree.prototype.renderSizeUpdate = function() {
    if (!this._vpElements) {
        return;
    }
    for (var i in this._vpElements) {
        var parentHeight = this._vpElements[i].parentNode.offsetHeight;
        this._vpElements[i].style.height = (parentHeight / 2) + "px";
    }
    delete this._vpElements;
};

ExtrasRender.ComponentSync.RemoteTree.prototype._rerenderNode = function(update, node) {
    var rowElement = this._getRowElementForNodeId(node.getId());
    var nodeDepth = this._treeStructure.getNodeDepth(node);
    
    var insertBefore = null;
    if (rowElement) {
        insertBefore = rowElement.nextSibling;
    }
    
    this._renderNode(insertBefore, node, nodeDepth, update);
    
    this._updateSpans(node);
};

ExtrasRender.ComponentSync.RemoteTree.prototype._renderNode = function(insertBefore, node, depth, update) {
    var trElement = this._getRowElementForNodeId(node.getId());
    var tdElement;
    var expandoElement;
    
    if (!trElement) {
        var elems = this._renderNodeRowStructure(insertBefore, node, depth);
        trElement = elems.trElement;
        tdElement = elems.tdElement;
        expandoElement = elems.expandoElement;
    } else {
        trElement.style.display = ""; // unhide
        tdElement = this._getNodeElementForNodeId(node.getId());
        expandoElement = this._getExpandoElementForNodeId(node.getId());
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
//                columnElement.style.border = "1px solid black";
                
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
            this._renderNode(insertBefore, childNode, depth + 1, update);
        } else {
            this._hideNode(childNode);
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
        
        verticalLineElement.style.position = "absolute";
        verticalLineElement.style.top = "0";
        if (this._treeStructure.hasNodeNextSibling(node)) {
            verticalLineElement.style.height = "100%";
            verticalLineElement.style.bottom = "0";
        } else {
            verticalLineElement.style.height = "50%";
            verticalLineElement.style.bottom = "50%";
            if (EchoWebCore.Environment.BROWSER_INTERNET_EXPLORER && EchoWebCore.Environment.BROWSER_MAJOR_VERSION <= 6) {
                if (!this._vpElements) {
                    this._vpElements = new Array();
                }
                this._vpElements.push(verticalLineElement);
                verticalLineElement.style.fontSize = "1px";
            }
        }
        verticalLineElement.style.width = "100%";
        var verticalLineFillImage = new EchoApp.Property.FillImage(this.verticalLineImage, EchoApp.Property.FillImage.REPEAT_Y, "50%", 0);
        EchoRender.Property.FillImage.render(verticalLineFillImage, verticalLineElement);
                
        horizontalLineElement.style.position = "absolute";
        horizontalLineElement.style.top = "0";
        horizontalLineElement.style.left = "50%";
        horizontalLineElement.style.height = "100%";
        horizontalLineElement.style.width = "50%";
        var horizontalLineFillImage = new EchoApp.Property.FillImage(this.horizontalLineImage, EchoApp.Property.FillImage.REPEAT_X, "50%", "50%");
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

ExtrasRender.ComponentSync.RemoteTree.prototype._hideNode = function(node) {
    var trElement = this._getRowElementForNodeId(node.getId());
    if (!trElement || trElement.style.display == "none") {
        return;
    }
    trElement.style.display = "none";
    var childCount = node.getChildNodeCount();
    for (var i = 0; i < childCount; ++i) {
        var childNode = node.getChildNode(i);
        this._hideNode(childNode);
    }
};

ExtrasRender.ComponentSync.RemoteTree.prototype._renderNodeRowStructure = function(insertBefore, node, depth) {
    var trElement = document.createElement("tr");
    trElement.style.heigth = "100%"; // IE hacking
    trElement.id = this.component.renderId + "_tr_" + node.getId();
    
    var parentNode = this._treeStructure.getNode(node.getParentId());
    for (var c = 0; c < depth; ++c) {
        var rowHeaderElement = document.createElement("td");
//            rowHeaderElement.style.border = "1px solid black";
        rowHeaderElement.style.padding = "0";
        rowHeaderElement.style.width = "0.6em";
        rowHeaderElement.style.height = "100%";

        if (parentNode && this._treeStructure.hasNodeNextSibling(parentNode)) {
            var verticalLineFillImage = new EchoApp.Property.FillImage(this.verticalLineImage, EchoApp.Property.FillImage.REPEAT_Y, "50%", 0);
            EchoRender.Property.FillImage.render(verticalLineFillImage, rowHeaderElement);
        }
        if (parentNode.getParentId()) {
            parentNode = this._treeStructure.getNode(parentNode.getParentId());
        } else {
            parentNode = null;
        }

        trElement.insertBefore(rowHeaderElement, trElement.firstChild);
    }
    var clickRef = new EchoCore.MethodRef(this, this._processClick);
    
    var header = node == this._treeStructure.getHeaderNode();
    
    var expandoElement;
    if (!header) {
        expandoElement = document.createElement("td");
        expandoElement.id = this.component.renderId + "_expando_" + node.getId();
    //        expandoElement.style.border = "1px solid black";
        expandoElement.style.padding = "0";
        expandoElement.style.width = "0.6em";
        expandoElement.style.height = "100%";
        trElement.appendChild(expandoElement);
        
        EchoWebCore.EventProcessor.add(expandoElement, "click", clickRef, false);
    }
    
    var tdElement = document.createElement("td");
    tdElement.id = this.component.renderId + "_node_" + node.getId();
//        tdElement.style.border = "1px solid black";
    tdElement.style.padding = "0";

    trElement.appendChild(tdElement);

    this._tbodyElement.insertBefore(trElement, insertBefore);

    EchoWebCore.EventProcessor.add(tdElement, "click", clickRef, false);
    
    return {
        trElement: trElement,
        tdElement: tdElement,
        expandoElement: expandoElement
    };
};

ExtrasRender.ComponentSync.RemoteTree.prototype._updateSpans = function(node) {
    // update the col spans of the node cells
    if (node == this._treeStructure.getHeaderNode()) {
        // don't touch the spans if only the header node is re-rendered
        return;
    }
    var maxDepth = this._treeStructure.getMaxDepth();
    var tbodyElement = this._tbodyElement;
    var context = {
        startRow : tbodyElement.firstChild,
        rowElement : null,
        
        nextRow : function() {
            if (this.rowElement) {
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
            var cellElement = this.rowElement.firstChild;
            while (cellElement) {
                if (cellElement.id && cellElement.id.indexOf("_node_") != -1) {
                    return cellElement;
                }
                cellElement = cellElement.nextSibling;
            }
            return null;
        },
    };
    var startNode;
    if (this._prevMaxDepth == maxDepth) {
        // no need to traverse the whole tree, update only changed nodes
        startNode = node;
    } else {
        // max depth has changed, update all nodes
        startNode = this._treeStructure.getRootNode();
        if (this._headerVisible) {
            this._updateSpansRecursive(this._treeStructure.getHeaderNode(), maxDepth, context);
        }
    }
    var element = this._getRowElementForNodeId(startNode.getId());
    if (element) {
        context.startRow = element;
    } else {
        while (context.startRow) {
            if (context.startRow.id == this.component.renderId + "_tr_" + startNode.getId()) {
                break;
            }
            context.startRow = context.startRow.nextSibling;
        }
    }
    
    this._updateSpansRecursive(startNode, maxDepth, context);
    this._prevMaxDepth = maxDepth;
};

ExtrasRender.ComponentSync.RemoteTree.prototype._updateSpansRecursive = function(startNode, maxDepth, context) {
    var depth = this._treeStructure.getNodeDepth(startNode);
    var span = maxDepth - depth + 1;
    if (startNode == this._treeStructure.getHeaderNode()) {
        ++span;
    }
    var nodeElement = context.nextNodeElement();
    if (!nodeElement) {
        return;
    }
    nodeElement.colSpan = span;
    
    var childCount = startNode.getChildNodeCount();
    for (var i = 0; i < childCount; ++i) {
        var childNode = startNode.getChildNode(i);
        this._updateSpansRecursive(childNode, maxDepth, context);
    }
};

ExtrasRender.ComponentSync.RemoteTree.prototype._getNodeIdFromElement = function(element) {
    var id = element.id;
    var nodeId;
    if (id.indexOf("_expando_") != -1) {
        nodeId = id.substring(id.indexOf("_expando_") + 9);
    } else if (id.indexOf("_node_") != -1) {
        nodeId = id.substring(id.indexOf("_node_") + 6);
    }
    return nodeId;
};

ExtrasRender.ComponentSync.RemoteTree.prototype._getRowElementForNodeId = function(nodeId) {
    var nodeElement = document.getElementById(this.component.renderId + "_node_" + nodeId);
    if (nodeElement) {
        return nodeElement.parentNode;
    } else {
        return null;
    }
};

ExtrasRender.ComponentSync.RemoteTree.prototype._getExpandoElementForNodeId = function(nodeId) {
    return document.getElementById(this.component.renderId + "_expando_" + nodeId);
};

ExtrasRender.ComponentSync.RemoteTree.prototype._getNodeElementForNodeId = function(nodeId) {
    return document.getElementById(this.component.renderId + "_node_" + nodeId);
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

ExtrasRender.ComponentSync.RemoteTree.prototype._doAction = function(node, e) {
    if (node.isLeaf()) {
        // FIXME selection event?
        return;
    }
    var eventType = "action";
    if (node.isExpanded()) {
        node.setExpanded(false);
        // no other peers will be called, so update may be null
        this._rerenderNode(null, node);
    } else if (node.getChildNodeCount() > 0) {
        node.setExpanded(true);
        // no other peers will be called, so update may be null
        this._rerenderNode(null, node);
    } else {
        eventType += "Load";
    }
    var rowIndex = this._getRowIndex(e.registeredTarget.parentNode);
    if (rowIndex != -1) {
        this.component.fireEvent(new EchoCore.Event(this.component, eventType, rowIndex));
    }
};

ExtrasRender.ComponentSync.RemoteTree.prototype._processClick = function(e) {
    var nodeId = this._getNodeIdFromElement(e.registeredTarget);
    var node = this._treeStructure.getNode(nodeId);
    
    this._doAction(node, e);
};

ExtrasRender.ComponentSync.RemoteTree.prototype._removeRowListeners = function(rowElement) {
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
    this._treeStructure = null;
    this._tbodyElement = null;
    this._element = null;
};

ExtrasRender.ComponentSync.RemoteTree.prototype.renderUpdate = function(update) {
    if (EchoCore.Arrays.containsAll(update.getUpdatedPropertyNames(), ExtrasRender.ComponentSync.RemoteTree._supportedPartialProperties, true)) {
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
    this._rerenderNode(update, node);
};

EchoRender.registerPeer("nextapp.echo.extras.app.RemoteTree", ExtrasRender.ComponentSync.RemoteTree);
