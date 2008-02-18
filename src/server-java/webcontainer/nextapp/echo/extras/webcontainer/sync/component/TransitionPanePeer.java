package nextapp.echo.extras.webcontainer.sync.component;

import nextapp.echo.app.util.Context;
import nextapp.echo.extras.app.TransitionPane;
import nextapp.echo.extras.webcontainer.service.CommonService;
import nextapp.echo.webcontainer.AbstractComponentSynchronizePeer;
import nextapp.echo.webcontainer.ServerMessage;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.JavaScriptService;

/**
 * Synchronization peer for <code>TransitionPane</code>s.
 */
public class TransitionPanePeer
extends AbstractComponentSynchronizePeer {

    private static final Service TRANSITION_PANE_SERVICE = JavaScriptService.forResources("EchoExtras.TransitionPane",
            new String[] {  "/nextapp/echo/extras/webcontainer/resource/Application.TransitionPane.js",  
                            "/nextapp/echo/extras/webcontainer/resource/Render.TransitionPane.js"});

    static {
        WebContainerServlet.getServiceRegistry().add(TRANSITION_PANE_SERVICE);
    }

    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getClientComponentType(boolean)
     */
    public String getClientComponentType(boolean shortType) {
        return "ExtrasApp.TransitionPane";
    }

    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getComponentClass()
     */
    public Class getComponentClass() {
        return TransitionPane.class;
    }

    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#init(nextapp.echo.app.util.Context)
     */
    public void init(Context context) {
        super.init(context);
        ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
        serverMessage.addLibrary(CommonService.INSTANCE.getId());
        serverMessage.addLibrary(TRANSITION_PANE_SERVICE.getId());
    }
}
