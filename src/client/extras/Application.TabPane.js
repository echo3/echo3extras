/**
 * TabPane component.
 *
 * @cp {Number} activeTabIndex the index of the active tab
 * @sp {Number} borderType the border border type, one of the following values:
 *     <ul>
 *      <li><code>BORDER_TYPE_NONE</code></li>
 *      <li><code>BORDER_TYPE_ADJACENT_TO_TABS</code> (the default)</li>
 *      <li><code>BORDER_TYPE_PARALLEL_TO_TABS</code></li>
 *      <li><code>BORDER_TYPE_SURROUND</code></li>
 *     </ul> 
 * @sp {#Insets} defaultContentInsets the default content inset margin 
 * @sp {#Insets} insets the inset margin around the entire <code>TabPane</code>
 * @sp {#FillImage} tabBackgroundImage the background image displayed behind the tabs
 * @sp {#ImageReference} tabActiveLeftImage the left image used to render active tabs
 * @sp {#ImageReference} tabActiveRightImage the right image used to render active tabs
 * @sp {#Color} tabActiveBackground the background color used to render active tabs
 * @sp {#FillImage} tabActiveBackgroundImage the background image used to render active tabs
 * @sp {#Border} tabActiveBorder the border surrounding the active tab and the content of the <code>TabPane</code>
 * @sp {#Font} tabActiveFont the font used to render active tabs
 * @sp {#Color} tabActiveForeground the foreground color used to render active tabs
 * @sp {#Extent} tabHeight the height of an individual (inactive) tab 
 * @sp {#Extent} tabActiveHeightIncrease the height increase of active tabs
 * @sp {#ImageReference} tabInactiveLeftImage the left image used to render inactive tabs
 * @sp {#ImageReference} tabInactiveRightImage the right image used to render inactive tabs
 * @sp {#Color} tabInactiveBackground the background color used to render inactive tabs
 * @sp {#FillImage} tabInactiveBackgroundImage the background image used to render inactive tabs
 * @sp {#Border} tabInactiveBorder the border surrounding inactive tabs
 * @sp {#Font} tabInactiveFont the font used to render inactive tabs
 * @sp {#Color} tabInactiveForeground the foreground color used to render inactive tabs
 * @sp {#Extent} tabIconTextMargin the margin size between the icon and the text
 * @sp {#Extent} tabInset the horizontal distance from which all tabs are inset from the edge of the <code>TabPane</code>
 * @sp {#Extent} tabSpacing the horizontal space between individual tabs
 * @sp {Number} tabPosition the position where the tabs are located relative to the pane content, one of the following values:
 *     <ul>
 *      <li><code>TAB_POSITION_TOP</code></li>
 *      <li><code>TAB_POSITION_BOTTOM</code></li>
 *     </ul>
 * @sp {#Extent} tabWidth the width of an individual tab
 * @sp {#Alignment} tabAlignment the alignment within an individual tab
 * @sp {Boolean} tabCloseEnabled flag indicating whether tabs may be closed
 * @sp {Boolean} tabCloseIconRolloverEnabled flag indicating whether tab close icon rollover effects are enabled
 * @sp {#ImageReference} tabCloseIcon the tab close icon
 * @sp {#ImageReference} tabDisabledCloseIcon the tab close icon for tabs that may not be closed
 * @sp {#ImageReference} tabRolloverCloseIcon the tab close rollover effect icon
 * @event tabClose
 */
Extras.TabPane = Core.extend(Echo.Component, {

    $static: {
    
        /**
         * Constant for the <code>borderType</code> property indicating that no 
         * border should be drawn around the content.
         * 
         * @type {Number}
         */
        BORDER_TYPE_NONE: 0,
        
        /**
         * Constant for the <code>borderType</code> property indicating that a
         * border should be drawn immediately adjacent to the tabs only.
         * If the tabs are positioned at the top of the <code>TabPane</code> the
         * border will only be drawn directly beneath the tabs with this setting.  
         * If the tabs are positioned at the bottom of the <code>TabPane</code> the
         * border will only be drawn directly above the tabs with this setting.
         * 
         * @type {Number}
         */
        BORDER_TYPE_ADJACENT_TO_TABS: 1,
        
        /**
         * Constant for the <code>borderType</code> property indicating that
         * borders should be drawn above and below the content, but not at its 
         * sides.
         * 
         * @type {Number}
         */
        BORDER_TYPE_PARALLEL_TO_TABS: 2,
        
        /**
         * Constant for the <code>borderType</code> property indicating that
         * borders should be drawn on all sides of the content.
         * 
         * @type {Number}
         */
        BORDER_TYPE_SURROUND: 3,
        
        /**
         * Constant for the <code>tabPosition</code> property indicating that
         * the tabs are positioned at the top of the <code>TabPane</code>.
         * 
         * @type {Number}
         */
        TAB_POSITION_TOP: 0,
        
        /**
         * Constant for the <code>tabPosition</code> property indicating that
         * the tabs are positioned at the bottom of the <code>TabPane</code>.
         * 
         * @type {Number}
         */
        TAB_POSITION_BOTTOM: 1
    },

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.TabPane", this);
    },

    componentType: "Extras.TabPane",
    pane: true,
    
    /**
     * Notifies listeners of a "tabClose" event.
     * 
     * @param child the child tab component which is to be closed
     */
    doTabClose: function(child) {
        this.fireEvent({ type: "tabClose", source: this, tab: child, data: child.renderId });
    }
});

