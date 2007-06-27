package nextapp.echo.extras.app;

import java.util.ArrayList;
import java.util.EventListener;
import java.util.HashSet;

import nextapp.echo.app.Component;
import nextapp.echo.extras.app.event.TreeExpansionEvent;
import nextapp.echo.extras.app.event.TreeExpansionListener;
import nextapp.echo.extras.app.event.TreeModelEvent;
import nextapp.echo.extras.app.event.TreeModelListener;
import nextapp.echo.extras.app.tree.DefaultTreeCellRenderer;
import nextapp.echo.extras.app.tree.DefaultTreeModel;
import nextapp.echo.extras.app.tree.TreeCellRenderer;
import nextapp.echo.extras.app.tree.TreeModel;
import nextapp.echo.extras.app.tree.TreePath;

public class Tree extends Component {

    private class Renderer {
        
        private int row;
        
        private void doRender() {
            Object root = model.getRoot();
            doRenderNode(root, new TreePath(root));
        }
        
        private void doRenderNode(Object value, TreePath treePath) {
            Component cellComponent = cellRenderer.getTreeCellRendererComponent(Tree.this, value, 0, row);
            add(cellComponent);
            rowToTreePathCache.add(treePath);
            ++row;
            if (isExpanded(treePath)) {
                int childCount = model.getChildCount(value);
                for (int i = 0; i < childCount; ++i) {
                    Object childValue = model.getChild(value, i);
                    doRenderNode(childValue, treePath.pathByAddingChild(childValue));
                }
            }
        }
        
        void fullUpdate() {
            removeAll();
            rowToTreePathCache.clear();
            row = 0;
            doRender();
        }
    }
    
    private Renderer renderer = new Renderer();
    
    public static final String CELL_RENDERER_CHANGED_PROPERTY = "cellRenderer";
    public static final String MODEL_CHANGED_PROPERTY = "model";
    public static final String EXPANSION_STATE_CHANGED_PROPERTY = "expansionState";
    
    public static final String INPUT_ACTION = "action";

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
    private HashSet expandedPaths = new HashSet();
    private ArrayList rowToTreePathCache = new ArrayList();
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
    
    public void dispose() {
        model.removeTreeModelListener(modelListener);
    }
    
    public void init() {
        model.addTreeModelListener(modelListener);
    }

    public TreeModel getModel() {
        return model;
    }
    
    public void processInput(String inputName, Object inputValue) {
        if (INPUT_ACTION.equals(inputName)) {
            int row = ((Integer)inputValue).intValue();
            TreePath path = getPathForRow(row);
            setExpandedState(path, !isExpanded(path));
        }
    }
    
    public void setExpandedState(TreePath treePath, boolean state) {
        if (state) {
            if (expandedPaths.contains(treePath)) {
                // do not fire any events when we are already expanded
                return;
            }
            // make sure the parent path is expanded
            // do not go into recursion, that will cause too much event notifications
            TreePath parentPath = treePath.getParentPath();
            while (parentPath != null) {
                expandedPaths.add(parentPath);
                parentPath = parentPath.getParentPath();
            }
            expandedPaths.add(treePath);
        } else {
            if (!expandedPaths.contains(treePath)) {
                // do not fire any events when we are already collapsed
                return;
            }
            expandedPaths.remove(treePath);
        }
        //FIXME remove when partial update is implemented
        invalidate();
        fireExpansionStateUpdate(treePath, state);
    }
    
    protected void fireExpansionStateUpdate(TreePath treePath, boolean newState) {
        TreeExpansionEvent event = new TreeExpansionEvent(this, treePath);
        EventListener[] listeners = getEventListenerList().getListeners(TreeExpansionListener.class);
        for (int i = 0; i < listeners.length; ++i) {
            TreeExpansionListener l = (TreeExpansionListener)listeners[i];
            if (newState) {
                l.treeExpanded(event);
            } else {
                l.treeCollapsed(event);
            }
        }
        firePropertyChange(EXPANSION_STATE_CHANGED_PROPERTY, null, null);
    }
    
    public boolean isExpanded(int row) {
        return isExpanded(getPathForRow(row));
    }
    
    public boolean isExpanded(TreePath treePath) {
        return expandedPaths.contains(treePath);
    }
    
    protected TreePath getPathForRow(int row) {
        return (TreePath) rowToTreePathCache.get(row);
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
    
    public void addTreeExpansionListener(TreeExpansionListener l) {
        getEventListenerList().addListener(TreeExpansionListener.class, l);
    }
    
    public void removeTreeExpansionListener(TreeExpansionListener l) {
        getEventListenerList().removeListener(TreeExpansionListener.class, l);
    }
}
