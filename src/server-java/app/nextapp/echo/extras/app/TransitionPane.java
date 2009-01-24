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
import nextapp.echo.app.Pane;
import nextapp.echo.app.PaneContainer;

/**
 * TransitionPane component: a container pane which displays a single child pane or component, rendering an animated transition
 * effect when its content is changed (when the child is removed and a new one is added). May contain zero or one child components.
 * May contain <code>Pane</code> components as children.
 */
public class TransitionPane extends Component 
implements Pane, PaneContainer {

    /**
     * Transition setting indicating new content should immediately 
     * final int replace old content with no visual effect.
     */
    public static final int TYPE_IMMEDIATE_REPLACE = 0;
    
    /**
     * Transition setting describing a visual effect where the
     * viewing area pans to the left to realize the new content.
     * Old content exits to the right side of the screen.
     * New content enters from the left side of the screen. 
     */
    public static final int TYPE_CAMERA_PAN_LEFT = 1;

    /**
     * Transition setting describing a visual effect where the
     * viewing area pans to the right to realize the new content.
     * Old content exits to the left side of the screen.
     * New content enters from the right side of the screen. 
     */
    public static final int TYPE_CAMERA_PAN_RIGHT = 2;

    /**
     * Transition setting describing a visual effect where the
     * viewing area pans up to realize the new content.
     * Old content exits to the bottom of the screen.
     * New content enters from the top of the screen. 
     */
    public static final int TYPE_CAMERA_PAN_UP = 3;

    /**
     * Transition setting describing a visual effect where the
     * viewing area pans to up to realize the new content.
     * Old content exits to the top of the screen.
     * New content enters from the bottom of the screen. 
     */
    public static final int TYPE_CAMERA_PAN_DOWN = 4;
    
    /**
     * A horizontal blind effect with a black background.
     * Top of blinds rotate inward.
     */
    public static final int TYPE_BLIND_BLACK_IN = 5;
    
    /**
     * A horizontal blind effect with a black background.
     * Top of blinds rotate outward.
     */
    public static final int TYPE_BLIND_BLACK_OUT = 6;
    
    /**
     * Fades to black, fades in new content.
     */
    public static final int TYPE_FADE_TO_BLACK = 7;

    /**
     * Fades to white, fades in new content.
     */
    public static final int TYPE_FADE_TO_WHITE = 8;
    
    /**
     * Fades to new content over old content.
     */
    public static final int TYPE_FADE = 9;
    
    public static final String PROPERTY_TYPE = "type";
    public static final String PROPERTY_DURATION = "duration";

    /**
     * Default duration time, 350ms.
     */
    public static final int DEFAULT_DURATION = 350;
    
    /**
     * Returns the transition duration, in milliseconds.
     * 
     * @return the transition duration
     */
    public int getDuration() {
        Integer duration = (Integer) get(PROPERTY_DURATION);
        return duration == null ? DEFAULT_DURATION : duration.intValue();
    }
    
    /**
     * Sets the transition type.
     * 
     * @return the transition type
     */
    public int getType() {
        Integer type = (Integer) get(PROPERTY_TYPE);
        return type == null ? TYPE_IMMEDIATE_REPLACE : type.intValue();
    }
    
    /**
     * @see nextapp.echo.app.Component#isValidChild(nextapp.echo.app.Component)
     */
    public boolean isValidChild(Component c) {
        if (getComponentCount() > 0 && c != getComponent(0)) {
            return false;
        }
        return super.isValidChild(c);
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
     * Sets the transition duration, in milliseconds.
     * 
     * @param newValue the new transition duration
     */
    public void setDuration(int newValue) {
        set(PROPERTY_DURATION, new Integer(newValue));
    }
    
    /**
     * Sets the transition type.
     * 
     * @param newValue the new transition type 
     */
    public void setType(int newValue) {
        set(PROPERTY_TYPE, new Integer(newValue));
    }
}
