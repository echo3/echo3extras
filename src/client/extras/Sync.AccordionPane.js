/**
 * Component rendering peer: AccordionPane.
 * This class should not be extended by developers, the implementation is subject to change.
 */
Extras.Sync.AccordionPane = Core.extend(Echo.Render.ComponentSync, {

    $static: {
    
        /**
         * Supported partial update properties. 
         * @type Array
         */
        _supportedPartialProperties: { "activeTabId": true, "activeTabIndex": true },

        /**
         * Default component property settings, used when supported component object does not provide settings. 
         */
        _DEFAULTS: {
            tabBackground: "#cfcfcf",
            tabBorder: "1px outset #cfcfcf",
            tabForeground: "#000000",
            tabInsets: "2px 5px",
            tabContentInsets: 0
        }
    },
    
    $load: function() {
        Echo.Render.registerPeer("Extras.AccordionPane", this);
    },
    
    /**
     * Tab rotation animation runtime, in milliseconds.
     * @type Number
     */
    _animationTime: 0,
    
    /**
     * Root DIV.
     * @type Element
     */
    div: null,
    
    /**
     * renderId of currently active tab.
     * @type String
     */
    _activeTabId: null,

    /**
     * Flag indicating whether new images have been loaded, requiring a redraw/possible-resize of tabs.
     * @type Boolean
     */
    _newImagesLoaded: null,
    
    /**
     * Flag indicating whether renderDisplay is scheduled to be executed.
     * @type Boolean
     */
    _pendingRenderDisplay: false,
    
    /**
     * Animated rotation currently in progress (null when not animating).
     * @type Extras.Sync.AccordionPane.Rotation
     */
    rotation: null,
    
    /**
     * Array of Extras.Sync.AccordionPane.Tab instances representing individual tabs.
     * @type Array
     */
    tabs: null,
    
    /**
     * Flag indicating whether content overflow should be set to hidden during animation.
     * Set based on browser type, used to prevent rendering artifacts in certain browsers.
     * @type Boolean
     */
    resetOverflowForAnimation: false,
    
    /** 
     * Method reference to <code>_tabSelectListener</code> of instance.
     * @type Function 
     */
    _tabSelectListenerRef: null,
    
    /**
     * Method reference to image load monitoring function.
     * Rendering tabs register image loading listeners to this reference.
     * @type Function
     */
    imageMonitorRef: null,

    /** Constructor. */
    $construct: function() {
        this.tabs = [];
        this.resetOverflowForAnimation = Core.Web.Env.ENGINE_GECKO || Core.Web.Env.ENGINE_MSHTML;
        this._tabSelectListenerRef = Core.method(this, this._tabSelectListener);
        this.imageMonitorRef = Core.method(this, this._imageMonitor);
    },
    
    /**
     * Retrieves the tab instance with the specified tab id.
     * 
     * @param tabId the tab id
     * @return the tab, or null if no tab is present with the specified id
     */
    _getTabById: function(tabId) {
        for (var i = 0; i < this.tabs.length; ++i) {
            var tab = this.tabs[i];
            if (tab.childComponent.renderId == tabId) {
                return tab;
            }
        }
        return null;
    },
    
    /**
     * Determines the height of one or more tabs.
     *
     * If only beginIndex is specified, the height of the tab at index beginIndex will be returned.
     * Note that if endIndex is specified, the tab at index endIndex will NOT be included in the calculation,
     * that is, to measure the height of tabs 2, 3, and 4, it is necessary specify beginIndex as 2 and endIndex as 5 (not 4).
     *
     * @param {Number} beginIndex the begin index, inclusive
     * @param {Number} endIndex the end index, exclusive
     * @return the tab height(s), in pixels
     * @type Number
     */
    getTabHeight: function(beginIndex, endIndex) {
        if (endIndex == null || endIndex < beginIndex) {
            throw new Error("Invalid indices: begin=" + beginIndex + ",end=" + endIndex);
        } else {
            var tabHeight = 0;
            for (var i = beginIndex; i < endIndex; ++i) {
                tabHeight += this.tabs[i].tabDiv.offsetHeight;
            }
            return tabHeight;
        }
    },
    
    /**
     * Image monitor implementation.
     */
    _imageMonitor: function() {
        if (this._newImagesLoaded) {
            return;
        }
        this._newImagesLoaded = true;
        Core.Web.Scheduler.run(Core.method(this, function() {
            if (this.client && !this._pendingRenderDisplay) {
                this.redrawTabs(false);
            }
            this._newImagesLoaded = false;
        }));
    },
    
    /**
     * Capturing Mouseover/out listener to prevent rollover effects from firing on children during transitions.
     * Returns false if transition present.
     * 
     * @param e the rollover event
     */
    _processRollover: function(e) {
        return !this.rotation;
    },
    
    /**
     * Immediately redraws tabs in the appropriate positions, exposing the content of the 
     * selected tab.  Any active animated rotation is aborted.
     * 
     * @param {Boolean} notifyComponentUpdate flag indicating whether child component should be notified to perform
     *        renderDisplay() operations
     */
    redrawTabs: function(notifyComponentUpdate) {
        if (this.rotation) {
            this.rotation.abort();
        }
        
        if (this._activeTabId == null || this._getTabById(this._activeTabId) == null) {
            if (this.tabs.length > 0) {
                this._activeTabId = this.tabs[0].childComponent.renderId;
            } else {
                this._activeTabId = null;
            }
        }
        
        var selectionPassed = false;
        for (var i = 0; i < this.tabs.length; ++i) {
            if (selectionPassed) {
                this.tabs[i].tabDiv.style.top = "";
                this.tabs[i].tabDiv.style.bottom = this.getTabHeight(i + 1, this.tabs.length ) + "px";
            } else {
                this.tabs[i].tabDiv.style.bottom = "";
                this.tabs[i].tabDiv.style.top = this.getTabHeight(0, i) + "px";
            }
    
            this.tabs[i].containerDiv.style.height = "";
            
            if (this._activeTabId == this.tabs[i].childComponent.renderId) {
                selectionPassed = true;
                this.tabs[i].containerDiv.style.display = "block";
                this.tabs[i].containerDiv.style.top = this.getTabHeight(0, i + 1) + "px";
                this.tabs[i].containerDiv.style.bottom = this.getTabHeight(i + 1, this.tabs.length) + "px";
                this.tabs[i].contentDiv.style.top = 0;
                this.tabs[i].contentDiv.style.bottom = 0;
                this.tabs[i].contentDiv.style.height = "";
                Core.Web.VirtualPosition.redraw(this.tabs[i].contentDiv);
            } else {
                this.tabs[i].containerDiv.style.display = "none";
            }
        }
        
        if (notifyComponentUpdate) {
            Echo.Render.notifyResize(this.component);
            this.renderDisplayTabs();
        }
    },
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this.component.addListener("tabSelect", this._tabSelectListenerRef);
        
        this._animationTime = this.component.render("animationTime", Extras.AccordionPane.DEFAULT_ANIMATION_TIME);
        this._activeTabId = this.component.get("activeTabId");
        
        this.div = document.createElement("div");
        this.div.id = this.component.renderId;
        this.div.style.cssText = "position:absolute;width:100%;height:100%;";
        Echo.Sync.renderComponentDefaults(this.component, this.div);
        
        var rolloverMethod = Core.method(this, this._processRollover);
        Core.Web.Event.add(this.div, "mouseover", rolloverMethod, true);
        Core.Web.Event.add(this.div, "mouseout", rolloverMethod, true);
        
        var componentCount = this.component.getComponentCount();
        for (var i = 0; i < componentCount; ++i) {
            var child = this.component.getComponent(i);
            var tab = new Extras.Sync.AccordionPane.Tab(child, this);
            this.tabs.push(tab);
            tab.render(update);
            this.div.appendChild(tab.tabDiv);
            this.div.appendChild(tab.containerDiv);
        }
        
        parentElement.appendChild(this.div);
        
        this._pendingRenderDisplay = true;
    },
    
    /** @see Echo.Render.ComponentSync#renderDisplay */
    renderDisplay: function() {
        this._pendingRenderDisplay = false;
        if (!this.rotation) {
            this.redrawTabs(false);
        }
        this.renderDisplayTabs();
    },
    
    /**
     * Invokes renderDisplay() implementations on tabs.
     */
    renderDisplayTabs: function() {
        for (var i = 0; i < this.tabs.length; ++i) {
            this.tabs[i].renderDisplay();
        }
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        Core.Web.Event.removeAll(this.div);
        this.component.removeListener("tabSelect", this._tabSelectListenerRef);

        if (this.rotation) {
            this.rotation.abort();
        }
        this._activeTabId = null;
        for (var i = 0; i < this.tabs.length; i++) {
            this.tabs[i].dispose();
        }
        this.tabs = [];
        this.div = null;
    },
    
    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        var fullRender;

        if (update.hasUpdatedLayoutDataChildren() || update.hasAddedChildren() || update.hasRemovedChildren()) {
            // Add/remove/layout data change: full render.
            fullRender = true;
        } else {
            if (update.isUpdatedPropertySetIn(Extras.Sync.AccordionPane._supportedPartialProperties) &&
                   update.getUpdatedProperty("activeTabId")) {
                this._selectTab(update.getUpdatedProperty("activeTabId").newValue);
                fullRender = false;
            } else {
                fullRender = true;
            }
        }

        if (fullRender) {
            var element = this.div;
            var containerElement = element.parentNode;
            Echo.Render.renderComponentDispose(update, update.parent);
            containerElement.removeChild(element);
            this.renderAdd(update, containerElement);
        }

        return fullRender;
    },
    
    /**
     * "Rotates" the AccordionPane to display the specified tab.
     *
     * @param {String} oldTabId the currently displayed tab id
     * @param {String} newTabId the id of the tab that will be displayed
     */
    _rotateTabs: function(oldTabId, newTabId) {
        var oldTab = this._getTabById(oldTabId);
        if (oldTab == null) {
            // Old tab has been removed.
            this.redrawTabs(true);
            return;
        }
        if (this.rotation) {
            // Rotation was already in progress, cancel
            this.rotation.abort();
            this.redrawTabs(true);
        } else {
            // Start new rotation.
            var newTab = this._getTabById(newTabId);
            this.rotation = new Extras.Sync.AccordionPane.Rotation(this, oldTab, newTab);
            this.rotation.runTime = this._animationTime;
            this.rotation.start();
        }
    },
    
    /**
     * Selects a specific tab.
     * 
     * @param {String} tabId the id of the tab to select
     */
    _selectTab: function(tabId) {
        if (tabId == this._activeTabId) {
            return;
        }
        
        var oldTabId = this._activeTabId;
        this._activeTabId = tabId;
        if (oldTabId != null && this._animationTime > 0) {
            this._rotateTabs(oldTabId, tabId);
        } else {
            this.redrawTabs(true);
        }
    },
    
    /**
     * Event listener to component instance for user tab selections.
     * 
     * @param e the event
     */
    _tabSelectListener: function(e) {
        this._selectTab(e.tab.renderId);
    }
});

/**
 * Representation of a single tab (child component) within the accordion pane.
 * Provides tab-specific rendering functionality.
 */
Extras.Sync.AccordionPane.Tab = Core.extend({
    
    /**
     * DIV element containing the tab header
     * @type Element
     */
    tabDiv: null,
    
    /**
     * The AccordionPane synchronization peer.
     * @type Extras.Sync.AccordionPane
     */
    _parent: null,
    
    /**
     * The content container DIV (contains content DIV).
     * @type Element
     */
    containerDiv: null,
    
    /**
     * The content DIV (contains child component rendering).
     * @type Element
     */
    contentDiv: null,
    
    /**
     * The child component which will be rendered within the tab.
     * @type Echo.Component
     */
    childComponent: null,
    
    /**
     * Creates a new Tab instance.
     * 
     * @param {Echo.Component} childComponent the child component which will be rendered within the tab
     * @param {Extras.Sync.AccordionPane} parent the AccordionPane synchronization peer
     */
    $construct: function(childComponent, parent) {
        this.childComponent = childComponent;
        this._parent = parent;
    },
    
    /**
     * Adds event listeners to the tab to handle click and mouse events.
     */
    _addEventListeners: function() {
        Core.Web.Event.add(this.tabDiv, "click", Core.method(this, this._processClick), false);
        if (this._parent.component.render("tabRolloverEnabled", true)) {
            Core.Web.Event.add(this.tabDiv, 
                    Core.Web.Env.PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED ? "mouseenter" : "mouseover", 
                    Core.method(this, this._processEnter), false);
            Core.Web.Event.add(this.tabDiv, 
                    Core.Web.Env.PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED ? "mouseleave" : "mouseout", 
                    Core.method(this, this._processExit), false);
        }
        Core.Web.Event.Selection.disable(this.tabDiv);
    },
    
    /**
     * Disposes of the tab, releasing any resources.
     */
    dispose: function() {
        Core.Web.Event.removeAll(this.tabDiv);
        this._parent = null;
        this.childComponent = null;
        this.tabDiv = null;
        this.containerDiv = null;
    },
    
    /**
     * Determine content inset margin.
     * 
     * @return the content inset margin
     * @type #Insets
     */
    getContentInsets: function() {
        if (this.childComponent.pane) {
            return 0;
        } else {
            var insets = this._parent.component.render("defaultContentInsets");
            return insets ? insets : Extras.Sync.AccordionPane._DEFAULTS.tabContentInsets;
        }
    },
    
    /**
     * Tab click handler.
     * 
     * @param e the click event
     */
    _processClick: function(e) {
        if (!this._parent || !this._parent.client || !this._parent.client.verifyInput(this._parent.component)) {
            return;
        }
        this._parent.component.doTabSelect(this.childComponent.renderId);
    },
    
    /**
     * Tab rollover enter handler.
     * 
     * @param e the mouse event
     */
    _processEnter: function(e) {
        if (!this._parent || !this._parent.client || !this._parent.client.verifyInput(this._parent.component)) {
            return;
        }
        this._renderState(true);
    },
    
    /**
     * Tab rollover exit handler.
     * 
     * @param e the mouse event
     */
    _processExit: function(e) {
        if (!this._parent || !this._parent.client || !this._parent.client.verifyInput(this._parent.component)) {
            return;
        }
        this._renderState(false);
    },
    
    /**
     * Renders the tab.
     * 
     * @param {Echo.Update.ComponentUpdate} update the component update 
     */
    render: function(update) {
        var layoutData = this.childComponent.render("layoutData") || {};
        
        this.tabDiv = document.createElement("div");
        this.tabDiv.id = this._parent.component.renderId + "_tab_" + this.childComponent.renderId;
        this.tabDiv.style.cssText = "cursor:pointer;position:absolute;left:0;right:0;overflow:hidden;";
        
        Echo.Sync.Insets.render(this._parent.component.render("tabInsets", Extras.Sync.AccordionPane._DEFAULTS.tabInsets), 
                this.tabDiv, "padding");
        
        if (layoutData.icon) {
            //FIXME Temporary implementation.  Need proper layout for common icon + text case.
            var img = document.createElement("img");
            Echo.Sync.ImageReference.renderImg(layoutData.icon, img);
            img.style.paddingRight = "3px";
            this.tabDiv.appendChild(img);
            
            Core.Web.Image.monitor(this.tabDiv, this._parent.imageMonitorRef);
        }
        
        this.tabDiv.appendChild(document.createTextNode(layoutData.title ? layoutData.title : "\u00a0"));
    
        this.containerDiv = document.createElement("div");
        this.containerDiv.style.cssText = "display:none;position:absolute;left:0;right:0;overflow:hidden;";
        
        this.contentDiv = document.createElement("div");
        this.contentDiv.style.cssText = "position:absolute;left:0;right:0;overflow:auto;";
        Echo.Sync.Insets.render(this.getContentInsets(), this.contentDiv, "padding");
        
        Echo.Render.renderComponentAdd(update, this.childComponent, this.contentDiv);
        
        this.containerDiv.appendChild(this.contentDiv);
        
        this._renderState(false);
        this._addEventListeners();
    },
    
    /**
     * Renders the tab active or inactive, updating header state.
     * 
     * @param {Boolean} rollover the rollover state of the tab, true for active, false for inactive
     */
    _renderState: function(rollover) {
        var tabDiv = this.tabDiv,
            border = this._parent.component.render("tabBorder", Extras.Sync.AccordionPane._DEFAULTS.tabBorder),
            borderData,
            borderDataBottom,
            background = this._parent.component.render("tabBackground", Extras.Sync.AccordionPane._DEFAULTS.tabBackground);
            
        if (rollover) {
            var rolloverBackground = this._parent.component.render("tabRolloverBackground");
            if (!rolloverBackground) {
                rolloverBackground = Echo.Sync.Color.adjust(background, 20, 20, 20);
            }
            Echo.Sync.Color.render(rolloverBackground, tabDiv, "backgroundColor");
            var backgroundImage = this._parent.component.render("tabRolloverBackgroundImage");
            if (backgroundImage) {
                tabDiv.style.backgroundImage = "";
                tabDiv.style.backgroundPosition = "";
                tabDiv.style.backgroundRepeat = "";
                Echo.Sync.FillImage.render(backgroundImage, tabDiv, null);
            }
            var foreground = this._parent.component.render("tabRolloverForeground");
            if (foreground) {
                Echo.Sync.Color.render(foreground, tabDiv, "color");
            }
            Echo.Sync.Font.render(this._parent.component.render("tabRolloverFont"), tabDiv);
            var rolloverBorder = this._parent.component.render("tabRolloverBorder");
            if (!rolloverBorder) {
                rolloverBorder = border;
                if (Echo.Sync.Border.isMultisided(rolloverBorder)) {
                    borderData = Echo.Sync.Border.parse(rolloverBorder.top);
                    borderDataBottom = Echo.Sync.Border.parse(rolloverBorder.bottom);
                    rolloverBorder = {
                            top: Echo.Sync.Border.compose(borderData.size, borderData.style,
                                    Echo.Sync.Color.adjust(borderData.color, 20, 20, 20)),
                            bottom: Echo.Sync.Border.compose(borderDataBottom.size, borderDataBottom.style,
                                    Echo.Sync.Color.adjust(borderDataBottom.color, 20, 20, 20))
                    };
                } else {
                    borderData = Echo.Sync.Border.parse(rolloverBorder);
                    rolloverBorder = Echo.Sync.Border.compose(borderData.size, borderData.style,
                            Echo.Sync.Color.adjust(borderData.color, 20, 20, 20));
                }
            }
        } else {
            Echo.Sync.Color.render(background, tabDiv, "backgroundColor");
            Echo.Sync.Color.render(this._parent.component.render("tabForeground", 
                    Extras.Sync.AccordionPane._DEFAULTS.tabForeground), tabDiv, "color");
            Echo.Sync.Font.renderClear(this._parent.component.render("tabFont"), tabDiv);
            tabDiv.style.backgroundImage = "";
            tabDiv.style.backgroundPosition = "";
            tabDiv.style.backgroundRepeat = "";
            Echo.Sync.FillImage.render(this._parent.component.render("tabBackgroundImage"), tabDiv);
        }

        if (Echo.Sync.Border.isMultisided(border)) {
            Echo.Sync.Border.render(border.top, tabDiv, "borderTop");
            Echo.Sync.Border.render(border.bottom, tabDiv, "borderBottom");
        } else {
            Echo.Sync.Border.render(border, tabDiv, "borderTop");
            Echo.Sync.Border.render(border, tabDiv, "borderBottom");
        }
    },
    
    /**
     * Tab-specific renderDisplay() tasks.
     */
    renderDisplay: function() {
        Core.Web.VirtualPosition.redraw(this.tabDiv);
        Core.Web.VirtualPosition.redraw(this.containerDiv);
        Core.Web.VirtualPosition.redraw(this.contentDiv);
    }
});

/**
 * Manages the rotation animation of an AccordionPane.
 */
Extras.Sync.AccordionPane.Rotation = Core.extend(Extras.Sync.Animation, {
    
    /**
     * The AccordionPane peer.
     * @type Extras.Sync.AccordionPane
     */
    _parent: null,

    /**
     * The old tab.
     * @type Extras.Sync.AccordionPane.Tab 
     */
    _oldTab: null,
    
    /**
     * The new tab.
     * @type Extras.Sync.AccordionPane.Tab 
     */
    _newTab: null,
    
    /**
     * Index of old tab.
     * @type Number
     */
    _oldTabIndex: null,
    
    /**
     * Index of new tab.
     * @type Number
     */
    _newTabIndex: null,
    
    /**
     * Flag indicating whether tabs will be rotating downward (true) or upward (false).
     * @type Boolean
     */
    _directionDown: null,
    
    /**
     * Number of tabs which are rotating.
     * @type Number
     */
    _rotatingTabCount: null,
    
    /**
     * Height of accordion pane.
     * @type Number
     */
    _regionHeight: null,
    
    /**
     * Numbers of tabs above that will not be moving.
     * @type Number
     */
    _numberOfTabsAbove: null,
    
    /**
     * Number of tabs below that will not be moving.
     * @type Number
     */
    _numberOfTabsBelow: null,
    
    /** 
     * Initial position of extreme edge of first moving tab.
     * For downward moves, this value is the top edge of the top tab.
     * For upward moves, this value is the bottom edge of the bottom tab.
     * @param Number
     */
    _startPosition: null,
    
    /**
     * Number of pixels across which animation will occur.
     * @type Number
     */
    _animationDistance: null,
    
    /**
     * Creates a new rotation.
     *
     * @param {Extras.Sync.AccordionPane} parent the AccordionPane peer
     * @param {Extras.Sync.AccordionPane.Tab} oldTab the old (current) tab
     * @param {Extras.Sync.AccordionPane.Tab} newTab the new tab to display
     */
    $construct: function(parent, oldTab, newTab) {
        this._parent = parent;
        this._oldTab = oldTab;
        this._newTab = newTab;
        
        // Calculate and store parameters for rotation.
        this._regionHeight = this._parent.div.offsetHeight;
        this._oldTabIndex = Core.Arrays.indexOf(this._parent.tabs, this._oldTab);
        this._newTabIndex = Core.Arrays.indexOf(this._parent.tabs, this._newTab);
        this._rotatingTabCount = Math.abs(this._newTabIndex - this._oldTabIndex);
        this._directionDown = this._newTabIndex < this._oldTabIndex;
        if (this._directionDown) {
            this._numberOfTabsAbove = this._newTabIndex + 1;
            this._numberOfTabsBelow = this._parent.tabs.length - 1 - this._newTabIndex;
            this._startPosition = this._parent.getTabHeight(0, this._newTabIndex + 1);
            this._animationDistance = this._regionHeight - 
                    this._parent.getTabHeight(this._newTabIndex + 1, this._parent.tabs.length) - this._startPosition;
        } else {
            this._numberOfTabsAbove = this._newTabIndex;
            this._numberOfTabsBelow = this._parent.tabs.length - 1 - this._newTabIndex;
            this._startPosition = this._parent.getTabHeight(this._newTabIndex + 1, this._parent.tabs.length);
            this._animationDistance = this._regionHeight - this._parent.getTabHeight(0, this._newTabIndex + 1) - 
                    this._startPosition;
        }
    },
    
    /** @see Extras.Sync.Animation#complete */
    complete: function() {
        this._parent.rotation = null;

        // Complete Rotation.
        var parent = this._parent;
        
        if (this._parent.resetOverflowForAnimation) {
            this._oldTab.contentDiv.style.overflow = "auto";
            this._newTab.contentDiv.style.overflow = "auto";
        }

        var renderId = this._parent.component.renderId;
        this._parent = null;
        this._oldTab = null;
        this._newTab = null;
        
        parent.redrawTabs(true);
    },
    
    /** @see Extras.Sync.Animation#init */
    init: function() {
        this._newTab.containerDiv.style.height = "";
        if (this._directionDown) {
            this._oldTab.containerDiv.style.bottom = "";
            this._newTab.containerDiv.style.top = this._parent.getTabHeight(0, this._newTabIndex + 1) + "px";
        } else {
            this._newTab.containerDiv.style.top = "";
            this._newTab.containerDiv.style.bottom = 
                    this._parent.getTabHeight(this._newTabIndex + 1, this._parent.tabs.length) + "px";
        }
        this._newTab.containerDiv.style.display = "block";

        // Set size of tab content to be equivalent to available space.
        var regionContentHeight = this._parent.div.offsetHeight - this._parent.getTabHeight(0, this._parent.tabs.length);
        var oldTabInsets = Echo.Sync.Insets.toPixels(this._oldTab.getContentInsets());
        var newTabInsets = Echo.Sync.Insets.toPixels(this._newTab.getContentInsets());
        var oldContentHeight = regionContentHeight - oldTabInsets.top - oldTabInsets.bottom;
        var newContentHeight = regionContentHeight - newTabInsets.top - newTabInsets.bottom;
        oldContentHeight = oldContentHeight > 0 ? oldContentHeight : 0;
        newContentHeight = newContentHeight > 0 ? newContentHeight : 0;

        if (this._parent.resetOverflowForAnimation) {
            this._oldTab.contentDiv.style.overflow = "hidden";
            this._newTab.contentDiv.style.overflow = "hidden";
        }

        this._oldTab.contentDiv.style.bottom = "";
        this._newTab.contentDiv.style.bottom = "";
        this._oldTab.contentDiv.style.height = oldContentHeight + "px";
        this._newTab.contentDiv.style.height = newContentHeight + "px";
    },

    /** @see Extras.Sync.Animation#step */
    step: function(progress) {
        var i,
            oldContainerHeight,
            newContainerHeight,
            stepPosition = Math.round(progress * this._animationDistance);

        if (this._directionDown) {
            // Move each moving tab to next step position.
            for (i = this._oldTabIndex; i > this._newTabIndex; --i) {
                this._parent.tabs[i].tabDiv.style.top = (stepPosition + this._startPosition + 
                        this._parent.getTabHeight(this._newTabIndex + 1, i)) + "px";
            }

            // Adjust height of expanding new tab content to fill expanding space.
            newContainerHeight = stepPosition;
            if (newContainerHeight < 0) {
                newContainerHeight = 0;
            }
            this._newTab.containerDiv.style.height = newContainerHeight + "px";

            // Move top of old content downward.
            var oldTop = stepPosition + this._startPosition + 
                    this._parent.getTabHeight(this._newTabIndex + 1, this._oldTabIndex + 1);
            this._oldTab.containerDiv.style.top = oldTop + "px";

            // Reduce height of contracting old tab content to fit within contracting space.
            oldContainerHeight = this._regionHeight - this._parent.getTabHeight(this._newTabIndex, this._oldTabIndex);
            if (oldContainerHeight < 0) {
                oldContainerHeight = 0;
            }
            this._oldTab.containerDiv.style.height = oldContainerHeight + "px";
        } else {
            // Move each moving tab to next step position.
            for (i = this._oldTabIndex + 1; i <= this._newTabIndex; ++i) {
                this._parent.tabs[i].tabDiv.style.bottom = (stepPosition + this._startPosition + 
                        this._parent.getTabHeight(i + 1, this._newTabIndex + 1)) + "px";
            }

            // Reduce height of contracting old tab content to fit within contracting space.
            oldContainerHeight = this._regionHeight - stepPosition - 
                    this._parent.getTabHeight(this._oldTabIndex, this._newTabIndex); 
            if (oldContainerHeight < 0) {
                oldContainerHeight = 0;
            }
            this._oldTab.containerDiv.style.height = oldContainerHeight + "px";

            // Increase height of expanding tab content to fit within expanding space.
            newContainerHeight = stepPosition;
            if (newContainerHeight < 0) {
                newContainerHeight = 0;
            }
            this._newTab.containerDiv.style.height = newContainerHeight + "px";
        }
    }
});
