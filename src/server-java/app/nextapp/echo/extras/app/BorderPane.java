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

import nextapp.echo.app.Component;
import nextapp.echo.app.FillImage;
import nextapp.echo.app.FillImageBorder;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Pane;
import nextapp.echo.app.PaneContainer;

/**
 * <code>BorderPane</code> component: a container which renders a <code>FillImageBorder</code> around its content. May contain only
 * one child. May contain a <code>Pane</code> component as a child.
 */
public class BorderPane extends Component 
implements Pane, PaneContainer {
    
    public static final String PROPERTY_BACKGROUND_IMAGE = "backgroundImage";
    public static final String PROPERTY_BORDER = "border";
    public static final String PROPERTY_INSETS = "insets";
    
    /**
     * Returns the background image.
     * 
     * @return the background image
     */
    public FillImage getBackgroundImage() {
        return (FillImage) get(PROPERTY_BACKGROUND_IMAGE);
    }
    
    /**
     * Returns the configured border.
     * 
     * @return the border
     */
    public FillImageBorder getBorder() {
        return (FillImageBorder) get(PROPERTY_BORDER);
    }
    
    /**
     * Returns the inset margin.
     * 
     * @return the inset margin
     */
    public Insets getInsets() {
        return (Insets) get(PROPERTY_INSETS);
    }
    
    /**
     * Sets the background image.
     * 
     * @param newValue the new background image
     */
    public void setBackgroundImage(FillImage newValue) {
        set(PROPERTY_BACKGROUND_IMAGE, newValue);
    }

    /**
     * Sets the border.
     * 
     * @param newValue the new border
     */
    public void setBorder(FillImageBorder newValue) {
        set(PROPERTY_BORDER, newValue);
    }
    
    /**
     * Sets the inset margin.
     * 
     * @param newValue the new inset margin
     */
    public void setInsets(Insets newValue) {
        set(PROPERTY_INSETS, newValue);
    }
    
    /**
     * @see nextapp.echo.app.Component#isValidChild(nextapp.echo.app.Component)
     */
    public boolean isValidChild(Component child) {
        if (!super.isValidChild(child)) {
            return false;
        }
        return getComponentCount() == 0 || indexOf(child) != -1;
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
}
