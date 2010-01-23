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

import nextapp.echo.app.Component;
import nextapp.echo.app.Pane;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.extras.app.event.ViewerModelEvent;
import nextapp.echo.extras.app.event.ViewerModelListener;

/**
 * Abstract base class for Viewer components.
 */
public abstract class Viewer extends Component 
implements Pane {
    
    private class NullViewerModel extends AbstractViewerModel {

        public Object get(int index) {
            return null;
        }

        public int size() {
            return 0;
        }
    }

    public static final String ACTION_LISTENERS_CHANGED_PROPERTY = "actionListeners";
    public static final String MODEL_CHANGED_PROPERTY = "model";
    
    private ViewerModel model;
    private ViewerModelListener modelListener = new ViewerModelListener() {
        
        public void viewerChanged(ViewerModelEvent e) {
        }
    };
    
    public Viewer() {
        this(null);
    }
    
    public Viewer(ViewerModel model) {
        super();
        setModel(model == null ? new NullViewerModel() : model);
    }

    /**
     * Adds an <code>ActionListener</code> to the viewer.
     * The <code>ActionListener</code> will be invoked when the user
     * activates an item.
     * 
     * @param l the <code>ActionListener</code> to add
     */
    public void addActionListener(ActionListener l) {
        getEventListenerList().addListener(ActionListener.class, l);
        // Notification of action listener changes is provided due to 
        // existence of hasActionListeners() method. 
        firePropertyChange(ACTION_LISTENERS_CHANGED_PROPERTY, null, l);
    }
    
    /**
     * Returns the model.
     * 
     * @return the model
     */
    public ViewerModel getModel() {
        return model;
    }

    /**
     * Determines the any <code>ActionListener</code>s are registered.
     * 
     * @return true if any action listeners are registered
     */
    public boolean hasActionListeners() {
        return hasEventListenerList() && getEventListenerList().getListenerCount(ActionListener.class) != 0;
    }
    
    /**
     * Removes an <code>ActionListener</code> from the viewer.
     * 
     * @param l the <code>ActionListener</code> to remove
     */
    public void removeActionListener(ActionListener l) {
        if (!hasEventListenerList()) {
            return;
        }
        getEventListenerList().removeListener(ActionListener.class, l);
        // Notification of action listener changes is provided due to 
        // existence of hasActionListeners() method. 
        firePropertyChange(ACTION_LISTENERS_CHANGED_PROPERTY, l, null);
    }

    /**
     * Sets the model.
     * The model may not be null.
     *
     * @param newValue the new model
     */
    public void setModel(ViewerModel newValue) {
        if (newValue == null) {
            throw new IllegalArgumentException("Model may not be null.");
        }
        ViewerModel oldValue = model;
        if (oldValue != null) {
            oldValue.removeViewerModelListener(modelListener);
        }
        newValue.addViewerModelListener(modelListener);
        model = newValue;
        firePropertyChange(MODEL_CHANGED_PROPERTY, oldValue, newValue);
    }
}
