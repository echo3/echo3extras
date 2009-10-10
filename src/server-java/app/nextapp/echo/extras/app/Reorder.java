package nextapp.echo.extras.app;

import nextapp.echo.app.Component;
import nextapp.echo.app.event.ChangeListener;

/**
 * Reorder component: a component which allows a user to rearrange its children using drag handles.
 */
public class Reorder extends Component {
    
    public static final String ORDER_CHANGED_PROPERTY = "order";

    /** Component order. */
    private int[] order;
    
    /**
     * Adds a <code>ChangeListener</code> to be notified of order changes.
     * 
     * @param l the listener to add
     */
    public void addChangeListener(ChangeListener l) {
        getEventListenerList().addListener(ChangeListener.class, l);
    }
    
    /**
     * Retrieves the component display order.  Modifying the returned array after invocation will result in undefined behavior.
     * 
     * @return the component order
     */
    public int[] getOrder() {
        return order;
    }
    
    /**
     * Removes a <code>ChangeListener</code> from being notified of order changes.
     * 
     * @param l the listener to remove
     */
    public void removeChangeListener(ChangeListener l) {
        getEventListenerList().removeListener(ChangeListener.class, l);
    }
    
    /**
     * Sets the component display order.  Modifying the provided array after invocation will result in undefined behavior.
     * 
     * @param newValue the new component order
     */
    public void setOrder(int[] newValue) {
        int[] oldValue = order;
        order = newValue;
        firePropertyChange(ORDER_CHANGED_PROPERTY, oldValue, newValue);
    }
}
