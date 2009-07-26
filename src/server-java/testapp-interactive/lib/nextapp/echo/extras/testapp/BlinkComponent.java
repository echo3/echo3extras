package nextapp.echo.extras.testapp;

import nextapp.echo.app.Component;
import nextapp.echo.app.Pane;
import nextapp.echo.app.PaneContainer;
import nextapp.echo.app.util.Context;
import nextapp.echo.webcontainer.AbstractComponentSynchronizePeer;
import nextapp.echo.webcontainer.ServerMessage;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.JavaScriptService;

public class BlinkComponent extends Component 
implements Pane, PaneContainer {

    private static final Service BLINK_COMPONENT_SERVICE = JavaScriptService.forResource("BlinkComponent", 
            "nextapp/echo/extras/testapp/resource/js/BlinkComponent.js");
    
    static {
        WebContainerServlet.getServiceRegistry().add(BLINK_COMPONENT_SERVICE);
    }
    
    public static class Peer extends AbstractComponentSynchronizePeer {
    
        /**
         * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getClientComponentType(boolean)
         */
        public String getClientComponentType(boolean mode) {
            return "BlinkComponent";
        }

        /**
         * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getComponentClass()
         */
        public Class getComponentClass() {
            return BlinkComponent.class;
        }
        
        /**
         * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#init(nextapp.echo.app.util.Context, Component)
         */
        public void init(Context context, Component component) {
            super.init(context, component);
            ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
            serverMessage.addLibrary(BLINK_COMPONENT_SERVICE.getId());
        }
    }
    
    public static final String PROPERTY_INTERVAL = "interval";
    
    public int getInterval() {
        Integer interval = (Integer) get(PROPERTY_INTERVAL);
        return interval == null ? 5000 : interval.intValue(); 
    }
    
    public void setInterval(int interval) {
        set(PROPERTY_INTERVAL, new Integer(interval));
    }
}
