ExtrasSerial.PropertyTranslator.RemoteTree = function() { };

ExtrasSerial.PropertyTranslator.RemoteTree.TreeStructure = function() { };

ExtrasSerial.PropertyTranslator.RemoteTree.TreeStructure.toProperty = function(client, propertyElement) {
    var children = EchoWebCore.DOM.getChildElementsByTagName(propertyElement, "e");
    var treeStructure;
    var headerNode;
    for (var i = 0; i < children.length; ++i) {
        var childElement = children[i];
        var id = childElement.getAttribute("i");
        var parentId = childElement.getAttribute("p");
        var node = new ExtrasApp.RemoteTree.TreeNode(id, parentId);
        var expandedState = childElement.getAttribute("ex") == "1";
        node.setExpanded(expandedState);
        node.setLeaf(childElement.getAttribute("l") == "1");
        var header = childElement.getAttribute("h") == "1";
        if (header) {
            headerNode = node;
        } else {
            if (!treeStructure) {
                treeStructure = new ExtrasApp.RemoteTree.TreeStructure(node);
            } else {
                treeStructure.addNode(node);
            }
        }
        
        var columns = childElement.childNodes;
        for (var c = 0; c < columns.length; ++c) {
            var columnElement = columns[c];
            var columnId = columnElement.getAttribute("i");
            node.addColumn(columnId);
        }
    }
    treeStructure.setHeaderNode(headerNode);
    return treeStructure;
};

EchoSerial.addPropertyTranslator("ExtrasSerial.TreeStructure", ExtrasSerial.PropertyTranslator.RemoteTree.TreeStructure);