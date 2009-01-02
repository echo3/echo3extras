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
import nextapp.echo.extras.app.menu.AbstractMenuComponent;
import nextapp.echo.extras.app.menu.MenuModel;
import nextapp.echo.extras.app.menu.MenuStateModel;

/**
 * A component that shows a menu when right-clicked, i.e. a context menu. This
 * component supports at most one child which, when present, will be used as
 * visible content. The component itself will not be visible.
 * 
 * @author n.beekman
 */
public class ContextMenu extends AbstractMenuComponent {
    
    public static final int ACTIVATION_MODE_CLICK = 1;
    public static final int ACTIVATION_MODE_CONTEXT_CLICK = 2;
    
    public static final String PROPERTY_ACTIVATION_MODE = "activationMode";
    public static final String PROPERTY_BACKGROUND_IMAGE = "backgroundImage";
    public static final String PROPERTY_BORDER = "border";
    public static final String PROPERTY_DISABLED_BACKGROUND = "disabledBackground";
    public static final String PROPERTY_DISABLED_BACKGROUND_IMAGE = "disabledBackgroundImage";
    public static final String PROPERTY_DISABLED_FOREGROUND = "disabledForeground";
    public static final String PROPERTY_MENU_EXPAND_ICON = "menuExpandIcon";
    public static final String PROPERTY_SELECTION_BACKGROUND = "selectionBackground";
    public static final String PROPERTY_SELECTION_BACKGROUND_IMAGE = "selectionBackgroundImage";
    public static final String PROPERTY_SELECTION_FOREGROUND = "selectionForeground";
    
    /**
     * Creates a new <code>ContextMenu</code>  with an empty
     * <code>DefaultMenuModel</code> as its model and a
     * <code>DefaultMenuStateModel</code> to provide state information.
     */
    public ContextMenu() {
        this(null, null, null);
    }
    
    /**
     * Creates a new <code>ContextMenu</code> with an empty
     * <code>DefaultMenuModel</code> as its model and a
     * <code>DefaultMenuStateModel</code> to provide state information.
     * 
     * @param applyTo the component to apply the context menu to
     */
    public ContextMenu(Component applyTo) {
        this(applyTo, null, null);
    }
    
    /**
     * Creates a new <code>ContextMenu</code> displaying the specified 
     * <code>MenuModel</code> and using a 
     * <code>DefaultMenuStateModel</code> to provide state information.
     * 
     * @param applyTo the component to apply the context menu to
     * @param model the model
     */
    public ContextMenu(Component applyTo, MenuModel model) {
        this(applyTo, model, null);
    }
    
    /**
     * Creates a new <code>ContextMenu</code> displaying the specified 
     * <code>MenuModel</code> and using the specified 
     * <code>MenuStateModel</code> to provide state information.
     * 
     * @param applyTo the component to apply the context menu to
     * @param model the model
     * @param stateModel the selection model
     */
    public ContextMenu(Component applyTo, MenuModel model, MenuStateModel stateModel) {
        super(model, stateModel);
        
        if (applyTo != null) {
            add(applyTo);
        }
    }

    /**
     * Returns the activation mode of the context menu.
     * 
     * @return the activation mode of the context menu, one of the following values:
     *         <ul>
     *          <li><code>ACTIVATION_MODE_CONTEXT_CLICK</code></li> - context menu activates on context click (the default)</li>
     *          <li><code>ACTIVATION_MODE_CLICK</code></li> - context menu activates on primary click
     *         </ul>
     */
    public int getActivationMode() {
        Integer mode = (Integer) get(PROPERTY_ACTIVATION_MODE);
        return mode == null ? ACTIVATION_MODE_CONTEXT_CLICK : mode.intValue();
    }
    
    /**
     * @return the Component which the context menu is being applied to.
     */
    public Component getApplyTo() {
        if (getComponentCount() == 0) {
            return null;
        }
        return getComponent(0);
    }
    
    /**
     * Returns the background image that will be displayed in pull-down menus.
     * 
     * @return the default background image
     */
    public FillImage getBackgroundImage() {
        return (FillImage) get(PROPERTY_BACKGROUND_IMAGE);
    }
    
    /**
     * Returns the border that will be displayed around pull-down menus.
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
     * Returns the icon used to expand pull-down menus.
     * 
     * @return the menu expand icon
     */
    public ImageReference getMenuExpandIcon() {
        return (ImageReference) get(PROPERTY_MENU_EXPAND_ICON);
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
     * Sets the component to apply the context menu to.
     * 
     * @param applyTo the Component
     */
    public void setApplyTo(Component applyTo) {
        removeAll();
        if (applyTo != null) {
            add(applyTo);
        }
    }
    
    /**
     * Sets the activation mode of the context menu.
     * 
     * @param newValue the new activation mode of the context menu, one of the following values:
     *        <ul>
     *         <li><code>ACTIVATION_MODE_CONTEXT_CLICK</code></li> - context menu activates on context click (the default)</li>
     *         <li><code>ACTIVATION_MODE_CLICK</code></li> - context menu activates on primary click
     *        </ul>
     */
    public void setActivationMode(int newValue) {
        set(PROPERTY_ACTIVATION_MODE, new Integer(newValue));
    }
    
    /**
     * Sets the background image that will be displayed in pull-down menus.
     * 
     * @param newValue the new background image
     */
    public void setBackgroundImage(FillImage newValue) {
        set(PROPERTY_BACKGROUND_IMAGE, newValue);
    }
    
    /**
     * Sets the border that will be displayed around pull-down menus.
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
     * Sets the icon used to expand pull-down menus.
     * 
     * @param newValue the new menu expand icon
     */
    public void setMenuExpandIcon(ImageReference newValue) {
        set(PROPERTY_MENU_EXPAND_ICON, newValue);
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
     * @see nextapp.echo.app.Component#isValidChild(Component)
     */
    public boolean isValidChild(Component child) {
        return getComponentCount() == 0 || indexOf(child) != -1;
    }
}
