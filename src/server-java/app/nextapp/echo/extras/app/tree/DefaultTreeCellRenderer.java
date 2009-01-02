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

package nextapp.echo.extras.app.tree;

import nextapp.echo.app.Component;
import nextapp.echo.app.ImageReference;
import nextapp.echo.app.Label;
import nextapp.echo.app.ResourceImageReference;
import nextapp.echo.extras.app.Tree;

/**
 * Default <code>TreeCellRenderer</code> implementation.
 */
//FIXME reconsider the icon setters. 
//FIXME maybe set the icon in a LayoutData or something, 
//          text-decoration property doesn't inherit through html table elements (label with icon is rendered as a table).
//          and maybe we do not want de background of the icon change on rollover / selection
public class DefaultTreeCellRenderer 
implements TreeCellRenderer {
    
    private ImageReference leafIcon;
    private ImageReference folderIcon;

    public DefaultTreeCellRenderer() {
        leafIcon = new ResourceImageReference("nextapp/echo/extras/app/resource/image/TreeLeaf.gif");
        folderIcon = new ResourceImageReference("nextapp/echo/extras/app/resource/image/TreeFolder.gif");
    }
    
    /**
     * @see nextapp.echo.extras.app.tree.TreeCellRenderer#getTreeCellRendererComponent(nextapp.echo.extras.app.Tree, nextapp.echo.extras.app.tree.TreePath, java.lang.Object, int, int, boolean)
     */
    public Component getTreeCellRendererComponent(Tree tree, TreePath treePath, Object value, int column, int row, boolean leaf) {
        ImageReference icon = null;
        if (column == 0 && row != -1) {
            if (leaf) {
                icon = leafIcon;
            } else {
                icon = folderIcon;
            }
        }
        return value == null ? new Label(icon) : new Label(value.toString(), icon);
    }
    
    public void setLeafIcon(ImageReference newValue) {
        this.leafIcon = newValue;
    }
    
    public void setFolderIcon(ImageReference newValue) {
        this.folderIcon = newValue;
    }

}
