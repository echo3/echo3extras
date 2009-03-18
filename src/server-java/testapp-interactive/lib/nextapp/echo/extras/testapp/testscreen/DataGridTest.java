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

package nextapp.echo.extras.testapp.testscreen;

import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.extras.app.DataGrid;
import nextapp.echo.extras.app.datagrid.AbstractDataGridModel;
import nextapp.echo.extras.testapp.AbstractTest;
import nextapp.echo.extras.testapp.TestControlPane;


/**
 * Interactive test module for <code>DataGrid</code>s.
 */
public class DataGridTest extends AbstractTest {
    
    private static class MultiplicationModel extends AbstractDataGridModel {
        
        private int size;
        
        public MultiplicationModel(int size) {
            super();
            this.size = size;
        }
        
        public int getRowCount() {
            return size;
        }
    
        public int getColumnCount() {
            return size;
        }
    
        public Object get(int column, int row) {
            return Long.toString(((long) column + 1) * ((long) row + 1));
        }
    }
    
    public DataGridTest() {
        super("DataGrid *unstable/experimental*", null);

        final DataGrid dataGrid = new DataGrid();
        add(dataGrid);
        setTestComponent(this, dataGrid);

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "0 Multiplication Model", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                dataGrid.setModel(new MultiplicationModel(0));
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "10 Multiplication Model", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                dataGrid.setModel(new MultiplicationModel(10));
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "100 Multiplication Model", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                dataGrid.setModel(new MultiplicationModel(100));
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "1000 Multiplication Model", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                dataGrid.setModel(new MultiplicationModel(1000));
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "1M Multiplication Model", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                dataGrid.setModel(new MultiplicationModel(1000000));
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "1B Multiplication Model", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                dataGrid.setModel(new MultiplicationModel(1000000000));
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set Row = 0", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                dataGrid.setRowIndex(new Integer(0));
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set Row = 1", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                dataGrid.setRowIndex(new Integer(1));
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set Row = 2", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                dataGrid.setRowIndex(new Integer(2));
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set Row = 2.5", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                dataGrid.setRowIndex(new Double(2.5));
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set Row = 50", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                dataGrid.setRowIndex(new Integer(50));
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set Row = 100", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                dataGrid.setRowIndex(new Integer(100));
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set Row = 1000", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                dataGrid.setRowIndex(new Integer(1000));
            }
        });
    }
}
