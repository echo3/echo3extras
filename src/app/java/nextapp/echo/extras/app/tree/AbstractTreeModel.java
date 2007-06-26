package nextapp.echo.extras.app.tree;

import nextapp.echo.app.event.EventListenerList;
import nextapp.echo.extras.app.event.TreeModelListener;

public abstract class AbstractTreeModel 
implements TreeModel {

    private EventListenerList listenerList = new EventListenerList();
    
    /**
     * @see nextapp.echo.extras.app.tree.TreeModel#addTreeModelListener(nextapp.echo.extras.app.event.TreeModelListener)
     */
    public void addTreeModelListener(TreeModelListener l) {
        listenerList.addListener(TreeModelListener.class, l);
    }

    /**
     * @see nextapp.echo.extras.app.tree.TreeModel#removeTreeModelListener(nextapp.echo.extras.app.event.TreeModelListener)
     */
    public void removeTreeModelListener(TreeModelListener l) {
        listenerList.removeListener(TreeModelListener.class, l);
    }

    /**
     * @see nextapp.echo.extras.app.tree.TreeModel#valueForPathChanged(nextapp.echo.extras.app.tree.TreePath, java.lang.Object)
     */
    public void valueForPathChanged(TreePath path, Object newValue) {
        
    }
}
