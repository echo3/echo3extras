package nextapp.echo.extras.app.menu;

import java.util.EventListener;

import nextapp.echo.app.Component;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;

public abstract class AbstractMenuComponent extends Component {

    public static final String INPUT_SELECT = "select";
    public static final String MODEL_CHANGED_PROPERTY = "model";
    public static final String STATE_MODEL_CHANGED_PROPERTY = "stateModel";

    private MenuModel model;
    private MenuStateModel stateModel;
    
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
        if (INPUT_SELECT.equals(name)) {
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
     * Sets the selection model.
     * 
     * @param newValue the new selection model
     */
    public void setStateModel(MenuStateModel newValue) {
        if (newValue == null) {
            throw new IllegalArgumentException("Selection model may not be null.");
        }
        MenuStateModel oldValue = stateModel;
        stateModel = newValue;
        firePropertyChange(MODEL_CHANGED_PROPERTY, oldValue, newValue);
    }
}
