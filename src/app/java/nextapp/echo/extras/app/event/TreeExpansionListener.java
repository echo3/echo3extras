package nextapp.echo.extras.app.event;

import java.util.EventListener;

public interface TreeExpansionListener extends EventListener {

    /**
     * Called whenever an item in the tree has been expanded.
     */
    public void treeExpanded(TreeExpansionEvent event);

    /**
     * Called whenever an item in the tree has been collapsed.
     */
    public void treeCollapsed(TreeExpansionEvent event);
}
