package nextapp.echo.extras.testapp.testscreen;

import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.extras.app.Tree;
import nextapp.echo.extras.app.tree.AbstractTreeModel;
import nextapp.echo.extras.app.tree.TreePath;
import nextapp.echo.extras.testapp.AbstractTest;
import nextapp.echo.extras.testapp.Styles;
import nextapp.echo.extras.testapp.TestControlPane;

public class TreeTest extends AbstractTest {

    final Tree tree;
    public TreeTest() {
        
        super("Tree", Styles.ICON_16_TAB_PANE);
        
        tree = new Tree();
        add(tree);
        
        setTestComponent(this, tree);
        // Add/Remove Tabs
        
        tree.setModel(new AbstractTreeModel() {

            public Object getChild(Object parent, int index) {
                return new Integer(index);
            }

            public int getChildCount(Object parent) {
                int parentValue = ((Integer) parent).intValue();
                return parentValue;
            }
            
            public int getColumnCount() {
                return 5;
            }
            
            public Object getValueAt(Object node, int column) {
                if (0 == column) {
                    return node;
                }
                return ((Integer) node).intValue() + " - " + column;
            }

            public int getIndexOfChild(Object parent, Object child) {
                int childValue = ((Integer) child).intValue();
                return childValue;
            }

            public Object getRoot() {
                return new Integer(4);
            }

            public boolean isLeaf(Object object) {
                int objectValue = ((Integer) object).intValue();
                return objectValue == 0;
            }
        });

        Object root = tree.getModel().getRoot();
        final TreePath path = new TreePath(new Object[] {root, tree.getModel().getChild(root, 2)});
        tree.setExpandedState(path, false);
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Foo", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tree.setExpandedState(path, !tree.isExpanded(path));
            }
        });
    }
}
