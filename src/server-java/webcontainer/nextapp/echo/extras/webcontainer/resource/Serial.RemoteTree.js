Extras.Serial.RemoteTree = { 
};

Extras.Serial.RemoteTree.TreeStructure = { 

    toProperty: function(client, propertyElement) {
        var children = Core.Web.DOM.getChildElementsByTagName(propertyElement, "e");
        
        var structures = [];
        
        var treeStructure;
        var headerNode;
        for (var i = 0; i < children.length; ++i) {
            var childElement = children[i];
            var id = childElement.getAttribute("i");
            var parentId = childElement.getAttribute("p");
            var node = new Extras.RemoteTree.TreeNode(id, parentId);
            var expandedState = childElement.getAttribute("ex") == "1";
            var root = childElement.getAttribute("r") == "1";
            node.setExpanded(expandedState);
            node.setLeaf(childElement.getAttribute("l") == "1");
            var header = childElement.getAttribute("h") == "1";
            if (header) {
                headerNode = node;
            } else {
                if (root) {
                    treeStructure = new Extras.RemoteTree.TreeStructure(node);
                    if (headerNode) {
                        treeStructure.setHeaderNode(headerNode);
                        headerNode = null;
                    }
                    structures.push(treeStructure);
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
        structures.fullRefresh = (propertyElement.getAttribute("fr") == "1");
        return structures;
    }
};

Echo.Serial.addPropertyTranslator("Extras.Serial.TreeStructure", Extras.Serial.RemoteTree.TreeStructure);

Extras.Serial.RemoteTree.SelectionUpdate = {
    
    toXml: function(client, propertyElement, propertyValue) {
        if (propertyValue.clear) {
            propertyElement.setAttribute("c", "true");
        }
        if (propertyValue.hasRemovedSelections()) {
            propertyElement.setAttribute("r", propertyValue.getRemovedSelections().join());
        }
        if (propertyValue.hasAddedSelections()) {
            propertyElement.setAttribute("a", propertyValue.getAddedSelections().join());
        }
    }
};

Echo.Serial.addPropertyTranslator("Extras.RemoteTree.SelectionUpdate", 
        Extras.Serial.RemoteTree.SelectionUpdate);
