package nextapp.echo.extras.testapp.testscreen;

import nextapp.echo.app.Label;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.extras.app.Tree;
import nextapp.echo.extras.app.tree.AbstractTreeModel;
import nextapp.echo.extras.app.tree.TreeModel;
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

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Foo", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
            }
        });
        
        tree.setModel(new AbstractTreeModel() {

            public Object getChild(Object parent, int index) {
                return new Integer(index);
            }

            public int getChildCount(Object parent) {
                int parentValue = ((Integer) parent).intValue();
                return parentValue;
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
    }
    
    public static void main(String[] args) {
        TreeTest test = new TreeTest();
        TreeModel model = test.tree.getModel();
        printModel(model, model.getRoot());
    }
    
    public static void printModel(TreeModel model, Object parent) {
        int childCount = model.getChildCount(parent);
        for (int i = 0; i < childCount; ++i) {
            Object child = model.getChild(parent, i);
            System.out.println(child);
            printModel(model, child);
        }
    }
}
