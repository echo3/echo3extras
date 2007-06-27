ExtrasApp.RemoteTree = function() { };

ExtrasApp.RemoteTree.TreeStructure = function(rootNode) { 
	this.idNodeMap = new EchoCore.Collections.Map();
	this.rootNode = rootNode;
	this.addNode(rootNode);
};

ExtrasApp.RemoteTree.TreeStructure.prototype.getNode = function(id) {
	return this.idNodeMap.get(id);
};

ExtrasApp.RemoteTree.TreeStructure.prototype.addNode = function(node) {
	this.idNodeMap.put(node.getId(), node);
};

ExtrasApp.RemoteTree.TreeStructure.prototype.getRootNode = function() {
	return this.rootNode;
};

ExtrasApp.RemoteTree.TreeStructure.prototype.getMaxDepth = function() {
    return this._getDepth(this.rootNode);
};

ExtrasApp.RemoteTree.TreeStructure.prototype._getDepth = function(node) {
    //FIXME what about performance?
    var maxDepth = 0;
    var childCount = node.getChildNodeCount();
    for (var i = 0; i < childCount; ++i) {
        var childDepth = this._getDepth(node.getChildNode(i)) + 1;
        if (childDepth > maxDepth) {
            maxDepth = childDepth;
        }
    }
};

ExtrasApp.RemoteTree.TreeNode = function(id) { 
	this.id = id;
	this.childNodes = new Array();
	this.expanded = false;
	this.leaf = false;
};

ExtrasApp.RemoteTree.TreeNode.prototype.getId = function() {
	return this.id;
};

ExtrasApp.RemoteTree.TreeNode.prototype.addChildNode = function(node) {
	this.childNodes.push(node);
};

ExtrasApp.RemoteTree.TreeNode.prototype.getChildNode = function(index) {
	return this.childNodes[index];
};

ExtrasApp.RemoteTree.TreeNode.prototype.getChildNodeCount = function() {
	return this.childNodes.length;
};

ExtrasApp.RemoteTree.TreeNode.prototype.setExpanded = function(newState) {
	this.expanded = newState;
};

ExtrasApp.RemoteTree.TreeNode.prototype.isExpanded = function() {
	return this.expanded;
};

ExtrasApp.RemoteTree.TreeNode.prototype.setLeaf = function(newValue) {
	this.leaf = newValue;
};

ExtrasApp.RemoteTree.TreeNode.prototype.isLeaf = function() {
	return this.leaf;
};
