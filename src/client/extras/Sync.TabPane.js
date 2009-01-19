/**
 * Component rendering peer: TabPane
 */
Extras.Sync.TabPane = Core.extend(Echo.Render.ComponentSync, {

    $static: {
        _supportedPartialProperties: ["activeTab", "activeTabIndex"],
        _paneInsets: 0,
        _defaultBorderType: Extras.TabPane.BORDER_TYPE_ADJACENT_TO_TABS,
        _defaultForeground: "#000000",
        _defaultInsets: 2,
        _defaultTabActiveBorder: "1px solid #00004f",
        _defaultTabActiveHeightIncrease: 2,
        _defaultTabAlignment: "top",
        _defaultTabCloseIconTextMargin: 5,
        _defaultTabContentInsets: 0,
        _defaultTabIconTextMargin: 5,
        _defaultTabInactiveBorder: "1px solid #7f7f7f",
        _defaultTabInset: 10,
        _defaultTabInsets: "3px 8px",
        _defaultTabPosition: Extras.TabPane.TAB_POSITION_TOP,
        _defaultTabSpacing: 0,
        
        /**
         * Runnable to manage scrolling animation.
         */
        ScrollRunnable: Core.extend(Core.Web.Scheduler.Runnable, {
        
            repeat: true,
            timeInterval: 20,

            reverse: false,
            distance: 0,
            
            /** Minimum distance to move (in case of click rather than hold */
            clickDistance: 50,
            
            /** Rate to scroll when scroll button held. */
            pixelsPerSecond: 400,
            
            /** Initial scroll position. */
            initialPosition: null,
            
            disposed: false,
            peer: null,
            lastInvokeTime: null,
        
            $construct: function(peer, reverse) {
                this.peer = peer;
                this.reverse = reverse;
                this.initialPosition = peer.scrollPosition;
                this.lastInvokeTime = new Date().getTime();
            },
            
            dispose: function() {
                if (!this.disposed) {
                    Core.Web.Scheduler.remove(this);
                }
                this.disposed = true;
            },
            
            finish: function() {
                if (this.distance < this.clickDistance) {
                    this.distance = this.clickDistance;
                    this.updatePosition();
                }
                this.dispose();
            },
            
            run: function() {
                var time = new Date().getTime();
                this.distance += Math.ceil(this.pixelsPerSecond * (time - this.lastInvokeTime) / 1000);
                this.lastInvokeTime = time;
                this.updatePosition();
            },
            
            updatePosition: function() {
                var position = this.initialPosition + ((this.reverse ? -1 : 1) * this.distance);
                if (!this.peer.setScrollPosition(position)) {
                    this.dispose();
                }
            }
        })
    },
    
    $load: function() {
        Echo.Render.registerPeer("Extras.TabPane", this);
    },
    
    _icons: null,

    /**
     * Primary DIV element.
     * @type Element
     */
    _div: null,

    /**
     * DIV element which contains content.  All child components are rendered within this DIV,
     * only one is allowed to be visibly displayed at a given time.
     * @type Element
     */    
    _contentContainerDiv: null,
    
    /**
     * Element containing tab headers.
     * @type Element
     */
    _headerContainer: null,
    
    /**
     * The renderId of the active tab.
     * @type String
     */
    _activeTabId: null,
    
    /**
     * Scroll previous arrow.
     */
    _previousControlDiv: null,
    
    /**
     * Scroll next arrow.
     */
    _nextControlDiv: null,
    
    /**
     * Array containing <code>Extras.Sync.TabPane.Tab</code> objects represented the displayed tabs.
     * Each index of this array matches the corresponding child component index.
     * @type Array 
     */
    _tabs: null,
    
    /**
     * Combined width of all tabs.
     */
    _totalTabWidth: 0,
    
    /**
     * Flag indicating whether the header size may need to be reconfigured (by invoking configureHeaderSize() in the next
     * renderDisplay() execution.
     */
    _configureHeaderSizeRequired: false,
    
    _scrollRunnable: null,
    
    scrollPosition: 0,
    
    $construct: function() {
        this._tabs = [];
    },
    
    /**
     * Adds a tab and renders it.
     *
     * @param {Echo.Update.ComponentUpdate} update the component update 
     * @param {Extras.Sync.TabPane.Tab} tab the tab to be added 
     * @param index the index at which the tab should be added
     */
    _addTab: function(update, tab, index) {
        if (index == null || index == this._tabs.length) {
            this._tabs.push(tab);
            tab._render(update);
            this._headerTabContainerTr.appendChild(tab._headerTd);
            this._contentContainerDiv.appendChild(tab._contentDiv);
        } else {
            this._tabs.splice(index, 0, tab);
            tab._render(update);
            this._headerTabContainerTr.insertBefore(tab._headerTd, 
                    this._headerTabContainerTr.childNodes[index]);
            this._contentContainerDiv.insertBefore(tab._contentDiv,
                    this._contentContainerDiv.childNodes[index]);
        }
    },

    _configureHeaderSize: function() {
        var height = new Core.Web.Measure.Bounds(this._headerTabContainerDiv).height;
        if (height === 0) {
            // Cannot calculate header size.
            return;
        }
        
        this._configureHeaderSizeRequired = false;
        var borderSize = Echo.Sync.Border.getPixelSize(this._tabActiveBorder);
        
        if (this._tabPosition == Extras.TabPane.TAB_POSITION_BOTTOM) {
            this._contentContainerDiv.style.top = "0";
            this._contentContainerDiv.style.bottom = (height - borderSize) + "px";
        } else {
            this._contentContainerDiv.style.top = (height - borderSize ) + "px";
            this._contentContainerDiv.style.bottom = "0";
        }
        this._contentContainerDiv.style.left = "0";
        this._contentContainerDiv.style.right = "0";

        Core.Web.VirtualPosition.redraw(this._contentContainerDiv);
        Core.Web.VirtualPosition.redraw(this._headerContainerDiv);
        for (i = 0; i < this._tabs.length; ++i) {
            this._tabs[i]._renderDisplay();
        }
    },
    
    /**
     * Determines the renderId of the active tab child component.
     * This method first queries the component's <code>activeTab</code> property, 
     * and if it is not set, the id is determined by finding the child component at the 
     * index specified by the component's <code>activeTabIndex</code> property.
     *
     * @return the active tab renderId
     * @type String
     */
    _getActiveTabId: function() {
        var activeTabId = this.component.get("activeTab");
        if (!activeTabId) {
            var activeTabIndex = this.component.get("activeTabIndex");
            if (activeTabIndex != null && activeTabIndex < this.component.children.length) {
                activeTabId = this.component.children[activeTabIndex].renderId;
            }
        }
        return activeTabId;
    },

    /**
     * Retrieves the tab instance with the specified tab id.
     * 
     * @param tabId the tab render id
     * @return the tab, or null if no tab is present with the specified id
     * @type Extras.Sync.TabPane.Tab
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
    
    /**
     * Handler for mouse down event on previous/next scroll buttons.
     */
    _processScrollStart: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return;
        }
        
        this._scrollRunnable = new Extras.Sync.TabPane.ScrollRunnable(this, e.registeredTarget === this._previousControlDiv);
        Core.Web.Scheduler.add(this._scrollRunnable);
    },
    
    /**
     * Handler for mouse up event on previous/next scroll buttons.
     */
    _processScrollStop: function(e) {
        if (!this._scrollRunnable) {
            return;
        }
        this._scrollRunnable.finish();
        this._scrollRunnable = null;
    },
    
    /**
     * Removes a specific tab.
     *
     * @param {Extras.Sync.TabPane.Tab} tab the tab to remove
     */
    _removeTab: function(tab) {
        var tabIndex = Core.Arrays.indexOf(this._tabs, tab);
        if (tabIndex == -1) {
            return;
        }
        if (tab._childComponent.renderId == this._activeTabId) {
            this._activeTabId = null;
        }
        this._tabs.splice(tabIndex, 1);
        
        Core.Web.DOM.removeNode(tab._headerTd);
        Core.Web.DOM.removeNode(tab._contentDiv);
        
        tab._dispose();
    },
    
    renderAdd: function(update, parentElement) {
        this._icons = { };
        
        // Configure Properties
        this._activeTabId = this._getActiveTabId();
        this._borderType = this.component.render("borderType", Extras.Sync.TabPane._defaultBorderType);
        this._insets = this.component.render("insets", Extras.Sync.TabPane._defaultInsets);
        this._tabActiveBorder = this.component.render("tabActiveBorder", Extras.Sync.TabPane._defaultTabActiveBorder);
        this._tabActiveHeightIncreasePx = Echo.Sync.Extent.toPixels(this.component.render("tabActiveHeightIncrease", 
                Extras.Sync.TabPane._defaultTabActiveHeightIncrease));
        this._tabInactiveBorder = this.component.render("tabInactiveBorder", Extras.Sync.TabPane._defaultTabInactiveBorder);
        this._tabInsetPx = Echo.Sync.Extent.toPixels(this.component.render("tabInset",Extras.Sync.TabPane._defaultTabInset));
        this._tabPosition = this.component.render("tabPosition", Extras.Sync.TabPane._defaultTabPosition);
        this._tabSpacing = this.component.render("tabSpacing", Extras.Sync.TabPane._defaultTabSpacing);
        this._tabCloseEnabled = this.component.render("tabCloseEnabled", false);
        if (this._tabCloseEnabled) {
            this._icons.defaultIcon = this.component.render("tabCloseIcon");
            this._icons.disabledIcon = this.component.render("tabDisabledCloseIcon");
            this._icons.rolloverIcon = this.component.render("tabRolloverCloseIcon");
        }

        // Render Border Insets
        var pixelInsets = Echo.Sync.Insets.toPixels(this._insets);
        if (this._borderType == Extras.TabPane.BORDER_TYPE_SURROUND) {
            // Do nothing, pixelInsets values are correct.
        } else if (this._borderType == Extras.TabPane.BORDER_TYPE_PARALLEL_TO_TABS) {
            pixelInsets.left = pixelInsets.right = 0;
        } else if (this._tabPosition == Extras.TabPane.TAB_POSITION_BOTTOM) {
            pixelInsets.left = pixelInsets.right = pixelInsets.top = 0;
        } else {
            pixelInsets.left = pixelInsets.right = pixelInsets.bottom = 0;
        }

        // Create Main Element
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        this._div.style.cssText = "position:absolute;overflow:hidden;top:" + pixelInsets.top + "px;right:" + pixelInsets.right +
                "px;bottom:" + pixelInsets.bottom + "px;left:" + pixelInsets.left + "px;";
                        
        // Render Header Container
        this._headerContainerDiv = document.createElement("div");
        this._headerContainerDiv.style.cssText = "position:absolute;overflow:hidden;z-index:1;" +
                (this._tabPosition == Extras.TabPane.TAB_POSITION_BOTTOM ? "bottom" : "top") + ":0;" +
                "left:" + this._tabInsetPx + "px;right:" + this._tabInsetPx + "px;";
                
        this._headerTabContainerDiv = document.createElement("div");
        
        this._headerTabContainerTable = document.createElement("table");
        this._headerTabContainerTable.style.padding = 0;
        this._headerTabContainerTable.cellPadding = 0;
        this._headerTabContainerTable.cellSpacing = 0;
        var tbody = document.createElement("tbody");
        this._headerTabContainerTr = document.createElement("tr");
        tbody.appendChild(this._headerTabContainerTr);
        this._headerTabContainerTable.appendChild(tbody);
        this._headerTabContainerDiv.appendChild(this._headerTabContainerTable);
        this._headerContainerDiv.appendChild(this._headerTabContainerDiv);
        
        Echo.Sync.Font.render(this.component.render("font"), this._headerContainerDiv);
        Echo.Sync.FillImage.render(this.component.render("tabBackgroundImage"), this._headerContainerDiv);
    
        this._div.appendChild(this._headerContainerDiv);
        
        // Render Content Container
        this._contentContainerDiv = document.createElement("div");
        this._contentContainerDiv.style.position = "absolute";
        this._contentContainerDiv.style.overflow = "hidden";
        Echo.Sync.renderComponentDefaults(this.component, this._contentContainerDiv);
        
        // Render Tabs
        var activeTabFound = false;
        var componentCount = this.component.getComponentCount();
        for (var i = 0; i < componentCount; ++i) {
            var child = this.component.getComponent(i);
            if (this._activeTabId == child.renderId) {
                activeTabFound = true;
            }
            var tab = new Extras.Sync.TabPane.Tab(child, this);
            this._addTab(update, tab);
        }
        
        if (!activeTabFound) {
            this._activeTabId = null;
            if (componentCount > 0) {
                this._selectTab(this.component.getComponent(0).renderId);
                this._setActiveTabId(this._activeTabId);
            }
        }

        this._configureHeaderSizeRequired = true;
        
        if (this._borderType == Extras.TabPane.BORDER_TYPE_NONE) {
            this._contentContainerDiv.style.border = "0 none";
        } else if (this._borderType == Extras.TabPane.BORDER_TYPE_SURROUND) {
            Echo.Sync.Border.render(this._tabActiveBorder, this._contentContainerDiv);
        } else if (this._borderType == Extras.TabPane.BORDER_TYPE_PARALLEL_TO_TABS) {
            Echo.Sync.Border.render(this._tabActiveBorder, this._contentContainerDiv, "borderTop");
            Echo.Sync.Border.render(this._tabActiveBorder, this._contentContainerDiv, "borderBottom");
        } else if (this._tabPosition == Extras.TabPane.TAB_POSITION_BOTTOM) {
            Echo.Sync.Border.render(this._tabActiveBorder, this._contentContainerDiv, "borderBottom");
        } else {
            Echo.Sync.Border.render(this._tabActiveBorder, this._contentContainerDiv, "borderTop");
        }
        
        this._div.appendChild(this._contentContainerDiv);
        
        parentElement.appendChild(this._div);
    },
    
    renderDisplay: function() {
        var img, oversize, i;

        this._tabContainerWidth = new Core.Web.Measure.Bounds(this._headerContainerDiv).width;
        this._totalTabWidth = new Core.Web.Measure.Bounds(this._headerTabContainerDiv.firstChild).width;

        Core.Web.VirtualPosition.redraw(this._div);
        Core.Web.VirtualPosition.redraw(this._contentContainerDiv);
        Core.Web.VirtualPosition.redraw(this._headerContainerDiv);
        
        // Re-bound scroll position.
        this.setScrollPosition(this.scrollPosition);

        if (this._configureHeaderSizeRequired) {
            this._configureHeaderSize();
            
            var imageListener = Core.method(this, function() {
                if (this.component) { // Verify component still registered.
                    this._configureHeaderSize();
                }
            });
            Core.Web.Image.monitor(this._headerContainerDiv, imageListener);
        } else {
            // Only invoke renderDisplay on tabs if configureHeaderSize() invocation is not required,
            // as configureHeaderSize() will do this work as well.
            for (i = 0; i < this._tabs.length; ++i) {
                this._tabs[i]._renderDisplay();
            }
        }
    },
    
    renderDispose: function(update) {
        this._activeTabId = null;
        for (var i = 0; i < this._tabs.length; i++) {
            this._tabs[i]._dispose();
        }
        this._tabs = [];
        this._div = null;
        this._headerContainerDiv = null;
        this._headerTabContainerDiv = null;
        this._headerTabContainerTable = null;
        this._headerTabContainerTr = null;
        this._contentContainerDiv = null;
        if (this._previousControlDiv) {
            Core.Web.Event.removeAll(this._previousControlDiv);
            this._previousControlDiv = null;
        }
        if (this._nextControlDiv) {
            Core.Web.Event.removeAll(this._nextControlDiv);
            this._nextControlDiv = null;
        }
    },
    
    renderUpdate: function(update) {
        var fullRender = false,
            tab,
            i;
        
        if (update.hasUpdatedLayoutDataChildren()) {
            // Layout data children updated: must full render.
            fullRender = true;
        }
        if (!fullRender) {
            if (!Core.Arrays.containsAll(Extras.Sync.TabPane._supportedPartialProperties, 
                    update.getUpdatedPropertyNames(), true)) {
                // Update contains property changes that cannot be partially re-rendered.
                fullRender = true;
            }
        }
        if (!fullRender) {
            var activeTabRemoved = false;
            var removedChildren = update.getRemovedChildren();
            if (removedChildren) {
                // Remove children.
                for (i = 0; i < removedChildren.length; ++i) {
                    tab = this._getTabById(removedChildren[i].renderId);
                    if (!tab) {
                        continue;
                    }
                    if (tab._childComponent.renderId == this._activeTabId) {
                        activeTabRemoved = true;
                    }
                    this._removeTab(tab);
                }
            }
            var addedChildren = update.getAddedChildren();
            if (addedChildren) {
                // Add children.
                for (i = 0; i < addedChildren.length; ++i) {
                    tab = new Extras.Sync.TabPane.Tab(addedChildren[i], this);
                    this._addTab(update, tab, this.component.indexOf(addedChildren[i]));
                }
            }
            if (update.hasUpdatedProperties()) {
                // partial update
                var activeTabUpdate = update.getUpdatedProperty("activeTab");
                if (activeTabUpdate) {
                    activeTabRemoved = false;
                    this._selectTab(activeTabUpdate.newValue);
                } else {
                    var activeTabIndexUpdate = update.getUpdatedProperty("activeTabIndex");
                    if (activeTabIndexUpdate && activeTabIndexUpdate.newValue < this.component.children.length) {
                        activeTabRemoved = false;
                        this._selectTab(this.component.children[activeTabIndexUpdate.newValue].renderId);
                    }
                }
            }
            if ((activeTabRemoved || this._activeTabId == null) && this.component.children.length > 0) {
                this._selectTab(this.component.children[0].renderId);
            }
            this._configureHeaderSizeRequired = true;
        }
    
        if (fullRender) {
            var div = this._div;
            var containerElement = div.parentNode;
            Echo.Render.renderComponentDispose(update, update.parent);
            containerElement.removeChild(div);
            this.renderAdd(update, containerElement);
        }
        return fullRender;
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
        var tab;
        if (this._activeTabId) {
            tab = this._getTabById(this._activeTabId);
            if (tab) {
                tab._renderActiveState(false);
            }
        }
        
        tab = this._getTabById(tabId);
        if (tab) {
            this._activeTabId = tabId;
            tab._renderActiveState(true);
        } else {
            this._activeTabId = null;
        }
    },
    
    _setActiveTabId: function(activeTabId) {
        this.component.set("activeTab", activeTabId);
        var indexSet = false;
        for (var i = 0; i < this.component.children.length; ++i) {
            if (this.component.children[i].renderId == activeTabId) {
                this.component.set("activeTabIndex", i);
                indexSet = true;
                break;
            }
        }
        if (!indexSet) {
            this.component.set("activeTabIndex", null);
        }
    },

    _setOversizeEnabled: function(previous, enabled) {
        var controlDiv = previous ? this._previousControlDiv : this._nextControlDiv,
            img;

        if (enabled) {
            if (controlDiv) {
                controlDiv.style.display = "block";
            } else {
                controlDiv = document.createElement("div");
                controlDiv.style.cssText = "position:absolute;z-index:2;cursor:pointer;";
                controlDiv.style[this._tabPosition === Extras.TabPane.TAB_POSITION_BOTTOM ? "bottom" : "top"] = "5px";
                controlDiv.style[previous ? "left" : "right"] = "2px";
                
                img = document.createElement("img");
                controlDiv.appendChild(img);

                Core.Web.Event.add(controlDiv, "mousedown", Core.method(this, this._processScrollStart));
                Core.Web.Event.add(controlDiv, "mouseup", Core.method(this, this._processScrollStop));
                Core.Web.Event.Selection.disable(controlDiv);

                if (previous) {
                    img.src = this._icons.previous ? this._icons.previous :
                            this.client.getResourceUrl("Extras", "image/tabpane/Previous.gif");
                    img.alt = "<";
                    this._previousControlDiv = controlDiv;
                } else {
                    img.src = this._icons.next ? this._icons.next :
                            this.client.getResourceUrl("Extras", "image/tabpane/Next.gif");
                    img.alt = ">";
                    this._nextControlDiv = controlDiv;
                }
                this._div.appendChild(controlDiv);
            }
        } else if (controlDiv) {
            controlDiv.style.display = "none";
        }     
    },
    
    setScrollPosition: function(position) {
        var bounded = false,
            oversize = this._totalTabWidth > this._tabContainerWidth;
            
        if (position < 0) {
            position = 0;
            bounded = true;
        } else if (position > 0 && position > this._totalTabWidth - this._tabContainerWidth) {
            position = this._totalTabWidth - this._tabContainerWidth;
            bounded = true;
        }
        this.scrollPosition = position;
        this._headerTabContainerDiv.style.marginLeft = (0 - position) + "px";
        
        if (oversize) {
            this._setOversizeEnabled(true, position > 0);
            this._setOversizeEnabled(false, position < this._totalTabWidth - this._tabContainerWidth);
        } else {
            this._setOversizeEnabled(true, false);
            this._setOversizeEnabled(false, false);
        }
        
        return !bounded;
    }
});

/**
 * Representation of a single tab (child component) within the tab pane.
 * Provides tab-specific rendering functionality, handles setting active state
 * on/off for an individual tab.
 */
Extras.Sync.TabPane.Tab = Core.extend({

    $construct: function(childComponent, parent) {
        // state
        this._childComponent = childComponent;
        this._parent = parent;
        this._rendered = false;
        if (parent._tabCloseEnabled) {
            var layoutData = this._childComponent.render("layoutData");
            this._tabCloseEnabled = layoutData ? layoutData.closeEnabled : false;
        } else {
            this._tabCloseEnabled = false;
        }
        // elements
        this._headerTd = null;
        this._headerContentTable = null;
        this._contentDiv = null;
        this._leftTd = null;
        this._centerTd = null;
        this._rightTd = null;
        this._closeImageTd = null;
    },
    
    _addEventListeners: function() {
        Core.Web.Event.add(this._headerTd, "click", Core.method(this, this._processClick), false);
        Core.Web.Event.Selection.disable(this._headerTd);
        
        if (this._tabCloseEnabled) {
            Core.Web.Event.add(this._headerTd, "mouseover", Core.method(this, this._processEnter), false);
            Core.Web.Event.add(this._headerTd, "mouseout", Core.method(this, this._processExit), false);
        }
    },
    
    _dispose: function() {
        Core.Web.Event.removeAll(this._headerTd);
        
        this._parent = null;
        this._childComponent = null;
        this._headerTd = null;
        this._headerContentTable = null;
        this._contentDiv = null;
        this._leftTd = null;
        this._centerTd = null;
        this._rightTd = null;
        this._closeImageTd = null;
    },
    
    _getCloseImage: function(rollover) {
        var icons = this._parent._icons;
        var icon;
        if (this._tabCloseEnabled) {
            if (rollover && this._parent.component.render("tabCloseIconRolloverEnabled")) {
                icon = icons.rolloverIcon;
            }
        } else {
            icon = icons.disabledIcon;
        }
        return icon ? icon : icons.defaultIcon || this._parent.client.getResourceUrl("Extras", "image/tabpane/Close.gif");
    },
    
    _getContentInsets: function() {
        if (this._childComponent.pane) {
            return Extras.Sync.TabPane._paneInsets;
        } else {
            return this._parent.component.render("defaultContentInsets", 
                    Extras.Sync.TabPane._defaultTabContentInsets);
        }
    },
    
    _getLeftImage: function(state) {
        var propertyName = state ? "tabActiveLeftImage" : "tabInactiveLeftImage";
        var image = this._parent.component.render(propertyName);
        if (!image) {
            return;
        }
        var fillImage = { url: (image.url ? image.url : image), repeat: "no-repeat", x: 0, y: 0 };
        return { width: (image.width ? image.width : null), fillImage: fillImage };
    },
    
    _getRightImage: function(state) {
        var propertyName = state ? "tabActiveRightImage" : "tabInactiveRightImage";
        var image = this._parent.component.render(propertyName);
        if (!image) {
            return;
        }
        var fillImage = { url: (image.url ? image.url : image), repeat: "no-repeat", x: "100%", y: 0 };
        return { width: (image.width ? image.width : null), fillImage: fillImage };
    },
    
    /**
     * Renders the tab active or inactive, updating header state and showing/hiding tab content.
     */
    _renderActiveState: function(state) {
        var headerContentTable = this._headerContentTable;
        var centerTd = this._centerTd;
        var contentDiv = this._contentDiv;
        
        var foreground;
        var background;
        var border;
        if (state) {
            foreground = this._parent.component.render("tabActiveForeground");
            background = this._parent.component.render("tabActiveBackground");
            border = this._parent._tabActiveBorder;
        } else {
            foreground = this._parent.component.render("tabInactiveForeground");
            background = this._parent.component.render("tabInactiveBackground");
            border = this._parent._tabInactiveBorder;
        }
        Echo.Sync.Color.renderClear(foreground, headerContentTable, "color");
        Echo.Sync.Color.renderClear(background, headerContentTable, "backgroundColor");
        headerContentTable.style.cursor = state ? "default" : "pointer";
        
        var backgroundImage;
        if (state) {
            backgroundImage = this._parent.component.render("tabActiveBackgroundImage");
        } else {
            backgroundImage = this._parent.component.render("tabInactiveBackgroundImage");
        }
        Echo.Sync.FillImage.renderClear(backgroundImage, centerTd, null);
        
        var activeBorderSize = Echo.Sync.Border.getPixelSize(this._parent._tabActiveBorder);
        var inactiveBorderSize = Echo.Sync.Border.getPixelSize(this._parent._tabInactiveBorder);
        
        if (this._parent._tabPosition == Extras.TabPane.TAB_POSITION_BOTTOM) {
            headerContentTable.style.marginTop = state ? 0 : activeBorderSize + "px";
            headerContentTable.style.marginBottom = state ? 0 : this._parent._tabActiveHeightIncreasePx + "px";
            centerTd.style.paddingTop = state ? (inactiveBorderSize + this._parent._tabActiveHeightIncreasePx )+ "px" : 0;
            Echo.Sync.Border.render(border, headerContentTable, "borderBottom");
        } else {
            headerContentTable.style.marginBottom = state ? 0 : activeBorderSize + "px";
            headerContentTable.style.marginTop = state ? 0 : this._parent._tabActiveHeightIncreasePx + "px";
            centerTd.style.paddingBottom = state ? (inactiveBorderSize + this._parent._tabActiveHeightIncreasePx )+ "px" : 0;
            Echo.Sync.Border.render(border, headerContentTable, "borderTop");
        }
        
        
        Echo.Sync.Border.render(border, headerContentTable, "borderLeft");
        Echo.Sync.Border.render(border, headerContentTable, "borderRight");
        
        var font;
        if (state) {
            font = this._parent.component.render("tabActiveFont");
        } else {
            font = this._parent.component.render("tabInactiveFont");
        }
        Echo.Sync.Font.renderClear(font, headerContentTable);
    
        if (this._leftTd) {
            var leftImage = this._getLeftImage(state); 
            Echo.Sync.FillImage.renderClear(leftImage ? leftImage.fillImage : null, this._leftTd, null);
            if (leftImage && leftImage.width) {
                this._leftTd.style.width = leftImage.width.toString();
            }
        }
        
        if (this._rightTd) {
            var rightImage = this._getRightImage(state); 
            Echo.Sync.FillImage.renderClear(rightImage ? rightImage.fillImage : null, this._rightTd, null);
            if (rightImage && rightImage.width) {
                this._rightTd.style.width = rightImage.width.toString();
            }
        }
        
        // show/hide content
        if (Core.Web.Env.BROWSER_MOZILLA && !Core.Web.Env.BROWSER_FIREFOX) {
            contentDiv.style.right = state ? "0" : "100%";
            contentDiv.style.bottom = state ? "0" : "100%";
        } else {
            contentDiv.style.display = state ? "block" : "none";
        }
        if (state) {
            // FIXME hack to notify the tab content component that it's size may have changed, this is
            // required because any previous notifications could have taken place when this tab was hidden.
            Echo.Render.renderComponentDisplay(this._childComponent);
        }
    },
    
    /**
     * Tab click handler.
     */
    _processClick: function(e) {
        if (!this._parent || !this._parent.client || !this._parent.client.verifyInput(this._parent.component)) {
            return true;
        }
        if (this._closeImageTd && Core.Web.DOM.isAncestorOf(this._closeImageTd, e.target)) {
            // close icon clicked
            if (!this._tabCloseEnabled) {
                return;
            }
            this._parent.component.doTabClose(this._childComponent);
        } else {
            // tab clicked
            this._parent._selectTab(this._childComponent.renderId);
            this._parent._setActiveTabId(this._childComponent.renderId);
            this._parent.component.doTabSelect(this._childComponent);
        }
    },
    
    /**
     * Tab rollover enter handler.
     */
    _processEnter: function(e) {
        if (!this._parent || !this._parent.client || !this._parent.client.verifyInput(this._parent.component)) {
            return true;
        }
        
        var rollover = Core.Web.DOM.isAncestorOf(this._closeImageTd, e.target);
        this._closeImageTd.firstChild.src = Echo.Sync.ImageReference.getUrl(this._getCloseImage(rollover));
    },
    
    /**
     * Tab rollover exit handler.
     */
    _processExit: function(e) {
        var rollover = Core.Web.DOM.isAncestorOf(this._closeImageTd, e.target);
        this._closeImageTd.firstChild.src = Echo.Sync.ImageReference.getUrl(this._getCloseImage(false));
    },
    
    /**
     * Renders the tab.
     */
    _render: function(update) {
        this._headerTd = this._renderHeader();
        this._headerContentTable = this._headerTd.firstChild;
        this._contentDiv = this._renderContent(update);
        
        this._renderActiveState(this._childComponent.renderId == this._parent._activeTabId);
        this._addEventListeners();
    },
    
    /**
     * Renders the close icon.
     */
    _renderCloseIcon: function() {
        var td = document.createElement("td");
        Echo.Sync.Alignment.render(this._parent.component.render("tabAlignment", 
                Extras.Sync.TabPane._defaultTabAlignment), td, true, this._parent.component);
        td.style.padding = "0 0 0 " + this._parent.component.render("tabCloseIconTextMargin", 
                Extras.Sync.TabPane._defaultTabCloseIconTextMargin + "px");
        td.style.cursor = "pointer";
        var img = document.createElement("img");
        img.src = Echo.Sync.ImageReference.getUrl(this._getCloseImage(false));
        
        if (Core.Web.Env.BROWSER_INTERNET_EXPLORER) {
            // remove auto-calculated width & height, to prevent problems with different image sizes
            img.removeAttribute("width");
            img.removeAttribute("height");
        }
        td.appendChild(img);
        return td;
    },
    
    /**
     * Renders the content of a tab.
     */
    _renderContent: function(update) {
        var div = document.createElement("div");
        div.style.cssText = "position:absolute;top:0;left:0;overflow:auto;";

        // hide content
        if (Core.Web.Env.BROWSER_MOZILLA && !Core.Web.Env.BROWSER_FIREFOX) {
            //FIXME doc or remove (and why no display=none?)
            div.style.right = "100%";
            div.style.bottom = "100%";
        } else {
            div.style.display = "none";
            div.style.right = "0";
            div.style.bottom = "0";
        }
        Echo.Sync.Insets.render(this._getContentInsets(), div, "padding");
        
        Echo.Render.renderComponentAdd(update, this._childComponent, div);
        
        return div;
    },
    
    /**
     * Tab-specific renderDisplay() tasks.
     */
    _renderDisplay: function() {
        Core.Web.VirtualPosition.redraw(this._contentDiv);
    },

    /**
     * Renders the "header" of a tab, i.e., the tab label at the top/bottom of the TabPane.
     */
    _renderHeader: function() {
        var layoutData = this._childComponent.render("layoutData");
        
        var headerTd = document.createElement("td");
        headerTd.style.padding = 0;
        headerTd.style.border = "0px none";
        
        headerTd.vAlign = this._parent._tabPosition == Extras.TabPane.TAB_POSITION_BOTTOM ? "top" : "bottom";
        
        var tabTable = document.createElement("table");
        tabTable.cellPadding = "0";
        tabTable.cellSpacing = "0";
        tabTable.style.padding = "0";
        tabTable.style.marginRight = this._parent._tabSpacing.toString();
        var width = this._parent.component.render("tabWidth");
        if (width) {
            tabTable.style.width = width.toString();
        }
        
        var tabTbody = document.createElement("tbody");
        var tabTr = document.createElement("tr");
        
        // Render TD element to contain left border image (if required).
        if (this._getLeftImage(true) != null || this._getLeftImage(false) != null) {
            this._leftTd = document.createElement("td");
            this._leftTd.appendChild(document.createTextNode("\u00a0"));
            tabTr.appendChild(this._leftTd);
        }
        
        // Render TD element to contain tab content.
        var centerTd = document.createElement("td");
        Echo.Sync.Insets.render(Extras.Sync.TabPane._defaultTabInsets, centerTd, "padding");
        
        var labelDiv = document.createElement("div");
        centerTd.appendChild(labelDiv);
        
        var icon = layoutData ? layoutData.icon : null;
        var title = layoutData ? (layoutData.title ? layoutData.title : "*") : "*";
        var closeIcon = this._parent._tabCloseEnabled && (this._tabCloseEnabled || this._parent._icons.disabledIcon);
        if (icon || closeIcon) {
            // Render Text and Icon(s)
            var table = document.createElement("table");
            table.style.padding = "0";
            table.cellPadding = "0";
            table.cellSpacing = "0";
            var tbody = document.createElement("tbody");
            var tr = document.createElement("tr");
            if (icon) {
                tr.appendChild(this._renderIcon(icon));
            }
            var textTd = document.createElement("td");
            textTd.style.whiteSpace = "nowrap";
            Echo.Sync.Alignment.render(this._parent.component.render("tabAlignment", 
                    Extras.Sync.TabPane._defaultTabAlignment), textTd, true, this._parent.component);
            textTd.appendChild(document.createTextNode(title));
            table.appendChild(tbody);
            tbody.appendChild(tr);
            tr.appendChild(textTd);
            if (closeIcon) {
                this._closeImageTd = this._renderCloseIcon();
                tr.appendChild(this._closeImageTd);
            }
            labelDiv.appendChild(table);
        } else {
            // Render Text Only
            labelDiv.style.whiteSpace = "nowrap";
            Echo.Sync.Alignment.render(this._parent.component.render("tabAlignment", 
                    Extras.Sync.TabPane._defaultTabAlignment), labelDiv, true, this._parent.component);
            labelDiv.appendChild(document.createTextNode(title));
        }
        if (this._parent.component.render("tabHeight")) {
            Echo.Sync.Extent.render(this._parent.component.render("tabHeight"), labelDiv, "height", false, false);
        }

        tabTr.appendChild(centerTd);
        this._centerTd = centerTd;
    
        // Render TD element to contain right border image (if required).
        if (this._getRightImage(true) != null || this._getRightImage(false) != null) {
            this._rightTd = document.createElement("td");
            this._rightTd.appendChild(document.createTextNode("\u00a0"));
            tabTr.appendChild(this._rightTd);
        }
    
        tabTbody.appendChild(tabTr);
        tabTable.appendChild(tabTbody);
        headerTd.appendChild(tabTable);

        return headerTd;
    },
    
    /**
     * Renders the icon of a tab.
     */
    _renderIcon: function(icon) {
        var td = document.createElement("td");
        Echo.Sync.Alignment.render(this._parent.component.render("tabAlignment", 
                Extras.Sync.TabPane._defaultTabAlignment), td, true, this._parent.component);
        var img = document.createElement("img");
        img.src = Echo.Sync.ImageReference.getUrl(icon);
        img.style.marginRight = this._parent.component.render("tabIconTextMargin", 
                Extras.Sync.TabPane._defaultTabIconTextMargin + "px");
        td.appendChild(img);
        return td;
    }
});
