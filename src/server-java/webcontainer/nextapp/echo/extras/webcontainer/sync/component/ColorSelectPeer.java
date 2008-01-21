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

import nextapp.echo.app.Color;
import nextapp.echo.app.Component;
import nextapp.echo.app.update.ClientUpdateManager;
import nextapp.echo.app.util.Context;
import nextapp.echo.extras.app.ColorSelect;
import nextapp.echo.extras.webcontainer.service.CommonService;
import nextapp.echo.webcontainer.AbstractComponentSynchronizePeer;
import nextapp.echo.webcontainer.ServerMessage;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.ServiceRegistry;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.JavaScriptService;
import nextapp.echo.webcontainer.service.StaticBinaryService;

/**
 * Synchronization peer for <code>ColorSelect</code>s.
 */
public class ColorSelectPeer extends AbstractComponentSynchronizePeer {

    private static final String IMAGE_RESOURCE_PATH = "/nextapp/echo/extras/webcontainer/resource/image/";

    private static final Service ARROW_DOWN_IMAGE_SERVICE = StaticBinaryService.forResource(
            "EchoExtras.ColorSelect.ArrowDown", "image/gif", IMAGE_RESOURCE_PATH + "ColorSelectArrowDown.gif");
    private static final Service ARROW_LEFT_IMAGE_SERVICE = StaticBinaryService.forResource(
            "EchoExtras.ColorSelect.ArrowLeft", "image/gif", IMAGE_RESOURCE_PATH + "ColorSelectArrowLeft.gif");
    private static final Service ARROW_RIGHT_IMAGE_SERVICE = StaticBinaryService.forResource(
            "EchoExtras.ColorSelect.ArrowRight", "image/gif", IMAGE_RESOURCE_PATH + "ColorSelectArrowRight.gif");
    private static final Service ARROW_UP_IMAGE_SERVICE = StaticBinaryService.forResource(
            "EchoExtras.ColorSelect.ArrowUp", "image/gif", IMAGE_RESOURCE_PATH + "ColorSelectArrowUp.gif");
    private static final Service H_GRADIENT_IMAGE_SERVICE = StaticBinaryService.forResource(
            "EchoExtras.ColorSelect.HGradient", "image/png", IMAGE_RESOURCE_PATH + "ColorSelectHGradient.png");
    private static final Service SV_GRADIENT_IMAGE_SERVICE = StaticBinaryService.forResource(
            "EchoExtras.ColorSelect.SVGradient", "image/png", IMAGE_RESOURCE_PATH + "ColorSelectSVGradient.png");

    private static final Service COLOR_SELECT_SERVICE = JavaScriptService.forResources("EchoExtras.ColorSelect",
            new String[] {  "/nextapp/echo/extras/webcontainer/resource/js/Application.ColorSelect.js",  
                            "/nextapp/echo/extras/webcontainer/resource/js/Render.ColorSelect.js"});

    static {
        ServiceRegistry services = WebContainerServlet.getServiceRegistry();
        services.add(COLOR_SELECT_SERVICE);
        services.add(ARROW_DOWN_IMAGE_SERVICE);
        services.add(ARROW_LEFT_IMAGE_SERVICE);
        services.add(ARROW_RIGHT_IMAGE_SERVICE);
        services.add(ARROW_UP_IMAGE_SERVICE);
        services.add(H_GRADIENT_IMAGE_SERVICE);
        services.add(SV_GRADIENT_IMAGE_SERVICE);
    }

    public ColorSelectPeer() {
        super();
        addOutputProperty(ColorSelect.COLOR_CHANGED_PROPERTY);
    }
    
    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getClientComponentType(boolean)
     */
    public String getClientComponentType(boolean shortType) {
        return "ExtrasApp.ColorSelect";
    }

    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getComponentClass()
     */
    public Class getComponentClass() {
        return ColorSelect.class;
    }

    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getInputPropertyClass(java.lang.String)
     */
    public Class getInputPropertyClass(String propertyName) {
        if (ColorSelect.COLOR_CHANGED_PROPERTY.equals(propertyName)) {
            return Color.class;
        }
        return null;
    }

    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getOutputProperty(
     *      nextapp.echo.app.util.Context, nextapp.echo.app.Component, java.lang.String, int)
     */
    public Object getOutputProperty(Context context, Component component, String propertyName, int propertyIndex) {
        if (propertyName.equals(ColorSelect.COLOR_CHANGED_PROPERTY)) {
            ColorSelect colorSelect = (ColorSelect) component;
            return colorSelect.getColor();
        } else {
            return super.getOutputProperty(context, component, propertyName, propertyIndex);
        }
    }
    
    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#init(nextapp.echo.app.util.Context)
     */
    public void init(Context context) {
        super.init(context);
        ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
        serverMessage.addLibrary(CommonService.INSTANCE.getId());
        serverMessage.addLibrary(COLOR_SELECT_SERVICE.getId());
    }

    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#storeInputProperty(Context, Component, String, int, Object)
     */
    public void storeInputProperty(Context context, Component component, String propertyName, int propertyIndex, Object newValue) {
        if (propertyName.equals(ColorSelect.COLOR_CHANGED_PROPERTY)) {
            ClientUpdateManager clientUpdateManager = (ClientUpdateManager) context.get(ClientUpdateManager.class);
            clientUpdateManager.setComponentProperty(component, ColorSelect.COLOR_CHANGED_PROPERTY, newValue);
        }
    }
}
