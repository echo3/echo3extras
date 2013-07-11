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
import nextapp.echo.app.FillImage;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.extras.app.ContextMenu;
import nextapp.echo.extras.app.event.MenuActivationEvent;
import nextapp.echo.extras.app.event.MenuActivationListener;
import nextapp.echo.extras.app.menu.DefaultMenuModel;
import nextapp.echo.extras.app.menu.DefaultMenuStateModel;
import nextapp.echo.extras.app.menu.DefaultOptionModel;
import nextapp.echo.extras.app.menu.DefaultRadioOptionModel;
import nextapp.echo.extras.app.menu.DefaultToggleOptionModel;
import nextapp.echo.extras.app.menu.MenuModel;
import nextapp.echo.extras.app.menu.MenuStateModel;
import nextapp.echo.extras.app.menu.SeparatorModel;
import nextapp.echo.extras.testapp.AbstractTest;
import nextapp.echo.extras.testapp.InteractiveApp;
import nextapp.echo.extras.testapp.Styles;
import nextapp.echo.extras.testapp.TestControlPane;

/**
 * Interactive test module for <code>ContextMenu</code>s.
 */
public class ContextMenuTest extends AbstractTest {
    
    private static final FillImage[] TEST_FILL_IMAGES = new FillImage[] { null, 
            Styles.FILL_IMAGE_SHADOW_BACKGROUND_DARK_BLUE, Styles.FILL_IMAGE_SHADOW_BACKGROUND_LIGHT_BLUE,
            Styles.FILL_IMAGE_PEWTER_LINE, Styles.FILL_IMAGE_LIGHT_BLUE_LINE,
            Styles.FILL_IMAGE_SILVER_LINE};
    
    private int counter;
    
    private MenuActivationListener activationListener = new MenuActivationListener() {
        @Override
        public void menuActivated(MenuActivationEvent e) {
            menu.setModel(createMenuModel(++counter));
            InteractiveApp.getApp().consoleWrite("Menu activation: menu=" + e.getSource());
        }
    };
    
    private ContextMenu menu;

    public ContextMenuTest() {
        super("ContextMenu", Styles.ICON_16_CONTEXT_MENU);
        
        ContentPane content = new ContentPane();
        content.setInsets(new Insets(20));
        
        menu = new ContextMenu(new Label("Right-click me!"), createMenuModel(0));
        menu.setStateModel(createMenuStateModel());
        menu.addActionListener(new ActionListener(){
        
            public void actionPerformed(ActionEvent e) {
                InteractiveApp.getApp().consoleWrite("Menu action: menu=" + e.getSource() + ", command=" + e.getActionCommand());
            }
        });
        content.add(menu);
        
        add(content);
        
        setTestComponent(content, menu);
        
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, "foreground");
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, "background");
        addBorderPropertyTests(TestControlPane.CATEGORY_PROPERTIES, "border");
        addFillImagePropertyTests(TestControlPane.CATEGORY_PROPERTIES, "backgroundImage", TEST_FILL_IMAGES);
        addFontPropertyTests(TestControlPane.CATEGORY_PROPERTIES, "font");
        
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, "selectionForeground");
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, "selectionBackground");
        addFillImagePropertyTests(TestControlPane.CATEGORY_PROPERTIES, "selectionBackgroundImage", TEST_FILL_IMAGES);
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Activation Mode = Context", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                menu.setActivationMode(ContextMenu.ACTIVATION_MODE_CONTEXT_CLICK);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Activation Mode = Primary", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                menu.setActivationMode(ContextMenu.ACTIVATION_MODE_CLICK);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Pane Content", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                menu.removeAll();
                SplitPane sp = new SplitPane();
                sp.setSeparatorVisible(true);
                sp.setStyleName("DefaultResizable");
                sp.add(new Label("One"));
                sp.add(new Label("Two"));
                menu.add(sp);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_LISTENERS, "Add Activation Listener", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                menu.addActivationListener(activationListener);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_LISTENERS, "Remove Activation Listener", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                menu.removeActivationListener(activationListener);
            }
        });
        
        addStandardIntegrationTests();
    }
    
    private MenuModel createMenuModel(int type) {
        DefaultMenuModel menuModel = new DefaultMenuModel();
        
        DefaultMenuModel fileMenuModel = new DefaultMenuModel(null, "File [" + type + "]");
        fileMenuModel.addItem(new DefaultOptionModel("new" + type, "New" + type, null));
        fileMenuModel.addItem(new DefaultOptionModel("open", "Open", null));
        DefaultMenuModel openRecentMenuModel = new DefaultMenuModel(null, "Open Recent");
        openRecentMenuModel.addItem(new DefaultOptionModel("open-recent-1", "Hotel.pdf", null));
        openRecentMenuModel.addItem(new DefaultOptionModel("open-recent-2", "Alpha.txt", null));
        openRecentMenuModel.addItem(new DefaultOptionModel("open-recent-3", "q4-earnings.txt", null));
        openRecentMenuModel.addItem(new DefaultOptionModel("open-recent-4", "Bravo.odt", null));
        openRecentMenuModel.addItem(new DefaultOptionModel("open-recent-5", "Golf.pdf", null));
        openRecentMenuModel.addItem(new DefaultOptionModel("open-recent-6", "Alpha.txt", null));
        openRecentMenuModel.addItem(new DefaultOptionModel("open-recent-7", "q3-earnings.txt", null));
        openRecentMenuModel.addItem(new DefaultOptionModel("open-recent-8", "Charlie.odt", null));
        openRecentMenuModel.addItem(new DefaultOptionModel("open-recent-9", "XYZ.pdf", null));
        openRecentMenuModel.addItem(new DefaultOptionModel("open-recent-10", "Delta.txt", null));
        openRecentMenuModel.addItem(new DefaultOptionModel("open-recent-11", "q1-earnings.txt", null));
        openRecentMenuModel.addItem(new DefaultOptionModel("open-recent-12", "Foxtrot.odt", null));
        fileMenuModel.addItem(openRecentMenuModel);

        DefaultMenuModel openFrequentMenuModel = new DefaultMenuModel(null, "Open Frequently Used");
        openFrequentMenuModel.addItem(new DefaultOptionModel("open-recent-1", "q2-earnings.txt", null));
        openFrequentMenuModel.addItem(new DefaultOptionModel("open-recent-2", "q3-earnings.txt", null));
        openFrequentMenuModel.addItem(new DefaultOptionModel("open-recent-3", "q4-earnings.txt", null));
        openFrequentMenuModel.addItem(new DefaultOptionModel("open-recent-4", "Bravo.odt", null));
        openFrequentMenuModel.addItem(new DefaultOptionModel("open-recent-5", "Golf.pdf", null));
        openFrequentMenuModel.addItem(new DefaultOptionModel("open-recent-7", "q1-earnings.txt", null));
        openFrequentMenuModel.addItem(new DefaultOptionModel("open-recent-8", "Charlie.odt", null));
        openFrequentMenuModel.addItem(new DefaultOptionModel("open-recent-9", "XYZ.pdf", null));
        openFrequentMenuModel.addItem(new DefaultOptionModel("open-recent-10", "CharlieBravo.txt", null));
        openFrequentMenuModel.addItem(new DefaultOptionModel("open-recent-11", "q1-earnings.txt", null));
        openFrequentMenuModel.addItem(new DefaultOptionModel("open-recent-12", "Foxtrot.odt", null));
        fileMenuModel.addItem(openFrequentMenuModel);
        
        fileMenuModel.addItem(new SeparatorModel());
        fileMenuModel.addItem(new DefaultOptionModel("save", "Save", null));
        fileMenuModel.addItem(new DefaultOptionModel("save-as", "Save as...", null));
        menuModel.addItem(fileMenuModel);
        
        DefaultMenuModel optionsMenuModel = new DefaultMenuModel(null, "Options");
        optionsMenuModel.addItem(new DefaultOptionModel("load-preferences", "Load Preferences...", null));
        optionsMenuModel.addItem(new DefaultOptionModel("save-preferences", "Save Preferences...", null));
        optionsMenuModel.addItem(new SeparatorModel());
        optionsMenuModel.addItem(new DefaultToggleOptionModel("abc", "Enable ABC"));
        optionsMenuModel.addItem(new DefaultToggleOptionModel("def", "Enable DEF"));
        optionsMenuModel.addItem(new DefaultToggleOptionModel("ghi", "Enable GHI"));
        optionsMenuModel.addItem(new SeparatorModel());
        optionsMenuModel.addItem(new DefaultOptionModel("disabled1", "Disabled Option", null));
        optionsMenuModel.addItem(new DefaultToggleOptionModel("disabled2", "Disabled Toggle"));
        optionsMenuModel.addItem(new DefaultToggleOptionModel("def", "Enable DEF"));
        optionsMenuModel.addItem(new SeparatorModel());
        optionsMenuModel.addItem(new DefaultRadioOptionModel("foo1", "foomode", "Foo Mode 1"));
        optionsMenuModel.addItem(new DefaultRadioOptionModel("foo2", "foomode", "Foo Mode 2"));
        optionsMenuModel.addItem(new DefaultRadioOptionModel("foo3", "foomode", "Foo Mode 3"));
        optionsMenuModel.addItem(new DefaultRadioOptionModel("foo4", "foomode", "Foo Mode 4"));
        optionsMenuModel.addItem(new SeparatorModel());
        optionsMenuModel.addItem(new DefaultRadioOptionModel("bar1", "barmode", "Bar Mode 1"));
        optionsMenuModel.addItem(new DefaultRadioOptionModel("bar2", "barmode", "Bar Mode 2"));
        menuModel.addItem(optionsMenuModel);
        return menuModel;
    }

    private MenuStateModel createMenuStateModel() {
        MenuStateModel stateModel = new DefaultMenuStateModel();
        stateModel.setSelected("abc", true);
        stateModel.setEnabled("disabled1", false);
        stateModel.setEnabled("disabled2", false);
        return stateModel;
    }
}
