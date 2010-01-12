package nextapp.echo.extras.app.viewer;

import nextapp.echo.app.event.EventListenerList;
import nextapp.echo.extras.app.event.ViewerModelListener;

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
