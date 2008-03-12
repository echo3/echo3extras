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

package nextapp.echo.extras.app.menu;

import java.util.EventListener;

import nextapp.echo.app.Component;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.event.ChangeEvent;
import nextapp.echo.app.event.ChangeListener;

public abstract class AbstractMenuComponent extends Component {

    public static final String INPUT_ACTION = "action";
    public static final String MODEL_CHANGED_PROPERTY = "model";
    public static final String STATE_MODEL_CHANGED_PROPERTY = "stateModel";
    
    public static final String ACTION_LISTENERS_CHANGED_PROPERTY = "actionListeners";

    public static final String PROPERTY_ANIMATION_TIME = "animationTime";
    
    public static final int DEFAULT_ANIMATION_TIME = 0;

    private MenuModel model;
    private MenuStateModel stateModel;

    /**
     * Listener to monitor changes to state model.
     */
    private ChangeListener stateModelListener = new ChangeListener() {

        /**
         * @see nextapp.echo.app.event.ChangeListener#stateChanged(nextapp.echo.app.event.ChangeEvent)
         */
        public void stateChanged(ChangeEvent e) {
            firePropertyChange(STATE_MODEL_CHANGED_PROPERTY, null, stateModel);
        }
    };

    /**
     * Creates a new <code>AbstractMenuComponent</code> displaying the specified 
     * <code>MenuModel</code> and using the specified 
     * <code>MenuStateModel</code> to provide state information.
     * 
     * @param model the model
     * @param stateModel the selection model
     */
    public AbstractMenuComponent(MenuModel model, MenuStateModel stateModel) {
        super();
        setModel(model == null ? new DefaultMenuModel() : model);
        setStateModel(stateModel == null ? new DefaultMenuStateModel() : stateModel);
    }
    
    /**
     * Adds an <code>ActionListener</code> to be notified when a menu item 
     * is selected.
     * 
     * @param l the listener to add
     */
    public void addActionListener(ActionListener l) {
        getEventListenerList().addListener(ActionListener.class, l);
    }
    
    /**
     * Returns the animation time (in milliseconds).  A value of zero indicates animation is disabled.
     * 
     * @return the animation time
     */
    public int getAnimationTime() {
        Integer animationTime = (Integer) getProperty(PROPERTY_ANIMATION_TIME);
        return animationTime == null ? DEFAULT_ANIMATION_TIME : animationTime.intValue(); 
    }
    
    /**
     * Determines if the menu has any <code>ActionListener</code>s 
     * registered.
     * 
     * @return true if any action listeners are registered
     */
    public boolean hasActionListeners() {
        return hasEventListenerList() && getEventListenerList().getListenerCount(ActionListener.class) != 0;
    }
   
    /**
     * Deselects <code>RadioOptionModel</code> items in a group when a selection
     * is made within that group.  Operates by recursively searching 
     * <code>MenuModel</code>s for <code>RadioOptionModel</code>s with a specific
     * group id. 
     * 
     * @param menuModel the <code>MenuModel</code> to search 
     * @param groupId the id of the group to deselect
     * @param newSelectionId the id of the new selection in the group
     */
    private void deselectGroup(MenuModel menuModel, Object groupId, Object newSelectionId) {
        int count = menuModel.getItemCount();
        for (int i = 0; i < count; ++i) {
            ItemModel itemModel = menuModel.getItem(i);
            if (itemModel instanceof MenuModel) {
                deselectGroup((MenuModel) itemModel, groupId, newSelectionId);
            } else if (itemModel instanceof RadioOptionModel) {
                RadioOptionModel radioOptionModel = (RadioOptionModel) itemModel;
                if (radioOptionModel.getGroupId() != null && radioOptionModel.getGroupId().equals(groupId)) {
                    getStateModel().setSelected(radioOptionModel.getId(), false);
                }
            }
        }
    }
 
    /**
     * Programmatically performs a menu action.
     * 
     * @param optionModel the <code>OptionModel</code> whose action is to be 
     *        invoked
     */
    public void doAction(OptionModel optionModel) {
        if (getStateModel() != null && !getStateModel().isEnabled(optionModel.getId())) {
            // Do nothing, item is disabled.
            return;
        }
        if (getStateModel() != null && optionModel instanceof ToggleOptionModel) {
            if (optionModel instanceof RadioOptionModel) {
                RadioOptionModel radioOptionModel = (RadioOptionModel) optionModel;
                deselectGroup(getModel(), radioOptionModel.getGroupId(), radioOptionModel.getId());
                getStateModel().setSelected(radioOptionModel.getId(), true);
            } else {
                ToggleOptionModel toggleOptionModel = (ToggleOptionModel) optionModel;
                getStateModel().setSelected(toggleOptionModel.getId(), !getStateModel().isSelected(toggleOptionModel.getId()));
            }
            firePropertyChange(STATE_MODEL_CHANGED_PROPERTY, null, null);
        }
        fireActionPerformed(optionModel);
    }
    
    /**
     * Notifies <code>ActionListener</code>s that an option was chosen. 
     * 
     * @param optionModel the selected <code>OptionModel</code>
     */
    protected void fireActionPerformed(OptionModel optionModel) {
        if (!hasEventListenerList()) {
            return;
        }
        ActionEvent e = new ActionEvent(this, optionModel.getId());
        EventListener[] listeners = getEventListenerList().getListeners(ActionListener.class);
        for (int i = 0; i < listeners.length; ++i) {
            ((ActionListener) listeners[i]).actionPerformed(e);
        }
    }
    
    /**
     * Returns the model
     * 
     * @return the model
     */
    public MenuModel getModel() {
        return model;
    }

    /**
     * Returns the selection model
     * 
     * @return the selection model
     */
    public MenuStateModel getStateModel() {
        return stateModel;
    }

    /**
     * @see nextapp.echo.app.Component#processInput(java.lang.String, java.lang.Object)
     */
    public void processInput(String name, Object value) {
        if (INPUT_ACTION.equals(name)) {
            OptionModel optionModel = (OptionModel) value;
            doAction(optionModel);
        }
    }
    
    /**
     * Removes an <code>ActionListener</code> from being notified when a menu 
     * item is selected.
     * 
     * @param l the listener to remove
     */
    public void removeActionListener(ActionListener l) {
        getEventListenerList().removeListener(ActionListener.class, l);
    }
    
    /**
     * Sets the animation time (in milliseconds).  A value of zero indicates animation is disabled.
     * 
     * @param newValue the new animation time
     */
    public void setAnimationTime(int newValue) {
        setProperty(PROPERTY_ANIMATION_TIME, new Integer(newValue));
    }

    /**
     * Sets the model.
     * 
     * @param newValue the new model
     */
    public void setModel(MenuModel newValue) {
        if (newValue == null) {
            throw new IllegalArgumentException("Model may not be null.");
        }
        MenuModel oldValue = model;
        model = newValue;
        firePropertyChange(MODEL_CHANGED_PROPERTY, oldValue, newValue);
    }
    
    /**
     * Sets the state model.
     * 
     * @param newValue the new state model
     */
    public void setStateModel(MenuStateModel newValue) {
        if (newValue == null) {
            throw new IllegalArgumentException("State model may not be null.");
        }
        MenuStateModel oldValue = stateModel;
        if (oldValue != null) {
            oldValue.removeChangeListener(stateModelListener);
        }
        stateModel = newValue;
        newValue.addChangeListener(stateModelListener);
        firePropertyChange(STATE_MODEL_CHANGED_PROPERTY, oldValue, newValue);
    }
}
