package nextapp.echo.extras.app.tree;

import nextapp.echo.extras.app.event.TreeModelListener;

public interface TreeModel {

    public void addTreeModelListener(TreeModelListener l);
    
    public Object getRoot();

    public Object getChild(Object parent, int index);
    
    public int getChildCount(Object parent);
    
    public boolean isLeaf(Object object);
    
    public void valueForPathChanged(TreePath path, Object newValue);

    public int getIndexOfChild(Object parent, Object child);
    
    /**
     * Returns the number of available columns.
     */
    public int getColumnCount();

    /**
     * Returns the name for column number <code>column</code>.
     */
    public String getColumnName(int column);

    /**
     * Returns the type for column number <code>column</code>.
     */
    public Class getColumnClass(int column);

    /**
     * Returns the value to be displayed for node <code>node</code>, 
     * at column number <code>column</code>.
     */
    public Object getValueAt(Object node, int column);

    public void removeTreeModelListener(TreeModelListener l);
}
