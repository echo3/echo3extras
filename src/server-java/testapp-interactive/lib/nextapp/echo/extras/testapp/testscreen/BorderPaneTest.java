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

import nextapp.echo.app.Color;
import nextapp.echo.app.ContentPane;
import nextapp.echo.app.FillImageBorder;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.layout.SplitPaneLayoutData;
import nextapp.echo.extras.app.BorderPane;
import nextapp.echo.extras.testapp.AbstractTest;
import nextapp.echo.extras.testapp.StyleUtil;
import nextapp.echo.extras.testapp.Styles;
import nextapp.echo.extras.testapp.TestControlPane;

/**
 * Interactive test module for <code>BorderPane</code>s.
 */
public class BorderPaneTest extends AbstractTest {

    public BorderPaneTest() {
        super("BorderPane", Styles.ICON_16_BORDER_PANE);
        final BorderPane borderPane = new BorderPane();
        borderPane.setStyleName("Shadow");
        add(borderPane);
        setTestComponent(this, borderPane);
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Small Label", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                borderPane.removeAll();
                borderPane.add(new Label("Child Component"));
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Large Label", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                borderPane.removeAll();
                borderPane.add(new Label(StyleUtil.QUASI_LATIN_TEXT_1));
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "SplitPane", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                borderPane.removeAll();
                SplitPane splitPane = new SplitPane();
                splitPane.setResizable(true);
                
                Label label;
                SplitPaneLayoutData layoutData;

                layoutData = new SplitPaneLayoutData();
                layoutData.setBackground(new Color(0xafafff));
                label = new Label(StyleUtil.QUASI_LATIN_TEXT_1);
                label.setLayoutData(layoutData);
                splitPane.add(label);

                layoutData = new SplitPaneLayoutData();
                layoutData.setBackground(new Color(0xafffaf));
                label = new Label(StyleUtil.QUASI_LATIN_TEXT_1);
                label.setLayoutData(layoutData);
                splitPane.add(label);

                borderPane.add(splitPane);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "BorderPaneTest", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                borderPane.removeAll();
                borderPane.add(new BorderPaneTest());
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "ContentPane", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                borderPane.removeAll();
                ContentPane content = new ContentPane();
                content.add(new Label("ContentPane"));
                content.setBackground(StyleUtil.randomBrightColor());
                borderPane.add(content);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Clear Content", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                borderPane.removeAll();
            }
        });
        
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, "foreground");
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, "background");
        addFillImagePropertyTests(TestControlPane.CATEGORY_PROPERTIES, BorderPane.PROPERTY_BACKGROUND_IMAGE, 
                StyleUtil.TEST_FILL_IMAGES);
        addInsetsPropertyTests(TestControlPane.CATEGORY_PROPERTIES, "insets");
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set Border = Null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                borderPane.setBorder(null);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set Border = 20px/10px Red", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                borderPane.setBorder(new FillImageBorder(Color.RED, new Insets(20), new Insets(10)));
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set Style = Null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                borderPane.setStyleName(null);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set Style = Shadow", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                borderPane.setStyleName("Shadow");
            }
        });

        addStandardIntegrationTests();
    }
}
