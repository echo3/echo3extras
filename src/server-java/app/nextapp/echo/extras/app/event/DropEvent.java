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

package nextapp.echo.extras.app.event;

import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.extras.app.DragSource;

/**
 * An event that represents a draggable Component being 
 * dropped on a valid drop target.
 */
public class DropEvent extends ActionEvent {

    private Object target;
    
    /**
     * Creates a DropEvent with the given Component as the 
     * draggable (source) and drop target Component (target)
     * 
     * @param source The draggable Component
     * @param target The drop target Component
     */
    public DropEvent(Object source, Object target) {
        super(source, DragSource.INPUT_DROP);
        this.target = target;
    }

    /**
     * Returns the drop target Component
     */
    public Object getTarget() {
        return this.target;
    }
}
