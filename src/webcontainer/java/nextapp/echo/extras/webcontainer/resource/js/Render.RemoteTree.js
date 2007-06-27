/**
 * Component rendering peer: Tree (Remote)
 */
ExtrasRender.ComponentSync.RemoteTree = function() {
};

ExtrasRender.ComponentSync.RemoteTree.prototype = new EchoRender.ComponentSync;

ExtrasRender.ComponentSync.RemoteTree.prototype.getContainerElement = function(component) {
    throw new Exception("FIXME");
};

ExtrasRender.ComponentSync.RemoteTree.prototype.renderAdd = function(update, parentElement) {
    var tableElement = document.createElement("table");
    this._element = tableElement;
    tableElement.style.borderCollapse = "collapse";
    tableElement.style.border = "1px solid black";
    
    var tbodyElement = document.createElement("tbody");
    tableElement.appendChild(tbodyElement);
    
    var treeStructure = this.component.getProperty("treeStructure");
    var maxDepth = treeStructure.getMaxDepth();
    
    var rootNode = treeStructure.getRootNode();
    this._renderNode(rootNode, 0, maxDepth, update, tbodyElement);
    
    parentElement.appendChild(tableElement);
};

ExtrasRender.ComponentSync.RemoteTree.prototype._renderNode = function(node, depth, maxDepth, update, parentElement) {
    var trElement = document.createElement("tr");
//    trElement.id = this.component.renderId + "_tr_" + node.getId();
	
	for (var c = 0; c < depth; ++c) {
        var rowHeaderElement = document.createElement("td");
        rowHeaderElement.appendChild(document.createTextNode("|"));
        rowHeaderElement.style.borderCollapse = "collapse";
        rowHeaderElement.style.border = "1px solid black";
        trElement.appendChild(rowHeaderElement);
    }
    
    EchoCore.Debug.consoleWrite("render the node with id: " + node.getId());
    
    var expandoElement = document.createElement("td");
    expandoElement.id = this.component.renderId + "_expando_" + node.getId();
    expandoElement.appendChild(document.createTextNode("+"));
    trElement.appendChild(expandoElement);
    
    var tdElement = document.createElement("td");
    tdElement.id = this.component.renderId + "_node_" + node.getId();
    var span = maxDepth - depth + 1;
    tdElement.colSpan = span;
    tdElement.style.borderCollapse = "collapse";
    tdElement.style.border = "1px solid black";
    trElement.appendChild(tdElement);
    
    EchoCore.Debug.consoleWrite("creating methd ref");
    var clickRef = new EchoCore.MethodRef(this, this._processClick);
    EchoCore.Debug.consoleWrite("adding listener to expando element");
    EchoWebCore.EventProcessor.add(expandoElement, "click", clickRef, false);
    EchoCore.Debug.consoleWrite("adding listener to tr element");
    EchoWebCore.EventProcessor.add(tdElement, "click", clickRef, false);
    EchoCore.Debug.consoleWrite("done adding listener");
    
    var component = this.component.application.getComponentByRenderId(node.getId());
    EchoRender.renderComponentAdd(update, component, tdElement);
	
	parentElement.appendChild(trElement);

	var childCount = node.getChildNodeCount();
	for (var i = 0; i < childCount; ++i) {
	    var childNode = node.getChildNode(i);
	    this._renderNode(childNode, depth + 1, maxDepth, update, parentElement);
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
    this.component.fireEvent(new EchoCore.Event(this.component, "action"));
};

ExtrasRender.ComponentSync.RemoteTree.prototype._processClick = function(e) {
    var nodeId = this._getNodeIdFromElement(e.target);
    var rowIndex = this._getRowIndex(e.target.parentNode);
    EchoCore.Debug.consoleWrite("-click- | " + rowIndex);
};

ExtrasRender.ComponentSync.RemoteTree.prototype.renderDispose = function(update) {
    EchoCore.Debug.consoleWrite("disposing ...");
    //FIXME this will blow up performance, maybe cache all elements that have a click listener, 
    // but that will probably blow memory usage...
    var trElement = this._element.firstChild.firstChild;
    while (trElement) {
        var tdElement = trElement.firstChild;
        while (tdElement) {
            if (tdElement.id) {
                EchoWebCore.EventProcessor.removeAll(tdElement);
            }
            tdElement = tdElement.nextSibling;
        }
        trElement = trElement.nextSibling;
    }
    this._element = null;
};

ExtrasRender.ComponentSync.RemoteTree.prototype.renderUpdate = function(update) {
    // FIXME partial update / lazy rendering
    var element = this._element;
    var containerElement = element.parentNode;
    EchoRender.renderComponentDispose(update, update.parent);
    containerElement.removeChild(element);
    this.renderAdd(update, containerElement);
    return true;
};

EchoRender.registerPeer("nextapp.echo.extras.app.RemoteTree", ExtrasRender.ComponentSync.RemoteTree);
