/* 
 * This file is part of the Echo Extras Project.
 * Copyright (C) 2005-2008 NextApp, Inc.
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
import nextapp.echo.app.update.ServerComponentUpdate;
import nextapp.echo.app.util.Context;
import nextapp.echo.extras.app.TabPane;
import nextapp.echo.extras.webcontainer.CommonResources;
import nextapp.echo.extras.webcontainer.service.CommonService;
import nextapp.echo.webcontainer.AbstractComponentSynchronizePeer;
import nextapp.echo.webcontainer.ComponentSynchronizePeer;
import nextapp.echo.webcontainer.ContentType;
import nextapp.echo.webcontainer.LazyRenderContainer;
import nextapp.echo.webcontainer.ResourceRegistry;
import nextapp.echo.webcontainer.ServerMessage;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.UserInstance;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.JavaScriptService;
import nextapp.echo.webcontainer.util.ArrayIterator;
import nextapp.echo.webcontainer.util.MultiIterator;

/**
 * Synchronization peer for <code>TabPane</code>s.
 * 
 * @author n.beekman
 */
public class TabPanePeer extends AbstractComponentSynchronizePeer 
implements LazyRenderContainer {

    private static final String PROPERTY_ACTIVE_TAB = "activeTab";

    /**
     * Component property to enabled/disable lazy rendering of child tabs.
     * Default value is interpreted to be true.
     */
    public static final String PROPERTY_LAZY_RENDER_ENABLED = "lazyRenderEnabled";

    private static final Service TAB_PANE_SERVICE = JavaScriptService.forResources("EchoExtras.TabPane",
            new String[] {  "nextapp/echo/extras/webcontainer/resource/Application.TabPane.js",  
                            "nextapp/echo/extras/webcontainer/resource/Render.TabPane.js"});

    static {
        WebContainerServlet.getServiceRegistry().add(TAB_PANE_SERVICE);
        CommonResources.install();
        ResourceRegistry resources = WebContainerServlet.getResourceRegistry();
        resources.add("Extras", "image/tabpane/Close.gif", ContentType.IMAGE_GIF);
    }

    public TabPanePeer() {
        super();
        
        addOutputProperty(PROPERTY_ACTIVE_TAB);
        
        addEvent(new AbstractComponentSynchronizePeer.EventPeer(TabPane.INPUT_TAB_SELECT, 
                TabPane.TAB_SELECTION_LISTENERS_CHANGED_PROPERTY, String.class) {
            public boolean hasListeners(Context context, Component component) {
                return ((TabPane) component).hasTabSelectionListeners();
            }
            
            public void processEvent(Context context, Component component, Object eventData) {
                TabPane tabPane = (TabPane) component;
                Integer tabIndex = getTabIndex(context, tabPane, (String)eventData);
                ClientUpdateManager clientUpdateManager = (ClientUpdateManager) context.get(ClientUpdateManager.class);
                clientUpdateManager.setComponentAction(component, TabPane.INPUT_TAB_SELECT, tabIndex);
            }
        });

        addEvent(new AbstractComponentSynchronizePeer.EventPeer(TabPane.INPUT_TAB_CLOSE, 
                TabPane.PROPERTY_TAB_CLOSE_ENABLED, String.class) {
            public boolean hasListeners(Context context, Component component) {
                // server should always be notified since component hierarchy is modified
                return ((Boolean) component.getRenderProperty(TabPane.PROPERTY_TAB_CLOSE_ENABLED, Boolean.FALSE)).booleanValue();                
            }
            
            public void processEvent(Context context, Component component, Object eventData) {
                TabPane tabPane = (TabPane) component;
                Integer tabIndex = getTabIndex(context, tabPane, (String)eventData);
                ClientUpdateManager clientUpdateManager = (ClientUpdateManager) context.get(ClientUpdateManager.class);
                clientUpdateManager.setComponentAction(component, TabPane.INPUT_TAB_CLOSE, tabIndex);
            }
        });
    }
    
    public String getClientComponentType(boolean shortType) {
        return "Extras.TabPane";
    }

    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getComponentClass()
     */
    public Class getComponentClass() {
        return TabPane.class;
    }
    
    /**
     * @see ComponentSynchronizePeer#getInputPropertyClass(String)
     */
    public Class getInputPropertyClass(String propertyName) {
        if (PROPERTY_ACTIVE_TAB.equals(propertyName)) {
            return String.class;
        }
        return super.getInputPropertyClass(propertyName);
    }

    /**
     * @see ComponentSynchronizePeer#getOutputProperty(Context, Component, String, int)
     */
    public Object getOutputProperty(Context context, Component component, String propertyName, int propertyIndex) {
        if (PROPERTY_ACTIVE_TAB.equals(propertyName)) {
            TabPane tabPane = (TabPane) component;
            int componentCount = tabPane.getVisibleComponentCount();
            if (componentCount == 0) {
                return null;
            }
            Component activeTab;
            int activeTabIndex = tabPane.getActiveTabIndex();
            if (activeTabIndex == -1) {
                activeTab = tabPane.getVisibleComponent(0);
            } else if (activeTabIndex < componentCount) {
                activeTab = tabPane.getVisibleComponent(activeTabIndex);
            } else {
                activeTab = tabPane.getVisibleComponent(componentCount - 1);
            }
            UserInstance userInstance = (UserInstance) context.get(UserInstance.class);
            return userInstance.getClientRenderId(activeTab);
        } else {
            return super.getOutputProperty(context, component, propertyName, propertyIndex);
        }
    }

    /**
     * Gets the index of the component with the given element id.
     * 
     * @param context
     * @param tabPane
     * @param elementId
     * @return the index if found, <code>null</code> otherwise.
     */
    private Integer getTabIndex(Context context, TabPane tabPane, String elementId) {
        UserInstance userInstance = (UserInstance) context.get(UserInstance.class);
        Component[] children = tabPane.getVisibleComponents();
        for (int i = 0; i < children.length; ++i) {
            if (userInstance.getClientRenderId(children[i]).equals(elementId)) {
                return new Integer(i);
            }
        }
        return null;
    }
    
    public Iterator getUpdatedOutputPropertyNames(Context context, Component component, ServerComponentUpdate update) {
        Iterator normalPropertyIterator = super.getUpdatedOutputPropertyNames(context, component, update);
        
        if (update.hasUpdatedProperty(TabPane.ACTIVE_TAB_INDEX_CHANGED_PROPERTY) || update.hasAddedChildren() 
                || update.hasRemovedChildren()) {
            return new MultiIterator(
                    new Iterator[]{ normalPropertyIterator, new ArrayIterator(new String[] {PROPERTY_ACTIVE_TAB}) });
        }
        return normalPropertyIterator;
    }
    
    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#init(nextapp.echo.app.util.Context, Component)
     */
    public void init(Context context, Component component) {
        super.init(context, component);
        ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
        serverMessage.addLibrary(CommonService.INSTANCE.getId());
        serverMessage.addLibrary(TAB_PANE_SERVICE.getId());
    }
    
    /**
     * @see LazyRenderContainer#isRendered(Context, Component, Component)
     */
    public boolean isRendered(Context context, Component component, Component child) {
        // FIXME implement lazy behavior
        return true;
    }
    
    /**
     * @see ComponentSynchronizePeer#storeInputProperty(Context, Component, String, int, Object)
     */
    public void storeInputProperty(Context context, Component component, String propertyName, int index, Object newValue) {
        if (PROPERTY_ACTIVE_TAB.equals(propertyName)) {
            ClientUpdateManager clientUpdateManager = (ClientUpdateManager) context.get(ClientUpdateManager.class);
            clientUpdateManager.setComponentProperty(component, TabPane.ACTIVE_TAB_INDEX_CHANGED_PROPERTY, getTabIndex(context, 
                    (TabPane) component, (String) newValue));
        }
    }
}
