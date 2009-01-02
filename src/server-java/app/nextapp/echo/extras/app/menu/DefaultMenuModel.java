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

package nextapp.echo.extras.app.menu;

import java.util.ArrayList;
import java.util.List;

import nextapp.echo.app.ImageReference;

/**
 * Default <code>MenuModel</code> implementation.
 * Provides capabilities to add and remove menu items.
 */
public class DefaultMenuModel 
implements MenuModel {

    private List items = null;
    private String text;
    private ImageReference icon;
    private String id;
    
    /**
     * Creates a new <code>DefaultMenuModel</code>.
     */
    public DefaultMenuModel() {
        this(null, null, null);
    }
    
    /**
     * Creates a new <code>DefaultMenuModel</code> with the specified title 
     * text.
     * 
     * @param id the menu identifier
     * @param text the title text
     */
    public DefaultMenuModel(String id, String text) {
        this(id, text, null);
    }
    
    /**
     * Creates a new <code>DefaultMenuModel</code> with the specified title 
     * text and icon
     * 
     * @param id the menu identifier
     * @param text the title text
     * @param icon the title icon
     */
    public DefaultMenuModel(String id, String text, ImageReference icon) {
        super();
        this.id = id;
        this.text = text;
        this.icon = icon;
    }
    
    /**
     * Adds an <code>ItemModel</code> to the end of the menu.
     * 
     * @param item the <code>ItemModel</code> to add
     */
    public void addItem(ItemModel item) {
        addItem(item, -1);
    }
    
    /**
     * Adds an <code>ItemModel</code> to the menu at the specified index
     * 
     * @param item the <code>ItemModel</code> to add
     * @param index the index at which to insert it within the menu
     */
    public void addItem(ItemModel item, int index) {
        if (items == null) {
            items = new ArrayList();
        }
        if (index == -1) {
            items.add(item);
        } else {
            items.add(index, item);
        }
    }
    
    /**
     * @see nextapp.echo.extras.app.menu.MenuModel#getIcon()
     */
    public ImageReference getIcon() {
        return icon;
    }

    /**
     * @see nextapp.echo.extras.app.menu.ItemModel#getId()
     */
    public String getId() {
        return id;
    }

    /**
     * @see nextapp.echo.extras.app.menu.MenuModel#getItem(int)
     */
    public ItemModel getItem(int itemIndex) {
        return (ItemModel) items.get(itemIndex);
    }

    /**
     * @see nextapp.echo.extras.app.menu.MenuModel#getItemCount()
     */
    public int getItemCount() {
        return items == null ? 0 : items.size();
    }

    /**
     * @see nextapp.echo.extras.app.menu.MenuModel#getText()
     */
    public String getText() {
        return text;
    }
    
    /**
     * REmoves an <code>ItemModel</code> from the menu
     * 
     * @param item the <code>ItemModel</code> to remove
     */
    public void removeItem(ItemModel item) {
        if (items == null) {
            return;
        }
        items.remove(item);
    }
    
    /**
     * Sets the title icon of the menu
     * 
     * @param newValue the new title icon
     */
    public void setIcon(ImageReference newValue) {
        icon = newValue;
    }
    
    /**
     * Sets the title text of the menu
     * 
     * @param newValue the new title text
     */
    public void setText(String newValue) {
        text = newValue;
    }
}
