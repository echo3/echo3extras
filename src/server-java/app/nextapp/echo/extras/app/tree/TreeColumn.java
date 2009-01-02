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

package nextapp.echo.extras.app.tree;

import java.beans.PropertyChangeListener;
import java.beans.PropertyChangeSupport;
import java.io.Serializable;

import nextapp.echo.app.Extent;

/**
 * A description of a single column of a <code>Tree</code>.
 */
public class TreeColumn 
implements Serializable {

    public static final String CELL_RENDERER_CHANGED_PROPERTY = "cellRenderer";
    public static final String HEADER_RENDERER_CHANGED_PROPERTY = "headerRenderer";
    public static final String HEADER_VALUE_CHANGED_PROPERTY = "headerValue";
    public static final String IDENTIFIER_CHANGED_PROPERTY = "identifier";
    public static final String MODEL_INDEX_CHANGED_PROPERTY = "modelIndex";
    public static final String WIDTH_CHANGED_PROPERTY = "width";
    
    private Extent width;
    private TreeCellRenderer cellRenderer;
    private TreeCellRenderer headerRenderer;
    private Object headerValue;
    private int modelIndex;
    private Object identifier;
    private PropertyChangeSupport pcs = new PropertyChangeSupport(this);
    
    /**
     * Creates a <code>TreeColumn</code> with the specified model index, 
     * undefined width, and undefined cell and header renderers.
     *
     * @param modelIndex the column index of model data visualized by this 
     *        column
     */
    public TreeColumn(int modelIndex) {
        this(modelIndex, null, null, null);
    }
    
    /**
     * Creates a TreeColumn with the specified model index and width, 
     * and undefined cell and header renderers.
     * 
     * @param modelIndex the column index of model data visualized by this 
     *        column
     * @param width the column width
     */
    public TreeColumn(int modelIndex, Extent width) {
        this(modelIndex, width, null, null);
    }

    /**
     * Creates a TreeColumn with the specified model index, width, 
     * and cell and header renderers.
     * 
     * @param modelIndex the column index of model data visualized by this 
     *        column
     * @param width the column width
     * @param cellRenderer the renderer to use for rendering model values
     * @param headerRenderer the renderer to use for rendering the header cell
     */
    public TreeColumn(int modelIndex, Extent width, TreeCellRenderer cellRenderer, TreeCellRenderer headerRenderer) {        
        super();
        
        this.modelIndex = modelIndex;
        this.width = width;
        setCellRenderer(cellRenderer);
        setHeaderRenderer(headerRenderer);
    }
    
    /**
     * Adds a <code>PropertyChangeListener</code> to be notified
     * of property changes to the column.
     *
     * @param l the listener to add
     */
    public void addPropertyChangeListener(PropertyChangeListener l) {
        pcs.addPropertyChangeListener(l);
    }
    
    /** 
     * Retrieves the <code>TreeCellRenderer</code> used to render values
     * contained in the column.  The value of this property may be null,
     * in which case the tree should revert to using its default cell
     * renderer.
     *
     * @return the cell renderer for this column
     */
    public TreeCellRenderer getCellRenderer() {
        return cellRenderer;
    }
    
    /**
     * Returns the <code>TreeCellRenderer</code> used to render the
     * header cell of this column.  The value of this property may be null,
     * in which case the tree should revert to using its default cell
     * renderer.
     *
     * @return the header cell renderer for this column
     */
    public TreeCellRenderer getHeaderRenderer() {
        return headerRenderer;
    }
    
    /** 
     * Returns the header value for this column.  The header value is the 
     * object that will be provided to the header renderer to produce
     * a component that will be used as the tree header for this column.
     *
     * @return the header value for this column
     */
    public Object getHeaderValue() {
        return headerValue;
    }
    
    /**
     * Returns the identifier for this column.   Each tree column may have
     * an identifier.  Identifiers are provided as a convenience to the
     * application developer, and are neither used nor required by the
     * <code>Tree</code> component.
     *
     * @return the identifier for this column
     */
    public Object getIdentifier() {
        return identifier;
    }
    
    /**
     * Returns the column index of the model which this 
     * <code>TreeColumn</code> represents.  
     * This value is independent of the column's position within the column 
     * model, such that columns may be displayed in an arbitrary order.
     *
     * @return the index of the column in the model
     */
    public int getModelIndex() {
        return modelIndex;
    }
    
    /** 
     * Returns the width of the column.
     * This property supports <code>Extent</code>s with
     * fixed or percentile units.
     *
     * @return the width
     */
    public Extent getWidth() {
        return width;
    }
    
    /**
     * Removes a <code>PropertyChangeListener</code> from being notified
     * of property changes to the column. 
     *
     * @param l the listener to remove
     */
    public void removePropertyChangeListener(PropertyChangeListener l) {
        pcs.removePropertyChangeListener(l);
    }
    
    /** 
     * Sets the <code>TreeCellRenderer</code> used to render values
     * contained in the column.  The value of this property may be null,
     * in which case the tree should revert to using its default cell
     * renderer.
     *
     * @param newValue the new cell renderer
     */
    public void setCellRenderer(TreeCellRenderer newValue) {
        TreeCellRenderer oldValue = cellRenderer;
        cellRenderer = newValue;
        pcs.firePropertyChange(CELL_RENDERER_CHANGED_PROPERTY, oldValue, newValue);
    }
    
    /** 
     * Sets the <code>TreeCellRenderer</code> used to render the
     * header cell of this column.  The value of this property may be null,
     * in which case the tree should revert to using its default cell
     * renderer.
     *
     * @param newValue the new header cell renderer
     */
    public void setHeaderRenderer(TreeCellRenderer newValue) {
        TreeCellRenderer oldValue = headerRenderer;
        headerRenderer = newValue;
        pcs.firePropertyChange(HEADER_RENDERER_CHANGED_PROPERTY, oldValue, newValue);
    }
    
    /** 
     * Sets the header value for this column.  The header value is the 
     * object that will be provided to the header renderer to produce
     * a component that will be used as the tree header for this column.
     *
     * @param newValue the new header value
     */
    public void setHeaderValue(Object newValue) {
        Object oldValue = headerValue;
        headerValue = newValue;
        pcs.firePropertyChange(HEADER_VALUE_CHANGED_PROPERTY, oldValue, newValue);
    }
    
    /**
     * Sets the identifier for this column.  Each tree column may have
     * an identifier.  Identifiers are provided as a convenience to the
     * application developer, and are neither used nor required by the
     * Tree component.
     *
     * @param newValue The new identifier for this column.
     */
    public void setIdentifier(Object newValue) {
        Object oldValue = identifier;
        identifier = newValue;
        pcs.firePropertyChange(IDENTIFIER_CHANGED_PROPERTY, oldValue, newValue);
    }
    
    /**
     * Sets the index of the column in the <code>TreeModel</code> which
     * this <code>TreeColumn</code> object represents.  This value is
     * independent of the column's position within the column model, such that
     * columns may be displayed in an arbitrary order.
     *
     * @param newValue the index of the column in the model
     */
    public void setModelIndex(int newValue) {
        int oldValue = modelIndex;
        modelIndex = newValue;
        pcs.firePropertyChange(MODEL_INDEX_CHANGED_PROPERTY, oldValue, newValue);
    }
    
    /**
     * Sets the width of the column.
     * This property supports <code>Extent</code>s with
     * fixed or percentile units.
     *
     * @param newValue the new width
     */
    public void setWidth(Extent newValue) {
        Extent oldValue = width;
        width = newValue;
        pcs.firePropertyChange(WIDTH_CHANGED_PROPERTY, oldValue, newValue);
    }
}
