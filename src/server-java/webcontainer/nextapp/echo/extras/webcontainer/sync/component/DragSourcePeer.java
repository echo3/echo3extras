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

import java.util.Iterator;

import nextapp.echo.app.Component;
import nextapp.echo.app.update.ClientUpdateManager;
import nextapp.echo.app.util.Context;
import nextapp.echo.extras.app.DragSource;
import nextapp.echo.extras.webcontainer.service.CommonService;
import nextapp.echo.webcontainer.AbstractComponentSynchronizePeer;
import nextapp.echo.webcontainer.ServerMessage;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.UserInstance;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.JavaScriptService;

/**
 * Synchronization peer for <code>DragSource</code>es.
 */
public class DragSourcePeer extends AbstractComponentSynchronizePeer {

    private static final Service DRAG_SOURCE_SERVICE = JavaScriptService.forResources("EchoExtras.DragSource",
            new String[] {  "nextapp/echo/extras/webcontainer/resource/Application.DragSource.js",  
                            "nextapp/echo/extras/webcontainer/resource/Sync.DragSource.js"});
    
    private static final String DROP_TARGET_IDS = "dropTargetIds";
    
    static {
        WebContainerServlet.getServiceRegistry().add(DRAG_SOURCE_SERVICE);
    }
    
    /**
     * Default constructor.
     */
    public DragSourcePeer() {
        super();
        
        addOutputProperty(DROP_TARGET_IDS, true);
        
        addEvent(new AbstractComponentSynchronizePeer.EventPeer(DragSource.INPUT_DROP, 
                DragSource.DROP_LISTENERS_CHANGED_PROPERTY, String.class) {
            public boolean hasListeners(Context context, Component component) {
                return ((DragSource) component).hasDropListeners();
            }
            
            public void processEvent(Context context, Component component, Object eventData) {
                ClientUpdateManager clientUpdateManager = (ClientUpdateManager) context.get(ClientUpdateManager.class);
                UserInstance userInstance = (UserInstance) context.get(UserInstance.class);
                Component specificComponent = userInstance.getComponentByClientRenderId((String) eventData);
                clientUpdateManager.setComponentAction(component, DragSource.INPUT_DROP, specificComponent);
            }
        });
    }
    
    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getClientComponentType(boolean)
     */
    public String getClientComponentType(boolean mode) {
        return "Extras.DragSource";
    }
    
    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getComponentClass()
     */
    public Class getComponentClass() {
        return DragSource.class;
    }
    
    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getOutputProperty(
     *      nextapp.echo.app.util.Context, nextapp.echo.app.Component, java.lang.String, int)
     */
    public Object getOutputProperty(Context context, Component component, String propertyName, int propertyIndex) {
        if (propertyName.equals(DROP_TARGET_IDS)) {
            DragSource dragSource = (DragSource) component;
            UserInstance userInstance = (UserInstance) context.get(UserInstance.class);
            String dropTargetId = dragSource.getDropTarget(propertyIndex);
            Component dropTarget = (Component) component.getApplicationInstance().getComponentByRenderId(dropTargetId);
            if (dropTarget == null) {
                return null;
            } else {
                return userInstance.getClientRenderId(dropTarget);
            }
        } else {
            return super.getOutputProperty(context, component, propertyName, propertyIndex);
        }
    }
    
    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getOutputPropertyIndices(nextapp.echo.app.util.Context,
     *      nextapp.echo.app.Component, java.lang.String)
     */
    public Iterator getOutputPropertyIndices(Context context, Component component, String propertyName) {
        if (propertyName.equals(DROP_TARGET_IDS)) {
            DragSource dragSource = (DragSource) component;
            final int count = dragSource.getDropTargetCount();
            return new Iterator() {
                int i = 0;
                
                /**
                 * @see java.util.Iterator#hasNext()
                 */
                public boolean hasNext() {
                    return i < count;
                }
                
                /**
                 * @see java.util.Iterator#next()
                 */
                public Object next() {
                    return new Integer(i++);
                }
                
                /**
                 * @see java.util.Iterator#remove()
                 */
                public void remove() {
                    throw new UnsupportedOperationException();
                }
            };
        } else {
            return super.getOutputPropertyIndices(context, component, propertyName);
        }
    }

    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#init(nextapp.echo.app.util.Context, Component)
     */
    public void init(Context context, Component component) {
        super.init(context, component);
        ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
        serverMessage.addLibrary(CommonService.INSTANCE.getId());
        serverMessage.addLibrary(DRAG_SOURCE_SERVICE.getId());
    }
}