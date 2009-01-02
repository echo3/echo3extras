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
import java.util.Arrays;
import java.util.EventListener;
import java.util.LinkedHashSet;

import nextapp.echo.app.event.ChangeEvent;
import nextapp.echo.app.event.ChangeListener;
import nextapp.echo.app.event.EventListenerList;

public class DefaultTreeSelectionModel implements TreeSelectionModel {
    
    private EventListenerList listenerList = new EventListenerList();
    private int selectionMode = SINGLE_SELECTION;
    private LinkedHashSet paths = new LinkedHashSet();
    
    /**
     * @see nextapp.echo.extras.app.tree.TreeSelectionModel#addChangeListener(nextapp.echo.app.event.ChangeListener)
     */
    public void addChangeListener(ChangeListener l) {
        listenerList.addListener(ChangeListener.class, l);
    }
    
    /**
     * @see nextapp.echo.extras.app.tree.TreeSelectionModel#addPropertyChangeListener(java.beans.PropertyChangeListener)
     */
    public void addPropertyChangeListener(PropertyChangeListener l) {
        listenerList.addListener(PropertyChangeListener.class, l);
    }

    /**
     * @see nextapp.echo.extras.app.tree.TreeSelectionModel#addSelectionPath(nextapp.echo.extras.app.tree.TreePath)
     */
    public void addSelectionPath(TreePath path) {
        if (path == null) {
            return;
        }
        addSelectionPaths(new TreePath[] {path});
    }

    /**
     * @see nextapp.echo.extras.app.tree.TreeSelectionModel#addSelectionPaths(nextapp.echo.extras.app.tree.TreePath[])
     */
    public void addSelectionPaths(TreePath[] paths) {
        if (paths == null || paths.length == 0) {
            return;
        }
        if (SINGLE_SELECTION == getSelectionMode()) {
        	if (paths[0].equals(getSelectionPath())) {
        		// don't change when same selection path is set
        		return;
        	}
        	boolean changed = !this.paths.isEmpty();
            this.paths.clear();
            changed |= this.paths.add(paths[0]);
            if (changed) {
            	fireValueChanged();
            }
        } else {
            if (this.paths.addAll(Arrays.asList(paths))) {
                fireValueChanged();
            }
        }
    }

    /**
     * @see nextapp.echo.extras.app.tree.TreeSelectionModel#clearSelection()
     */
    public void clearSelection() {
        if (!isSelectionEmpty()) {
            paths.clear();
            fireValueChanged();
        }
    }
    
    /**
     * Notifies <code>ChangeListener</code>s that the selection has 
     * changed.
     */
    protected void fireValueChanged() {
        ChangeEvent e = new ChangeEvent(this);
        EventListener[] listeners = listenerList.getListeners(ChangeListener.class);
        for (int index = 0; index < listeners.length; ++index) {
            ((ChangeListener) listeners[index]).stateChanged(e);
        }
    }

    /**
     * @see nextapp.echo.extras.app.tree.TreeSelectionModel#getSelectionMode()
     */
    public int getSelectionMode() {
        return selectionMode;
    }

    /**
     * @see nextapp.echo.extras.app.tree.TreeSelectionModel#getSelectionPath()
     */
    public TreePath getSelectionPath() {
        if (isSelectionEmpty()) {
            return null;
        }
        return (TreePath) paths.iterator().next();
    }

    /**
     * @see nextapp.echo.extras.app.tree.TreeSelectionModel#getSelectionPaths()
     */
    public TreePath[] getSelectionPaths() {
        return (TreePath[]) paths.toArray(new TreePath[paths.size()]);
    }

    /**
     * @see nextapp.echo.extras.app.tree.TreeSelectionModel#isPathSelected(nextapp.echo.extras.app.tree.TreePath)
     */
    public boolean isPathSelected(TreePath path) {
        return paths.contains(path);
    }

    /**
     * @see nextapp.echo.extras.app.tree.TreeSelectionModel#isSelectionEmpty()
     */
    public boolean isSelectionEmpty() {
        return paths.isEmpty();
    }

    /**
     * @see nextapp.echo.extras.app.tree.TreeSelectionModel#removeChangeListener(nextapp.echo.app.event.ChangeListener)
     */
    public void removeChangeListener(ChangeListener l) {
        listenerList.removeListener(ChangeListener.class, l);
    }
    
    /**
     * @see nextapp.echo.extras.app.tree.TreeSelectionModel#removePropertyChangeListener(java.beans.PropertyChangeListener)
     */
    public void removePropertyChangeListener(PropertyChangeListener l) {
        listenerList.removeListener(PropertyChangeListener.class, l);
    }

    /**
     * @see nextapp.echo.extras.app.tree.TreeSelectionModel#removeSelectionPath(nextapp.echo.extras.app.tree.TreePath)
     */
    public void removeSelectionPath(TreePath path) {
        if (paths.remove(path)) {
            fireValueChanged();
        }
    }

    /**
     * @see nextapp.echo.extras.app.tree.TreeSelectionModel#removeSelectionPaths(nextapp.echo.extras.app.tree.TreePath[])
     */
    public void removeSelectionPaths(TreePath[] paths) {
        if (this.paths.removeAll(Arrays.asList(paths))) {
            fireValueChanged();
        }
    }

    /**
     * @see nextapp.echo.extras.app.tree.TreeSelectionModel#setSelectionMode(int)
     */
    public void setSelectionMode(int newValue) {
        if (selectionMode == newValue) {
            return;
        }
        int countBefore = paths.size();
        if (newValue == SINGLE_SELECTION && countBefore > 1) {
            TreePath newPath = getSelectionPath();
            paths.clear();
            paths.add(newPath);
            fireValueChanged();
        }
        int oldValue = selectionMode;
        selectionMode = newValue;
        firePropertyChange(SELECTION_MODE_PROPERTY, oldValue, newValue);
    }
    
    protected void firePropertyChange(String propertyName, int oldValue, int newValue) {
        EventListener[] listeners = listenerList.getListeners(PropertyChangeListener.class);
        if (listeners.length == 0) {
            return;
        }
        PropertyChangeEvent evt = new PropertyChangeEvent(this, propertyName, new Integer(oldValue), new Integer(newValue));
        for (int i = 0; i < listeners.length; i++) {
            PropertyChangeListener l = (PropertyChangeListener) listeners[i];
            l.propertyChange(evt);
        }
    }

    /**
     * @see nextapp.echo.extras.app.tree.TreeSelectionModel#setSelectionPath(nextapp.echo.extras.app.tree.TreePath)
     */
    public void setSelectionPath(TreePath path) {
        boolean wasEmpty = isSelectionEmpty();
        paths.clear();
        addSelectionPath(path);
        if (!wasEmpty && isSelectionEmpty()) {
            fireValueChanged();
        }
    }

    /**
     * @see nextapp.echo.extras.app.tree.TreeSelectionModel#setSelectionPaths(nextapp.echo.extras.app.tree.TreePath[])
     */
    public void setSelectionPaths(TreePath[] paths) {
        boolean wasEmpty = isSelectionEmpty();
        this.paths.clear();
        addSelectionPaths(paths);
        if (!wasEmpty && isSelectionEmpty()) {
            fireValueChanged();
        }
    }

}
