package nextapp.echo.extras.app.menu;

import java.util.EventListener;

import nextapp.echo.app.event.ChangeEvent;
import nextapp.echo.app.event.ChangeListener;
import nextapp.echo.app.event.EventListenerList;

public abstract class AbstractMenuSelectionModel implements MenuSelectionModel {

    private EventListenerList listenerList = new EventListenerList();

    /**
     * @see nextapp.echo.extras.app.menu.MenuSelectionModel#addChangeListener(nextapp.echo.app.event.ChangeListener)
     */
    public void addChangeListener(ChangeListener l) {
        listenerList.addListener(ChangeListener.class, l);
    }

    /**
     * Notifies <code>ChangeListener</code>s of a selection state change.
     */
    protected void fireStateChanged() {
        ChangeEvent e = new ChangeEvent(this);
        EventListener[] listeners = listenerList.getListeners(ChangeListener.class);
        for (int i = 0; i < listeners.length; ++i) {
            ((ChangeListener) listeners[i]).stateChanged(e);
        }
    }

    /**
     * @see nextapp.echo.extras.app.menu.MenuSelectionModel#removeChangeListener(nextapp.echo.app.event.ChangeListener)
     */
    public void removeChangeListener(ChangeListener l) {
        listenerList.removeListener(ChangeListener.class, l);
    }

}
