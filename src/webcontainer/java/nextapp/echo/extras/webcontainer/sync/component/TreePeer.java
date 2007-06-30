package nextapp.echo.extras.webcontainer.sync.component;

import java.util.Iterator;

import nextapp.echo.app.Component;
import nextapp.echo.app.Table;
import nextapp.echo.app.serial.SerialException;
import nextapp.echo.app.serial.SerialPropertyPeer;
import nextapp.echo.app.update.ClientUpdateManager;
import nextapp.echo.app.update.ServerComponentUpdate;
import nextapp.echo.app.util.Context;
import nextapp.echo.extras.app.Tree;
import nextapp.echo.extras.app.tree.TreeModel;
import nextapp.echo.extras.app.tree.TreePath;
import nextapp.echo.webcontainer.AbstractComponentSynchronizePeer;
import nextapp.echo.webcontainer.RenderState;
import nextapp.echo.webcontainer.ServerMessage;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.UserInstance;
import nextapp.echo.webcontainer.WebContainerServlet;
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
        
        public TreeRenderState(int row) {
            this.row = row;
        }
        
        public int getRow() {
            return row;
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
        }
        
        private void render(TreeRenderState renderState) {
            Object value = null;
            String parentId = null;
            if (renderState == null || renderState.getRow() == 0) {
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
            if (expanded) {
                eElement.setAttribute("ex", "1");
            } else if (model.isLeaf(value)) {
                eElement.setAttribute("l", "1");
            }
            propertyElement.appendChild(eElement);

            int childCount = model.getChildCount(value);

            ++row;
            
            if (expanded) {
                for (int i = 0; i < childCount; ++i) {
                    renderNode(id, model.getChild(value, i));
                }
            }
            
        }
    }
    
    private static int getColumnCount(Tree tree) {
        return 1; // FIXME
    }

    private static final String PROPERTY_TREE_STRUCTURE = "treeStructure";
    private static final String PROPERTY_COLUMN_COUNT = "columnCount";
    
    private static final String[] MODEL_CHANGED_UPDATE_PROPERTIES = new String[] { PROPERTY_TREE_STRUCTURE,
            PROPERTY_COLUMN_COUNT };
    
    private static final String[] EVENT_TYPES_ACTION = new String[] { Table.INPUT_ACTION };
    
    private static final Service TREE_SERVICE = JavaScriptService.forResources("EchoExtras.RemoteTree",  
            new String[]{ "/nextapp/echo/extras/webcontainer/resource/js/Application.RemoteTree.js",
                    "/nextapp/echo/extras/webcontainer/resource/js/Serial.RemoteTree.js",
                    "/nextapp/echo/extras/webcontainer/resource/js/Render.RemoteTree.js" });
    
    static {
        WebContainerServlet.getServiceRegistry().add(TREE_SERVICE);
    }
    
    public TreePeer() {
        super();
        addOutputProperty(PROPERTY_TREE_STRUCTURE);
        addOutputProperty(PROPERTY_COLUMN_COUNT);
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
        }
        return super.getOutputProperty(context, component, propertyName, propertyIndex);
    }
    
    public Class getEventDataClass(String eventType) {
        if (Tree.INPUT_ACTION.equals(eventType)) {
            return Integer.class;
        }
        return super.getPropertyClass(eventType);
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
        
        if (update.hasUpdatedProperty(Tree.MODEL_CHANGED_PROPERTY)) {
            return new MultiIterator(
                    new Iterator[]{ normalPropertyIterator, new ArrayIterator(MODEL_CHANGED_UPDATE_PROPERTIES) });
        } else if (update.hasUpdatedProperty(Tree.EXPANSION_STATE_CHANGED_PROPERTY)) {
            return new ArrayIterator(new String[] {PROPERTY_TREE_STRUCTURE});
        } else {
            return normalPropertyIterator;
        }
    }
    
    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getImmediateEventTypes(
     *      nextapp.echo.app.util.Context, 
     *      nextapp.echo.app.Component)
     */
    public Iterator getImmediateEventTypes(Context context, Component component) {
        Tree tree = (Tree)component;
        return new ArrayIterator(EVENT_TYPES_ACTION);
//        return super.getImmediateEventTypes(context, component);
    }
    
    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#processEvent(
     *      nextapp.echo.app.util.Context, 
     *      nextapp.echo.app.Component, 
     *      java.lang.String, 
     *      java.lang.Object)
     */
    public void processEvent(Context context, Component component, String eventType, Object eventData) {
        if (Tree.INPUT_ACTION.equals(eventType)) {
            TreeRenderState renderState = new TreeRenderState(((Integer)eventData).intValue());
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
        serverMessage.addLibrary(TREE_SERVICE.getId());
    }
}
