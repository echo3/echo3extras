package nextapp.echo.extras.webcontainer.sync.component;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.SAXException;

import nextapp.echo.app.serial.PropertyPeerFactory;
import nextapp.echo.app.serial.SerialException;
import nextapp.echo.app.serial.SerialPropertyPeer;
import nextapp.echo.app.util.Context;
import nextapp.echo.app.util.DomUtil;
import nextapp.echo.extras.app.viewer.Viewer;
import nextapp.echo.extras.app.viewer.ViewerModel;
import nextapp.echo.webcontainer.AbstractComponentSynchronizePeer;
import nextapp.echo.webcontainer.Connection;
import nextapp.echo.webcontainer.ContentType;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.SynchronizationContext;
import nextapp.echo.webcontainer.SynchronizationException;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.JavaScriptService;

/**
 * Abstract base class for <code>Viewer</code> peers.
 * Provides model rendering service.
 * Provides base JavaScript service.
 */
public abstract class AbstractViewerPeer extends AbstractComponentSynchronizePeer {

    private static final Service MODEL_SERVICE = new Service() {

        /**
         * Maximum number of cells to render in a single service request.
         */
        private static final int MAX_SIZE = 4096;
        
        /**
         * @see nextapp.echo.webcontainer.Service#getId()
         */
        public String getId() {
            return "EchoExtras.Viewer.Model";
        }

        /**
         * @see nextapp.echo.webcontainer.Service#getVersion()
         */
        public int getVersion() {
            return DO_NOT_CACHE;
        }

        /**
         * @see nextapp.echo.webcontainer.Service#service(nextapp.echo.webcontainer.Connection)
         */
        public void service(Connection conn)
        throws IOException {
            try {
                HttpServletRequest request = conn.getRequest();
                String clientRenderId = request.getParameter("cid");
                Viewer viewer = (Viewer) conn.getUserInstance().getComponentByClientRenderId(clientRenderId);
                int startIndex = Integer.parseInt(request.getParameter("is"));
                int endIndex = Integer.parseInt(request.getParameter("ie"));
                int size = endIndex - startIndex + 1;
                if (size > MAX_SIZE) {
                    throw new IOException("Model request for " + size + " cells exceeded maximum size of " + size + " indices.");
                }
                ModelData modelData = new ModelData(viewer.getModel(), startIndex, endIndex);
                
                Document document = DomUtil.createDocument("model", null, null, null);
                Context context = new SynchronizationContext(conn, document);
                
                renderModelDataContent(context, modelData, document.getDocumentElement());
                
                conn.setContentType(ContentType.TEXT_XML);
                DomUtil.save(document, conn.getOutputStream(), null);
            } catch (SerialException ex) {
                throw new SynchronizationException("Unable to render model data.", ex);
            } catch (SAXException ex) {
                throw new SynchronizationException("Unable to render model data.", ex);
            }
        }
    };
    
    /**
     * A representation of a block of <code>ViewerModel</code> data.
     */
    public static class ModelData {
        
        private int startIndex, endIndex;
        private ViewerModel model;
        
        /**
         * Creates a new <code>ModelData</code> instance.
         * 
         * @param model the <code>ViewerModel</code>
         * @param startIndex the first index (inclusive)
         * @param endIndex the last index (exclusive)
         */
        public ModelData(ViewerModel model, int startIndex, int endIndex) {
            super();
            this.model = model;
            this.startIndex = startIndex;
            this.endIndex = endIndex;
            
            model.fetch(startIndex, endIndex);
        }
        
        /**
         * Returns the <code>ViewerModel</code>.
         * 
         * @return the <code>ViewerModel</code>
         */
        public ViewerModel getModel() {
            return model;
        }
        
        /**
         * Returns the start index.
         * 
         * @return the start index
         */
        public int getStartIndex() {
            return startIndex;
        }
        
        /**
         * Returns the end index (exclusive).
         * 
         * @return the end index (exclusive)
         */
        public int getEndIndex() {
            return endIndex;
        }
    }
    
    /**
     * Renders the content of a model data property to XML.  Appends created property elements to specified parent element.
     * 
     * @param context the relevant <code>Context</code> object (a <code>SynchronizationContext</code>)
     * @param modelData the <code>ModelData</code> whose content is to be rendered
     * @param parentElement the parent DOM <code>Element</code>
     * @throws SerialException
     */
    public static void renderModelDataContent(Context context, ModelData modelData, Element parentElement) 
    throws SerialException {
        PropertyPeerFactory factory = (PropertyPeerFactory) context.get(PropertyPeerFactory.class);
        for (int i = modelData.getStartIndex(); i < modelData.getEndIndex(); ++i) {
            Element pElement = parentElement.getOwnerDocument().createElement("p");
            Object modelValue = modelData.getModel().get(i);
            if (modelValue != null) {
                SerialPropertyPeer modelValuePeer = factory.getPeerForProperty(modelValue.getClass());
                modelValuePeer.toXml(context, ViewerModel.class, pElement, modelValue);
            }
            parentElement.appendChild(pElement);
        }
    }
    
    public static final Service BASE_JS_SERVICE = JavaScriptService.forResources("EchoExtras.Viewer",
            new String[] {  "nextapp/echo/extras/webcontainer/resource/Application.Viewer.js",  
                            "nextapp/echo/extras/webcontainer/resource/Sync.Viewer.js"});
    static {
        WebContainerServlet.getServiceRegistry().add(BASE_JS_SERVICE);
        WebContainerServlet.getServiceRegistry().add(MODEL_SERVICE);
    }
}
