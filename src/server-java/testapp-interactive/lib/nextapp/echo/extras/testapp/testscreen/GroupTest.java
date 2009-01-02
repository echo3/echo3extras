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

import nextapp.echo.app.Component;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Label;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.extras.app.Group;
import nextapp.echo.extras.testapp.AbstractTest;
import nextapp.echo.extras.testapp.StyleUtil;
import nextapp.echo.extras.testapp.Styles;
import nextapp.echo.extras.testapp.TestControlPane;

/**
 * Interactive test module for <code>Group</code>s.
 */
public class GroupTest extends AbstractTest {

    public GroupTest() {
        super("Group", Styles.ICON_16_GROUP);
        final Group group = new Group();
        group.setTitle("GroupTitle");
        group.set("ieAlphaRenderBorder", Boolean.TRUE);
        
        add(group);
        setTestComponent(this, group);
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Small Label", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                group.removeAll();
                group.add(new Label("Child Component"));
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Large Label", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                group.removeAll();
                group.add(new Label(StyleUtil.QUASI_LATIN_TEXT_1));
            }
        });
        
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Component.PROPERTY_FOREGROUND);
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Component.PROPERTY_BACKGROUND);
        addInsetsPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Group.PROPERTY_INSETS);
        addFontPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Group.PROPERTY_TITLE_FONT);
        addInsetsPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Group.PROPERTY_TITLE_INSETS);
        addExtentPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Group.PROPERTY_TITLE_POSITION, new Extent[] {new Extent(5), new Extent(25), new Extent(25, Extent.PERCENT), new Extent(50, Extent.PERCENT), null});

        addStandardIntegrationTests();
    }
}
