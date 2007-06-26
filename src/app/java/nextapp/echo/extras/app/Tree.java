package nextapp.echo.extras.app;

import nextapp.echo.app.Component;
import nextapp.echo.extras.app.event.TreeModelEvent;
import nextapp.echo.extras.app.event.TreeModelListener;
import nextapp.echo.extras.app.tree.DefaultTreeCellRenderer;
import nextapp.echo.extras.app.tree.DefaultTreeModel;
import nextapp.echo.extras.app.tree.TreeCellRenderer;
import nextapp.echo.extras.app.tree.TreeModel;

public class Tree extends Component {

    private class Renderer {
        
        private int row;
        
        private void doRender() {
            doRenderNode(model.getRoot());
        }
        
        private void doRenderNode(Object value) {
            Component cellComponent = cellRenderer.getTreeCellRendererComponent(Tree.this, value, 0, row);
            add(cellComponent);
            ++row;
            int childCount = model.getChildCount(value);
            for (int i = 0; i < childCount; ++i) {
                Object childValue = model.getChild(value, i);
                doRenderNode(childValue);
            }
        }
        
        void fullUpdate() {
            removeAll();
            row = 0;
            doRender();
        }
    }
    
    private Renderer renderer = new Renderer();
    
    public static final String CELL_RENDERER_CHANGED_PROPERTY = "cellRenderer";
    public static final String MODEL_CHANGED_PROPERTY = "model";

    private static final TreeCellRenderer DEFAULT_TREE_CELL_RENDERER = new DefaultTreeCellRenderer();
    
    /**
     * Listener to monitor changes to model.
     */
    private TreeModelListener modelListener = new TreeModelListener() {
    
        public void treeStructureChanged(TreeModelEvent e) {
            invalidate();
        }
    
        public void treeNodesRemoved(TreeModelEvent e) {
            invalidate();
        }
    
        public void treeNodesChanged(TreeModelEvent e) {
            invalidate();
        }
    
        public void treeNodesAdded(TreeModelEvent e) {
            invalidate();
        }
    };
    
    private TreeModel model;
    private boolean valid = false;
    private TreeCellRenderer cellRenderer;
    
    public Tree() {
        this(new DefaultTreeModel());
    }

    public Tree(TreeModel model) {
        super();
        setModel(model);
        setCellRenderer(DEFAULT_TREE_CELL_RENDERER);
    }
    
    public TreeCellRenderer getCellRenderer() {
        return cellRenderer;
    }

    public TreeModel getModel() {
        return model;
    }
    
    public boolean isExpanded(int row) {
        //FIXME duh
        return true;
    }

    /**
     * Marks the tree as needing to be re-rendered.
     */
    private void invalidate() {
        valid = false;
    }
    
    public void setCellRenderer(TreeCellRenderer newValue) {
        TreeCellRenderer oldValue = cellRenderer;
        cellRenderer = newValue;
        firePropertyChange(CELL_RENDERER_CHANGED_PROPERTY, oldValue, newValue);
    }
    
    public void setModel(TreeModel newValue) {
        TreeModel oldValue = model;
        model = newValue;
        firePropertyChange(MODEL_CHANGED_PROPERTY, oldValue, newValue);
    }
    
    /**
     * @see nextapp.echo.app.Component#validate()
     */
    public void validate() {
        super.validate();
        while (!valid) {
            valid = true;
            renderer.fullUpdate();
        }
    }
}
