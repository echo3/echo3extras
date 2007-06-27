ExtrasSerial.PropertyTranslator.RemoteTree = function() { };

ExtrasSerial.PropertyTranslator.RemoteTree.TreeStructure = function() { };

ExtrasSerial.PropertyTranslator.RemoteTree.TreeStructure.toProperty = function(client, propertyElement) {
    var children = EchoWebCore.DOM.getChildElementsByTagName(propertyElement, "e");
    var treeStructure;
    for (var i = 0; i < children.length; i++) {
    	var childElement = children[i];
    	var id = childElement.getAttribute("i");
        var node = new ExtrasApp.RemoteTree.TreeNode(id);
		var parentId = childElement.getAttribute("p");
		if (parentId) {
			var parentNode = treeStructure.getNode(parentId);
			parentNode.addChildNode(node);
            treeStructure.addNode(node);
		} else {
			treeStructure = new ExtrasApp.RemoteTree.TreeStructure(node);
		}
    }
    return treeStructure;
};

EchoSerial.addPropertyTranslator("ExtrasSerial.TreeStructure", ExtrasSerial.PropertyTranslator.RemoteTree.TreeStructure);