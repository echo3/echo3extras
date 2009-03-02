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

import java.beans.PropertyChangeListener;
import java.io.Serializable;

import nextapp.echo.app.event.ChangeListener;

public interface TreeSelectionModel 
extends Serializable {
    
    public static final String SELECTION_MODE_PROPERTY = "selectionMode";
    
    public static final int SINGLE_SELECTION = 0;
    public static final int MULTIPLE_SELECTION = 2;
    
    /**
     * Adds a <code>ChangeListener</code> to the selection model, which will
     * be notified when the selection changes.
     *
     * @param l the <code>ChangeListener</code> to add
     */
    public void addChangeListener(ChangeListener l);
    
    /**
     * Adds a <code>PropertyChangeListener</code> to the selection model, which will
     * be notified on property changes.
     * 
     * @param l the <code>PropertyChangeListener</code> to add
     */
    public void addPropertyChangeListener(PropertyChangeListener l);
    
    /**
     * Deselects all items.
     */
    public void clearSelection();
    
    /**
     * Returns the first path in the selection. How first is defined is
     * up to implementors, and may not necessarily be the TreePath with
     * the smallest integer value as determined from the
     * <code>RowMapper</code>.
     */
    public TreePath getSelectionPath();
    
   /**
    * Returns the paths in the selection. 
    * 
    * @return the currently selected paths, or an empty array if nothing is selected
    */
   public TreePath[] getSelectionPaths();
    
    /**
     * Returns the selection mode.  
     * 
     * @return the selection mode, one of the following values:
     *         <ul>
     *          <li><code>ListSelectionModel.SINGLE_SELECTION</code>: only 
     *          one list element may be selected.</li>
     *          <li><code>ListSelectionModel.MULTIPLE_SELECTION</code>: 
     *          multiple list elements may be selected.</li>
     *         </ul>
     */
    public int getSelectionMode();

    /**
     * Determines whether a tree path is selected.
     *
     * @param path the path
     * @return <code>true</code> if the path is currently selected
     */
    public boolean isPathSelected(TreePath path);
    
    /**
     * Determines if no items are selected.
     *
     * @return <code>true</code> if no items are selected
     */
    public boolean isSelectionEmpty();
        
    /**
     * Removes a <code>ChangeListener</code> from being notified of when the
     * selection changes.
     *
     * @param l the <code>ChangeListener</code> to remove
     */
    public void removeChangeListener(ChangeListener l);
    
    /**
     * Removes a <code>PropertyChangeListener</code> from being notified
     * on property changes
     * 
     * @param l the <code>PropertyChangeListener</code> to remove
     */
    public void removePropertyChangeListener(PropertyChangeListener l);
    
    /**
     * Sets the selection to path. If this represents a change, then the
     * TreeSelectionListeners are notified. If <code>path</code> is null, this
     * has the same effect as invoking <code>clearSelection</code>.
     * 
     * @param path new path to select
     */
    void setSelectionPath(TreePath path);

    /**
     * Sets the selection to path. If this represents a change, then the
     * TreeSelectionListeners are notified. If <code>paths</code> is null,
     * this has the same effect as invoking <code>clearSelection</code>.
     * 
     * @param paths new selection
     */
    void setSelectionPaths(TreePath[] paths);

    /**
     * Adds path to the current selection. If path is not currently in the
     * selection the TreeSelectionListeners are notified. This has no effect if
     * <code>path</code> is null.
     * 
     * @param path the new path to add to the current selection
     */
    void addSelectionPath(TreePath path);

    /**
     * Adds paths to the current selection. If any of the paths in paths are not
     * currently in the selection the TreeSelectionListeners are notified. This
     * has no effect if <code>paths</code> is null.
     * 
     * @param paths the new paths to add to the current selection
     */
    void addSelectionPaths(TreePath[] paths);

    /**
     * Removes path from the selection. If path is in the selection The
     * TreeSelectionListeners are notified. This has no effect if
     * <code>path</code> is null.
     * 
     * @param path the path to remove from the selection
     */
    void removeSelectionPath(TreePath path);

    /**
     * Removes paths from the selection. If any of the paths in
     * <code>paths</code> are in the selection, the TreeSelectionListeners are
     * notified. This method has no effect if <code>paths</code> is null.
     * 
     * @param paths the path to remove from the selection
     */
    void removeSelectionPaths(TreePath[] paths);
    
    /**
     * Sets the selection mode.  
     * 
     * @param selectionMode the selection mode, one of the following values:
     *        <ul>
     *         <li><code>SINGLE_SELECTION</code>: only one tree node 
     *         may be selected.</li>
     *         <li><code>MULTIPLE_SELECTION</code>: multiple list nodes
     *         may be selected.</li>
     *        </ul>
     */
    public void setSelectionMode(int selectionMode);
}
