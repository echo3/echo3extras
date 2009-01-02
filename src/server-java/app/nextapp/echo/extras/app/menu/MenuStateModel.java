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

package nextapp.echo.extras.app.menu;

import java.io.Serializable;

import nextapp.echo.app.event.ChangeListener;

/**
 * Representation of the state of a <code>MenuModel</code>s, describing the
 * selected and enabled states of all options.
 */
public interface MenuStateModel extends Serializable {

    /**
     * Registers a <code>ChangeListener</code> to be notified when the selection
     * or enabled state of menu items change.
     * 
     * @param l the listener to add
     */
    public void addChangeListener(ChangeListener l);
    
    /**
     * Determines if a specific menu option is enabled.
     * 
     * @param id the id of the menu option
     * @return true if it is enabled
     */
    public boolean isEnabled(String id);
    
    /**
     * Determines if a specific menu option is selected.
     * 
     * @param id the id of the menu option
     * @return true if it is selected
     */
    public boolean isSelected(String id);

    /**
     * Unregisters a <code>ChangeListener</code> from being notified when 
     * the selection or enabled state of menu items change.
     * 
     * @param l the listener to remove
     */
    public void removeChangeListener(ChangeListener l);
    
    /**
     * Sets the enabled state of a specific menu option.
     * 
     * @param id the id of the menu option
     * @param enabled the new enabled state
     */
    public void setEnabled(String id, boolean enabled);
    
    /**
     * Sets the selection state of a specific menu option.
     * 
     * @param id the id of the menu option
     * @param selected the new selection state
     */
    public void setSelected(String id, boolean selected);
}
