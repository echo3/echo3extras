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

import nextapp.echo.app.Color;
import nextapp.echo.app.Component;
import nextapp.echo.app.Extent;

/**
 * <code>ColorSelect</code>: an input component which displays a hue selector and an integrated value/saturation selector
 * to enable the selection of a 24-bit RGB color.  May not contain child components.
 */
public class ColorSelect extends Component {

    public static final String COLOR_CHANGED_PROPERTY = "color";
    
    public static final String PROPERTY_HUE_WIDTH = "hueWidth";
    public static final String PROPERTY_SATURATION_HEIGHT = "saturationHeight";
    public static final String PROPERTY_VALUE_WIDTH = "valueWidth";
    public static final String PROPERTY_DISPLAY_VALUE = "displayValue";
    
    private Color color;
    
    /**
     * Creates a new <code>ColorSelect</code> with an initially selected color
     * of <code>Color.WHITE</code>.
     */
    public ColorSelect() {
        this(Color.BLACK);
    }
    
    /**
     * Creates a new <code>ColorSelect</code> with the specified color 
     * initially selected.
     * 
     * @param color the initially selected color
     */
    public ColorSelect(Color color) {
        super();
        setColor(color);
    }
    
    /**
     * Retrieves the selected color.
     * 
     * @return the selected color
     */
    public Color getColor() {
        return color;
    }
    
    /**
     * Retrieves the width of the hue selector (the spectrum gradient drawn 
     * on the right side of the ColorSelector).  Note that the height of the 
     * hue selector is determined by the height of the value selector.
     * Values may only be specified in pixels.
     * The default value is 20 pixels. 
     * 
     * @return the width
     */
    public Extent getHueWidth() {
        return (Extent) get(PROPERTY_HUE_WIDTH);
    }
    
    /**
     * Retrieves the height of the saturation/value selector
     * (the saturation axis is vertical).
     * Values may only be specified in pixels.
     * The default value is 150 pixels. 
     * 
     * @return the height
     */
    public Extent getSaturationHeight() {
        return (Extent) get(PROPERTY_SATURATION_HEIGHT);
    }
    
    /**
     * Retrieves the width of the saturation/value selector
     * (the value axis is horizontal).
     * Values may only be specified in pixels.
     * The default value is 150 pixels.
     * 
     * @return the width
     */
    public Extent getValueWidth() {
        return (Extent) get(PROPERTY_VALUE_WIDTH);
    }
    
    /**
     * Sets whether the hex-triplet value, e.g., '#123abc' is displayed at
     * the bottom of the ColorSelect.  Default value is true.
     * 
     *   @return true if the hex-triplet value should be displayed
     */
    public boolean isDisplayValue() {
        Boolean value = (Boolean) get(PROPERTY_DISPLAY_VALUE);
        return value == null ? true : value.booleanValue();
    }
    
    /**
     * @see nextapp.echo.app.Component#processInput(java.lang.String, java.lang.Object)
     */
    public void processInput(String inputName, Object inputValue) {
        if (COLOR_CHANGED_PROPERTY.equals(inputName)) {
            setColor((Color) inputValue);
        }
    }

    /**
     * Sets the selected color.
     * 
     * @param newValue the new color
     */
    public void setColor(Color newValue) {
        if (newValue == null) {
            newValue = Color.WHITE;
        }
        Color oldValue = color;
        color = newValue;
        firePropertyChange(COLOR_CHANGED_PROPERTY, oldValue, newValue);
    }
    
    /**
     * Sets whether the hex-triplet value, e.g., '#123abc' is displayed at
     * the bottom of the ColorSelect.  Default value is true.  
     * 
     * @param newValue true if the hex-triplet value should be displayed
     */
    public void setDisplayValue(boolean newValue) {
        set(PROPERTY_DISPLAY_VALUE, new Boolean(newValue));
    }
    
    /**
     * Sets the width of the hue selector (the spectrum gradient drawn on the 
     * right side of the ColorSelector).  Note that the height of the hue
     * selector is determined by the height of the value selector.
     * Values may only be specified in pixels.
     * The default value is 20 pixels. 
     * 
     * @param newValue the new width
     */
    public void setHueWidth(Extent newValue) {
        set(PROPERTY_HUE_WIDTH, newValue);
    }
    
    /**
     * Sets the height of the saturation/value selector
     * (the saturation axis is vertical).
     * Values may only be specified in pixels.
     * The default value is 150 pixels. 
     * 
     * @param newValue the new height
     */
    public void setSaturationHeight(Extent newValue) {
        set(PROPERTY_SATURATION_HEIGHT, newValue);
    }
    
    /**
     * Sets the width of the saturation/value selector
     * (the value axis is horizontal).
     * Values may only be specified in pixels.
     * The default value is 150 pixels. 
     * 
     * @param newValue the new width
     */
    public void setValueWidth(Extent newValue) {
        set(PROPERTY_VALUE_WIDTH, newValue);
    }
}
