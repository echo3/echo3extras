/* 
 * This file is part of the Echo Extras Project.
 * Copyright (C) 2005-2007 NextApp, Inc.
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

import nextapp.echo.app.Component;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Font;
import nextapp.echo.app.ImageReference;
import nextapp.echo.app.Insets;

/**
 * A container which renders a border consisting of images around its
 * content. Optionally draws a title in the top border.
 * 
 * @author n.beekman
 */
public class Group extends Component {

    public static final int TOP_LEFT = 0;
    public static final int TOP = 1;
    public static final int TOP_RIGHT = 2;
    public static final int LEFT = 3;
    public static final int RIGHT = 4;
    public static final int BOTTOM_LEFT = 5;
    public static final int BOTTOM = 6;
    public static final int BOTTOM_RIGHT = 7;
    
    public static final String PROPERTY_BORDER_IMAGE = "borderImage";
    public static final String PROPERTY_BORDER_INSETS = "borderInsets";
    public static final String PROPERTY_INSETS = "insets";
    public static final String PROPERTY_TITLE = "title";
    public static final String PROPERTY_TITLE_BACKGROUND_IMAGE = "titleBackgroundImage";
    public static final String PROPERTY_TITLE_FONT = "titleFont";
    public static final String PROPERTY_TITLE_INSETS = "titleInsets";
    public static final String PROPERTY_TITLE_POSITION = "titlePosition";

    /**
     * Returns the configured border image.
     * 
     * @param position the position of the image
     * @return the border image
     */
    public ImageReference getBorderImage(int position) {
        return (ImageReference) getIndexedProperty(PROPERTY_BORDER_IMAGE, position);
    }
    
    /**
     * Returns the border inset.
     * 
     * @see #setBorderInsets(nextapp.echo.app.Insets)
     * @return the border inset
     */
    public Insets getBorderInsets() {
        return (Insets) getProperty(PROPERTY_BORDER_INSETS);
    }
    
    /**
     * Returns the inset margin.
     * 
     * @return the inset margin
     */
    public Insets getInsets() {
        return (Insets) getProperty(PROPERTY_INSETS);
    }
    
    /**
     * Gets the title.
     * 
     * @return the title.
     */
    public String getTitle() {
        return (String) getProperty(PROPERTY_TITLE);
    }
    
    /**
     * Gets the background image for the title.
     * 
     * @return the title background image.
     */
    public ImageReference getTitleBackgroundImage() {
        return (ImageReference) getProperty(PROPERTY_TITLE_BACKGROUND_IMAGE);
    }
    
    /**
     * Gets the font for the title.
     * 
     * @return the title font.
     */
    public Font getTitleFont() {
        return (Font) getProperty(PROPERTY_TITLE_FONT);
    }
    
    /**
     * Gets the insets for the title.
     * 
     * @return the title insets.
     */
    public Insets getTitleInsets() {
        return (Insets) getProperty(PROPERTY_TITLE_INSETS);
    }
    
    /**
     * Gets the title position.
     * 
     * @return the title position.
     */
    public Extent getTitlePosition() {
        return (Extent) getProperty(PROPERTY_TITLE_POSITION);
    }
    
    /**
     * Sets the border.
     * 
     * @param newValue the new border
     */
    public void setBorderImage(int position, ImageReference newValue) {
        setIndexedProperty(PROPERTY_BORDER_IMAGE, position, newValue);
    }
    
    /**
     * Sets the inset of the border images, thus defining the width and 
     * height of the border images.
     * The provided <code>Insets</code> value must only contain margins defined
     * in pixel units.
     * 
     * @param borderInsets the new border inset
     */
    public void setBorderInsets(Insets borderInsets) {
       setProperty(PROPERTY_BORDER_INSETS, borderInsets);
    }
    
    /**
     * Sets the inset margin.
     * 
     * @param newValue the new inset margin
     */
    public void setInsets(Insets newValue) {
        setProperty(PROPERTY_INSETS, newValue);
    }
    
    /**
     * Sets the title.
     * 
     * @param title the title
     */
    public void setTitle(String title) {
        setProperty(PROPERTY_TITLE, title);
    }
    
    /**
     * Sets the background image to use for the title.
     * 
     * @param titleBackgroundImage the background image
     */
    public void setTitleBackgroundImage(ImageReference titleBackgroundImage) {
        setProperty(PROPERTY_TITLE_BACKGROUND_IMAGE, titleBackgroundImage);
    }
    
    /**
     * Sets the font to use for the title.
     * 
     * @param titleFont the title font
     */
    public void setTitleFont(Font titleFont) {
        setProperty(PROPERTY_TITLE_FONT, titleFont);
    }
    
    /**
     * Sets the insets to use for the title.
     * 
     * @param titleInsets the title insets
     */
    public void setTitleInsets(Insets titleInsets) {
        setProperty(PROPERTY_TITLE_INSETS, titleInsets);
    }
    
    /**
     * Sets the title position.
     * 
     * @param titlePosition the title position
     */
    public void setTitlePosition(Extent titlePosition) {
        setProperty(PROPERTY_TITLE_POSITION, titlePosition);
    }
}