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
    
    var tbodyElement = document.createElement("tbody");
    tableElement.appendChild(tbodyElement);
    
    var treeStructure = this.component.getProperty("treeStructure");
    var maxDepth = treeStructure.getMaxDepth();
    //var nodes = treeStructure.getNodes();
    var childCount = this.component.getComponentCount();
    for (var i = 0; i < childCount; ++i) {
	    var trElement = document.createElement("tr");
	    
	    //var span = maxDepth - depth;
	    var child = this.component.getComponent(i);
	    var childNode = treeStructure.getNode(child.renderId);
	    EchoCore.Debug.consoleWrite("get node for renderid: " + child.renderId + ", childNode: " + childNode);
	    var depth = childNode.getDepth();
	    
	    for (var c = 0; c < depth; ++c) {
	        var rowHeaderElement = document.createElement("td");
	        rowHeaderElement.appendChild(document.createTextNode("-"));
	        trElement.appendChild(rowHeaderElement);
	    }
	    
	    var tdElement = document.createElement("td");
	    trElement.appendChild(tdElement);
	    
	    
	    EchoRender.renderComponentAdd(update, child, tdElement);

        tbodyElement.appendChild(trElement);	    
    }
    
    parentElement.appendChild(tableElement);
};



ExtrasRender.ComponentSync.RemoteTree.prototype.renderDispose = function(update) {
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
