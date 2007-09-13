package nextapp.echo.extras.webcontainer;

import nextapp.echo.app.ResourceImageReference;
import nextapp.echo.webcontainer.service.ImageService;

public class CommonImages {

    private static final String ICON_FILE_PREFIX = "/nextapp/echo/extras/webcontainer/resource/image/";
    private static final String ICON_ID_PREFIX = "EchoExtras.CommonImages.";

    private static final void addDefaultIcon(String id, String image) {
        ImageService.addGlobalImage(ICON_ID_PREFIX + id, new ResourceImageReference(ICON_FILE_PREFIX + image));
    }

    static {
        addDefaultIcon("ok", "Icon24Yes.gif");
        addDefaultIcon("cancel", "Icon24No.gif");
    }
    
    public static void install() {
    }
}
