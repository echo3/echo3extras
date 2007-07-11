package nextapp.echo.extras.webcontainer.sync.component;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Iterator;

import nextapp.echo.app.Component;
import nextapp.echo.app.ImageReference;
import nextapp.echo.app.ResourceImageReference;
import nextapp.echo.app.serial.SerialException;
import nextapp.echo.app.serial.SerialPropertyPeer;
import nextapp.echo.app.update.ClientUpdateManager;
import nextapp.echo.app.update.ServerComponentUpdate;
import nextapp.echo.app.util.Context;
import nextapp.echo.extras.app.Tree;
import nextapp.echo.extras.app.tree.TreeModel;
import nextapp.echo.extras.app.tree.TreePath;
import nextapp.echo.extras.webcontainer.service.CommonService;
import nextapp.echo.webcontainer.AbstractComponentSynchronizePeer;
import nextapp.echo.webcontainer.RenderState;
import nextapp.echo.webcontainer.ServerMessage;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.UserInstance;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.ImageService;
import nextapp.echo.webcontainer.service.JavaScriptService;
import nextapp.echo.webcontainer.util.ArrayIterator;
import nextapp.echo.webcontainer.util.MultiIterator;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

public class TreePeer 
extends AbstractComponentSynchronizePeer {

    private class TreeRenderState 
    implements RenderState {
        private int row;
        private boolean send;
        
        public TreeRenderState(boolean send) {
            this.send = send;
        }
        
        public TreeRenderState(int row) {
            this.row = row;
            this.send = true;
        }
        
        public int getRow() {
            return row;
        }
        
        public boolean isSend() {
            return send;
        }
    }
    
    private class TreeStructure {
        
        Tree tree;
        
        TreeStructure(Tree tree) {
            this.tree = tree;
        }
    }
    
    public static class TreeStructurePeer 
    implements SerialPropertyPeer {
    
        /**
         * @see nextapp.echo.app.serial.SerialPropertyPeer#toProperty(nextapp.echo.app.util.Context, 
         *      java.lang.Class, org.w3c.dom.Element)
         */
        public Object toProperty(Context context, Class objectClass, Element propertyElement) 
        throws SerialException {
            throw new UnsupportedOperationException();
        }
    
        /**
         * @see nextapp.echo.app.serial.SerialPropertyPeer#toXml(nextapp.echo.app.util.Context, 
         *      java.lang.Class, org.w3c.dom.Element, java.lang.Object)
         */
        public void toXml(Context context, Class objectClass, Element propertyElement, Object propertyValue) 
        throws SerialException {
            Tree tree = ((TreeStructure) propertyValue).tree;
            TreeStructureRenderer renderer = new TreeStructureRenderer(propertyElement, tree);
            propertyElement.setAttribute("t", "ExtrasSerial.TreeStructure");
            UserInstance userInstance = (UserInstance) context.get(UserInstance.class);
            TreeRenderState renderState = (TreeRenderState) userInstance.getRenderState(tree);
            renderer.render(renderState);
            userInstance.removeRenderState(tree);
        }
    }
    
    private static class TreeStructureRenderer {
        
        private Tree tree;
        private TreeModel model;
        private int columnCount;
        private int row = 0;
        private Element propertyElement;
        private Document document;
        
        TreeStructureRenderer(Element propertyElement, Tree tree) {
            this.propertyElement = propertyElement;
            document = propertyElement.getOwnerDocument();
            this.tree = tree;
            columnCount = getColumnCount(tree);
            model = tree.getModel();
            if (tree.isHeaderVisible()) {
                row = -1;
            } else {
                row = 0;
            }
        }
        
        private void render(TreeRenderState renderState) {
            Object value = null;
            String parentId = null;
            if (renderState == null || renderState.getRow() == 0) {
                if (tree.isHeaderVisible()) {
                    // header
                    renderNode(null, null);
                }
                value = model.getRoot();
            } else {
                row = renderState.getRow();
                TreePath path = tree.getPathForRow(renderState.getRow());
                value = path.getLastPathComponent();
                parentId = UserInstance.getElementId(tree.getComponent(path.getParentPath(), 0));
            }
            renderNode(parentId, value);
        }
        
        private void renderNode(String parentId, Object value) {
            Component component = tree.getComponent(row, 0);
            boolean expanded = tree.isExpanded(row);
            String id = UserInstance.getElementId(component);
            Element eElement = document.createElement("e");
            eElement.setAttribute("i", id);
            if (parentId != null) {
                eElement.setAttribute("p", parentId);
            }
            if (row == -1) {
                eElement.setAttribute("h", "1");
            } else {
                if (expanded) {
                    eElement.setAttribute("ex", "1");
                } else if (model.isLeaf(value)) {
                    eElement.setAttribute("l", "1");
                }
            }
            
            for (int i = 1; i < columnCount; ++i) {
                Component columnComponent = tree.getComponent(row, i);
                Element columnElement = document.createElement("c");
                columnElement.setAttribute("i", UserInstance.getElementId(columnComponent));
                eElement.appendChild(columnElement);
            }
            
            propertyElement.appendChild(eElement);

            ++row;
            
            if (row == 0) {
                // no child nodes for the header
                return;
            }
            
            int childCount = model.getChildCount(value);
            
            if (expanded) {
                for (int i = 0; i < childCount; ++i) {
                    renderNode(id, model.getChild(value, i));
                }
            }
        }
    }
    
    private static int getColumnCount(Tree tree) {
        return tree.getColumnModel().getColumnCount();
    }
    
    private static final String IMAGE_PREFIX = "/nextapp/echo/extras/webcontainer/resource/image/";
    private static final ImageReference DEFAULT_ICON_LINE_SOLID = new ResourceImageReference(IMAGE_PREFIX + "Dot.gif");
    private static final ImageReference DEFAULT_ICON_VERTICAL_LINE_DOTTED = new ResourceImageReference(IMAGE_PREFIX + "TreeVerticalLineDotted.gif");
    private static final ImageReference DEFAULT_ICON_HORIZONTAL_LINE_DOTTED = new ResourceImageReference(IMAGE_PREFIX + "TreeHorizontalLineDotted.gif");
    
    private static final String IMAGE_ID_LINE_VERTICAL_SOLID = "EchoExtras.Tree.lineVerticalSolid";
    private static final String IMAGE_ID_LINE_HORIZONTAL_SOLID = "EchoExtras.Tree.lineHorizontalSolid";
    private static final String IMAGE_ID_LINE_VERTICAL_DOTTED = "EchoExtras.Tree.lineVerticalDotted";
    private static final String IMAGE_ID_LINE_HORIZONTAL_DOTTED = "EchoExtras.Tree.lineHorizontalDotted";

    private static final String PROPERTY_TREE_STRUCTURE = "treeStructure";
    private static final String PROPERTY_COLUMN_COUNT = "columnCount";
    private static final String PROPERTY_HEADER_VISIBLE = "headerVisible";
    
    private static final String INPUT_AND_LOAD_ACTION = Tree.INPUT_ACTION + "Load";
    
    private static final String[] MODEL_CHANGED_UPDATE_PROPERTIES = new String[] { PROPERTY_TREE_STRUCTURE,
            PROPERTY_COLUMN_COUNT,
            PROPERTY_HEADER_VISIBLE};
    
    private static final String[] EVENT_TYPES_ACTION = new String[] { Tree.INPUT_ACTION, INPUT_AND_LOAD_ACTION };
    
    private static final Service TREE_SERVICE = JavaScriptService.forResources("EchoExtras.RemoteTree",  
            new String[]{ "/nextapp/echo/extras/webcontainer/resource/js/Application.RemoteTree.js",
                    "/nextapp/echo/extras/webcontainer/resource/js/Serial.RemoteTree.js",
                    "/nextapp/echo/extras/webcontainer/resource/js/Render.RemoteTree.js" });
    
    static {
        ImageService.install();
        ImageService.addGlobalImage(IMAGE_ID_LINE_HORIZONTAL_SOLID, DEFAULT_ICON_LINE_SOLID);
        ImageService.addGlobalImage(IMAGE_ID_LINE_VERTICAL_SOLID, DEFAULT_ICON_LINE_SOLID);
        ImageService.addGlobalImage(IMAGE_ID_LINE_HORIZONTAL_DOTTED, DEFAULT_ICON_HORIZONTAL_LINE_DOTTED);
        ImageService.addGlobalImage(IMAGE_ID_LINE_VERTICAL_DOTTED, DEFAULT_ICON_VERTICAL_LINE_DOTTED);
        
        WebContainerServlet.getServiceRegistry().add(TREE_SERVICE);
    }
    
    public TreePeer() {
        super();
        addOutputProperty(PROPERTY_TREE_STRUCTURE);
        addOutputProperty(PROPERTY_COLUMN_COUNT);
        addOutputProperty(PROPERTY_HEADER_VISIBLE);
    }
    
    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getComponentClass()
     */
    public Class getComponentClass() {
        return Tree.class;
    }
    
    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getClientComponentType()
     */
    public String getClientComponentType() {
        return "nextapp.echo.extras.app.RemoteTree";
    }
    
    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getOutputProperty(
     *      nextapp.echo.app.util.Context, nextapp.echo.app.Component, java.lang.String, int)
     */
    public Object getOutputProperty(Context context, Component component, String propertyName, int propertyIndex) {
        if (PROPERTY_TREE_STRUCTURE.equals(propertyName)) {
            return new TreeStructure((Tree) component);
        } else if (PROPERTY_COLUMN_COUNT.equals(propertyName)) {
            return new Integer(getColumnCount((Tree) component));
        } else if (PROPERTY_HEADER_VISIBLE.equals(propertyName)) {
            return Boolean.valueOf(((Tree)component).isHeaderVisible());
        }
        return super.getOutputProperty(context, component, propertyName, propertyIndex);
    }
    
    public Class getEventDataClass(String eventType) {
        if (Tree.INPUT_ACTION.equals(eventType) || INPUT_AND_LOAD_ACTION.equals(eventType)) {
            return Integer.class;
        }
        return super.getEventDataClass(eventType);
    }
    
    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getUpdatedOutputPropertyNames(
     *      nextapp.echo.app.util.Context,
     *      nextapp.echo.app.Component,
     *      nextapp.echo.app.update.ServerComponentUpdate)
     */
    public Iterator getUpdatedOutputPropertyNames(Context context, Component component, 
            ServerComponentUpdate update) {
        Iterator normalPropertyIterator = super.getUpdatedOutputPropertyNames(context, component, update);
        
        HashSet extraProperties = new HashSet();
        
        if (update.hasUpdatedProperty(Tree.MODEL_CHANGED_PROPERTY)) {
            extraProperties.addAll(Arrays.asList(MODEL_CHANGED_UPDATE_PROPERTIES));
        } 
        if (update.hasUpdatedProperty(Tree.EXPANSION_STATE_CHANGED_PROPERTY)) {
            UserInstance userInstance = (UserInstance) context.get(UserInstance.class);
            TreeRenderState renderState = (TreeRenderState) userInstance.getRenderState(component);
            if (renderState == null || renderState.isSend()) {
                extraProperties.add(PROPERTY_TREE_STRUCTURE);
            }
        } 
        
        return new MultiIterator(new Iterator[] { normalPropertyIterator, extraProperties.iterator() });
    }
    
    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getImmediateEventTypes(
     *      nextapp.echo.app.util.Context, 
     *      nextapp.echo.app.Component)
     */
    public Iterator getImmediateEventTypes(Context context, Component component) {
        return new ArrayIterator(EVENT_TYPES_ACTION);
    }
    
    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#processEvent(
     *      nextapp.echo.app.util.Context, 
     *      nextapp.echo.app.Component, 
     *      java.lang.String, 
     *      java.lang.Object)
     */
    public void processEvent(Context context, Component component, String eventType, Object eventData) {
        if (Tree.INPUT_ACTION.equals(eventType) || INPUT_AND_LOAD_ACTION.equals(eventType)) {
            TreeRenderState renderState;
            if (INPUT_AND_LOAD_ACTION.equals(eventType)) {
                int row = 0;
                if (eventData != null) {
                    row = ((Integer)eventData).intValue();
                }
                renderState = new TreeRenderState(row);
            } else {
                renderState = new TreeRenderState(false);
            }
            UserInstance userInstance = (UserInstance) context.get(UserInstance.class);
            userInstance.setRenderState(component, renderState);
            
            ClientUpdateManager clientUpdateManager = (ClientUpdateManager) context.get(ClientUpdateManager.class);
            clientUpdateManager.setComponentAction(component, Tree.INPUT_ACTION, eventData);
        }
    }
    
    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#init(nextapp.echo.app.util.Context)
     */
    public void init(Context context) {
        ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
        serverMessage.addLibrary(CommonService.INSTANCE.getId());
        serverMessage.addLibrary(TREE_SERVICE.getId());
    }
}
