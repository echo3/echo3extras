/* 
 * This file is part of the Echo Extras Project.
 * Copyright (C) 2005-2010 NextApp, Inc.
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

package nextapp.echo.extras.app.viewer;

import nextapp.echo.extras.app.event.ViewerModelListener;

public interface ViewerModel {

    /**
     * Adds a listener that will be notified of changes/
     *
     * @param l the listener to add
     */
    public void addViewerModelListener(ViewerModelListener l);

    /**
     * Used to notify the model that specific indices may soon be retrieved.
     * This method will always be invoked immediately before an array of
     * indices are retrieved.
     * If there is no benefit to fetching data in groups, a do-nothing
     * implementation should be used.
     * 
     * @param startIndex the first index (inclusive) of the model which may soon be retrieved
     * @param endIndex the last index (exclusive) of the model which may soon be retrieved
     */
    public void fetch(int startIndex, int endIndex);
    
    /**
     * Retrieves the model value at the specified index.
     * The retrieved index must be within the range of those specified on the last call to <code>fetch()</code>.
     * 
     * @param index the model index to retrieve
     * @return the model value
     */
    public Object get(int index);
    
    /**
     * Returns the size of the model.
     * 
     * @return the size of the model
     */
    public int size();
    
    /**
     * Adds a listener that will be notified of changes/
     *
     * @param l the listener to add
     */
    public void removeViewerModelListener(ViewerModelListener l);
}
