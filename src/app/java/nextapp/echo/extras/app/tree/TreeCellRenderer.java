package nextapp.echo.extras.app.tree;

import nextapp.echo.app.Component;
import nextapp.echo.extras.app.Tree;

public interface TreeCellRenderer {
    
    public Component getTreeCellRendererComponent(Tree tree, Object value, int column, int row);
}
