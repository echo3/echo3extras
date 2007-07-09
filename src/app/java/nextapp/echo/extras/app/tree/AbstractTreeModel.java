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
    
    /**
     * @see nextapp.echo.extras.app.tree.TreeModel#getColumnCount()
     */
    public int getColumnCount() {
        return 1;
    }
    
    /**
     * Returns column names using a "spreadsheet-style" convention, i.e., 
     * A, B, C...Y, Z, AA, AB, AC...
     * 
     * @see nextapp.echo.extras.app.tree.TreeModel#getColumnName(int)
     */
    public String getColumnName(int column) {
        StringBuffer sb = new StringBuffer();
        int value = column;
        do {
            int digit = value % 26;
            sb.insert(0, (char) ('A' + digit));
            value = value / 26 - 1;
        } while (value >= 0);
        
        return sb.toString();
    }
    
    /**
     * @see nextapp.echo.extras.app.tree.TreeModel#getColumnClass(int)
     */
    public Class getColumnClass(int column) {
        return Object.class;
    }
    
    /**
     * @see nextapp.echo.extras.app.tree.TreeModel#getValueAt(java.lang.Object, int)
     */
    public Object getValueAt(Object node, int column) {
        if (0 == column) {
            return node;
        }
        return null;
    }
}
