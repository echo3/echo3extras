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

import nextapp.echo.app.Border;
import nextapp.echo.app.Color;
import nextapp.echo.app.Extent;
import nextapp.echo.extras.app.ListViewer;
import nextapp.echo.extras.app.viewer.AbstractViewerModel;
import nextapp.echo.extras.testapp.AbstractTest;

/**
 * Interactive test module for <code>ListViewer</code>s.
 */
public class ListViewerTest extends AbstractTest {

    public ListViewerTest() {
        super("ListViewer", null);
        final ListViewer listViewer = new ListViewer();
        listViewer.setColumnWidth(0, new Extent(50));
        listViewer.setColumnWidth(1, new Extent(40, Extent.PERCENT));
        listViewer.setColumnWidth(2, new Extent(5, Extent.EM));
        listViewer.setColumnWidth(3, new Extent(60, Extent.PERCENT));
        
        listViewer.setColumnName(0, "a:50px");
        listViewer.setColumnName(1, "b:40%");
        listViewer.setColumnName(2, "c:5em");
        listViewer.setColumnName(3, "d:60%");
        
        listViewer.setBorder(new Border(new Border.Side[] { new Border.Side(1, Color.BLACK, Border.STYLE_SOLID), 
                new Border.Side(0, Color.BLACK, Border.STYLE_NONE),
                new Border.Side(0, Color.BLACK, Border.STYLE_NONE),
                new Border.Side(0, Color.BLACK, Border.STYLE_NONE) }));
        
        listViewer.setHeaderBackground(new Color(0x2f2f2f));
        listViewer.setHeaderForeground(new Color(0xffffff));
        
        listViewer.setModel(new AbstractViewerModel() {
            
            public int size() {
                return 500;
            }
            
            public Object get(int index) {
            	return new String[]{"a" + index, "b" + index * 2 + "c", "q"};
            }
        });
        
        add(listViewer);
        setTestComponent(this, listViewer);

        addStandardIntegrationTests();
    }
}
