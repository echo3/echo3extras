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

package nextapp.echo.extras.webcontainer.sync.component;

import nextapp.echo.app.ImageReference;
import nextapp.echo.app.ResourceImageReference;
import nextapp.echo.app.util.Context;
import nextapp.echo.extras.app.Group;
import nextapp.echo.extras.webcontainer.service.CommonService;
import nextapp.echo.webcontainer.AbstractComponentSynchronizePeer;
import nextapp.echo.webcontainer.ServerMessage;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.ImageService;
import nextapp.echo.webcontainer.service.JavaScriptService;

/**
 * Synchronization peer for <code>Group</code>s.
 * 
 * @author n.beekman
 */
public class GroupPeer extends AbstractComponentSynchronizePeer {

    private static final String IMAGE_ID_PREFIX = "EchoExtras.Group.";
    
    private static final String IMAGE_ID_BORDER_TOP_LEFT = IMAGE_ID_PREFIX + "border0";
    private static final String IMAGE_ID_BORDER_TOP = IMAGE_ID_PREFIX + "border1";
    private static final String IMAGE_ID_BORDER_TOP_RIGHT = IMAGE_ID_PREFIX + "border2";
    private static final String IMAGE_ID_BORDER_LEFT = IMAGE_ID_PREFIX + "border3";
    private static final String IMAGE_ID_BORDER_RIGHT = IMAGE_ID_PREFIX + "border4";
    private static final String IMAGE_ID_BORDER_BOTTOM_LEFT = IMAGE_ID_PREFIX + "border5";
    private static final String IMAGE_ID_BORDER_BOTTOM = IMAGE_ID_PREFIX + "border6";
    private static final String IMAGE_ID_BORDER_BOTTOM_RIGHT = IMAGE_ID_PREFIX + "border7";
    
    private static final String IMAGE_PREFIX = "/nextapp/echo/extras/webcontainer/resource/image/";
    private static final ImageReference DEFAULT_BORDER_TOP_LEFT = new ResourceImageReference(IMAGE_PREFIX + "GroupBorderTopLeft.png");
    private static final ImageReference DEFAULT_BORDER_TOP = new ResourceImageReference(IMAGE_PREFIX + "GroupBorderTop.png");
    private static final ImageReference DEFAULT_BORDER_TOP_RIGHT = new ResourceImageReference(IMAGE_PREFIX + "GroupBorderTopRight.png");
    private static final ImageReference DEFAULT_BORDER_LEFT = new ResourceImageReference(IMAGE_PREFIX + "GroupBorderLeft.png");
    private static final ImageReference DEFAULT_BORDER_RIGHT = new ResourceImageReference(IMAGE_PREFIX + "GroupBorderRight.png");
    private static final ImageReference DEFAULT_BORDER_BOTTOM_LEFT = new ResourceImageReference(IMAGE_PREFIX + "GroupBorderBottomLeft.png");
    private static final ImageReference DEFAULT_BORDER_BOTTOM = new ResourceImageReference(IMAGE_PREFIX + "GroupBorderBottom.png");
    private static final ImageReference DEFAULT_BORDER_BOTTOM_RIGHT = new ResourceImageReference(IMAGE_PREFIX + "GroupBorderBottomRight.png");
    
    private static final Service GROUP_SERVICE = JavaScriptService.forResources("EchoExtras.Group", 
            new String[]{"/nextapp/echo/extras/webcontainer/resource/js/Application.Group.js",
            "/nextapp/echo/extras/webcontainer/resource/js/Render.Group.js"});
    
    static {
        ImageService.install();
        ImageService.addGlobalImage(IMAGE_ID_BORDER_TOP_LEFT, DEFAULT_BORDER_TOP_LEFT);
        ImageService.addGlobalImage(IMAGE_ID_BORDER_TOP, DEFAULT_BORDER_TOP);
        ImageService.addGlobalImage(IMAGE_ID_BORDER_TOP_RIGHT, DEFAULT_BORDER_TOP_RIGHT);
        ImageService.addGlobalImage(IMAGE_ID_BORDER_LEFT, DEFAULT_BORDER_LEFT);
        ImageService.addGlobalImage(IMAGE_ID_BORDER_RIGHT, DEFAULT_BORDER_RIGHT);
        ImageService.addGlobalImage(IMAGE_ID_BORDER_BOTTOM_LEFT, DEFAULT_BORDER_BOTTOM_LEFT);
        ImageService.addGlobalImage(IMAGE_ID_BORDER_BOTTOM, DEFAULT_BORDER_BOTTOM);
        ImageService.addGlobalImage(IMAGE_ID_BORDER_BOTTOM_RIGHT, DEFAULT_BORDER_BOTTOM_RIGHT);
        
        WebContainerServlet.getServiceRegistry().add(GROUP_SERVICE);
    }
    
    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getClientComponentType()
     */
    public String getClientComponentType() {
        return "ExtrasApp.Group";
    }
    
    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getComponentClass()
     */
    public Class getComponentClass() {
        return Group.class;
    }

    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#init(nextapp.echo.app.util.Context)
     */
    public void init(Context context) {
        super.init(context);
        ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
        serverMessage.addLibrary(CommonService.INSTANCE.getId());
        serverMessage.addLibrary(GROUP_SERVICE.getId());
    }
}