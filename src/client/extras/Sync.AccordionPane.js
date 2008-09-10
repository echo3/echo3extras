// FIXME handle enabled/disabled state

/**
 * Component rendering peer: AccordionPane
 */
Extras.Sync.AccordionPane = Core.extend(Echo.Render.ComponentSync, {

    $static: {
        _paneInsets: 0,
        _defaultTabBackground: "#cfcfcf",
        _defaultTabBorder: "1px outset #cfcfcf",
        _defaultTabForeground: "#000000",
        _defaultTabHeight: "20px",
        _defaultTabInsets: "2px 5px",
        _defaultTabContentInsets: this._paneInsets
    },
    
    $load: function() {
        Echo.Render.registerPeer("Extras.AccordionPane", this);
    },
    
    _animationTime: 0,
    _div: null,
    _activeTabId: null,
    _rotation: null,
    _animationEnabled: true,
    _animationSleepInterval: 1,
    _tabs: null,
    
    $construct: function() {
        this._tabs = [];
    },
    
    renderAdd: function(update, parentElement) {
        this._animationTime = this.component.render("animationTime", Extras.AccordionPane.DEFAULT_ANIMATION_TIME);
        this._activeTabId = this.component.get("activeTab");
        
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        this._div.style.cssText = "position:absolute;overflow:hidden;width:100%;height:100%;";
        Echo.Sync.Color.renderFB(this.component, this._div);
        Echo.Sync.Font.render(this.component.render("font"), this._div);
        
        var componentCount = this.component.getComponentCount();
        for (var i = 0; i < componentCount; ++i) {
            var child = this.component.getComponent(i);
            var tab = new Extras.Sync.AccordionPane.Tab(child, this);
            this._tabs.push(tab);
            tab._render(this.client, update);
            this._div.appendChild(tab._tabDivElement);
            this._div.appendChild(tab._contentDivElement);
        }
        
        this._redrawTabs();
        
        parentElement.appendChild(this._div);
    },
    
    renderDisplay: function() {
        for (var i = 0; i < this._tabs.length; ++i) {
            this._tabs[i]._renderDisplay();
        }
    },
    
    renderUpdate: function(update) {
        var fullRender;

        if (update.hasUpdatedLayoutDataChildren() || update.hasAddedChildren() || update.hasRemovedChildren()) {
            // Add/remove/layout data change: full render.
            fullRender = true;
        } else {
            var propertyNames = update.getUpdatedPropertyNames();
            if (propertyNames.length == 1 && propertyNames[0] == "activeTab") {
                this._selectTab(update.getUpdatedProperty("activeTab").newValue);
                fullRender = false;
            } else {
                fullRender = true;
            }
        }

        if (fullRender) {
            var element = this._div;
            var containerElement = element.parentNode;
            Echo.Render.renderComponentDispose(update, update.parent);
            containerElement.removeChild(element);
            this.renderAdd(update, containerElement);
        }

        return fullRender;
    },

    renderDispose: function(update) {
        if (this._rotation) {
            this._rotation._dispose();
        }
        this._activeTabId = null;
        for (var i = 0; i < this._tabs.length; i++) {
            this._tabs[i]._dispose();
        }
        this._tabs = [];
        this._div = null;
    },
    
    /**
     * Selects a specific tab.
     * 
     * @param tabId {String} the id of the tab to select
     */
    _selectTab: function(tabId) {
        if (tabId == this._activeTabId) {
            return;
        }
        this.component.set("activeTab", tabId);
        
        var oldTabId = this._activeTabId;
        this._activeTabId = tabId;
        if (oldTabId != null && this._animationEnabled) {
            this._rotateTabs(oldTabId, tabId);
        } else {
            this._redrawTabs();
        }
    },
    
    /**
     * Removes a tab from an AccordionPane.
     *
     * @param tab the tab to remove
     */
    _removeTab: function(tab) {
        var tabIndex = Core.Arrays.indexOf(this._tabs, tab);
        this._tabs.splice(tabIndex, 1);
    
        tab._tabDivElement.parentNode.removeChild(tab._tabDivElement);
        tab._contentDivElement.parentNode.removeChild(tab._contentDivElement);
        tab._dispose();
    },
    
    /**
     * Redraws tabs in the appropriate positions, exposing the content of the 
     * selected tab.
     */
    _redrawTabs: function() {
        if (this._rotation) {
            this._rotation._cancel();
        }
        
        if (this._activeTabId == null || this._getTabById(this._activeTabId) == null) {
            if (this._tabs.length > 0) {
                this._activeTabId = this._tabs[0]._childComponent.renderId;
            } else {
                this._activeTabId = null;
            }
        }
        
        var selectionPassed = false;
        var tabHeight = this._calculateTabHeight();
        for (var i = 0; i < this._tabs.length; ++i) {
            var tab = this._tabs[i];
            var tabDivElement = tab._tabDivElement;
            var contentDivElement = tab._contentDivElement;
            
            if (selectionPassed) {
                tabDivElement.style.top = "";
                tabDivElement.style.bottom = (tabHeight * (this._tabs.length - i - 1)) + "px";
            } else {
                tabDivElement.style.bottom = "";
                tabDivElement.style.top = (tabHeight * i) + "px";
            }
    
            contentDivElement.style.height = "";
            
            if (this._activeTabId == tab._childComponent.renderId) {
                selectionPassed = true;
                contentDivElement.style.display = "block";
                contentDivElement.style.top = (tabHeight * (i + 1)) + "px";
                var bottomPx = tabHeight * (this._tabs.length - i - 1);
                contentDivElement.style.bottom = bottomPx + "px";
            } else {
                contentDivElement.style.display = "none";
            }
        }
    },
    
    /**
     * "Rotates" the AccordionPane to display the specified tab.
     *
     * @param oldTabId {String} the currently displayed tab id
     * @param newTabId {String} the id of the tab that will be displayed
     */
    _rotateTabs: function(oldTabId, newTabId) {
        if (this._animationTime < 1) {
            this._redrawTabs();
            return;
        }
        var oldTab = this._getTabById(oldTabId);
        if (oldTab == null) {
            // Old tab has been removed.
            this._redrawTabs();
            return;
        }
        if (this._rotation) {
            // Rotation was already in progress, cancel
            this._rotation._cancel();
            this._redrawTabs();
        } else {
            // Start new rotation.
            var newTab = this._getTabById(newTabId);
            this._rotation = new Extras.Sync.AccordionPane.Rotation(this, oldTab, newTab);
        }
    },
    
    /**
     * Retrieves the tab instance with the specified tab id.
     * 
     * @param tabId the tab id
     * @return the tab, or null if no tab is present with the specified id
     */
    _getTabById: function(tabId) {
        for (var i = 0; i < this._tabs.length; ++i) {
            var tab = this._tabs[i];
            if (tab._childComponent.renderId == tabId) {
                return tab;
            }
        }
        return null;
    },
    
    _getTabBackground: function() {
        var background = this.component.render("tabBackground");
        return background ? background : Extras.Sync.AccordionPane._defaultTabBackground;
    },
    
    _getTabBorder: function() {
        var border = this.component.render("tabBorder");
        return border ? border : Extras.Sync.AccordionPane._defaultTabBorder;
    },
    
    _getTabInsets: function() {
        var insets = this.component.render("tabInsets");
        return insets ? insets : Extras.Sync.AccordionPane._defaultTabInsets;
    },
    
    /**
     * @return the tab height in pixels
     * @type {Number}
     */
    _calculateTabHeight: function() {
        var height = Echo.Sync.Extent.toPixels(Extras.Sync.AccordionPane._defaultTabHeight);
        var insets = Echo.Sync.Insets.toPixels(this._getTabInsets());
        var border = this._getTabBorder();
        return height + insets.top + insets.bottom + Echo.Sync.Border.getPixelSize(border) * 2;
    }
});

Extras.Sync.AccordionPane.Tab = Core.extend({
    
    _rendered: false,
    _tabDivElement: null,
    _parent: null,
    _contentDivElement: null,
    _childComponent: null,
    
    $construct: function(childComponent, parent) {
        this._childComponent = childComponent;
        this._parent = parent;
    },
    
    _dispose: function() {
        Core.Web.Event.removeAll(this._tabDivElement);
        this._parent = null;
        this._childComponent = null;
        this._tabDivElement = null;
        this._contentDivElement = null;
    },
    
    _highlight: function(state) {
        var tabDivElement = this._tabDivElement;
        if (state) {
            var background = this._parent.component.render("tabRolloverBackground");
            if (!background) {
                background = Echo.Sync.Color.adjust(this._parent._getTabBackground(), 20, 20, 20);
            }
            Echo.Sync.Color.render(background, tabDivElement, "backgroundColor");
            var backgroundImage = this._parent.component.render("tabRolloverBackgroundImage");
            if (backgroundImage) {
                tabDivElement.style.backgroundImage = "";
                tabDivElement.style.backgroundPosition = "";
                tabDivElement.style.backgroundRepeat = "";
                Echo.Sync.FillImage.render(backgroundImage, tabDivElement, null);
            }
            var foreground = this._parent.component.render("tabRolloverForeground");
            if (foreground) {
                Echo.Sync.Color.render(foreground, tabDivElement, "color");
            }
            var border = this._parent.component.render("tabRolloverBorder");
            if (!border) {
                var borderData = Echo.Sync.Border.parse(this._parent._getTabBorder());
                border = Echo.Sync.Border.compose(borderData.size, borderData.style,
                        Echo.Sync.Color.adjust(borderData.color, 20, 20, 20));
            }
            Echo.Sync.Border.render(border, tabDivElement, "borderTop");
            Echo.Sync.Border.render(border, tabDivElement, "borderBottom");
        } else {
            var border = this._parent._getTabBorder();
            Echo.Sync.Border.render(border, tabDivElement, "borderTop");
            Echo.Sync.Border.render(border, tabDivElement, "borderBottom");
            Echo.Sync.Color.render(this._parent._getTabBackground(), tabDivElement, "backgroundColor");
            Echo.Sync.Color.render(this._parent.component.render("tabForeground", 
                    Extras.Sync.AccordionPane._defaultTabForeground), tabDivElement, "color");
            tabDivElement.style.backgroundImage = "";
            tabDivElement.style.backgroundPosition = "";
            tabDivElement.style.backgroundRepeat = "";
            Echo.Sync.FillImage.render(this._parent.component.render("tabBackgroundImage"), tabDivElement);
        }
    },
    
    _addEventListeners: function() {
        Core.Web.Event.add(this._tabDivElement, "click", Core.method(this, this._processClick), false);
        if (this._parent.component.render("tabRolloverEnabled", true)) {
            Core.Web.Event.add(this._tabDivElement, "mouseover", Core.method(this, this._processEnter), false);
            Core.Web.Event.add(this._tabDivElement, "mouseout", Core.method(this, this._processExit), false);
        }
        Core.Web.Event.Selection.disable(this._tabDivElement);
    },
    
    _getTitle: function() {
        var layoutData = this._childComponent.render("layoutData");
        return layoutData ? layoutData.title : null;
    },
    
    _getContentInsets: function() {
        if (this._childComponent.pane) {
            return Extras.Sync.AccordionPane._paneInsets;
        } else {
            var insets = this._parent.component.render("defaultContentInsets");
            return insets ? insets : Extras.Sync.AccordionPane._defaultTabContentInsets;
        }
    },
    
    _processClick: function(e) {
        if (!this._parent.component.isActive()) {
            return;
        }
        this._parent._selectTab(this._childComponent.renderId);
        // FIXME notify server
    },
    
    _processEnter: function(e) {
        if (!this._parent.component.isActive()) {
            return;
        }
        this._highlight(true);
    },
    
    _processExit: function(e) {
        if (!this._parent.component.isActive()) {
            return;
        }
        this._highlight(false);
    },
    
    _render: function(client, update) {
        this._tabDivElement = document.createElement("div");
        this._tabDivElement.id = this._parent.component.renderId + "_tab_" + this._childComponent.renderId;
        this._tabDivElement.style.cursor = "pointer";
        this._tabDivElement.style.height = Extras.Sync.AccordionPane._defaultTabHeight;
        Echo.Sync.Insets.render(this._parent._getTabInsets(), this._tabDivElement, "padding");
        this._tabDivElement.style.position = "absolute";
        this._tabDivElement.style.left = "0px";
        this._tabDivElement.style.right = "0px";
        this._tabDivElement.style.overflow = "hidden";
        this._tabDivElement.appendChild(document.createTextNode(this._getTitle()));
    
        this._contentDivElement = document.createElement("div");
        this._contentDivElement.id = this._parent.component.renderId + "_content_" + this._childComponent.renderId;
        this._contentDivElement.style.display = "none";
        this._contentDivElement.style.position = "absolute";
        this._contentDivElement.style.left = "0px";
        this._contentDivElement.style.right = "0px";
        Echo.Sync.Insets.render(this._getContentInsets(), this._contentDivElement, "padding");
        this._contentDivElement.style.overflow = "auto";
    
        Echo.Render.renderComponentAdd(update, this._childComponent, this._contentDivElement);
        
        this._highlight(false);
        this._addEventListeners();
    },
    
    _renderDisplay: function() {
        Core.Web.VirtualPosition.redraw(this._tabDivElement);
        Core.Web.VirtualPosition.redraw(this._contentDivElement);
    }
});

/**
 * Object to manage rotation animation of an AccordionPane.
 * These objects are created and assigned to a specific AccordionPane
 * while it is animating.
 *
 * Creates and starts a new Rotation.  This constructor will store the
 * created Rotation object in the specified AccordionPane's 'rotation'
 * property.
 *
 * @param parent the AccordionPane to rotate
 * @param oldTab the old (current) tab
 * @param newTab the new tab to display
 */
Extras.Sync.AccordionPane.Rotation = Core.extend({
    
    _parent: null,
    _oldTab: null,
    _newTab: null,
    _animationRunnable: null,
    _animationStepIndex: 0,
    
    $construct: function(parent, oldTab, newTab) {
        this._parent = parent;
        this._oldTab = oldTab;
        this._newTab = newTab;
        
        this._animationRunnable = new Core.Web.Scheduler.MethodRunnable(Core.method(this, this._animationStep), 
                parent._animationSleepInterval, false);
        
        this._oldTabContentInsets = Echo.Sync.Insets.toPixels(this._oldTab._getContentInsets());
        this._newTabContentInsets = Echo.Sync.Insets.toPixels(this._newTab._getContentInsets());
        
        this._animationStartTime = new Date().getTime();
        this._animationEndTime = this._animationStartTime + this._parent._animationTime;
        
        this._tabHeight = this._parent._calculateTabHeight();
        
        this._rotatingTabs = [];
        
        this._oldTabIndex = Core.Arrays.indexOf(this._parent._tabs, this._oldTab);
        this._newTabIndex = Core.Arrays.indexOf(this._parent._tabs, this._newTab);
        this._directionDown = this._newTabIndex < this._oldTabIndex;
        
        if (this._directionDown) {
            // Tabs are sliding down (a tab on the top has been selected).
            for (var i = this._oldTabIndex; i > this._newTabIndex; --i) {
                this._rotatingTabs.push(this._parent._tabs[i]);
            }
        } else {
            // Tabs are sliding up (a tab on the bottom has been selected).
            for (var i = this._oldTabIndex + 1; i <= this._newTabIndex; ++i) {
                this._rotatingTabs.push(this._parent._tabs[i]);
            }
        }
        
        this._regionHeight = this._newTab._tabDivElement.parentNode.offsetHeight;
        
        if (this._directionDown) {
            // Numbers of tabs above that will not be moving.
            this._numberOfTabsAbove = this._newTabIndex + 1;
            
            // Number of tabs below that will not be moving.
            this._numberOfTabsBelow = this._parent._tabs.length - 1 - this._newTabIndex;
            
            // Initial top position of topmost moving tab.
            this._startTopPosition = this._tabHeight * this._numberOfTabsAbove;
            
            // Final top position of topmost moving tab.
            this._endTopPosition = this._regionHeight - this._tabHeight * (this._numberOfTabsBelow);
            
            // Number of pixels across which animation will occur.
            this._animationDistance = this._endTopPosition - this._startTopPosition;
        
        } else {
            // Numbers of tabs above that will not be moving.
            this._numberOfTabsAbove = this._newTabIndex;
        
            // Numbers of tabs below that will not be moving.
            this._numberOfTabsBelow = this._parent._tabs.length - 1 - this._newTabIndex;
    
            // Initial bottom position of bottommost moving tab.
            this._startBottomPosition = this._tabHeight * this._numberOfTabsBelow;
    
            // Final bottom position of bottommost moving tab.
            this._endBottomPosition = this._regionHeight - this._tabHeight * (this._numberOfTabsAbove + 1);
            
            // Number of pixels across which animation will occur.
            this._animationDistance = this._endBottomPosition - this._startBottomPosition;
        }

        this._animationStep();
    },
    
    /**
     * Renders the next step of the rotation animation.
     * Queues subsequent frame of animation via Window.setTimeout() call to self.
     */
    _animationStep: function() {
        var currentTime = new Date().getTime();
        
        if (currentTime < this._animationEndTime) {
            // Number of pixels (from 0) to step current current frame.
            
            var stepFactor = (currentTime - this._animationStartTime) / this._parent._animationTime;
            var stepPosition = Math.round(stepFactor * this._animationDistance);
    
            if (this._directionDown) {
    
                // Move each moving tab to next step position.
                for (var i = 0; i < this._rotatingTabs.length; ++i) {
                    var newPosition = stepPosition + this._startTopPosition 
                            + (this._tabHeight * (this._rotatingTabs.length - i - 1));
                    this._rotatingTabs[i]._tabDivElement.style.top = newPosition + "px";
                }
                
                // Adjust height of expanding new tab content to fill expanding space.
                var newContentHeight = stepPosition - this._oldTabContentInsets.top - this._oldTabContentInsets.bottom;
                if (newContentHeight < 0) {
                    newContentHeight = 0;
                }
                this._newTab._contentDivElement.style.height = newContentHeight + "px";
                
                // On first frame, display new tab content.
                if (this._animationStepIndex == 0) {
                    this._oldTab._contentDivElement.style.bottom = "";
                    this._newTab._contentDivElement.style.display = "block";
                    this._newTab._contentDivElement.style.top = (this._numberOfTabsAbove * this._tabHeight) + "px";
                }
                
                // Move top of old content downward.
                var oldTop = stepPosition + this._startTopPosition + (this._rotatingTabs.length * this._tabHeight);
                this._oldTab._contentDivElement.style.top = oldTop + "px";
                
                // Reduce height of contracting old tab content to fit within contracting space.
                var oldContentHeight = this._regionHeight - oldTop - ((this._numberOfTabsBelow - 1) * this._tabHeight) 
                        - this._oldTabContentInsets.top - this._oldTabContentInsets.bottom;
                if (oldContentHeight < 0) {
                    oldContentHeight = 0;
                }
                this._oldTab._contentDivElement.style.height = oldContentHeight + "px";
            } else {
                // Move each moving tab to next step position.
                for (var i = 0; i < this._rotatingTabs.length; ++i) {
                    var newPosition = stepPosition + this._startBottomPosition 
                            + (this._tabHeight * (this._rotatingTabs.length - i - 1));
                    this._rotatingTabs[i]._tabDivElement.style.bottom = newPosition + "px";
                }
                
                // On first frame, display new tab content.
                if (this._animationStepIndex == 0) {
                    this._oldTab._contentDivElement.style.bottom = "";
                    this._newTab._contentDivElement.style.top = "";
                    this._newTab._contentDivElement.style.bottom = (this._numberOfTabsBelow * this._tabHeight) + "px";
                    this._newTab._contentDivElement.style.height = "0px";
                    this._newTab._contentDivElement.style.display = "block";
                }
                
                // Reduce height of contracting old tab content to fit within contracting space.
                var oldContentHeight = this._regionHeight - stepPosition 
                        - ((this._numberOfTabsAbove + this._numberOfTabsBelow + 1) * this._tabHeight)
                        - this._oldTabContentInsets.top - this._oldTabContentInsets.bottom;
                if (oldContentHeight < 0) {
                    oldContentHeight = 0;
                }
                this._oldTab._contentDivElement.style.height = oldContentHeight + "px";
                
                // Increase height of expanding tab content to fit within expanding space.
                var newContentHeight = stepPosition - this._newTabContentInsets.top - this._newTabContentInsets.bottom;
                if (newContentHeight < 0) {
                    newContentHeight = 0;
                };
                this._newTab._contentDivElement.style.height = newContentHeight + "px";
            }
            
            ++this._animationStepIndex;
        
            // Continue Rotation.
            Core.Web.Scheduler.add(this._animationRunnable);
        } else {
            // Complete Rotation.
            var parent = this._parent;
            this._dispose();
            parent._redrawTabs();
        }
    },

    _cancel: function() {
        Core.Web.Scheduler.remove(this._animationRunnable);
        this._dispose();
    },
    
    _dispose: function() {
        Core.Web.Scheduler.remove
        var renderId = this._parent.component.renderId;
        this._parent._rotation = null;
        this._parent = null;
        this._oldTab = null;
        this._newTab = null;
        this._rotatingTabs = null;
    }
});
