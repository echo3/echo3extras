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

package nextapp.echo.extras.testapp.testscreen;

import java.util.Iterator;

import nextapp.echo.app.Component;
import nextapp.echo.app.ContentPane;
import nextapp.echo.app.Extent;
import nextapp.echo.app.FillImage;
import nextapp.echo.app.ImageReference;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.ResourceImageReference;
import nextapp.echo.app.WindowPane;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.event.ChangeEvent;
import nextapp.echo.app.event.ChangeListener;
import nextapp.echo.extras.app.Tree;
import nextapp.echo.extras.app.tree.AbstractTreeModel;
import nextapp.echo.extras.app.tree.DefaultTreeCellRenderer;
import nextapp.echo.extras.app.tree.TreeColumn;
import nextapp.echo.extras.app.tree.TreeLayoutData;
import nextapp.echo.extras.app.tree.TreeModel;
import nextapp.echo.extras.app.tree.TreePath;
import nextapp.echo.extras.app.tree.TreeSelectionModel;
import nextapp.echo.extras.testapp.AbstractTest;
import nextapp.echo.extras.testapp.InteractiveApp;
import nextapp.echo.extras.testapp.MessageDialog;
import nextapp.echo.extras.testapp.StyleUtil;
import nextapp.echo.extras.testapp.Styles;
import nextapp.echo.extras.testapp.TestControlPane;

public class TreeTest extends AbstractTest {
    
 // FIXME enable when default tree model is available.    
//    private static TreeModel generateSimpleTreeModel() {
//        DefaultMutableTreeNode      root = new DefaultMutableTreeNode("Tree");
//        DefaultMutableTreeNode      parent;
//
//        parent = new DefaultMutableTreeNode("colors");
//        root.add(parent);
//        parent.add(new DefaultMutableTreeNode("blue"));
//        parent.add(new DefaultMutableTreeNode("violet"));
//        parent.add(new DefaultMutableTreeNode("red"));
//        parent.add(new DefaultMutableTreeNode("yellow"));
//
//        parent = new DefaultMutableTreeNode("sports");
//        root.add(parent);
//        parent.add(new DefaultMutableTreeNode("basketball"));
//        parent.add(new DefaultMutableTreeNode("soccer"));
//        parent.add(new DefaultMutableTreeNode("football"));
//        parent.add(new DefaultMutableTreeNode("hockey"));
//
//        parent = new DefaultMutableTreeNode("food");
//        root.add(parent);
//        parent.add(new DefaultMutableTreeNode("hot dogs"));
//        parent.add(new DefaultMutableTreeNode("pizza"));
//        parent.add(new DefaultMutableTreeNode("ravioli"));
//        parent.add(new DefaultMutableTreeNode("bananas"));
//        
//        return new DefaultTreeModel(root);
//    }
    
    static class EndlessOneNodeTreeModel extends AbstractTreeModel {
    
        public Object getChild(Object parent, int index) {
            return new Integer(((Integer)parent).intValue() + 1);
        }

        public int getChildCount(Object parent) {
            return 1;
        }

        public int getColumnCount() {
            return 1;
        }

        public int getIndexOfChild(Object parent, Object child) {
            return 0;
        }

        public Object getRoot() {
            return new Integer(0);
        }

        public Object getValueAt(Object node, int column) {
            return node;
        }

        public boolean isLeaf(Object object) {
            return false;
        }
    }
    
    private static TreeModel generateTenLevelsOneNodeTreeModel() {
        return new AbstractTreeModel() {
            
            public Object getChild(Object parent, int index) {
                if (((Integer)parent).intValue() >= 10) {
                    return null;
                }
                return new Integer(((Integer)parent).intValue() + 1);
            }
            
            public int getChildCount(Object parent) {
                if (((Integer)parent).intValue() >= 10) {
                    return 0;
                }
                return 1;
            }
            
            public int getColumnCount() {
                return 1;
            }
            
            public int getIndexOfChild(Object parent, Object child) {
                return 0;
            }
            
            public Object getRoot() {
                return new Integer(0);
            }
            
            public Object getValueAt(Object node, int column) {
                return node;
            }
            
            public boolean isLeaf(Object object) {
                return false;
            }
        };
    }
    
    private static TreeModel generateSimpleTreeTableModel() {
        return new AbstractTreeModel() {

            public Object getChild(Object parent, int index) {
                return new Integer(index);
            }

            public int getChildCount(Object parent) {
                int parentValue = ((Integer) parent).intValue();
                return parentValue;
            }
            
            public int getColumnCount() {
                return 5;
            }
            
            public Object getValueAt(Object node, int column) {
                if (0 == column) {
                    return node;
                }
                return ((Integer) node).intValue() + " - " + column;
            }

            public int getIndexOfChild(Object parent, Object child) {
                int childValue = ((Integer) child).intValue();
                return childValue;
            }

            public Object getRoot() {
                return new Integer(4);
            }

            public boolean isLeaf(Object object) {
                int objectValue = ((Integer) object).intValue();
                return objectValue == 0;
            }
        };
    }
    
    private static TreeModel generateSimpleTreeTableModelWithLongNodeValues() {
        return new AbstractTreeModel() {
            
            public Object getChild(Object parent, int index) {
                return new Integer(index);
            }
            
            public int getChildCount(Object parent) {
                int parentValue = ((Integer) parent).intValue();
                return parentValue;
            }
            
            public int getColumnCount() {
                return 5;
            }
            
            public Object getValueAt(Object node, int column) {
                if (0 == column) {
                    return node + " - Lorem ipsum dolor sit amet, consectetuer adipiscing elit.";
                }
                return ((Integer) node).intValue() + " - " + column;
            }
            
            public int getIndexOfChild(Object parent, Object child) {
                int childValue = ((Integer) child).intValue();
                return childValue;
            }
            
            public Object getRoot() {
                return new Integer(4);
            }
            
            public boolean isLeaf(Object object) {
                int objectValue = ((Integer) object).intValue();
                return objectValue == 0;
            }
        };
    }
    
    private static final FillImage[] TEST_FILL_IMAGES = new FillImage[] { null, 
        Styles.FILL_IMAGE_SHADOW_BACKGROUND_DARK_BLUE, Styles.FILL_IMAGE_SHADOW_BACKGROUND_LIGHT_BLUE,
        Styles.FILL_IMAGE_PEWTER_LINE, Styles.FILL_IMAGE_LIGHT_BLUE_LINE,
        Styles.FILL_IMAGE_SILVER_LINE};
    
    private static final ImageReference DEFAULT_FOLDER_ICON = new ResourceImageReference("nextapp/echo/extras/app/resource/image/TreeFolder.gif");
    private static final ImageReference DEFAULT_LEAF_ICON = new ResourceImageReference("nextapp/echo/extras/app/resource/image/TreeLeaf.gif");
    
    final Tree tree;
    final ContentPane pane;
    public TreeTest() {
        
        super("Tree", Styles.ICON_16_TREE);
        
        pane = new ContentPane();
        add(pane);
        
        tree = new Tree(generateSimpleTreeTableModel());
        pane.add(tree);
        
        setTestComponent(this, tree);
        // Add/Remove Tabs
        
        addFontPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_FONT);
        addBorderPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_BORDER);
        addInsetsPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_INSETS);
        
        addIntegerPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_LINE_STYLE, new int[] {0, 1, 2});
        
        addBooleanPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_ROLLOVER_ENABLED);
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_ROLLOVER_FOREGROUND);
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_ROLLOVER_BACKGROUND);
        addBorderPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_ROLLOVER_BORDER);
        addFontPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_ROLLOVER_FONT);
        addFillImagePropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_ROLLOVER_BACKGROUND_IMAGE, TEST_FILL_IMAGES);
        
        addBooleanPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_SELECTION_ENABLED);
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set SelectionMode = Single", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tree.getSelectionModel().setSelectionMode(TreeSelectionModel.SINGLE_SELECTION);
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set SelectionMode = Multiple", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tree.getSelectionModel().setSelectionMode(TreeSelectionModel.MULTIPLE_SELECTION);
            }
        });
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_SELECTION_FOREGROUND);
        addColorPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_SELECTION_BACKGROUND);
        addBorderPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_SELECTION_BORDER);
        addFontPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_SELECTION_FONT);
        addFillImagePropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_SELECTION_BACKGROUND_IMAGE, TEST_FILL_IMAGES);
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Use default node icons", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                ((DefaultTreeCellRenderer)tree.getCellRenderer()).setFolderIcon(DEFAULT_FOLDER_ICON);
                ((DefaultTreeCellRenderer)tree.getCellRenderer()).setLeafIcon(DEFAULT_LEAF_ICON);
                // hack to invalidate the tree
                tree.setCellRenderer(tree.getCellRenderer());
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Use no node icons", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                ((DefaultTreeCellRenderer)tree.getCellRenderer()).setFolderIcon(null);
                ((DefaultTreeCellRenderer)tree.getCellRenderer()).setLeafIcon(null);
                // hack to invalidate the tree
                tree.setCellRenderer(tree.getCellRenderer());
            }
        });
        
        addBooleanPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_HEADER_VISIBLE);
        addBooleanPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_ROOT_VISIBLE);
        addBooleanPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_SHOWS_ROOT_HANDLE);
        
        addExtentPropertyTests(TestControlPane.CATEGORY_PROPERTIES, Tree.PROPERTY_WIDTH, new Extent[] {new Extent(500), new Extent(100, Extent.PERCENT), null});
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set column widths (px)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                int width = 100;
                Iterator iterator = tree.getColumnModel().getColumns();
                while (iterator.hasNext()) {
                    TreeColumn column = (TreeColumn)iterator.next();
                    column.setWidth(new Extent(width));
                    width -= 10;
                }
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Set column widths (%)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                int width = 100 / tree.getColumnModel().getColumnCount();
                Iterator iterator = tree.getColumnModel().getColumns();
                while (iterator.hasNext()) {
                    TreeColumn column = (TreeColumn)iterator.next();
                    column.setWidth(new Extent(width, Extent.PERCENT));
                }
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Reset column widths", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Iterator iterator = tree.getColumnModel().getColumns();
                while (iterator.hasNext()) {
                    TreeColumn column = (TreeColumn)iterator.next();
                    column.setWidth(null);
                }
            }
        });
        testControlsPane.addControl(TestControlPane.CATEGORY_PROPERTIES, new Label("Cell Renderer Tests"));
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Reset cell renderer", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tree.setCellRenderer(new DefaultTreeCellRenderer());
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Random cell backgrounds", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tree.setCellRenderer(new DefaultTreeCellRenderer() {
                    public Component getTreeCellRendererComponent(Tree tree,
                            TreePath treePath, Object value, int column,
                            int row, boolean leaf) {
                        Component component = super.getTreeCellRendererComponent(tree, treePath, value, column, row,
                                leaf);
                        TreeLayoutData layout = new TreeLayoutData();
                        layout.setBackground(StyleUtil.randomColor());
                        component.setLayoutData(layout);
                        return component;
                    }
                });
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Random header backgrounds", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tree.setDefaultHeaderRenderer(new DefaultTreeCellRenderer() {
                    public Component getTreeCellRendererComponent(Tree tree,
                            TreePath treePath, Object value, int column,
                            int row, boolean leaf) {
                        Component component = super.getTreeCellRendererComponent(tree, treePath, value, column, row,
                                leaf);
                        TreeLayoutData layout = new TreeLayoutData();
                        layout.setBackground(StyleUtil.randomColor());
                        component.setLayoutData(layout);
                        return component;
                    }
                });
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_PROPERTIES, "Random cell insets (0-10px)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tree.setCellRenderer(new DefaultTreeCellRenderer() {
                    public Component getTreeCellRendererComponent(Tree tree,
                            TreePath treePath, Object value, int column,
                            int row, boolean leaf) {
                        Component component = super.getTreeCellRendererComponent(tree, treePath, value, column, row,
                                leaf);
                        TreeLayoutData layout = new TreeLayoutData();
                        layout.setInsets(new Insets(StyleUtil.randomExtent(10)));
                        component.setLayoutData(layout);
                        return component;
                    }
                });
            }
        });
        
// FIXME enable when default tree model is available.        
//        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Simple tree model", new ActionListener() {
//            public void actionPerformed(ActionEvent e) {
//                tree.setModel(generateSimpleTreeModel());
//                tree.setHeaderVisible(false);
//            }
//        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Simple treetable model", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tree.setModel(generateSimpleTreeTableModel());
                tree.setHeaderVisible(true);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Simle treetable model with long node values", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tree.setModel(generateSimpleTreeTableModelWithLongNodeValues());
                tree.setHeaderVisible(false);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Tree model (always one child, max 10 levels deep)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tree.setModel(generateTenLevelsOneNodeTreeModel());
                tree.setHeaderVisible(false);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Tree model (always one child)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tree.setModel(new EndlessOneNodeTreeModel());
                tree.setHeaderVisible(false);
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Expand all nodes", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (tree.getModel() instanceof EndlessOneNodeTreeModel) {
                    getApplicationInstance().getDefaultWindow().getContent().add(
                            new MessageDialog("I'm afraid I can't do that Dave.", 
                                    "Expanding all nodes of an endless tree model will certainly result in an infinite loop.", 
                                    MessageDialog.CONTROLS_OK));
                } else {
                    tree.expandAll();
                }
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Collapse all nodes", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tree.collapseAll();
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_INTEGRATION, "toggle visibility", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tree.setVisible(!tree.isVisible());
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_INTEGRATION, "Add test window pane", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                WindowPane windowPane = new WindowPane("Tree Test Window Pane", new Extent(400), new Extent(400));
                windowPane.setStyleName("Default");
                Tree tree2 = new Tree(generateSimpleTreeTableModel());
                windowPane.add(tree2);
                pane.add(windowPane);
                
                tree2.setSelectionEnabled(true);
                tree2.setSelectionBackground(StyleUtil.randomBrightColor());
                final TreeSelectionModel selectionModel = tree2.getSelectionModel();
                selectionModel.setSelectionMode(TreeSelectionModel.SINGLE_SELECTION);
                selectionModel.addChangeListener(new ChangeListener() {
                    public void stateChanged(ChangeEvent e) {
                        TreePath path = selectionModel.getSelectionPath();
                        InteractiveApp.getApp().consoleWrite("Select changed, new path: " + path);
                    }
                });
            }
        });
        
        testControlsPane.addButton(TestControlPane.CATEGORY_INTEGRATION, "Re-add tree", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                pane.remove(tree);
                pane.add(tree);
            }
        });
    }
}
