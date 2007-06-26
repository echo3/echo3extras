package nextapp.echo.extras.app.event;

import java.util.EventListener;

public interface TreeModelListener extends EventListener {

    public void treeNodesAdded(TreeModelEvent e);

    public void treeNodesChanged(TreeModelEvent e);
    
    public void treeNodesRemoved(TreeModelEvent e);
    
    public void treeStructureChanged(TreeModelEvent e);
}
