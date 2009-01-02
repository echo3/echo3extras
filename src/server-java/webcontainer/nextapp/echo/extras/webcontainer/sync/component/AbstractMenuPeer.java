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

package nextapp.echo.extras.webcontainer.sync.component;

import nextapp.echo.app.Component;
import nextapp.echo.app.serial.SerialContext;
import nextapp.echo.app.serial.SerialException;
import nextapp.echo.app.serial.SerialPropertyPeer;
import nextapp.echo.app.update.ClientUpdateManager;
import nextapp.echo.app.util.Context;
import nextapp.echo.extras.app.menu.AbstractMenuComponent;
import nextapp.echo.extras.app.menu.ItemModel;
import nextapp.echo.extras.app.menu.MenuModel;
import nextapp.echo.extras.app.menu.MenuStateModel;
import nextapp.echo.extras.app.menu.ToggleOptionModel;
import nextapp.echo.extras.app.serial.property.SerialPropertyPeerConstants;
import nextapp.echo.extras.webcontainer.CommonResources;
import nextapp.echo.extras.webcontainer.service.CommonService;
import nextapp.echo.webcontainer.AbstractComponentSynchronizePeer;
import nextapp.echo.webcontainer.ComponentSynchronizePeer;
import nextapp.echo.webcontainer.ContentType;
import nextapp.echo.webcontainer.ResourceRegistry;
import nextapp.echo.webcontainer.ServerMessage;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.JavaScriptService;

import org.w3c.dom.Element;

/**
 * Base synchronization peer for <code>AbstractMenuComponent</code>s.
 * 
 * @author n.beekman
 */
abstract class AbstractMenuPeer extends AbstractComponentSynchronizePeer {

    private static class RenderedMenuStateModel {
        
        private MenuModel menuModel;
        private MenuStateModel menuStateModel;
        
        RenderedMenuStateModel(MenuModel menuModel, MenuStateModel menuStateModel) {
            super();
            this.menuModel = menuModel;
            this.menuStateModel = menuStateModel;
        }

        MenuModel getMenuModel() {
            return menuModel;
        }

        MenuStateModel getMenuStateModel() {
            return menuStateModel;
        }
    }
    
    public static class RenderedMenuStateModelPropertyPeer 
    implements SerialPropertyPeer {

        /**
         * @see nextapp.echo.app.serial.SerialPropertyPeer#toProperty(Context,
         *      Class, org.w3c.dom.Element)
         */
        public Object toProperty(Context context, Class objectClass, Element propertyElement) 
        throws SerialException {
            throw new UnsupportedOperationException();
        }

        /**
         * @see nextapp.echo.app.serial.SerialPropertyPeer#toXml(nextapp.echo.app.util.Context,
         *      java.lang.Class, org.w3c.dom.Element, java.lang.Object)
         */
        public void toXml(Context context, Class objectClass, Element propertyElement, Object propertyValue) {
            RenderedMenuStateModel menuData = (RenderedMenuStateModel) propertyValue;
            propertyElement.setAttribute("t", SerialPropertyPeerConstants.PROPERTY_TYPE_PREFIX + "MenuStateModel");
            
            SerialContext serialContext = (SerialContext) context.get(SerialContext.class);
            writeMenuModel(serialContext, propertyElement, menuData.getMenuModel(), menuData.getMenuStateModel());
        }
        
        private void writeMenuModel(SerialContext serialContext, Element propertyElement, ItemModel itemModel, 
                MenuStateModel menuStateModel) {
            String id = itemModel.getId();
            if (id != null) {
                Element itemElement = serialContext.getDocument().createElement("i");
                itemElement.setAttribute("id", id);
                if (!menuStateModel.isEnabled(id)) {
                    itemElement.setAttribute("enabled", "false");
                }
                if (itemModel instanceof ToggleOptionModel && menuStateModel.isSelected(id)) {
                    itemElement.setAttribute("selected", "true");
                }
                if (itemElement.getAttributes().getLength() > 1) {
                    propertyElement.appendChild(itemElement);
                }
            }
            if (itemModel instanceof MenuModel) {
                MenuModel menuModel = (MenuModel)itemModel;
                int size = menuModel.getItemCount();
                for (int i = 0; i < size; ++i) {
                    writeMenuModel(serialContext, propertyElement, menuModel.getItem(i), menuStateModel);
                }
            }
        }
    }

    private static final Service MENU_SERVICE = JavaScriptService.forResources("EchoExtras.Menu", 
            new String[] {  "nextapp/echo/extras/webcontainer/resource/Application.Menu.js",  
                            "nextapp/echo/extras/webcontainer/resource/Serial.Menu.js",
                            "nextapp/echo/extras/webcontainer/resource/Sync.Menu.js"});
    
    static {
        WebContainerServlet.getServiceRegistry().add(MENU_SERVICE);
        CommonResources.install();
        ResourceRegistry resources = WebContainerServlet.getResourceRegistry();
        resources.add("Extras", "image/menu/ArrowDown.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/menu/ArrowLeft.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/menu/ArrowRight.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/menu/ToggleOff.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/menu/ToggleOn.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/menu/RadioOff.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/menu/RadioOn.gif", ContentType.IMAGE_GIF);
    }
    
    public AbstractMenuPeer() {
        super();
        addOutputProperty(AbstractMenuComponent.STATE_MODEL_CHANGED_PROPERTY);
        addOutputProperty(AbstractMenuComponent.MODEL_CHANGED_PROPERTY);
        
        addEvent(new AbstractComponentSynchronizePeer.EventPeer(AbstractMenuComponent.INPUT_ACTION, 
                AbstractMenuComponent.ACTION_LISTENERS_CHANGED_PROPERTY) {
            
            /**
             * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer.EventPeer#hasListeners(
             *      nextapp.echo.app.util.Context, nextapp.echo.app.Component)
             */
            public boolean hasListeners(Context context, Component component) {
                return ((AbstractMenuComponent) component).hasActionListeners();
            }
            
            /**
             * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer.EventPeer#processEvent(
             *      nextapp.echo.app.util.Context, nextapp.echo.app.Component, java.lang.Object)
             */
            public void processEvent(Context context, Component component, Object eventData) {
                AbstractMenuComponent menuComponent = (AbstractMenuComponent) component;
                ClientUpdateManager clientUpdateManager = (ClientUpdateManager) context.get(ClientUpdateManager.class);
                clientUpdateManager.setComponentAction(menuComponent, AbstractMenuComponent.INPUT_ACTION, 
                        getItemModel(menuComponent, (String) eventData));
            }
        });
    }
    
    /**
     * @see ComponentSynchronizePeer#getEventDataClass(String)
     */
    public Class getEventDataClass(String eventType) {
        if (AbstractMenuComponent.INPUT_ACTION.equals(eventType)) {
            return String.class;
        } else {
            return super.getEventDataClass(eventType);
        }
    }

    protected ItemModel getItemModel(AbstractMenuComponent menu, String itemPath) {
        ItemModel itemModel = menu.getModel();
        String[] tokens = itemPath.split("\\.");
        for (int i = 0; i < tokens.length; i++) {
            int index = Integer.parseInt(tokens[i]);
            itemModel = ((MenuModel)itemModel).getItem(index);
        }
        return itemModel;
    }

    protected ItemModel getItemModelById(AbstractMenuComponent menu, String id) {
        return getItemModelById(menu.getModel(), id);
    }
    
    protected ItemModel getItemModelById(MenuModel menuModel, String id) {
        int size = menuModel.getItemCount();
        for (int i = 0; i < size; ++i) {
            ItemModel itemModel = menuModel.getItem(i);
            if (id.equals(itemModel.getId())) {
                return itemModel;
            }
            if (itemModel instanceof MenuModel) {
                itemModel = getItemModelById((MenuModel) itemModel, id);
                if (itemModel != null) {
                    return itemModel;
                }
            }
        }
        return null;
    }
    
    protected String getItemPath(MenuModel menuModel, ItemModel targetItemModel) {
        StringBuffer out = new StringBuffer();
        getItemPath(menuModel, targetItemModel, out);
        return out.length() == 0 ? null : out.toString();
    }
    
    private void getItemPath(MenuModel menuModel, ItemModel targetItemModel, StringBuffer out) {
        int itemCount = menuModel.getItemCount();
        for (int i = 0; i < itemCount; ++i) {
            ItemModel currentItemModel = menuModel.getItem(i);
            if (targetItemModel.equals(currentItemModel)) {
                out.append(i);
                return;
            }
            if (currentItemModel instanceof MenuModel) {
                getItemPath((MenuModel) currentItemModel, targetItemModel, out); 
            }
            if (out.length() != 0) {
                out.insert(0, i + ".");
                return;
            }
        }
    }
    
    /**
     * @see ComponentSynchronizePeer#getOutputProperty(Context, Component, String, int)
     */
    public Object getOutputProperty(Context context, Component component, String propertyName, int propertyIndex) {
        AbstractMenuComponent menu = (AbstractMenuComponent)component;
        if (AbstractMenuComponent.MODEL_CHANGED_PROPERTY.equals(propertyName)) {
            return menu.getModel();
        } else if (AbstractMenuComponent.STATE_MODEL_CHANGED_PROPERTY.equals(propertyName)) {
            return new RenderedMenuStateModel(menu.getModel(), menu.getStateModel());
        }
        return super.getOutputProperty(context, component, propertyName, propertyIndex);
    }

    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#init(nextapp.echo.app.util.Context, Component)
     */
    public void init(Context context, Component component) {
        super.init(context, component);
        ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
        serverMessage.addLibrary(CommonService.INSTANCE.getId());
        serverMessage.addLibrary(MENU_SERVICE.getId());
    }
}