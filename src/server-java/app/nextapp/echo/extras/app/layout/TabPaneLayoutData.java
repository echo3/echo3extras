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

package nextapp.echo.extras.app.layout;

import nextapp.echo.app.Border;
import nextapp.echo.app.Color;
import nextapp.echo.app.FillImage;
import nextapp.echo.app.FillImageBorder;
import nextapp.echo.app.Font;
import nextapp.echo.app.ImageReference;
import nextapp.echo.app.Insets;
import nextapp.echo.app.LayoutData;

/**
 * <code>LayoutData</code> implementation for children of <code>TabPane</code>
 * components.
 */
public class TabPaneLayoutData implements LayoutData {

    /**
     * Data object which contains less frequently used properties.
     */
    private static class Data {
        private Color activeBackground;
        private FillImage activeBackgroundImage;
        private Insets activeBackgroundInsets;
        private Border activeBorder;
        private Font activeFont;
        private Color activeForeground;
        private ImageReference activeIcon;
        private FillImageBorder activeImageBorder;
        private Insets activeInsets;
        private boolean closeEnabled = true;
        private Color inactiveBackground;
        private FillImage inactiveBackgroundImage;
        private Insets inactiveBackgroundInsets;
        private Border inactiveBorder;
        private Font inactiveFont;
        private Color inactiveForeground;
        private FillImageBorder inactiveImageBorder;
        private Insets inactiveInsets;
        private Color rolloverBackground;
        private FillImage rolloverBackgroundImage;
        private Insets rolloverBackgroundInsets;
        private Border rolloverBorder;
        private Font rolloverFont;
        private Color rolloverForeground;
        private ImageReference rolloverIcon;
        private FillImageBorder rolloverImageBorder;
        private String toolTipText;
    }
    
    private Data data;
    private ImageReference icon;
    private String title;
    
    /**
     * Returns the active background color of the tab.
     * 
     * @return the active background color
     */
    public Color getActiveBackground() {
        return data == null ? null : data.activeBackground;
    }

    /**
     * Returns the active background image of the tab.
     * 
     * @return the active background image
     */
    public FillImage getActiveBackgroundImage() {
        return data == null ? null : data.activeBackgroundImage;
    }
    
    /**
     * Returns the inset margin displayed around the background color/image when the tab is active.
     * (rendered only when image borders are used)
     * 
     * @return the inset margin
     */
    public Insets getActiveBackgroundInsets() {
        return data == null ? null : data.activeBackgroundInsets;
    }

    /**
     * Returns the active border of the tab.
     * 
     * @return the active border
     */
    public Border getActiveBorder() {
        return data == null ? null : data.activeBorder;
    }

    /**
     * Returns the active font of the tab.
     * 
     * @return the active font
     */
    public Font getActiveFont() {
        return data == null ? null : data.activeFont;
    }

    /**
     * Returns the active foreground color of the tab.
     * 
     * @return the active foreground color
     */
    public Color getActiveForeground() {
        return data == null ? null : data.activeForeground;
    }

    /**
     * Returns the active icon of the tab.
     * 
     * @return the active icon
     */
    public ImageReference getActiveIcon() {
        return data == null ? null : data.activeIcon;
    }
    
    /**
     * Returns the active image border of the tab.
     * 
     * @return the active image border
     */
    public FillImageBorder getActiveImageBorder() {
        return data == null ? null : data.activeImageBorder;
    }
    
    /**
     * Returns the active insets of the tab.
     * 
     * @return the active insets
     */
    public Insets getActiveInsets() {
        return data == null ? null : data.activeInsets;
    }
    
    /**
     * Returns the <code>Data</code> object containing additional properties, instantiating it if required.
     * 
     * @return the data object
     */
    private Data getData() {
        if (data == null) {
            data = new Data();
        }
        return data;
    }

    /**
     * Returns the icon of the tab.
     * 
     * @return the tab icon
     */
    public ImageReference getIcon() {
        return icon;
    }

    /**
     * Returns the inactive background color of the tab.
     * 
     * @return the inactive background color
     */
    public Color getInactiveBackground() {
        return data == null ? null : data.inactiveBackground;
    }

    /**
     * Returns the inactive background image of the tab.
     * 
     * @return the inactive background image
     */
    public FillImage getInactiveBackgroundImage() {
        return data == null ? null : data.inactiveBackgroundImage;
    }

    /**
     * Returns the inset margin displayed around the background color/image when the tab is inactive.
     * (rendered only when image borders are used)
     * 
     * @return the inset margin
     */
    public Insets getInactiveBackgroundInsets() {
        return data == null ? null : data.inactiveBackgroundInsets;
    }

    /**
     * Returns the inactive border of the tab.
     * 
     * @return the inactive border
     */
    public Border getInactiveBorder() {
        return data == null ? null : data.inactiveBorder;
    }

    /**
     * Returns the inactive font of the tab.
     * 
     * @return the inactive font
     */
    public Font getInactiveFont() {
        return data == null ? null : data.inactiveFont;
    }

    /**
     * Returns the inactive foreground color of the tab.
     * 
     * @return the inactive foreground color
     */
    public Color getInactiveForeground() {
        return data == null ? null : data.inactiveForeground;
    }

    /**
     * Returns the inactive image border of the tab.
     * 
     * @return the inactive image border
     */
    public FillImageBorder getInactiveImageBorder() {
        return data == null ? null : data.inactiveImageBorder;
    }

    /**
     * Returns the inactive insets of the tab.
     * 
     * @return the inactive insets
     */
    public Insets getInactiveInsets() {
        return data == null ? null : data.inactiveInsets;
    }
    
    /**
     * Returns the rollover background color of the tab.
     * 
     * @return the rollover background color
     */
    public Color getRolloverBackground() {
        return data == null ? null : data.rolloverBackground;
    }

    /**
     * Returns the rollover background image of the tab.
     * 
     * @return the rollover background image
     */
    public FillImage getRolloverBackgroundImage() {
        return data == null ? null : data.rolloverBackgroundImage;
    }
    
    /**
     * Returns the inset margin displayed around the background color/image when the tab is rolled over.
     * (rendered only when image borders are used)
     * 
     * @return the inset margin
     */
    public Insets getRolloverBackgroundInsets() {
        return data == null ? null : data.rolloverBackgroundInsets;
    }

    /**
     * Returns the rollover border of the tab.
     * 
     * @return the rollover border
     */
    public Border getRolloverBorder() {
        return data == null ? null : data.rolloverBorder;
    }

    /**
     * Returns the rollover font of the tab.
     * 
     * @return the rollover font
     */
    public Font getRolloverFont() {
        return data == null ? null : data.rolloverFont;
    }

    /**
     * Returns the rollover foreground color of the tab.
     * 
     * @return the rollover foreground color
     */
    public Color getRolloverForeground() {
        return data == null ? null : data.rolloverForeground;
    }

    /**
     * Returns the rollover icon of the tab.
     * 
     * @return the rollover icon
     */
    public ImageReference getRolloverIcon() {
        return data == null ? null : data.rolloverIcon;
    }
    
    /**
     * Returns the rollover image border of the tab.
     * 
     * @return the rollover image border
     */
    public FillImageBorder getRolloverImageBorder() {
        return data == null ? null : data.rolloverImageBorder;
    }

    /**
     * Returns the title of the tab.
     * 
     * @return the tab title
     */
    public String getTitle() {
        return title;
    }
    
    /**
     * Returns the tool tip text of the tab.
     * 
     * @return the tool tip text
     */
    public String getToolTipText() {
        return data == null ? null : data.toolTipText;
    }

    /**
     * Determines if this tab can be closed.
     * 
     * @return true if the tab can be closed, default is true
     */
    public boolean isCloseEnabled() {
        return data == null ? true : data.closeEnabled;
    }

    /**
     * Sets the active background color of the tab.
     * 
     * @param activeBackground the new active background color
     */
    public void setActiveBackground(Color activeBackground) {
        getData().activeBackground = activeBackground;
    }

    /**
     * Sets the active background image of the tab.
     * 
     * @param activeBackgroundImage the new active background image
     */
    public void setActiveBackgroundImage(FillImage activeBackgroundImage) {
        getData().activeBackgroundImage = activeBackgroundImage;
    }
    
    /**
     * Sets the inset margin displayed around the background color/image when the tab is active.
     * (rendered only when image borders are used)
     * 
     * @param activeBackgroundInsets the new inset margin
     */
    public void setActiveBackgroundInsets(Insets activeBackgroundInsets) {
        getData().activeBackgroundInsets = activeBackgroundInsets;
    }

    /**
     * Sets the active border of the tab.
     * 
     * @param activeBorder the new active border
     */
    public void setActiveBorder(Border activeBorder) {
        getData().activeBorder = activeBorder;
    }

    /**
     * Sets the active font of the tab.
     * 
     * @param activeFont the new active font
     */
    public void setActiveFont(Font activeFont) {
        getData().activeFont = activeFont;
    }

    /**
     * Sets the active foreground color of the tab.
     * 
     * @param activeForeground the new active foreground color
     */
    public void setActiveForeground(Color activeForeground) {
        getData().activeForeground = activeForeground;
    }

    /**
     * Sets the active icon of the tab.
     * 
     * @param activeIcon the new rollover icon
     */
    public void setActiveIcon(ImageReference activeIcon) {
        getData().activeIcon = activeIcon;
    }

    /**
     * Sets the active image border of the tab.
     * 
     * @param activeImageBorder the new active image border
     */
    public void setActiveImageBorder(FillImageBorder activeImageBorder) {
        getData().activeImageBorder = activeImageBorder;
    }
    
    /**
     * Sets the active insets of the tab.
     * 
     * @param activeInsets the new active insets
     */
    public void setActiveInsets(Insets activeInsets) {
        getData().activeInsets = activeInsets;
    }

    /**
     * Sets whether this tab can be closed.
     * 
     * @param closeEnabled the new state
     */
    public void setCloseEnabled(boolean closeEnabled) {
        getData().closeEnabled = closeEnabled;
    }

    /**
     * Sets the icon of the tab.
     * 
     * @param icon the new icon
     */
    public void setIcon(ImageReference icon) {
        this.icon = icon;
    }

    /**
     * Sets the inactive background color of the tab.
     * 
     * @param inactiveBackground the new inactive background color
     */
    public void setInactiveBackground(Color inactiveBackground) {
        getData().inactiveBackground = inactiveBackground;
    }

    /**
     * Sets the inactive background image of the tab.
     * 
     * @param inactiveBackgroundImage the new inactive background image
     */
    public void setInactiveBackgroundImage(FillImage inactiveBackgroundImage) {
        getData().inactiveBackgroundImage = inactiveBackgroundImage;
    }

    /**
     * Sets the inset margin displayed around the background color/image when the tab is inactive.
     * (rendered only when image borders are used)
     * 
     * @param inactiveBackgroundInsets the new inset margin
     */
    public void setInactiveBackgroundInsets(Insets inactiveBackgroundInsets) {
        getData().inactiveBackgroundInsets = inactiveBackgroundInsets;
    }

    /**
     * Sets the inactive border of the tab.
     * 
     * @param inactiveBorder the new inactive border
     */
    public void setInactiveBorder(Border inactiveBorder) {
        getData().inactiveBorder = inactiveBorder;
    }

    /**
     * Sets the inactive font of the tab.
     * 
     * @param inactiveFont the new inactive font
     */
    public void setInactiveFont(Font inactiveFont) {
        getData().inactiveFont = inactiveFont;
    }

    /**
     * Sets the inactive foreground color of the tab.
     * 
     * @param inactiveForeground the new inactive foreground
     */
    public void setInactiveForeground(Color inactiveForeground) {
        getData().inactiveForeground = inactiveForeground;
    }

    /**
     * Sets the inactive image border of the tab.
     * 
     * @param inactiveImageBorder the new inactive image border
     */
    public void setInactiveImageBorder(FillImageBorder inactiveImageBorder) {
        getData().inactiveImageBorder = inactiveImageBorder;
    }
    
    /**
     * Sets the inactive insets of the tab.
     * 
     * @param inactiveInsets the new inactive insets
     */
    public void setInactiveInsets(Insets inactiveInsets) {
        getData().inactiveInsets = inactiveInsets;
    }

    /**
     * Sets the rollover background color of the tab.
     * 
     * @param rolloverBackground the new rollover background color
     */
    public void setRolloverBackground(Color rolloverBackground) {
        getData().rolloverBackground = rolloverBackground;
    }

    /**
     * Sets the rollover background image of the tab.
     * 
     * @param rolloverBackgroundImage the new rollover background image
     */
    public void setRolloverBackgroundImage(FillImage rolloverBackgroundImage) {
        getData().rolloverBackgroundImage = rolloverBackgroundImage;
    }

    /**
     * Sets the inset margin displayed around the background color/image when the tab is rolled over.
     * (rendered only when image borders are used)
     * 
     * @param rolloverBackgroundInsets the new inset margin
     */
    public void setRolloverBackgroundInsets(Insets rolloverBackgroundInsets) {
        getData().rolloverBackgroundInsets = rolloverBackgroundInsets;
    }

    /**
     * Sets the rollover border of the tab.
     * 
     * @param rolloverBorder the new rollover border
     */
    public void setRolloverBorder(Border rolloverBorder) {
        getData().rolloverBorder = rolloverBorder;
    }

    /**
     * Sets the rollover font of the tab.
     * 
     * @param rolloverFont the new rollover font
     */
    public void setRolloverFont(Font rolloverFont) {
        getData().rolloverFont = rolloverFont;
    }

    /**
     * Sets the rollover foreground color of the tab.
     * 
     * @param rolloverForeground the new rollover foreground color
     */
    public void setRolloverForeground(Color rolloverForeground) {
        getData().rolloverForeground = rolloverForeground;
    }
    
    /**
     * Sets the rollover icon of the tab.
     * 
     * @param rolloverIcon the new rollover icon
     */
    public void setRolloverIcon(ImageReference rolloverIcon) {
        getData().rolloverIcon = rolloverIcon;
    }

    /**
     * Sets the rollover image border of the tab.
     * 
     * @param rolloverImageBorder the new rollover image border
     */
    public void setRolloverImageBorder(FillImageBorder rolloverImageBorder) {
        getData().rolloverImageBorder = rolloverImageBorder;
    }

    /**
     * Sets the title of the tab.
     * 
     * @param title the new title
     */
    public void setTitle(String title) {
        this.title = title;
    }
    
    /**
     * Sets the tool tip text of the tab.
     * 
     * @param toolTipText the new tool tip text.
     */
    public void setToolTipText(String toolTipText) {
        getData().toolTipText = toolTipText;
    }
}
