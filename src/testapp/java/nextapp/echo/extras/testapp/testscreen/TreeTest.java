package nextapp.echo.extras.testapp.testscreen;

import nextapp.echo.app.FillImage;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.extras.app.Tree;
import nextapp.echo.extras.app.tree.AbstractTreeModel;
import nextapp.echo.extras.app.tree.TreePath;
import nextapp.echo.extras.app.tree.TreeSelectionModel;
import nextapp.echo.extras.testapp.AbstractTest;
import nextapp.echo.extras.testapp.Styles;
import nextapp.echo.extras.testapp.TestControlPane;
import nextapp.echo.testapp.interactive.StyleUtil;

public class TreeTest extends AbstractTest {
    
    private static final FillImage[] TEST_FILL_IMAGES = new FillImage[] { null, 
        Styles.FILL_IMAGE_SHADOW_BACKGROUND_DARK_BLUE, Styles.FILL_IMAGE_SHADOW_BACKGROUND_LIGHT_BLUE,
        Styles.FILL_IMAGE_PEWTER_LINE, Styles.FILL_IMAGE_LIGHT_BLUE_LINE,
        Styles.FILL_IMAGE_SILVER_LINE};
    
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
        
        addBorderPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_BORDER);
        addInsetsPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_INSETS);
        
        addBooleanPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_ROLLOVER_ENABLED);
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_ROLLOVER_FOREGROUND);
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_ROLLOVER_BACKGROUND);
        addFontPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_ROLLOVER_FONT);
        addFillImagePropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_ROLLOVER_BACKGROUND_IMAGE, TEST_FILL_IMAGES);
        
        addBooleanPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_SELECTION_ENABLED);
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set SelectionMode = Single", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tree.getSelectionModel().setSelectionMode(TreeSelectionModel.SINGLE_SELECTION);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set SelectionMode = Multiple", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tree.getSelectionModel().setSelectionMode(TreeSelectionModel.MULTIPLE_SELECTION);
            }
        });
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_SELECTION_FOREGROUND);
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_SELECTION_BACKGROUND);
        addFontPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_SELECTION_FONT);
        addFillImagePropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_SELECTION_BACKGROUND_IMAGE, TEST_FILL_IMAGES);
                
        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Foo", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tree.setExpandedState(path, !tree.isExpanded(path));
            }
        });
    }
}
