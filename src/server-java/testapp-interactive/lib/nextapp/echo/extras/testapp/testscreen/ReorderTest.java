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
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.Row;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.extras.app.Reorder;
import nextapp.echo.extras.app.ReorderHandle;
import nextapp.echo.extras.testapp.AbstractTest;
import nextapp.echo.extras.testapp.TestControlPane;

/**
 * Interactive test module for <code>ColorSelect</code>s.
 */
public class ReorderTest extends AbstractTest {

    public ReorderTest() {
        super("Reorder", null);
        
        final Reorder reorder = new Reorder();
        add(reorder);
        setTestComponent(this, reorder);
        
        for (int i = 0; i < 6; ++i) {
            Row row = new Row();
            row.setBorder(new Border(1, new Color(0xddddff), Border.STYLE_OUTSET));
            row.setBackground(new Color(0xddddff));
            row.setInsets(new Insets(10, 5));
            row.setCellSpacing(new Extent(10));
            
            row.add(new ReorderHandle());
            
            Label label = new Label("Label #" + i);
            row.add(label);
            
            reorder.add(row);
        }
        
        // Properties

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Query Order", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
//                StringBuffer out = new StringBuffer();
//                int[] order = reorder.getOrder();
//                for (int i = 0; i < order.length; ++i) {
//                    if (i > 0) {
//                        out.append(", ");
//                    }
//                    out.append(i);
//                    InteractiveApp.getApp().consoleWrite("Order: " + out);
//                }
//                    
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set Order 0, 1, 3, 5, 2, 4", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                reorder.setOrder(new int[]{0, 1, 3, 5, 2, 4});
            }
        });
        
        // Integration
        
        addStandardIntegrationTests();
    }
}
