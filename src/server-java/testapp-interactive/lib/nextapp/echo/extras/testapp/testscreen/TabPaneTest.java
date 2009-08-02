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
import nextapp.echo.app.Extent;
import nextapp.echo.app.FillImage;
import nextapp.echo.app.FillImageBorder;
import nextapp.echo.app.ImageReference;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.ResourceImageReference;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.TaskQueueHandle;
import nextapp.echo.app.WindowPane;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.layout.SplitPaneLayoutData;
import nextapp.echo.extras.app.CalendarSelect;
import nextapp.echo.extras.app.TabPane;
import nextapp.echo.extras.app.event.TabClosingEvent;
import nextapp.echo.extras.app.event.TabClosingListener;
import nextapp.echo.extras.app.event.TabSelectionEvent;
import nextapp.echo.extras.app.event.TabSelectionListener;
import nextapp.echo.extras.app.layout.TabPaneLayoutData;
import nextapp.echo.extras.testapp.AbstractTest;
import nextapp.echo.extras.testapp.ButtonColumn;
import nextapp.echo.extras.testapp.InteractiveApp;
import nextapp.echo.extras.testapp.StyleUtil;
import nextapp.echo.extras.testapp.Styles;
import nextapp.echo.extras.testapp.TestControlPane;

/**
 * Interactive test module for <code>TabPane</code>s.
 */
public class TabPaneTest extends AbstractTest {

    private static final String FIB1_BASE = "/nextapp/echo/extras/testapp/resource/image/window/simple/Border";
    
    private static final FillImageBorder FIB1_SURROUND = 
            new FillImageBorder(null, new Insets(17, 17, 23, 23), new Insets(8, 8, 14, 14), 
            new FillImage[] {
                new FillImage(new ResourceImageReference(FIB1_BASE + "TopLeft.png")),
                new FillImage(new ResourceImageReference(FIB1_BASE + "Top.png")),
                new FillImage(new ResourceImageReference(FIB1_BASE + "TopRight.png")),
                new FillImage(new ResourceImageReference(FIB1_BASE + "Left.png")),
                new FillImage(new ResourceImageReference(FIB1_BASE + "Right.png")),
                new FillImage(new ResourceImageReference(FIB1_BASE + "BottomLeft.png")),
                new FillImage(new ResourceImageReference(FIB1_BASE + "Bottom.png")),
                new FillImage(new ResourceImageReference(FIB1_BASE + "BottomRight.png"))
            });
    
    private static final FillImageBorder FIB1_TOP = 
            new FillImageBorder(null, new Insets(17, 17, 23, 0), new Insets(8, 8, 14, 0), 
            new FillImage[] {
                new FillImage(new ResourceImageReference(FIB1_BASE + "TopLeft.png")),
                new FillImage(new ResourceImageReference(FIB1_BASE + "Top.png")),
                new FillImage(new ResourceImageReference(FIB1_BASE + "TopRight.png")),
                new FillImage(new ResourceImageReference(FIB1_BASE + "Left.png")),
                new FillImage(new ResourceImageReference(FIB1_BASE + "Right.png")),
                null,
                null,
                null
            });
    
    private static final FillImageBorder FIB1_BOTTOM = 
            new FillImageBorder(null, new Insets(17, 0, 23, 23), new Insets(8, 0, 14, 14), 
            new FillImage[] {
                null,
                null,
                null,
                new FillImage(new ResourceImageReference(FIB1_BASE + "Left.png")),
                new FillImage(new ResourceImageReference(FIB1_BASE + "Right.png")),
                new FillImage(new ResourceImageReference(FIB1_BASE + "BottomLeft.png")),
                new FillImage(new ResourceImageReference(FIB1_BASE + "Bottom.png")),
                new FillImage(new ResourceImageReference(FIB1_BASE + "BottomRight.png"))
            });
    
    private static final ImageReference[] LEFT_IMAGES = new ImageReference[] {
        null, new ResourceImageReference(Styles.IMAGE_PATH + "TabLeft.png", new Extent(10), null)
    };
    
    private static final ImageReference[] RIGHT_IMAGES = new ImageReference[] {
        null, new ResourceImageReference(Styles.IMAGE_PATH + "TabRight.png", new Extent(10), null)
    };
    
    private static final ImageReference[] CLOSE_ICON_IMAGES = new ImageReference[] {
        null, new ResourceImageReference(Styles.IMAGE_PATH + "TabClose.png"),
        new ResourceImageReference(Styles.IMAGE_PATH + "TabCloseDisabled.png"),
        new ResourceImageReference(Styles.IMAGE_PATH + "TabCloseRollover.png")
    };
    
    private static final Extent[] EXTENT_VALUES = new Extent[] {
        null, new Extent(0), new Extent(1), new Extent(2), new Extent(5), new Extent(10), new Extent(20),
        new Extent(25), new Extent(32), new Extent(40), new Extent(60)
    };
    
    private static final Extent[] EXTENT_WIDTH_VALUES = new Extent[] {
        null, new Extent(50), new Extent(75), new Extent(100), new Extent(150), new Extent(200)
    };
    
    private int tabNumber;

    public TabPaneTest() {
        
        super("TabPane", Styles.ICON_16_TAB_PANE);
        
        final TabPane tabPane = new TabPane();
        add(tabPane);
        setTestComponent(this, tabPane);
        
        // Configurations
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONFIGURATIONS, "Clear All Graphic Borders", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tabPane.setTabActiveImageBorder(null);
                tabPane.setTabInactiveImageBorder(null);
                tabPane.setImageBorder(null);
                tabPane.setTabSpacing(null);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONFIGURATIONS, "Closable with Long Labels (Bug 421)", 
                new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                while (tabPane.getComponentCount() < 5) {
                    Component tab = createTestTab();
                    if (tabPane.getComponentCount() % 2 != 0) {
                        TabPaneLayoutData ld = (TabPaneLayoutData) tab.getLayoutData();
                        ld.setTitle(ld.getTitle() + ", this is a really long label that should be cut off by maximum width.");
                    }
                    tabPane.add(tab);
                }
                tabPane.setTabCloseEnabled(true);
                tabPane.setTabMaximumWidth(new Extent(35, Extent.PERCENT));
                tabPane.setBorderType(TabPane.BORDER_TYPE_ADJACENT_TO_TABS);
                tabPane.setTabRolloverEnabled(true);
                tabPane.setTabActiveBackground(Color.RED);
                tabPane.setTabInactiveBackground(Color.YELLOW);
                tabPane.setTabInactiveForeground(Color.BLUE);
                tabPane.setTabRolloverBackground(Color.GREEN);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONFIGURATIONS, "Change LayoutData", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                int count = tabPane.getComponentCount();
                if (count == 0) {
                    return;
                }
                
                int tabIndex = (int) (Math.random() * count);
                Component component = tabPane.getComponent(tabIndex);
                TabPaneLayoutData oldLD = (TabPaneLayoutData) component.getLayoutData();
                String title = oldLD == null ? "" : oldLD.getTitle();
                
                TabPaneLayoutData newLD = new TabPaneLayoutData();
                newLD.setTitle(title + "^");
                newLD.setInactiveBackground(StyleUtil.randomBrightColor());
                newLD.setActiveBackground(StyleUtil.randomBrightColor());
                component.setLayoutData(newLD);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONFIGURATIONS, "Minimum Height Normal Border", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                while (tabPane.getComponentCount() < 3) {
                    Component tab = createTestTab();
                    if (tabPane.getComponentCount() % 2 != 0) {
                        TabPaneLayoutData ld = (TabPaneLayoutData) tab.getLayoutData();
                        ld.setIcon(Styles.ICON_24_YES);
                    }
                    tabPane.add(tab);
                }
                tabPane.setBorderType(TabPane.BORDER_TYPE_ADJACENT_TO_TABS);
                tabPane.setTabHeight(new Extent(60));
                tabPane.setTabRolloverEnabled(true);
                tabPane.setTabActiveBackground(Color.RED);
                tabPane.setTabInactiveBackground(Color.YELLOW);
                tabPane.setTabInactiveForeground(Color.BLUE);
                tabPane.setTabRolloverBackground(Color.GREEN);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONFIGURATIONS, "All Graphic Border Test + Icons",
                new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                while (tabPane.getComponentCount() < 3) {
                    Component tab = createTestTab();
                    if (tabPane.getComponentCount() % 2 != 0) {
                        TabPaneLayoutData ld = (TabPaneLayoutData) tab.getLayoutData();
                        ld.setIcon(Styles.ICON_24_YES);
                    }
                    tabPane.add(tab);
                }
                tabPane.setBorderType(TabPane.BORDER_TYPE_ADJACENT_TO_TABS);
                tabPane.setImageBorder(FIB1_SURROUND);
                tabPane.setTabRolloverEnabled(true);
                tabPane.setTabActiveBackground(Color.RED);
                tabPane.setTabActiveBackgroundInsets(new Insets(8, 8, 14, 0));
                tabPane.setTabActiveImageBorder(FIB1_TOP);
                tabPane.setTabInactiveBackground(Color.YELLOW);
                tabPane.setTabInactiveBackgroundInsets(new Insets(8, 8, 14, 0));
                tabPane.setTabInactiveForeground(Color.BLUE);
                tabPane.setTabInactiveImageBorder(FIB1_TOP);
                tabPane.setTabSpacing(new Extent(-25));
                tabPane.setTabRolloverBackground(Color.GREEN);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONFIGURATIONS, "All Graphic Border Test + Icons + Long Labels: 35%", 
                new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                while (tabPane.getComponentCount() < 5) {
                    Component tab = createTestTab();
                    if (tabPane.getComponentCount() % 2 != 0) {
                        TabPaneLayoutData ld = (TabPaneLayoutData) tab.getLayoutData();
                        ld.setTitle(ld.getTitle() + ", this is a really long label that should be cut off by maximum width.");
                    }
                    tabPane.add(tab);
                }
                tabPane.setTabMaximumWidth(new Extent(35, Extent.PERCENT));
                tabPane.setBorderType(TabPane.BORDER_TYPE_ADJACENT_TO_TABS);
                tabPane.setImageBorder(FIB1_SURROUND);
                tabPane.setTabRolloverEnabled(true);
                tabPane.setTabActiveBackground(Color.RED);
                tabPane.setTabActiveImageBorder(FIB1_TOP);
                tabPane.setTabInactiveBackground(Color.YELLOW);
                tabPane.setTabInactiveForeground(Color.BLUE);
                tabPane.setTabInactiveImageBorder(FIB1_TOP);
                tabPane.setTabSpacing(new Extent(-25));
                tabPane.setTabRolloverBackground(Color.GREEN);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONFIGURATIONS, "All Graphic Border Test + Icons + Long Labels: 200px",
                new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                while (tabPane.getComponentCount() < 5) {
                    Component tab = createTestTab();
                    if (tabPane.getComponentCount() % 2 != 0) {
                        TabPaneLayoutData ld = (TabPaneLayoutData) tab.getLayoutData();
                        ld.setTitle(ld.getTitle() + ", this is a really long label that should be cut off by maximum width.");
                    }
                    tabPane.add(tab);
                }
                tabPane.setTabMaximumWidth(new Extent(200));
                tabPane.setBorderType(TabPane.BORDER_TYPE_ADJACENT_TO_TABS);
                tabPane.setImageBorder(FIB1_SURROUND);
                tabPane.setTabRolloverEnabled(true);
                tabPane.setTabActiveBackground(Color.RED);
                tabPane.setTabActiveImageBorder(FIB1_TOP);
                tabPane.setTabInactiveBackground(Color.YELLOW);
                tabPane.setTabInactiveForeground(Color.BLUE);
                tabPane.setTabInactiveImageBorder(FIB1_TOP);
                tabPane.setTabSpacing(new Extent(-25));
                tabPane.setTabRolloverBackground(Color.GREEN);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONFIGURATIONS, "All Graphic Border Test + Icons (No RO)",
                new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                while (tabPane.getComponentCount() < 3) {
                    Component tab = createTestTab();
                    if (tabPane.getComponentCount() % 2 != 0) {
                        TabPaneLayoutData ld = (TabPaneLayoutData) tab.getLayoutData();
                        ld.setIcon(Styles.ICON_24_YES);
                    }
                    tabPane.add(tab);
                }
                tabPane.setBorderType(TabPane.BORDER_TYPE_ADJACENT_TO_TABS);
                tabPane.setImageBorder(FIB1_SURROUND);
                tabPane.setTabRolloverEnabled(false);
                tabPane.setTabActiveBackground(Color.RED);
                tabPane.setTabActiveImageBorder(FIB1_TOP);
                tabPane.setTabInactiveBackground(Color.YELLOW);
                tabPane.setTabInactiveForeground(Color.BLUE);
                tabPane.setTabInactiveImageBorder(FIB1_TOP);
                tabPane.setTabSpacing(new Extent(-25));
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONFIGURATIONS, "All Graphic Border Test", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                while (tabPane.getComponentCount() < 3) {
                    tabPane.add(createTestTab());
                }
                tabPane.setBorderType(TabPane.BORDER_TYPE_ADJACENT_TO_TABS);
                tabPane.setImageBorder(FIB1_SURROUND);
                tabPane.setTabRolloverEnabled(true);
                tabPane.setTabActiveBackground(Color.RED);
                tabPane.setTabActiveImageBorder(FIB1_TOP);
                tabPane.setTabInactiveBackground(Color.YELLOW);
                tabPane.setTabInactiveForeground(Color.BLUE);
                tabPane.setTabInactiveImageBorder(FIB1_TOP);
                tabPane.setTabSpacing(new Extent(-25));
                tabPane.setTabRolloverBackground(Color.GREEN);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_CONFIGURATIONS, "All Graphic Border Test (Surround)", 
                new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                while (tabPane.getComponentCount() < 3) {
                    tabPane.add(createTestTab());
                }
                while (tabPane.getComponentCount() < 5) {
                    TabPaneTest tabPaneTest = new TabPaneTest();
                    TabPaneLayoutData layoutData = new TabPaneLayoutData();
                    layoutData.setTitle("TPT #" + tabNumber++);
                    tabPaneTest.setLayoutData(layoutData);
                    tabPane.add(tabPaneTest);
                }
                tabPane.setBorderType(TabPane.BORDER_TYPE_SURROUND);
                tabPane.setImageBorder(FIB1_SURROUND);
                tabPane.setTabRolloverEnabled(true);
                tabPane.setTabActiveBackground(Color.RED);
                tabPane.setTabActiveImageBorder(FIB1_TOP);
                tabPane.setTabInactiveBackground(Color.YELLOW);
                tabPane.setTabInactiveForeground(Color.BLUE);
                tabPane.setTabInactiveImageBorder(FIB1_TOP);
                tabPane.setTabSpacing(new Extent(-25));
                tabPane.setTabRolloverBackground(Color.GREEN);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONFIGURATIONS, "Basic Rollover Test", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                while (tabPane.getComponentCount() < 3) {
                    tabPane.add(createTestTab());
                }
                tabPane.setTabRolloverEnabled(true);
                tabPane.setTabActiveBackground(Color.RED);
                tabPane.setTabInactiveBackground(Color.YELLOW);
                tabPane.setTabInactiveForeground(Color.BLUE);
                tabPane.setTabRolloverBackground(Color.GREEN);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONFIGURATIONS, "Basic Large Icon Test", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                while (tabPane.getComponentCount() < 3) {
                    Component tab = createTestTab();
                    if (tabPane.getComponentCount() % 2 != 0) {
                        TabPaneLayoutData ld = (TabPaneLayoutData) tab.getLayoutData();
                        ld.setIcon(Styles.ICON_24_YES);
                    }
                    tabPane.add(tab);
                }
                tabPane.setTabRolloverEnabled(true);
                tabPane.setTabActiveBackground(Color.RED);
                tabPane.setTabInactiveBackground(Color.YELLOW);
                tabPane.setTabInactiveForeground(Color.BLUE);
                tabPane.setTabRolloverBackground(Color.GREEN);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONFIGURATIONS, "Basic Rollover Test + tooltips", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                while (tabPane.getComponentCount() < 3) {
                    Component testTab = createTestTab();
                    TabPaneLayoutData ld = (TabPaneLayoutData) testTab.getLayoutData();
                    ld.setToolTipText(ld.getTitle() + ":tip");
                    tabPane.add(testTab);
                }
                tabPane.setTabRolloverEnabled(true);
                tabPane.setTabActiveBackground(Color.RED);
                tabPane.setTabInactiveBackground(Color.YELLOW);
                tabPane.setTabInactiveForeground(Color.BLUE);
                tabPane.setTabRolloverBackground(Color.GREEN);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONFIGURATIONS, "Basic Rollover Test with Rollover Close Icons", 
                new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                while (tabPane.getComponentCount() < 3) {
                    tabPane.add(createTestTab());
                }
                tabPane.setTabRolloverEnabled(true);
                tabPane.setTabActiveBackground(Color.RED);
                tabPane.setTabInactiveBackground(Color.YELLOW);
                tabPane.setTabRolloverBackground(Color.GREEN);
                tabPane.setTabCloseIconRolloverEnabled(true);
                tabPane.setTabCloseEnabled(true);
                tabPane.setTabCloseIcon(CLOSE_ICON_IMAGES[1]);
                tabPane.setTabRolloverCloseIcon(CLOSE_ICON_IMAGES[3]);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONFIGURATIONS, "FIB Sizing Test Top", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                while (tabPane.getComponentCount() < 3) {
                    tabPane.add(createTestTab());
                }
                while(tabPane.getComponentCount() < 5) {
                    tabPane.add(createTestTab(Styles.ICON_24_YES));
                }
                tabPane.setTabRolloverEnabled(true);
                tabPane.setTabActiveImageBorder(new FillImageBorder(new Color(0xff0000), new Insets(2, 2, 2, 0), 
                        new Insets(2, 2, 2, 0)));
                tabPane.setTabInactiveImageBorder(new FillImageBorder(new Color(0xffff00), new Insets(2, 2, 2, 0), 
                        new Insets(2, 2, 2, 0)));
                tabPane.setTabRolloverImageBorder(new FillImageBorder(new Color(0x00ff00), new Insets(2, 2, 2, 0), 
                        new Insets(2, 2, 2, 0)));
                tabPane.setTabActiveBackground(new Color(0x7f0000));
                tabPane.setTabInactiveBackground(new Color(0x7f7f00));
                tabPane.setTabRolloverBackground(new Color(0x007f00));
            }
        });
        
        // Add/Remove Tabs

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add Label (0)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tabPane.add(createTestTab(), 0);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add Label (1)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (tabPane.getComponentCount() < 1) {
                    return;
                }
                tabPane.add(createTestTab(), 1);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add Label (2)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (tabPane.getComponentCount() < 2) {
                    return;
                }
                tabPane.add(createTestTab(), 2);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add Label (End)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tabPane.add(createTestTab());
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Remove Label (0)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (tabPane.getComponentCount() > 0) {
                    tabPane.remove(0);
                }
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Remove Label (1)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (tabPane.getComponentCount() > 1) {
                    tabPane.remove(1);
                }
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Remove Label (2)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (tabPane.getComponentCount() > 2) {
                    tabPane.remove(2);
                }
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Remove Label (End)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (tabPane.getComponentCount() > 0) {
                    tabPane.remove(tabPane.getComponentCount() - 1);
                }
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add Label (No LayoutData)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tabPane.add(new Label("Generic Label"));
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add Label and Select", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Label label = new Label("Tab Pane Child " + tabNumber);
                label.setBackground(StyleUtil.randomBrightColor());
                TabPaneLayoutData layoutData = new TabPaneLayoutData();
                layoutData.setTitle("Label #" + tabNumber);
                label.setLayoutData(layoutData);
                tabPane.add(label);
                ++tabNumber;
                tabPane.setActiveTabIndex(tabPane.visibleIndexOf(label));
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add Label With Tab Icon", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Label label = createTestTab(Styles.ICON_16_TAB_PANE);
                tabPane.add(label);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add Label With Unclosable Tab", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Label label = createTestTab(false);
                tabPane.add(label);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add Big Label", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Label label = createTestTab();
                label.setText(StyleUtil.QUASI_LATIN_TEXT_1);
                tabPane.add(label);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add Label With Long String", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Label label = createTestTab();
                TabPaneLayoutData ld = (TabPaneLayoutData) label.getLayoutData();
                ld.setTitle(ld.getTitle() + ", this is a really long tab title that should be cut off by maximum width.");
                tabPane.add(label);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add-Remove-Add Label", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Label label = createTestTab();
                tabPane.add(label);
                tabPane.remove(label);
                tabPane.add(label);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add Three Labels (Index 0)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                for (int i = 0; i < 3; ++i) {
                    Label label = createTestTab();
                    tabPane.add(label, i);
                }
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add Three Labels (Index 3)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                int startIndex = tabPane.getComponentCount() < 3 ? tabPane.getComponentCount() : 3; 
                for (int i = 0; i < 3; ++i) {
                    Label label = createTestTab();
                    tabPane.add(label, i + startIndex);
                }
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add Three Labels (Append)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                for (int i = 0; i < 3; ++i) {
                    Label label = createTestTab();
                    tabPane.add(label);
                }
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add 1-6 labels randomly", 
                new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                int count = 1 + ((int) (Math.random() * 5));
                for (int i = 0; i < count; ++i) {
                    addLabelRandomly(tabPane);
                }
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Remove 1-6 labels randomly", 
                new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                int count = 1 + ((int) (Math.random() * 5));
                for (int i = 0; i < count; ++i) {
                    removeLabelRandomly(tabPane);
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
                        addLabelRandomly(tabPane);
                    } else {
                        removeLabelRandomly(tabPane);
                    }
                }
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add CalendarSelect", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                CalendarSelect calendarSelect = new CalendarSelect();
                TabPaneLayoutData layoutData = new TabPaneLayoutData();
                layoutData.setTitle("Calendar #" + tabNumber++);
                calendarSelect.setLayoutData(layoutData);
                tabPane.add(calendarSelect);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add MenuBarPaneTest", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                MenuBarPaneTest menuBarPaneTest = new MenuBarPaneTest();
                TabPaneLayoutData layoutData = new TabPaneLayoutData();
                layoutData.setTitle("MBPT #" + tabNumber++);
                menuBarPaneTest.setLayoutData(layoutData);
                tabPane.add(menuBarPaneTest);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add TabPaneTest", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                TabPaneTest tabPaneTest = new TabPaneTest();
                TabPaneLayoutData layoutData = new TabPaneLayoutData();
                layoutData.setTitle("TPT #" + tabNumber++);
                tabPaneTest.setLayoutData(layoutData);
                tabPane.add(tabPaneTest);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add RichTextAreaTest", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                RichTextAreaTest rtaTest = new RichTextAreaTest();
                TabPaneLayoutData layoutData = new TabPaneLayoutData();
                layoutData.setTitle("RTA #" + tabNumber++);
                rtaTest.setLayoutData(layoutData);
                tabPane.add(rtaTest);
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
                buttonColumn.addButton("Add TabPaneTest WindowPane", new ActionListener(){
                
                    public void actionPerformed(ActionEvent e) {
                        WindowPane windowPane = new WindowPane();
                        windowPane.setStyleName("Default");
                        windowPane.setTitle("Test Window");
                        windowPane.add(new TabPaneTest());
                        contentPane.add(windowPane);
                    }
                });
                contentPane.add(buttonColumn);
                TabPaneLayoutData layoutData = new TabPaneLayoutData();
                layoutData.setTitle("ContentPane #" + tabNumber++);
                contentPane.setLayoutData(layoutData);
                tabPane.add(contentPane);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add SplitPane", new ActionListener(){
        
            public void actionPerformed(ActionEvent arg0) {
                SplitPane splitPane = new SplitPane(SplitPane.ORIENTATION_HORIZONTAL_LEFT_RIGHT);
                splitPane.setResizable(true);
                TabPaneLayoutData layoutData = new TabPaneLayoutData();
                layoutData.setTitle("SplitPane #" + tabNumber++);
                splitPane.setLayoutData(layoutData);
                tabPane.add(splitPane);
                
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

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add Label (Color LayoutData)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Component tab = createTestTab();
                TabPaneLayoutData ld = (TabPaneLayoutData) tab.getLayoutData();
                ld.setActiveForeground(StyleUtil.randomColor());
                ld.setActiveBackground(StyleUtil.randomColor());
                ld.setInactiveForeground(StyleUtil.randomColor());
                ld.setInactiveBackground(StyleUtil.randomColor());
                ld.setRolloverForeground(StyleUtil.randomColor());
                ld.setRolloverBackground(StyleUtil.randomColor());
                tabPane.add(tab);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Add Label (FIB LayoutData)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Component tab = createTestTab();
                TabPaneLayoutData ld = (TabPaneLayoutData) tab.getLayoutData();
                ld.setActiveBackground(StyleUtil.randomColor());
                ld.setInactiveBackground(StyleUtil.randomColor());
                ld.setRolloverBackground(StyleUtil.randomColor());
                ld.setActiveImageBorder(FIB1_SURROUND);
                ld.setInactiveImageBorder(FIB1_SURROUND);
                tabPane.add(tab);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Remove Last Tab", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (tabPane.getComponentCount() > 0) {
                    tabPane.remove(tabPane.getComponentCount() - 1);
                }
            }
        });

        // General Properties
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set Tab Position = Top", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tabPane.setTabPosition(TabPane.TAB_POSITION_TOP);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set Tab Position = Bottom", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tabPane.setTabPosition(TabPane.TAB_POSITION_BOTTOM);
            }
        });
        
        addExtentPropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_TAB_ICON_TEXT_MARGIN, EXTENT_VALUES);
        addExtentPropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_TAB_WIDTH, EXTENT_WIDTH_VALUES);
        addExtentPropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_TAB_HEIGHT, EXTENT_VALUES);
        addExtentPropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_TAB_ACTIVE_HEIGHT_INCREASE, EXTENT_VALUES);
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_FOREGROUND);
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_BACKGROUND);
        addFontPropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_FONT);
        addAlignmentPropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_TAB_ALIGNMENT);
        addFillImagePropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_TAB_BACKGROUND_IMAGE, 
                StyleUtil.TEST_FILL_IMAGES);
        addFontPropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_TAB_ACTIVE_FONT);
        addFontPropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_TAB_INACTIVE_FONT);
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set Border Type = None", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tabPane.setBorderType(TabPane.BORDER_TYPE_NONE);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set Border Type = Adjacent", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tabPane.setBorderType(TabPane.BORDER_TYPE_ADJACENT_TO_TABS);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set Border Type = Parallel", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tabPane.setBorderType(TabPane.BORDER_TYPE_PARALLEL_TO_TABS);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set Border Type = Surround", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tabPane.setBorderType(TabPane.BORDER_TYPE_SURROUND);
            }
        });

        
        addBorderPropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_BORDER);
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "imageBorder: (Surround)", 
                new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tabPane.setImageBorder(FIB1_SURROUND);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "imageBorder: (Top)", 
                new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tabPane.setImageBorder(FIB1_TOP);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "imageBorder: (Bottom)", 
                new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tabPane.setImageBorder(FIB1_BOTTOM);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "imageBorder: (Solid)", 
                new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tabPane.setImageBorder(new FillImageBorder(Color.RED, new Insets(4), new Insets(2)));
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Clear imageBorder", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tabPane.setImageBorder(null);
            }
        });
        
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_TAB_ACTIVE_BACKGROUND);
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_TAB_ACTIVE_FOREGROUND);
        addBorderPropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_TAB_ACTIVE_BORDER);
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "tabActiveImageBorder: (Surround)", 
                new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tabPane.setTabActiveImageBorder(FIB1_SURROUND);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "tabActiveImageBorder: (Top)", 
                new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tabPane.setTabActiveImageBorder(FIB1_TOP);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "tabActiveImageBorder: (Bottom)", 
                new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tabPane.setTabActiveImageBorder(FIB1_BOTTOM);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "tabActiveImageBorder: (Solid)", 
                new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tabPane.setTabActiveImageBorder(new FillImageBorder(Color.RED, new Insets(4), new Insets(2)));
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Clear Tab Active Image Border", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tabPane.setTabActiveImageBorder(null);
            }
        });
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_TAB_INACTIVE_BACKGROUND);
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_TAB_INACTIVE_FOREGROUND);
        addBorderPropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_TAB_INACTIVE_BORDER);
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "tabInactiveImageBorder: (Surround)", 
                new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tabPane.setTabInactiveImageBorder(FIB1_SURROUND);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "tabInactiveImageBorder: (Top)", 
                new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tabPane.setTabInactiveImageBorder(FIB1_TOP);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "tabInactiveImageBorder: (Bottom)", 
                new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tabPane.setTabInactiveImageBorder(FIB1_BOTTOM);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "tabInactiveImageBorder: (Solid)", 
                new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tabPane.setTabInactiveImageBorder(new FillImageBorder(Color.RED, new Insets(4), new Insets(2)));
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Clear Tab Inactive Image Border", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tabPane.setTabInactiveImageBorder(null);
            }
        });
        
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_TAB_ROLLOVER_BACKGROUND);
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_TAB_ROLLOVER_FOREGROUND);
        addBorderPropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_TAB_ROLLOVER_BORDER);
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "tabRolloverImageBorder: (Top)", 
                new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tabPane.setTabRolloverImageBorder(FIB1_TOP);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "tabRolloverImageBorder: (Bottom)", 
                new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tabPane.setTabRolloverImageBorder(FIB1_BOTTOM);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "tabRolloverImageBorder: (Solid)", 
                new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tabPane.setTabRolloverImageBorder(new FillImageBorder(Color.RED, new Insets(4), new Insets(2)));
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Clear Tab Rollover Image Border", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tabPane.setTabRolloverImageBorder(null);
            }
        });



        addBooleanPropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_TAB_ROLLOVER_ENABLED);
        
        addImageReferencePropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_TAB_ACTIVE_LEFT_IMAGE, LEFT_IMAGES);
        addImageReferencePropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_TAB_INACTIVE_LEFT_IMAGE, LEFT_IMAGES);
        addImageReferencePropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_TAB_ACTIVE_RIGHT_IMAGE, RIGHT_IMAGES);
        addImageReferencePropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_TAB_INACTIVE_RIGHT_IMAGE, 
                RIGHT_IMAGES);
        
        addFillImagePropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_TAB_ACTIVE_BACKGROUND_IMAGE, 
                StyleUtil.TEST_FILL_IMAGES);
        addFillImagePropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_TAB_INACTIVE_BACKGROUND_IMAGE, 
                StyleUtil.TEST_FILL_IMAGES);
        
        addInsetsPropertyTests(TestControlPane.CATEGORY_PROPERTIES, "insets", new Insets[]{null, new Insets(0), new Insets(1), 
                new Insets(2), new Insets(5), new Insets(10), new Insets(20),
                new Insets(25), new Insets(-1), new Insets(-2), new Insets(-5), new Insets(-10), new Insets(-20), new Insets(-25)});
        addInsetsPropertyTests(TestControlPane.CATEGORY_PROPERTIES, "tabActiveInsets", new Insets[]{null, new Insets(0), 
                new Insets(1), new Insets(2), new Insets(5), new Insets(10), new Insets(20), new Insets(25)});
        addInsetsPropertyTests(TestControlPane.CATEGORY_PROPERTIES, "tabInactiveInsets", new Insets[]{null, new Insets(0), 
                new Insets(1), new Insets(2), new Insets(5), new Insets(10), new Insets(20), new Insets(25)});
        addInsetsPropertyTests(TestControlPane.CATEGORY_PROPERTIES, "defaultContentInsets");
        addExtentPropertyTests(TestControlPane.CATEGORY_PROPERTIES, "tabInset", 
                new Extent[]{null, new Extent(0), new Extent(1), new Extent(2), new Extent(5), new Extent(10), new Extent(20)});
        addExtentPropertyTests(TestControlPane.CATEGORY_PROPERTIES, "tabSpacing", 
                new Extent[]{null, new Extent(0), new Extent(1), new Extent(2), new Extent(5), new Extent(10), new Extent(20),
                new Extent(25), new Extent(-1), new Extent(-2), new Extent(-5), new Extent(-10), new Extent(-20), new Extent(-25)});
        
        addBooleanPropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_TAB_CLOSE_ENABLED);
        addImageReferencePropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_TAB_CLOSE_ICON, CLOSE_ICON_IMAGES);
        addImageReferencePropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_TAB_DISABLED_CLOSE_ICON, 
                CLOSE_ICON_IMAGES);
        addBooleanPropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_TAB_CLOSE_ICON_ROLLOVER_ENABLED);
        addImageReferencePropertyTests(TestControlPane.CATEGORY_PROPERTIES, TabPane.PROPERTY_TAB_ROLLOVER_CLOSE_ICON, 
                CLOSE_ICON_IMAGES);

        // Selection Properties

        for (int i = 0; i < 10; ++i) {
            final int tabIndex = i;
            testControlsPane.addButton(TestControlPane.CATEGORY_SELECTION, "Select TabIndex " + i, new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    tabPane.setActiveTabIndex(tabIndex);
                }
            });
        }
        
        for (int i = 0; i < 10; ++i) {
            final int tabIndex = i;
            testControlsPane.addButton(TestControlPane.CATEGORY_SELECTION, "3Sec Delay: Select TabIndex " + i, 
                    new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    final InteractiveApp app = InteractiveApp.getApp();
                    final TaskQueueHandle tqh = app.createTaskQueue();
                    Thread thread = new Thread() {
                        public void run() {
                            try {
                                Thread.sleep(3000);
                            } catch (InterruptedException ex) {
                            }
                            app.enqueueTask(tqh, new Runnable() {
                            
                                public void run() {
                                    tabPane.setActiveTabIndex(tabIndex);
                                    app.removeTaskQueue(tqh);
                                }
                            });
                        }
                    };
                    thread.start();
                }
            });
        }
        
        // Listener Tests
        
        testControlsPane.addButton(TestControlPane.CATEGORY_LISTENERS, "Add TabSelectionListener", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                tabPane.addTabSelectionListener(new TabSelectionListener(){
                    public void tabSelected(TabSelectionEvent e) {
                        InteractiveApp.getApp().consoleWrite("Tab selection event received: " + e.toString());
                    }
                });
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_LISTENERS, "Add TabCloseListener", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                tabPane.addTabClosingListener(new TabClosingListener(){
                    public void tabClosing(TabClosingEvent e) {
                        InteractiveApp.getApp().consoleWrite("Tab closing event received: " + e.toString());
                    }
                });
            }
        });
        
        addStandardIntegrationTests();
    }
    
    private void addLabelRandomly(TabPane tabPane) {
        Label label = createTestTab();
        int position = ((int) (Math.random() * (tabPane.getComponentCount() + 1)));
        tabPane.add(label, position);
        ++tabNumber;
    }
    
    private Label createTestTab() {
        return createTestTab(true);
    }
    
    private Label createTestTab(boolean closeEnabled) {
        return createTestTab(closeEnabled, null);
    }
    
    private Label createTestTab(ImageReference icon) {
        return createTestTab(true, icon);
    }
    
    private Label createTestTab(boolean closeEnabled, ImageReference icon) {
        Label label = new Label("Tab Pane Child " + tabNumber);
        label.setBackground(StyleUtil.randomBrightColor());
        TabPaneLayoutData layoutData = new TabPaneLayoutData();
        layoutData.setCloseEnabled(closeEnabled);
        layoutData.setIcon(icon);
        layoutData.setTitle("Label #" + tabNumber);
        label.setLayoutData(layoutData);
        ++tabNumber;
        return label;
    }

    private void removeLabelRandomly(TabPane tabPane) {
        if (tabPane.getComponentCount() == 0) {
            return;
        }
        int position = ((int) (Math.random() * (tabPane.getComponentCount())));
        tabPane.remove(position);
    }
}
