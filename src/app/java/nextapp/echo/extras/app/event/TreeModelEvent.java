package nextapp.echo.extras.app.event;

import java.util.EventObject;

import nextapp.echo.extras.app.Tree;
import nextapp.echo.extras.app.tree.TreePath;

public class TreeModelEvent extends EventObject {

    public TreeModelEvent(Tree source, Object[] path) {
        super(source);
    }

    public TreeModelEvent(Tree source, TreePath path) {
        super(source);
    }
}
