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

import nextapp.echo.app.Alignment;
import nextapp.echo.app.Border;
import nextapp.echo.app.Color;
import nextapp.echo.app.Component;
import nextapp.echo.app.Extent;
import nextapp.echo.app.FillImage;
import nextapp.echo.app.FillImageBorder;
import nextapp.echo.app.Font;
import nextapp.echo.app.ImageReference;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Pane;
import nextapp.echo.app.PaneContainer;
import nextapp.echo.extras.app.event.TabClosingEvent;
import nextapp.echo.extras.app.event.TabClosingListener;
import nextapp.echo.extras.app.event.TabSelectionEvent;
import nextapp.echo.extras.app.event.TabSelectionListener;
import nextapp.echo.extras.app.layout.TabPaneLayoutData;

/**
 * TabPane component: a container which displays children as an array of tabs, displaying only the component whose tab is selected
 * at a specific time. May contain zero or more child components. May contain <code>Pane</code> components as children.
 */
public class TabPane extends Component 
implements Pane, PaneContainer {

    public static final String INPUT_TAB_CLOSE = "tabClose";
    public static final String INPUT_TAB_SELECT = "tabSelect";

    public static final String ACTIVE_TAB_INDEX_CHANGED_PROPERTY = "activeTabIndex";
    public static final String TAB_CLOSING_LISTENERS_CHANGED_PROPERTY = "tabClosingListeners";
    public static final String TAB_SELECTION_LISTENERS_CHANGED_PROPERTY = "tabSelectionListeners";
    
    public static final String PROPERTY_BORDER = "border";
    public static final String PROPERTY_BORDER_TYPE = "borderType";
    public static final String PROPERTY_DEFAULT_CONTENT_INSETS = "defaultContentInsets";
    public static final String PROPERTY_IMAGE_BORDER = "imageBorder";
    public static final String PROPERTY_INSETS = "insets";
    public static final String PROPERTY_ROLLOVER_SCROLL_LEFT_ICON = "rolloverScrollLeftIcon";
    public static final String PROPERTY_ROLLOVER_SCROLL_RIGHT_ICON = "rolloverScrollRightIcon";
    public static final String PROPERTY_SCROLL_LEFT_ICON = "scrollLeftIcon";
    public static final String PROPERTY_SCROLL_RIGHT_ICON = "scrollRightIcon";
    public static final String PROPERTY_TAB_ACTIVE_BACKGROUND = "tabActiveBackground";
    public static final String PROPERTY_TAB_ACTIVE_BACKGROUND_IMAGE = "tabActiveBackgroundImage";
    public static final String PROPERTY_TAB_ACTIVE_BACKGROUND_INSETS = "tabActiveBackgroundInsets";
    public static final String PROPERTY_TAB_ACTIVE_BORDER = "tabActiveBorder";
    public static final String PROPERTY_TAB_ACTIVE_FONT = "tabActiveFont";
    public static final String PROPERTY_TAB_ACTIVE_FOREGROUND = "tabActiveForeground";
    public static final String PROPERTY_TAB_ACTIVE_HEIGHT_INCREASE = "tabActiveHeightIncrease";
    public static final String PROPERTY_TAB_ACTIVE_IMAGE_BORDER = "tabActiveImageBorder";
    public static final String PROPERTY_TAB_ACTIVE_INSETS = "tabActiveInsets";
    public static final String PROPERTY_TAB_ACTIVE_LEFT_IMAGE = "tabActiveLeftImage";
    public static final String PROPERTY_TAB_ACTIVE_RIGHT_IMAGE = "tabActiveRightImage";
    public static final String PROPERTY_TAB_ALIGNMENT = "tabAlignment";
    public static final String PROPERTY_TAB_BACKGROUND_IMAGE = "tabBackgroundImage";
    public static final String PROPERTY_TAB_CLOSE_ENABLED = "tabCloseEnabled";
    public static final String PROPERTY_TAB_CLOSE_ICON = "tabCloseIcon";
    public static final String PROPERTY_TAB_CLOSE_ICON_ROLLOVER_ENABLED = "tabCloseIconRolloverEnabled";
    public static final String PROPERTY_TAB_DEFAULT_CLOSE_OPERATION = "tabDefaultCloseOperation";
    public static final String PROPERTY_TAB_DISABLED_CLOSE_ICON = "tabDisabledCloseIcon";
    public static final String PROPERTY_TAB_FOCUSED_BACKGROUND = "tabFocusedBackground";
    public static final String PROPERTY_TAB_FOCUSED_BACKGROUND_IMAGE = "tabFocusedBackgroundImage";
    public static final String PROPERTY_TAB_FOCUSED_BACKGROUND_INSETS = "tabFocusedBackgroundInsets";
    public static final String PROPERTY_TAB_FOCUSED_BORDER = "tabFocusedBorder";
    public static final String PROPERTY_TAB_FOCUSED_FONT = "tabFocusedFont";
    public static final String PROPERTY_TAB_FOCUSED_FOREGROUND = "tabFocusedForeground";
    public static final String PROPERTY_TAB_FOCUSED_IMAGE_BORDER = "tabFocusedImageBorder";
    public static final String PROPERTY_TAB_HEIGHT = "tabHeight";
    public static final String PROPERTY_TAB_ICON_TEXT_MARGIN = "tabIconTextMargin";
    public static final String PROPERTY_TAB_INACTIVE_BACKGROUND = "tabInactiveBackground";
    public static final String PROPERTY_TAB_INACTIVE_BACKGROUND_IMAGE = "tabInactiveBackgroundImage";
    public static final String PROPERTY_TAB_INACTIVE_BACKGROUND_INSETS = "tabInactiveBackgroundInsets";
    public static final String PROPERTY_TAB_INACTIVE_BORDER = "tabInactiveBorder";
    public static final String PROPERTY_TAB_INACTIVE_FONT = "tabInactiveFont";
    public static final String PROPERTY_TAB_INACTIVE_FOREGROUND = "tabInactiveForeground";
    public static final String PROPERTY_TAB_INACTIVE_IMAGE_BORDER = "tabInactiveImageBorder";
    public static final String PROPERTY_TAB_INACTIVE_INSETS = "tabInactiveInsets";
    public static final String PROPERTY_TAB_INACTIVE_LEFT_IMAGE = "tabInactiveLeftImage";
    public static final String PROPERTY_TAB_INACTIVE_RIGHT_IMAGE = "tabInactiveRightImage";
    public static final String PROPERTY_TAB_INSET = "tabInset";
    public static final String PROPERTY_TAB_MAXIMUM_WIDTH = "tabMaximumWidth";
    public static final String PROPERTY_TAB_POSITION = "tabPosition";
    public static final String PROPERTY_TAB_ROLLOVER_CLOSE_ICON = "tabRolloverCloseIcon";
    public static final String PROPERTY_TAB_ROLLOVER_BACKGROUND = "tabRolloverBackground";
    public static final String PROPERTY_TAB_ROLLOVER_BACKGROUND_IMAGE = "tabRolloverBackgroundImage";
    public static final String PROPERTY_TAB_ROLLOVER_BACKGROUND_INSETS = "tabRolloverBackgroundInsets";
    public static final String PROPERTY_TAB_ROLLOVER_BORDER = "tabRolloverBorder";
    public static final String PROPERTY_TAB_ROLLOVER_ENABLED = "tabRolloverEnabled";
    public static final String PROPERTY_TAB_ROLLOVER_FONT = "tabRolloverFont";
    public static final String PROPERTY_TAB_ROLLOVER_FOREGROUND = "tabRolloverForeground";
    public static final String PROPERTY_TAB_ROLLOVER_IMAGE_BORDER = "tabRolloverImageBorder";

    public static final String PROPERTY_TAB_SPACING = "tabSpacing";
    public static final String PROPERTY_TAB_WIDTH = "tabWidth";

    /**
     * Constant for the <code>borderType</code> property indicating that a
     * border should be drawn immediately adjacent to the tabs only.
     * If the tabs are positioned at the top of the <code>TabPane</code> the
     * border will only be drawn directly beneath the tabs with this setting.  
     * If the tabs are positioned at the bottom of the <code>TabPane</code> the
     * border will only be drawn directly above the tabs with this setting.
     * This is the default rendering style.
     */
    public static final int BORDER_TYPE_ADJACENT_TO_TABS = 1;
    
    /**
     * Constant for the <code>borderType</code> property indicating that no 
     * border should be drawn around the content.
     */
    public static final int BORDER_TYPE_NONE = 0;
    
    /**
     * Constant for the <code>borderType</code> property indicating that
     * borders should be drawn above and below the content, but not at its 
     * sides.
     */
    public static final int BORDER_TYPE_PARALLEL_TO_TABS = 2;
    
    /**
     * Constant for the <code>borderType</code> property indicating that
     * borders should be drawn on all sides of the content.
     */
    public static final int BORDER_TYPE_SURROUND = 3;

    /**
     * A constant for the <code>tabDefaultCloseOperation</code> property 
     * indicating that nothing should be done when the user attempts 
     * to close a tab.
     */
    public static final int TAB_DO_NOTHING_ON_CLOSE = 0;
    
    /**
     * A constant for the <code>tabDefaultCloseOperation</code> property 
     * indicating that a tab should be removed from the component
     * hierarchy when a user attempts to close it.
     */
    public static final int TAB_DISPOSE_ON_CLOSE = 1;
    
    /**
     * Constant for the <code>tabPosition</code> property indicating that the
     * tabs should be rendered above the content.
     * This is the default rendering style.
     */
    public static final int TAB_POSITION_TOP = 0;

    /**
     * Constant for the <code>tabPosition</code> property indicating that the
     * tabs should be rendered beneath the content.
     */
    public static final int TAB_POSITION_BOTTOM = 1;

    /**
     * Index of active tab.
     */ 
    private int activeTabIndex = -1;
    
    /**
     * Adds a <code>TabPaneListener</code> to receive event notifications.
     * 
     * @param l the <code>TabPaneListener</code> to add
     */
    public void addTabClosingListener(TabClosingListener l) {
        getEventListenerList().addListener(TabClosingListener.class, l);
        firePropertyChange(TAB_CLOSING_LISTENERS_CHANGED_PROPERTY, null, l);
    }
    
    /**
     * Adds a <code>TabSelectionListener</code> to receive event notifications.
     * 
     * @param l the <code>TabSelectionListener</code> to add
     */
    public void addTabSelectionListener(TabSelectionListener l) {
        getEventListenerList().addListener(TabSelectionListener.class, l);
        firePropertyChange(TAB_SELECTION_LISTENERS_CHANGED_PROPERTY, null, l);
    }
    
    /**
     * Notifies <code>TabClosingListener</code>s that the user has requested to
     * close a tab.
     */
    protected void fireTabClosing(int tabIndex) {
        if (!hasEventListenerList()) {
            return;
        }
        EventListener[] listeners = getEventListenerList().getListeners(TabClosingListener.class);
        if (listeners.length == 0) {
            return;
        }
        TabClosingEvent e = new TabClosingEvent(this, tabIndex);
        for (int i = 0; i < listeners.length; ++i) {
            ((TabClosingListener) listeners[i]).tabClosing(e);
        }
    }

    /**
     * Notifies <code>TabSelectionListener</code>s that the user has selected a tab.
     */
    protected void fireTabSelected(int tabIndex) {
        if (!hasEventListenerList()) {
            return;
        }
        EventListener[] listeners = getEventListenerList().getListeners(TabSelectionListener.class);
        if (listeners.length == 0) {
            return;
        }
        TabSelectionEvent e = new TabSelectionEvent(this, tabIndex);
        for (int i = 0; i < listeners.length; ++i) {
            ((TabSelectionListener) listeners[i]).tabSelected(e);
        }
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
     * Returns the border surrounding the entire <code>TabPane</code>.
     * This property will have no effect if an <code>imageBorder</code> has been configured.
     * 
     * @return the border
     */
    public Border getBorder() {
        return (Border) get(PROPERTY_BORDER);
    }
    
    /**
     * Returns the mode in which the border will be drawn around the 
     * <code>TabPane</code>.
     * This property will affect the rendering of both <code>border</code> and <code>imageBorder</code> properties.
     * 
     * @return the border border type, one of the following values:
     *         <ul>
     *          <li><code>BORDER_TYPE_NONE</code></li>
     *          <li><code>BORDER_TYPE_ADJACENT_TO_TABS</code> (the default)</li>
     *          <li><code>BORDER_TYPE_PARALLEL_TO_TABS</code></li>
     *          <li><code>BORDER_TYPE_SURROUND</code></li>
     *         </ul>
     */
    public int getBorderType() {
        Integer value = (Integer) get(PROPERTY_BORDER_TYPE);
        if (value == null) {
            return BORDER_TYPE_ADJACENT_TO_TABS;
        } else {
            return value.intValue();
        }
    }
    
    /**
     * Returns the default content inset margin.  This margin is applied by
     * default to each child component.
     *
     * @return the default content inset margin
     */
    public Insets getDefaultContentInsets() {
        return (Insets) get(PROPERTY_DEFAULT_CONTENT_INSETS);
    }
    
    /**
     * Returns the <code>FillImageBorder</code> surrounding the entire TabPane.
     * If this property is set, it will override the value of the <code>border</code> property.
     * 
     * @return the image border
     */
    public FillImageBorder getImageBorder() {
        return (FillImageBorder) get(PROPERTY_IMAGE_BORDER);
    }
    
    /**
     * Returns the <code>Insets</code> around the entire <code>TabPane</code>.
     * Insets will only be drawn on sides of the <code>TabPane</code> which have
     * a border (i.e., based on the value of the <code>borderType</code> 
     * property).
     * Values for this property must be in pixel units.
     * 
     * @return the insets
     */
    public Insets getInsets() {
        return (Insets) get(PROPERTY_INSETS);
    }
    
    /**
     * Returns the left-hand rollover icon displayed when too many tabs are present to fit on-screen.
     *   
     * @return the left rollover scroll icon
     */
    public ImageReference getRolloverScrollLeftIcon() {
        return (ImageReference) get(PROPERTY_ROLLOVER_SCROLL_LEFT_ICON);
    }
    
    /**
     * Returns the right-hand rollover icon displayed when too many tabs are present to fit on-screen.
     *   
     * @return the right rollover scroll icon
     */
    public ImageReference getRolloverScrollRightIcon() {
        return (ImageReference) get(PROPERTY_ROLLOVER_SCROLL_RIGHT_ICON);
    }
    
    /**
     * Returns the left-hand icon displayed when too many tabs are present to fit on-screen.
     *   
     * @return the left scroll icon
     */
    public ImageReference getScrollLeftIcon() {
        return (ImageReference) get(PROPERTY_SCROLL_LEFT_ICON);
    }
    
    /**
     * Returns the right-hand icon displayed when too many tabs are present to fit on-screen.
     *   
     * @return the right scroll icon
     */
    public ImageReference getScrollRightIcon() {
        return (ImageReference) get(PROPERTY_SCROLL_RIGHT_ICON);
    }
    
    /**
     * Returns the background color used to render active tabs.
     * 
     * @return the active tab background
     */
    public Color getTabActiveBackground() {
        return (Color) get(PROPERTY_TAB_ACTIVE_BACKGROUND);
    }
    
    /**
     * Returns the background image used to render active tabs.
     * 
     * @return the active tab background image
     */
    public FillImage getTabActiveBackgroundImage() {
        return (FillImage) get(PROPERTY_TAB_ACTIVE_BACKGROUND_IMAGE);
    }

    /**
     * Returns the inset margin displayed around the background color/image used to render active tabs.
     * Rendered only when image borders are used.
     * 
     * @return the inset margin
     */
    public Insets getTabActiveBackgroundInsets() {
        return (Insets) get(PROPERTY_TAB_ACTIVE_BACKGROUND_INSETS);
    }

    /**
     * Returns the <code>Border</code> used to draw the active tab.
     * If the <code>border</code> property is not set as well, this border will surround the entire <code>TabPane</code>.
     * 
     * @return the border
     */
    public Border getTabActiveBorder() {
        return (Border) get(PROPERTY_TAB_ACTIVE_BORDER);
    }
    
    /**
     * Returns the font used to render active tabs.
     * 
     * @return the active tab font
     */
    public Font getTabActiveFont() {
        return (Font) get(PROPERTY_TAB_ACTIVE_FONT);
    }
    
    /**
     * Returns the foreground color used to render active tabs.
     * 
     * @return the active tab foreground
     */
    public Color getTabActiveForeground() {
        return (Color) get(PROPERTY_TAB_ACTIVE_FOREGROUND);
    }
    
    /**
     * Returns the height increase of active tabs.
     * <code>Extent</code> values for this property must be in pixel units.
     * 
     * @return the active tab height increase
     */
    public Extent getTabActiveHeightIncrease() {
        return (Extent) get(PROPERTY_TAB_ACTIVE_HEIGHT_INCREASE);
    }
    
    /**
     * Returns the insets of active tabs.
     * 
     * @return the active tab insets
     */
    public Insets getTabActiveInsets() {
        return (Insets) get(PROPERTY_TAB_ACTIVE_INSETS);
    }
    
    /**
     * Returns the <code>FillImageBorder</code> used to draw the active tab.
     * 
     * @return the border
     */
    public FillImageBorder getTabActiveImageBorder() {
        return (FillImageBorder) get(PROPERTY_TAB_ACTIVE_IMAGE_BORDER);
    }
    
    /**
     * Returns the left image used to render active tabs.
     * 
     * @return the active tab left image
     * @deprecated <code>FillImageBorder</code>s should be used to render complex tabs
     * @see #getTabActiveImageBorder
     */
    public ImageReference getTabActiveLeftImage() {
        return (ImageReference) get(PROPERTY_TAB_ACTIVE_LEFT_IMAGE);
    }
    
    /**
     * Returns the right image used to render active tabs.
     * 
     * @return the active tab right image
     * @deprecated <code>FillImageBorder</code>s should be used to render complex tabs
     * @see #getTabActiveImageBorder
     */
    public ImageReference getTabActiveRightImage() {
        return (ImageReference) get(PROPERTY_TAB_ACTIVE_RIGHT_IMAGE);
    }
    
    /**
     * Returns the alignment within an individual tab.
     * 
     * @return the tab alignment.
     */
    public Alignment getTabAlignment() {
        return (Alignment) get(PROPERTY_TAB_ALIGNMENT);
    }
    
    /**
     * Returns the background image used to render behind tabs.
     * 
     * @return the background image
     */
    public FillImage getTabBackgroundImage() {
        return (FillImage) get(PROPERTY_TAB_BACKGROUND_IMAGE);
    }
    
    /**
     * Returns the close icon displayed in the tabs.
     * 
     * @return the icon
     */
    public ImageReference getTabCloseIcon() {
        return (ImageReference) get(PROPERTY_TAB_CLOSE_ICON);
    }

    /**
     * Returns the default tab close operation.
     * 
     * @return the default tab close operation, one of the following values:
     *         <ul>
     *          <li>TAB_DO_NOTHING_ON_CLOSE</li>
     *          <li>TAB_DISPOSE_ON_CLOSE</li>
     *         </ul>
     */
    public int getTabDefaultCloseOperation() {
        Integer defaultCloseOperationValue = (Integer) get(PROPERTY_TAB_DEFAULT_CLOSE_OPERATION);
        return defaultCloseOperationValue == null ? TAB_DISPOSE_ON_CLOSE : defaultCloseOperationValue.intValue();
    }
    
    /**
     * Returns the close icon that is displayed when tab close is disabled.
     * 
     * @return the icon
     */
    public ImageReference getTabDisabledCloseIcon() {
        return (ImageReference) get(PROPERTY_TAB_DISABLED_CLOSE_ICON);
    }

    /**
     * Returns the background color used to render the active tab when the tab pane is focused.
     *
     * @return the focused tab background
     */
    public Color getTabFocusedBackground() {
        return (Color) get(PROPERTY_TAB_FOCUSED_BACKGROUND);
    }

    /**
     * Returns the background image used to render the active tab when the tab pane is focused.
     *
     * @return the focused tab background image
     */
    public FillImage getTabFocusedBackgroundImage() {
        return (FillImage) get(PROPERTY_TAB_FOCUSED_BACKGROUND_IMAGE);
    }

    /**
     * Returns the inset margin displayed around the background color/image used to render the active tab when
     * the tab pane is focused.
     * Rendered only when image borders are used.
     *
     * @return the inset margin
     */
    public Insets getTabFocusedBackgroundInsets() {
        return (Insets) get(PROPERTY_TAB_FOCUSED_BACKGROUND_INSETS);
    }

    /**
     * Returns the <code>Border</code> used to draw the active tab when the tab pane is focused.
     *
     * @return the focused border
     */
    public Border getTabFocusedBorder() {
        return (Border) get(PROPERTY_TAB_FOCUSED_BORDER);
    }

    /**
     * Returns the font used to render the active tab when the tab pane is focused.
     *
     * @return the focused tab font
     */
    public Font getTabFocusedFont() {
        return (Font) get(PROPERTY_TAB_FOCUSED_FONT);
    }

    /**
     * Returns the foreground color used to render the active tab when the tab pane is focused.
     *
     * @return the focused tab foreground
     */
    public Color getTabFocusedForeground() {
        return (Color) get(PROPERTY_TAB_FOCUSED_FOREGROUND);
    }

    /**
     * Returns the <code>FillImageBorder</code> used to draw the active tab when the tab pane is focused.
     *
     * @return the focused image border
     */
    public FillImageBorder getTabFocusedImageBorder() {
        return (FillImageBorder) get(PROPERTY_TAB_FOCUSED_IMAGE_BORDER);
    }
    
    /**
     * Returns the height of an individual tab.
     * <code>Extent</code> values for this property must be in pixel units.
     * 
     * @return the tab height
     */
    public Extent getTabHeight() {
        return (Extent) get(PROPERTY_TAB_HEIGHT);
    }

    /**
     * Returns the margin size between the icon and the text.
     * The margin will only be displayed if a tab has both icon
     * and text set.
     * This property only supports <code>Extent</code>s with
     * fixed (i.e., not percent) units.
     * 
     * @return the margin size 
     */
    public Extent getTabIconTextMargin() {
        return (Extent) get(PROPERTY_TAB_ICON_TEXT_MARGIN);
    }
    
    /**
     * Returns the background color used to render inactive tabs.
     * 
     * @return the inactive tab background
     */
    public Color getTabInactiveBackground() {
        return (Color) get(PROPERTY_TAB_INACTIVE_BACKGROUND);
    }
    
    /**
     * Returns the background image used to render inactive tabs.
     * 
     * @return the inactive tab background image
     */
    public FillImage getTabInactiveBackgroundImage() {
        return (FillImage) get(PROPERTY_TAB_INACTIVE_BACKGROUND_IMAGE);
    }
    
    /**
     * Returns the inset margin displayed around the background color/image used to render inactive tabs.
     * Rendered only when image borders are used.
     * 
     * @return the inset margin
     */
    public Insets getTabInactiveBackgroundInsets() {
        return (Insets) get(PROPERTY_TAB_INACTIVE_BACKGROUND_INSETS);
    }

    /**
     * Returns the <code>Border</code> used to draw inactive tabs.
     * 
     * @return the border
     */
    public Border getTabInactiveBorder() {
        return (Border) get(PROPERTY_TAB_INACTIVE_BORDER);
    }
    
    /**
     * Returns the font used to render inactive tabs.
     * 
     * @return the inactive tab font
     */
    public Font getTabInactiveFont() {
        return (Font) get(PROPERTY_TAB_INACTIVE_FONT);
    }
    
    /**
     * Returns the foreground color used to render inactive tabs.
     * 
     * @return the inactive tab foreground
     */
    public Color getTabInactiveForeground() {
        return (Color) get(PROPERTY_TAB_INACTIVE_FOREGROUND);
    }

    /**
     * Returns the <code>FillImageBorder</code> used to draw inactive tabs.
     * 
     * @return the border
     */
    public FillImageBorder getTabInactiveImageBorder() {
        return (FillImageBorder) get(PROPERTY_TAB_INACTIVE_IMAGE_BORDER);
    }
    
    /**
     * Returns the insets of inactive tabs.
     * 
     * @return the inactive tab insets
     */
    public Insets getTabInactiveInsets() {
        return (Insets) get(PROPERTY_TAB_INACTIVE_INSETS);
    }

    /**
     * Returns the left image used to render inactive tabs.
     * 
     * @return the inactive tab left image
     * @deprecated <code>FillImageBorder</code>s should be used to render complex tabs
     * @see #getTabInactiveImageBorder
     */
    public ImageReference getTabInactiveLeftImage() {
        return (ImageReference) get(PROPERTY_TAB_INACTIVE_LEFT_IMAGE);
    }
    
    /**
     * Returns the right image used to render inactive tabs.
     * 
     * @return the inactive tab right image
     * @deprecated <code>FillImageBorder</code>s should be used to render complex tabs
     * @see #getTabInactiveImageBorder
     */
    public ImageReference getTabInactiveRightImage() {
        return (ImageReference) get(PROPERTY_TAB_INACTIVE_RIGHT_IMAGE);
    }
    
    /**
     * Returns the horizontal distance from which all tabs are inset from 
     * the edge of the <code>TabPane</code>.
     * 
     * @return the tab inset
     */
    public Extent getTabInset() {
        return (Extent) get(PROPERTY_TAB_INSET);
    }
    
    /**
     * Returns the maximum allowed width of a tab.
     * 
     * @return the maximum tab width
     */
    public Extent getTabMaximumWidth() {
        return (Extent) get(PROPERTY_TAB_MAXIMUM_WIDTH);
    }
    
    /**
     * Returns the position where the tabs are located relative to the pane 
     * content.
     * 
     * @return the tab position, one of the following values:
     *         <ul>
     *          <li><code>TAB_POSITION_TOP</code></li>
     *          <li><code>TAB_POSITION_BOTTOM</code></li>
     *         </ul>
     */
    public int getTabPosition() {
        Integer tabPosition = (Integer) get(PROPERTY_TAB_POSITION);
        return tabPosition == null ? TAB_POSITION_TOP : tabPosition.intValue();
    }
    
    /**
     * Returns the background color used to render rolled over tabs.
     * 
     * @return the rollover tab background
     */
    public Color getTabRolloverBackground() {
        return (Color) get(PROPERTY_TAB_ROLLOVER_BACKGROUND);
    }
    
    /**
     * Returns the background image used to render rolled over tabs.
     * 
     * @return the rollover tab background image
     */
    public FillImage getTabRolloverBackgroundImage() {
        return (FillImage) get(PROPERTY_TAB_ROLLOVER_BACKGROUND_IMAGE);
    }
    
    /**
     * Returns the inset margin displayed around the background color/image used to render rolled over tabs.
     * Rendered only when image borders are used.
     * 
     * @return the inset margin
     */
    public Insets getTabRolloverBackgroundInsets() {
        return (Insets) get(PROPERTY_TAB_ROLLOVER_BACKGROUND_INSETS);
    }

    /**
     * Returns the <code>Border</code> used to draw rolled over tabs.
     * 
     * @return the rollover border
     */
    public Border getTabRolloverBorder() {
        return (Border) get(PROPERTY_TAB_ROLLOVER_BORDER);
    }
    
    /**
     * Returns the close icon that is displayed when the mouse cursor is inside
     * its bounds.
     * 
     * @return the icon
     */
    public ImageReference getTabRolloverCloseIcon() {
        return (ImageReference) get(PROPERTY_TAB_ROLLOVER_CLOSE_ICON);
    }
    
    /**
     * Returns the font used to render rolled over tabs.
     * 
     * @return the rollover tab font
     */
    public Font getTabRolloverFont() {
        return (Font) get(PROPERTY_TAB_ROLLOVER_FONT);
    }
    
    /**
     * Returns the foreground color used to render rolled over tabs.
     * 
     * @return the rollover tab foreground
     */
    public Color getTabRolloverForeground() {
        return (Color) get(PROPERTY_TAB_ROLLOVER_FOREGROUND);
    }

    /**
     * Returns the <code>FillImageBorder</code> used to draw rolled over tabs.
     * 
     * @return the rollover image border
     */
    public FillImageBorder getTabRolloverImageBorder() {
        return (FillImageBorder) get(PROPERTY_TAB_ROLLOVER_IMAGE_BORDER);
    }

    /**
     * Returns the horizontal space between individual tabs.
     * 
     * @return the tab spacing
     */
    public Extent getTabSpacing() {
        return (Extent) get(PROPERTY_TAB_SPACING);
    }
    
    /**
     * Returns the width of an individual tab.
     * 
     * @return the tab width
     */
    public Extent getTabWidth() {
        return (Extent) get(PROPERTY_TAB_WIDTH);
    }
    
    /**
     * Determines if any <code>TabClosingListener</code>s are registered.
     * 
     * @return true if any <code>TabClosingListener</code>s are registered
     */
    public boolean hasTabClosingListeners() {
        if (!hasEventListenerList()) {
            return false;
        }
        return getEventListenerList().getListenerCount(TabClosingListener.class) > 0;
    }
    
    /**
     * Determines the any <code>TabSelectionListener</code>s are registered.
     * 
     * @return true if any <code>TabSelectionListener</code>s are registered
     */
    public boolean hasTabSelectionListeners() {
        if (!hasEventListenerList()) {
            return false;
        }
        return getEventListenerList().getListenerCount(TabSelectionListener.class) > 0;
    }
    
    /**
     * Determines if tab close is enabled in general. Individual tabs can
     * explicitly disable close support using
     * {@link TabPaneLayoutData#setCloseEnabled(boolean)}.
     * 
     * @return true if tab close is enabled
     */
    public boolean isTabCloseEnabled() {
        Boolean value = (Boolean) get(PROPERTY_TAB_CLOSE_ENABLED);
        return value == null ? false : value.booleanValue();
    }
    
    /**
     * Determines if close icon rollover effects are enabled.
     * 
     * @return true if close icon rollover effects are enabled
     */
    public boolean isTabCloseIconRolloverEnabled() {
        Boolean value = (Boolean) get(PROPERTY_TAB_CLOSE_ICON_ROLLOVER_ENABLED);
        return value == null ? false : value.booleanValue();
    }
    
    /**
     * Determines if tab rollover effects are enabled.
     * 
     * @return true if tab rollover effects are enabled
     */
    public boolean isTabRolloverEnabled() {
        Boolean value = (Boolean) get(PROPERTY_TAB_ROLLOVER_ENABLED);
        return value == null ? false : value.booleanValue();
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
        if (inputValue == null) {
            return;
        }
        if (ACTIVE_TAB_INDEX_CHANGED_PROPERTY.equals(inputName)) {
            setActiveTabIndex(((Integer) inputValue).intValue());
        } else if (INPUT_TAB_SELECT.equals(inputName)) {
            userTabSelect(((Integer) inputValue).intValue());
        } else if (INPUT_TAB_CLOSE.equals(inputName)) {
            userTabClose(((Integer) inputValue).intValue());
        }
    }

    /**
     * Removes a <code>TabPaneListener</code> from receiving event notifications.
     * 
     * @param l the <code>TabPaneListener</code> to remove
     */
    public void removeTabClosingListener(TabClosingListener l) {
        if (!hasEventListenerList()) {
            return;
        }
        getEventListenerList().removeListener(TabClosingListener.class, l);
        firePropertyChange(TAB_CLOSING_LISTENERS_CHANGED_PROPERTY, l, null);
    }

    /**
     * Removes a <code>TabSelectionListener</code> from receiving event notifications.
     * 
     * @param l the <code>TabSelectionListener</code> to remove
     */
    public void removeTabSelectionListener(TabSelectionListener l) {
        if (!hasEventListenerList()) {
            return;
        }
        getEventListenerList().removeListener(TabSelectionListener.class, l);
        firePropertyChange(TAB_SELECTION_LISTENERS_CHANGED_PROPERTY, null, l);
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
     * Sets the border surrounding the entire <code>TabPane</code>.
     * This property will have no effect if an <code>imageBorder</code> has been configured.
     * 
     * @param newValue the new border
     */
    public void setBorder(Border newValue) {
        set(PROPERTY_BORDER, newValue);
    }
    
    /**
     * Sets the mode in which the border will be drawn around the 
     * <code>TabPane</code>.
     * This property will affect the rendering of both <code>border</code> and <code>imageBorder</code> properties.
     * 
     * @param newValue the new border type one of the following values:
     *        <ul>
     *         <li><code>BORDER_TYPE_NONE</code></li>
     *         <li><code>BORDER_TYPE_ADJACENT_TO_TABS</code> (the default)</li>
     *         <li><code>BORDER_TYPE_PARALLEL_TO_TABS</code></li>
     *         <li><code>BORDER_TYPE_SURROUND</code></li>
     *        </ul>
     */
    public void setBorderType(int newValue) {
        set(PROPERTY_BORDER_TYPE, new Integer(newValue));
    }
    
    /**
     * Sets the default content inset margin.  This margin is applied by 
     * default to each child component.
     *
     * @param newValue the new default content inset margin
     */
    public void setDefaultContentInsets(Insets newValue) {
        set(PROPERTY_DEFAULT_CONTENT_INSETS, newValue);
    }
    
    /**
     * Sets the <code>FillImageBorder</code> surrounding the entire TabPane.
     * If this property is set, it will override the value of the <code>border</code> property.
     * 
     * @param newValue the new image border
     */
    public void setImageBorder(FillImageBorder newValue) {
        set(PROPERTY_IMAGE_BORDER, newValue);
    }
    
    /**
     * Sets the <code>Insets</code> around the entire <code>TabPane</code>.
     * Insets will only be drawn on sides of the <code>TabPane</code> which have
     * a border (i.e., based on the value of the <code>borderType</code> 
     * property).
     * Values for this property must be in pixel units.
     * 
     * @param newValue the new inset
     */
    public void setInsets(Insets newValue) {
        set(PROPERTY_INSETS, newValue);
    }

    /**
     * Sets the left-hand rollover icon displayed when too many tabs are present to fit on-screen.
     *   
     * @param newValue the new left rollover scroll icon
     */
    public void setRolloverScrollLeftIcon(ImageReference newValue) {
        set(PROPERTY_ROLLOVER_SCROLL_LEFT_ICON, newValue);
    }
    
    /**
     * Sets the right-hand rollover icon displayed when too many tabs are present to fit on-screen.
     *   
     * @param newValue the new right rollover scroll icon
     */
    public void setRolloverScrollRightIcon(ImageReference newValue) {
        set(PROPERTY_ROLLOVER_SCROLL_RIGHT_ICON, newValue);
    }
    
    /**
     * Sets the left-hand icon displayed when too many tabs are present to fit on-screen.
     *   
     * @param newValue the new left scroll icon
     */
    public void setScrollLeftIcon(ImageReference newValue) {
        set(PROPERTY_SCROLL_LEFT_ICON, newValue);
    }
    
    /**
     * Sets the right-hand icon displayed when too many tabs are present to fit on-screen.
     *   
     * @param newValue the new right scroll icon
     */
    public void setScrollRightIcon(ImageReference newValue) {
        set(PROPERTY_SCROLL_RIGHT_ICON, newValue);
    }
    
    /**
     * Sets the background color used to render active tabs.
     * 
     * @param newValue the new active tab background
     */
    public void setTabActiveBackground(Color newValue) {
        set(PROPERTY_TAB_ACTIVE_BACKGROUND, newValue);
    }
    
    /**
     * Sets the background image used to render active tabs.
     * 
     * @param newValue the new active tab background image
     */
    public void setTabActiveBackgroundImage(FillImage newValue) {
        set(PROPERTY_TAB_ACTIVE_BACKGROUND_IMAGE, newValue);
    }
    
    /**
     * Sets the inset margin displayed around the background color/image used to render active tabs.
     * Rendered only when image borders are used.
     * 
     * @param newValue the new inset margin
     */
    public void setTabActiveBackgroundInsets(Insets newValue) {
        set(PROPERTY_TAB_ACTIVE_BACKGROUND_INSETS, newValue);
    }

    /**
     * Sets the <code>Border</code> used to draw the active tab.
     * If the <code>border</code> property is not set as well, this border will surround the entire <code>TabPane</code>.
     * 
     * @param newValue the new border
     */
    public void setTabActiveBorder(Border newValue) {
        set(PROPERTY_TAB_ACTIVE_BORDER, newValue);
    }
    
    /**
     * Sets the font used to render active tabs.
     * 
     * @param newValue the new active tab font
     */
    public void setTabActiveFont(Font newValue) {
        set(PROPERTY_TAB_ACTIVE_FONT, newValue);
    }
    
    /**
     * Sets the foreground color used to render active tabs.
     * 
     * @param newValue the new active tab foreground
     */
    public void setTabActiveForeground(Color newValue) {
        set(PROPERTY_TAB_ACTIVE_FOREGROUND, newValue);
    }

    /**
     * Sets the height increase of active tabs.
     * <code>Extent</code> values for this property must be in pixel units.
     * 
     * @param newValue the new active tab height increase
     */
    public void setTabActiveHeightIncrease(Extent newValue) {
        set(PROPERTY_TAB_ACTIVE_HEIGHT_INCREASE, newValue);
    }
    
    /**
     * Sets the <code>FiillImageBorder</code> used to draw the active tab.
     * 
     * @param newValue the new border
     */
    public void setTabActiveImageBorder(FillImageBorder newValue) {
        set(PROPERTY_TAB_ACTIVE_IMAGE_BORDER, newValue);
    }
    
    /**
     * Sets the insets of active tabs.
     * 
     * @param newValue the new active tab insets
     */
    public void setTabActiveInsets(Insets newValue) {
        set(PROPERTY_TAB_ACTIVE_INSETS, newValue);
    }

    /**
     * Sets the left image used to render active tabs. The width of the image
     * must be set, and has to be a pixel value.
     * 
     * @param newValue the active tab left image
     * @deprecated <code>FillImageBorder</code>s should be used to render complex tabs
     * @see #setTabActiveImageBorder
     */
    public void setTabActiveLeftImage(ImageReference newValue) {
        set(PROPERTY_TAB_ACTIVE_LEFT_IMAGE, newValue);
    }
    
    /**
     * Sets the right image used to render active tabs. The width of the image
     * must be set, and has to be a pixel value.
     * 
     * @param newValue the active tab right image
     * @deprecated <code>FillImageBorder</code>s should be used to render complex tabs
     * @see #setTabActiveImageBorder
     */
    public void setTabActiveRightImage(ImageReference newValue) {
        set(PROPERTY_TAB_ACTIVE_RIGHT_IMAGE, newValue);
    }
    
    /**
     * Sets the alignment within an individual tab.
     * 
     * @param newValue the new tab alignment
     */
    public void setTabAlignment(Alignment newValue) {
        set(PROPERTY_TAB_ALIGNMENT, newValue);
    }
    
    /**
     * Sets the background image used to render behind tabs.
     * 
     * @param newValue the background image
     */
    public void setTabBackgroundImage(FillImage newValue) {
       set(PROPERTY_TAB_BACKGROUND_IMAGE, newValue);
    }
    
    /**
     * Sets the enabled state of tab close buttons.  Individual tabs can explicitly
     * disable close support using
     * {@link TabPaneLayoutData#setCloseEnabled(boolean)}.
     * 
     * @param newValue true if tabs should be closable
     */
    public void setTabCloseEnabled(boolean newValue) {
        set(PROPERTY_TAB_CLOSE_ENABLED, new Boolean(newValue));
    }
    
    /**
     * Sets the close icon displayed in the tabs.
     * 
     * @param newValue the new icon
     */
    public void setTabCloseIcon(ImageReference newValue) {
        set(PROPERTY_TAB_CLOSE_ICON, newValue);
    }
    
    /**
     * Sets the enabled state of tab close icon rollover effects.
     * 
     * @param newValue true if close icon rollover effects should be enabled
     */
    public void setTabCloseIconRolloverEnabled(boolean newValue) {
        set(PROPERTY_TAB_CLOSE_ICON_ROLLOVER_ENABLED, new Boolean(newValue));
    }
    
    /**
     * Sets the default tab close operation.
     * 
     * @param newValue the new default tab close operation, one of the following 
     *        values:
     *        <ul>
     *         <li>TAB_DO_NOTHING_ON_CLOSE</li>
     *         <li>TAB_DISPOSE_ON_CLOSE</li>
     *        </ul>
     */
    public void setTabDefaultCloseOperation(int newValue) {
        set(PROPERTY_TAB_DEFAULT_CLOSE_OPERATION, new Integer(newValue));
    }
    
    /**
     * Sets the close icon that is displayed when tab close is disabled.
     * 
     * @param newValue the new icon
     */
    public void setTabDisabledCloseIcon(ImageReference newValue) {
        set(PROPERTY_TAB_DISABLED_CLOSE_ICON, newValue);
    }

    /**
     * Sets the background color used to render the active tab when the tab pane is focused.
     *
     * @param newValue the new rollover tab background
     */
    public void setTabFocusedBackground(Color newValue) {
        set(PROPERTY_TAB_FOCUSED_BACKGROUND, newValue);
    }

    /**
     * Sets the background image used to render the active tab when the tab pane is focused.
     *
     * @param newValue the new rollover tab background image
     */
    public void setTabFocusedBackgroundImage(FillImage newValue) {
        set(PROPERTY_TAB_FOCUSED_BACKGROUND_IMAGE, newValue);
    }

    /**
     * Sets the inset margin displayed around the background color/image used to render the active tab when
     * the tab pane is focused.
     * Rendered only when image borders are used.
     *
     * @param newValue the new inset margin
     */
    public void setTabFocusedBackgroundInsets(Insets newValue) {
        set(PROPERTY_TAB_FOCUSED_BACKGROUND_INSETS, newValue);
    }

    /**
     * Sets the <code>Border</code> used to draw the active tab when the tab pane is focused.
     *
     * @param newValue the new rollover border
     */
    public void setTabFocusedBorder(Border newValue) {
        set(PROPERTY_TAB_FOCUSED_BORDER, newValue);
    }

    /**
     * Sets the font used to render the active tab when the tab pane is focused.
     *
     * @param newValue the new rollover tab font
     */
    public void setTabFocusedFont(Font newValue) {
        set(PROPERTY_TAB_FOCUSED_FONT, newValue);
    }

    /**
     * Sets the foreground color used to render the active tab when the tab pane is focused.
     *
     * @param newValue the new rollover tab foreground
     */
    public void setTabFocusedForeground(Color newValue) {
        set(PROPERTY_TAB_FOCUSED_FOREGROUND, newValue);
    }

    /**
     * Sets the <code>FillImageBorder</code> used to draw the active tab when the tab pane is focused.
     *
     * @param newValue the new rollover image border
     */
    public void setTabFocusedImageBorder(FillImageBorder newValue) {
        set(PROPERTY_TAB_FOCUSED_IMAGE_BORDER, newValue);
    }
    
    /**
     * Sets the height of an individual tab.
     * <code>Extent</code> values for this property must be in pixel units.
     * 
     * @param newValue the new tab height
     */
    public void setTabHeight(Extent newValue) {
        set(PROPERTY_TAB_HEIGHT, newValue);
    }
    
    /**
     * Sets the margin size between the icon and the text.
     * The margin will only be displayed if a tab has both icon
     * and text set.
     * This property only supports <code>Extent</code>s with
     * fixed (i.e., not percent) units.
     * 
     * @param newValue the margin size 
     */
    public void setTabIconTextMargin(Extent newValue) {
        set(PROPERTY_TAB_ICON_TEXT_MARGIN, newValue);
    }
    
    /**
     * Sets the background color used to render inactive tabs.
     * 
     * @param newValue the new inactive tab background
     */
    public void setTabInactiveBackground(Color newValue) {
        set(PROPERTY_TAB_INACTIVE_BACKGROUND, newValue);
    }
    
    /**
     * Sets the background image used to render inactive tabs.
     * 
     * @param newValue the new inactive tab background image
     */
    public void setTabInactiveBackgroundImage(FillImage newValue) {
        set(PROPERTY_TAB_INACTIVE_BACKGROUND_IMAGE, newValue);
    }
    
    /**
     * Sets the inset margin displayed around the background color/image used to render inactive tabs.
     * Rendered only when image borders are used.
     * 
     * @param newValue the new inset margin
     */
    public void setTabInactiveBackgroundInsets(Insets newValue) {
        set(PROPERTY_TAB_INACTIVE_BACKGROUND_INSETS, newValue);
    }

    /**
     * Sets the <code>Border</code> used to draw inactive tabs in the 
     * <code>TabPane</code>.
     * 
     * @param newValue the new border
     */
    public void setTabInactiveBorder(Border newValue) {
        set(PROPERTY_TAB_INACTIVE_BORDER, newValue);
    }
    
    /**
     * Sets the font used to render inactive tabs.
     * 
     * @param newValue the new inactive tab font
     */
    public void setTabInactiveFont(Font newValue) {
        set(PROPERTY_TAB_INACTIVE_FONT, newValue);
    }

    /**
     * Sets the foreground color used to render inactive tabs.
     * 
     * @param newValue the new inactive tab foreground
     */
    public void setTabInactiveForeground(Color newValue) {
        set(PROPERTY_TAB_INACTIVE_FOREGROUND, newValue);
    }

    /**
     * Sets the <code>FillImageBorder</code> used to draw inactive tabs.
     * 
     * @param newValue the new border
     */
    public void setTabInactiveImageBorder(FillImageBorder newValue) {
        set(PROPERTY_TAB_INACTIVE_IMAGE_BORDER, newValue);
    }
    
    /**
     * Sets the insets of inactive tabs.
     * 
     * @param newValue the new inactive tab insets
     */
    public void setTabInactiveInsets(Insets newValue) {
        set(PROPERTY_TAB_INACTIVE_INSETS, newValue);
    }

    /**
     * Sets the left image used to render inactive tabs. The width of the image
     * must be set, and has to be a pixel value.
     * 
     * @param newValue the inactive tab left image
     * @deprecated <code>FillImageBorder</code>s should be used to render complex tabs
     * @see #setTabInactiveImageBorder
     */
    public void setTabInactiveLeftImage(ImageReference newValue) {
        set(PROPERTY_TAB_INACTIVE_LEFT_IMAGE, newValue);
    }

    /**
     * Sets the right image used to render inactive tabs. The width of the image
     * must be set, and has to be a pixel value.
     * 
     * @param newValue the inactive tab right image
     * @deprecated <code>FillImageBorder</code>s should be used to render complex tabs
     * @see #setTabInactiveImageBorder
     */
    public void setTabInactiveRightImage(ImageReference newValue) {
        set(PROPERTY_TAB_INACTIVE_RIGHT_IMAGE, newValue);
    }

    /**
     * Sets the horizontal distance from which all tabs are inset from 
     * the edge of the <code>TabPane</code>.
     * 
     * @param newValue the new tab inset
     */
    public void setTabInset(Extent newValue) {
        set(PROPERTY_TAB_INSET, newValue);
    }
    
    /**
     * Sets the maximum allowed width of a tab.
     * 
     * @param newValue the new maximum width
     */
    public void setTabMaximumWidth(Extent newValue) {
        set(PROPERTY_TAB_MAXIMUM_WIDTH, newValue);
    }
    
    /**
     * Sets the position where the tabs are located relative to the pane 
     * content.
     * 
     * @param newValue the new tab position, one of the following values:
     *        <ul>
     *         <li><code>TAB_POSITION_TOP</code></li>
     *         <li><code>TAB_POSITION_BOTTOM</code></li>
     *        </ul>
     */
    public void setTabPosition(int newValue) {
        set(PROPERTY_TAB_POSITION, new Integer(newValue));
    }

    /**
     * Sets the background color used to render rolled over tabs.
     * 
     * @param newValue the new rollover tab background
     */
    public void setTabRolloverBackground(Color newValue) {
        set(PROPERTY_TAB_ROLLOVER_BACKGROUND, newValue);
    }
    
    /**
     * Sets the background image used to render rolled over tabs.
     * 
     * @param newValue the new rollover tab background image
     */
    public void setTabRolloverBackgroundImage(FillImage newValue) {
        set(PROPERTY_TAB_ROLLOVER_BACKGROUND_IMAGE, newValue);
    }
    
    /**
     * Sets the inset margin displayed around the background color/image used to render rolled over tabs.
     * Rendered only when image borders are used.
     * 
     * @param newValue the new inset margin
     */
    public void setTabRolloverBackgroundInsets(Insets newValue) {
        set(PROPERTY_TAB_ROLLOVER_BACKGROUND_INSETS, newValue);
    }

    /**
     * Sets the <code>Border</code> used to draw rolled over tabs in the 
     * <code>TabPane</code>.
     * 
     * @param newValue the new rollover border
     */
    public void setTabRolloverBorder(Border newValue) {
        set(PROPERTY_TAB_ROLLOVER_BORDER, newValue);
    }
    
    /**
     * Sets the close icon that is displayed when the mouse cursor is inside
     * its bounds.
     * 
     * @param newValue the new icon
     */
    public void setTabRolloverCloseIcon(ImageReference newValue) {
        set(PROPERTY_TAB_ROLLOVER_CLOSE_ICON, newValue);
    }

    /**
     * Sets the enabled state of tab rollover effects.
     * 
     * @param newValue true if tab rollover effects should be enabled
     */
    public void setTabRolloverEnabled(boolean newValue) {
        set(PROPERTY_TAB_ROLLOVER_ENABLED, new Boolean(newValue));
    }
    
    /**
     * Sets the font used to render rolled over tabs.
     * 
     * @param newValue the new rollover tab font
     */
    public void setTabRolloverFont(Font newValue) {
        set(PROPERTY_TAB_ROLLOVER_FONT, newValue);
    }

    /**
     * Sets the foreground color used to render rolled over tabs.
     * 
     * @param newValue the new rollover tab foreground
     */
    public void setTabRolloverForeground(Color newValue) {
        set(PROPERTY_TAB_ROLLOVER_FOREGROUND, newValue);
    }

    /**
     * Sets the <code>FillImageBorder</code> used to draw rolled over tabs.
     * 
     * @param newValue the new rollover image border
     */
    public void setTabRolloverImageBorder(FillImageBorder newValue) {
        set(PROPERTY_TAB_ROLLOVER_IMAGE_BORDER, newValue);
    }
    
    /**
     * Sets the horizontal space between individual tabs.
     * 
     * @param newValue the new tab spacing
     */
    public void setTabSpacing(Extent newValue) {
        set(PROPERTY_TAB_SPACING, newValue);
    }

    /**
     * Sets the width of an individual tab.
     * 
     * @param newValue the new tab width
     */
    public void setTabWidth(Extent newValue) {
        set(PROPERTY_TAB_WIDTH, newValue);
    }

    /**
     * Processes a user request to close the tab with the given index (via the close button).
     */
    public void userTabClose(int tabIndex) {
        fireTabClosing(tabIndex);
        Integer defaultCloseOperationValue = (Integer) getRenderProperty(PROPERTY_TAB_DEFAULT_CLOSE_OPERATION);
        int defaultCloseOperation = defaultCloseOperationValue == null 
                ? TAB_DISPOSE_ON_CLOSE : defaultCloseOperationValue.intValue();
        if (defaultCloseOperation == TAB_DISPOSE_ON_CLOSE) {
            remove(getVisibleComponent(tabIndex));
        }
    }
    
    /**
     * Processes a user request to select the tab with the given index.
     */
    public void userTabSelect(int tabIndex) {
        fireTabSelected(tabIndex);
        setActiveTabIndex(tabIndex);
    }
}
