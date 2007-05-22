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

package nextapp.echo.extras.webcontainer.service;

import nextapp.echo.app.ImageReference;
import nextapp.echo.app.ResourceImageReference;
import nextapp.echo.webcontainer.UserInstance;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.StreamImageService;

/**
 * Service for rendering default images used by <code>Group</code>s. 
 *
 * @author n.beekman
 */
public class GroupImageService extends StreamImageService {

    /** <code>Service</code> identifier. */
    private static final String SERVICE_ID = "EchoExtras.Group.Image"; 
    
    /** Singleton instance of this <code>Service</code>. */
    public static final GroupImageService INSTANCE = new GroupImageService();

    private static final String IMAGE_PREFIX = "/nextapp/echo/extras/webcontainer/resource/image/";
    private static final ImageReference DEFAULT_BORDER_TOP_LEFT = new ResourceImageReference(IMAGE_PREFIX + "GroupBorderTopLeft.png");
    private static final ImageReference DEFAULT_BORDER_TOP = new ResourceImageReference(IMAGE_PREFIX + "GroupBorderTop.png");
    private static final ImageReference DEFAULT_BORDER_TOP_RIGHT = new ResourceImageReference(IMAGE_PREFIX + "GroupBorderTopRight.png");
    private static final ImageReference DEFAULT_BORDER_LEFT = new ResourceImageReference(IMAGE_PREFIX + "GroupBorderLeft.png");
    private static final ImageReference DEFAULT_BORDER_RIGHT = new ResourceImageReference(IMAGE_PREFIX + "GroupBorderRight.png");
    private static final ImageReference DEFAULT_BORDER_BOTTOM_LEFT = new ResourceImageReference(IMAGE_PREFIX + "GroupBorderBottomLeft.png");
    private static final ImageReference DEFAULT_BORDER_BOTTOM = new ResourceImageReference(IMAGE_PREFIX + "GroupBorderBottom.png");
    private static final ImageReference DEFAULT_BORDER_BOTTOM_RIGHT = new ResourceImageReference(IMAGE_PREFIX + "GroupBorderBottomRight.png");
    
    private static final String IMAGE_ID_BORDER_TOP_LEFT = "border0";
    private static final String IMAGE_ID_BORDER_TOP = "border1";
    private static final String IMAGE_ID_BORDER_TOP_RIGHT = "border2";
    private static final String IMAGE_ID_BORDER_LEFT = "border3";
    private static final String IMAGE_ID_BORDER_RIGHT = "border4";
    private static final String IMAGE_ID_BORDER_BOTTOM_LEFT = "border5";
    private static final String IMAGE_ID_BORDER_BOTTOM = "border6";
    private static final String IMAGE_ID_BORDER_BOTTOM_RIGHT = "border7";

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
        if (IMAGE_ID_BORDER_TOP_LEFT.equals(imageId)) {
            return DEFAULT_BORDER_TOP_LEFT;
        } else if (IMAGE_ID_BORDER_TOP.equals(imageId)) {
            return DEFAULT_BORDER_TOP;
        } else if (IMAGE_ID_BORDER_TOP_RIGHT.equals(imageId)) {
            return DEFAULT_BORDER_TOP_RIGHT;
        } else if (IMAGE_ID_BORDER_LEFT.equals(imageId)) {
            return DEFAULT_BORDER_LEFT;
        } else if (IMAGE_ID_BORDER_RIGHT.equals(imageId)) {
            return DEFAULT_BORDER_RIGHT;
        } else if (IMAGE_ID_BORDER_BOTTOM_LEFT.equals(imageId)) {
            return DEFAULT_BORDER_BOTTOM_LEFT;
        } else if (IMAGE_ID_BORDER_BOTTOM.equals(imageId)) {
            return DEFAULT_BORDER_BOTTOM;
        } else if (IMAGE_ID_BORDER_BOTTOM_RIGHT.equals(imageId)) {
            return DEFAULT_BORDER_BOTTOM_RIGHT;
        } else {
            return null;
        }
    }
}