/* 
 * This file is part of the Echo Extras Project.
 * Copyright (C) 2005-2010 NextApp, Inc.
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
import nextapp.echo.extras.app.viewer.Viewer;

/**
 * Viewer component which displays items in a vertically scrollable list.
 */
public class ListViewer extends Viewer {

    public static final String PROPERTY_COLUMN_WIDTH = "columnWidth";
    public static final String PROPERTY_COLUMN_NAME = "columnName";
    public static final String PROPERTY_BORDER = "border";
    
    public static final String PROPERTY_HEADER_BACKGROUND = "headerBackground";
    public static final String PROPERTY_HEADER_FOREGROUND = "headerForeground";

    /**
     * Returns the the cell border.  A multi-sided border may be used, e.g., if a single pixel wide border is desired between
     * cells, or if only horizontal or vertical borders are desired.
     * 
     * @return the cell border
     */
    public Border getBorder() {
        return (Border) get(PROPERTY_BORDER);
    }
    
    /**
     * Returns the name of the specified column.
     * 
     * @param columnIndex the column index
     * @return the name
     */
    public String getColumnName(int columnIndex) {
        return (String) getIndex(PROPERTY_COLUMN_NAME, columnIndex);
    }
    
    /**
     * Returns the width of the specified column.
     * This property supports <code>Extent</code>s with
     * fixed or percentile units.
     * 
     * @param columnIndex the column index
     * @return the width
     */
    public Extent getColumnWidth(int columnIndex) {
        return (Extent) getIndex(PROPERTY_COLUMN_WIDTH, columnIndex);
    }

    /**
     * Returns the background color of the list header row.
     * 
     * @return the color
     */
    public Color getHeaderBackground() {
        return (Color) get(PROPERTY_HEADER_BACKGROUND);
    }
    
    /**
     * Returns the foreground color of the list header row.
     * 
     * @return the color
     */
    public Color getHeaderForeground() {
        return (Color) get(PROPERTY_HEADER_FOREGROUND);
    }
    
    /**
     * Sets the the cell border.  A multi-sided border may be used, e.g., if a single pixel wide border is desired between
     * cells, or if only horizontal or vertical borders are desired.
     * 
     * @param newValue the new cell border
     */
    public void setBorder(Border newValue) {
        set(PROPERTY_BORDER, newValue);
    }
    
    /**
     * Sets the name of the specified column.
     * 
     * @param columnIndex the column index
     * @param newValue the new name
     */
    public void setColumnName(int columnIndex, String newValue) {
        setIndex(PROPERTY_COLUMN_NAME, columnIndex, newValue);
    }
    
    /**
     * Sets the width of the specified column.
     * This property supports <code>Extent</code>s with
     * fixed or percentile units.
     * 
     * @param columnIndex the column index
     * @param newValue the new width
     */
    public void setColumnWidth(int columnIndex, Extent newValue) {
        setIndex(PROPERTY_COLUMN_WIDTH, columnIndex, newValue);
    }

    /**
     * Sets the background color of the list header row.
     * 
     * @param newValue the new color
     */
    public void setHeaderBackground(Color newValue) {
        set(PROPERTY_HEADER_BACKGROUND, newValue);
    }
    
    /**
     * Sets the foreground color of the list header row.
     * 
     * @param newValue the new color
     */
    public void setHeaderForeground(Color newValue) {
        set(PROPERTY_HEADER_FOREGROUND, newValue);
    }
}
