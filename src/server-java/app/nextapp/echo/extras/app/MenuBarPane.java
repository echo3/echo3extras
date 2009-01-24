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

package nextapp.echo.extras.app;

import nextapp.echo.app.Border;
import nextapp.echo.app.Color;
import nextapp.echo.app.Component;
import nextapp.echo.app.FillImage;
import nextapp.echo.app.ImageReference;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Pane;
import nextapp.echo.app.PaneContainer;
import nextapp.echo.extras.app.menu.AbstractMenuComponent;
import nextapp.echo.extras.app.menu.MenuModel;
import nextapp.echo.extras.app.menu.MenuStateModel;

/**
 * MenuBarPane component: a menu bar containing "pull down" menus. This component is a <code>Pane</code>, and is generally best used
 * as the first child of a <code>SplitPane</code> component whose <code>autoPositioned</code> property is set to true. May not
 * contain child components.
 */
public class MenuBarPane extends AbstractMenuComponent 
implements Pane {
    
    public static final String PROPERTY_BACKGROUND_IMAGE = "backgroundImage";
    public static final String PROPERTY_BORDER = "border";
    public static final String PROPERTY_DISABLED_BACKGROUND = "disabledBackground";
    public static final String PROPERTY_DISABLED_BACKGROUND_IMAGE = "disabledBackgroundImage";
    public static final String PROPERTY_DISABLED_FOREGROUND = "disabledForeground";
    public static final String PROPERTY_INSETS = "insets";
    public static final String PROPERTY_MENU_BACKGROUND = "menuBackground";
    public static final String PROPERTY_MENU_BACKGROUND_IMAGE = "menuBackgroundImage";
    public static final String PROPERTY_MENU_BORDER = "menuBorder";
    public static final String PROPERTY_MENU_EXPAND_ICON = "menuExpandIcon";
    public static final String PROPERTY_MENU_FOREGROUND = "menuForeground";
    public static final String PROPERTY_MENU_OPACITY = "menuOpacity";
    public static final String PROPERTY_SELECTION_BACKGROUND = "selectionBackground";
    public static final String PROPERTY_SELECTION_BACKGROUND_IMAGE = "selectionBackgroundImage";
    public static final String PROPERTY_SELECTION_FOREGROUND = "selectionForeground";
    
    /**
     * Creates a new <code>MenuBarPane</code> with an empty
     * <code>DefaultMenuModel</code> as its model and a.
     * <code>DefaultMenuStateModel</code> to provide state information.
     */
    public MenuBarPane() {
        this(null, null);
    }
    
    /**
     * Creates a new <code>MenuBarPane</code> displaying the specified 
     * <code>MenuModel</code> and using a 
     * <code>DefaultMenuStateModel</code> to provide state information.
     * 
     * @param model the model
     */
    public MenuBarPane(MenuModel model) {
        this(model, null);
    }
    
    /**
     * Creates a new <code>MenuBarPane</code> displaying the specified 
     * <code>MenuModel</code> and using the specified 
     * <code>MenuStateModel</code> to provide state information.
     * 
     * @param model the model
     * @param stateModel the selection model
     */
    public MenuBarPane(MenuModel model, MenuStateModel stateModel) {
        super(model, stateModel);
    }
    
    /**
     * Returns the background image that will be displayed in the 
     * <code>MenuBarPane</code>.  This background image will also be 
     * used around pull-down menus in the event that a menu 
     * background image is not specified.
     * 
     * @return the default background image
     */
    public FillImage getBackgroundImage() {
        return (FillImage) get(PROPERTY_BACKGROUND_IMAGE);
    }
    
    /**
     * Returns the border that will be displayed around the 
     * <code>MenuBarPane</code>.  This border will also be used around
     * pull-down menus in the event that a menu border is not specified.
     * 
     * @return the default border
     */
    public Border getBorder() {
        return (Border) get(PROPERTY_BORDER);
    }
    
    /**
     * Returns the background color used to render disabled menu items.
     * 
     * @return the disabled background
     */
    public Color getDisabledBackground() {
        return (Color) get(PROPERTY_DISABLED_BACKGROUND);
    }
    
    /**
     * Returns the background image used to render disabled menu items.
     * 
     * @return the disabled background image
     */
    public FillImage getDisabledBackgroundImage() {
        return (FillImage) get(PROPERTY_DISABLED_BACKGROUND_IMAGE);
    }
    
    /**
     * Returns the foreground color used to render disabled menu items.
     * 
     * @return the disabled foreground
     */
    public Color getDisabledForeground() {
        return (Color) get(PROPERTY_DISABLED_FOREGROUND);
    }
    
    /**
     * Returns the inset margin around the menu bar.
     * This property is ignored unless the container is sizing itself to the menu bar.
     * 
     * @return the inset margin around the menu bar
     */
    public Insets getInsets() {
        return (Insets) get(PROPERTY_INSETS);
    }

    /**
     * Returns the background color that will be displayed in pull-down
     * menus.  Use this property only if a color different from
     * the one used for the menu bar is desired for pull-down menus
     * (otherwise use only the "background" property").
     * 
     * @return the menu background
     */
    public Color getMenuBackground() {
        return (Color) get(PROPERTY_MENU_BACKGROUND);
    }
    
    /**
     * Returns the background image that will be displayed in pull-down
     * menus.  Use this property only if an image different from
     * the one used for the menu bar is desired for pull-down menus
     * (otherwise use only the "backgroundImage" property").
     * 
     * @return the menu background image
     */
    public FillImage getMenuBackgroundImage() {
        return (FillImage) get(PROPERTY_MENU_BACKGROUND_IMAGE);
    }
    
    /**
     * Returns the border that will be displayed around pull-down
     * menus.  Use this property only if a border different from
     * the one used for the menu bar is desired for pull-down menus
     * (otherwise use only the "border" property").
     * 
     * @return the menu border
     */
    public Border getMenuBorder() {
        return (Border) get(PROPERTY_MENU_BORDER);
    }
    
    /**
     * Returns the icon used to expand pull-down menus.
     * 
     * @return the menu expand icon
     */
    public ImageReference getMenuExpandIcon() {
        return (ImageReference) get(PROPERTY_MENU_EXPAND_ICON);
    }
    
    /**
     * Returns the foreground color that will be displayed in pull-down
     * menus.  Use this property only if a color different from
     * the one used for the menu bar is desired for pull-down menus
     * (otherwise use only the "foreground" property").
     * 
     * @return the menu foreground
     */
    public Color getMenuForeground() {
        return (Color) get(PROPERTY_MENU_FOREGROUND);
    }
    
    /**
     * Returns the opacity setting (percent) that will be used for the background
     * color/image displayed in pulldown menus.  Valid values are between
     * 1 and 100.  Some clients may not support this setting and will
     * always render menus with 100% opacity.
     * 
     * @return the opacity setting
     */
    public int getMenuOpacity() {
        Integer opacity = (Integer) get(PROPERTY_MENU_OPACITY);
        return opacity == null ? 100 : opacity.intValue();
    }
    
    /**
     * Returns the background color used to highlight the currently 
     * selected menu item.
     * 
     * @return the selection background
     */
    public Color getSelectionBackground() {
        return (Color) get(PROPERTY_SELECTION_BACKGROUND);
    }
    
    /**
     * Returns the background image used to highlight the currently 
     * selected menu item.
     * 
     * @return the selection background image
     */
    public FillImage getSelectionBackgroundImage() {
        return (FillImage) get(PROPERTY_SELECTION_BACKGROUND_IMAGE);
    }
    
    /**
     * Returns the foreground color used to highlight the currently 
     * selected menu item.
     * 
     * @return the selection foreground
     */
    public Color getSelectionForeground() {
        return (Color) get(PROPERTY_SELECTION_FOREGROUND);
    }

    /**
     * @see nextapp.echo.app.Component#isValidParent(nextapp.echo.app.Component)
     */
    public boolean isValidParent(Component c) {
        if (!super.isValidParent(c)) {
            return false;
        }
        // Ensure parent is a PaneContainer.
        return c instanceof PaneContainer;
    }
    
    /**
     * Sets the background image that will be displayed in the 
     * <code>MenuBarPane</code>.  This background image will also be 
     * used around pull-down menus in the event that a menu 
     * background image is not specified.
     * 
     * @param newValue the new default background image
     */
    public void setBackgroundImage(FillImage newValue) {
        set(PROPERTY_BACKGROUND_IMAGE, newValue);
    }
    
    /**
     * Sets the border that will be displayed around the 
     * <code>MenuBarPane</code>.  This border will also be used around
     * pull-down menus in the event that a menu border is not specified.
     * 
     * @param newValue the new default border
     */
    public void setBorder(Border newValue) {
        set(PROPERTY_BORDER, newValue);
    }
    
    /**
     * Sets the background color used to render disabled menu items.
     * 
     * @param newValue the new disabled background
     */
    public void setDisabledBackground(Color newValue) {
        set(PROPERTY_DISABLED_BACKGROUND, newValue);
    }
    
    /**
     * Sets the background image used to render disabled menu items.
     * 
     * @param newValue the new disabled background image
     */
    public void setDisabledBackgroundImage(FillImage newValue) {
        set(PROPERTY_DISABLED_BACKGROUND_IMAGE, newValue);
    }
    
    /**
     * Sets the foreground color used to render disabled menu items.
     * 
     * @param newValue the new disabled foreground
     */
    public void setDisabledForeground(Color newValue) {
        set(PROPERTY_DISABLED_FOREGROUND, newValue);
    }
    
    /**
     * Returns the inset margin around the menu bar.
     * This property is ignored unless the container is sizing itself to the menu bar.
     * 
     * @param newValue the inset margin around the menu bar
     */
    public void setInsets(Insets newValue) {
        set(PROPERTY_INSETS, newValue);
    }
    
    /**
     * Sets the background color that will be displayed in pull-down
     * menus.  Use this property only if a color different from
     * the one used for the menu bar is desired for pull-down menus
     * (otherwise use only the "background" property").
     * 
     * @param newValue the new menu background
     */
    public void setMenuBackground(Color newValue) {
        set(PROPERTY_MENU_BACKGROUND, newValue);
    }
    
    /**
     * Sets the background image that will be displayed in pull-down
     * menus.  Use this property only if an image different from
     * the one used for the menu bar is desired for pull-down menus
     * (otherwise use only the "backgroundImage" property").
     * 
     * @param newValue the new menu background image
     */
    public void setMenuBackgroundImage(FillImage newValue) {
        set(PROPERTY_MENU_BACKGROUND_IMAGE, newValue);
    }
    
    /**
     * Sets the border that will be displayed around pull-down
     * menus.  Use this property only if a border different from
     * the one used for the menu bar is desired for pull-down menus
     * (otherwise use only the "border" property").
     * 
     * @param newValue the new menu border
     */
    public void setMenuBorder(Border newValue) {
        set(PROPERTY_MENU_BORDER, newValue);
    }
    
    /**
     * Sets the icon used to expand pull-down menus.
     * 
     * @param newValue the new menu expand icon
     */
    public void setMenuExpandIcon(ImageReference newValue) {
        set(PROPERTY_MENU_EXPAND_ICON, newValue);
    }

    /**
     * Sets the foreground color that will be displayed in pull-down
     * menus.  Use this property only if a color different from
     * the one used for the menu bar is desired for pull-down menus
     * (otherwise use only the "foreground" property").
     * 
     * @param newValue the new menu foreground
     */
    public void setMenuForeground(Color newValue) {
        set(PROPERTY_MENU_FOREGROUND, newValue);
    }
    
    /**
     * Sets the opacity (percent) that will be used for the background
     * color/image displayed in pulldown menus.  Valid values are between
     * 1 and 100.  Some clients may not support this setting and will
     * always render menus with 100% opacity.
     * 
     * @param newValue the new opacity setting
     */
    public void setMenuOpacity(int newValue) {
        set(PROPERTY_MENU_OPACITY, new Integer(newValue));
    }
    
    /**
     * Sets the background color used to highlight the currently 
     * selected menu item.
     * 
     * @param newValue the new selection background
     */
    public void setSelectionBackground(Color newValue) {
        set(PROPERTY_SELECTION_BACKGROUND, newValue);
    }
    
    /**
     * Sets the background image used to highlight the currently 
     * selected menu item.
     * 
     * @param newValue the new selection background image
     */
    public void setSelectionBackgroundImage(FillImage newValue) {
        set(PROPERTY_SELECTION_BACKGROUND_IMAGE, newValue);
    }
    
    /**
     * Sets the foreground color used to highlight the currently 
     * selected menu item.
     * 
     * @param newValue the new selection foreground
     */
    public void setSelectionForeground(Color newValue) {
        set(PROPERTY_SELECTION_FOREGROUND, newValue);
    }
}
