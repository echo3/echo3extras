ExtrasApp.RemoteTree = function() { };

ExtrasApp.RemoteTree.TreeStructure = function(rootNode) { 
	this.idNodeMap = new EchoCore.Collections.Map();
//	this.idNodeMap = new Object
	this.rootNode = rootNode;
};

ExtrasApp.RemoteTree.TreeStructure.prototype.getNode = function(id) {
	return this.idNodeMap.get(id);
};

ExtrasApp.RemoteTree.TreeStructure.prototype.addNode = function(node) {
	EchoCore.Debug.consoleWrite("add node to treestructure: " + node.getId());
	this.idNodeMap.put(node.getId(), node);
	EchoCore.Debug.consoleWrite(this.idNodeMap.toString());
};

ExtrasApp.RemoteTree.TreeStructure.prototype.getMaxDepth = function() {
	var maxDepth = 0;
	// FIXME hack hack
	for (var key in this.idNodeMap.associations) {
        var depth = this.idNodeMap.associations[key].getDepth();
        if (depth > maxDepth) {
        	maxDepth = depth;
        }
    }
    return maxDepth;
};

ExtrasApp.RemoteTree.TreeNode = function(id, depth) { 
	this.id = id;
	this.depth = depth;
};

ExtrasApp.RemoteTree.TreeNode.prototype.getId = function() {
	return this.id;
};

ExtrasApp.RemoteTree.TreeNode.prototype.getDepth = function() {
	return this.depth;
};