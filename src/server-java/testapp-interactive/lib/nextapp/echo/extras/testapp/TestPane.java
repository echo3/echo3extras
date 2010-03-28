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

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.util.Locale;

import nextapp.echo.app.Component;
import nextapp.echo.app.ContentPane;
import nextapp.echo.app.FillImage;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.WindowPane;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.extras.app.MenuBarPane;
import nextapp.echo.extras.app.menu.AbstractMenuStateModel;
import nextapp.echo.extras.app.menu.DefaultMenuModel;
import nextapp.echo.extras.app.menu.DefaultOptionModel;
import nextapp.echo.extras.app.menu.DefaultRadioOptionModel;
import nextapp.echo.extras.app.menu.DefaultToggleOptionModel;
import nextapp.echo.extras.app.menu.MenuStateModel;
import nextapp.echo.extras.app.menu.SeparatorModel;

/**
 * Main InteractiveTest <code>ContentPane</code> which displays a menu of
 * available tests.
 */
public class TestPane extends ContentPane {

    private ActionListener commandActionListener = new ActionListener() {
    
        /**
         * @see nextapp.echo.app.event.ActionListener#actionPerformed(nextapp.echo.app.event.ActionEvent)
         */
        public void actionPerformed(ActionEvent e) {
            if (e.getActionCommand() == null) {
                InteractiveApp.getApp().displayWelcomePane();
            } else if (e.getActionCommand().startsWith("Launch_")) {
                String testName = e.getActionCommand().substring("Launch ".length());
                startTest(testName);
            } else if (e.getActionCommand().equals("OpenModalDialog")) {
                WindowPane modalWindow = new WindowPane();
                modalWindow.setStyleName("Default");
                modalWindow.setInsets(new Insets(10, 5));
                modalWindow.setTitle("Blocking Modal WindowPane");
                modalWindow.setModal(true);
                modalWindow
                        .add(new Label(
                                "Verify this modal WindowPane blocks input to all components."));
                InteractiveApp.getApp().getDefaultWindow().getContent().add(
                        modalWindow);
            } else if (e.getActionCommand().equals("OpenConsole")) {
                InteractiveApp.getApp().consoleWrite(null);
            } else if (e.getActionCommand().equals("Serialize")) {
                doSerialTest();
            } else if (e.getActionCommand().startsWith("Locale_")) {
                String language = e.getActionCommand().substring(
                        "Locale_".length());
                if ("Default".equals(language)) {
                    InteractiveApp.getApp().setLocale(Locale.getDefault());
                } else {
                    InteractiveApp.getApp().setLocale(new Locale(language));
                }
            } else if (e.getActionCommand().equals("Reset")) {
                InteractiveApp.getApp().displayTestPane();
            } else if (e.getActionCommand().equals("Exit")) {
                InteractiveApp.getApp().displayWelcomePane();
            }
        }
    };
    
    private SplitPane menuVerticalPane;
    private BlinkComponent blinkContainer;
    private String activeTestName;
    
    public TestPane(String testName) {
        super();
    
        setBackgroundImage(Styles.FILL_IMAGE_EXTRAS_BACKGROUND);
    
        DefaultMenuModel menuBarMenu = new DefaultMenuModel();
    
        DefaultMenuModel testsMenu = new DefaultMenuModel(null, "Test");
        testsMenu.addItem(new DefaultOptionModel("Launch_AccordionPaneTest",
                "Accordion Pane", Styles.ICON_16_ACCORDION_PANE));
        testsMenu.addItem(new DefaultOptionModel("Launch_BorderPaneTest",
                "Border Pane", Styles.ICON_16_BORDER_PANE));
        testsMenu.addItem(new DefaultOptionModel("Launch_ContextMenuTest",
                "Context Menu", Styles.ICON_16_CONTEXT_MENU));
        testsMenu.addItem(new DefaultOptionModel("Launch_CalendarSelectTest",
                "Calendar Select", Styles.ICON_16_CALENDAR_SELECT));
        testsMenu.addItem(new DefaultOptionModel("Launch_ColorSelectTest",
                "Color Select", Styles.ICON_16_COLOR_SELECT));
        testsMenu.addItem(new DefaultOptionModel("Launch_DataGridTest",
                "DataGrid", null));
        testsMenu.addItem(new DefaultOptionModel("Launch_DragSourceTest",
                "Drag and Drop", Styles.ICON_16_DRAG_SOURCE));
        testsMenu.addItem(new DefaultOptionModel("Launch_DropDownMenuTest",
                "Drop Down Menu", Styles.ICON_16_DROP_DOWN_MENU));
        testsMenu.addItem(new DefaultOptionModel("Launch_FlowViewerTest", "FlowViewer",
                null));
        testsMenu.addItem(new DefaultOptionModel("Launch_GroupTest", "Group",
                Styles.ICON_16_GROUP));
        testsMenu.addItem(new DefaultOptionModel("Launch_ListViewerTest", "ListViewer",
                null));
        testsMenu.addItem(new DefaultOptionModel("Launch_MenuBarPaneTest",
                "Menu Bar Pane", Styles.ICON_16_MENU_BAR_PANE));
        testsMenu.addItem(new DefaultOptionModel("Launch_RichTextAreaTest",
                "Rich Text Area", Styles.ICON_16_RICH_TEXT_AREA));
        testsMenu.addItem(new DefaultOptionModel("Launch_ReorderTest",
                "Reorder", null));
        testsMenu.addItem(new DefaultOptionModel("Launch_TabPaneTest", "Tab Pane",
                Styles.ICON_16_TAB_PANE));
        testsMenu.addItem(new DefaultOptionModel("Launch_ToolTipContainerTest", "Tooltip Container",
                Styles.ICON_16_TOOL_TIP_CONTAINER));
        testsMenu.addItem(new DefaultOptionModel("Launch_TransitionPaneTest",
                "Transition Pane", Styles.ICON_16_TRANSITION_PANE));
        testsMenu.addItem(new DefaultOptionModel("Launch_TreeTest", "Tree",
                Styles.ICON_16_TREE));
        testsMenu.addItem(new SeparatorModel());
        testsMenu.addItem(new DefaultOptionModel("Reset", "Reset", null));
        testsMenu.addItem(new DefaultOptionModel("Exit", "Exit", null));
        menuBarMenu.addItem(testsMenu);
    
        DefaultMenuModel backgroundsMenu = new DefaultMenuModel("Backgrounds",
                "Backgrounds");
        backgroundsMenu.addItem(new DefaultRadioOptionModel("BackgroundDefault",
                "Backgrounds", "Default"));
        backgroundsMenu.addItem(new DefaultRadioOptionModel("BackgroundPewter",
                "Backgrounds", "Pewter"));
        backgroundsMenu.addItem(new DefaultRadioOptionModel("BackgroundSilver",
                "Backgrounds", "Silver"));
        backgroundsMenu.addItem(new DefaultRadioOptionModel("BackgroundBlue",
                "Backgrounds", "Blue"));
    
        DefaultMenuModel localesMenu = new DefaultMenuModel("Locales", "Locales");
        localesMenu.addItem(new DefaultRadioOptionModel("Locale_ar", "Locales",
                "Arabic (RTL)"));
        localesMenu.addItem(new DefaultRadioOptionModel("Locale_bg", "Locales",
                "Bulgarian"));
        localesMenu.addItem(new DefaultRadioOptionModel("Locale_da", "Locales",
                "Danish"));
        localesMenu.addItem(new DefaultRadioOptionModel("Locale_en", "Locales",
                "English"));
        localesMenu.addItem(new DefaultRadioOptionModel("Locale_fr", "Locales",
                "French"));
        localesMenu.addItem(new DefaultRadioOptionModel("Locale_de", "Locales",
                "German"));
        localesMenu.addItem(new DefaultRadioOptionModel("Locale_el", "Locales",
                "Greek"));
        localesMenu.addItem(new DefaultRadioOptionModel("Locale_it", "Locales",
                "Italian"));
        localesMenu.addItem(new DefaultRadioOptionModel("Locale_es", "Locales",
                "Spanish"));
        localesMenu.addItem(new DefaultRadioOptionModel("Locale_1337", "Locales",
                "1337 (Test)"));
    
        DefaultMenuModel optionsMenu = new DefaultMenuModel(null, "Options");
        optionsMenu.addItem(new DefaultOptionModel("OpenConsole", "Open Console",
                null));
        optionsMenu.addItem(new DefaultOptionModel("Serialize", "Test Serialization",
                null));
        optionsMenu.addItem(new DefaultOptionModel("OpenModalDialog",
                "Open Model Dialog", null));
        
        DefaultMenuModel blinkMenu = new DefaultMenuModel(null, "Blink (Hide/Display) Testing");
        blinkMenu.addItem(new DefaultRadioOptionModel("BlinkDefault", "BlinkContent", "Disable"));
        blinkMenu.addItem(new DefaultRadioOptionModel("BlinkAuto", "BlinkContent", "Automatic (Blinking Content)"));
        blinkMenu.addItem(new DefaultRadioOptionModel("BlinkManual", "BlinkContent", "Manual"));
        optionsMenu.addItem(blinkMenu);
        
        optionsMenu.addItem(new SeparatorModel());
        optionsMenu.addItem(localesMenu);
        optionsMenu.addItem(new SeparatorModel());
        optionsMenu.addItem(new DefaultToggleOptionModel("ShowBackground",
                "Show Background"));
        optionsMenu.addItem(backgroundsMenu);
        menuBarMenu.addItem(optionsMenu);
    
        SplitPane titleVerticalPane = new SplitPane(SplitPane.ORIENTATION_VERTICAL);
        titleVerticalPane.setStyleName("TestPane");
        add(titleVerticalPane);
    
        Label titleLabel = new Label("NextApp Echo3 Extras Test Application");
        titleLabel.setStyleName("TitleLabel");
        titleVerticalPane.add(titleLabel);
    
        menuVerticalPane = new SplitPane(SplitPane.ORIENTATION_VERTICAL, true);
        titleVerticalPane.add(menuVerticalPane);
    
        MenuStateModel stateModel = new AbstractMenuStateModel() {
    
            boolean showBackground = true;
            FillImage background = Styles.FILL_IMAGE_EXTRAS_BACKGROUND;
    
            public void setSelected(String id, boolean selected) {
                if ("ShowBackground".equals(id)) {
                    showBackground = selected;
                    setBackgroundImage(showBackground ? background : null);
                } else if (selected && "BackgroundDefault".equals(id)) {
                    background = Styles.FILL_IMAGE_EXTRAS_BACKGROUND;
                    if (showBackground) {
                        setBackgroundImage(background);
                    }
                } else if (selected && "BackgroundPewter".equals(id)) {
                    background = Styles.FILL_IMAGE_PEWTER_LINE;
                    if (showBackground) {
                        setBackgroundImage(background);
                    }
                } else if (selected && "BackgroundSilver".equals(id)) {
                    background = Styles.FILL_IMAGE_SILVER_LINE;
                    if (showBackground) {
                        setBackgroundImage(background);
                    }
                } else if (selected && "BackgroundBlue".equals(id)) {
                    background = Styles.FILL_IMAGE_LIGHT_BLUE_LINE;
                    if (showBackground) {
                        setBackgroundImage(background);
                    }
                } else if (selected && "BlinkDefault".equals(id)) {
                    blinkContainer = null;
                    if (activeTestName != null) {
                        startTest(activeTestName);
                    }
                } else if (selected && "BlinkAuto".equals(id)) {
                    blinkContainer = new BlinkComponent();
                    blinkContainer.setInterval(3000);
                    if (activeTestName != null) {
                        startTest(activeTestName);
                    }
                } else if (selected && "BlinkManual".equals(id)) {
                    blinkContainer = new BlinkComponent();
                    if (activeTestName != null) {
                        startTest(activeTestName);
                    }
                }
                fireStateChanged();
            }
    
            public void setEnabled(String id, boolean enabled) {
            }
    
            public boolean isSelected(String id) {
                if ("ShowBackground".equals(id)) {
                    return showBackground;
                } else if ("BackgroundDefault".equals(id)) {
                    return Styles.FILL_IMAGE_EXTRAS_BACKGROUND.equals(background);
                } else if ("BackgroundPewter".equals(id)) {
                    return Styles.FILL_IMAGE_PEWTER_LINE.equals(background);
                } else if ("BackgroundSilver".equals(id)) {
                    return Styles.FILL_IMAGE_SILVER_LINE.equals(background);
                } else if ("BackgroundBlue".equals(id)) {
                    return Styles.FILL_IMAGE_LIGHT_BLUE_LINE.equals(background);
                } else if ("BlinkDefault".equals(id)) {
                    return blinkContainer == null;
                } else if ("BlinkAuto".equals(id)) {
                    return blinkContainer != null && blinkContainer.getInterval() > 0;
                } else if ("BlinkManual".equals(id)) {
                    return blinkContainer != null && blinkContainer.getInterval() <= 0;
                } else if (id.startsWith("Locale_")) {
                    String language = id.substring("Locale_".length());
                    if ("Default".equals(language)) {
                        return Locale.getDefault().equals(
                                InteractiveApp.getApp().getLocale());
                    } else {
                        return language.equals(InteractiveApp.getApp().getLocale()
                                .getLanguage());
                    }
                } else {
                    return false;
                }
            }
    
            public boolean isEnabled(String id) {
                if ("Backgrounds".equals(id)) {
                    return showBackground;
                } else {
                    return true;
                }
            }
        };
    
        MenuBarPane menu = new MenuBarPane(menuBarMenu, stateModel);
        menu.setStyleName("Default");
        menu.addActionListener(commandActionListener);
        menuVerticalPane.add(menu);
        
        if (testName != null) {
            startTest(testName);
        }
    }
    
    private void doSerialTest() {
        ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
        ObjectOutputStream objectOut;
        
        try {
            objectOut = new ObjectOutputStream(byteOut);
            objectOut.writeObject(this.getApplicationInstance());
            objectOut.flush();
            objectOut.close();
            byte[] data = byteOut.toByteArray();
            InteractiveApp.getApp().consoleWrite("Serialized.  Length: " + data.length);
        } catch (IOException ex) {
            InteractiveApp.getApp().consoleWrite(ex.toString());
        }
    }
    
    private void startTest(String testName) {
        try {
            this.activeTestName = testName;
            String screenClassName = "nextapp.echo.extras.testapp.testscreen." + testName;
            Class screenClass = Class.forName(screenClassName);
            Component content = (Component) screenClass.newInstance();
            if (menuVerticalPane.getComponentCount() > 1) {
                menuVerticalPane.remove(1);
            }
            if (blinkContainer == null) {
                menuVerticalPane.add(content);
            } else {
                menuVerticalPane.add(blinkContainer);
                blinkContainer.removeAll();
                blinkContainer.add(content);
            }
        } catch (ClassNotFoundException ex) {
            add(new MessageDialog("Cannot Load Test", ex.toString(),
                    Styles.ICON_64_ERROR, MessageDialog.CONTROLS_OK));
        } catch (InstantiationException ex) {
            throw new RuntimeException(ex.toString());
        } catch (IllegalAccessException ex) {
            throw new RuntimeException(ex.toString());
        }
    }
}
