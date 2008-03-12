/* 
 * This file is part of the Echo Extras Project.
 * Copyright (C) 2005-2008 NextApp, Inc.
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

import nextapp.echo.app.Button;
import nextapp.echo.app.Column;
import nextapp.echo.app.ContentPane;
import nextapp.echo.app.ResourceImageReference;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.extras.app.DefaultIconSet;
import nextapp.echo.extras.app.RichTextArea;
import nextapp.echo.extras.testapp.AbstractTest;
import nextapp.echo.extras.testapp.InteractiveApp;
import nextapp.echo.extras.testapp.Styles;
import nextapp.echo.extras.testapp.TestControlPane;

/**
 * Interactive test module for <code>RichTextArea</code>s.
 */
public class RichTextAreaTest extends AbstractTest {
    
    private ContentPane mainContent;
    private RichTextArea richTextArea;

    public RichTextAreaTest() {
        super("RichTextArea", Styles.ICON_16_RICH_TEXT_AREA);
        
        mainContent = new ContentPane();
        add(mainContent);

        richTextArea = new RichTextArea();
        richTextArea.setMenuStyleName("Default");
        richTextArea.setToolbarButtonStyleName("RichTextAreaToolbarButton");
        richTextArea.setWindowPaneStyleName("Default");
        richTextArea.setControlPaneSplitPaneStyleName("ControlPane.Container.Bottom");
        richTextArea.setControlPaneRowStyleName("ControlPane");
        richTextArea.setControlPaneButtonStyleName("ControlPane.Button");
        mainContent.add(richTextArea);
        
        setTestComponent(this, richTextArea);
        
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, "foreground");
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, "background");
        
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
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Display Text", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                InteractiveApp.getApp().consoleWrite("RichTextArea text: \"" + richTextArea.getText() + "\"");
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Icon Set: Default", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                richTextArea.setIcons(null);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Icon Set: Custom 1", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                DefaultIconSet icons = new DefaultIconSet();
                icons.addIcon(RichTextArea.ICON_FOREGROUND,
                        new ResourceImageReference("/nextapp/echo/extras/webcontainer/resource/image/richtext/Foreground.gif"));  
                icons.addIcon(RichTextArea.ICON_BACKGROUND,
                        new ResourceImageReference("/nextapp/echo/extras/webcontainer/resource/image/richtext/Background.gif"));  
                icons.addIcon(RichTextArea.ICON_BOLD,
                        new ResourceImageReference("/nextapp/echo/extras/webcontainer/resource/image/richtext/Bold.gif"));  
                icons.addIcon(RichTextArea.ICON_ITALIC,
                        new ResourceImageReference("/nextapp/echo/extras/webcontainer/resource/image/richtext/Italic.gif"));  
                icons.addIcon(RichTextArea.ICON_UNDERLINE,
                        new ResourceImageReference("/nextapp/echo/extras/webcontainer/resource/image/richtext/Underline.gif"));  
                icons.addIcon(RichTextArea.ICON_UNDO,
                        new ResourceImageReference("/nextapp/echo/extras/webcontainer/resource/image/richtext/Undo.gif"));  
                icons.addIcon(RichTextArea.ICON_REDO,
                        new ResourceImageReference("/nextapp/echo/extras/webcontainer/resource/image/richtext/Redo.gif"));  
                icons.addIcon(RichTextArea.ICON_INDENT,
                        new ResourceImageReference("/nextapp/echo/extras/webcontainer/resource/image/richtext/Indent.gif"));  
                icons.addIcon(RichTextArea.ICON_OUTDENT,
                        new ResourceImageReference("/nextapp/echo/extras/webcontainer/resource/image/richtext/Outdent.gif"));  
                icons.addIcon(RichTextArea.ICON_CUT,
                        new ResourceImageReference("/nextapp/echo/extras/webcontainer/resource/image/richtext/Cut.gif"));  
                icons.addIcon(RichTextArea.ICON_COPY,
                        new ResourceImageReference("/nextapp/echo/extras/webcontainer/resource/image/richtext/Copy.gif"));  
                icons.addIcon(RichTextArea.ICON_PASTE,
                        new ResourceImageReference("/nextapp/echo/extras/webcontainer/resource/image/richtext/Paste.gif"));  
                icons.addIcon(RichTextArea.ICON_BULLETED_LIST,
                        new ResourceImageReference("/nextapp/echo/extras/webcontainer/resource/image/richtext/BulletedList.gif"));  
                icons.addIcon(RichTextArea.ICON_NUMBERED_LIST,
                        new ResourceImageReference("/nextapp/echo/extras/webcontainer/resource/image/richtext/NumberedList.gif"));  
                icons.addIcon(RichTextArea.ICON_TABLE,
                        new ResourceImageReference("/nextapp/echo/extras/webcontainer/resource/image/richtext/Table.gif"));  
                icons.addIcon(RichTextArea.ICON_IMAGE,
                        new ResourceImageReference("/nextapp/echo/extras/webcontainer/resource/image/richtext/Image.gif"));  
                icons.addIcon(RichTextArea.ICON_HORIZONTAL_RULE,
                        new ResourceImageReference("/nextapp/echo/extras/webcontainer/resource/image/richtext/HorizontalRule.gif"));  
                icons.addIcon(RichTextArea.ICON_HYPERLINK,
                        new ResourceImageReference("/nextapp/echo/extras/webcontainer/resource/image/richtext/Hyperlink.gif"));  
                icons.addIcon(RichTextArea.ICON_SUBSCRIPT,
                        new ResourceImageReference("/nextapp/echo/extras/webcontainer/resource/image/richtext/Subscript.gif"));  
                icons.addIcon(RichTextArea.ICON_SUPERSCRIPT,
                        new ResourceImageReference("/nextapp/echo/extras/webcontainer/resource/image/richtext/Superscript.gif"));  
                icons.addIcon(RichTextArea.ICON_ALIGNMENT_LEFT,
                        new ResourceImageReference("/nextapp/echo/extras/webcontainer/resource/image/richtext/AlignLeft.gif"));  
                icons.addIcon(RichTextArea.ICON_ALIGNMENT_CENTER,
                        new ResourceImageReference("/nextapp/echo/extras/webcontainer/resource/image/richtext/AlignCenter.gif"));  
                icons.addIcon(RichTextArea.ICON_ALIGNMENT_RIGHT,
                        new ResourceImageReference("/nextapp/echo/extras/webcontainer/resource/image/richtext/AlignRight.gif"));  
                icons.addIcon(RichTextArea.ICON_ALIGNMENT_JUSTIFY,
                        new ResourceImageReference("/nextapp/echo/extras/webcontainer/resource/image/richtext/AlignJustify.gif"));  
                richTextArea.setIcons(icons);
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
    }
}
