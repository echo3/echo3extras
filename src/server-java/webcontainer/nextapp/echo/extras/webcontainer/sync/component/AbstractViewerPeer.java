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

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.SAXException;

import nextapp.echo.app.Component;
import nextapp.echo.app.serial.PropertyPeerFactory;
import nextapp.echo.app.serial.SerialException;
import nextapp.echo.app.serial.SerialPropertyPeer;
import nextapp.echo.app.util.Context;
import nextapp.echo.app.util.DomUtil;
import nextapp.echo.extras.app.viewer.Viewer;
import nextapp.echo.extras.app.viewer.ViewerModel;
import nextapp.echo.extras.webcontainer.service.CommonService;
import nextapp.echo.webcontainer.AbstractComponentSynchronizePeer;
import nextapp.echo.webcontainer.Connection;
import nextapp.echo.webcontainer.ContentType;
import nextapp.echo.webcontainer.ServerMessage;
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
                int indexCount = endIndex - startIndex + 1;
                if (indexCount > MAX_SIZE) {
                    throw new IOException("Model request for " + indexCount + " cells exceeded maximum size of " + 
                            indexCount + " indices.");
                }
                ViewerModel model = viewer.getModel();
                ModelData modelData = new ModelData(model, startIndex, endIndex);
                
                Document document = DomUtil.createDocument("model", null, null, null);
                Context context = new SynchronizationContext(conn, document);
                
                Element modelElement = document.getDocumentElement();
                modelElement.setAttribute("sz", Integer.toString(model.size()));
                modelElement.setAttribute("is", Integer.toString(modelData.getStartIndex()));
                modelElement.setAttribute("ie", Integer.toString(modelData.getEndIndex()));
                renderModelDataContent(context, modelData, modelElement);
                
                conn.setContentType(ContentType.TEXT_XML);
                DomUtil.save(document, conn.getOutputStream(), null);
                DomUtil.save(document, new PrintWriter(System.err), null);
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
        
        private int startIndex; 
        private int endIndex;
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
     * Serialization peer for <code>ModelData</code>.
     */
    public static class ModelDataPeer 
    implements SerialPropertyPeer {

        /**
         * @see nextapp.echo.app.serial.SerialPropertyPeer#toProperty(nextapp.echo.app.util.Context, java.lang.Class,
         *      org.w3c.dom.Element)
         */
        public Object toProperty(Context context, Class objectClass, Element propertyElement)
        throws SerialException {
            throw new UnsupportedOperationException();
        }

        /**
         * @see nextapp.echo.app.serial.SerialPropertyPeer#toXml(nextapp.echo.app.util.Context, java.lang.Class,
         *      org.w3c.dom.Element, java.lang.Object)
         */
        public void toXml(Context context, Class objectClass, Element propertyElement, Object propertyValue)
        throws SerialException {
            propertyElement.setAttribute("t", "Extras.Sync.RemoteViewer.ModelData");
            ModelData modelData = (ModelData) propertyValue;
            ViewerModel model = modelData.getModel();
            Element modelElement = propertyElement.getOwnerDocument().createElement("model");
            int size = model.size();
            modelElement.setAttribute("sz", Integer.toString(size));
            modelElement.setAttribute("is", Integer.toString(modelData.getStartIndex()));
            modelElement.setAttribute("ie", Integer.toString(Math.min(size, modelData.getEndIndex())));
            renderModelDataContent(context, modelData, modelElement);
            propertyElement.appendChild(modelElement);
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
        int endIndex = Math.min(modelData.getEndIndex(), modelData.getModel().size());
        for (int i = modelData.getStartIndex(); i < endIndex; ++i) {
        	Object modelValue = modelData.getModel().get(i);
            if (modelValue == null) {
                Element pElement = parentElement.getOwnerDocument().createElement("p");
                parentElement.appendChild(pElement);
            } else {
            	if (modelValue instanceof Object[]) {
            		Object[] array = (Object[]) modelValue;
            		for (int iArray = 0; iArray < array.length; ++iArray) {
            			if (array[iArray] == null) {
            				continue;
            			}
                        Element pElement = parentElement.getOwnerDocument().createElement("p");
                        pElement.setAttribute("x", Integer.toString(iArray));
                        SerialPropertyPeer modelValuePeer = factory.getPeerForProperty(array[iArray].getClass());
                        modelValuePeer.toXml(context, ViewerModel.class, pElement, array[iArray]);
                        parentElement.appendChild(pElement);
            		}
            	} else {
                    Element pElement = parentElement.getOwnerDocument().createElement("p");
                    SerialPropertyPeer modelValuePeer = factory.getPeerForProperty(modelValue.getClass());
                    modelValuePeer.toXml(context, ViewerModel.class, pElement, modelValue);
                    parentElement.appendChild(pElement);
            	}
            }
        }
    }
    
    private static final Service BASE_JS_SERVICE = JavaScriptService.forResources("EchoExtras.Viewer",
            new String[] {  "nextapp/echo/extras/webcontainer/resource/Application.Viewer.js",  
                            "nextapp/echo/extras/webcontainer/resource/Sync.Viewer.js",
                            "nextapp/echo/extras/webcontainer/resource/RemoteClient.Viewer.js"});
    static {
        WebContainerServlet.getServiceRegistry().add(BASE_JS_SERVICE);
        WebContainerServlet.getServiceRegistry().add(MODEL_SERVICE);
    }
    
    /**
     * Default constructor.
     */
    public AbstractViewerPeer() {
        super();
//        addOutputProperty(Viewer.MODEL_CHANGED_PROPERTY);
    }

//    /**
//     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getOutputProperty(
//     *      nextapp.echo.app.util.Context, nextapp.echo.app.Component, java.lang.String, int)
//     */
//    public Object getOutputProperty(Context context, Component component, String propertyName, int propertyIndex) {
//        Viewer viewer = (Viewer) component;
//        if (propertyName.equals(Viewer.MODEL_CHANGED_PROPERTY)) {
//            return new ModelData(viewer.getModel(), 0, 20);
//        } else {
//            return super.getOutputProperty(context, component, propertyName, propertyIndex);
//        }
//    }

    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#init(nextapp.echo.app.util.Context, Component)
     */
    public void init(Context context, Component component) {
        super.init(context, component);
        ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
        serverMessage.addLibrary(CommonService.INSTANCE.getId());
        serverMessage.addLibrary(BASE_JS_SERVICE.getId());
    }
}
