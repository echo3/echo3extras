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

import nextapp.echo.app.Border;
import nextapp.echo.app.Color;
import nextapp.echo.app.Component;
import nextapp.echo.app.FillImage;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Pane;
import nextapp.echo.app.PaneContainer;

/**
 * A <code>PaneContainer</code> which contains multiple panes in vertically 
 * arranged tabs that slide up and down to reveal a single child 
 * <code>Pane</code> at a time.
 */
public class AccordionPane extends Component
implements Pane, PaneContainer {

    public static final int DEFAULT_ANIMATION_TIME = 350;
    
    public static final String INPUT_TAB_INDEX = "inputTabIndex";
    public static final String ACTIVE_TAB_INDEX_CHANGED_PROPERTY = "activeTabIndex";
    
    public static final String PROPERTY_DEFAULT_CONTENT_INSETS = "defaultContentInsets";
    
    public static final String PROPERTY_TAB_BACKGROUND = "tabBackground";
    public static final String PROPERTY_TAB_BACKGROUND_IMAGE = "tabBackgroundImage";
    public static final String PROPERTY_TAB_BORDER = "tabBorder";
    public static final String PROPERTY_TAB_FOREGROUND = "tabForeground";
    public static final String PROPERTY_TAB_INSETS = "tabInsets";
    public static final String PROPERTY_TAB_ROLLOVER_BACKGROUND = "tabRolloverBackground";
    public static final String PROPERTY_TAB_ROLLOVER_BACKGROUND_IMAGE = "tabRolloverBackgroundImage";
    public static final String PROPERTY_TAB_ROLLOVER_BORDER = "tabRolloverBorder";
    public static final String PROPERTY_TAB_ROLLOVER_ENABLED = "tabRolloverEnabled";
    public static final String PROPERTY_TAB_ROLLOVER_FOREGROUND = "tabRolloverForeground";
    
    public static final String PROPERTY_ANIMATION_TIME = "animationTime";
    
    /**
     * Index of active tab.
     */ 
    private int activeTabIndex = -1;

    /**
     * Default constructor.
     */
    public AccordionPane() {
        super();
    }
    
    /**
     * Returns the index of the active tab.
     * 
     * @return the active tab index
     */
    public int getActiveTabIndex() {
        return activeTabIndex;
    }
    
    /**
     * Returns the animation time (in milliseconds).  A value of zero indicates animation is disabled.
     * 
     * @return the animation time
     */
    public int getAnimationTime() {
        Integer animationTime = (Integer) getProperty(PROPERTY_ANIMATION_TIME);
        return animationTime == null ? DEFAULT_ANIMATION_TIME : animationTime.intValue(); 
    }
    
    /**
     * Returns the default content inset margin.  This margin is applied by 
     * default to each child component.
     *
     * @return the default content inset margin
     */
    public Insets getDefaultContentInsets() {
        return (Insets) getProperty(PROPERTY_DEFAULT_CONTENT_INSETS);
    }
    
    /**
     * Returns the tab background color.
     *
     * @return the tab background color
     */
    public Color getTabBackground() {
        return (Color) getProperty(PROPERTY_TAB_BACKGROUND);
    }
    
    /**
     * Returns the tab background image.
     * 
     * @return the tab background image
     */
    public FillImage getTabBackgroundImage() {
        return (FillImage) getProperty(PROPERTY_TAB_BACKGROUND_IMAGE);
    }
    
    /**
     * Returns the tab border.
     *
     * @return the tab border
     */
    public Border getTabBorder() {
        return (Border) getProperty(PROPERTY_TAB_BORDER);
    }
    
    /**
     * Returns the tab foreground color.
     *
     * @return the tab foreground color
     */
    public Color getTabForeground() {
        return (Color) getProperty(PROPERTY_TAB_FOREGROUND);
    }
    
    /**
     * Returns the tab inset margin.
     *
     * @return the tab inset margin
     */
    public Insets getTabInsets() {
        return (Insets) getProperty(PROPERTY_TAB_INSETS);
    }
    
    /**
     * Returns the tab rollover background color.
     *
     * @return the tab rollover background color
     */
    public Color getTabRolloverBackground() {
        return (Color) getProperty(PROPERTY_TAB_ROLLOVER_BACKGROUND);
    }
    
    /**
     * Returns the tab rollover background image.
     * 
     * @return the tab rollover background image
     */
    public FillImage getTabRolloverBackgroundImage() {
        return (FillImage) getProperty(PROPERTY_TAB_ROLLOVER_BACKGROUND_IMAGE);
    }
    
    /**
     * Returns the tab rollover border.
     *
     * @return the tab rollover border
     */
    public Border getTabRolloverBorder() {
        return (Border) getProperty(PROPERTY_TAB_ROLLOVER_BORDER);
    }
    
    /**
     * Determines whether rollover effects are enabled.
     * Default value is true.
     * 
     * @return true if rollover effects should be enabled.
     */
    public boolean isTabRolloverEnabled() {
        Boolean value = (Boolean) getProperty(PROPERTY_TAB_ROLLOVER_ENABLED);
        return value == null ? true : value.booleanValue();
    }
    
    /**
     * Returns the tab rollover foreground color.
     *
     * @return the tab rollover foreground color
     */
    public Color getTabRolloverForeground() {
        return (Color) getProperty(PROPERTY_TAB_ROLLOVER_FOREGROUND);
    }
    
    /**
     * @see nextapp.echo.app.Component#isValidParent(nextapp.echo.app.Component)
     */
    public boolean isValidParent(Component c) {
        if (!super.isValidParent(c)) {
            return false;
        }
        // Ensure parent is a PaneContainer.
        return c instanceof PaneContainer;
    }
    
    /**
     * @see nextapp.echo.app.Component#processInput(java.lang.String, java.lang.Object)
     */
    public void processInput(String inputName, Object inputValue) {
        super.processInput(inputName, inputValue);
        if (inputName.equals(INPUT_TAB_INDEX)) {
            setActiveTabIndex(((Integer) inputValue).intValue());
        }
    }
    
    /**
     * Sets the active tab index.
     * 
     * @param newValue the index of the child <code>Component</code> whose tab
     *        should be displayed
     */
    public void setActiveTabIndex(int newValue) {
        int oldValue = activeTabIndex;
        activeTabIndex = newValue;
        firePropertyChange(ACTIVE_TAB_INDEX_CHANGED_PROPERTY, new Integer(oldValue), new Integer(newValue));
    }

    /**
     * Sets the animation time (in milliseconds).  A value of zero indicates animation is disabled.
     * 
     * @param newValue the new animation time
     */
    public void setAnimationTime(int newValue) {
        setProperty(PROPERTY_ANIMATION_TIME, new Integer(newValue));
    }
    
    /**
     * Sets the default content inset margin.  This margin is applied by 
     * default to each child component.
     *
     * @param newValue the new default content inset margin
     */
    public void setDefaultContentInsets(Insets newValue) {
        setProperty(PROPERTY_DEFAULT_CONTENT_INSETS, newValue);
    }
    
    /**
     * Sets the tab background color.
     *
     * @param newValue the new tab background color
     */
    public void setTabBackground(Color newValue) {
        setProperty(PROPERTY_TAB_BACKGROUND, newValue);
    }
    
    /**
     * Sets the tab background image.
     *
     * @param newValue the new tab background image
     */
    public void setTabBackgroundImage(FillImage newValue) {
        setProperty(PROPERTY_TAB_BACKGROUND_IMAGE, newValue);
    }
    
    /**
     * Sets the tab border.
     *
     * @param newValue the new tab border
     */
    public void setTabBorder(Border newValue) {
        setProperty(PROPERTY_TAB_BORDER, newValue);
    }
    
    /**
     * Sets the tab foreground color.
     *
     * @param newValue the new tab foreground color
     */
    public void setTabForeground(Color newValue) {
        setProperty(PROPERTY_TAB_FOREGROUND, newValue);
    }

    /**
     * Sets the tab inset margin.
     *
     * @param newValue the new tab inset margin
     */
    public void setTabInsets(Insets newValue) {
        setProperty(PROPERTY_TAB_INSETS, newValue);
    }

    /**
     * Sets the tab rollover background color.
     *
     * @param newValue the new tab rollover background color
     */
    public void setTabRolloverBackground(Color newValue) {
        setProperty(PROPERTY_TAB_ROLLOVER_BACKGROUND, newValue);
    }
    
    /**
     * Sets the tab rollover background image.
     *
     * @param newValue the new tab rollover background image
     */
    public void setTabRolloverBackgroundImage(FillImage newValue) {
        setProperty(PROPERTY_TAB_ROLLOVER_BACKGROUND_IMAGE, newValue);
    }
    
    /**
     * Sets the tab rollover border.
     *
     * @param newValue the new tab rollover border
     */
    public void setTabRolloverBorder(Border newValue) {
        setProperty(PROPERTY_TAB_ROLLOVER_BORDER, newValue);
    }
    
    /**
     * Sets whether tab rollover effects are enabled.
     *
     * @param newValue thew new rollover effect state
     */
    public void setTabRolloverEnabled(boolean newValue) {
        setProperty(PROPERTY_TAB_ROLLOVER_ENABLED, new Boolean(newValue));
    }
    
    /**
     * Sets the tab rollover foreground color.
     *
     * @param newValue the new tab rollover foreground color
     */
    public void setTabRolloverForeground(Color newValue) {
        setProperty(PROPERTY_TAB_ROLLOVER_FOREGROUND, newValue);
    }
}
