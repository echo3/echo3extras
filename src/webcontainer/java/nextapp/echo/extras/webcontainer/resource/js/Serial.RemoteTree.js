ExtrasSerial.PropertyTranslator.RemoteTree = function() { };

ExtrasSerial.PropertyTranslator.RemoteTree.TreeStructure = function() { };

ExtrasSerial.PropertyTranslator.RemoteTree.TreeStructure.toProperty = function(client, propertyElement) {
    var children = EchoWebCore.DOM.getChildElementsByTagName(propertyElement, "e");
    var treeStructure = new ExtrasApp.RemoteTree.TreeStructure();
    for (var i = 0; i < children.length; i++) {
    	var childElement = children[i];
    	var id = childElement.getAttribute("i");
        var depth = childElement.getAttribute("d");
        var node = new ExtrasApp.RemoteTree.TreeNode(id, depth);
        treeStructure.addNode(node);
    }
    return treeStructure;
};

EchoSerial.addPropertyTranslator("ExtrasSerial.TreeStructure", ExtrasSerial.PropertyTranslator.RemoteTree.TreeStructure);