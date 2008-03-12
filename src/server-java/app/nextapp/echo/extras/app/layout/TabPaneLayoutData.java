/* 
 * This file is part of the Echo Extras Project.
 * Copyright (C) 2005-2008 NextApp, Inc.
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

package nextapp.echo.extras.app.layout;

import nextapp.echo.app.ImageReference;
import nextapp.echo.app.LayoutData;

/**
 * <code>LayoutData</code> implementation for children of <code>TabPane</code>
 * components.
 */
public class TabPaneLayoutData implements LayoutData {
    
    private boolean closeEnabled = true;
    private ImageReference icon;
    private String title;
    
    /**
     * Determines if this tab can be closed.
     * 
     * @return true if the tab can be closed, default is true
     */
    public boolean isCloseEnabled() {
        return closeEnabled;
    }
    
    /**
     * Returns the icon of the tab.
     * 
     * @return the tab icon
     */
    public ImageReference getIcon() {
        return icon;
    }
    
    /**
     * Returns the title of the tab.
     * 
     * @return the tab title
     */
    public String getTitle() {
        return title;
    }

    /**
     * Sets whether this tab can be closed.
     * 
     * @param newValue the new state
     */
    public void setCloseEnabled(boolean newValue) {
        this.closeEnabled = newValue;
    }
    
    /**
     * Sets the icon of the tab.
     *
     * @param newValue the new icon
     */
    public void setIcon(ImageReference newValue) {
        icon = newValue;
    }
    
    /**
     * Sets the title of the tab.
     * 
     * @param newValue the new title
     */
    public void setTitle(String newValue) {
        title = newValue;
    }
}
