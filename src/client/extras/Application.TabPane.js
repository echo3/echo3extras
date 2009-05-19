/**
 * TabPane component: a container which displays children as an array of tabs, displaying only the component whose tab is selected
 * at a specific time.  May contain zero or more child components.  May contain pane components as children.
 *
 * @cp {String} activeTabId the renderId of the active tab
 * @cp {Number} activeTabIndex the index of the active tab
 * @sp {#Border} border the border surrounding the content of the tab pane (note that <code>tabActiveBorder</code> will be used
 *     for this purpose if this property is not configured) 
 * @sp {Number} borderType the border border type, one of the following values:
 *     <ul>
 *      <li><code>BORDER_TYPE_NONE</code></li>
 *      <li><code>BORDER_TYPE_ADJACENT_TO_TABS</code> (the default)</li>
 *      <li><code>BORDER_TYPE_PARALLEL_TO_TABS</code></li>
 *      <li><code>BORDER_TYPE_SURROUND</code></li>
 *     </ul> 
 * @sp {#Insets} defaultContentInsets the default content inset margin
 * @sp {#FillImageBorder} imageBorder the image border to display around the entire <code>TabPane</code>
 * @sp {#Insets} insets the inset margin around the entire <code>TabPane</code>
 * @sp {#ImageReference} rolloverScrollLeftIcon the rolled-over version of <code>scrollLeftIcon</code>
 * @sp {#ImageReference} rolloverScrollRightIcon the rolled-over version of <code>scrollRightIcon</code>
 * @sp {#ImageReference} scrollLeftIcon the scroll icon to display to enable scrolling of the header to the left
 * @sp {#ImageReference} scrollRightIcon the scroll icon to display to enable scrolling of the header to the right
 * @sp {#Color} tabActiveBackground the background color used to render active tabs
 * @sp {#FillImage} tabActiveBackgroundImage the background image used to render active tabs
 * @sp {#Insets} tabActiveBackgroundInsets the inset margin displayed around the background color/image used to render active tabs
 *     (rendered only when image borders are used)
 * @sp {#Border} tabActiveBorder the border surrounding the active tab and the content of the <code>TabPane</code>
 * @sp {#Font} tabActiveFont the font used to render active tabs
 * @sp {#Color} tabActiveForeground the foreground color used to render active tabs
 * @sp {#Extent} tabActiveHeightIncrease the height increase of active tabs
 * @sp {#FillImageBorder} tabActiveImageBorder the image border to display around active tabs
 * @sp {#Insets} tabActiveInsets the inset margin used to render active tabs
 * @sp {#Alignment} tabAlignment the alignment within an individual tab
 * @sp {#FillImage} tabBackgroundImage the background image displayed behind the tabs
 * @sp {Boolean} tabCloseEnabled flag indicating whether tabs may be closed
 * @sp {#ImageReference} tabCloseIcon the tab close icon
 * @sp {Boolean} tabCloseIconRolloverEnabled flag indicating whether tab close icon rollover effects are enabled
 * @sp {#ImageReference} tabDisabledCloseIcon the tab close icon for tabs that may not be closed
 * @sp {#Extent} tabHeight the minimum height of an individual (inactive) tab
 * @sp {#Color} tabInactiveBackground the background color used to render inactive tabs
 * @sp {#FillImage} tabInactiveBackgroundImage the background image used to render inactive tabs
 * @sp {#Insets} tabInactiveBackgroundInsets the inset margin displayed around the background color/image used to render inactive
 *     tabs (rendered only when image borders are used)
 * @sp {#Border} tabInactiveBorder the border surrounding inactive tabs
 * @sp {#Font} tabInactiveFont the font used to render inactive tabs
 * @sp {#Color} tabInactiveForeground the foreground color used to render inactive tabs
 * @sp {#FillImageBorder} tabInactiveImageBorder the image border to display around inactive tabs
 * @sp {#Insets} tabInactiveInsets the inset margin used to render inactive tabs
 * @sp {#Extent} tabIconTextMargin the margin size between the tab icon and the text
 * @sp {#Extent} tabInset the horizontal distance from which all tabs are inset from the edge of the <code>TabPane</code>
 * @sp {#Extent} tabMaximumWidth the maximum allowed width for a single tab (percent values may be used)
 * @sp {Number} tabPosition the position where the tabs are located relative to the pane content, one of the following values:
 * @sp {#Color} tabRolloverBackground the background used to render rolled over tabs
 * @sp {#FillImage} tabRolloverBackgroundImage the background image used to render rolled over tabs
 * @sp {#Insets} tabRolloverBackgroundInsets the inset margin displayed around the background color/image used to render rolled 
 *     over tabs (rendered only when image borders are used)
 * @sp {#Border} tabRolloverBorder the border used to render rolled over tabs
 * @sp {Boolean} tabRolloverEnabled flag indicating whether tab rollover effects are enabled
 * @sp {#Font} tabRolloverFont the font used to render rolled over tabs
 * @sp {#Color} tabRolloverForeground the foreground color used to render rolled over tabs
 * @sp {#FillImageBorder} tabRolloverImageBorder the image border used to render rolled over tabs
 * @sp {#ImageReference} tabRolloverCloseIcon the tab close rollover effect icon
 * @sp {#Extent} tabSpacing the horizontal space between individual tabs
 *     <ul>
 *      <li><code>TAB_POSITION_TOP</code></li>
 *      <li><code>TAB_POSITION_BOTTOM</code></li>
 *     </ul>
 * @sp {#Extent} tabWidth the width of an individual tab (setting tabMaximumWidth is generally preferred)
 * @ldp {#Color} activeBackground the active background color
 * @ldp {#FillImage} activeBackgroundImage the active background image
 * @ldp {#Insets} activeBackgroundInsets the inset margin displayed around the background color/image when the tab is active
 *      (rendered only when image borders are used)
 * @ldp {#Border} activeBorder the active border
 * @ldp {#Font} activeFont the active font
 * @ldp {#Color} activeForeground the active foreground color
 * @ldp {#ImageReference} activeIcon the active icon (icon property is used when inactive)
 * @ldp {#FillImageBorder} activeImageBorder the active image border
 * @ldp {#Insets} activeInsets the active insets
 * @ldp {Boolean} closeEnabled flag indicating whether close is enabled (default is true, only effective when containing
 *      <code>TabPane</code> allows closing tabs)
 * @ldp {#ImageReference} icon the icon to display within a tab
 * @ldp {#Color} inactiveBackground the inactive background color
 * @ldp {#FillImage} inactiveBackgroundImage the inactive background image
 * @ldp {#Insets} inactiveBackgroundInsets the inset margin displayed around the background color/image when the tab is inactive
 *      (rendered only when image borders are used)
 * @ldp {#Border} inactiveBorder the inactive border
 * @ldp {#Font} inactiveFont the inactive font
 * @ldp {#Color} inactiveForeground the inactive foreground color
 * @ldp {#FillImageBorder} inactiveImageBorder the inactive image border
 * @ldp {#Insets} inactiveInsets the inactive insets
 * @ldp {#Color} rolloverBackground the rollover background color
 * @ldp {#FillImage} rolloverBackgroundImage the rollover background image
 * @ldp {#Insets} rolloverBackgroundInsets the inset margin displayed around the background color/image when the tab is rolled over
 *      (rendered only when image borders are used)
 * @ldp {#Border} rolloverBorder the rollover border
 * @ldp {#Font} rolloverFont the rollover font
 * @ldp {#Color} rolloverForeground the rollover foreground color
 * @ldp {#ImageReference} rolloverIcon the rollover icon
 * @ldp {#FillImageBorder} rolloverImageBorder the rollover image border
 * @ldp {String} title the text to display within a tab
 * @ldp {String} toolTipText the tool tip text to display when a tab is rolled over
 * @event tabClose An event fired when the user requests to close a tab.
 * @event tabSelect An event fired when the user selects a tab. 
 */
Extras.TabPane = Core.extend(Echo.Component, {

    $static: {
    
        /**
         * Constant for the <code>borderType</code> property indicating that no 
         * border should be drawn around the content.
         * @type Number
         */
        BORDER_TYPE_NONE: 0,
        
        /**
         * Constant for the <code>borderType</code> property indicating that a
         * border should be drawn immediately adjacent to the tabs only.
         * If the tabs are positioned at the top of the <code>TabPane</code> the
         * border will only be drawn directly beneath the tabs with this setting.  
         * If the tabs are positioned at the bottom of the <code>TabPane</code> the
         * border will only be drawn directly above the tabs with this setting.
         * @type Number
         */
        BORDER_TYPE_ADJACENT_TO_TABS: 1,
        
        /**
         * Constant for the <code>borderType</code> property indicating that
         * borders should be drawn above and below the content, but not at its 
         * sides.
         * @type Number
         */
        BORDER_TYPE_PARALLEL_TO_TABS: 2,
        
        /**
         * Constant for the <code>borderType</code> property indicating that
         * borders should be drawn on all sides of the content.
         * @type Number
         */
        BORDER_TYPE_SURROUND: 3,
        
        /**
         * Constant for the <code>tabPosition</code> property indicating that
         * the tabs are positioned at the top of the <code>TabPane</code>.
         * @type Number
         */
        TAB_POSITION_TOP: 0,
        
        /**
         * Constant for the <code>tabPosition</code> property indicating that
         * the tabs are positioned at the bottom of the <code>TabPane</code>.
         * @type Number
         */
        TAB_POSITION_BOTTOM: 1
    },

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.TabPane", this);
    },

    /** @see Echo.Component#componentType */
    componentType: "Extras.TabPane",

    /** @see Echo.Component#pane */
    pane: true,
    
    /**
     * Constructor.
     * @param properties associative mapping of initial property values (optional)
     */
    $construct: function(properties) {
        Echo.Component.call(this, properties);
        this.addListener("property", Core.method(this, this._tabChangeListener));
    },
    
    /**
     * Processes a user request to close a tab.
     * Notifies listeners of a "tabClose" event.
     * 
     * @param {String} tabId the renderId of the child tab component
     */
    doTabClose: function(tabId) {
        // Determine selected component.
        var tabComponent = this.application.getComponentByRenderId(tabId);
        if (!tabComponent || tabComponent.parent != this) {
            throw new Error("doTabClose(): Invalid tab: " + tabId);
        }

        // Notify tabClose listeners.
        this.fireEvent({ type: "tabClose", source: this, tab: tabComponent, data: tabId });
    },

    /**
     * Processes a user request to select a tab.
     * Notifies listeners of a "tabSelect" event.
     * 
     * @param {String} tabId the renderId of the child tab component
     */
    doTabSelect: function(tabId) {
        // Determine selected component.
        var tabComponent = this.application.getComponentByRenderId(tabId);
        if (!tabComponent || tabComponent.parent != this) {
            throw new Error("doTabSelect(): Invalid tab: " + tabId);
        }
        
        // Store active tab id.
        this.set("activeTabId", tabId);
        
        // Notify tabSelect listeners.
        this.fireEvent({ type: "tabSelect", source: this, tab: tabComponent, data: tabId });
    },
    
    /**
     * Internal property listener which synchronizes activeTabIndex and activeTabId properties when possible.
     * 
     * @param e a property event
     */
    _tabChangeListener: function(e) {
        var i;
        switch (e.propertyName) {
        case "activeTabId":
            if (this.application) {
                for (i = 0; i < this.children.length; ++i) {
                    if (this.children[i].renderId == e.newValue) {
                        if (this.get("activeTabIndex") != i) {
                            this.set("activeTabIndex", i);
                        }
                        return;
                    }
                }
            }
            break;
        case "activeTabIndex":
            i = parseInt(e.newValue, 10);
            if (this.application && this.children[i] && this.get("activeTabId") != this.children[i].renderId) {
                this.set("activeTabId", this.children[i].renderId);
            }
            break;
        }
    }
});

