package nextapp.echo.extras.app.tree;

import nextapp.echo.app.Component;
import nextapp.echo.app.Label;
import nextapp.echo.extras.app.Tree;

/**
 * Default <code>TreeCellRenderer</code> implementation.
 */
public class DefaultTreeCellRenderer 
implements TreeCellRenderer {

    /**
     * @see nextapp.echo.extras.app.tree.TreeCellRenderer#getTreeCellRendererComponent(
     *      nextapp.echo.extras.app.Tree, java.lang.Object, int, int)
     */
    public Component getTreeCellRendererComponent(Tree tree, TreePath treePath, Object value, int column, int row) {
        return value == null ? new Label() : new Label(value.toString());
    }

}
