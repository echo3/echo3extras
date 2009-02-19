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

package nextapp.echo.extras.app;

import java.util.ArrayList;
import java.util.EventListener;
import java.util.List;

import nextapp.echo.app.Component;
import nextapp.echo.extras.app.event.DropEvent;
import nextapp.echo.extras.app.event.DropListener;

/**
 * A container <code>Component</code> that enables its child to be dragged and
 * dropped by the user onto any <code>Component</code> registered as a drop
 * target. When a <code>Component</code> is successfully dropped onto a valid
 * drop target, a <code>DropEvent</code> is fired and all registered
 * <code>DropTargetListener</code>s are notified.
 * 
 * Note that this component API is new and may change before the release candidate (though likely minorly/not at all).
 */
public class DragSource extends Component {

    public static final String DROP_LISTENERS_CHANGED_PROPERTY = "dropListeners";
    public static final String DROP_TARGETS_CHANGED_PROPERTY = "dropTargets";
    public static final String INPUT_DROP = "drop";

    /**
     * Collection of drop target components.
     */
    private List dropTargetIdList = new ArrayList();
    
    /**
     * Creates an empty DragSource.
     */
    public DragSource() { 
        super();
    }
    
    /**
     * Creates a DragSource making the given Component visually draggable.
     *  
     * @param draggable the draggable component
     */
    public DragSource(Component draggable) {
        super();
        this.add(draggable);
    }
   
    /**
     * Adds a target component to the drop target list.
     * 
     * @param dropTargetId the <code>renderId</code> of the drop target component to add
     */
    public void addDropTarget(String dropTargetId) {
        if (dropTargetIdList.indexOf(dropTargetId) != -1) {
            return;
        }
        if (dropTargetId == null) {
            throw new IllegalArgumentException("Cannot add null drop target id.");
        }
        dropTargetIdList.add(dropTargetId);
        firePropertyChange(DROP_TARGETS_CHANGED_PROPERTY, null, dropTargetId);
    }
    
    /**
     * Adds a <code>DropListener</code> to the listener list
     * 
     * @param listener the listener
     */
    public void addDropListener(DropListener listener) {
        getEventListenerList().addListener(DropListener.class, listener);
        firePropertyChange(DROP_LISTENERS_CHANGED_PROPERTY, null, listener);
    }
    
    /**
     * Notifies all listeners that have registered for this event type.
     * 
     * @param event the <code>DropEvent</code> to send
     */
    private void fireDropEvent(DropEvent event) {
        if (!hasEventListenerList()) {
            return;
        }
        EventListener[] listeners = getEventListenerList().getListeners(DropListener.class);
        for (int i=0; i<listeners.length; i++) {
            DropListener listener = (DropListener) listeners[i]; 
            listener.dropPerformed(event);
        }
    }
    
    /**
     * Returns an iterator over the render ids (Strings) of all drop targets. 
     * 
     * @return the <code>renderId</code> of the drop target component at the specified index 
     */
    public String getDropTarget(int index) {
        return (String) dropTargetIdList.get(index);
    }
    
    /**
     * Returns the total number of drop targets.
     * 
     * @return the total number drop targets
     */
    public int getDropTargetCount() {
        return dropTargetIdList.size();
    }
    
    /**
     * Determines if any <code>DropListener</code>s are currently registered.
     * 
     * @return true if any <code>DropListener</code>s are currently registered
     */
    public boolean hasDropListeners() {
        return hasEventListenerList() && getEventListenerList().getListenerCount(DropListener.class) > 0;
    }
    
    /**
     * @see nextapp.echo.app.Component#processInput(java.lang.String, java.lang.Object)
     */
    public void processInput(String name, Object value) {
        super.processInput(name, value);
        if (INPUT_DROP.equals(name)) {
            // Specific component provided as event value.
            Component specificComponent = (Component) value;

            // Determine drop tagret component (will be either specificCopmonent or an ancestor thereof.
            Component targetComponent = specificComponent;
            while (targetComponent != null && dropTargetIdList.indexOf(targetComponent.getRenderId()) == -1) {
                targetComponent = targetComponent.getParent();
            }
            if (targetComponent == null) {
                // Unable to find registered drop target component (should not occur).
                return;
            }
            
            // Fire event.
            fireDropEvent(new DropEvent(this, targetComponent, specificComponent));
        }
    }
    
    /**
     * Removes all <code>Components</code> from the drop target list
     */
    public void removeAllDropTargets() {
        dropTargetIdList.clear();
        firePropertyChange(DROP_TARGETS_CHANGED_PROPERTY, null, null);
    }
    
    /**
     * Removes a target component to the drop target list.
     * 
     * @param dropTargetId the <code>renderId</code> of the drop target component to remove
     */
    public void removeDropTarget(String dropTargetId) {
        if (dropTargetIdList.remove(dropTargetId)) {
            firePropertyChange(DROP_TARGETS_CHANGED_PROPERTY, dropTargetId, null);
        }
    }
    
    /**
     * Removes a <code>DropListener</code> from the listener list
     * 
     * @param listener the listener
     */
    public void removeDropListener(DropListener listener) {
        if (!hasEventListenerList()) {
            return;
        }
        getEventListenerList().removeListener(DropListener.class, listener);
        firePropertyChange(DROP_LISTENERS_CHANGED_PROPERTY, listener, null);
    }
}
