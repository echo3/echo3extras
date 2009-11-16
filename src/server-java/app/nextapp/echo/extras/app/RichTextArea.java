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

package nextapp.echo.extras.app;

import java.util.EventListener;
import java.util.Map;

import nextapp.echo.app.Border;
import nextapp.echo.app.Component;
import nextapp.echo.app.FillImage;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.event.DocumentEvent;
import nextapp.echo.app.event.DocumentListener;
import nextapp.echo.app.text.Document;
import nextapp.echo.app.text.StringDocument;
import nextapp.echo.extras.app.event.RichTextOperationEvent;
import nextapp.echo.extras.app.event.RichTextOperationListener;

//FIXME review features icon/names, remove warning.
/**
 * RichTextArea component: a rich text user input field which allows the user to
 * select text styles, and insert/manipulate objects such as links, images, enumerated
 * lists, or tables.  This component may not contain children.
 * 
 * Security warning: HTML input provided by this component should be considered
 * potentially malicious. Directly rendering the HTML entered by one user to
 * other users of a multi-user application without first "cleaning" it could be
 * disastrous to the other users. For example, a user could potentially embed
 * JavaScript code in URLs that would execute in the other users' browsers. Any
 * cleaning operations must be performed on the client that will render such
 * HTML (not the client sending it) or on a central trusted server.
 * 
 * This component contains several String properties which end with the suffix "StyleName".
 * These properties may be used to configure the look and feel of the <code>RichTextArea</code>, such
 * that sub-components, e.g., its <code>MenuBarPane</code> or <code>WindowPane</code> will be styled
 * in accordance with the containing application.  See the documentation of specific --StyleName() methods for details.  
 * 
 * WARNING: Feature/icon names are under review, subject to change.
 */
public class RichTextArea extends Component {

    public static final String ICON_ALIGNMENT = "alignment";
    public static final String ICON_ALIGNMENT_CENTER = "alignmentCenter";
    public static final String ICON_ALIGNMENT_JUSTIFY = "alignmentJustify";
    public static final String ICON_ALIGNMENT_LEFT = "alignmentLeft";
    public static final String ICON_ALIGNMENT_RIGHT = "alignmentRight";
    public static final String ICON_BACKGROUND = "background";
    public static final String ICON_BOLD = "bold";
    public static final String ICON_BULLETED_LIST = "bulletedList";
    public static final String ICON_CANCEL = "cancel";
    public static final String ICON_COPY = "copy";
    public static final String ICON_CUT = "cut";
    public static final String ICON_DELETE = "delete";
    public static final String ICON_FOREGROUND = "foreground";
    public static final String ICON_FORMAT_PARAGRAPH_STYLE = "paragraphStyle";
    public static final String ICON_FORMAT_TEXT_STYLE = "textStyle";
    public static final String ICON_HORIZONTAL_RULE = "horizontalRule";
    public static final String ICON_HYPERLINK = "hyperlink";
    public static final String ICON_IMAGE = "image";
    public static final String ICON_INDENT = "indent";
    public static final String ICON_ITALIC = "italic";
    public static final String ICON_NUMBERED_LIST = "numberedList";
    public static final String ICON_OK = "ok";
    public static final String ICON_OUTDENT = "outdent";
    public static final String ICON_PARAGRAPH_STYLE_HEADING_1 = "styleH1";
    public static final String ICON_PARAGRAPH_STYLE_HEADING_2 = "styleH2";
    public static final String ICON_PARAGRAPH_STYLE_HEADING_3 = "styleH3";
    public static final String ICON_PARAGRAPH_STYLE_HEADING_4 = "styleH4";
    public static final String ICON_PARAGRAPH_STYLE_HEADING_5 = "styleH5";
    public static final String ICON_PARAGRAPH_STYLE_HEADING_6 = "styleH6";
    public static final String ICON_PARAGRAPH_STYLE_NORMAL = "styleNormal";
    public static final String ICON_PARAGRAPH_STYLE_PREFORMATTED = "stylePreformatted";
    public static final String ICON_PASTE = "paste";
    public static final String ICON_PLAIN_TEXT = "plainText";
    public static final String ICON_REDO = "redo";
    public static final String ICON_SELECT_ALL = "selectAll";
    public static final String ICON_STRIKETHROUGH = "strikethrough";
    public static final String ICON_SUBSCRIPT = "subscript";
    public static final String ICON_SUPERSCRIPT = "superscript";
    public static final String ICON_TABLE = "table";
    public static final String ICON_TABLE_COLUMN_DELETE = "tableDeleteColumn";
    public static final String ICON_TABLE_COLUMN_INSERT = "tableInsertColumn";
    public static final String ICON_TABLE_ROW_DELETE = "tableDeleteRow";
    public static final String ICON_TABLE_ROW_INSERT = "tableInsertRow";
    public static final String ICON_UNDERLINE = "underline";
    public static final String ICON_UNDO = "undo";
    
    /** 
     * Feature name describing pulldown menu placed above the editor. 
     * Either this feature and/or the toolbar must be enabled to access to the majority of other features. 
     */
    public static final String FEATURE_MENU = "menu";
    
    /** 
     * Feature name describing tool bar placed above the editor. 
     * Either this feature and/or the menu must be enabled to access to the majority of other features. 
     */
    public static final String FEATURE_TOOLBAR = "toolbar";
    
    /** Feature name describing undo/redo functions. */
    public static final String FEATURE_UNDO = "undo";
    
    /** Feature name describing clipboard access (cut/copy/paste) features. */
    public static final String FEATURE_CLIPBOARD = "clipboard";
    
    /** Feature name describing paragraph alignment settings (left/center/right/justify). */
    public static final String FEATURE_ALIGNMENT = "alignment";
    
    /** Feature name describing capability to set foreground color of text to arbitrary colors. */
    public static final String FEATURE_FOREGROUND = "foreground";
    
    /** Feature name describing capability to set background color of text to arbitrary colors. */
    public static final String FEATURE_BACKGROUND = "background";
    
    /** 
     * Feature name describing capability to add lists, both numbered and bulleted.
     * Equivalent to setting both <code>FEATURE_NUMBERED_LIST</code> and <code>FEATURE_BULLETED_LIST</code>. 
     */
    public static final String FEATURE_LIST = "list";
    
    /** Feature name describing capability to add bulleted lists. */
    public static final String FEATURE_BULLETED_LIST = "bulletedList";
    
    /** Feature name describing capability to add numbered lists. */
    public static final String FEATURE_NUMBERED_LIST = "numberedList";
    
    /** Feature name describing capability to add and manipulate tables. */
    public static final String FEATURE_TABLE = "table";
    
    /** 
     * Feature name describing capability to add images.  
     * Default implementation provides capability to add images by entering URL only. 
     */
    public static final String FEATURE_IMAGE = "image";
    
    /** Feature name describing capability to add horizontal rules. */
    public static final String FEATURE_HORIZONTAL_RULE = "horizontalRule";

    /** Feature name describing capability to add hyperlinks to arbitrary URLs. */
    public static final String FEATURE_HYPERLINK = "hyperlink";

    /** Feature name describing capability to display fonts in superscript and subscript. */
    public static final String FEATURE_SUBSCRIPT = "subscript";
    
    /** Feature name describing capability to display bold text. */
    public static final String FEATURE_BOLD = "bold";
    
    /** Feature name describing capability to display italic text. */
    public static final String FEATURE_ITALIC = "italic";
    
    /** Feature name describing capability to display underline text. */
    public static final String FEATURE_UNDERLINE = "underline";
    
    /** Feature name describing capability to display strike-through text. */
    public static final String FEATURE_STRIKETHROUGH = "strikethrough";
    
    /** Feature name describing capability to control paragraph style, e.g., add headings. */
    public static final String FEATURE_PARAGRAPH_STYLE= "paragraphStyle";
    
    /** Feature name describing capability to control paragraph indentation level. */
    public static final String FEATURE_INDENT= "indent";

    public static final String ACTION_LISTENERS_CHANGED_PROPERTY = "actionListeners";
    public static final String DOCUMENT_CHANGED_PROPERTY = "document";
    public static final String OPERATION_LISTENERS_CHANGED_PROPERTY = "operationListeners";
    public static final String TEXT_CHANGED_PROPERTY = "text";
    
    public static final String INPUT_ACTION = "action";
    public static final String INPUT_OPERATION = "operation";
    
    public static final String OPERATION_INSERT_IMAGE = "insertImage";
    public static final String OPERATION_INSERT_HYPERLINK = "insertHyperlink";
    public static final String OPERATION_INSERT_TABLE = "insertTable";

    public static final String PROPERTY_ACTION_COMMAND = "actionCommand";
    public static final String PROPERTY_BACKGROUND_IMAGE = "backgroundImage";
    public static final String PROPERTY_BORDER = "border";
    public static final String PROPERTY_CONTROL_PANE_BUTTON_STYLE_NAME = "controlPaneButtonStyleName";
    public static final String PROPERTY_CONTROL_PANE_ROW_STYLE_NAME = "controlPaneRowStyleName";
    public static final String PROPERTY_CONTROL_PANE_SPLIT_PANE_STYLE_NAME = "controlPaneSplitPaneStyleName";
    public static final String PROPERTY_FEATURES = "features";
    public static final String PROPERTY_ICONS = "icons";
    public static final String PROPERTY_MENU_STYLE_NAME = "menuStyleName";
    public static final String PROPERTY_OVERRIDE_INSERT_HYPERLINK = "overrideInsertHyperlink";
    public static final String PROPERTY_OVERRIDE_INSERT_IMAGE = "overrideInsertImage";
    public static final String PROPERTY_OVERRIDE_INSERT_TABLE = "overrideInsertTable";
    public static final String PROPERTY_TOOLBAR_BUTTON_STYLE_NAME = "toolbarButtonStyleName";
    public static final String PROPERTY_TOOLBAR_PANEL_STYLE_NAME = "toolbarPanelStyleName";
    public static final String PROPERTY_WINDOW_PANE_STYLE_NAME = "windowPaneStyleName";

    private Document document;
    
    /**
     * Local listener to monitor changes to document.
     */
    private DocumentListener documentListener = new DocumentListener() {

        /** Serial Version UID. */
        private static final long serialVersionUID = 20070101L;
    
        /**
         * @see nextapp.echo.app.event.DocumentListener#documentUpdate(nextapp.echo.app.event.DocumentEvent)
         */
        public void documentUpdate(DocumentEvent e) {
            firePropertyChange(TEXT_CHANGED_PROPERTY, null, ((Document) e.getSource()).getText());
        }
    };
    
    /**
     * Creates a new <code>RichTextArea</code> with an empty 
     * <code>StringDocument</code> as its model.
     */
    public RichTextArea() {
        this(new StringDocument());
    }

    /**
     * Creates a new <code>RichTextArea</code> with the specified
     * <code>Document</code> as its model.
     * 
     * @param document the desired model
     */
    public RichTextArea(Document document) {
        super();
        setDocument(document);
    }
    
    /**
     * Adds an <code>ActionListener</code> to the component.
     * The <code>ActionListener</code> will be invoked when the user presses the ENTER key.
     * 
     * @param l the <code>ActionListener</code> to add
     */
    public void addActionListener(ActionListener l) {
        getEventListenerList().addListener(ActionListener.class, l);
        firePropertyChange(ACTION_LISTENERS_CHANGED_PROPERTY, null, l);
    }
    
    /**
     * Adds a <code>RichTextOperationListener</code> to the component.
     * The <code>RichTextOperationListener</code> will be invoked when the user performs an overridden operation.
     * 
     * @param l the <code>RichTextOperationListener</code> to add
     */
    public void addOperationListener(RichTextOperationListener l) {
        getEventListenerList().addListener(RichTextOperationListener.class, l);
        firePropertyChange(OPERATION_LISTENERS_CHANGED_PROPERTY, null, l);
    }

    /**
     * Fires an <code>ActionEvent</code> to all <code>ActionListener</code>s.
     */
    private void fireActionPerformed() {
        if (!hasEventListenerList()) {
            return;
        }
        EventListener[] listeners = getEventListenerList().getListeners(ActionListener.class);
        ActionEvent e = null;
        for (int i = 0; i < listeners.length; ++i) {
            if (e == null) {
                e = new ActionEvent(this, (String) getRenderProperty(PROPERTY_ACTION_COMMAND));
            } 
            ((ActionListener) listeners[i]).actionPerformed(e);
        }
    }

    /**
     * Fires a <code>RichTextOperationEvent</code> event to all <code>RichTextOperationListener</code>s.
     * 
     * @param operationName the name of the operation
     */
    private void fireOperationPerformed(String operationName) {
        if (!hasEventListenerList()) {
            return;
        }
        EventListener[] listeners = getEventListenerList().getListeners(RichTextOperationListener.class);
        RichTextOperationEvent e = null;
        for (int i = 0; i < listeners.length; ++i) {
            if (e == null) {
                e = new RichTextOperationEvent(this, operationName);
            } 
            ((RichTextOperationListener) listeners[i]).operationPerformed(e);
        }
    }
    
    /**
     * Returns the action command which will be provided in 
     * <code>ActionEvent</code>s fired by this <code>TextComponent</code>.
     * 
     * @return the action command
     */
    public String getActionCommand() {
        return (String) get(PROPERTY_ACTION_COMMAND);
    }
    
    /**
     * Returns the background image of the text entry area.
     * 
     * @return the background image
     */
    public FillImage getBackgroundImage() {
        return (FillImage) get(PROPERTY_BACKGROUND_IMAGE);
    }
    
    /**
     * Returns the border surrounding the text entry area.
     * 
     * @return the border
     */
    public Border getBorder() {
        return (Border) get(PROPERTY_BORDER);
    }
    
    /**
     * Returns the style name to use for <code>Button</code>s added to "control panes".
     * 
     * @return the style name
     */
    public String getControlPaneButtonStyleName() {
        return (String) get(PROPERTY_CONTROL_PANE_BUTTON_STYLE_NAME);
    }
    
    /**
     * Returns the style name to use for the "control pane" <code>Row</code>s.  These <code>Row</code>
     * components are placed in <code>SplitPane</code>s and house control buttons for dialog windows (e.g., Ok/Cancel).
     * 
     * @return the style name
     */
    public String getControlPaneRowStyleName() {
        return (String) get(PROPERTY_CONTROL_PANE_ROW_STYLE_NAME);
    }
    
    /**
     * Returns the style name for the <code>SplitPane</code> which divides a dialog window's content from its control pane 
     * <code>Row</code>.
     * 
     * @return the style name
     */
    public String getControlPaneSplitPaneStyleName() {
        return (String) get(PROPERTY_CONTROL_PANE_SPLIT_PANE_STYLE_NAME);
    }
    
    /**
     * Returns the model associated with this <code>RichTextArea</code>.
     * 
     * @return the model
     */
    public Document getDocument() {
        return document;
    }
    
    /**
     * Retrieves the map containing enabled features.  If null, the client will render its default feature-set.
     * If non-null, only features specified in the features map will be available.  The <code>FEATURE_???</code> 
     * constants should be used as keys, with values of <code>Boolean.TRUE</code> for enabled features.
     * 
     * @return the features map
     */
    public Map getFeatures() {
        return (Map) get(PROPERTY_FEATURES);
    }
    
    /**
     * Retrieves the map containing customized icons.  If null, the client will use default icons.
     * If non-null, any overridden icons will be used in place of the defaults.  The <code>ICON_???</code>
     * constants should be used as keys, with <code>ImageReference</code> values.
     * 
     * @return the icons map
     */
    public Map getIcons() {
        return (Map) get(PROPERTY_ICONS);
    }
    
    /**
     * Returns the style name for the <code>MenuBarPane</code> displayed by the text area.
     * 
     * @return the style name
     */
    public String getMenuStyleName() {
        return (String) get(PROPERTY_MENU_STYLE_NAME);
    }
    
    /**
     * Returns the text contained in the <code>Document</code> model of
     * this rich text area.
     * Note that this HTML is not "cleaned" in any way, and could potentially
     * contain malicious code.
     * 
     * @return the text contained in the document
     */
    public String getText() {
        return document.getText();
    }
    
    /**
     * Returns the style name for the toolbar <code>Button</code>s.
     * 
     * @return the style name
     */
    public String getToolbarButtonStyleName() {
        return (String) get(PROPERTY_TOOLBAR_BUTTON_STYLE_NAME);
    }
    
    /**
     * Returns the style name for the toolbar <code>Panel</code>.
     * 
     * @return the style name
     */
    public String getToolbarPanelStyleName() {
        return (String) get(PROPERTY_TOOLBAR_PANEL_STYLE_NAME);
    }
    
    /**
     * Returns the style name for <code>WindowPane</code>s displayed by the text area.
     * 
     * @return the style name
     */
    public String getWindowPaneStyleName() {
        return (String) get(PROPERTY_WINDOW_PANE_STYLE_NAME);
    }

    /**
     * Determines if any <code>ActionListener</code>s are registered.
     * 
     * @return true if any action listeners are registered
     */
    public boolean hasActionListeners() {
        return hasEventListenerList() && getEventListenerList().getListenerCount(ActionListener.class) != 0;
    }

    /**
     * Determines if any <code>OperationListener</code>s are registered.
     * 
     * @return true if any operation listeners are registered
     */
    public boolean hasOperationListeners() {
        return hasEventListenerList() && getEventListenerList().getListenerCount(RichTextOperationListener.class) != 0;
    }
    
    /**
     * Determines whether the insert hyperlink operation is overridden, i.e., whether insert hyperlink requests will be sent
     * to the server via a <code>RichTextOperationEvent</code>.
     * 
     * @return true if the operation is overridden
     */
    public boolean isOverrideInsertHyperlink() {
        Boolean value = (Boolean) get(PROPERTY_OVERRIDE_INSERT_HYPERLINK);
        return value != null && value.booleanValue();
    }
    
    /**
     * Determines whether the insert image operation is overridden, i.e., whether insert image requests will be sent
     * to the server via a <code>RichTextOperationEvent</code>.
     * 
     * @return true if the operation is overridden
     */
    public boolean isOverrideInsertImage() {
        Boolean value = (Boolean) get(PROPERTY_OVERRIDE_INSERT_IMAGE);
        return value != null && value.booleanValue();
    }
    
    /**
     * Determines whether the insert table operation is overridden, i.e., whether insert table requests will be sent
     * to the server via a <code>RichTextOperationEvent</code>.
     * 
     * @return true if the operation is overridden
     */
    public boolean isOverrideInsertTable() {
        Boolean value = (Boolean) get(PROPERTY_OVERRIDE_INSERT_TABLE);
        return value != null && value.booleanValue();
    }
    
    /**
     * @see nextapp.echo.app.Component#processInput(java.lang.String, java.lang.Object)
     */
    public void processInput(String inputName, Object inputValue) {
        super.processInput(inputName, inputValue);
        
        if (TEXT_CHANGED_PROPERTY.equals(inputName)) {
            setText((String) inputValue);
        } else if (INPUT_ACTION.equals(inputName)) {
            fireActionPerformed();
        } else if (INPUT_OPERATION.equals(inputName)) {
            fireOperationPerformed((String) inputValue);
        }
    }
    
    /**
     * Removes an <code>ActionListener</code> from the component.
     * 
     * @param l the <code>ActionListener</code> to remove
     */
    public void removeActionListener(ActionListener l) {
        if (!hasEventListenerList()) {
            return;
        }
        getEventListenerList().removeListener(ActionListener.class, l);
        firePropertyChange(ACTION_LISTENERS_CHANGED_PROPERTY, l, null);
    }
        
    /**
     * Removes a <code>RichTextOperationListener</code> from the component.
     * 
     * @param l the <code>RichTextOperationListener</code> to remove
     */
    public void removeOperationListener(RichTextOperationListener l) {
        if (!hasEventListenerList()) {
            return;
        }
        getEventListenerList().removeListener(RichTextOperationListener.class, l);
        firePropertyChange(OPERATION_LISTENERS_CHANGED_PROPERTY, l, null);
    }

    /**
     * Sets the action command which will be provided in
     * <code>ActionEvent</code>s fired by this component.
     * 
     * @param newValue the new action command
     */
    public void setActionCommand(String newValue) {
        set(PROPERTY_ACTION_COMMAND, newValue);
    }
    
    /**
     * Sets the background image displayed in the text entry area.
     * 
     * @param newValue the new background image
     */
    public void setBackgroundImage(FillImage newValue) {
        set(PROPERTY_BACKGROUND_IMAGE, newValue);
    }
    
    /**
     * Sets the border displayed around the text entry area.
     * 
     * @param newValue the new border
     */
    public void setBorder(Border newValue) {
        set(PROPERTY_BORDER, newValue);
    }

    /**
     * Sets the style name to use for <code>Button</code>s added to "control panes".
     * 
     * @param newValue the new style name
     */
    public void setControlPaneButtonStyleName(String newValue) {
        set(PROPERTY_CONTROL_PANE_BUTTON_STYLE_NAME, newValue);
    }

    /**
     * Sets the style name to use for the "control pane" <code>Row</code>s.  These <code>Row</code>
     * components are placed in <code>SplitPane</code>s and house control buttons for dialog windows (e.g., Ok/Cancel).
     * 
     * @param newValue the new style name
     */
    public void setControlPaneRowStyleName(String newValue) {
        set(PROPERTY_CONTROL_PANE_ROW_STYLE_NAME, newValue);
    }
    
    /**
     * Sets the style name for the <code>SplitPane</code> which divides a dialog window's content from its control pane 
     * <code>Row</code>.
     * 
     * @param newValue the new style name
     */
    public void setControlPaneSplitPaneStyleName(String newValue) {
        set(PROPERTY_CONTROL_PANE_SPLIT_PANE_STYLE_NAME, newValue);
    }
    
    /**
     * Sets the model associated with this <code>RichTextArea</code>.
     * 
     * @param newValue the new model (may not be null)
     */
    public void setDocument(Document newValue) {
        if (newValue == null) {
            throw new IllegalArgumentException("Document may not be null.");
        }
        Document oldValue = getDocument();
        if (oldValue != null) {
            oldValue.removeDocumentListener(documentListener);
        }
        newValue.addDocumentListener(documentListener);
        document = newValue;
    }
    
    /**
     * Sets the map containing enabled features.  If null, the client will render its default feature-set.
     * If non-null, only features specified in the features map will be available.  The <code>FEATURE_???</code> 
     * constants should be used as keys, with values of <code>Boolean.TRUE</code> for enabled features.
     * 
     * @param newValue the new features map
     */
    public void setFeatures(Map newValue) {
        set(PROPERTY_FEATURES, newValue);
    }
    
    /**
     * Sets the map containing customized icons.  If null, the client will use default icons.
     * If non-null, any overridden icons will be used in place of the defaults.  The <code>ICON_???</code>
     * constants should be used as keys, with <code>ImageReference</code> values.
     * 
     * @param newValue the new icons map
     */
    public void setIcons(Map newValue) {
        set(PROPERTY_ICONS, newValue);
    }
    
    /**
     * Sets the style name for the <code>MenuBarPane</code> displayed by the text area.
     * 
     * @param newValue the new style name
     */
    public void setMenuStyleName(String newValue) {
        set(PROPERTY_MENU_STYLE_NAME, newValue);
    }
    
    /**
     * Sets whether the insert hyperlink operation is overridden, i.e., whether insert hyperlink requests will be sent
     * to the server via a <code>RichTextOperationEvent</code>.
     * 
     * @param newValue the new override state
     */
    public void setOverrideInsertHyperlink(boolean newValue) {
        set(PROPERTY_OVERRIDE_INSERT_HYPERLINK, Boolean.valueOf(newValue));
    }
    
    /**
     * Sets whether the insert image operation is overridden, i.e., whether insert image requests will be sent
     * to the server via a <code>RichTextOperationEvent</code>.
     * 
     * @param newValue the new override state
     */
    public void setOverrideInsertImage(boolean newValue) {
        set(PROPERTY_OVERRIDE_INSERT_IMAGE, Boolean.valueOf(newValue));
    }
    
    /**
     * Sets whether the insert table operation is overridden, i.e., whether insert table requests will be sent
     * to the server via a <code>RichTextOperationEvent</code>.
     * 
     * @param newValue the new override state
     */
    public void setOverrideInsertTable(boolean newValue) {
        set(PROPERTY_OVERRIDE_INSERT_TABLE, Boolean.valueOf(newValue));
    }
    
    /**
     * Sets the text of document model of this rich text area.
     * 
     * @param newValue the new text
     */
    public void setText(String newValue) {
        getDocument().setText(newValue);
    }
    
    /**
     * Sets the style name for the toolbar <code>Button</code>s.
     * 
     * @param newValue the new style name
     */
    public void setToolbarButtonStyleName(String newValue) {
        set(PROPERTY_TOOLBAR_BUTTON_STYLE_NAME, newValue);
    }

    /**
     * Sets the style name for the toolbar <code>Panel</code>.
     * 
     * @param newValue the new style name
     */
    public void setToolbarPanelStyleName(String newValue) {
        set(PROPERTY_TOOLBAR_PANEL_STYLE_NAME, newValue);
    }

    /**
     * Sets the style name for the toolbar <code>Panel</code>.
     * 
     * @param newValue the new style name
     */
    public void setWindowPaneStyleName(String newValue) {
        set(PROPERTY_WINDOW_PANE_STYLE_NAME, newValue);
    }
}
