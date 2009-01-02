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

import nextapp.echo.app.ContentPane;
import nextapp.echo.app.Label;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.extras.app.TransitionPane;
import nextapp.echo.extras.testapp.AbstractTest;
import nextapp.echo.extras.testapp.StyleUtil;
import nextapp.echo.extras.testapp.Styles;
import nextapp.echo.extras.testapp.TestControlPane;

public class TransitionPaneTest extends AbstractTest {
    
    private int childNumber = 0;

    public TransitionPaneTest() {
        
        super("TransitionPane", Styles.ICON_16_TRANSITION_PANE);        
        
        final TransitionPane transitionPane = new TransitionPane();
        add(transitionPane);
        setTestComponent(this, transitionPane);
        
        // Add/Remove Content

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Set Content Label", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                transitionPane.removeAll();
                Label label = new Label("Label Pane #" + childNumber);
                label.setBackground(StyleUtil.randomBrightColor());
                transitionPane.add(label);
                ++childNumber;
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Set Content ContentPane", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                transitionPane.removeAll();
                ContentPane contentPane = new ContentPane();
                contentPane.setBackground(StyleUtil.randomBrightColor());
                Label label = new Label("Content Pane #" + childNumber);
                contentPane.add(label);
                transitionPane.add(contentPane);
                ++childNumber;
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Set Content TransitionPaneTest", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                transitionPane.removeAll();
                transitionPane.add(new TransitionPaneTest());
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Set Content ColorSelectTest", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                transitionPane.removeAll();
                transitionPane.add(new ColorSelectTest());
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Set Content TabPaneTest", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                transitionPane.removeAll();
                transitionPane.add(new TabPaneTest());
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Remove Content", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                transitionPane.removeAll();
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add-Remove-Add Label", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                transitionPane.removeAll();

                Label label = new Label("Accordion Pane Child " + childNumber);
                label.setBackground(StyleUtil.randomBrightColor());
                transitionPane.add(label);
                transitionPane.remove(label);
                transitionPane.add(label);
                ++childNumber;
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add-Remove Label1, Add Label2", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                transitionPane.removeAll();
                
                Label label = new Label("Accordion Pane Child " + childNumber);
                label.setBackground(StyleUtil.randomBrightColor());
                transitionPane.add(label);
                transitionPane.remove(label);
                
                label = new Label("Accordion Pane Child " + childNumber);
                label.setBackground(StyleUtil.randomBrightColor());
                transitionPane.add(label);
                ++childNumber;
            }
        });
        
        // Properties
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Trans = Null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                transitionPane.set(TransitionPane.PROPERTY_TYPE, null);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Trans = Immediate", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                transitionPane.setType(TransitionPane.TYPE_IMMEDIATE_REPLACE);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Trans = CameraPan/Left", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                transitionPane.setType(TransitionPane.TYPE_CAMERA_PAN_LEFT);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Trans = CameraPan/Right", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                transitionPane.setType(TransitionPane.TYPE_CAMERA_PAN_RIGHT);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Trans = CameraPan/Up", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                transitionPane.setType(TransitionPane.TYPE_CAMERA_PAN_UP);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Trans = CameraPan/Down", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                transitionPane.setType(TransitionPane.TYPE_CAMERA_PAN_DOWN);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Trans = Blind/Black/In", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                transitionPane.setType(TransitionPane.TYPE_BLIND_BLACK_IN);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Trans = Blind/Black/Out", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                transitionPane.setType(TransitionPane.TYPE_BLIND_BLACK_OUT);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Trans = Fade/Black", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                transitionPane.setType(TransitionPane.TYPE_FADE_TO_BLACK);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Trans = Fade/White", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                transitionPane.setType(TransitionPane.TYPE_FADE_TO_WHITE);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Trans = Fade", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                transitionPane.setType(TransitionPane.TYPE_FADE);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES,
                TransitionPane.PROPERTY_DURATION + ": null", new ActionListener(){
            public void actionPerformed(ActionEvent arg0) {
                transitionPane.set(TransitionPane.PROPERTY_DURATION, null);
            }
        });
        addIntegerPropertyTests(TestControlPane.CATEGORY_PROPERTIES, TransitionPane.PROPERTY_DURATION,
                new int[]{0, 50, 100, 350, 700, 1000, 2000, 5000});
    }
}
