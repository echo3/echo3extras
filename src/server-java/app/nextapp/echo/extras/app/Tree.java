/* 
 * This file is part of the Echo Extras Project.
 * Copyright (C) 2005-2009 NextApp, Inc.
 *
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 */

package nextapp.echo.extras.app;

import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.EventListener;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import nextapp.echo.app.Border;
import nextapp.echo.app.Color;
import nextapp.echo.app.Component;
import nextapp.echo.app.Extent;
import nextapp.echo.app.FillImage;
import nextapp.echo.app.Font;
import nextapp.echo.app.ImageReference;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.event.ChangeEvent;
import nextapp.echo.app.event.ChangeListener;
import nextapp.echo.extras.app.event.TreeColumnModelEvent;
import nextapp.echo.extras.app.event.TreeColumnModelListener;
import nextapp.echo.extras.app.event.TreeExpansionEvent;
import nextapp.echo.extras.app.event.TreeExpansionListener;
import nextapp.echo.extras.app.event.TreeModelEvent;
import nextapp.echo.extras.app.event.TreeModelListener;
import nextapp.echo.extras.app.tree.AbstractTreeModel;
import nextapp.echo.extras.app.tree.DefaultTreeCellRenderer;
import nextapp.echo.extras.app.tree.DefaultTreeColumnModel;
import nextapp.echo.extras.app.tree.DefaultTreeSelectionModel;
import nextapp.echo.extras.app.tree.TreeCellRenderer;
import nextapp.echo.extras.app.tree.TreeColumn;
import nextapp.echo.extras.app.tree.TreeColumnModel;
import nextapp.echo.extras.app.tree.TreeModel;
import nextapp.echo.extras.app.tree.TreePath;
import nextapp.echo.extras.app.tree.TreeSelectionModel;

/**
 * A control that displays a set of hierarchical data as an outline.
 * Each row in the tree can have a number of columns, so this tree 
 * implementation is in fact a tree table. 
 */
public class Tree extends Component {

    private class Renderer 
    implements Serializable {

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
                        renderer = getCellRenderer();
                        if (renderer == null) {
                            renderer = DEFAULT_TREE_CELL_RENDERER;
                        }
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
                Component renderedComponent = headerRenderer.getTreeCellRendererComponent(Tree.this, null, headerValue, 
                        modelColumnIndex, HEADER_ROW, false);
                if (renderedComponent == null) {
                    renderedComponent = new Label();
                }
                add(renderedComponent);
                cacheComponent(null, columnIndex, renderedComponent);
            }
        }

        private void doRenderNode(TreePath treePath) {
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
            
            boolean leaf = model.getChildCount(node) == 0;
            for (int i = 0; i < columnCount; ++i) {
                int modelColumnIndex = treeColumns[i].getModelIndex();
                Object modelValue = model.getValueAt(node, modelColumnIndex);
                Component renderedComponent = columnRenderers[i].getTreeCellRendererComponent(
                        Tree.this, treePath, modelValue, modelColumnIndex, row, leaf);
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
            if (row == -1) {
                row = rowToTreePathCache.size();
            }
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
            int endRow;
            TreePath siblingPath = getSiblingPath(path);
            if (siblingPath == null) {
                endRow = rowToTreePathCache.size();
            } else {
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

    public static final String PROPERTY_ACTION_COMMAND = "actionCommand";
    public static final String PROPERTY_BORDER = "border";
    public static final String PROPERTY_HEADER_VISIBLE = "headerVisible";
    public static final String PROPERTY_INSETS = "insets";
    public static final String PROPERTY_LINE_STYLE = "lineStyle";
    public static final String PROPERTY_NODE_CLOSED_ICON = "nodeClosedIcon";
    public static final String PROPERTY_NODE_CLOSED_BOTTOM_ICON = "nodeClosedBottomIcon";
    public static final String PROPERTY_NODE_OPEN_ICON = "nodeOpenIcon";
    public static final String PROPERTY_NODE_OPEN_BOTTOM_ICON = "nodeOpenBottomIcon";
    public static final String PROPERTY_ROLLOVER_BACKGROUND = "rolloverBackground";
    public static final String PROPERTY_ROLLOVER_BACKGROUND_IMAGE = "rolloverBackgroundImage";
    public static final String PROPERTY_ROLLOVER_BORDER = "rolloverBorder";
    public static final String PROPERTY_ROLLOVER_ENABLED = "rolloverEnabled";
    public static final String PROPERTY_ROLLOVER_FONT = "rolloverFont";
    public static final String PROPERTY_ROLLOVER_FOREGROUND = "rolloverForeground";
    public static final String PROPERTY_ROOT_VISIBLE = "rootVisible";
    public static final String PROPERTY_SELECTION_BACKGROUND = "selectionBackground";
    public static final String PROPERTY_SELECTION_BACKGROUND_IMAGE = "selectionBackgroundImage";
    public static final String PROPERTY_SELECTION_BORDER = "selectionBorder";
    public static final String PROPERTY_SELECTION_ENABLED = "selectionEnabled";
    public static final String PROPERTY_SELECTION_FONT = "selectionFont";
    public static final String PROPERTY_SELECTION_FOREGROUND = "selectionForeground";
    public static final String PROPERTY_SHOWS_ROOT_HANDLE = "showsRootHandle";
    public static final String PROPERTY_WIDTH = "width";
    
    public static final String EXPAND_ACTION = "expand";
    public static final String INPUT_ACTION = "action";

    public static final String ACTION_LISTENERS_CHANGED_PROPERTY = "actionListeners";
    public static final String AUTO_CREATE_COLUMNS_FROM_MODEL_CHANGED_PROPERTY = "autoCreateColumnsFromModel";
    public static final String CELL_RENDERER_CHANGED_PROPERTY = "cellRenderer";
    public static final String COLUMN_MODEL_CHANGED_PROPERTY = "columnModel";
    public static final String COLUMN_WIDTH_CHANGED_PROPERTY = "columnWidth";
    public static final String DEFAULT_HEADER_RENDERER_CHANGED_PROPERTY = "defaultHeaderRenderer";
    public static final String DEFAULT_RENDERER_CHANGED_PROPERTY = "defaultRenderer";
    public static final String EXPANSION_STATE_CHANGED_PROPERTY = "expansionState";
    public static final String MODEL_CHANGED_PROPERTY = "model";
    public static final String SELECTION_CHANGED_PROPERTY = "selection";
    public static final String SELECTION_MODEL_CHANGED_PROPERTY = "selectionModel";
    public static final String SELECTION_MODE_CHANGED_PROPERTY = "selectionMode";
    
    public static final int LINE_STYLE_NONE = 0;
    public static final int LINE_STYLE_SOLID = 1;
    public static final int LINE_STYLE_DOTTED = 2;
    
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
            TreePath removedPath = e.getTreePath();
            TreePath[] selectionPaths = getSelectionModel().getSelectionPaths();
            for (int i = 0; i < selectionPaths.length; i++) {
                TreePath selectionPath = selectionPaths[i];
                if (removedPath.isDescendant(selectionPath)) {
                    getSelectionModel().removeSelectionPath(selectionPath);
                }
            }
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
         * @see nextapp.echo.extras.app.event.TreeColumnModelListener#columnAdded(
         *      nextapp.echo.extras.app.event.TreeColumnModelEvent)
         */
        public void columnAdded(TreeColumnModelEvent e) {
            invalidate();
        }

        /**
         * @see nextapp.echo.extras.app.event.TreeColumnModelListener#columnMoved(
         *      nextapp.echo.extras.app.event.TreeColumnModelEvent)
         */
        public void columnMoved(TreeColumnModelEvent e) {
            invalidate();
        }

        /**
         * @see nextapp.echo.extras.app.event.TreeColumnModelListener#columnRemoved(
         *      nextapp.echo.extras.app.event.TreeColumnModelEvent)
         */
        public void columnRemoved(TreeColumnModelEvent e) {
            invalidate();
        }
        
        /**
         * @see nextapp.echo.extras.app.event.TreeColumnModelListener#columnResized(
         *      nextapp.echo.extras.app.event.TreeColumnModelEvent)
         */
        public void columnResized(TreeColumnModelEvent e) {
            firePropertyChange(COLUMN_WIDTH_CHANGED_PROPERTY, null, null);
        }
        
    };
    
    private ChangeListener changeListener = new ChangeListener() {
        public void stateChanged(ChangeEvent e) {
            if (!suppressChangeNotifications) {
                firePropertyChange(SELECTION_CHANGED_PROPERTY, null, null);
            }
        }
    };
    
    private class TreeSelectionModelListener implements PropertyChangeListener, Serializable {
        
        public void propertyChange(PropertyChangeEvent evt) {
            if (TreeSelectionModel.SELECTION_MODE_PROPERTY.equals(evt.getPropertyName())) {
                firePropertyChange(SELECTION_MODE_CHANGED_PROPERTY, evt.getOldValue(), evt.getNewValue());
            }
        }
    };
    
    private PropertyChangeListener propertyChangeListener = new TreeSelectionModelListener();

    private TreeModel model;
    private TreeColumnModel columnModel;
    private TreeSelectionModel selectionModel;
    private Map defaultRendererMap = new HashMap();
    private TreeCellRenderer defaultHeaderRenderer;
    private Set expandedPaths = new HashSet();
    private List rowToTreePathCache = new ArrayList();
    private Map treePathToComponentCache = new HashMap();
    private boolean valid = false;
    private TreeCellRenderer cellRenderer;
    private boolean autoCreateColumnsFromModel;
    private boolean suppressChangeNotifications = false;

    /**
     * Constructs a new <code>Tree</code> with a default tree model.
     */
    public Tree() {
        
        this(new AbstractTreeModel() {
        
            public boolean isLeaf(Object object) {
                return true;
            }
        
            public Object getValueAt(Object node, int column) {
                return node;
            }
        
            public Object getRoot() {
                return "";
            }
        
            public int getIndexOfChild(Object parent, Object child) {
                return 0;
            }
        
            public int getColumnCount() {
                return 1;
            }
        
            public int getChildCount(Object parent) {
                return 0;
            }
        
            public Object getChild(Object parent, int index) {
                return null;
            }
        });
    }
    
    /**
     * Constructs a new <code>Tree</code> with the specified model.
     * <p>
     * If the model has a root node, it will be expanded by default.
     * 
     * @param model the model
     */
    public Tree(TreeModel model) {
        this(model, null);
    }

    /**
     * Constructs a new <code>Tree</code> with the specified model.
     * <p>
     * If the model has a root node, it will be expanded by default.
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
        setSelectionModel(new DefaultTreeSelectionModel());
        setCellRenderer(DEFAULT_TREE_CELL_RENDERER);
    }
    
    /**
     * Adds an <code>ActionListener</code> to the <code>Tree</code>.
     * <code>ActionListener</code>s will be invoked when the user
     * selects a row.
     * 
     * @param l the <code>ActionListener</code> to add
     */
    public void addActionListener(ActionListener l) {
        getEventListenerList().addListener(ActionListener.class, l);
        // Notification of action listener changes is provided due to 
        // existence of hasActionListeners() method. 
        firePropertyChange(ACTION_LISTENERS_CHANGED_PROPERTY, null, l);
    }
    
    /**
     * Collapse the node identified by the given path.
     * Any nodes below it will not be collapsed, so, if this node is expanded
     * all nodes below this node that have the expanded state will be rendered
     * expanded.
     * 
     * @param path the path to collapse
     */
    public void collapse(TreePath path) {
        setExpandedState(path, false);
    }
    
    /**
     * Collapse all nodes in the tree.
     */
    public void collapseAll() {
        List collapseList = new LinkedList(expandedPaths);
        for (Iterator it = collapseList.iterator(); it.hasNext();) {
            TreePath path = (TreePath)it.next();
            setExpandedState(path, false);
        }
    }
    
    /**
     * Collapse the node identified by the given path and all nodes below it.
     * 
     * @param path the path to collapse
     */
    protected void collapseAll(TreePath path) {
        List collapseList = new LinkedList(expandedPaths);
        for (Iterator it = collapseList.iterator(); it.hasNext();) {
            TreePath expandedPath = (TreePath)it.next();
            if (path.isDescendant(expandedPath)) {
                setExpandedState(expandedPath, false);
            }
        }
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
     * Expand the node identified by the given path.
     * 
     * @param path the path to expand
     */
    public void expand(TreePath path) {
        setExpandedState(path, true);
    }
    
    /**
     * Expand all nodes in the tree.
     */
    public void expandAll() {
        Object root = model.getRoot();
        if (root == null) {
            return;
        }
        expandAll(new TreePath(root));
    }
    
    /**
     * Expand the node identified by the given path, and all nodes
     * below it.
     * 
     * @param path the path to expand
     */
    protected void expandAll(TreePath path) {
        setExpandedState(path, true);
        Object value = path.getLastPathComponent();
        int childCount = model.getChildCount(value);
        for (int i = 0; i < childCount; ++i) {
            expandAll(path.pathByAddingChild(model.getChild(value, i)));
        }
    }
    
    /**
     * Fires an action event to all listeners.
     */
    private void fireActionEvent() {
        if (!hasEventListenerList()) {
            return;
        }
        EventListener[] listeners = getEventListenerList().getListeners(ActionListener.class);
        ActionEvent e = null;
        for (int i = 0; i < listeners.length; ++i) {
            if (e == null) {
                e = new ActionEvent(this, (String) getRenderProperty(PROPERTY_ACTION_COMMAND));
            } 
            ((ActionListener) listeners[i]).actionPerformed(e);
        }
    }
    
    /**
     * Returns the action command which will be provided in 
     * <code>ActionEvent</code>s fired by this 
     * <code>Tree</code>.
     * 
     * @return the action command
     */
    public String getActionCommand() {
        return (String) get(PROPERTY_ACTION_COMMAND);
    }
    
    /**
     * Returns the <code>Border</code>.
     * 
     * @return the border
     */
    public Border getBorder() {
        return (Border) get(PROPERTY_BORDER);
    }
    
    /**
     * Retrieves the <code>TreeCellRenderer</code> used to render values
     * contained in the tree. The value of this property may be null, in which
     * case the tree should revert to using its default cell renderer.
     * 
     * @return the cell renderer
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
     * Returns the default cell insets.
     * 
     * @return the default cell insets
     */
    public Insets getInsets() {
        return (Insets) get(PROPERTY_INSETS);
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
        super.processInput(inputName, inputValue);
        if (SELECTION_CHANGED_PROPERTY.equals(inputName)) {
            setSelectedIndices((int[]) inputValue);
        } else if (EXPANSION_STATE_CHANGED_PROPERTY.equals(inputName)) {
            int row = ((Integer) inputValue).intValue();
            TreePath path = getPathForRow(row);
            setExpandedState(path, !isExpanded(path));
        } else if (INPUT_ACTION.equals(inputName)) {
            fireActionEvent();
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
     * Sets the action command which will be provided in
     * <code>ActionEvent</code>s fired by this 
     * <code>Tree</code>.
     * 
     * @param newValue the new action command
     */
    public void setActionCommand(String newValue) {
        set(PROPERTY_ACTION_COMMAND, newValue);
    }
    
    /**
     * Sets the <code>Border</code>.
     * 
     * @param newValue the new border
     */
    public void setBorder(Border newValue) {
        set(PROPERTY_BORDER, newValue);
    }

    /**
     * Sets the <code>TreeCellRenderer</code> used to render values contained
     * in the tree. The value of this property may be null, in which case the
     * tree should revert to using its default cell renderer.
     * 
     * @param newValue the new cell renderer
     */
    public void setCellRenderer(TreeCellRenderer newValue) {
        invalidate();
        TreeCellRenderer oldValue = cellRenderer;
        cellRenderer = newValue;
        firePropertyChange(CELL_RENDERER_CHANGED_PROPERTY, oldValue, newValue);
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
        if (model.isLeaf(treePath.getLastPathComponent())) {
            return;
        }
        if (expandedPaths.contains(treePath) == state) {
            // do not fire any events when we are already in the desired state.
            return;
        }
        if (state) {
            // make sure the parent path is expanded
            // do not go into recursion, that will cause too much event
            // notifications
            TreePath topExpanded = null;
            TreePath parentPath = treePath;
            while (parentPath != null) {
                if (!expandedPaths.contains(parentPath)) {
                    expandedPaths.add(parentPath);
                    topExpanded = parentPath;
                    fireExpansionStateUpdate(parentPath, state);
                }
                parentPath = parentPath.getParentPath();
            }
            if (topExpanded != null && valid) {
                renderer.update(topExpanded, true);
            }
        } else {
            expandedPaths.remove(treePath);
            renderer.update(treePath, false);
            fireExpansionStateUpdate(treePath, state);
        }
    }
    
    /**
     * Sets the visibility state of the tree header.
     * 
     * @param newValue true if the header should be displayed
     */
    public void setHeaderVisible(boolean newValue) {
        invalidate();
        set(PROPERTY_HEADER_VISIBLE, Boolean.valueOf(newValue));
    }
    
    /**
     * Sets the default cell insets.
     * 
     * @param newValue the new default cell insets
     */
    public void setInsets(Insets newValue) {
        set(PROPERTY_INSETS, newValue);
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
        Boolean value = (Boolean)get(PROPERTY_HEADER_VISIBLE);
        return value == null ? false : value.booleanValue();
    }
    
    /**
     * Determines if rollover effects are enabled.
     * 
     * @return true if rollover effects are enabled
     * @see #setRolloverEnabled(boolean)
     */
    public boolean isRolloverEnabled() {
        Boolean value = (Boolean) get(PROPERTY_ROLLOVER_ENABLED);
        return value == null ? false : value.booleanValue();
    }
    
    /**
     * Returns true if the root node of the tree is displayed.
     *
     * @return true if the root node of the tree is displayed
     * @see #setRootVisible(boolean)
     */
    public boolean isRootVisible() {
        Boolean value = (Boolean) get(PROPERTY_ROOT_VISIBLE);
        return value == null ? true : value.booleanValue();
    }
    
    /**
     * Determines if selection is enabled.
     * 
     * @return true if selection is enabled
     * @see #setSelectionEnabled(boolean)
     */
    public boolean isSelectionEnabled() {
        Boolean value = (Boolean) get(PROPERTY_SELECTION_ENABLED);
        return value == null ? false : value.booleanValue();
    }
    
    /**
     * Determines whether the handle of the root node should be shown. 
     * 
     * @return <code>true</code> if the root handle should be visible.
     * @see #setShowsRootHandle(boolean)
     */
    public boolean isShowsRootHandle() {
        Boolean value = (Boolean) get(PROPERTY_SHOWS_ROOT_HANDLE);
        return value == null ? false : value.booleanValue();
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

    /**
     * Returns the index of the row the path is currently rendered to.
     * 
     * @param path the path
     * @return the row index, or -1 if the path is not visible
     */
    public int getRowForPath(TreePath path) {
        for (int i = 0; i < rowToTreePathCache.size(); ++i) {
            if (rowToTreePathCache.get(i).equals(path)) {
                return i;
            }
        }
        return -1;
    }
    
    /**
     * Return the rollover background color displayed when the mouse is within
     * the bounds of a row.
     * 
     * @return the color
     */
    public Color getRolloverBackground() {
        return (Color) get(PROPERTY_ROLLOVER_BACKGROUND);
    }

    /**
     * Return the rollover background image displayed when the mouse is within
     * the bounds of a row.
     * 
     * @return the background image
     */
    public FillImage getRolloverBackgroundImage() {
        return (FillImage) get(PROPERTY_ROLLOVER_BACKGROUND_IMAGE);
    }

    /**
     * Return the rollover border displayed when the mouse is within
     * the bounds of a row.
     * 
     * @return the font
     */
    public Border getRolloverBorder() {
        return (Border) get(PROPERTY_ROLLOVER_BORDER);
    }
    
    /**
     * Return the rollover font displayed when the mouse is within
     * the bounds of a row.
     * 
     * @return the font
     */
    public Font getRolloverFont() {
        return (Font) get(PROPERTY_ROLLOVER_FONT);
    }

    /**
     * Return the rollover foreground color displayed when the mouse is within
     * the bounds of a row.
     * 
     * @return the color
     */
    public Color getRolloverForeground() {
        return (Color) get(PROPERTY_ROLLOVER_FOREGROUND);
    }

    /**
     * Returns the row selection background color.
     * 
     * @return the background color
     */
    public Color getSelectionBackground() {
        return (Color) get(PROPERTY_SELECTION_BACKGROUND);
    }

    /**
     * Returns the row selection background image.
     * 
     * @return the background image
     */
    public FillImage getSelectionBackgroundImage() {
        return (FillImage) get(PROPERTY_SELECTION_BACKGROUND_IMAGE);
    }
    
    /**
     * Returns the row selection border.
     * 
     * @return the border
     */
    public Border getSelectionBorder() {
        return (Border) get(PROPERTY_SELECTION_BORDER);
    }
    
    /**
     * Returns the row selection font.
     * 
     * @return the font
     */
    public Font getSelectionFont() {
        return (Font) get(PROPERTY_SELECTION_FONT);
    }
    
    /**
     * Returns the row selection foreground color.
     * 
     * @return the foreground color
     */
    public Color getSelectionForeground() {
        return (Color) get(PROPERTY_SELECTION_FOREGROUND);
    }
    
    /**
     * Returns the row selection model.
     * 
     * @return the selection model
     */
    public TreeSelectionModel getSelectionModel() {
        return selectionModel;
    }
    
    /**
     * Returns the overall width of the tree.
     * This property supports <code>Extent</code>s with
     * fixed or percentile units.
     * 
     * @return the width
     */
    public Extent getWidth() {
        return (Extent) get(PROPERTY_WIDTH);
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
        if (columnModel.getColumnCount() == 1) {
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
        Integer oLineStyle = (Integer) get(PROPERTY_LINE_STYLE);
        if (oLineStyle == null) {
            return LINE_STYLE_DOTTED;
        }
        return oLineStyle.intValue();
    }
    
    /**
     * Retrieves the icon that is rendered for closed nodes. The default icon is a + sign.
     * 
     * @return the icon
     */
    public ImageReference getNodeClosedIcon() {
        return (ImageReference) get(PROPERTY_NODE_CLOSED_ICON);
    }
    
    /**
     * Retrieves the icon that is rendered for closed bottom nodes. The default icon is a + sign.
     * 
     * @return the icon
     */
    public ImageReference getNodeClosedBottomIcon() {
        return (ImageReference) get(PROPERTY_NODE_CLOSED_BOTTOM_ICON);
    }
    
    /**
     * Retrieves the icon that is rendered for opened nodes. The default icon is a - sign.
     * 
     * @return the icon
     */
    public ImageReference getNodeOpenIcon() {
        return (ImageReference) get(PROPERTY_NODE_OPEN_ICON);
    }
    
    /**
     * Retrieves the icon that is rendered for opened bottom nodes. The default icon is a - sign.
     * 
     * @return the icon
     */
    public ImageReference getNodeOpenBottomIcon() {
        return (ImageReference) get(PROPERTY_NODE_OPEN_BOTTOM_ICON);
    }

    /**
     * Marks the tree as needing to be re-rendered.
     */
    private void invalidate() {
        valid = false;
    }
    
    /**
     * Removes an <code>ActionListener</code> from the <code>Tree</code>.
     * <code>ActionListener</code>s will be invoked when the user
     * selects a row.
     * 
     * @param l the <code>ActionListener</code> to remove
     */
    public void removeActionListener(ActionListener l) {
        if (!hasEventListenerList()) {
            return;
        }
        getEventListenerList().removeListener(ActionListener.class, l);
        // Notification of action listener changes is provided due to 
        // existence of hasActionListeners() method. 
        firePropertyChange(ACTION_LISTENERS_CHANGED_PROPERTY, l, null);
    }

    /**
     * Sets the <code>TreeModel</code> being visualized.
     * <p>
     * If the root node is not null, it will be expanded automatically.
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
        
        expandedPaths.clear();
        
        if (isAutoCreateColumnsFromModel()) {
            createDefaultColumnsFromModel();
        }

        firePropertyChange(MODEL_CHANGED_PROPERTY, oldValue, newValue);
        
        if (model.getRoot() != null) {
            setExpandedState(new TreePath(model.getRoot()), true);
        }
    }
    
    /**
     * Sets the line style that is used to render the lines that connect the nodes.
     * 
     * @param newValue the line style, one of the following values:
     *        <ul>
     *          <li><code>LINE_STYLE_NONE</code></li>
     *          <li><code>LINE_STYLE_SOLID</code></li>
     *          <li><code>LINE_STYLE_DOTTED</code></li>
     *        </ul>
     */
    public void setLineStyle(int newValue) {
        set(PROPERTY_LINE_STYLE, new Integer(newValue));
    }
    
    /**
     * Sets the icon that is rendered for closed nodes. The default icon is a + sign.
     * 
     * @param newValue the icon
     */
    public void setNodeClosedIcon(ImageReference newValue) {
        set(PROPERTY_NODE_CLOSED_ICON, newValue);
    }
    
    /**
     * Sets the icon that is rendered for closed bottom nodes. The default icon is a + sign.
     * 
     * @param newValue the icon
     */
    public void setNodeClosedBottomIcon(ImageReference newValue) {
        set(PROPERTY_NODE_CLOSED_BOTTOM_ICON, newValue);
    }
    
    /**
     * Sets the icon that is rendered for opened nodes. The default icon is a - sign.
     * 
     * @param newValue the icon
     */
    public void setNodeOpenIcon(ImageReference newValue) {
        set(PROPERTY_NODE_OPEN_ICON, newValue);
    }
    
    /**
     * Sets the icon that is rendered for opened bottom nodes. The default icon is a - sign.
     * 
     * @param newValue the icon
     */
    public void setNodeOpenBottomIcon(ImageReference newValue) {
        set(PROPERTY_NODE_OPEN_BOTTOM_ICON, newValue);
    }

    /**
     * Sets the rollover background color displayed when the mouse is within
     * the bounds of a row.
     * 
     * @param newValue the new <code>Color</code>
     */
    public void setRolloverBackground(Color newValue) {
        set(PROPERTY_ROLLOVER_BACKGROUND, newValue);
    }

    /**
     * Sets the rollover background image displayed when the mouse is within
     * the bounds of a row.
     * 
     * @param newValue the new background image
     */
    public void setRolloverBackgroundImage(FillImage newValue) {
        set(PROPERTY_ROLLOVER_BACKGROUND_IMAGE, newValue);
    }
    
    /**
     * Sets the rollover border displayed when the mouse is within
     * the bounds of a row.
     * 
     * @param newValue the new background image
     */
    public void setRolloverBorder(Border newValue) {
        set(PROPERTY_ROLLOVER_BORDER, newValue);
    }

    /**
     * Sets whether rollover effects are enabled when the mouse cursor is 
     * within the bounds of a row. Rollover properties have no effect unless 
     * this property is set to true. The default value is false.
     * 
     * @param newValue true if rollover effects should be enabled
     */
    public void setRolloverEnabled(boolean newValue) {
        set(PROPERTY_ROLLOVER_ENABLED, new Boolean(newValue));
    }

    /**
     * Sets the rollover font displayed when the mouse is within
     * the bounds of a row.
     * 
     * @param newValue the new <code>Font</code>
     */
    public void setRolloverFont(Font newValue) {
        set(PROPERTY_ROLLOVER_FONT, newValue);
    }

    /**
     * Sets the rollover foreground color displayed when the mouse is within
     * the bounds of a row.
     * 
     * @param newValue the new <code>Color</code>
     */
    public void setRolloverForeground(Color newValue) {
        set(PROPERTY_ROLLOVER_FOREGROUND, newValue);
    }
    
    /**
     * Determines whether or not the root node from the <code>TreeModel</code>
     * is visible.
     * 
     * @param newValue <code>true</code> if the root node of the tree is
     *                 to be displayed.
     * @see #isRootVisible()                
     */
    public void setRootVisible(boolean newValue) {
        set(PROPERTY_ROOT_VISIBLE, Boolean.valueOf(newValue));
    }

    /**
     * Selects only the specified row indices.
     * 
     * @param selectedIndices the indices to select
     */
    private void setSelectedIndices(int[] selectedIndices) {
        // Temporarily suppress the Tables selection event notifier.
        suppressChangeNotifications = true;
        TreeSelectionModel selectionModel = getSelectionModel();
        selectionModel.clearSelection();
        for (int i = 0; i < selectedIndices.length; ++i) {
            selectionModel.addSelectionPath(getPathForRow(selectedIndices[i]));
        }
        // End temporary suppression.
        suppressChangeNotifications = false;
        firePropertyChange(SELECTION_CHANGED_PROPERTY, null, selectedIndices);
    }

    /**
     * Sets the row selection background color.
     * 
     * @param newValue the new background color
     */
    public void setSelectionBackground(Color newValue) {
        set(PROPERTY_SELECTION_BACKGROUND, newValue);
    }
    
    /**
     * Sets the row selection background image.
     * 
     * @param newValue the new background image
     */
    public void setSelectionBackgroundImage(FillImage newValue) {
        set(PROPERTY_SELECTION_BACKGROUND_IMAGE, newValue);
    }
    
    /**
     * Sets the row selection border.
     * 
     * @param newValue the new border
     */
    public void setSelectionBorder(Border newValue) {
        set(PROPERTY_SELECTION_BORDER, newValue);
    }
    
    /**
     * Sets whether selection is enabled.
     * 
     * @param newValue true to enable selection
     */
    public void setSelectionEnabled(boolean newValue) {
        set(PROPERTY_SELECTION_ENABLED, Boolean.valueOf(newValue));
    }

    /**
     * Sets the row selection foreground color.
     * 
     * @param newValue the new foreground color
     */
    public void setSelectionForeground(Color newValue) {
        set(PROPERTY_SELECTION_FOREGROUND, newValue);
    }
    
    /**
     * Sets the row selection font.
     * 
     * @param newValue the new font
     */
    public void setSelectionFont(Font newValue) {
        set(PROPERTY_SELECTION_FONT, newValue);
    }
    
    /**
     * Sets the row selection model.
     * The selection model may not be null.
     * 
     * @param newValue the new selection model
     */
    public void setSelectionModel(TreeSelectionModel newValue) {
        if (newValue == null) {
            throw new IllegalArgumentException("Selection model may not be null.");
        }
        TreeSelectionModel oldValue = selectionModel;
        if (oldValue != null) {
            oldValue.removeChangeListener(changeListener);
            oldValue.removePropertyChangeListener(propertyChangeListener);
        }
        newValue.addChangeListener(changeListener);
        newValue.addPropertyChangeListener(propertyChangeListener);
        selectionModel = newValue;
        firePropertyChange(SELECTION_MODEL_CHANGED_PROPERTY, oldValue, newValue);
    }
    
    /**
     * Determines whether the handle of the root node should be shown. 
     * 
     * @param newValue <code>true</code> if the root handle should be visible.
     * @see #isShowsRootHandle()
     */
    public void setShowsRootHandle(boolean newValue) {
        set(PROPERTY_SHOWS_ROOT_HANDLE, Boolean.valueOf(newValue));
    }
    
    /**
     * Sets the overall width of the tree.
     * This property supports <code>Extent</code>s with
     * fixed or percentile units.
     * 
     * @param newValue the new width
     */
    public void setWidth(Extent newValue) {
        set(PROPERTY_WIDTH, newValue);
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
