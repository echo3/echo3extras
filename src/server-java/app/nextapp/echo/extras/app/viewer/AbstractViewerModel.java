package nextapp.echo.extras.app.viewer;

import nextapp.echo.app.event.EventListenerList;
import nextapp.echo.extras.app.event.ViewerModelListener;

/**
 * Abstract implementation of <code>ViewerModel</code>.
 * Provides listener management.
 * Provides default do-nothing <code>fetch()</code> implementation, which should be overridden in many/most cases.
 */
public abstract class AbstractViewerModel 
implements ViewerModel {

    private EventListenerList listenerList = new EventListenerList();
    
    /** 
     * Default constructor.
     */
    public AbstractViewerModel() {
        super();
    }

    /**
     * @see nextapp.echo.extras.app.viewer.ViewerModel#addViewerModelListener(nextapp.echo.extras.app.event.ViewerModelListener)
     */
    public void addViewerModelListener(ViewerModelListener l) {
        listenerList.addListener(ViewerModelListener.class, l);
    }

    /**
     * A default do-nothing implementation of <code>fetch()</code>.
     * If the model can benefit from fetching segments of data in bulk,
     * it is strongly recommended that it override this implementation,
     * e.g., if one were retrieving rows from a database.
     * 
     * @see nextapp.echo.extras.app.viewer.ViewerModel#fetch(int, int)
     */
    public void fetch(int startIndex, int endIndex) { }
    
    /**
     * Returns the <code>EventListenerList</code> used to register listeners.
     * 
     * @return the <code>EventListenerList</code>
     */
    public EventListenerList getEventListenerList() {
        return listenerList;
    }
    
    /**
     * @see nextapp.echo.extras.app.viewer.ViewerModel#removeViewerModelListener(nextapp.echo.extras.app.event.ViewerModelListener)
     */
    public void removeViewerModelListener(ViewerModelListener l) {
        listenerList.removeListener(ViewerModelListener.class, l);
    }
}
