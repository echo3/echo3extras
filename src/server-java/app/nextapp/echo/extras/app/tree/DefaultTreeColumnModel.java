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

import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.EventListener;
import java.util.Iterator;
import java.util.List;

import nextapp.echo.app.event.EventListenerList;
import nextapp.echo.extras.app.event.TreeColumnModelEvent;
import nextapp.echo.extras.app.event.TreeColumnModelListener;

/**
 * The default <code>TreeColumnModel</code> implementation.
 */
public class DefaultTreeColumnModel
implements TreeColumnModel {
    
    private class ColumnChangeForwarder 
    implements PropertyChangeListener, Serializable {
        
        public void propertyChange(PropertyChangeEvent evt) {
            int index = columns.indexOf(evt.getSource());
            TreeColumnModelEvent event = new TreeColumnModelEvent(DefaultTreeColumnModel.this, index, index);
            fireColumnResized(event);
        }
    };
    
    private ColumnChangeForwarder columnChangeForwarder = new ColumnChangeForwarder();
    
    /**
     * A collection of all columns in the column model in order.
     */
    private List columns = new ArrayList();
    
    /**
     * A listener storage facility.
     */
    protected EventListenerList listenerList = new EventListenerList();
    
    /**
     * Creates a new DefaultTreeColumnModel.
     */
    public DefaultTreeColumnModel() {
        super();
    }
    
    /**
     * @see nextapp.echo.extras.app.tree.TreeColumnModel#addColumn(nextapp.echo.extras.app.tree.TreeColumn)
     */
    public void addColumn(TreeColumn column) {
        columns.add(column);
        column.addPropertyChangeListener(columnChangeForwarder);
        fireColumnAdded(new TreeColumnModelEvent(this, -1, columns.size() - 1));
    }
    
    /**
     * @see nextapp.echo.extras.app.tree.TreeColumnModel#addColumnModelListener(nextapp.echo.extras.app.event.TreeColumnModelListener)
     */
    public void addColumnModelListener(TreeColumnModelListener l) {
        listenerList.addListener(TreeColumnModelListener.class, l);
    }
        
    /**
     * Notifies <code>TreeColumnModelListener</code>s that a column was 
     * added.
     *
     * @param e the <code>TreeColumnModelEvent</code> to fire
     */
    protected void fireColumnAdded(TreeColumnModelEvent e) {
        EventListener[] listeners = listenerList.getListeners(TreeColumnModelListener.class);
        
        for (int index = 0; index < listeners.length; ++index) {
            ((TreeColumnModelListener) listeners[index]).columnAdded(e);
        }   
    }
    
    /**
     * Notifies <code>TreeColumnModelListener</code>s that a column was 
     * moved.
     *
     * @param e the <code>TreeColumnModelEvent</code> to fire
     */
    protected void fireColumnMoved(TreeColumnModelEvent e) {
        EventListener[] listeners = listenerList.getListeners(TreeColumnModelListener.class);
        
        for (int index = 0; index < listeners.length; ++index) {
            ((TreeColumnModelListener) listeners[index]).columnMoved(e);
        }   
    }
    
    /**
     * Notifies <code>TreeColumnModelListener</code>s that a column was 
     * removed.
     *
     * @param e the <code>TreeColumnModelEvent</code> to fire
     */
    protected void fireColumnRemoved(TreeColumnModelEvent e) {
        EventListener[] listeners = listenerList.getListeners(TreeColumnModelListener.class);
        
        for (int index = 0; index < listeners.length; ++index) {
            ((TreeColumnModelListener) listeners[index]).columnRemoved(e);
        }   
    }
    
    /**
     * Notifies <code>TreeColumnModelListener</code>s that a column was 
     * resized.
     *
     * @param e the <code>TreeColumnModelEvent</code> to fire
     */
    protected void fireColumnResized(TreeColumnModelEvent e) {
        EventListener[] listeners = listenerList.getListeners(TreeColumnModelListener.class);

        for (int index = 0; index < listeners.length; ++index) {
            ((TreeColumnModelListener) listeners[index]).columnResized(e);
        }
    }
    
    /**
     * @see nextapp.echo.extras.app.tree.TreeColumnModel#getColumn(int)
     */
    public TreeColumn getColumn(int index) {
        if ((getColumnCount() - 1) < index) {
            return null;
        }

        return (TreeColumn) columns.get(index);
    }
    
    /**
     * @see nextapp.echo.extras.app.tree.TreeColumnModel#getColumnCount()
     */
    public int getColumnCount() {
        return columns.size();
    }
    
    /**
     * @see nextapp.echo.extras.app.tree.TreeColumnModel#getColumnIndex(java.lang.Object)
     */
    public int getColumnIndex(Object identifier) {
        if (identifier == null) {
            throw new IllegalArgumentException("Null not allowed as identifier value.");
        }
    
        Iterator it = columns.iterator();
        int index = 0;
        
        while (it.hasNext()) {
            TreeColumn column = (TreeColumn) it.next();
            if (identifier.equals(column.getIdentifier())) {
                return index;
            }
            ++index;
        }
        
        throw new IllegalArgumentException("No column found with specified identifier: " + identifier);
    }
    
    /**
     * @see nextapp.echo.extras.app.tree.TreeColumnModel#getColumns()
     */
    public Iterator getColumns() {
        return columns.iterator();
    }
    
    /**
     * @see nextapp.echo.extras.app.tree.TreeColumnModel#moveColumn(int, int)
     */
    public void moveColumn(int columnIndex, int newIndex) {
        if (columnIndex < 0 || columnIndex >= columns.size()) {
            throw new IllegalArgumentException("No column exists at index: " + columnIndex);
        }
        if (newIndex < 0 || newIndex >= columns.size()) {
            throw new IllegalArgumentException("Attempt to move column to invalid index: " + newIndex);
        }
        
        TreeColumn column = (TreeColumn) columns.remove(columnIndex);
        columns.add(newIndex, column);
        fireColumnMoved(new TreeColumnModelEvent(this, columnIndex, newIndex));
    }
    
    /**
     * @see nextapp.echo.extras.app.tree.TreeColumnModel#removeColumn(nextapp.echo.extras.app.tree.TreeColumn)
     */
    public void removeColumn(TreeColumn column) {
        int columnIndex = columns.indexOf(column);
        if (columnIndex == -1) {
            // Do nothing, column is not in model.
            return;
        }
        column.removePropertyChangeListener(columnChangeForwarder);
        columns.remove(columnIndex);
        fireColumnAdded(new TreeColumnModelEvent(this, columnIndex, -1));
    }
    
    /**
     * @see nextapp.echo.extras.app.tree.TreeColumnModel#removeColumnModelListener(nextapp.echo.extras.app.event.TreeColumnModelListener)
     */
    public void removeColumnModelListener(TreeColumnModelListener l) {
        listenerList.removeListener(TreeColumnModelListener.class, l);
    }
}
