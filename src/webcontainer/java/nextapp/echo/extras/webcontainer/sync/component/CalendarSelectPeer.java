package nextapp.echo.extras.webcontainer.sync.component;

import java.util.Date;

import nextapp.echo.app.Component;
import nextapp.echo.app.update.ClientUpdateManager;
import nextapp.echo.app.util.Context;
import nextapp.echo.extras.app.CalendarSelect;
import nextapp.echo.extras.webcontainer.service.CommonService;
import nextapp.echo.webcontainer.AbstractComponentSynchronizePeer;
import nextapp.echo.webcontainer.ServerMessage;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.JavaScriptService;

public class CalendarSelectPeer
extends AbstractComponentSynchronizePeer {

    private static final Service CALENDAR_SELECT_SERVICE = JavaScriptService.forResources("EchoExtras.CalendarSelect",
            new String[] {  "/nextapp/echo/extras/webcontainer/resource/js/Application.CalendarSelect.js",  
                            "/nextapp/echo/extras/webcontainer/resource/js/Render.CalendarSelect.js"});

    static {
        WebContainerServlet.getServiceRegistry().add(CALENDAR_SELECT_SERVICE);
    }

    public CalendarSelectPeer() {
        super();
        addOutputProperty(CalendarSelect.DATE_CHANGED_PROPERTY);
    }
    
    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getClientComponentType(boolean)
     */
    public String getClientComponentType(boolean shortType) {
        return "ExtrasApp.CalendarSelect";
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
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#init(nextapp.echo.app.util.Context)
     */
    public void init(Context context) {
        super.init(context);
        ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
        serverMessage.addLibrary(CommonService.INSTANCE.getId());
        serverMessage.addLibrary(CALENDAR_SELECT_SERVICE.getId());
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
