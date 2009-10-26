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

import nextapp.echo.app.event.EventListenerList;
import nextapp.echo.extras.app.event.TreeModelEvent;
import nextapp.echo.extras.app.event.TreeModelListener;

public abstract class AbstractTreeModel 
implements TreeModel {

    protected EventListenerList listenerList = new EventListenerList();
    
    /**
     * @see nextapp.echo.extras.app.tree.TreeModel#addTreeModelListener(nextapp.echo.extras.app.event.TreeModelListener)
     */
    public void addTreeModelListener(TreeModelListener l) {
        listenerList.addListener(TreeModelListener.class, l);
    }

    /**
     * @see nextapp.echo.extras.app.tree.TreeModel#removeTreeModelListener(nextapp.echo.extras.app.event.TreeModelListener)
     */
    public void removeTreeModelListener(TreeModelListener l) {
        listenerList.removeListener(TreeModelListener.class, l);
    }
    
    /**
     * Returns column names using a "spreadsheet-style" convention, i.e., 
     * A, B, C...Y, Z, AA, AB, AC...
     * 
     * @see nextapp.echo.extras.app.tree.TreeModel#getColumnName(int)
     */
    public String getColumnName(int column) {
        StringBuffer sb = new StringBuffer();
        int value = column;
        do {
            int digit = value % 26;
            sb.insert(0, (char) ('A' + digit));
            value = value / 26 - 1;
        } while (value >= 0);
        
        return sb.toString();
    }
    
    /**
     * @see nextapp.echo.extras.app.tree.TreeModel#getColumnClass(int)
     */
    public Class getColumnClass(int column) {
        return Object.class;
    }
    
    /**
     * Notifies all listeners that have registered interest for notification on
     * this event type. The event instance is lazily created using the
     * parameters passed into the fire method.
     * 
     * @param source the node being changed
     * @param path the path to the root node
     * @param childIndices the indices of the changed elements
     * @param children the changed elements
     * @see EventListenerList
     */
    protected void fireTreeNodesChanged(Object source, Object[] path,
            int[] childIndices, Object[] children) {
        // Guaranteed to return a non-null array
        Object[] listeners = listenerList.getListeners(TreeModelListener.class);
        TreeModelEvent e = null;
        for (int i = 0; i < listeners.length; ++i) {
            // Lazily create the event:
            if (e == null) {
                e = new TreeModelEvent(source, path, childIndices, children);
            }
            ((TreeModelListener) listeners[i]).treeNodesChanged(e);
        }
    }

    /**
     * Notifies all listeners that have registered interest for notification on
     * this event type. The event instance is lazily created using the
     * parameters passed into the fire method.
     * 
     * @param source the node where new elements are being inserted
     * @param path the path to the root node
     * @param childIndices the indices of the new elements
     * @param children the new elements
     * @see EventListenerList
     */
    protected void fireTreeNodesInserted(Object source, Object[] path,
            int[] childIndices, Object[] children) {
        // Guaranteed to return a non-null array
        Object[] listeners = listenerList.getListeners(TreeModelListener.class);
        TreeModelEvent e = null;
        for (int i = 0; i < listeners.length; i++) {
            // Lazily create the event:
            if (e == null) {
                e = new TreeModelEvent(source, path, childIndices, children);
            }
            ((TreeModelListener) listeners[i]).treeNodesAdded(e);
        }
    }

    /**
     * Notifies all listeners that have registered interest for notification on
     * this event type. The event instance is lazily created using the
     * parameters passed into the fire method.
     * 
     * @param source the node where elements are being removed
     * @param path the path to the root node
     * @param childIndices the indices of the removed elements
     * @param children the removed elements
     * @see EventListenerList
     */
    protected void fireTreeNodesRemoved(Object source, Object[] path,
            int[] childIndices, Object[] children) {
        // Guaranteed to return a non-null array
        Object[] listeners = listenerList.getListeners(TreeModelListener.class);
        TreeModelEvent e = null;
        for (int i = 0; i < listeners.length; i++) {
            // Lazily create the event:
            if (e == null) {
                e = new TreeModelEvent(source, path, childIndices, children);
            }
            ((TreeModelListener) listeners[i]).treeNodesRemoved(e);
        }
    }

    /**
     * Notifies all listeners that have registered interest for notification on
     * this event type. The event instance is lazily created using the
     * parameters passed into the fire method.
     * 
     * @param source the node where the tree model has changed
     * @param path the path to the root node
     * @param childIndices the indices of the affected elements
     * @param children the affected elements
     * @see EventListenerList
     */
    protected void fireTreeStructureChanged(Object source, Object[] path,
            int[] childIndices, Object[] children) {
        // Guaranteed to return a non-null array
        Object[] listeners = listenerList.getListeners(TreeModelListener.class);
        TreeModelEvent e = null;
        for (int i = 0; i < listeners.length; i++) {
            // Lazily create the event:
            if (e == null)
                e = new TreeModelEvent(source, path, childIndices, children);
            ((TreeModelListener) listeners[i]).treeStructureChanged(e);
        }
    }
}
