/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2007 NextApp, Inc.
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

package nextapp.echo.extras.webcontainer.service;

import nextapp.echo.app.ImageReference;
import nextapp.echo.app.ResourceImageReference;
import nextapp.echo.webcontainer.UserInstance;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.StreamImageService;

/**
 * Service for rendering default images used by <code>AbstractMenuComponent</code>s. 
 *
 * @author n.beekman
 */
public class MenuImageService extends StreamImageService {

    /** <code>Service</code> identifier. */
    private static final String SERVICE_ID = "EchoExtras.Menu.Image"; 
    
    /** Singleton instance of this <code>Service</code>. */
    public static final MenuImageService INSTANCE = new MenuImageService();

    private static final String IMAGE_PREFIX = "/nextapp/echo/extras/webcontainer/resource/image/";
    private static final ImageReference DEFAULT_ICON_SUBMENU_LEFT = new ResourceImageReference(IMAGE_PREFIX + "ArrowLeft.gif");
    private static final ImageReference DEFAULT_ICON_SUBMENU_RIGHT = new ResourceImageReference(IMAGE_PREFIX + "ArrowRight.gif");
    private static final ImageReference DEFAULT_ICON_TOGGLE_OFF = new ResourceImageReference(IMAGE_PREFIX + "ToggleOff.gif");
    private static final ImageReference DEFAULT_ICON_TOGGLE_ON = new ResourceImageReference(IMAGE_PREFIX + "ToggleOn.gif");
    private static final ImageReference DEFAULT_ICON_RADIO_OFF = new ResourceImageReference(IMAGE_PREFIX + "RadioOff.gif");
    private static final ImageReference DEFAULT_ICON_RADIO_ON = new ResourceImageReference(IMAGE_PREFIX + "RadioOn.gif");
    
    private static final String IMAGE_ID_SUBMENU_LEFT = "submenuLeft";
    private static final String IMAGE_ID_SUBMENU_RIGHT = "submenuRight";
    
    private static final String IMAGE_ID_TOGGLE_OFF = "toggleOff";
    private static final String IMAGE_ID_TOGGLE_ON = "toggleOn";
    private static final String IMAGE_ID_RADIO_OFF = "radioOff";
    private static final String IMAGE_ID_RADIO_ON = "radioOn";

    static {
        WebContainerServlet.getServiceRegistry().add(INSTANCE);
    }
    
    public static void install() {
        // Do nothing, simply ensure static directives are executed.
    }
    
    /**
     * @see nextapp.echo.webcontainer.Service#getId()
     */
    public String getId() {
        return SERVICE_ID;
    }

    /**
     * @see StreamImageService#getImage(UserInstance, String)
     */
    public ImageReference getImage(UserInstance userInstance, String imageId) {
        if (IMAGE_ID_SUBMENU_LEFT.equals(imageId)) {
            return DEFAULT_ICON_SUBMENU_LEFT;
        } else if (IMAGE_ID_SUBMENU_RIGHT.equals(imageId)) {
            return DEFAULT_ICON_SUBMENU_RIGHT;
        } else if (IMAGE_ID_TOGGLE_OFF.equals(imageId)) {
            return DEFAULT_ICON_TOGGLE_OFF;
        } else if (IMAGE_ID_TOGGLE_ON.equals(imageId)) {
            return DEFAULT_ICON_TOGGLE_ON;
        } else if (IMAGE_ID_RADIO_OFF.equals(imageId)) {
            return DEFAULT_ICON_RADIO_OFF;
        } else if (IMAGE_ID_RADIO_ON.equals(imageId)) {
            return DEFAULT_ICON_RADIO_ON;
        } else {
            return null;
        }
    }
}