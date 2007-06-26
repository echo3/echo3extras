package nextapp.echo.extras.app.tree;

import nextapp.echo.app.Component;
import nextapp.echo.app.Label;
import nextapp.echo.extras.app.Tree;

public class DefaultTreeCellRenderer 
implements TreeCellRenderer {

    public Component getTreeCellRendererComponent(Tree tree, Object value, int column, int row) {
        //FIXME debug code
        return new Label(value + ":" + column + "," + row);
    }

}
