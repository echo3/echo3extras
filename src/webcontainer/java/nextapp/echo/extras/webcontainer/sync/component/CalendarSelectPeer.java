package nextapp.echo.extras.webcontainer.sync.component;

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
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#init(nextapp.echo.app.util.Context)
     */
    public void init(Context context) {
        super.init(context);
        ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
        serverMessage.addLibrary(CommonService.INSTANCE.getId());
        serverMessage.addLibrary(CALENDAR_SELECT_SERVICE.getId());
    }    
}
