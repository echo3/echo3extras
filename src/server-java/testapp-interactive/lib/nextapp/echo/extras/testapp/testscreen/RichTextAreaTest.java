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

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import nextapp.echo.app.Button;
import nextapp.echo.app.Column;
import nextapp.echo.app.Component;
import nextapp.echo.app.ContentPane;
import nextapp.echo.app.Extent;
import nextapp.echo.app.ResourceImageReference;
import nextapp.echo.app.WindowPane;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.extras.app.RichTextArea;
import nextapp.echo.extras.app.TabPane;
import nextapp.echo.extras.app.event.RichTextOperationEvent;
import nextapp.echo.extras.app.event.RichTextOperationListener;
import nextapp.echo.extras.app.richtext.InsertHtmlCommand;
import nextapp.echo.extras.testapp.AbstractTest;
import nextapp.echo.extras.testapp.InteractiveApp;
import nextapp.echo.extras.testapp.Styles;
import nextapp.echo.extras.testapp.TestControlPane;

/**
 * Interactive test module for <code>RichTextArea</code>s.
 */
public class RichTextAreaTest extends AbstractTest {
    
    private static String globalClipboardText;
    
    private ContentPane mainContent;
    private RichTextArea richTextArea;
    
    private RichTextOperationListener operationListener = new RichTextOperationListener() {
        
        public void operationPerformed(RichTextOperationEvent e) {
            if (RichTextArea.OPERATION_INSERT_HYPERLINK.equals(e.getOperationId())) {
                getApplicationInstance().enqueueCommand(new InsertHtmlCommand((Component) e.getSource(), 
                        "<a href=\"http://www.nextapp.com\">www.nextapp.com</a>"));
            } else if (RichTextArea.OPERATION_INSERT_IMAGE.equals(e.getOperationId())) {
                getApplicationInstance().enqueueCommand(new InsertHtmlCommand((Component) e.getSource(), 
                        "<img src=\"http://www.nextapp.com/home/images/logo.png\"/>"));
            } else if (RichTextArea.OPERATION_INSERT_TABLE.equals(e.getOperationId())) {
                getApplicationInstance().enqueueCommand(new InsertHtmlCommand((Component) e.getSource(), 
                        "<table border=\"1\"><tbody><tr><td>Alpha</td><td>Bravo</td></tr></tbody></table>"));
            } 
        }
    };  

    public RichTextAreaTest() {
        super("RichTextArea", Styles.ICON_16_RICH_TEXT_AREA);
        
        mainContent = new ContentPane();
        add(mainContent);

        richTextArea = createStyledRTA();
        mainContent.add(richTextArea);
        
        InteractiveApp.getApp().setFocusedComponent(richTextArea);
        
        setTestComponent(mainContent, richTextArea);
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Display Text", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                InteractiveApp.getApp().consoleWrite("RichTextArea text: \"" + richTextArea.getText() + "\"");
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Store Text to Global Clipboard", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                globalClipboardText = richTextArea.getText();
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Load Text from Global Clipboard", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                richTextArea.setText(globalClipboardText);
            }
        });
        
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, "foreground");
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, "background");
        addFillImagePropertyTests(TestControlPane.CATEGORY_PROPERTIES, "backgroundImage", Styles.TEST_FILL_IMAGES);        
        addBorderPropertyTests(TestControlPane.CATEGORY_PROPERTIES, RichTextArea.PROPERTY_BORDER);

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Text: null", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                richTextArea.setText(null);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Text: This is plaintext.", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                richTextArea.setText("This is plaintext.");
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Text: This is <b>bold</b>.", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                richTextArea.setText("This is <b>bold</b>.");
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Text: This is <b>underline</b>.", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                richTextArea.setText("This is <u>underline</u>.");
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Icon Set: Default", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                richTextArea.setIcons(null);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Icon Set: Test (Weird)", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                Map icons = new HashMap();
                icons.put(RichTextArea.ICON_FOREGROUND,
                        new ResourceImageReference("nextapp/echo/extras/webcontainer/resource/image/richtext/Icon24Ok.png"));
                richTextArea.setIcons(icons);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Feature Set: Default", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                richTextArea.setFeatures(null);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Feature Set: B/I/U Only", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Map features = new HashMap();
                features.put(RichTextArea.FEATURE_TOOLBAR, Boolean.TRUE);
                features.put(RichTextArea.FEATURE_BOLD, Boolean.TRUE);
                features.put(RichTextArea.FEATURE_ITALIC, Boolean.TRUE);
                features.put(RichTextArea.FEATURE_UNDERLINE, Boolean.TRUE);
                richTextArea.setFeatures(features);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Feature Set: Menu/Toolbar Only", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Map features = new HashMap();
                features.put(RichTextArea.FEATURE_MENU, Boolean.TRUE);
                features.put(RichTextArea.FEATURE_TOOLBAR, Boolean.TRUE);
                richTextArea.setFeatures(features);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Feature Set: Empty", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Map features = new HashMap();
                richTextArea.setFeatures(features);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Add Override: Insert Hyperlink", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                richTextArea.setOverrideInsertHyperlink(true);
                if (!richTextArea.hasOperationListeners()) {
                    richTextArea.addOperationListener(operationListener);
                }
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Add Override: Insert Image", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                richTextArea.setOverrideInsertImage(true);
                if (!richTextArea.hasOperationListeners()) {
                    richTextArea.addOperationListener(operationListener);
                }
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Add Override: Insert Table", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                richTextArea.setOverrideInsertTable(true);
                if (!richTextArea.hasOperationListeners()) {
                    richTextArea.addOperationListener(operationListener);
                }
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Remove Override: Insert Hyperlink", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                richTextArea.setOverrideInsertHyperlink(false);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Remove Override: Insert Image", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                richTextArea.setOverrideInsertImage(false);
            }
        });

        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Remove Override: Insert Table", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                richTextArea.setOverrideInsertTable(false);
            }
        });
        
        // Command Tests
        
        testControlsPane.addButton(TestControlPane.CATEGORY_COMMANDS, "Insert 'hello'", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                getApplicationInstance().enqueueCommand(new InsertHtmlCommand(richTextArea, "hello"));
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_COMMANDS, "Insert <hr>", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                getApplicationInstance().enqueueCommand(new InsertHtmlCommand(richTextArea, "<hr>"));
            }
        });
        
        // Listener Tests
        
        testControlsPane.addButton(TestControlPane.CATEGORY_LISTENERS, "Add ActionListener", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                richTextArea.addActionListener(new ActionListener() {
                    public void actionPerformed(ActionEvent e) {
                        InteractiveApp.getApp().consoleWrite("Action event received: " + e.toString());
                    }
                });
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_LISTENERS, "Add OperationListener", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                richTextArea.addOperationListener(operationListener);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_LISTENERS, "Remove OperationListener", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                richTextArea.removeOperationListener(operationListener);
            }
        });
        
        addStandardIntegrationTests();
        testControlsPane.addButton(TestControlPane.CATEGORY_INTEGRATION, "Render in ContentPane", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                mainContent.removeAll();
                mainContent.add(richTextArea);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_INTEGRATION, "Render in Column", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                mainContent.removeAll();
                Column column = new Column();
                mainContent.add(column);
                
                Button button1 = new Button("Test");
                button1.setStyleName("Default");
                button1.addActionListener(new ActionListener(){
                    public void actionPerformed(ActionEvent e) {
                        InteractiveApp.getApp().consoleWrite("Button1 Clicked.");
                    }
                });
                column.add(button1);
                
                column.add(richTextArea);
                
                Button button2 = new Button("Test");
                button2.setStyleName("Default");
                button2.addActionListener(new ActionListener(){
                    public void actionPerformed(ActionEvent e) {
                        InteractiveApp.getApp().consoleWrite("Button2 Clicked.");
                    }
                });
                column.add(button2);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_INTEGRATION, "Render in TabPane", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                mainContent.removeAll();
                TabPane tabPane = new TabPane();
                mainContent.add(tabPane);
                
                Button button1 = new Button("Test");
                button1.setStyleName("Default");
                button1.addActionListener(new ActionListener(){
                    public void actionPerformed(ActionEvent e) {
                        InteractiveApp.getApp().consoleWrite("Button1 Clicked.");
                    }
                });
                tabPane.add(button1);
                
                tabPane.add(richTextArea);
                
                Button button2 = new Button("Test");
                button2.setStyleName("Default");
                button2.addActionListener(new ActionListener(){
                    public void actionPerformed(ActionEvent e) {
                        InteractiveApp.getApp().consoleWrite("Button2 Clicked.");
                    }
                });
                tabPane.add(button2);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_INTEGRATION, "Add RTA WidndowPane", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                WindowPane windowPane = new WindowPane("Rich Text Area", new Extent(600), new Extent(600));
                windowPane.setStyleName("Default");
                windowPane.add(createStyledRTA());
                InteractiveApp.getApp().getDefaultWindow().getContent().add(windowPane);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_INTEGRATION, "Add Modal RTA WidndowPane", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                WindowPane windowPane = new WindowPane("Modal Rich Text Area", new Extent(600), new Extent(600));
                windowPane.setModal(true);
                windowPane.setStyleName("Default");
                windowPane.add(createStyledRTA());
                InteractiveApp.getApp().getDefaultWindow().getContent().add(windowPane);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set Locale Null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                richTextArea.setLocale(null);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set Locale English", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                richTextArea.setLocale(Locale.ENGLISH);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set Locale German", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                richTextArea.setLocale(Locale.GERMAN);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set Locale Germany", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                richTextArea.setLocale(Locale.GERMANY);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set Style Name = Default", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                richTextArea.setStyleName("Default");   
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set Style Name Null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                richTextArea.setStyleName(null);   
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set toolbarButtonStyleName = Default", 
                new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                richTextArea.setToolbarButtonStyleName("RichTextArea.ToolbarButton");   
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set toolbarButtonStyleName Null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                richTextArea.setToolbarButtonStyleName(null);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set toolbarPanelStyleName = Default", 
                new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                richTextArea.setToolbarPanelStyleName("RichTextArea.ToolbarPanel");   
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set toolbarPanelStyleName Null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                richTextArea.setToolbarPanelStyleName(null);
            }
        });
    }

    private RichTextArea createStyledRTA() {
        RichTextArea rta = new RichTextArea();
        rta.setStyleName("Default");
        return rta;
    }
}
