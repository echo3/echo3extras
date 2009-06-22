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
import nextapp.echo.app.Component;
import nextapp.echo.app.ContentPane;
import nextapp.echo.app.Label;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.WindowPane;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.layout.SplitPaneLayoutData;
import nextapp.echo.extras.app.CalendarSelect;
import nextapp.echo.extras.app.AccordionPane;
import nextapp.echo.extras.app.event.TabSelectionEvent;
import nextapp.echo.extras.app.event.TabSelectionListener;
import nextapp.echo.extras.app.layout.AccordionPaneLayoutData;
import nextapp.echo.extras.testapp.AbstractTest;
import nextapp.echo.extras.testapp.ButtonColumn;
import nextapp.echo.extras.testapp.InteractiveApp;
import nextapp.echo.extras.testapp.StyleUtil;
import nextapp.echo.extras.testapp.Styles;
import nextapp.echo.extras.testapp.TestControlPane;

/**
 * Interactive test module for <code>AccordionPane</code>s.
 */
public class AccordionPaneTest extends AbstractTest {
        
    private int tabNumber;

    public AccordionPaneTest() {
        super("AccordionPane", Styles.ICON_16_ACCORDION_PANE);
        
        final AccordionPane accordionPane = new AccordionPane();
        add(accordionPane);
        setTestComponent(this, accordionPane);
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add Label (No LayoutData)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                accordionPane.add(new Label("Generic Label"));
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add Label", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Label label = new Label("Accordion Pane Child " + tabNumber);
                label.setBackground(StyleUtil.randomBrightColor());
                AccordionPaneLayoutData layoutData = new AccordionPaneLayoutData();
                layoutData.setTitle("Label #" + tabNumber);
                label.setLayoutData(layoutData);
                accordionPane.add(label);
                ++tabNumber;
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add Label with Icon", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Label label = new Label("Accordion Pane Child " + tabNumber);
                label.setBackground(StyleUtil.randomBrightColor());
                AccordionPaneLayoutData layoutData = new AccordionPaneLayoutData();
                layoutData.setTitle("Label #" + tabNumber);
                layoutData.setIcon(Styles.ICON_24_YES);
                label.setLayoutData(layoutData);
                accordionPane.add(label);
                ++tabNumber;
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add Label with Huge Icon", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Label label = new Label("Accordion Pane Child " + tabNumber);
                label.setBackground(StyleUtil.randomBrightColor());
                AccordionPaneLayoutData layoutData = new AccordionPaneLayoutData();
                layoutData.setTitle("Label #" + tabNumber);
                layoutData.setIcon(Styles.ICON_64_INFORMATION);
                label.setLayoutData(layoutData);
                accordionPane.add(label);
                ++tabNumber;
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add Big Label", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Label label = createTestTab();
                label.setText(StyleUtil.QUASI_LATIN_TEXT_1);
                accordionPane.add(label);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add-Remove-Add Label", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Label label = new Label("Accordion Pane Child " + tabNumber);
                label.setBackground(StyleUtil.randomBrightColor());
                AccordionPaneLayoutData layoutData = new AccordionPaneLayoutData();
                layoutData.setTitle("Label #" + tabNumber);
                label.setLayoutData(layoutData);
                accordionPane.add(label);
                accordionPane.remove(label);
                accordionPane.add(label);
                ++tabNumber;
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add and Select Label", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Label label = new Label("Accordion Pane Child " + tabNumber);
                label.setBackground(StyleUtil.randomBrightColor());
                AccordionPaneLayoutData layoutData = new AccordionPaneLayoutData();
                layoutData.setTitle("Label #" + tabNumber);
                label.setLayoutData(layoutData);
                accordionPane.add(label);
                ++tabNumber;
                accordionPane.setActiveTabIndex(accordionPane.visibleIndexOf(label));
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add Label (index 0)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Label label = new Label("Accordion Pane Child " + tabNumber);
                label.setBackground(StyleUtil.randomBrightColor());
                AccordionPaneLayoutData layoutData = new AccordionPaneLayoutData();
                layoutData.setTitle("Inserted Label #" + tabNumber);
                label.setLayoutData(layoutData);
                accordionPane.add(label, 0);
                ++tabNumber;
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add Label (index 2)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (accordionPane.getComponentCount() < 2) {
                    // Do nothing
                    return;
                }
                Label label = new Label("Accordion Pane Child " + tabNumber);
                label.setBackground(StyleUtil.randomBrightColor());
                AccordionPaneLayoutData layoutData = new AccordionPaneLayoutData();
                layoutData.setTitle("Inserted Label #" + tabNumber);
                label.setLayoutData(layoutData);
                accordionPane.add(label, 2);
                ++tabNumber;
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add Three Labels (Index 0)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                for (int i = 0; i < 3; ++i) {
                    Label label = createTestTab();
                    accordionPane.add(label, i);
                }
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add Three Labels (Index 3)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                int startIndex = accordionPane.getComponentCount() < 3 ? accordionPane.getComponentCount() : 3; 
                for (int i = 0; i < 3; ++i) {
                    Label label = createTestTab();
                    accordionPane.add(label, i + startIndex);
                }
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add Three Labels (Append)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                for (int i = 0; i < 3; ++i) {
                    Label label = createTestTab();
                    accordionPane.add(label);
                }
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add 1-6 labels randomly", 
                new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                int count = 1 + ((int) (Math.random() * 5));
                for (int i = 0; i < count; ++i) {
                    addLabelRandomly(accordionPane);
                }
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Remove 1-6 labels randomly", 
                new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                int count = 1 + ((int) (Math.random() * 5));
                for (int i = 0; i < count; ++i) {
                    removeLabelRandomly(accordionPane);
                }
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add or Remove 1-6x randomly", 
                new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                int count = 1 + ((int) (Math.random() * 5));
                for (int i = 0; i < count; ++i) {
                    boolean add = Math.random() < 0.5;
                    if (add) {
                        addLabelRandomly(accordionPane);
                    } else {
                        removeLabelRandomly(accordionPane);
                    }
                }
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add CalendarSelect", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                CalendarSelect calendarSelect = new CalendarSelect();
                AccordionPaneLayoutData layoutData = new AccordionPaneLayoutData();
                layoutData.setTitle("Calendar #" + tabNumber++);
                calendarSelect.setLayoutData(layoutData);
                accordionPane.add(calendarSelect);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add AccordionPaneTest", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                AccordionPaneTest accordionPaneTest = new AccordionPaneTest();
                AccordionPaneLayoutData layoutData = new AccordionPaneLayoutData();
                layoutData.setTitle("APT #" + tabNumber++);
                accordionPaneTest.setLayoutData(layoutData);
                accordionPane.add(accordionPaneTest);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add ContentPane", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                final ContentPane contentPane = new ContentPane();
                ButtonColumn buttonColumn = new ButtonColumn();
                buttonColumn.addButton("Add WindowPane", new ActionListener(){
                
                    public void actionPerformed(ActionEvent e) {
                        WindowPane windowPane = new WindowPane();
                        windowPane.setStyleName("Default");
                        windowPane.setTitle("Test Window");
                        windowPane.add(new Label(StyleUtil.QUASI_LATIN_TEXT_1));
                        contentPane.add(windowPane);
                    }
                });
                buttonColumn.addButton("Add AccordionPaneTest WindowPane", new ActionListener(){
                
                    public void actionPerformed(ActionEvent e) {
                        WindowPane windowPane = new WindowPane();
                        windowPane.setStyleName("Default");
                        windowPane.setTitle("Test Window");
                        windowPane.add(new AccordionPaneTest());
                        contentPane.add(windowPane);
                    }
                });
                contentPane.add(buttonColumn);
                AccordionPaneLayoutData layoutData = new AccordionPaneLayoutData();
                layoutData.setTitle("ContentPane #" + tabNumber++);
                contentPane.setLayoutData(layoutData);
                accordionPane.add(contentPane);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add SplitPane", new ActionListener(){
        
            public void actionPerformed(ActionEvent arg0) {
                SplitPane splitPane = new SplitPane(SplitPane.ORIENTATION_HORIZONTAL_LEFT_RIGHT);
                splitPane.setResizable(true);
                AccordionPaneLayoutData layoutData = new AccordionPaneLayoutData();
                layoutData.setTitle("SplitPane #" + tabNumber++);
                splitPane.setLayoutData(layoutData);
                accordionPane.add(splitPane);
                
                SplitPaneLayoutData splitPaneLayoutData;
                
                Label left = new Label("Left");
                splitPaneLayoutData = new SplitPaneLayoutData();
                splitPaneLayoutData.setBackground(new Color(0xafafff));
                left.setLayoutData(splitPaneLayoutData);
                splitPane.add(left);
                
                Label right = new Label("Right");
                splitPaneLayoutData = new SplitPaneLayoutData();
                splitPaneLayoutData.setBackground(new Color(0xafffaf));
                right.setLayoutData(splitPaneLayoutData);
                splitPane.add(right);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Remove-Add Index 0", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (accordionPane.getComponentCount() < 0) {
                    return;
                }
                Component component = accordionPane.getComponent(0);
                accordionPane.remove(component);
                accordionPane.add(component, 0);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Remove-Add Index 2", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (accordionPane.getComponentCount() < 2) {
                    return;
                }
                Component component = accordionPane.getComponent(2);
                accordionPane.remove(component);
                accordionPane.add(component, 2);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Remove Last Tab", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (accordionPane.getComponentCount() > 0) {
                    accordionPane.remove(accordionPane.getComponentCount() - 1);
                }
            }
        });
 
        // General Properties
        
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, "foreground");
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, "background");
        addInsetsPropertyTests(TestControlPane.CATEGORY_PROPERTIES, "defaultContentInsets");

        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, "tabForeground");
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, "tabBackground");
        addBorderPropertyTests(TestControlPane.CATEGORY_PROPERTIES, "tabBorder");
        
        addBooleanPropertyTests(TestControlPane.CATEGORY_PROPERTIES, "tabRolloverEnabled");
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, "tabRolloverForeground");
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, "tabRolloverBackground");
        addBorderPropertyTests(TestControlPane.CATEGORY_PROPERTIES, "tabRolloverBorder");
        
        addIntegerPropertyTests(TestControlPane.CATEGORY_PROPERTIES, "animationTime", new int[]{0, 150, 350, 1000});
        
        // Selection Properties

        for (int i = 0; i < 10; ++i) {
            final int tabIndex = i;
            testControlsPane.addButton(TestControlPane.CATEGORY_SELECTION, "Select TabIndex " + i, new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    accordionPane.setActiveTabIndex(tabIndex);
                }
            });
        }
        
        // Listener Tests
        
        testControlsPane.addButton(TestControlPane.CATEGORY_LISTENERS, "Add TabSelectionListener", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                accordionPane.addTabSelectionListener(new TabSelectionListener(){
                    public void tabSelected(TabSelectionEvent e) {
                        InteractiveApp.getApp().consoleWrite("Tab selection event received: " + e.toString());
                    }
                });
            }
        });

        // Integration Tests
        
        addStandardIntegrationTests();
    }

    private void addLabelRandomly(AccordionPane accordionPane) {
        Label label = createTestTab();
        int position = ((int) (Math.random() * (accordionPane.getComponentCount() + 1)));
        accordionPane.add(label, position);
        ++tabNumber;
    }
    
    private Label createTestTab() {
        Label label = new Label("Tab Pane Child " + tabNumber);
        label.setBackground(StyleUtil.randomBrightColor());
        AccordionPaneLayoutData layoutData = new AccordionPaneLayoutData();
        layoutData.setTitle("Label #" + tabNumber);
        label.setLayoutData(layoutData);
        ++tabNumber;
        return label;
    }

    private void removeLabelRandomly(AccordionPane accordionPane) {
        if (accordionPane.getComponentCount() == 0) {
            return;
        }
        int position = ((int) (Math.random() * (accordionPane.getComponentCount())));
        accordionPane.remove(position);
    }
}
