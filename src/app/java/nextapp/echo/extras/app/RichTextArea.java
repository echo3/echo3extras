/* 
 * This file is part of the Echo Extras Project.
 * Copyright (C) 2005-2007 NextApp, Inc.
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

    public static final String STYLE_MENU_STYLE_NAME = "menuStyleName";
    public static final String STYLE_CONTROL_PANE_SPLIT_PANE_STYLE_NAME = "controlPaneSplitPaneStyleName";
    public static final String STYLE_CONTROL_PANE_ROW_STYLE_NAME = "controlPaneRowStyleName";
    public static final String STYLE_CONTROL_PANE_BUTTON_STYLE_NAME = "controlPaneButtonStyleName";
    public static final String STYLE_TOOLBAR_BUTTON_STYLE_NAME = "toolbarButtonStyleName";
    public static final String STYLE_WINDOW_PANE_STYLE_NAME = "windowPaneStyleName";
    
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
        return (String) getProperty(STYLE_CONTROL_PANE_BUTTON_STYLE_NAME);
    }
    
    public String getControlPaneRowStyleName() {
        return (String) getProperty(STYLE_CONTROL_PANE_ROW_STYLE_NAME);
    }
    
    public String getControlPaneSplitPaneStyleName() {
        return (String) getProperty(STYLE_CONTROL_PANE_SPLIT_PANE_STYLE_NAME);
    }
    
    public String getMenuStyleName() {
        return (String) getProperty(STYLE_MENU_STYLE_NAME);
    }
    
    public String getToolbarButtonStyleName() {
        return (String) getProperty(STYLE_TOOLBAR_BUTTON_STYLE_NAME);
    }
    
    public String getWindowPaneStyleName() {
        return (String) getProperty(STYLE_WINDOW_PANE_STYLE_NAME);
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

    /**
     * Sets the text of document model of this rich text area.
     * 
     * @param newValue the new text
     */
    public void setText(String newValue) {
        getDocument().setText(newValue);
    }
    
    public void setControlPaneButtonStyleName(String newValue) {
        setProperty(STYLE_CONTROL_PANE_BUTTON_STYLE_NAME, newValue);
    }
    
    public void setControlPaneRowStyleName(String newValue) {
        setProperty(STYLE_CONTROL_PANE_ROW_STYLE_NAME, newValue);
    }
    
    public void setControlPaneSplitPaneStyleName(String newValue) {
        setProperty(STYLE_CONTROL_PANE_SPLIT_PANE_STYLE_NAME, newValue);
    }
    
    public void setMenuStyleName(String newValue) {
        setProperty(STYLE_MENU_STYLE_NAME, newValue);
    }
    
    public void setToolbarButtonStyleName(String newValue) {
        setProperty(STYLE_TOOLBAR_BUTTON_STYLE_NAME, newValue);
    }

    public void setWindowPaneStyleName(String newValue) {
        setProperty(STYLE_WINDOW_PANE_STYLE_NAME, newValue);
    }
}
