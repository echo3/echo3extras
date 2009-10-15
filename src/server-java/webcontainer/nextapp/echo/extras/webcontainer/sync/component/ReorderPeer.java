/*
 * This file is part of the Echo Extras Project. Copyright (C) 2005-2009 NextApp, Inc.
 * 
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 * 
 * The contents of this file are subject to the Mozilla Public License Version 1.1 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing rights and limitations under the License.
 * 
 * Alternatively, the contents of this file may be used under the terms of either the GNU General Public License Version 2 or later
 * (the "GPL"), or the GNU Lesser General Public License Version 2.1 or later (the "LGPL"), in which case the provisions of the GPL
 * or the LGPL are applicable instead of those above. If you wish to allow use of your version of this file only under the terms of
 * either the GPL or the LGPL, and not to allow others to use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice and other provisions required by the GPL or the LGPL.
 * If you do not delete the provisions above, a recipient may use your version of this file under the terms of any one of the MPL,
 * the GPL or the LGPL.
 */

package nextapp.echo.extras.webcontainer.sync.component;

import java.util.StringTokenizer;

import nextapp.echo.app.Component;
import nextapp.echo.app.update.ClientUpdateManager;
import nextapp.echo.app.util.Context;
import nextapp.echo.extras.app.Reorder;
import nextapp.echo.extras.webcontainer.CommonResources;
import nextapp.echo.extras.webcontainer.service.CommonService;
import nextapp.echo.webcontainer.AbstractComponentSynchronizePeer;
import nextapp.echo.webcontainer.ContentType;
import nextapp.echo.webcontainer.ResourceRegistry;
import nextapp.echo.webcontainer.ServerMessage;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.ServiceRegistry;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.JavaScriptService;

/**
 * Synchronization peer for <code>Reorder</code> components.
 */
public class ReorderPeer extends AbstractComponentSynchronizePeer {

    static final Service REORDER_SERVICE = JavaScriptService.forResources("EchoExtras.Reorder", new String[] {
            "nextapp/echo/extras/webcontainer/resource/Application.Reorder.js",
            "nextapp/echo/extras/webcontainer/resource/Sync.Reorder.js",
            "nextapp/echo/extras/webcontainer/resource/Sync.RemoteReorder.js" });

    static {
        CommonResources.install();
        ResourceRegistry resources = WebContainerServlet.getResourceRegistry();
        resources.add("Extras", "image/reorder/Icon32Move.png", ContentType.IMAGE_PNG);

        ServiceRegistry services = WebContainerServlet.getServiceRegistry();
        services.add(REORDER_SERVICE);
    }

    /**
     * Constructor.
     */
    public ReorderPeer() {
        super();
        addOutputProperty(Reorder.ORDER_CHANGED_PROPERTY);
    }

    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getClientComponentType(boolean)
     */
    public String getClientComponentType(boolean mode) {
        return "Extras.RemoteReorder";
    }

    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getComponentClass()
     */
    public Class getComponentClass() {
        return Reorder.class;
    }
    
    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getInputPropertyClass(java.lang.String)
     */
    public Class getInputPropertyClass(String propertyName) {
        if (Reorder.ORDER_CHANGED_PROPERTY.equals(propertyName)) {
            return String.class;
        }
        return null;
    }

    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getOutputProperty(nextapp.echo.app.util.Context,
     *      nextapp.echo.app.Component, java.lang.String, int)
     */
    public Object getOutputProperty(Context context, Component component, String propertyName, int propertyIndex) {
        if (Reorder.ORDER_CHANGED_PROPERTY.equals(propertyName)) {
            int[] order = ((Reorder) component).getOrder();
            if (order == null) {
                return null;
            }
            StringBuffer out = new StringBuffer();
            for (int i = 0; i < order.length; ++i) {
                if (i > 0) {
                    out.append(",");
                }
                out.append(order[i]);
            }
System.err.println("getOrder:" + out);            
            return out.toString();
        } else {
            return super.getOutputProperty(context, component, propertyName, propertyIndex);
        }
    }

    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getOutputPropertyMethodName(nextapp.echo.app.util.Context,
     *      nextapp.echo.app.Component, java.lang.String)
     */
    public String getOutputPropertyMethodName(Context context, Component component, String propertyName) {
        if (Reorder.ORDER_CHANGED_PROPERTY.equals(propertyName)) {
            return "loadOrder";
        } else {
            return super.getOutputPropertyMethodName(context, component, propertyName);
        }
    }

    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#init(nextapp.echo.app.util.Context, Component)
     */
    public void init(Context context, Component component) {
        super.init(context, component);
        ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
        serverMessage.addLibrary(CommonService.INSTANCE.getId());
        serverMessage.addLibrary(REORDER_SERVICE.getId());
    }

    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#storeInputProperty(Context, Component, String, int, Object)
     */
    public void storeInputProperty(Context context, Component component, String propertyName, int propertyIndex, Object newValue) {
        if (propertyName.equals(Reorder.ORDER_CHANGED_PROPERTY)) {
            ClientUpdateManager clientUpdateManager = (ClientUpdateManager) context.get(ClientUpdateManager.class);
            String orderString = (String) newValue;
            StringTokenizer st = new StringTokenizer(orderString, ",");
            int[] order = new int[component.getComponentCount()];
            int i = 0;
            while (st.hasMoreTokens() && i < order.length) {
                String s = st.nextToken();
                order[i] = Integer.parseInt(s);
                ++i;
            }
            clientUpdateManager.setComponentProperty(component, Reorder.ORDER_CHANGED_PROPERTY, order);
        }
    }
}
