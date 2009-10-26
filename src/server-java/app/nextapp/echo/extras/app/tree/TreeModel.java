/* 
 * This file is part of the Echo Extras Project.
 * Copyright (C) 2005-2009 NextApp, Inc.
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

package nextapp.echo.extras.app.tree;

import java.io.Serializable;

import nextapp.echo.extras.app.event.TreeModelListener;

/**
 * Model for representing tree data.
 */
public interface TreeModel extends Serializable {

    /**
     * Adds a <code>TreeModelListener</code> to receive notification of events.
     * 
     * @param l the listener to remove
     */
    public void addTreeModelListener(TreeModelListener l);
    
    /**
     * Returns the child of the specified parent node at the specified index.
     * 
     * @param parent the parent node
     * @param index the child index
     * @return the child node
     */
    public Object getChild(Object parent, int index);

    /**
     * Returns the number of child nodes in the specified parent.
     * 
     * @param parent the parent node
     * @return the number of child nodes
     */
    public int getChildCount(Object parent);
    
    /**
     * Returns the type for the specified column index.
     * 
     * @param index the column index
     * @return the column class
     */
    public Class getColumnClass(int index);
    
    /**
     * Returns the number of available columns.
     * 
     * @return the column count
     */
    public int getColumnCount();
    
    /**
     * Returns the name for the specified column index.
     * 
     * @param index the column index
     * @return the name
     */
    public String getColumnName(int index);

    /**
     * Returns the index of the child within the parent.
     * 
     * @param parent the parent node
     * @param child the child node
     */
    public int getIndexOfChild(Object parent, Object child);
    
    /**
     * Returns the root node of the tree.
     * 
     * @return the root node object
     */
    public Object getRoot();

    /**
     * Returns the value to be displayed for node <code>node</code>, 
     * at column number <code>columnIndex</code>.
     * 
     * @param columnIndex the column index
     * @return the column value
     */
    public Object getValueAt(Object node, int columnIndex);

    /**
     * Determines whether the specified node is a leaf.  A leaf may not have children,
     * but a node without children is not required to be a leaf.
     * 
     * @param object the node object
     * @return true if the node object is a leaf
     */
    public boolean isLeaf(Object object);

    /**
     * Removes a <code>TreeModelListener</code> from receiving notification of events.
     * 
     * @param l the listener to remove
     */
    public void removeTreeModelListener(TreeModelListener l);
}
