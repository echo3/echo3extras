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
    if (headerNode) {
        treeStructure.setHeaderNode(headerNode);
    }
    return treeStructure;
};

EchoSerial.addPropertyTranslator("ExtrasSerial.TreeStructure", ExtrasSerial.PropertyTranslator.RemoteTree.TreeStructure);

ExtrasSerial.PropertyTranslator.RemoteTree.SelectionUpdate = function() { };

ExtrasSerial.PropertyTranslator.RemoteTree.SelectionUpdate.toXml = function(client, propertyElement, propertyValue) {
    if (propertyValue.clear) {
        propertyElement.setAttribute("c", "true");
    }
    if (propertyValue.hasRemovedSelections()) {
        propertyElement.setAttribute("r", propertyValue.getRemovedSelections().join());
    }
    if (propertyValue.hasAddedSelections()) {
        EchoCore.Debug.consoleWrite("a: " + propertyValue.getAddedSelections());
        EchoCore.Debug.consoleWrite("a(b): " + propertyValue.getAddedSelections().join());
        propertyElement.setAttribute("a", propertyValue.getAddedSelections().join());
    }
};

EchoSerial.addPropertyTranslator("ExtrasApp.RemoteTree.SelectionUpdate", ExtrasSerial.PropertyTranslator.RemoteTree.SelectionUpdate);
