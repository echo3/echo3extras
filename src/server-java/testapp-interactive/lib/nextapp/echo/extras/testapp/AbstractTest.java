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

package nextapp.echo.extras.testapp;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Locale;

import nextapp.echo.app.Alignment;
import nextapp.echo.app.Border;
import nextapp.echo.app.Button;
import nextapp.echo.app.Color;
import nextapp.echo.app.Component;
import nextapp.echo.app.Extent;
import nextapp.echo.app.FillImage;
import nextapp.echo.app.Font;
import nextapp.echo.app.ImageReference;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.LayoutDirection;
import nextapp.echo.app.Row;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.serial.SerialException;
import nextapp.echo.app.serial.property.InsetsPeer;
import nextapp.echo.extras.app.DropDownMenu;
import nextapp.echo.extras.app.menu.DefaultMenuModel;
import nextapp.echo.extras.app.menu.DefaultMenuSelectionModel;
import nextapp.echo.extras.app.menu.DefaultOptionModel;
import nextapp.echo.extras.app.menu.MenuSelectionModel;

public class AbstractTest extends SplitPane {

    private Component testComponentParent;
    private Component testComponent;
    protected TestControlPane testControlsPane;
    
    public AbstractTest(String testName) {
        this(testName, null);
    }
    
    public AbstractTest(String testName, ImageReference icon) {
        super(SplitPane.ORIENTATION_HORIZONTAL, new Extent(300, Extent.PX));
        setStyleName("DefaultResizable");
        
        testControlsPane = new TestControlPane(testName, icon);
        add(testControlsPane);
    }
    
    protected void setTestComponent(Component testComponentParent, Component testComponent) {
        this.testComponentParent = testComponentParent;
        this.testComponent = testComponent;
    }

    protected void addBooleanPropertyTests(String category, final String propertyName) {
        addBooleanPropertyTests(category, propertyName, false);
    }
    
    protected void addBooleanPropertyTests(String category, final String propertyName, boolean initialState) {
        Row row = new Row();
        row.setStyleName("TestControlGroupRow");
        row.setCellSpacing(new Extent(5));
        testControlsPane.addControl(category, row);

        Label label = new Label(propertyName);
        row.add(label);
        
        DefaultMenuModel booleanModel = new DefaultMenuModel();
        booleanModel.addItem(new DefaultOptionModel("true", "True", null));
        booleanModel.addItem(new DefaultOptionModel("false", "False", null));

        final MenuSelectionModel selectionModel = new DefaultMenuSelectionModel();
        selectionModel.setSelectedId(initialState ? "true" : "false");
        
        DropDownMenu menu = new DropDownMenu(booleanModel, selectionModel);
        menu.setWidth(new Extent(100));
        menu.addActionListener(new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                boolean value = "true".equals(selectionModel.getSelectedId());
                setTestComponentProperty(propertyName, boolean.class, Boolean.valueOf(value));
            }
        });
        row.add(menu);
        
        testControlsPane.addControl(category, row);
    }
    
    protected void addBorderPropertyTests(String category, final String propertyName) {
        Button button;
        Row row = new Row();
        row.setStyleName("TestControlGroupRow");
        testControlsPane.addControl(category, row);
        
        Label label = new Label(propertyName);
        label.setStyleName("TestControlGroupLabel");
        row.add(label);
        
        button = new Button("Rand");
        button.setStyleName("TestControlButtonSmall");
        button.addActionListener(new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                setTestComponentProperty(propertyName, Border.class, StyleUtil.randomBorder());
            }
        });
        row.add(button);
        
        button = new Button("Color");
        button.setStyleName("TestControlButtonSmall");
        button.addActionListener(new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                Border border = (Border) getTestComponentProperty(propertyName);
                if (border == null) {
                    border = new Border(new Extent(1), Color.BLUE, Border.STYLE_SOLID);
                }
                setTestComponentProperty(propertyName, Border.class, 
                        new Border(border.getSize(), StyleUtil.randomColor(), border.getStyle()));
            }
        });
        row.add(button);
        
        button = new Button("Style");
        button.setStyleName("TestControlButtonSmall");
        button.addActionListener(new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                setTestComponentProperty(propertyName, Border.class, 
                        StyleUtil.nextBorderStyle((Border) getTestComponentProperty(propertyName)));
            }
        });
        row.add(button);
        
        button = new Button("Size");
        button.setStyleName("TestControlButtonSmall");
        button.addActionListener(new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                setTestComponentProperty(propertyName, Border.class, 
                        StyleUtil.nextBorderSize((Border) getTestComponentProperty(propertyName)));
            }
        });
        row.add(button);
        
        button = new Button("Mult");
        button.setStyleName("TestControlButtonSmall");
        button.addActionListener(new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                setTestComponentProperty(propertyName, Border.class, 
                        new Border(new Border.Side[] { 
                                new Border.Side(1, Color.RED, Border.STYLE_DASHED),
                                new Border.Side(2, Color.YELLOW, Border.STYLE_SOLID),
                                new Border.Side(3, Color.GREEN, Border.STYLE_SOLID),
                                new Border.Side(4, Color.BLUE, Border.STYLE_DOTTED)}));
            }
        });
        row.add(button);
        
        button = new Button("Null");
        button.setStyleName("TestControlButtonSmall");
        button.addActionListener(new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                setTestComponentProperty(propertyName, Border.class, null);
            }
        });
        row.add(button);
    }
    
    protected void addFillImagePropertyTests(String category, final String propertyName, final FillImage[] fillImageValues) {
        for (int i = 0; i < fillImageValues.length; ++i) {
            final int index = i;
            String name = fillImageValues[i] == null ? "null" : Integer.toString(i);
            testControlsPane.addButton(category, propertyName + ": " + name, new ActionListener(){
                public void actionPerformed(ActionEvent e) {
                    setTestComponentProperty(propertyName, FillImage.class, fillImageValues[index]);
                }
            });
        }
    }
    
    protected void addAlignmentPropertyTests(String category, final String propertyName) {
        testControlsPane.addButton(category, propertyName + ": Randomize", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                setTestComponentProperty(propertyName, Alignment.class, StyleUtil.randomAlignmentHV());
            }
        });
    }

    protected void addImageReferencePropertyTests(String category, final String propertyName, 
            final ImageReference[] imageReferenceValues) {
        for (int i = 0; i < imageReferenceValues.length; ++i) {
            final int index = i;
            String name = imageReferenceValues[i] == null ? "null" : Integer.toString(i);
            testControlsPane.addButton(category, propertyName + ": " + name, new ActionListener(){
                public void actionPerformed(ActionEvent e) {
                    setTestComponentProperty(propertyName, ImageReference.class, imageReferenceValues[index]);
                }
            });
        }
    }
    
    protected void addExtentPropertyTests(String category, final String propertyName, final Extent[] extentValues) {
        Row row = new Row();
        row.setStyleName("TestControlGroupRow");
        testControlsPane.addControl(category, row);

        Label label = new Label(propertyName);
        label.setStyleName("TestControlGroupLabel");
        row.add(label);
        
        DefaultMenuModel model = new DefaultMenuModel();
        for (int i = 0; i < extentValues.length; ++i) {
            String extentString = extentValues[i] == null ? "null" : extentValues[i].toString();
            model.addItem(new DefaultOptionModel(Integer.toString(i), extentString, null));
        }

        final MenuSelectionModel selectionModel = new DefaultMenuSelectionModel();
        
        DropDownMenu menu = new DropDownMenu(model, selectionModel);
        menu.setWidth(new Extent(100));
        menu.addActionListener(new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                int selectedIndex = Integer.parseInt(selectionModel.getSelectedId());
                setTestComponentProperty(propertyName, Extent.class, extentValues[selectedIndex]);
            }
        });
        row.add(menu);
    }
    
    protected void addColorPropertyTests(String category, final String propertyName) {
        testControlsPane.addButton(category, propertyName + ": Randomize", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                setTestComponentProperty(propertyName, Color.class, StyleUtil.randomColor());
            }
        });
        testControlsPane.addButton(category, propertyName + ": null", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                setTestComponentProperty(propertyName, Color.class, null);
            }
        });
    }
    
    protected void addFontPropertyTests(String category, final String propertyName) {
        testControlsPane.addButton(category, propertyName + ": Randomize", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                setTestComponentProperty(propertyName, Font.class, StyleUtil.randomFont());
            }
        });
        testControlsPane.addButton(category, propertyName + ": null", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                setTestComponentProperty(propertyName, Font.class, null);
            }
        });
    }
    
    protected void addIntegerPropertyTests(String category, final String propertyName, final int[] values) {
        for (int i = 0; i < values.length; ++i) {
            final int value = values[i];
            testControlsPane.addButton(category, propertyName + ": " + values[i], new ActionListener(){
                public void actionPerformed(ActionEvent e) {
                    setTestComponentProperty(propertyName, int.class, new Integer(value));
                }
            });
        }
    }
    
    protected void addInsetsPropertyTests(String category, final String propertyName) {
        
        testControlsPane.addButton(category, propertyName + ": 0px", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                setTestComponentProperty(propertyName, Insets.class, new Insets(0));
            }
        });
        testControlsPane.addButton(category, propertyName + ": 1px", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                setTestComponentProperty(propertyName, Insets.class, new Insets(1));
            }
        });
        testControlsPane.addButton(category, propertyName + ": 2px", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                setTestComponentProperty(propertyName, Insets.class, new Insets(2));
            }
        });
        testControlsPane.addButton(category, propertyName + ": 5px", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                setTestComponentProperty(propertyName, Insets.class, new Insets(5));
            }
        });
        testControlsPane.addButton(category, propertyName + ": 10/20/30/40px", 
                new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                setTestComponentProperty(propertyName, Insets.class, new Insets(10, 20, 30, 40));
            }
        });
        testControlsPane.addButton(category, propertyName + ": null", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                setTestComponentProperty(propertyName, Insets.class, null);
            }
        });
    }

    protected void addInsetsPropertyTests(String category, final String propertyName, Insets[] insets) {
        for (int i = 0; i < insets.length; ++i) {
            try {
                final Insets testInsets = insets[i];
                testControlsPane.addButton(category, propertyName + ": " + 
                        (testInsets == null ? "null" : InsetsPeer.toString(testInsets)), new ActionListener(){
                    public void actionPerformed(ActionEvent e) {
                        setTestComponentProperty(propertyName, Insets.class, testInsets);
                    }
                });
            } catch (SerialException ex) {
                throw new IllegalArgumentException("Illegal insets: " + insets[i]);
            }
        }
    }
    
    protected void addStandardIntegrationTests() {

        testControlsPane.addButton(TestControlPane.CATEGORY_INTEGRATION, "Add Component", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (testComponentParent.indexOf(testComponent) == -1) {
                    testComponentParent.add(testComponent);
                }
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_INTEGRATION, "Remove Component", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testComponentParent.remove(testComponent);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_INTEGRATION, "Enable Component", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testComponent.setEnabled(true);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_INTEGRATION, "Disable Component", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testComponent.setEnabled(false);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_INTEGRATION, "Set Locale Null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testComponent.setEnabled(true);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_INTEGRATION, "Set Locale ENGLISH (LTR)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testComponent.setLocale(Locale.ENGLISH);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_INTEGRATION, "Set Locale GERMANY (LTR)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testComponent.setLocale(Locale.GERMANY);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_INTEGRATION, "Set Locale ARABIC (RTL)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testComponent.setLocale(new Locale("ar"));
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_INTEGRATION, "Set Layout Direction Null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testComponent.setLayoutDirection(null);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_INTEGRATION, "Set Layout Direction LTR", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testComponent.setLayoutDirection(LayoutDirection.LTR);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_INTEGRATION, "Set Layout Direction RTL", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testComponent.setLayoutDirection(LayoutDirection.RTL);
            }
        });
    }
    
    private Object getTestComponentProperty(String propertyName) {
        try {
            String methodName = "get" + Character.toUpperCase(propertyName.charAt(0)) +  propertyName.substring(1);
            Method setPropertyMethod = testComponent.getClass().getMethod(methodName, new Class[]{});
            return setPropertyMethod.invoke(testComponent, new Object[]{});
        } catch (NoSuchMethodException ex) {
            InteractiveApp.getApp().consoleWrite(ex.toString());
        } catch (IllegalArgumentException ex) {
            InteractiveApp.getApp().consoleWrite(ex.toString());
        } catch (IllegalAccessException ex) {
            InteractiveApp.getApp().consoleWrite(ex.toString());
        } catch (InvocationTargetException ex) {
            InteractiveApp.getApp().consoleWrite(ex.toString());
        }
        return null;
    }
    
    private void setTestComponentProperty(String propertyName, Class propertyClass, Object newValue) {
        try {
            String methodName = "set" + Character.toUpperCase(propertyName.charAt(0)) +  propertyName.substring(1);
            Method setPropertyMethod = testComponent.getClass().getMethod(methodName, new Class[]{propertyClass});
            setPropertyMethod.invoke(testComponent, new Object[]{newValue});
        } catch (NoSuchMethodException ex) {
            InteractiveApp.getApp().consoleWrite(ex.toString());
        } catch (IllegalArgumentException ex) {
            InteractiveApp.getApp().consoleWrite(ex.toString());
        } catch (IllegalAccessException ex) {
            InteractiveApp.getApp().consoleWrite(ex.toString());
        } catch (InvocationTargetException ex) {
            InteractiveApp.getApp().consoleWrite(ex.toString());
        }
    }
}
