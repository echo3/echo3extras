/**
 * AccordionPane component: contains multiple children in vertically arranged
 * tabs that slide up and down to reveal a single child at a time. May contain
 * multiple children. May contain panes as children.
 * 
 * @cp {String} activeTabId the renderId of the active tab
 * @cp {Number} activeTabIndex the index of the active tab
 * @sp {Number} animationTime the duration (in milliseconds) for which the
 *     animation transition effect should be rendered A value of zero indicates
 *     an instantaneous transition
 * @sp {#Insets} defaultContentInsets the default inset margin to display around
 *     child components
 * @sp {#Color} tabBackground the tab background color
 * @sp {#FillImage} tabBackgroundImage the tab background image
 * @sp {#Border} tabBorder the tab border
 * @sp {#Font} tabFont the tab font
 * @sp {#Color} tabForeground the tab foreground color
 * @sp {#Insets} tabInsets the tab inset margin
 * @sp {#Color} tabRolloverBackground the tab rollover background color
 * @sp {#FillImage} tabRolloverBackgroundImage the tab rollover background image
 * @sp {#Border} tabRolloverBorder the tab rollover border
 * @sp {#Font} tabRolloverFont the tab rollover font
 * @sp {Boolean} tabRolloverEnabled flag indicating whether rollover effects are
 *     enabled
 * @sp {#Color} tabRolloverForeground the tab rollover foreground color
 * @ldp {#ImageReference} icon the icon to display within a tab
 * @ldp {String} title the text to display within a tab
 */
Extras.AccordionPane = Core.extend(Echo.Component, {
    
    $static: {
    
        /**
         * The default animation time, 350ms.
         * @type Number
         */
        DEFAULT_ANIMATION_TIME: 350
    },
    
    $load: function() {
        Echo.ComponentFactory.registerType("Extras.AccordionPane", this);
    },
    
    /** @see Echo.Component#componentType */
    componentType: "Extras.AccordionPane",

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
