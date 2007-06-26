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

    public void removeTreeModelListener(TreeModelListener l);
}
