/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2007 NextApp, Inc.
 *
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 */

ExtrasSerial.PropertyTranslator.RemoteTree = function() { };

ExtrasSerial.PropertyTranslator.RemoteTree.TreeStructure = function() { };

ExtrasSerial.PropertyTranslator.RemoteTree.TreeStructure.toProperty = function(client, propertyElement) {
    var children = EchoWebCore.DOM.getChildElementsByTagName(propertyElement, "e");
    
    var structures = new Array();
    
    var treeStructure;
    var headerNode;
    for (var i = 0; i < children.length; ++i) {
        var childElement = children[i];
        var id = childElement.getAttribute("i");
        var parentId = childElement.getAttribute("p");
        var node = new ExtrasApp.RemoteTree.TreeNode(id, parentId);
        var expandedState = childElement.getAttribute("ex") == "1";
        var root = childElement.getAttribute("r") == "1";
        node.setExpanded(expandedState);
        node.setLeaf(childElement.getAttribute("l") == "1");
        var header = childElement.getAttribute("h") == "1";
        if (header) {
            headerNode = node;
        } else {
            if (root) {
                treeStructure = new ExtrasApp.RemoteTree.TreeStructure(node);
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
    if (structures.length == 1) {
        return treeStructure;
    }
    return structures;
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
        propertyElement.setAttribute("a", propertyValue.getAddedSelections().join());
    }
};

EchoSerial.addPropertyTranslator("ExtrasApp.RemoteTree.SelectionUpdate", ExtrasSerial.PropertyTranslator.RemoteTree.SelectionUpdate);
