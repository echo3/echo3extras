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
	return "?sid=EchoExtras.Tree.Image&imageuid=" + identifier;
};

ExtrasRender.ComponentSync.RemoteTree.prototype.renderAdd = function(update, parentElement) {
    var lineStyle = this.component.getRenderProperty("lineStyle", 1);
    var lineImageIdSuffix = lineStyle == 0 ? "Solid" : "Dotted";
    this.verticalLineImage = this._getImageUri("lineVertical" + lineImageIdSuffix);
    this.horizontalLineImage = this._getImageUri("lineHorizontal" + lineImageIdSuffix);
    
    var tableElement = document.createElement("table");
    this._element = tableElement;
    tableElement.style.borderCollapse = "collapse";
//    tableElement.style.border = "1px solid black";
    
    var tbodyElement = document.createElement("tbody");
    tableElement.appendChild(tbodyElement);
    this._tbodyElement = tbodyElement;
    
    this._treeStructure = this.component.getProperty("treeStructure");
    
    var rootNode = this._treeStructure.getRootNode();
    this._rerenderNode(update, rootNode);
    
    parentElement.appendChild(tableElement);
};

ExtrasRender.ComponentSync.RemoteTree.prototype._rerenderNode = function(update, node) {
    var rowIndex = -1;
    var rowElement = this._getRowElementForNodeId(node.getId());
    if (rowElement) {
        rowIndex = this._getRowIndex(rowElement);
    }
    var maxDepth = this._treeStructure.getMaxDepth();
    var nodeDepth = this._treeStructure.getNodeDepth(node);
    
    var context = {
        row: rowIndex,
        nextRow: function() {
            if (this.row != -1) {
                ++this.row;
            }
        }
    };
    this._renderNode(context, node, nodeDepth, update);
    
    // update the col spans of the node cells
    if (this._prevMaxDepth || this._prevMaxDepth == 0) {
        var startNode;
        if (this._prevMaxDepth == maxDepth) {
            // no need to traverse the whole tree, update only changed nodes
            startNode = node;
        } else {
            // max depth has changed, update all nodes
            startNode = this._treeStructure.getRootNode();
        }
        this._updateSpans(update, startNode, maxDepth);
    }
    this._prevMaxDepth = maxDepth;
};

ExtrasRender.ComponentSync.RemoteTree.prototype._renderNode = function(context, node, depth, update) {
    var trElement = this._getRowElementForNodeId(node.getId());
    var tdElement;
    var expandoElement;
    if (!trElement) {
        var elems = this._renderNodeRowStructure(context, node, depth, update);
        trElement = elems.trElement;
        tdElement = elems.tdElement;
        expandoElement = elems.expandoElement;
    } else {
        tdElement = this._getNodeElementForNodeId(node.getId());
        expandoElement = this._getExpandoElementForNodeId(node.getId());
    }

    EchoWebCore.DOM.removeAllChildren(tdElement);
    EchoWebCore.DOM.removeAllChildren(expandoElement);
    
    var expandoText = "\u00a0";
    expandoElement.style.height = "100%"; // IE hacking
    var wrapperElement = document.createElement("div");
    if (node.getParentId()) { // don't show tree lines for the root
        var horizontalLineElement = document.createElement("div");
        var verticalLineElement = document.createElement("div");
        
        wrapperElement.style.position = "relative";
        wrapperElement.style.height = "100%";
        wrapperElement.style.width = "100%";
        
        verticalLineElement.style.position = "absolute";
        verticalLineElement.style.top = "0";
        if (this._treeStructure.hasNodeNextSibling(node)) {
           verticalLineElement.style.height = "100%";
        } else {
           verticalLineElement.style.height = "50%";
        }
        verticalLineElement.style.width = "100%";
        verticalLineElement.style.backgroundImage = "url('" + this.verticalLineImage + "')";
        verticalLineElement.style.backgroundPosition = "center top";
        verticalLineElement.style.backgroundRepeat = "repeat-y";
        verticalLineElement.style.fontSize = "0px";        
        
        horizontalLineElement.style.position = "absolute";
        horizontalLineElement.style.top = "0";
        horizontalLineElement.style.left = "50%";
        horizontalLineElement.style.height = "100%";
        horizontalLineElement.style.width = "50%";
        horizontalLineElement.style.backgroundImage = "url('" + this.horizontalLineImage + "')";
        horizontalLineElement.style.backgroundPosition = "center center";
        horizontalLineElement.style.backgroundRepeat = "repeat-x";
        horizontalLineElement.style.fontSize = "0px";
        
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
    
    var component = this.component.application.getComponentByRenderId(node.getId());
    EchoRender.renderComponentAdd(update, component, tdElement);
    
    var hackElement = document.createElement("div");
    hackElement.style.height = "100%";
    hackElement.style.fontSize = "0px";
    tdElement.appendChild(hackElement);
    
    var childCount = node.getChildNodeCount();
    for (var i = 0; i < childCount; ++i) {
        var childNode = node.getChildNode(i);
        context.nextRow();
        this._renderNode(context, childNode, depth + 1, update);
    }
};

ExtrasRender.ComponentSync.RemoteTree.prototype._renderNodeRowStructure = function(context, node, depth, update) {
    var trElement = this._element.insertRow(context.row);
    trElement.style.heigth = "100%"; // IE hacking
    trElement.id = this.component.renderId + "_tr_" + node.getId();
    
    var parentNode = this._treeStructure.getNode(node.getParentId());
    for (var c = 0; c < depth; ++c) {
        var rowHeaderElement = trElement.insertCell(0);
//            rowHeaderElement.style.border = "1px solid black";
        rowHeaderElement.style.padding = "0";
        rowHeaderElement.style.width = "0.6em";
        
        if (parentNode && this._treeStructure.hasNodeNextSibling(parentNode)) {
            rowHeaderElement.style.backgroundImage = "url('" + this.verticalLineImage + "')";
            rowHeaderElement.style.backgroundPosition = "center top";
            rowHeaderElement.style.backgroundRepeat = "repeat-y";
        }
        if (parentNode.getParentId()) {
            parentNode = this._treeStructure.getNode(parentNode.getParentId());
        } else {
            parentNode = null;
        }
        
        // make sure the background images of the cell below this one size correctly
        var hackElement = document.createElement("div");
        hackElement.style.height = "100%";
        hackElement.style.fontSize = "0px";
        rowHeaderElement.appendChild(hackElement);
    }
    
    var clickRef = new EchoCore.MethodRef(this, this._processClick);
    
    var expandoElement = document.createElement("td");
    expandoElement.id = this.component.renderId + "_expando_" + node.getId();
//        expandoElement.style.border = "1px solid black";
    expandoElement.style.padding = "0";
    expandoElement.style.width = "0.6em";
    trElement.appendChild(expandoElement);
    
    EchoWebCore.EventProcessor.add(expandoElement, "click", clickRef, false);
    
    var tdElement = document.createElement("td");
    tdElement.id = this.component.renderId + "_node_" + node.getId();
//        tdElement.style.border = "1px solid black";
    tdElement.style.padding = "0";
    trElement.appendChild(tdElement);
    
    EchoWebCore.EventProcessor.add(tdElement, "click", clickRef, false);
    
    return {
        trElement: trElement,
        tdElement: tdElement,
        expandoElement: expandoElement
    };
}

ExtrasRender.ComponentSync.RemoteTree.prototype._updateSpans = function(update, startNode, maxDepth) {
    var depth = this._treeStructure.getNodeDepth(startNode);
    var span = maxDepth - depth + 1;
    var nodeElement = this._getNodeElementForNodeId(startNode.getId());
    nodeElement.colSpan = span;
    
    var childCount = startNode.getChildNodeCount();
    for (var i = 0; i < childCount; ++i) {
        var childNode = startNode.getChildNode(i);
        this._updateSpans(update, childNode, maxDepth);
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
    var testElement = this._element.firstChild.firstChild;
    var index = 0;
    while (testElement) {
        if (testElement == element) {
            return index;
        }
        testElement = testElement.nextSibling;
        ++index;
    }
    return -1;
};

ExtrasRender.ComponentSync.RemoteTree.prototype._doAction = function(rowIndex) {
    this.component.fireEvent(new EchoCore.Event(this.component, "action", rowIndex));
};

ExtrasRender.ComponentSync.RemoteTree.prototype._processClick = function(e) {
    var nodeId = this._getNodeIdFromElement(e.registeredTarget);
    var node = this._treeStructure.getNode(nodeId);
    if (node.isLeaf()) {
        return;
    }
    var rowIndex = this._getRowIndex(e.registeredTarget.parentNode);
    this._doAction(rowIndex);
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
    //FIXME this will blow up performance, maybe cache all elements that have a click listener, 
    // but that will probably blow memory usage...
    var trElement = this._element.firstChild.firstChild;
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
    if (updateRootNode.isExpanded()) {
        // expand
        this._treeStructure.addChildNodes(updateRootNode);
    } else {
        // collapse
        this._removeRenderedChildNodes(update, node);
        this._treeStructure.removeChildNodes(node);
    }
    node.setExpanded(updateRootNode.isExpanded());
    this._rerenderNode(update, node);
};

ExtrasRender.ComponentSync.RemoteTree.prototype._removeRenderedChildNodes = function(update, node) {
    var childCount = node.getChildNodeCount();
    for (var i = 0; i < childCount; ++i) {
        var childNode = node.getChildNode(i);
        this._removeRenderedChildNodes(update, childNode);
        EchoRender.renderComponentDispose(update, this.component.application.getComponentByRenderId(childNode.getId()));
        var rowElement = this._getRowElementForNodeId(childNode.getId());
        this._removeRowListeners(rowElement);
        EchoWebCore.DOM.removeNode(rowElement)
    }
};

EchoRender.registerPeer("nextapp.echo.extras.app.RemoteTree", ExtrasRender.ComponentSync.RemoteTree);
