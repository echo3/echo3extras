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

import java.util.EventListener;
import java.util.LinkedList;
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
 * <p>
 * <strong>WARNING: This component is EXPERIMENTAL. The API is VERY LIKELY to
 * change.</strong>
 */
public class DragSource extends Component {

    public static final String DROP_TARGET_LISTENERS_CHANGED_PROPERTY = "dropTargetListeners";
    public static final String INPUT_DROP = "ACTION_INPUT_DROP";
    
    public static final String PROPERTY_TOOL_TIP_TEXT = "toolTipText";
    
    private List dropTargets;
    
    /**
     * Creates an empty DragSource
     * @deprecated This component has not yet been implemented in Echo3 and has been TEMPORARILY DEPRECATED to warn users.  S
     * See bug tracker issue 340 for status information.  When implemented, the component will be un-deprecated. 
     */
    public DragSource() { }
    
    /**
     * Creates a DragSource making the given 
     * Component visually draggable 
     * @param draggable The Component. 
     * @deprecated This component has not yet been implemented in Echo3 and has been TEMPORARILY DEPRECATED to warn users.  S
     * See bug tracker issue 340 for status information.  When implemented, the component will be un-deprecated. 
     */
    public DragSource(Component draggable) {
        this.add(draggable);
    }
   
    /**
     * Adds a target component to the drop target list.
     * @param dropTarget the drop target.
     */
    public void addDropTarget(Component dropTarget) {
        if (getDropTargetList().indexOf(dropTarget) < 0) {
            getDropTargetList().add(dropTarget);
        }
    }
    
    /**
     * Adds a <code>DropListener</code> to the listener list
     * 
     * @param listener the listener.
     */
    public void addDropTargetListener(DropListener listener) {
        getEventListenerList().addListener(DropListener.class, listener);
        // Notification of action listener changes is provided due to 
        // existence of hasActionListeners() method. 
        firePropertyChange(DROP_TARGET_LISTENERS_CHANGED_PROPERTY, null, listener);
    }
    
    /**
     * Notifies all listeners that have registered for this event type.
     * 
     * @param event the <code>DropEvent</code> to send
     */
    public void fireDropEvent(DropEvent event) {
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
     * Returns the drop target <code>Component</code> at the specified index
     * @param n the index.
     * @return the drop target.
     */
    public Component getDropTargetAt(int n) {
        return (Component) getDropTargetList().get(n);
    }
    
    /**
     * Returns total number of drop target <code>Components</code>
     * 
     * @return the total number drop targets.
     */
    public int getDropTargetCount() {
        return getDropTargetList().size();
    }
    
    /**
     * Returns the local list of Drop Target Components.
     * 
     * @return the drop target list
     */
    protected List getDropTargetList() {
        if (this.dropTargets == null) {
            this.dropTargets = new LinkedList();
        }       
        return this.dropTargets;
    }
    
    /**
     * Returns all drop target <code>Components</code>
     * 
     * @return the drop targets.
     */
    public Component[] getDropTargets() {
        return (Component[]) getDropTargetList().toArray(new Component[]{});
    }
    
    /**
     * Gets the tool tip text (displayed when the draggable 
     * component is over a valid drop target).
     * 
     * @return the tool tip text
     */
    public String getToolTipText(String newValue) {
        return (String) get(PROPERTY_TOOL_TIP_TEXT);
    }
    
    /**
     * @see nextapp.echo.app.Component#processInput(java.lang.String, java.lang.Object)
     */
    public void processInput(String name, Object value) {
        super.processInput(name, value);
        if (INPUT_DROP.equals(name)) {
            fireDropEvent(new DropEvent(this, value));
        }
    }
    
    /**
     * Removes all <code>Components</code> from the drop target list
     */
    public void removeAllDropTargets(){
        getDropTargetList().clear();
    }
    
    /**
     * Removes a <code>Component</code> from the drop target list
     * @param dropTarget the component.
     */
    public void removeDropTarget(Component dropTarget) {
        getDropTargetList().remove(dropTarget);
    }
    
    /**
     * Removes a <code>DropListener</code> from the listener list
     * 
     * @param listener the listener.
     */
    public void removeDropTargetListener(DropListener listener) {
        if (!hasEventListenerList()) {
            return;
        }
        getEventListenerList().removeListener(DropListener.class, listener);
    }
    
    /**
     * Sets the tool tip text (displayed when the draggable 
     * component is over a valid drop target).
     * 
     * @param newValue the new tool tip text
     */
    public void setToolTipText(String newValue) {
        set(PROPERTY_TOOL_TIP_TEXT, newValue);
    }
}
