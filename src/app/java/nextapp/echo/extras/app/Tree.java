package nextapp.echo.extras.app;

import java.util.ArrayList;
import java.util.EventListener;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import nextapp.echo.app.Component;
import nextapp.echo.app.Label;
import nextapp.echo.extras.app.event.TreeColumnModelEvent;
import nextapp.echo.extras.app.event.TreeColumnModelListener;
import nextapp.echo.extras.app.event.TreeExpansionEvent;
import nextapp.echo.extras.app.event.TreeExpansionListener;
import nextapp.echo.extras.app.event.TreeModelEvent;
import nextapp.echo.extras.app.event.TreeModelListener;
import nextapp.echo.extras.app.tree.DefaultTreeCellRenderer;
import nextapp.echo.extras.app.tree.DefaultTreeColumnModel;
import nextapp.echo.extras.app.tree.DefaultTreeModel;
import nextapp.echo.extras.app.tree.TreeCellRenderer;
import nextapp.echo.extras.app.tree.TreeColumn;
import nextapp.echo.extras.app.tree.TreeColumnModel;
import nextapp.echo.extras.app.tree.TreeModel;
import nextapp.echo.extras.app.tree.TreePath;

public class Tree extends Component {

    private class Renderer {

        private int columnCount;
        private int row;
        private TreeColumn[] treeColumns;
        private TreeCellRenderer[] columnRenderers;

        private void doRender() {
            Object root = model.getRoot();
            if (isHeaderVisible()) {
                renderHeader();
            }
            doRenderNode(new TreePath(root));
        }
        
        private void init() {
            columnCount = columnModel.getColumnCount();
            
            treeColumns = new TreeColumn[columnCount];
            columnRenderers = new TreeCellRenderer[columnCount];
            
            for (int columnIndex = 0; columnIndex < columnCount; ++columnIndex) {
                treeColumns[columnIndex] = columnModel.getColumn(columnIndex);
                
                TreeCellRenderer renderer = treeColumns[columnIndex].getCellRenderer();
                if (renderer == null) {
                    Class columnClass = model.getColumnClass(treeColumns[columnIndex].getModelIndex());
                    renderer = getDefaultRenderer(columnClass);
                    if (renderer == null) {
                        renderer = DEFAULT_TREE_CELL_RENDERER;
                    }
                }
                columnRenderers[columnIndex] = renderer;
            }
        }
        
        private void renderHeader() {
            for (int columnIndex = 0; columnIndex < columnCount; ++columnIndex) {
                int modelColumnIndex = treeColumns[columnIndex].getModelIndex();
                Object headerValue = treeColumns[columnIndex].getHeaderValue();
                if (headerValue == null) {
                    headerValue = model.getColumnName(modelColumnIndex);
                }
                TreeCellRenderer headerRenderer = treeColumns[columnIndex].getHeaderRenderer();
                if (headerRenderer == null) {
                    headerRenderer = defaultHeaderRenderer;
                    if (headerRenderer == null) {
                        headerRenderer = DEFAULT_TREE_CELL_RENDERER;
                    }
                }
                Component renderedComponent 
                        = headerRenderer.getTreeCellRendererComponent(Tree.this, null, headerValue, modelColumnIndex, HEADER_ROW);
                if (renderedComponent == null) {
                    renderedComponent = new Label();
                }
                add(renderedComponent);
                cacheComponent(null, columnIndex, renderedComponent);
            }
        }

        private void doRenderNode(TreePath treePath) {
            // FIXME rerender when expansion state changes (to change node icon
            // between open/closed folder for example)
            Object value = treePath.getLastPathComponent();
            if (!treePathToComponentCache.containsKey(treePath)) {
                renderNodeComponents(treePath);
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
        
        private void renderNodeComponents(TreePath treePath) {
            Object node = treePath.getLastPathComponent();
            
            for (int i = 0; i < columnCount; ++i) {
                int modelColumnIndex = treeColumns[i].getModelIndex();
                Object modelValue = model.getValueAt(node, modelColumnIndex);
                Component renderedComponent 
                        = columnRenderers[i].getTreeCellRendererComponent(Tree.this, treePath, modelValue, modelColumnIndex, row);
                if (renderedComponent == null) {
                    renderedComponent = new Label();
                }
                add(renderedComponent);
                cacheComponent(treePath, i, renderedComponent);
            }
        }
        
        private void cacheComponent(TreePath treePath, int column, Component component) {
            if (1 == columnCount) {
                treePathToComponentCache.put(treePath, component);
            } else {
                List list;
                if (column == 0) {
                    list = new ArrayList();
                    treePathToComponentCache.put(treePath, list);
                } else {
                    list = (List) treePathToComponentCache.get(treePath);
                }
                list.add(component);
            }
        }

        void update(TreePath path, boolean newState) {
            init();
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
            init();
            removeAll();
            treePathToComponentCache.clear();
            rowToTreePathCache.clear();
            row = 0;
            doRender();
        }
    }

    private Renderer renderer = new Renderer();

    public static final String PROPERTY_LINE_STYLE = "lineStyle";
    
    public static final String CELL_RENDERER_CHANGED_PROPERTY = "cellRenderer";
    public static final String MODEL_CHANGED_PROPERTY = "model";
    public static final String EXPANSION_STATE_CHANGED_PROPERTY = "expansionState";
    public static final String AUTO_CREATE_COLUMNS_FROM_MODEL_CHANGED_PROPERTY = "autoCreateColumnsFromModel";
    public static final String COLUMN_MODEL_CHANGED_PROPERTY = "columnModel";
    public static final String DEFAULT_HEADER_RENDERER_CHANGED_PROPERTY = "defaultHeaderRenderer";
    public static final String DEFAULT_RENDERER_CHANGED_PROPERTY = "defaultRenderer";
    public static final String HEADER_VISIBLE_CHANGED_PROPERTY = "headerVisible";
    public static final String INPUT_ACTION = "action";
    
    public static final int LINE_STYLE_SOLID = 0;
    public static final int LINE_STYLE_DOTTED = 1;
    
    public static final int HEADER_ROW = -1;
    
    private static final TreeCellRenderer DEFAULT_TREE_CELL_RENDERER = new DefaultTreeCellRenderer();

    /**
     * Listener to monitor changes to model.
     */
    private TreeModelListener modelListener = new TreeModelListener() {

        /**
         * @see nextapp.echo.extras.app.event.TreeModelListener#treeStructureChanged(
         *          nextapp.echo.extras.app.event.TreeModelEvent)
         */
        public void treeStructureChanged(TreeModelEvent e) {
            invalidate();
            if (isAutoCreateColumnsFromModel()) {
                createDefaultColumnsFromModel();
            }
        }

        /**
         * @see nextapp.echo.extras.app.event.TreeModelListener#treeNodesRemoved(
         *          nextapp.echo.extras.app.event.TreeModelEvent)
         */
        public void treeNodesRemoved(TreeModelEvent e) {
            invalidate();
            if (isAutoCreateColumnsFromModel()) {
                createDefaultColumnsFromModel();
            }
        }

        /**
         * @see nextapp.echo.extras.app.event.TreeModelListener#treeNodesChanged(
         *          nextapp.echo.extras.app.event.TreeModelEvent)
         */
        public void treeNodesChanged(TreeModelEvent e) {
            invalidate();
            if (isAutoCreateColumnsFromModel()) {
                createDefaultColumnsFromModel();
            }
        }

        /**
         * @see nextapp.echo.extras.app.event.TreeModelListener#treeNodesAdded(
         *          nextapp.echo.extras.app.event.TreeModelEvent)
         */
        public void treeNodesAdded(TreeModelEvent e) {
            invalidate();
            if (isAutoCreateColumnsFromModel()) {
                createDefaultColumnsFromModel();
            }
        }
    };
    
    /**
     * Listener to monitor changes to model.
     */
    private TreeColumnModelListener columnModelListener = new TreeColumnModelListener() {

        /**
         * @see nextapp.echo.extras.app.event.TreeColumnModelListener#columnAdded(nextapp.echo.extras.app.event.TreeColumnModelEvent)
         */
        public void columnAdded(TreeColumnModelEvent e) {
            invalidate();
        }

        /**
         * @see nextapp.echo.extras.app.event.TreeColumnModelListener#columnMoved(nextapp.echo.extras.app.event.TreeColumnModelEvent)
         */
        public void columnMoved(TreeColumnModelEvent e) {
            invalidate();
        }

        /**
         * @see nextapp.echo.extras.app.event.TreeColumnModelListener#columnRemoved(nextapp.echo.extras.app.event.TreeColumnModelEvent)
         */
        public void columnRemoved(TreeColumnModelEvent e) {
            invalidate();
        }
        
    };

    private TreeModel model;
    private TreeColumnModel columnModel;
    private Map defaultRendererMap = new HashMap();
    private TreeCellRenderer defaultHeaderRenderer;
    private Set expandedPaths = new HashSet();
    private List rowToTreePathCache = new ArrayList();
    private Map treePathToComponentCache = new HashMap();
    private boolean valid = false;
    private TreeCellRenderer cellRenderer;
    private boolean autoCreateColumnsFromModel;
    private boolean headerVisible = true;

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
        this(model, null);
    }

    /**
     * Constructs a new <code>Tree</code> with the specified model.
     * 
     * @param model the model
     */
    public Tree(TreeModel model, TreeColumnModel columnModel) {
        super();
        
        if (columnModel == null) {
            setColumnModel(new DefaultTreeColumnModel());
            setAutoCreateColumnsFromModel(true);
        } else {
            setColumnModel(columnModel);
        }
        setModel(model);
        setCellRenderer(DEFAULT_TREE_CELL_RENDERER);
    }

    /**
     * Creates a <code>TableColumnModel</code> based on the 
     * <code>TableModel</code>.  This method is invoked automatically when the 
     * <code>TableModel</code>'s structure changes if the 
     * <code>autoCreateColumnsFromModel</code> flag is set.
     */
    public void createDefaultColumnsFromModel() {
        if (model != null) {
            while (columnModel.getColumnCount() > 0) {
                columnModel.removeColumn(columnModel.getColumn(0));
            }
            
            int columnCount = model.getColumnCount();
            for (int index = 0; index < columnCount; ++index) {
                columnModel.addColumn(new TreeColumn(index));
            }
        }
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
     * Returns the <code>TreeColumnModel</code> describing this tree's 
     * columns.
     *
     * @return the column model
     */
    public TreeColumnModel getColumnModel() {
        return columnModel;
    }
    
    /**
     * Returns the default <code>TreeCellRenderer</code> used to render
     * header cells.  The default header renderer will be used in the event 
     * that a <code>TreeColumn</code> does not provide a specific header
     * renderer.
     * 
     * @return the <code>TreeCellRenderer</code>
     */
    public TreeCellRenderer getDefaultHeaderRenderer() {
        return defaultHeaderRenderer;
    }
    
    /**
     * Returns the default <code>TreeCellRenderer</code> for the specified 
     * column class.  The default renderer will be used in the event that
     * a <code>TreeColumn</code> does not provide a specific renderer.
     * 
     * @param columnClass the column <code>Class</code>
     * @return the <code>TreeCellRenderer</code>
     */
    public TreeCellRenderer getDefaultRenderer(Class columnClass) {
        return (TreeCellRenderer) defaultRendererMap.get(columnClass);
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
     * Sets whether the <code>TableColumnModel</code> will be created
     * automatically from the <code>TableModel</code>.
     *
     * @param newValue true if the <code>TableColumnModel</code> should be 
     *         created automatically from the <code>TableModel</code>
     * @see #isAutoCreateColumnsFromModel()
     */
    public void setAutoCreateColumnsFromModel(boolean newValue) {
        boolean oldValue = autoCreateColumnsFromModel;
        autoCreateColumnsFromModel = newValue;
        
        if (!oldValue && newValue) {
            createDefaultColumnsFromModel();
        }
        
        firePropertyChange(AUTO_CREATE_COLUMNS_FROM_MODEL_CHANGED_PROPERTY, 
                Boolean.valueOf(oldValue), Boolean.valueOf(newValue));
    }
    
    /** 
     * Sets the <code>TreeColumnModel</code> describing this tree's 
     * columns.
     *
     * @param newValue the new column model
     */
    public void setColumnModel(TreeColumnModel newValue) {
        invalidate();
        
        if (newValue == null) {
            throw new IllegalArgumentException("The model may not be null.");
        }
        
        TreeColumnModel oldValue = columnModel;
        if (oldValue != null) {
            oldValue.removeColumnModelListener(columnModelListener);
        }
        columnModel = newValue;
        newValue.addColumnModelListener(columnModelListener);
        firePropertyChange(COLUMN_MODEL_CHANGED_PROPERTY, oldValue, newValue);
    }
    
    /**
     * Sets the default <code>TreeCellRenderer</code> used to render
     * header cells.  The default header renderer will be used in the event 
     * that a <code>TreeColumn</code> does not provide a specific header
     * renderer.
     * 
     * @param newValue the <code>TreeCellRenderer</code>
     */
    public void setDefaultHeaderRenderer(TreeCellRenderer newValue) {
        invalidate();
        TreeCellRenderer oldValue = defaultHeaderRenderer;
        defaultHeaderRenderer = newValue;
        firePropertyChange(DEFAULT_HEADER_RENDERER_CHANGED_PROPERTY, oldValue, newValue);
    }

    /**
     * Sets the default <code>TreeCellRenderer</code> for the specified 
     * column class.  The default renderer will be used in the event that
     * a <code>TreeColumn</code> does not provide a specific renderer.
     * 
     * @param columnClass the column <code>Class</code>
     * @param newValue the <code>TreeCellRenderer</code>
     */
    public void setDefaultRenderer(Class columnClass, TreeCellRenderer newValue) {
        invalidate();
        if (newValue == null) {
            defaultRendererMap.remove(columnClass);
        } else {
            defaultRendererMap.put(columnClass, newValue);
        }
        firePropertyChange(DEFAULT_RENDERER_CHANGED_PROPERTY, null, null);
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
     * Sets the visibility state of the tree header.
     * 
     * @param newValue true if the header should be displayed
     */
    public void setHeaderVisible(boolean newValue) {
        invalidate();
        boolean oldValue = headerVisible;
        headerVisible = newValue;
        firePropertyChange(HEADER_VISIBLE_CHANGED_PROPERTY, Boolean.valueOf(oldValue), Boolean.valueOf(newValue));
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
     * Determines whether the <code>TableColumnModel</code> will be created
     * automatically from the <code>TreeModel</code>.  If this flag is set,
     * changes to the <code>TreeModel</code> will automatically cause the
     * <code>TableColumnModel</code> to be re-created.  This flag is true
     * by default unless a <code>TableColumnModel</code> is specified in the
     * constructor.
     *
     * @return true if the <code>TableColumnModel</code> will be created
     *         automatically from the <code>TreeModel</code>
     */
    public boolean isAutoCreateColumnsFromModel() {
        return autoCreateColumnsFromModel;
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
     * Determines if the tree header is visible.
     * 
     * @return the header visibility state
     */
    public boolean isHeaderVisible() {
        return headerVisible;
    }

    /**
     * @param row the row to get the path for
     * @return the <code>TreePath</code> that is rendered on the given row.
     * @throws IndexOutOfBoundsException when row is invalid.
     */
    public TreePath getPathForRow(int row) {
        if (row == HEADER_ROW) {
            return null;
        } else {
            return (TreePath) rowToTreePathCache.get(row);
        }
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
        return getComponent(getPathForRow(row), column);
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
        if (model.getColumnCount() == 1) {
            return (Component) treePathToComponentCache.get(path);
        } else {
            List list = (List) treePathToComponentCache.get(path);
            return (Component) list.get(column);
        }
    }
    
    /**
     * Retrieves the line style that is used to render the lines that connect the nodes.
     * 
     * @return the line style, one of the following values:
     *         <ul>
     *           <li><code>LINE_STYLE_SOLID</code></li>
     *           <li><code>LINE_STYLE_DOTTED</code></li>
     *         </ul>
     */
    public int getLineStyle() {
        Integer oLineStyle = (Integer) getProperty(PROPERTY_LINE_STYLE);
        if (oLineStyle == null) {
            return LINE_STYLE_DOTTED;
        }
        return oLineStyle.intValue();
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
        
        if (isAutoCreateColumnsFromModel()) {
            createDefaultColumnsFromModel();
        }

        firePropertyChange(MODEL_CHANGED_PROPERTY, oldValue, newValue);
    }
    
    /**
     * Sets the line style that is used to render the lines that connect the nodes.
     * 
     * @param newValue the line style, one of the following values:
     *        <ul>
     *          <li><code>LINE_STYLE_SOLID</code></li>
     *          <li><code>LINE_STYLE_DOTTED</code></li>
     *        </ul>
     */
    public void setLineStyle(int newValue) {
        setProperty(PROPERTY_LINE_STYLE, new Integer(newValue));
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
