package nextapp.echo.extras.webcontainer.service;

import nextapp.echo.app.ImageReference;
import nextapp.echo.app.ResourceImageReference;
import nextapp.echo.webcontainer.UserInstance;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.StreamImageService;

public class TreeImageService extends StreamImageService {

    /** <code>Service</code> identifier. */
    private static final String SERVICE_ID = "EchoExtras.Tree.Image"; 
    
    /** Singleton instance of this <code>Service</code>. */
    public static final TreeImageService INSTANCE = new TreeImageService();

    private static final String IMAGE_PREFIX = "/nextapp/echo/extras/webcontainer/resource/image/";
    private static final ImageReference DEFAULT_ICON_LINE_SOLID = new ResourceImageReference(IMAGE_PREFIX + "Dot.gif");
    private static final ImageReference DEFAULT_ICON_VERTICAL_LINE_DOTTED = new ResourceImageReference(IMAGE_PREFIX + "TreeVerticalLineDotted.gif");
    private static final ImageReference DEFAULT_ICON_HORIZONTAL_LINE_DOTTED = new ResourceImageReference(IMAGE_PREFIX + "TreeHorizontalLineDotted.gif");
    
    private static final String IMAGE_ID_LINE_VERTICAL_SOLID = "lineVerticalSolid";
    private static final String IMAGE_ID_LINE_HORIZONTAL_SOLID = "lineHorizontalSolid";
    
    private static final String IMAGE_ID_LINE_VERTICAL_DOTTED = "lineVerticalDotted";
    private static final String IMAGE_ID_LINE_HORIZONTAL_DOTTED = "lineHorizontalDotted";
    
    static {
        WebContainerServlet.getServiceRegistry().add(INSTANCE);
    }
    
    public static void install() {
        // Do nothing, simply ensure static directives are executed.
    }
    
    /**
     * @see nextapp.echo.webcontainer.Service#getId()
     */
    public String getId() {
        return SERVICE_ID;
    }

    /**
     * @see StreamImageService#getImage(UserInstance, String)
     */
    public ImageReference getImage(UserInstance userInstance, String imageId) {
        if (IMAGE_ID_LINE_VERTICAL_SOLID.equals(imageId)) {
            return DEFAULT_ICON_LINE_SOLID;
        } else if (IMAGE_ID_LINE_HORIZONTAL_SOLID.equals(imageId)) {
            return DEFAULT_ICON_LINE_SOLID;
        } else if (IMAGE_ID_LINE_VERTICAL_DOTTED.equals(imageId)) {
            return DEFAULT_ICON_VERTICAL_LINE_DOTTED;
        } else if (IMAGE_ID_LINE_HORIZONTAL_DOTTED.equals(imageId)) {
            return DEFAULT_ICON_HORIZONTAL_LINE_DOTTED;
        } else {
            return null;
        }
    }
}
