/* 
 * This file is part of the Echo Extras Project.
 * Copyright (C) 2005-2008 NextApp, Inc.
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

import nextapp.echo.app.Component;
import nextapp.echo.app.event.DocumentEvent;
import nextapp.echo.app.event.DocumentListener;
import nextapp.echo.app.text.Document;
import nextapp.echo.app.text.StringDocument;

/**
 * Rich text editing component.
 */
public class RichTextArea extends Component {

    public static final String ICON_BOLD = "bold";
    public static final String ICON_ITALIC = "italic";
    public static final String ICON_UNDERLINE = "underline";
    public static final String ICON_STRIKETHROUGH = "strikethrough";
    
    public static final String ICON_CUT = "cut";
    public static final String ICON_COPY = "copy";
    public static final String ICON_PASTE = "paste";
    public static final String ICON_SELECT_ALL = "selectAll";
    public static final String ICON_DELETE = "delete";
    public static final String ICON_UNDO = "undo";
    public static final String ICON_REDO = "redo";
    public static final String ICON_BULLETED_LIST = "bulletedList";
    public static final String ICON_NUMBERED_LIST = "numberedList";
    
    public static final String ICON_TABLE = "table";
    public static final String ICON_HYPERLINK = "hyperlink";
    public static final String ICON_HORIZONTAL_RULE = "horizontalRule";
    public static final String ICON_IMAGE = "image";
    public static final String ICON_FORMAT_TEXT_STYLE = "textStyle";
    public static final String ICON_FORMAT_PARAGRAPH_STYLE = "paragraphStyle";
    public static final String ICON_ALIGNMENT = "alignment";
    public static final String ICON_ALIGNMENT_LEFT = "alignmentLeft";
    public static final String ICON_ALIGNMENT_RIGHT = "alignmentRight";
    public static final String ICON_ALIGNMENT_CENTER = "alignmentCenter";
    public static final String ICON_ALIGNMENT_JUSTIFY = "alignmentJustify";
    public static final String ICON_PLAIN_TEXT = "plainText";
    public static final String ICON_SUPERSCRIPT = "superscript";
    public static final String ICON_SUBSCRIPT = "subscript";
    public static final String ICON_PARAGRAPH_STYLE_NORMAL = "styleNormal";
    public static final String ICON_PARAGRAPH_STYLE_PREFORMATTED = "stylePreformatted";
    public static final String ICON_PARAGRAPH_STYLE_HEADING_1 = "styleH1";
    public static final String ICON_PARAGRAPH_STYLE_HEADING_2 = "styleH2";
    public static final String ICON_PARAGRAPH_STYLE_HEADING_3 = "styleH3";
    public static final String ICON_PARAGRAPH_STYLE_HEADING_4 = "styleH4";
    public static final String ICON_PARAGRAPH_STYLE_HEADING_5 = "styleH5";
    public static final String ICON_PARAGRAPH_STYLE_HEADING_6 = "styleH6";
    public static final String ICON_INDENT = "indent";
    public static final String ICON_OUTDENT = "outdent";
    public static final String ICON_FOREGROUND = "foreground";
    public static final String ICON_BACKGROUND = "background";
    
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

    public static final String DOCUMENT_CHANGED_PROPERTY = "document";
    public static final String TEXT_CHANGED_PROPERTY = "text";

    public static final String PROPERTY_MENU_STYLE_NAME = "menuStyleName";
    public static final String PROPERTY_CONTROL_PANE_SPLIT_PANE_STYLE_NAME = "controlPaneSplitPaneStyleName";
    public static final String PROPERTY_CONTROL_PANE_ROW_STYLE_NAME = "controlPaneRowStyleName";
    public static final String PROPERTY_CONTROL_PANE_BUTTON_STYLE_NAME = "controlPaneButtonStyleName";
    public static final String PROPERTY_TOOLBAR_BUTTON_STYLE_NAME = "toolbarButtonStyleName";
    public static final String PROPERTY_WINDOW_PANE_STYLE_NAME = "windowPaneStyleName";
    public static final String PROPERTY_ICONS = "icons";
    
    private Document document;
    
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
     * Returns the model associated with this <code>RichTextArea</code>.
     * 
     * @return the model
     */
    public Document getDocument() {
        return document;
    }
    
    /**
     * Returns the text contained in the <code>Document</code> model of
     * this rich text area.
     * 
     * @return the text contained in the document
     */
    public String getText() {
        return document.getText();
    }
    
    public String getControlPaneButtonStyleName() {
        return (String) getProperty(PROPERTY_CONTROL_PANE_BUTTON_STYLE_NAME);
    }
    
    public String getControlPaneRowStyleName() {
        return (String) getProperty(PROPERTY_CONTROL_PANE_ROW_STYLE_NAME);
    }
    
    public String getControlPaneSplitPaneStyleName() {
        return (String) getProperty(PROPERTY_CONTROL_PANE_SPLIT_PANE_STYLE_NAME);
    }
    
    public IconSet getIcons() {
        return (IconSet) getProperty(PROPERTY_ICONS);
    }
    
    public String getMenuStyleName() {
        return (String) getProperty(PROPERTY_MENU_STYLE_NAME);
    }
    
    public String getToolbarButtonStyleName() {
        return (String) getProperty(PROPERTY_TOOLBAR_BUTTON_STYLE_NAME);
    }
    
    public String getWindowPaneStyleName() {
        return (String) getProperty(PROPERTY_WINDOW_PANE_STYLE_NAME);
    }
    
    /**
     * @see nextapp.echo.app.Component#processInput(java.lang.String, java.lang.Object)
     */
    public void processInput(String inputName, Object inputValue) {
        super.processInput(inputName, inputValue);
        
        if (TEXT_CHANGED_PROPERTY.equals(inputName)) {
            setText((String) inputValue);
        }
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

    public void setIcons(IconSet newValue) {
        setProperty(PROPERTY_ICONS, newValue);
    }
    
    /**
     * Sets the text of document model of this rich text area.
     * 
     * @param newValue the new text
     */
    public void setText(String newValue) {
        getDocument().setText(newValue);
    }
    
    public void setControlPaneButtonStyleName(String newValue) {
        setProperty(PROPERTY_CONTROL_PANE_BUTTON_STYLE_NAME, newValue);
    }
    
    public void setControlPaneRowStyleName(String newValue) {
        setProperty(PROPERTY_CONTROL_PANE_ROW_STYLE_NAME, newValue);
    }
    
    public void setControlPaneSplitPaneStyleName(String newValue) {
        setProperty(PROPERTY_CONTROL_PANE_SPLIT_PANE_STYLE_NAME, newValue);
    }
    
    public void setMenuStyleName(String newValue) {
        setProperty(PROPERTY_MENU_STYLE_NAME, newValue);
    }
    
    public void setToolbarButtonStyleName(String newValue) {
        setProperty(PROPERTY_TOOLBAR_BUTTON_STYLE_NAME, newValue);
    }

    public void setWindowPaneStyleName(String newValue) {
        setProperty(PROPERTY_WINDOW_PANE_STYLE_NAME, newValue);
    }
}
