ExtrasApp.RemoteTree = function() { };

ExtrasApp.RemoteTree.TreeStructure = function(rootNode) { 
    this._idNodeMap = new EchoCore.Collections.Map();
    this._rootNode = rootNode;
    this._headerNode = null;
    this.addNode(rootNode);
};

ExtrasApp.RemoteTree.TreeStructure.prototype.getNode = function(id) {
    return this._idNodeMap.get(id);
};

ExtrasApp.RemoteTree.TreeStructure.prototype.addNode = function(node) {
    this._idNodeMap.put(node.getId(), node);
    if (node.getParentId()) {
        var parentNode = this.getNode(node.getParentId());
        if (parentNode) {
            parentNode.addChildNode(node);
        }
        this.addChildNodes(node);
    }
};

ExtrasApp.RemoteTree.TreeStructure.prototype.addChildNodes = function(node) {
    var childCount = node.getChildNodeCount();
    for (var i = 0; i < childCount; ++i) {
        var childNode = node.getChildNode(i);
        this.addNode(childNode);
    }
};

ExtrasApp.RemoteTree.TreeStructure.prototype.removeNode = function(node) {
    this.removeChildNodes(node);
    if (node.getParentId()) {
        var parentNode = this.getNode(node.getParentId());
        this.getNode(node.getParentId()).removeChildNode(node);
    }
    this._idNodeMap.remove(node.getId());
};

ExtrasApp.RemoteTree.TreeStructure.prototype.removeChildNodes = function(node) {
    var childCount = node.getChildNodeCount();
    for (var i = 0; i < childCount; ++i) {
        var childNode = node.getChildNode(0);
        this.removeNode(childNode);
    }
};

ExtrasApp.RemoteTree.TreeStructure.prototype.getRootNode = function() {
    return this._rootNode;
};

ExtrasApp.RemoteTree.TreeStructure.prototype.getMaxDepth = function() {
    return this._getMaxDepth(this.getRootNode());
};

ExtrasApp.RemoteTree.TreeStructure.prototype._getMaxDepth = function(node) {
    //FIXME what about performance?
    var maxDepth = 0;
    var childCount = node.getChildNodeCount();
    for (var i = 0; i < childCount; ++i) {
        var childNode = node.getChildNode(i);
            var childDepth = this._getMaxDepth(childNode) + 1;
            if (childDepth > maxDepth) {
                maxDepth = childDepth;
            }
    }
    return maxDepth;
};

ExtrasApp.RemoteTree.TreeStructure.prototype.getNodeDepth = function(node) {
    var depth = 0;
    var parentNode = this.getNode(node.getParentId());
    while (parentNode) {
        ++depth;
        parentNode = this.getNode(parentNode.getParentId());
    }
    return depth;
};

ExtrasApp.RemoteTree.TreeStructure.prototype.hasNodeNextSibling = function(node) {
    if (!node.getParentId()) {
        return false;
    }
    var parentNode = this.getNode(node.getParentId());
    return parentNode.indexOf(node) < (parentNode.getChildNodeCount() - 1);
};

ExtrasApp.RemoteTree.TreeStructure.prototype.setHeaderNode = function(node) {
    this._headerNode = node;
    this.addNode(node);
};

ExtrasApp.RemoteTree.TreeStructure.prototype.getHeaderNode = function() {
    return this._headerNode;
};

ExtrasApp.RemoteTree.TreeStructure.prototype.toString = function() {
    var str = "treeStructure [\n";
    str += this.getNodeString(this.getRootNode(), "  ");
    str += "\n]";
    return str;
};

ExtrasApp.RemoteTree.TreeStructure.prototype.getNodeString = function(node, indentString) {
    var str = indentString + "node id=" + node._id;
    indentString += "  ";
    var childCount = node.getChildNodeCount();
    for (var i = 0; i < childCount; ++i) {
        str += "\n" + indentString + this.getNodeString(node.getChildNode(i), indentString + "  ");
    }
    return str;
};

ExtrasApp.RemoteTree.TreeNode = function(id, parentId) { 
    this._id = id;
    this._parentId = parentId;
    this._childNodes = new EchoCore.Collections.List();
    this._columns = new Array();
    this._expanded = false;
    this._leaf = false;
};

ExtrasApp.RemoteTree.TreeNode.prototype.getId = function() {
    return this._id;
};

ExtrasApp.RemoteTree.TreeNode.prototype.getParentId = function() {
    return this._parentId;
};

ExtrasApp.RemoteTree.TreeNode.prototype.containsChildNode = function(node) {
    return this._childNodes.indexOf(node) != -1;
};

ExtrasApp.RemoteTree.TreeNode.prototype.addChildNode = function(node) {
    if (!this.containsChildNode(node)) {
        this._childNodes.add(node);
    }
};

ExtrasApp.RemoteTree.TreeNode.prototype.removeChildNode = function(node) {
    this._childNodes.remove(this._childNodes.indexOf(node));
};

ExtrasApp.RemoteTree.TreeNode.prototype.getChildNode = function(index) {
    return this._childNodes.get(index);
};

ExtrasApp.RemoteTree.TreeNode.prototype.getChildNodeCount = function() {
    return this._childNodes.size();
};

ExtrasApp.RemoteTree.TreeNode.prototype.addColumn = function(columnId) {
    this._columns.push(columnId);
};

ExtrasApp.RemoteTree.TreeNode.prototype.getColumn = function(index) {
    return this._columns[index];
};

ExtrasApp.RemoteTree.TreeNode.prototype.setExpanded = function(newState) {
    this._expanded = newState;
};

ExtrasApp.RemoteTree.TreeNode.prototype.isExpanded = function() {
    return this._expanded;
};

ExtrasApp.RemoteTree.TreeNode.prototype.setLeaf = function(newValue) {
    this._leaf = newValue;
};

ExtrasApp.RemoteTree.TreeNode.prototype.isLeaf = function() {
    return this._leaf;
};

ExtrasApp.RemoteTree.TreeNode.prototype.indexOf = function(node) {
    return this._childNodes.indexOf(node);
};

ExtrasApp.RemoteTree.TreeNode.prototype.equals = function(that) {
    if (that == null || that._id == null) {
        return false;
    }
    return this._id == that._id;
};

ExtrasApp.RemoteTree.TreeNode.prototype.toString = function() {
    return "[node id: " + this._id + "]";
};
