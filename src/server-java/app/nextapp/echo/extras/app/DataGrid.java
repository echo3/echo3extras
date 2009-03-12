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

import nextapp.echo.app.Component;
import nextapp.echo.extras.app.datagrid.AbstractDataGridModel;
import nextapp.echo.extras.app.datagrid.DataGridModel;
import nextapp.echo.extras.app.event.DataGridModelEvent;
import nextapp.echo.extras.app.event.DataGridModelListener;

/**
 * DataGrid component.
 * 
 * This component is under heavy development, it should not be used except for testing purposes.
 */
public class DataGrid extends Component {
    
    /**
     * Empty DataGridModel implementation.
     */
    private static class EmptyDataGridModel extends AbstractDataGridModel { 
    
        /**
         * @see nextapp.echo.extras.app.datagrid.DataGridModel#get(int, int)
         */
        public Object get(int column, int row) {
            return null;
        }
    
        /**
         * @see nextapp.echo.extras.app.datagrid.DataGridModel#getColumnCount()
         */
        public int getColumnCount() {
            return 0;
        }
    
        /**
         * @see nextapp.echo.extras.app.datagrid.DataGridModel#getRowCount()
         */
        public int getRowCount() {
            return 0;
        }
    }

    public static final String COLUMN_INDEX_CHANGED_PROPERTY = "columnIndex";
    public static final String COLUMN_PERCENT_CHANGED_PROPERTY = "columnPercent";
    public static final String MODEL_CHANGED_PROPERTY = "model";
    public static final String ROW_INDEX_CHANGED_PROPERTY = "rowIndex";
    public static final String ROW_PERCENT_CHANGED_PROPERTY = "rowPercent";

    /**
     * Listener to monitor changes to model.
     */
    private DataGridModelListener modelListener = new DataGridModelListener() {
        
        /** Serial Version UID. */
        private static final long serialVersionUID = 20070101L;

        /**
         * @see nextapp.echo.extras.app.event.DataGridModelListener#modelChanged(nextapp.echo.extras.app.event.DataGridModelEvent)
         */
        public void modelChanged(DataGridModelEvent e) {
            firePropertyChange(MODEL_CHANGED_PROPERTY, null, null);
        }
    };
    
    /**
     * The first displayed row index.
     * Either this value or <code>columnPercent</code> will be null.
     */
    private Number columnIndex;
    
    /**
     * The percent index of columns which will be displayed (0 = leftmost columns, 100 = rightmost columns).
     * Either this value or <code>columnIndex</code> will be null.
     */
    private Number columnPercent;
    
    /**
     * The first displayed row index.
     * Either this value or <code>rowPercent</code> will be null.
     */
    private Number rowIndex;

    /**
     * The percent index of rows which will be displayed (0 = topmost rows, 100 = bottommost rows).
     * Either this value or <code>rowIndex</code> will be null.
     */
    private Number rowPercent;
    
    /**
     * The model.
     */
    private DataGridModel model;
    
    /**
     * Creates a new <code>DataGrid</code> with an empty model.
     */
    public DataGrid() {
        this(new EmptyDataGridModel());
    }
    
    /**
     * Creates a new <code>DataGrid</code> with the specified model.
     * 
     * @param model the model
     */
    public DataGrid(DataGridModel model) {
        super();
        setModel(model);
    }
    
    /**
     * Returns the first displayed column index.
     * Either this method or <code>getColumnPercent()</code> will return null.
     * 
     * @return the first displayed column index
     */
    public Number getColumnIndex() {
        return columnIndex;
    }

    /**
     * Returns the percent index of columns which will be displayed (0 = leftmost columns, 100 = rightmost columns).
     * Either this method or <code>getColumnIndex()</code> will return null.
     * 
     * @return the percent index of columns which will be displayed
     */
    public Number getColumnPercent() {
        return columnPercent;
    }

    /**
     * Retrieves the model.
     * 
     * @return the model
     */
    public DataGridModel getModel() {
        return model;
    }
    
    /**
     * Returns the first displayed row index.
     * Either this method or <code>getRowPercent()</code> will return null.
     * 
     * @return the first displayed row index
     */
    public Number getRowIndex() {
        return rowIndex;
    }

    /**
     * Returns the percent index of rows which will be displayed (0 = topmost rows, 100 = bottommost rows).
     * Either this method or <code>getRowIndex()</code> will return null.
     * 
     * @return the percent index of rows which will be displayed
     */
    public Number getRowPercent() {
        return rowPercent;
    }

    /**
     * Sets the first displayed column index.
     * This will override any setting configured using <code>setColumnPercent()</code> 
     * 
     * @param newValue the new first displayed column index
     */
    public void setColumnIndex(Number newValue) {
        if (this.columnPercent != null) {
            setColumnPercent(null);
        }
        Number oldValue = (Number) columnIndex;
        columnIndex = newValue;
        firePropertyChange(COLUMN_INDEX_CHANGED_PROPERTY, oldValue, newValue);
    }
    
    /**
     * Sets the percent index of columns which will be displayed (0 = leftmost columns, 100 = rightmost columns).
     * This will override any setting configured using <code>setColumnIndex()</code> 
     * 
     * @param newValue the new percent column index
     */
    public void setColumnPercent(Number newValue) {
        if (this.columnIndex != null) {
            setColumnIndex(null);
        }
        Number oldValue = (Number) columnPercent;
        columnPercent = newValue;
        firePropertyChange(COLUMN_PERCENT_CHANGED_PROPERTY, oldValue, newValue);
    }

    /**
     * Sets the model.
     * 
     * @param newValue the new model (may not be null)
     */
    public void setModel(DataGridModel newValue) {
        if (newValue == null) {
            throw new IllegalArgumentException("The model may not be null.");
        }
        DataGridModel oldValue = model;
        if (oldValue != null) {
            oldValue.removeDataGridModelListener(modelListener);
        }
        model = newValue;
        newValue.addDataGridModelListener(modelListener);
        firePropertyChange(MODEL_CHANGED_PROPERTY, oldValue, newValue);
    }
    
    /**
     * Sets the first displayed row index.
     * This will override any setting configured using <code>setRowPercent()</code> 
     * 
     * @param newValue the new first displayed row index
     */
    public void setRowIndex(Number newValue) {
        if (this.rowPercent != null) {
            setRowPercent(null);
        }
        Number oldValue = (Number) rowIndex;
        rowIndex = newValue;
        firePropertyChange(ROW_INDEX_CHANGED_PROPERTY, oldValue, newValue);
    }
    
    /**
     * Sets the percent index of rows which will be displayed (0 = topmost rows, 100 = bottommost rows).
     * This will override any setting configured using <code>setRowIndex()</code> 
     * 
     * @param newValue the new percent row index
     */
    public void setRowPercent(Number newValue) {
        if (this.rowIndex != null) {
            setRowIndex(null);
        }
        Number oldValue = (Number) rowPercent;
        rowPercent = newValue;
        firePropertyChange(ROW_PERCENT_CHANGED_PROPERTY, oldValue, newValue);
    }
}
