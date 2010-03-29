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

import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import nextapp.echo.app.Component;
import nextapp.echo.app.update.ClientUpdateManager;
import nextapp.echo.app.util.Context;
import nextapp.echo.extras.app.CalendarSelect;
import nextapp.echo.extras.webcontainer.CommonResources;
import nextapp.echo.extras.webcontainer.service.CommonService;
import nextapp.echo.webcontainer.AbstractComponentSynchronizePeer;
import nextapp.echo.webcontainer.ContentType;
import nextapp.echo.webcontainer.ResourceRegistry;
import nextapp.echo.webcontainer.ServerMessage;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.JavaScriptService;

public class CalendarSelectPeer
extends AbstractComponentSynchronizePeer {

    private static final String RESOURCE_DIR = "nextapp/echo/extras/webcontainer/resource/";
    
    private static final Service CALENDAR_SELECT_SERVICE = JavaScriptService.forResources("EchoExtras.CalendarSelect",
            new String[] { "nextapp/echo/extras/webcontainer/resource/Application.CalendarSelect.js",  
                           "nextapp/echo/extras/webcontainer/resource/Sync.CalendarSelect.js" });
    
    private static final Map LOCALE_SERVICES = new HashMap();
    
    static {
        WebContainerServlet.getServiceRegistry().add(CALENDAR_SELECT_SERVICE);
        CommonResources.install();
        ResourceRegistry resources = WebContainerServlet.getResourceRegistry();
        resources.add("Extras", "image/calendar/Increment.gif", ContentType.IMAGE_GIF);
        resources.add("Extras", "image/calendar/Decrement.gif", ContentType.IMAGE_GIF);
        
        addLocaleService(Locale.GERMAN, "de");
        addLocaleService(new Locale("bg"), "bg");        
    }
    
    private static void addLocaleService(Locale locale, String localeCode) {
        Service service = JavaScriptService.forResource("EchoExtras.CalendarSelect." + localeCode, 
                RESOURCE_DIR + "SyncLocale.CalendarSelect." + localeCode + ".js");
        WebContainerServlet.getServiceRegistry().add(service);
        LOCALE_SERVICES.put(locale, service);
    }
    
    public CalendarSelectPeer() {
        super();
        addOutputProperty(CalendarSelect.DATE_CHANGED_PROPERTY);
        addEvent(new EventPeer(CalendarSelect.INPUT_ACTION, CalendarSelect.ACTION_LISTENERS_CHANGED_PROPERTY) {
            public boolean hasListeners(Context context, Component c) {
                return ((CalendarSelect) c).hasActionListeners();
            }
        });
    }
    
    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getClientComponentType(boolean)
     */
    public String getClientComponentType(boolean mode) {
        return "Extras.CalendarSelect";
    }

    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getComponentClass()
     */
    public Class getComponentClass() {
        return CalendarSelect.class;
    }

    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getInputPropertyClass(java.lang.String)
     */
    public Class getInputPropertyClass(String propertyName) {
        if (CalendarSelect.DATE_CHANGED_PROPERTY.equals(propertyName)) {
            return Date.class;
        }
        return null;
    }

    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getOutputProperty(
     *      nextapp.echo.app.util.Context, nextapp.echo.app.Component, java.lang.String, int)
     */
    public Object getOutputProperty(Context context, Component component, String propertyName, int propertyIndex) {
        if (propertyName.equals(CalendarSelect.DATE_CHANGED_PROPERTY)) {
            CalendarSelect calendarSelect = (CalendarSelect) component;
            return calendarSelect.getDate();
        } else {
            return super.getOutputProperty(context, component, propertyName, propertyIndex);
        }
    }
    
    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#init(nextapp.echo.app.util.Context, Component)
     */
    public void init(Context context, Component component) {
        super.init(context, component);
        ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
        serverMessage.addLibrary(CommonService.INSTANCE.getId());
        serverMessage.addLibrary(CALENDAR_SELECT_SERVICE.getId());
        installLocaleService(context, component);
    }
    
    private void installLocaleService(Context context, Component component) {
        Locale locale = component.getRenderLocale();
        if (LOCALE_SERVICES.containsKey(locale)) {
            ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
            serverMessage.addLibrary(((Service) LOCALE_SERVICES.get(locale)).getId());
        }
    }

    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#storeInputProperty(Context, Component, String, int, Object)
     */
    public void storeInputProperty(Context context, Component component, String propertyName, int propertyIndex, Object newValue) {
        if (propertyName.equals(CalendarSelect.DATE_CHANGED_PROPERTY)) {
            ClientUpdateManager clientUpdateManager = (ClientUpdateManager) context.get(ClientUpdateManager.class);
            clientUpdateManager.setComponentProperty(component, CalendarSelect.DATE_CHANGED_PROPERTY, newValue);
        }
    }
}
