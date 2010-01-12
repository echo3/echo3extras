package nextapp.echo.extras.webcontainer.sync.component;

import nextapp.echo.webcontainer.AbstractComponentSynchronizePeer;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.JavaScriptService;

public abstract class AbstractViewerPeer extends AbstractComponentSynchronizePeer {

    public static final Service BASE_JS_SERVICE = JavaScriptService.forResources("EchoExtras.Viewer",
            new String[] {  "nextapp/echo/extras/webcontainer/resource/Application.Viewer.js",  
                            "nextapp/echo/extras/webcontainer/resource/Sync.Viewer.js"});
    static {
        WebContainerServlet.getServiceRegistry().add(BASE_JS_SERVICE);
    }
}
