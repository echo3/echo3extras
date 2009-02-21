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

    public static final String MODEL_CHANGED_PROPERTY = "model";

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
     * Retrieves the model.
     * 
     * @return the model
     */
    public DataGridModel getModel() {
        return model;
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
}
