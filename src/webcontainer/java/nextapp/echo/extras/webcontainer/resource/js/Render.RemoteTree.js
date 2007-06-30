/**
 * Component rendering peer: Tree (Remote)
 */
ExtrasRender.ComponentSync.RemoteTree = function() {
};

ExtrasRender.ComponentSync.RemoteTree.prototype = new EchoRender.ComponentSync;

ExtrasRender.ComponentSync.RemoteTree._supportedPartialProperties = new Array("treeStructure");

ExtrasRender.ComponentSync.RemoteTree.prototype.renderAdd = function(update, parentElement) {
    var tableElement = document.createElement("table");
    this._element = tableElement;
//    tableElement.style.borderCollapse = "collapse";
    tableElement.borderCollapse = "collapse";
    tableElement.border = "1";
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
    var row = context.row;

    var trElement = this._getRowElementForNodeId(node.getId());
    var tdElement;
    var expandoElement;
    if (trElement) {
        tdElement = this._getNodeElementForNodeId(node.getId());
        expandoElement = this._getExpandoElementForNodeId(node.getId());
        
        EchoWebCore.DOM.removeAllChildren(tdElement);
        EchoWebCore.DOM.removeAllChildren(expandoElement);
    } else {
        trElement = this._element.insertRow(row);
        trElement.id = this.component.renderId + "_tr_" + node.getId();
        
        for (var c = 0; c < depth; ++c) {
            var rowHeaderElement = document.createElement("td");
            rowHeaderElement.appendChild(document.createTextNode("\u00a0"));
//            rowHeaderElement.style.borderCollapse = "collapse";
//            rowHeaderElement.style.border = "1px solid black";
            trElement.appendChild(rowHeaderElement);
        }
        
        var clickRef = new EchoCore.MethodRef(this, this._processClick);
        
        var expandoElement = document.createElement("td");
        expandoElement.id = this.component.renderId + "_expando_" + node.getId();
        trElement.appendChild(expandoElement);
        
        EchoWebCore.EventProcessor.add(expandoElement, "click", clickRef, false);
        
        var tdElement = document.createElement("td");
        tdElement.id = this.component.renderId + "_node_" + node.getId();
//        tdElement.style.borderCollapse = "collapse";
//        tdElement.style.border = "1px solid black";
        trElement.appendChild(tdElement);
        
        EchoWebCore.EventProcessor.add(tdElement, "click", clickRef, false);
    }
    var expandoText = "\u00a0";
    if (!node.isLeaf()) {
       expandoText = node.isExpanded() ? "-" : "+";
    }
    expandoElement.appendChild(document.createTextNode(expandoText));
    
    var component = this.component.application.getComponentByRenderId(node.getId());
    EchoRender.renderComponentAdd(update, component, tdElement);
    
    var childCount = node.getChildNodeCount();
    for (var i = 0; i < childCount; ++i) {
        var childNode = node.getChildNode(i);
        context.nextRow();
        this._renderNode(context, childNode, depth + 1, update);
    }
};

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
    var nodeId = this._getNodeIdFromElement(e.target);
    var node = this._treeStructure.getNode(nodeId);
    if (node.isLeaf()) {
        return;
    }
    var rowIndex = this._getRowIndex(e.target.parentNode);
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
