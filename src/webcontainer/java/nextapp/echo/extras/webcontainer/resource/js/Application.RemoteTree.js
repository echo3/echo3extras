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

ExtrasApp.RemoteTree = function() { };

/**
 * Creates a new TreeStructure object.
 * 
 * @param {ExtrasApp.RemoteTree.TreeNode} rootNode the root node
 * 
 * @constructor
 * @class Class for managing the tree structure. The tree structure is based on nodes 
 *          (ExtrasApp.RemoteTree.TreeNode) that have an id. This class stores all nodes
 *          in a map based on their id. 
 */
ExtrasApp.RemoteTree.TreeStructure = function(rootNode) { 
    this._idNodeMap = new EchoCore.Collections.Map();
    this._rootNode = rootNode;
    this._headerNode = null;
    this.addNode(rootNode);
};

/**
 * Gets the node with the given id.
 * 
 * @param id the id of the node
 * 
 * @return the node
 * @type ExtrasApp.RemoteTree.TreeNode
 */
ExtrasApp.RemoteTree.TreeStructure.prototype.getNode = function(id) {
    return this._idNodeMap.get(id);
};

/**
 * Adds node to this structure. If node has a parent id, the node will be added
 * to the node with the parent id. Any child nodes will be added as well.
 * 
 * @param {ExtrasApp.RemoteTree.TreeNode} node the node to add
 */
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

/**
 * Adds all child nodes of node to this structure.
 * 
 * @see #addNode
 * 
 * @param {ExtrasApp.RemoteTree.TreeNode} node the node to add the child nodes from
 */
ExtrasApp.RemoteTree.TreeStructure.prototype.addChildNodes = function(node) {
    var childCount = node.getChildNodeCount();
    for (var i = 0; i < childCount; ++i) {
        var childNode = node.getChildNode(i);
        this.addNode(childNode);
    }
};

/**
 * Removes the given node from this structure. If node provides a parent id
 * this method will remove the node from it's parent node. Any child nodes 
 * will be automatically removed.
 * 
 * @param {ExtrasApp.RemoteTree.TreeNode} node the node to remove
 */
ExtrasApp.RemoteTree.TreeStructure.prototype.removeNode = function(node) {
    this.removeChildNodes(node);
    if (node.getParentId()) {
        var parentNode = this.getNode(node.getParentId());
        this.getNode(node.getParentId()).removeChildNode(node);
    }
    this._idNodeMap.remove(node.getId());
};

/**
 * Removes all child node of the given node from this structure.
 * 
 * @see removeNode
 * 
 * @param {ExtrasApp.RemoteTree.TreeNode} node the node to remove the child nodes of
 */
ExtrasApp.RemoteTree.TreeStructure.prototype.removeChildNodes = function(node) {
    var childCount = node.getChildNodeCount();
    for (var i = 0; i < childCount; ++i) {
        var childNode = node.getChildNode(0);
        this.removeNode(childNode);
    }
};

/**
 * Gets the root node of this structure.
 * 
 * @return the root node
 * @type ExtrasApp.RemoteTree.TreeNode
 */
ExtrasApp.RemoteTree.TreeStructure.prototype.getRootNode = function() {
    return this._rootNode;
};

/**
 * Gets the depth of the deepest visible node. The root node is at depth 1, every
 * level increments the depth by one.
 * 
 * @return the maximum depth
 * @type Integer
 */
ExtrasApp.RemoteTree.TreeStructure.prototype.getMaxDepth = function() {
    return this._getMaxDepth(this.getRootNode());
};

ExtrasApp.RemoteTree.TreeStructure.prototype._getMaxDepth = function(node) {
    //FIXME what about performance?
    var maxDepth = 0;
    if (node.isExpanded()) {
        var childCount = node.getChildNodeCount();
        for (var i = 0; i < childCount; ++i) {
            var childNode = node.getChildNode(i);
            var childDepth = this._getMaxDepth(childNode);
            if (childDepth > maxDepth) {
                maxDepth = childDepth;
            }
        }
    }
    return maxDepth + 1;
};

/**
 * Gets the depth of node.
 * 
 * @see getMaxDepth
 * 
 * @param {ExtrasApp.RemoteTree.TreeNode} node the node to get the depth for
 * 
 * @return the depth of node
 * @type Integer
 */
ExtrasApp.RemoteTree.TreeStructure.prototype.getNodeDepth = function(node) {
    var depth = 1;
    var parentNode = this.getNode(node.getParentId());
    while (parentNode) {
        ++depth;
        parentNode = this.getNode(parentNode.getParentId());
    }
    return depth;
};

/**
 * Determines whether node has a next sibling on the same level.
 * 
 * @param {ExtrasApp.RemoteTree.TreeNode} node the node to check
 * 
 * @return true if node has a next sibling, false if not
 * @type Boolean
 */
ExtrasApp.RemoteTree.TreeStructure.prototype.hasNodeNextSibling = function(node) {
    if (!node.getParentId()) {
        return false;
    }
    var parentNode = this.getNode(node.getParentId());
    return parentNode.indexOf(node) < (parentNode.getChildNodeCount() - 1);
};

/**
 * Gets the next sibling of node.
 * 
 * @param {ExtrasApp.RemoteTree.TreeNode} node the node to get the next sibling for
 * @param {Boolean} useParentSibling if true, the next sibling of the parent node of node
 *          will be returned if node has no next sibling on the same level
 * 
 * @return the next sibling, or null if it does not exist.
 * @type ExtrasApp.RemoteTree.TreeNode
 */
ExtrasApp.RemoteTree.TreeStructure.prototype.getNodeNextSibling = function(node, useParentSibling) {
    if (!node.getParentId()) {
        return null;
    }
    var parentNode = this.getNode(node.getParentId());
    if (!this.hasNodeNextSibling(node)) {
        if (useParentSibling) {
            return this.getNodeNextSibling(parentNode, true);
        } else {
            return null;
        }
    }
    return parentNode.getChildNode(parentNode.indexOf(node) + 1);
};

/**
 * Sets the header node.
 * 
 * @param the node that represents the header row
 */
ExtrasApp.RemoteTree.TreeStructure.prototype.setHeaderNode = function(node) {
    this._headerNode = node;
    this.addNode(node);
};

/**
 * Gets the header node. The header node is not part of the structure.
 * 
 * @return the node that represents the header row
 * @type ExtrasApp.RemoteTree.TreeNode
 */
ExtrasApp.RemoteTree.TreeStructure.prototype.getHeaderNode = function() {
    return this._headerNode;
};

/**
 * Returns a depth-first iterator that iterates through node and all it's child nodes.
 * 
 * @param {ExtrasApp.RemoteTree.TreeNode} node the node to start the iteration
 * @param {Boolean} includeHidden true if hidden nodes should be included, false if not
 * @param {ExtrasApp.RemoteTree.TreeNode} endNode the node that ends the iteration, if endNode
 *          is encountered the iterator stops and returns null for subsequent calls
 * 
 * @return the iterator
 * @type Object
 */
ExtrasApp.RemoteTree.TreeStructure.prototype.iterator = function(node, includeHidden, endNode) {
    if (!endNode) {
        endNode = node;
    }
    var structure = this;
    return {
        currNode: null,
        endNode: structure.getNodeNextSibling(endNode),
        end: false,
        _nextNode: null,
        nextNode: function() {
            if (!this.hasNext()) {
                return null;
            }
            this.currNode = this._nextNode;
            this._nextNode = null;
            return this.currNode;
        },
        hasNext: function() {
            if (this.end) {
                return false;
            }
            var next;
            if (this._nextNode) {
                next = this._nextNode;
            } else {
                next = this._getNext();
                this._nextNode = next;
            }
            if (!next || next.equals(this.endNode)) {
                this.end = true;
                return false;
            }
            return true;
        },
        _getNext: function() {
            if (this.currNode) {
                if (this.currNode.getChildNodeCount() > 0 && (includeHidden || this.currNode.isExpanded())) {
                    return this.currNode.getChildNode(0);
                } else {
                    return structure.getNodeNextSibling(this.currNode, true);
                }
            } else {
                return node;
            }
        }
    };
};

/**
 * Gets a string representation of this tree structure
 */
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

/**
 * Constructs a new tree node object
 * 
 * @param id the id of the node
 * @param parentId the id of the parent node, null is only allowed for the root node
 * 
 * @constructor
 * @class Represents a tree node
 */
ExtrasApp.RemoteTree.TreeNode = function(id, parentId) { 
    this._id = id;
    this._parentId = parentId;
    this._childNodes = new EchoCore.Collections.List();
    this._columns = new Array();
    this._expanded = false;
    this._leaf = false;
};

/**
 * Gets the id of this node
 * 
 * @return the id
 */
ExtrasApp.RemoteTree.TreeNode.prototype.getId = function() {
    return this._id;
};

/**
 * Gets the id of the parent node, if null, this node is considered the root node.
 * 
 * @return the id of the parent node
 */
ExtrasApp.RemoteTree.TreeNode.prototype.getParentId = function() {
    return this._parentId;
};

/**
 * Determines if node is a child node of this node.
 * 
 * @param {ExtrasApp.RemoteTree.TreeNode} node the node to check
 * 
 * @return true if node is a child node of this node, false otherwise
 * @type Boolean
 */
ExtrasApp.RemoteTree.TreeNode.prototype.containsChildNode = function(node) {
    return this._childNodes.indexOf(node) != -1;
};

/**
 * Adds node as a child node to this node.
 * 
 * @param {ExtrasApp.RemoteTree.TreeNode} node the node to add
 */
ExtrasApp.RemoteTree.TreeNode.prototype.addChildNode = function(node) {
    if (!this.containsChildNode(node)) {
        this._childNodes.add(node);
    }
};

/**
 * Removes node as a child node of this node.
 * 
 * @param {ExtrasApp.RemoteTree.TreeNode} node the node to remove as a child node
 */
ExtrasApp.RemoteTree.TreeNode.prototype.removeChildNode = function(node) {
    this._childNodes.remove(this._childNodes.indexOf(node));
};

/**
 * Gets the child at index index of this node's child array.
 * 
 * @param {Integer} index the index of the child node
 * 
 * @return the child node at the given index, or null if the index is invalid
 * @type ExtrasApp.RemoteTree.TreeNode
 */
ExtrasApp.RemoteTree.TreeNode.prototype.getChildNode = function(index) {
    return this._childNodes.get(index);
};

/**
 * Gets the amount of child nodes of this node.
 * 
 * @return the amount of child nodes
 * @type Integer 
 */
ExtrasApp.RemoteTree.TreeNode.prototype.getChildNodeCount = function() {
    return this._childNodes.size();
};

/**
 * Adds column to this node.
 * 
 * @param columnId the id of the column 
 */
ExtrasApp.RemoteTree.TreeNode.prototype.addColumn = function(columnId) {
    this._columns.push(columnId);
};

/**
 * Gets the id of the column at the given index of this node's column array
 * 
 * @param {Integer} index the index of the column
 * 
 * @return the column id
 */
ExtrasApp.RemoteTree.TreeNode.prototype.getColumn = function(index) {
    return this._columns[index];
};

/**
 * Sets the expanded state of this node.
 * 
 * @param {Boolean} newState the new expanded state
 */
ExtrasApp.RemoteTree.TreeNode.prototype.setExpanded = function(newState) {
    this._expanded = newState;
};

/**
 * Gets the expanded state of this node.
 * 
 * @return true if this node is expanded, false if not
 * @type Boolean
 */
ExtrasApp.RemoteTree.TreeNode.prototype.isExpanded = function() {
    return this._expanded;
};

/**
 * Sets whether this node is a leaf or not.
 * 
 * @param {Boolean} newValue true if this node is a leaf, false if not
 */
ExtrasApp.RemoteTree.TreeNode.prototype.setLeaf = function(newValue) {
    this._leaf = newValue;
};

/**
 * Determines whether this node is a leaf or not.
 * 
 * @return true if this node is a leaf, false if not
 * @type Boolean
 */
ExtrasApp.RemoteTree.TreeNode.prototype.isLeaf = function() {
    return this._leaf;
};

/**
 * Gets the index of node in the node's child array.
 * 
 * @param {ExtrasApp.RemoteTree.TreeNode} node the node to get the index for
 * 
 * @return the index of node, -1 if node is not a child node of this node
 * @type Integer
 */
ExtrasApp.RemoteTree.TreeNode.prototype.indexOf = function(node) {
    return this._childNodes.indexOf(node);
};

/**
 * Checks if this node is equal to that.
 * 
 * @param {ExtrasApp.RemoteTree.TreeNode} that the node to test
 * 
 * @return true if the nodes are equal, false if not
 * @type Boolean
 */
ExtrasApp.RemoteTree.TreeNode.prototype.equals = function(that) {
    if (that == null || that._id == null) {
        return false;
    }
    return this._id == that._id;
};

/**
 * Returns a string representation of this node.
 * 
 * @return the string representation
 * @type String
 */
ExtrasApp.RemoteTree.TreeNode.prototype.toString = function() {
    return "[node id: " + this._id + "]";
};

/**
 * Creates a new selection update
 * 
 * @constructor
 * @class Class to keep track of selection updates.
 */
ExtrasApp.RemoteTree.SelectionUpdate = function() {
    this._addedSelections = new Array();
    this._removedSelections = new Array();
    /**
     * indicating whether the selection must be cleared before applying this update.
     */
    this.clear = false;
};

ExtrasApp.RemoteTree.SelectionUpdate.prototype.className = "ExtrasApp.RemoteTree.SelectionUpdate";

/**
 * Adds row to the added selections of this update
 * 
 * @param row the row to add
 */
ExtrasApp.RemoteTree.SelectionUpdate.prototype.addSelection = function(row) {
    this._addedSelections.push(row);
};

/**
 * Adds row to the removed selections of this update
 * 
 * @param row the row to add
 */
ExtrasApp.RemoteTree.SelectionUpdate.prototype.removeSelection = function(row) {
    this._removedSelections.pus(row);
};

/**
 * Checks if this update object contains added selections.
 * 
 * @return true if we have added selections
 * @type Boolean
 */
ExtrasApp.RemoteTree.SelectionUpdate.prototype.hasAddedSelections = function() {
    return this._addedSelections.length > 0;
};

/**
 * Checks if this update object contains removed selections.
 * 
 * @return true if we have removed selections
 * @type Boolean
 */
ExtrasApp.RemoteTree.SelectionUpdate.prototype.hasRemovedSelections = function() {
    return this._removedSelections.length > 0;
};

/**
 * Gets all added selections.
 * 
 * @return an array of all added selections
 * @type Array
 */
ExtrasApp.RemoteTree.SelectionUpdate.prototype.getAddedSelections = function() {
    return this._addedSelections;
};

/**
 * Gets all removed selections.
 * 
 * @return an array of all removed selections
 * @type Array
 */
ExtrasApp.RemoteTree.SelectionUpdate.prototype.getRemovedSelections = function() {
    return this._removedSelections;
};

/**
 * Minimalistic representation of TreeSelectionModel.
 * 
 * @param {Number} selectionMode the selectionMode
 * @constructor
 */
ExtrasApp.TreeSelectionModel = function(selectionMode) { 
    this._selectionState = new EchoCore.Collections.Set();
    this._selectionMode = selectionMode;
};

/**
 * Value for selection mode setting indicating single selection.
 * 
 * @type Number
 * @final
 */
ExtrasApp.TreeSelectionModel.SINGLE_SELECTION = 0;

/**
 * Value for selection mode setting indicating multiple selection.
 * 
 * @type Number
 * @final
 */
ExtrasApp.TreeSelectionModel.MULTIPLE_SELECTION = 2;

/**
 * Returns whether the model is in single-selection mode. 
 * 
 * @return true if in single-selection mode
 * @type Boolean
 */
ExtrasApp.TreeSelectionModel.prototype.isSingleSelection = function() {
    return this._selectionMode == ExtrasApp.TreeSelectionModel.SINGLE_SELECTION;
};

/**
 * Gets the selection mode.
 * 
 * @return the selection mode
 * @type Number
 */
ExtrasApp.TreeSelectionModel.prototype.getSelectionMode = function() {
    return this._selectionMode;
};

/**
 * Adds node to the current selection.
 * 
 * @param node the node to add to the selection
 */
ExtrasApp.TreeSelectionModel.prototype.addSelectedNode = function(node) {
    this._selectionState.add(node);
};

/**
 * Removes node from the current selection
 * 
 * @param node the node to remove from the selection
 */
ExtrasApp.TreeSelectionModel.prototype.removeSelectedNode = function(node) {
    this._selectionState.remove(node);
};

/**
 * Sets the selection state of node.
 * If newValue is false, the node is removed from the current selection. 
 * If newValue is true, the node is added to the current selection.
 * 
 * @see #addSelectedNode
 * @see #removeSelectedNode
 * 
 * @param node the node
 * @param {Boolean} newValue the new selection state
 */
ExtrasApp.TreeSelectionModel.prototype.setSelectionState = function(node, newValue) {
    if (newValue) {
        this.addSelectedNode(node);
    } else {
        this.removeSelectedNode(node);
    }
};

/**
 * Gets an array of the currently selected nodes. 
 * This array may be iterated, but should not be modified.
 * 
 * @return the currently selected nodes
 * @type Array
 */
ExtrasApp.TreeSelectionModel.prototype.getSelectedNodes = function() {
    return this._selectionState.items;
};

/**
 * Determines whether a node is selected.
 * 
 * @param node the node
 * 
 * @return true if the node is selected, false if not
 * @type Boolean 
 */
ExtrasApp.TreeSelectionModel.prototype.isNodeSelected = function(node) {
    return this._selectionState.contains(node);
};

/**
 * Determines whether the selection model is empty
 * 
 * @return true if no nodes are selected
 * @type Boolean
 */
ExtrasApp.TreeSelectionModel.prototype.isSelectionEmpty = function() {
    return this._selectionState.size() == 0;
};

/**
 * Checks if the given array with node ids contains the same nodes as the 
 * current selection.
 * 
 * @param {Array} array of node ids
 * 
 * @return true if the array is equal to the current selection, false if not
 * @type Boolean
 */
ExtrasApp.TreeSelectionModel.prototype.equalsSelectionIdArray = function(selection) {
    var size = this._selectionState.size();
    if (size != selection.length) {
        return false;
    }
    for (var i = 0; i < size; ++i) {
        if (EchoCore.Arrays.indexOf(selection, this._selectionState.items[i].getId()) == -1) {
            return false;
        }
    }
    return true;
};
