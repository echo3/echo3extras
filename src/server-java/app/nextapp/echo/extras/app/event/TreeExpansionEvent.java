package nextapp.echo.extras.app.event;

import java.util.EventObject;

import nextapp.echo.extras.app.Tree;
import nextapp.echo.extras.app.tree.TreePath;

public class TreeExpansionEvent extends EventObject {

    private final TreePath path;

    public TreeExpansionEvent(Tree source, TreePath path) {
        super(source);
        this.path = path;
    }
    
    public TreePath getPath() {
        return path;
    }
    
}
