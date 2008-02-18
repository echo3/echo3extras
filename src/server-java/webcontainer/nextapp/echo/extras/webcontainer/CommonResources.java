package nextapp.echo.extras.webcontainer;

import nextapp.echo.webcontainer.ResourceRegistry;
import nextapp.echo.webcontainer.WebContainerServlet;

public class CommonResources {

    static {
        ResourceRegistry resources = WebContainerServlet.getResourceRegistry();
        resources.addPackage("Extras", "nextapp/echo/extras/webcontainer/resource/");
    }
    
    public static void install() {
    }
}
