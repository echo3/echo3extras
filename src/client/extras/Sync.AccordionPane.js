/**
 * Component rendering peer: AccordionPane
 */
Extras.Sync.AccordionPane = Core.extend(Echo.Render.ComponentSync, {

    $static: {
        _paneInsets: 0,
        _defaultTabBackground: "#cfcfcf",
        _defaultTabBorder: "1px outset #cfcfcf",
        _defaultTabForeground: "#000000",
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
    _resetOverflowForAnimation: false,
    
    $construct: function() {
        this._tabs = [];
        this._resetOverflowForAnimation = Core.Web.Env.BROWSER_MOZILLA || Core.Web.Env.BROWSER_INTERNET_EXPLORER;
    },
    
    renderAdd: function(update, parentElement) {
        this._animationTime = this.component.render("animationTime", Extras.AccordionPane.DEFAULT_ANIMATION_TIME);
        this._activeTabId = this.component.get("activeTab");
        
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        this._div.style.cssText = "position:absolute;width:100%;height:100%;";
        Echo.Sync.Color.renderFB(this.component, this._div);
        Echo.Sync.Font.render(this.component.render("font"), this._div);
        
        var componentCount = this.component.getComponentCount();
        for (var i = 0; i < componentCount; ++i) {
            var child = this.component.getComponent(i);
            var tab = new Extras.Sync.AccordionPane.Tab(child, this);
            this._tabs.push(tab);
            tab._render(this.client, update);
            this._div.appendChild(tab._tabDiv);
            this._div.appendChild(tab._containerDiv);
        }
        
        parentElement.appendChild(this._div);
    },
    
    renderDisplay: function() {
        if (!this._rotation) {
            this._redrawTabs(false);
        }
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
            this._redrawTabs(true);
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
    
        tab._tabDiv.parentNode.removeChild(tab._tabDiv);
        tab._containerDiv.parentNode.removeChild(tab._containerDiv);
        tab._dispose();
    },
    
    /**
     * Redraws tabs in the appropriate positions, exposing the content of the 
     * selected tab.
     */
    _redrawTabs: function(notifyComponentUpdate) {
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
        for (var i = 0; i < this._tabs.length; ++i) {
            if (selectionPassed) {
                this._tabs[i]._tabDiv.style.top = "";
                this._tabs[i]._tabDiv.style.bottom = this.getTabHeight(i + 1, this._tabs.length ) + "px";
            } else {
                this._tabs[i]._tabDiv.style.bottom = "";
                this._tabs[i]._tabDiv.style.top = this.getTabHeight(0, i) + "px";
            }
    
            this._tabs[i]._containerDiv.style.height = "";
            
            if (this._activeTabId == this._tabs[i]._childComponent.renderId) {
                selectionPassed = true;
                this._tabs[i]._containerDiv.style.display = "block";
                this._tabs[i]._containerDiv.style.top = this.getTabHeight(0, i + 1) + "px";
                this._tabs[i]._containerDiv.style.bottom = this.getTabHeight(i + 1, this._tabs.length) + "px";
                this._tabs[i]._contentDiv.style.top = 0;
                this._tabs[i]._contentDiv.style.bottom = 0;
                this._tabs[i]._contentDiv.style.height = "";
                Core.Web.VirtualPosition.redraw(this._tabs[i]._contentDiv);
            } else {
                this._tabs[i]._containerDiv.style.display = "none";
            }
        }
        
        if (notifyComponentUpdate) {
            Echo.Render.renderComponentDisplay(this.component);
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
            this._redrawTabs(true);
            return;
        }
        var oldTab = this._getTabById(oldTabId);
        if (oldTab == null) {
            // Old tab has been removed.
            this._redrawTabs(true);
            return;
        }
        if (this._rotation) {
            // Rotation was already in progress, cancel
            this._rotation._cancel();
            this._redrawTabs(true);
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
    
    /**
     * Determines the height of one or more tabs.
     *
     * If only beginIndex is specified, the height of the tab at index beginIndex will be returned.
     * Note that if endIndex is specified, the tab at index endIndex will NOT be included in the calculation,
     * that is, to measure the height of tabs 2, 3, and 4, it is necessary specify beginIndex as 2 and endIndex as 5 (not 4).
     *
     * @param beginIndex the begin index, inclusive
     * @param endIndex the end index, exclusive
     */
    getTabHeight: function(beginIndex, endIndex) {
        if (endIndex == null || endIndex < beginIndex) {
            throw new Error("Invalid indices: begin=" + beginIndex + ",end=" + endIndex);
        } else {
            var tabHeight = 0;
            for (var i = beginIndex; i < endIndex; ++i) {
                tabHeight += this._tabs[i]._tabDiv.offsetHeight;
            }
            return tabHeight;
        }
    },
    
    _getTabInsets: function() {
        var insets = this.component.render("tabInsets");
        return insets ? insets : Extras.Sync.AccordionPane._defaultTabInsets;
    }
});

Extras.Sync.AccordionPane.Tab = Core.extend({
    
    _rendered: false,
    _tabDiv: null,
    _parent: null,
    _containerDiv: null,
    _childComponent: null,
    
    $construct: function(childComponent, parent) {
        this._childComponent = childComponent;
        this._parent = parent;
    },
    
    _dispose: function() {
        Core.Web.Event.removeAll(this._tabDiv);
        this._parent = null;
        this._childComponent = null;
        this._tabDiv = null;
        this._containerDiv = null;
    },
    
    _highlight: function(state) {
        var tabDiv = this._tabDiv;
        if (state) {
            var background = this._parent.component.render("tabRolloverBackground");
            if (!background) {
                background = Echo.Sync.Color.adjust(this._parent._getTabBackground(), 20, 20, 20);
            }
            Echo.Sync.Color.render(background, tabDiv, "backgroundColor");
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
            var border = this._parent.component.render("tabRolloverBorder");
            if (!border) {
                var borderData = Echo.Sync.Border.parse(this._parent._getTabBorder());
                border = Echo.Sync.Border.compose(borderData.size, borderData.style,
                        Echo.Sync.Color.adjust(borderData.color, 20, 20, 20));
            }
            Echo.Sync.Border.render(border, tabDiv, "borderTop");
            Echo.Sync.Border.render(border, tabDiv, "borderBottom");
        } else {
            var border = this._parent._getTabBorder();
            Echo.Sync.Border.render(border, tabDiv, "borderTop");
            Echo.Sync.Border.render(border, tabDiv, "borderBottom");
            Echo.Sync.Color.render(this._parent._getTabBackground(), tabDiv, "backgroundColor");
            Echo.Sync.Color.render(this._parent.component.render("tabForeground", 
                    Extras.Sync.AccordionPane._defaultTabForeground), tabDiv, "color");
            tabDiv.style.backgroundImage = "";
            tabDiv.style.backgroundPosition = "";
            tabDiv.style.backgroundRepeat = "";
            Echo.Sync.FillImage.render(this._parent.component.render("tabBackgroundImage"), tabDiv);
        }
    },
    
    _addEventListeners: function() {
        Core.Web.Event.add(this._tabDiv, "click", Core.method(this, this._processClick), false);
        if (this._parent.component.render("tabRolloverEnabled", true)) {
            Core.Web.Event.add(this._tabDiv, "mouseover", Core.method(this, this._processEnter), false);
            Core.Web.Event.add(this._tabDiv, "mouseout", Core.method(this, this._processExit), false);
        }
        Core.Web.Event.Selection.disable(this._tabDiv);
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
        if (!this._parent.client.verifyInput(this._parent.component)) {
            return;
        }
        this._parent._selectTab(this._childComponent.renderId);
        // FIXME notify server
    },
    
    _processEnter: function(e) {
        if (!this._parent.client.verifyInput(this._parent.component)) {
            return;
        }
        this._highlight(true);
    },
    
    _processExit: function(e) {
        if (!this._parent.client.verifyInput(this._parent.component)) {
            return;
        }
        this._highlight(false);
    },
    
    _render: function(client, update) {
        this._tabDiv = document.createElement("div");
        this._tabDiv.id = this._parent.component.renderId + "_tab_" + this._childComponent.renderId;
        this._tabDiv.style.cssText = "cursor:pointer;position:absolute;left:0;right:0;overflow:hidden;";
        Echo.Sync.Insets.render(this._parent._getTabInsets(), this._tabDiv, "padding");
        this._tabDiv.appendChild(document.createTextNode(this._getTitle()));
    
        this._containerDiv = document.createElement("div");
        this._containerDiv.style.cssText = "display:none;position:absolute;left:0;right:0;overflow:hidden;";
        
        this._contentDiv = document.createElement("div");
        this._contentDiv.style.cssText = "position:absolute;left:0;right:0;overflow:auto;";
        Echo.Sync.Insets.render(this._getContentInsets(), this._contentDiv, "padding");
        
        Echo.Render.renderComponentAdd(update, this._childComponent, this._contentDiv);
        
        this._containerDiv.appendChild(this._contentDiv);
        
        this._highlight(false);
        this._addEventListeners();
    },
    
    _renderDisplay: function() {
        Core.Web.VirtualPosition.redraw(this._tabDiv);
        Core.Web.VirtualPosition.redraw(this._containerDiv);
        Core.Web.VirtualPosition.redraw(this._contentDiv);
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
        
        this._animationStartTime = new Date().getTime();
        this._animationEndTime = this._animationStartTime + this._parent._animationTime;
        
        this._oldTabIndex = Core.Arrays.indexOf(this._parent._tabs, this._oldTab);
        this._newTabIndex = Core.Arrays.indexOf(this._parent._tabs, this._newTab);
        this._directionDown = this._newTabIndex < this._oldTabIndex;
        
        this._rotatingTabCount = Math.abs(this._newTabIndex - this._oldTabIndex);
        
        this._regionHeight = this._newTab._tabDiv.parentNode.offsetHeight;
        
        if (this._directionDown) {
            // Numbers of tabs above that will not be moving.
            this._numberOfTabsAbove = this._newTabIndex + 1;
            
            // Number of tabs below that will not be moving.
            this._numberOfTabsBelow = this._parent._tabs.length - 1 - this._newTabIndex;
            
            // Initial top position of topmost moving tab.
            this._startTopPosition = this._parent.getTabHeight(0, this._newTabIndex + 1);
            
            // Final top position of topmost moving tab.
            this._endTopPosition = this._regionHeight - this._parent.getTabHeight(this._newTabIndex + 1, this._parent._tabs.length);
            
            // Number of pixels across which animation will occur.
            this._animationDistance = this._endTopPosition - this._startTopPosition;
        
        } else {
            // Numbers of tabs above that will not be moving.
            this._numberOfTabsAbove = this._newTabIndex;
        
            // Numbers of tabs below that will not be moving.
            this._numberOfTabsBelow = this._parent._tabs.length - 1 - this._newTabIndex;
    
            // Initial bottom position of bottommost moving tab.
            this._startBottomPosition = this._parent.getTabHeight(this._newTabIndex + 1, this._parent._tabs.length);
    
            // Final bottom position of bottommost moving tab.
            this._endBottomPosition = this._regionHeight - this._parent.getTabHeight(0, this._newTabIndex + 1);
            
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
            
            // On first frame, display new tab content.
            if (this._animationStepIndex == 0) {
                this._newTab._containerDiv.style.height = "";
                if (this._directionDown) {
                    this._oldTab._containerDiv.style.bottom = "";
                    this._newTab._containerDiv.style.top = this._parent.getTabHeight(0, this._newTabIndex + 1) + "px";
                } else {
                    this._newTab._containerDiv.style.top = "";
                    this._newTab._containerDiv.style.bottom 
                            = this._parent.getTabHeight(this._newTabIndex + 1, this._parent._tabs.length) + "px";
                }
                this._newTab._containerDiv.style.display = "block";
                
                // Set size of tab content to be equivalent to available space.
                var regionContentHeight = this._parent._div.offsetHeight - this._parent.getTabHeight(0, this._parent._tabs.length);
                var oldTabInsets = Echo.Sync.Insets.toPixels(this._oldTab._getContentInsets());
                var newTabInsets = Echo.Sync.Insets.toPixels(this._newTab._getContentInsets());
                var oldContentHeight = regionContentHeight - oldTabInsets.top - oldTabInsets.bottom;
                var newContentHeight = regionContentHeight - newTabInsets.top - newTabInsets.bottom;
                oldContentHeight = oldContentHeight > 0 ? oldContentHeight : 0;
                newContentHeight = newContentHeight > 0 ? newContentHeight : 0;
                
                if (this._parent._resetOverflowForAnimation) {
                    this._oldTab._contentDiv.style.overflow = "hidden";
                    this._newTab._contentDiv.style.overflow = "hidden";
                }
                
                this._oldTab._contentDiv.style.bottom = "";
                this._newTab._contentDiv.style.bottom = "";
                this._oldTab._contentDiv.style.height = oldContentHeight + "px";
                this._newTab._contentDiv.style.height = newContentHeight + "px";
            }
    
            if (this._directionDown) {
                // Move each moving tab to next step position.
                for (var i = this._oldTabIndex; i > this._newTabIndex; --i) {
                    this._parent._tabs[i]._tabDiv.style.top = (stepPosition + this._startTopPosition 
                            + this._parent.getTabHeight(this._newTabIndex + 1, i)) + "px";
                }
                
                // Adjust height of expanding new tab content to fill expanding space.
                var newContainerHeight = stepPosition;
                if (newContainerHeight < 0) {
                    newContainerHeight = 0;
                }
                this._newTab._containerDiv.style.height = newContainerHeight + "px";
                
                // Move top of old content downward.
                var oldTop = stepPosition + this._startTopPosition 
                        + this._parent.getTabHeight(this._newTabIndex + 1, this._oldTabIndex + 1);
                this._oldTab._containerDiv.style.top = oldTop + "px";
                
                // Reduce height of contracting old tab content to fit within contracting space.
                var oldContainerHeight = this._regionHeight - this._parent.getTabHeight(this._newTabIndex, this._oldTabIndex);
                if (oldContainerHeight < 0) {
                    oldContainerHeight = 0;
                }
                this._oldTab._containerDiv.style.height = oldContainerHeight + "px";
            } else {
                // Move each moving tab to next step position.
                for (var i = this._oldTabIndex + 1; i <= this._newTabIndex; ++i) {
                    this._parent._tabs[i]._tabDiv.style.bottom = (stepPosition + this._startBottomPosition 
                            + this._parent.getTabHeight(i + 1, this._newTabIndex + 1)) + "px";
                }
                
                // Reduce height of contracting old tab content to fit within contracting space.
                var oldContainerHeight = this._regionHeight - stepPosition 
                        - this._parent.getTabHeight(this._oldTabIndex, this._newTabIndex); 
                if (oldContainerHeight < 0) {
                    oldContainerHeight = 0;
                }
                this._oldTab._containerDiv.style.height = oldContainerHeight + "px";
                
                // Increase height of expanding tab content to fit within expanding space.
                var newContainerHeight = stepPosition;
                if (newContainerHeight < 0) {
                    newContainerHeight = 0;
                };
                this._newTab._containerDiv.style.height = newContainerHeight + "px";
            }

            ++this._animationStepIndex;
            
            // Continue Rotation.
            Core.Web.Scheduler.add(this._animationRunnable);
        } else {
            // Complete Rotation.
            var parent = this._parent;
            this._dispose();
            parent._redrawTabs(true);
        }
    },

    _cancel: function() {
        Core.Web.Scheduler.remove(this._animationRunnable);
        this._dispose();
    },
    
    _dispose: function() {
        if (this._parent._resetOverflowForAnimation) {
            this._oldTab._contentDiv.style.overflow = "auto";
            this._newTab._contentDiv.style.overflow = "auto";
        }
        var renderId = this._parent.component.renderId;
        this._parent._rotation = null;
        this._parent = null;
        this._oldTab = null;
        this._newTab = null;
    }
});
