package nextapp.echo.extras.app;

import java.util.ArrayList;
import java.util.EventListener;
import java.util.HashMap;
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
            doRenderNode(new TreePath(root));
        }

        private void doRenderNode(TreePath treePath) {
            // FIXME rerender when expansion state changes (to change node icon
            // between open/closed folder for example)
            Object value = treePath.getLastPathComponent();
            if (!treePathToComponentCache.containsKey(treePath)) {
                TreeCellRenderer cellRenderer = Tree.this.cellRenderer == null ? DEFAULT_TREE_CELL_RENDERER
                        : Tree.this.cellRenderer;
                Component cellComponent = cellRenderer
                        .getTreeCellRendererComponent(Tree.this, value, 0, row);
                add(cellComponent);
                treePathToComponentCache.put(treePath, cellComponent);
            }
            int cacheSize = rowToTreePathCache.size();
            if (cacheSize == 0 || row >= cacheSize
                    || !rowToTreePathCache.get(row).equals(treePath)) {
                rowToTreePathCache.add(row, treePath);
            }
            ++row;
            if (isExpanded(treePath)) {
                int childCount = model.getChildCount(value);
                for (int i = 0; i < childCount; ++i) {
                    Object childValue = model.getChild(value, i);
                    doRenderNode(treePath.pathByAddingChild(childValue));
                }
            }
        }

        void update(TreePath path, boolean newState) {
            row = getRowForPath(path);
            if (newState) {
                doRenderNode(path);
            } else {
                doCollapse(path);
            }
        }

        private void doCollapse(TreePath path) {
            Object value = path.getLastPathComponent();

            if (model.getChildCount(value) == 0) {
                return;
            }

            // remove all rows that are between the current path and its next
            // sibling
            int startRow = getRowForPath(path) + 1;
            int endRow = rowToTreePathCache.size() - 1;
            TreePath siblingPath = getSiblingPath(path);
            if (siblingPath != null) {
                endRow = getRowForPath(siblingPath);
            }
            for (int i = startRow; i < endRow; ++i) {
                rowToTreePathCache.remove(startRow);
            }
        }

        private TreePath getSiblingPath(TreePath path) {
            TreePath parentPath = path.getParentPath();
            if (parentPath == null) {
                return null;
            }
            Object parentValue = parentPath.getLastPathComponent();
            int index = model.getIndexOfChild(parentValue, path
                    .getLastPathComponent());
            if (index == model.getChildCount(parentValue) - 1) {
                return getSiblingPath(parentPath);
            } else {
                Object siblingValue = model.getChild(parentValue, index + 1);
                return parentPath.pathByAddingChild(siblingValue);
            }
        }

        void fullUpdate() {
            removeAll();
            treePathToComponentCache.clear();
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

        /**
         * @see nextapp.echo.extras.app.event.TreeModelListener#treeStructureChanged(nextapp.echo.extras.app.event.TreeModelEvent)
         */
        public void treeStructureChanged(TreeModelEvent e) {
            invalidate();
        }

        /**
         * @see nextapp.echo.extras.app.event.TreeModelListener#treeNodesRemoved(nextapp.echo.extras.app.event.TreeModelEvent)
         */
        public void treeNodesRemoved(TreeModelEvent e) {
            invalidate();
        }

        /**
         * @see nextapp.echo.extras.app.event.TreeModelListener#treeNodesChanged(nextapp.echo.extras.app.event.TreeModelEvent)
         */
        public void treeNodesChanged(TreeModelEvent e) {
            invalidate();
        }

        /**
         * @see nextapp.echo.extras.app.event.TreeModelListener#treeNodesAdded(nextapp.echo.extras.app.event.TreeModelEvent)
         */
        public void treeNodesAdded(TreeModelEvent e) {
            invalidate();
        }
    };

    private TreeModel model;
    private HashSet expandedPaths = new HashSet();
    private ArrayList rowToTreePathCache = new ArrayList();
    private HashMap treePathToComponentCache = new HashMap();
    private boolean valid = false;
    private TreeCellRenderer cellRenderer;

    /**
     * Constructs a new <code>Tree</code> with a default tree model.
     */
    public Tree() {
        this(new DefaultTreeModel());
    }

    /**
     * Constructs a new <code>Tree</code> with the specified model.
     * 
     * @param model the model
     */
    public Tree(TreeModel model) {
        super();
        setModel(model);
        setCellRenderer(DEFAULT_TREE_CELL_RENDERER);
    }

    /**
     * Retrieves the <code>TreeCellRenderer</code> used to render values
     * contained in the tree. The value of this property may be null, in which
     * case the tree should revert to using its default cell renderer.
     * 
     * @param newValue the new cell renderer
     */
    public TreeCellRenderer getCellRenderer() {
        return cellRenderer;
    }

    /**
     * @see nextapp.echo.app.Component#dispose()
     */
    public void dispose() {
        model.removeTreeModelListener(modelListener);
    }

    /**
     * @see nextapp.echo.app.Component#init()
     */
    public void init() {
        model.addTreeModelListener(modelListener);
    }

    /**
     * Returns the <code>TreeModel</code> being visualized by this
     * <code>Tree</code>.
     * 
     * @return the model
     */
    public TreeModel getModel() {
        return model;
    }

    /**
     * @see nextapp.echo.app.Component#processInput(java.lang.String,
     *      java.lang.Object)
     */
    public void processInput(String inputName, Object inputValue) {
        if (INPUT_ACTION.equals(inputName)) {
            int row = ((Integer) inputValue).intValue();
            TreePath path = getPathForRow(row);
            setExpandedState(path, !isExpanded(path));
        }
    }

    /**
     * Set the expansion state for the given tree path. When a tree path is
     * expanded, all parent paths will be expanded too.
     * 
     * @param treePath the path to expand or collapse
     * @param state the new expansion state
     */
    public void setExpandedState(TreePath treePath, boolean state) {
        if (state) {
            if (expandedPaths.contains(treePath)) {
                // do not fire any events when we are already expanded
                return;
            }
            // make sure the parent path is expanded
            // do not go into recursion, that will cause too much event
            // notifications
            TreePath topExpanded = null;
            TreePath parentPath = treePath;
            while (parentPath != null) {
                if (!expandedPaths.contains(parentPath)) {
                    expandedPaths.add(parentPath);
                    topExpanded = parentPath;
                }
                parentPath = parentPath.getParentPath();
            }
            if (topExpanded != null) {
                renderer.update(topExpanded, true);
            }
        } else {
            if (!expandedPaths.contains(treePath)) {
                // do not fire any events when we are already collapsed
                return;
            }
            expandedPaths.remove(treePath);
            renderer.update(treePath, false);
        }
        fireExpansionStateUpdate(treePath, state);
    }

    /**
     * Notifies all <code>TreeExpansionListener</code>s that the expansion
     * state has changed.
     * <p>
     * Fires a <code>PropertyChangeEvent</code> for the
     * {@link #EXPANSION_STATE_CHANGED_PROPERTY} with value <code>null</code>
     * for old and new value.
     * 
     * @param treePath the path to fire the expansion event for
     * @param newState the new expansion state for the given path
     */
    protected void fireExpansionStateUpdate(TreePath treePath, boolean newState) {
        TreeExpansionEvent event = new TreeExpansionEvent(this, treePath);
        EventListener[] listeners = getEventListenerList().getListeners(
                TreeExpansionListener.class);
        for (int i = 0; i < listeners.length; ++i) {
            TreeExpansionListener l = (TreeExpansionListener) listeners[i];
            if (newState) {
                l.treeExpanded(event);
            } else {
                l.treeCollapsed(event);
            }
        }
        firePropertyChange(EXPANSION_STATE_CHANGED_PROPERTY, null, null);
    }

    /**
     * @param row the row to get the expanded state for
     * @return <code>true</code> if the tree path on the given row is
     *         expanded, <code>false</code> if not
     * @throws IndexOutOfBoundsException when the given row is invalid
     */
    public boolean isExpanded(int row) {
        return isExpanded(getPathForRow(row));
    }

    /**
     * @param treePath the tree path to get the expanded state for
     * @return <code>true</code> if the given tree path is expanded,
     *         <code>false</code> if not
     */
    public boolean isExpanded(TreePath treePath) {
        return expandedPaths.contains(treePath);
    }

    /**
     * @param row the row to get the path for
     * @return the <code>TreePath</code> that is rendered on the given row.
     * @throws IndexOutOfBoundsException when row is invalid.
     */
    public TreePath getPathForRow(int row) {
        return (TreePath) rowToTreePathCache.get(row);
    }

    private int getRowForPath(TreePath path) {
        for (int i = 0; i < rowToTreePathCache.size(); ++i) {
            if (rowToTreePathCache.get(i).equals(path)) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Returns the component that is rendered at the given location.
     * 
     * @param row the row the component is rendered in
     * @param column the column the component is rendered in
     * @return the component, or <code>null</code> if the location does not
     *         exist, or the component for the location is not yet rendered.
     */
    public Component getComponent(int row, int column) {
        // FIXME throw when out of bounds?
        if (rowToTreePathCache.isEmpty()) {
            return null;
        }
        if (row >= rowToTreePathCache.size()) {
            return null;
        }
        return getComponent((TreePath) rowToTreePathCache.get(row), column);
    }

    /**
     * Returns the component that is rendered for the tree column of the given
     * path.
     * 
     * @param path the path the component is rendered for
     * @param column the column the component is rendered in
     * @return the component, or <code>null</code> if the location does not
     *         exist, or the component for the location is not yet rendered.
     */
    public Component getComponent(TreePath path, int column) {
        // FIXME throw when out of bounds?
        // FIXME column
        return (Component) treePathToComponentCache.get(path);
    }

    /**
     * Marks the tree as needing to be re-rendered.
     */
    private void invalidate() {
        valid = false;
    }

    /**
     * Sets the <code>TreeCellRenderer</code> used to render values contained
     * in the tree. The value of this property may be null, in which case the
     * tree should revert to using its default cell renderer.
     * 
     * @param newValue the new cell renderer
     */
    public void setCellRenderer(TreeCellRenderer newValue) {
        TreeCellRenderer oldValue = cellRenderer;
        cellRenderer = newValue;
        firePropertyChange(CELL_RENDERER_CHANGED_PROPERTY, oldValue, newValue);
    }

    /**
     * Sets the <code>TreeModel</code> begin visualized.
     * 
     * @param newValue the new model (may not be null)
     */
    public void setModel(TreeModel newValue) {
        invalidate();

        if (newValue == null) {
            throw new IllegalArgumentException("The model may not be null.");
        }

        TreeModel oldValue = model;
        if (oldValue != null) {
            oldValue.removeTreeModelListener(modelListener);
        }
        newValue.addTreeModelListener(modelListener);
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

    /**
     * Adds a <code>TreeExpansionListener</code> to the <code>Tree</code>.
     * <code>TreeExpansionListener</code>s will be invoked when the expansion
     * state of a node changes.
     * 
     * @param l the <code>TreeExpansionListener</code> to add
     */
    public void addTreeExpansionListener(TreeExpansionListener l) {
        getEventListenerList().addListener(TreeExpansionListener.class, l);
    }

    /**
     * Removes a <code>TreeExpansionListener</code> from the <code>Tree</code>.
     * <code>TreeExpansionListener</code>s will be invoked when the expansion
     * state of a node changes.
     * 
     * @param l the <code>TreeExpansionListener</code> to remove
     */
    public void removeTreeExpansionListener(TreeExpansionListener l) {
        getEventListenerList().removeListener(TreeExpansionListener.class, l);
    }
}
