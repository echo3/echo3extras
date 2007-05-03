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

import java.util.Iterator;

import nextapp.echo.app.Component;
import nextapp.echo.app.util.Context;
import nextapp.echo.extras.app.menu.AbstractMenuComponent;
import nextapp.echo.extras.app.menu.ItemModel;
import nextapp.echo.extras.app.menu.MenuModel;
import nextapp.echo.extras.webcontainer.service.CommonService;
import nextapp.echo.webcontainer.AbstractComponentSynchronizePeer;
import nextapp.echo.webcontainer.ComponentSynchronizePeer;
import nextapp.echo.webcontainer.ServerMessage;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.JavaScriptService;
import nextapp.echo.webcontainer.service.TransparentImageService;
import nextapp.echo.webcontainer.util.ArrayIterator;

/**
 * Base synchronization peer for <code>AbstractMenuComponent</code>s.
 * 
 * @author n.beekman
 */
abstract class AbstractMenuPeer extends AbstractComponentSynchronizePeer {

    private static final Service MENU_SERVICE = JavaScriptService.forResources("EchoExtras.Menu", 
            new String[] {  "/nextapp/echo/extras/webcontainer/resource/js/Application.Menu.js",  
                            "/nextapp/echo/extras/webcontainer/resource/js/Serial.Menu.js",
                            "/nextapp/echo/extras/webcontainer/resource/js/Render.Menu.js"});
    
    private static final String[] EVENT_TYPES_ACTION = new String[] { AbstractMenuComponent.INPUT_SELECT };
    
    private static final String PROPERTY_MODEL = "model";
    private static final String PROPERTY_STATE_MODEL = "stateModel";
    
    static {
        TransparentImageService.install();
        
        WebContainerServlet.getServiceRegistry().add(MENU_SERVICE);
    }
    
    public AbstractMenuPeer() {
        addOutputProperty(PROPERTY_MODEL);
        addOutputProperty(PROPERTY_STATE_MODEL);
    }
    
    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getImmediateEventTypes(Context, nextapp.echo.app.Component)
     */
    public Iterator getImmediateEventTypes(Context context, Component component) {
        AbstractMenuComponent menu = (AbstractMenuComponent)component;
        if (menu.hasActionListeners()) {
            return new ArrayIterator(EVENT_TYPES_ACTION);
        }
        return super.getImmediateEventTypes(context, component);
    }

    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#init(nextapp.echo.app.util.Context)
     */
    public void init(Context context) {
        ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
        serverMessage.addLibrary(CommonService.INSTANCE.getId());
        serverMessage.addLibrary(MENU_SERVICE.getId());
    }
    
    /**
     * @see ComponentSynchronizePeer#getPropertyClass(String)
     */
    public Class getPropertyClass(String propertyName) {
//        if (PROPERTY_SELECTION.equals(propertyName)) {
//            return String.class;
//        }
        return super.getPropertyClass(propertyName);
    }
    
    /**
     * @see ComponentSynchronizePeer#getOutputProperty(Context, Component, String, int)
     */
    public Object getOutputProperty(Context context, Component component, String propertyName, int propertyIndex) {
        AbstractMenuComponent menu = (AbstractMenuComponent)component;
        if (PROPERTY_MODEL.equals(propertyName)) {
            return menu.getModel();
        } else if (PROPERTY_STATE_MODEL.equals(propertyName)) {
            return menu.getStateModel();
        }
        return super.getOutputProperty(context, component, propertyName, propertyIndex);
    }
    
    /**
     * @see ComponentSynchronizePeer#storeInputProperty(Context, Component, String, int, Object)
     */
    public void storeInputProperty(Context context, Component component, String propertyName, int index, Object newValue) {
        super.storeInputProperty(context, component, propertyName, index, newValue);
        // FIXME
    }

    ItemModel getItemModel(AbstractMenuComponent menu, String itemPath) {
        ItemModel itemModel = menu.getModel();
        String[] tokens = itemPath.split(".");
        for (int i = 0; i < tokens.length; i++) {
            int index = Integer.parseInt(tokens[i]);
            itemModel = ((MenuModel)itemModel).getItem(index);
        }
        return itemModel;
    }
}