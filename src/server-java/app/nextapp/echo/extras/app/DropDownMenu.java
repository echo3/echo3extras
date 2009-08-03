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
import nextapp.echo.app.Extent;
import nextapp.echo.app.FillImage;
import nextapp.echo.app.Font;
import nextapp.echo.app.ImageReference;
import nextapp.echo.app.Insets;
import nextapp.echo.app.event.ChangeEvent;
import nextapp.echo.app.event.ChangeListener;
import nextapp.echo.extras.app.menu.AbstractMenuComponent;
import nextapp.echo.extras.app.menu.MenuModel;
import nextapp.echo.extras.app.menu.MenuSelectionModel;
import nextapp.echo.extras.app.menu.MenuStateModel;
import nextapp.echo.extras.app.menu.OptionModel;

/**
 * A drop-down menu component which may be used as an inline menu or as a stateful hierarchal selection component.
 */
public class DropDownMenu extends AbstractMenuComponent {
    
    public static final String PROPERTY_BACKGROUND_IMAGE = "backgroundImage";
    public static final String PROPERTY_BORDER = "border";
    public static final String PROPERTY_DISABLED_BACKGROUND = "disabledBackground";
    public static final String PROPERTY_DISABLED_BACKGROUND_IMAGE = "disabledBackgroundImage";
    public static final String PROPERTY_DISABLED_FOREGROUND = "disabledForeground";
    public static final String PROPERTY_DISABLED_EXPAND_ICON = "disabledExpandIcon";
    public static final String PROPERTY_EXPAND_ICON = "expandIcon";
    public static final String PROPERTY_EXPAND_ICON_WIDTH = "expandIconWidth";
    public static final String PROPERTY_HEIGHT = "height";
    public static final String PROPERTY_LINE_WRAP = "lineWrap";
    public static final String PROPERTY_MENU_HEIGHT = "menuHeight";
    public static final String PROPERTY_MENU_BACKGROUND = "menuBackground";
    public static final String PROPERTY_MENU_BACKGROUND_IMAGE = "menuBackgroundImage";
    public static final String PROPERTY_MENU_BORDER = "menuBorder";
    public static final String PROPERTY_MENU_EXPAND_ICON = "menuExpandIcon";
    public static final String PROPERTY_MENU_FOREGROUND = "menuForeground";
    public static final String PROPERTY_MENU_FONT = "menuFont";
    public static final String PROPERTY_MENU_WIDTH = "menuWidth";
    public static final String PROPERTY_SELECTION_BACKGROUND = "selectionBackground";
    public static final String PROPERTY_SELECTION_BACKGROUND_IMAGE = "selectionBackgroundImage";
    public static final String PROPERTY_SELECTION_FOREGROUND = "selectionForeground";
    public static final String PROPERTY_SELECTION_TEXT = "selectionText";
    public static final String PROPERTY_WIDTH = "width";
    public static final String PROPERTY_INSETS = "insets";
    
    public static final String SELECTION_CHANGED_PROPERTY = "selection";
    public static final String SELECTION_MODEL_CHANGED_PROPERTY = "selectionModel";
    
    /**
     * The selection model.
     */
    private MenuSelectionModel selectionModel;
    
    /**
     * Internal change listener.
     */
    private ChangeListener changeListener = new ChangeListener(){
    
        /**
         * @see nextapp.echo.app.event.ChangeListener#stateChanged(nextapp.echo.app.event.ChangeEvent)
         */
        public void stateChanged(ChangeEvent e) {
            firePropertyChange(SELECTION_CHANGED_PROPERTY, null, null);
        }
    };
    
    /**
     * Creates a new <code>DropDownMenu</code> with an empty
     * <code>DefaultMenuModel</code> as its model and a.
     * <code>DefaultMenuStateModel</code> to provide state information.
     */
    public DropDownMenu() {
        this(null);
    }
    
    /**
     * Creates a new <code>DropDownMenu</code> displaying the specified 
     * <code>MenuModel</code> and using a 
     * <code>DefaultMenuStateModel</code> to provide state information.
     * 
     * @param model the model
     */
    public DropDownMenu(MenuModel model) {
        this(model, (MenuStateModel)null);
    }
    
    /**
     * Creates a new <code>DropDownMenu</code> displaying the specified 
     * <code>MenuModel</code> and using the specified 
     * <code>MenuStateModel</code> to provide state information.
     * 
     * @param model the model
     * @param stateModel the state model
     */
    public DropDownMenu(MenuModel model, MenuStateModel stateModel) {
        super(model, stateModel);
    }
    
    /**
     * Creates a new <code>DropDownMenu</code> displaying the specified
     * <code>MenuModel</code> and determining selection via the specified
     * <code>MenuSelectionModel<code>.
     * 
     * @param model the model
     * @param selectionModel the selection model
     */
    public DropDownMenu(MenuModel model, MenuSelectionModel selectionModel) {
        super(model, null);
        setSelectionModel(selectionModel);
    }
    
    /**
     * @see nextapp.echo.extras.app.menu.AbstractMenuComponent#processInput(java.lang.String, java.lang.Object)
     */
    public void processInput(String name, Object value) {
        if (SELECTION_CHANGED_PROPERTY.equals(name) && selectionModel != null) {
            selectionModel.setSelectedId(((OptionModel)value).getId());
        } else {
            super.processInput(name, value);
        }
    }
    
    /**
     * @see nextapp.echo.extras.app.menu.AbstractMenuComponent#doAction(nextapp.echo.extras.app.menu.OptionModel)
     */
    public void doAction(OptionModel optionModel) {
        if (selectionModel == null) {
            super.doAction(optionModel);
        } else {
            selectionModel.setSelectedId(optionModel.getId());
            fireActionPerformed(optionModel);
        }
    }
    
    /**
     * Returns the <code>MenuSelectionModel</code>.
     * 
     * @return the <code>MenuSelectionModel</code>
     */
    public MenuSelectionModel getSelectionModel() {
        return selectionModel;
    }
    
    /**
     * Gets the selection text that will be displayed when no item is selected.
     * 
     * @return the selection text.
     */
    public String getSelectionText() {
        return (String) get(PROPERTY_SELECTION_TEXT);
    }

    /**
     * Returns the background image that will be displayed in the 
     * <code>DropDownMenu</code>.  This background image will also be 
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
     * <code>DropDownMenu</code>.  This border will also be used around
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
     * Returns the disabled expand icon.
     * 
     * @return the disabled expand icon
     */
    public ImageReference getDisabledExpandIcon() {
        return (ImageReference) get(PROPERTY_DISABLED_EXPAND_ICON);
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
     * Returns the icon used to expand the drop down menu.
     * 
     * @return the expand icon
     */
    public ImageReference getExpandIcon() {
        return (ImageReference) get(PROPERTY_EXPAND_ICON);
    }
    
    /**
     * Returns the width of the expand icon.
     * 
     * @return the width of the expand icon
     */
    public Extent getExpandIconWidth() {
        return (Extent) get(PROPERTY_EXPAND_ICON_WIDTH);
    }
    
    /**
     * Returns the height of the drop down menu.
     * 
     * @return the height
     */
    public Extent getHeight() {
        return (Extent) get(PROPERTY_HEIGHT);
    }
    
    /**
     * Returns the height of the expanded menu.
     * 
     * @return the height
     */
    public Extent getMenuHeight() {
        return (Extent) get(PROPERTY_MENU_HEIGHT);
    }
    
    /**
     * Returns the width of the expanded menu.
     * 
     * @return the width
     */
    public Extent getMenuWidth() {
        return (Extent) get(PROPERTY_MENU_WIDTH);
    }
    
    /**
     * Returns the insets.
     * 
     * @return the insets
     * @see #setInsets
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
     * Returns the font used to render the menu.
     * 
     * @return the menu font
     */
    public Font getMenuFont() {
        return (Font) get(PROPERTY_MENU_FONT);
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
     * Returns the width of the drop down menu.
     * 
     * @return the width
     */
    public Extent getWidth() {
        return (Extent) get(PROPERTY_WIDTH);
    }
    
    /**
     * Determines if the text of items should wrap in the event that 
     * horizontal space is limited. Default value is true.
     * 
     * @return the line wrap state
     */
    public boolean isLineWrap() {
        Boolean value = (Boolean) get(PROPERTY_LINE_WRAP);
        return value == null ? true : value.booleanValue();
    }

    /**
     * Sets the background image that will be displayed in the 
     * <code>DropDownMenu</code>.  This background image will also be 
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
     * <code>DropDownMenu</code>.  This border will also be used around
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
     * Sets the disabled expand icon.
     * 
     * @param newValue the new disabled expand icon
     */
    public void setDisabledExpandIcon(ImageReference newValue) {
        set(PROPERTY_DISABLED_EXPAND_ICON, newValue);
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
     * Sets the icon used to expand the drop down menu.
     * 
     * @param newValue the new expand icon
     */
    public void setExpandIcon(ImageReference newValue) {
        set(PROPERTY_EXPAND_ICON, newValue);
    }
    
    /**
     * Sets the width of the expand icon.
     * This property only supports <code>Extent</code>s with
     * pixel units.
     * 
     * @param newValue the new width of the expand icon
     */
    public void setExpandIconWidth(Extent newValue) {
        Extent.validate(newValue, Extent.PX);
        if (newValue != null && newValue.getValue() < 0) {
            throw new IllegalArgumentException("Extent value may not be negative.");
        }
        set(PROPERTY_EXPAND_ICON_WIDTH, newValue);
    }
    
    /**
     * Sets the height of the drop down menu.
     * 
     * @param newValue the new height
     */
    public void setHeight(Extent newValue) {
        set(PROPERTY_HEIGHT, newValue);
    }
    
    /**
     * Sets whether the text of items should wrap in the event that 
     * horizontal space is limited. Default value is true.
     * 
     * @param newValue the new line wrap state
     */
    public void setLineWrap(boolean newValue) {
        set(PROPERTY_LINE_WRAP, new Boolean(newValue));
    }
    
    /**
     * Sets the height of the expanded menu.
     * 
     * @param newValue the new height
     */
    public void setMenuHeight(Extent newValue) {
        set(PROPERTY_MENU_HEIGHT, newValue);
    }
    
    /**
     * Sets the width of the expanded menu.
     * 
     * @param newValue the new width
     */
    public void setMenuWidth(Extent newValue) {
        set(PROPERTY_MENU_WIDTH, newValue);
    }
    
    /**
     * Sets the insets. This insets will be rendered around the current selection.
     * This property only supports <code>Inset</code>s with
     * pixel units.
     * 
     * @param newValue the new height
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
     * Sets the font used to render the menu.
     * 
     * @param newValue the new menu font
     */
    public void setMenuFont(Font newValue) {
        set(PROPERTY_MENU_FONT, newValue);
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
    
    /**
     * Sets the selection model to use.
     * 
     * @param newValue the new selection model
     */
    public void setSelectionModel(MenuSelectionModel newValue) {
        MenuSelectionModel oldValue = selectionModel;
        if (oldValue != null) {
            oldValue.removeChangeListener(changeListener);
        }
        selectionModel = newValue;
        if (newValue != null) {
            newValue.addChangeListener(changeListener);
        }
        firePropertyChange(SELECTION_MODEL_CHANGED_PROPERTY, oldValue, newValue);
    }
    
    /**
     * Sets the selection text that will be displayed when no item is selected.
     * 
     * @param newValue the new selection text
     */
    public void setSelectionText(String newValue) {
        set(PROPERTY_SELECTION_TEXT, newValue);
    }
    
    /**
     * Sets the width of the drop down menu.
     * 
     * @param newValue the new width
     */
    public void setWidth(Extent newValue) {
        set(PROPERTY_WIDTH, newValue);
    }
}
