/**
 * Component rendering peer: TabPane.
 * This class should not be extended by developers, the implementation is subject to change.
 */
Extras.Sync.TabPane = Core.extend(Echo.Render.ComponentSync, {

    $static: {
    
        /**
         * Prototype zero-padding table/tbody/tr hierarchy.
         * @type Element
         */
        _TABLE: null,
    
        /**
         * Generates a zero-pading table/tbody/tr hierarchy.
         * 
         * @return the root table element
         * @type Element
         */
        _createTable: function() {
            if (!this._TABLE) {
                this._TABLE = document.createElement("table");
                this._TABLE.style.cssText = "border-collapse:collapse;padding:0;";
                var tbody = document.createElement("tbody");
                this._TABLE.appendChild(tbody);
                var tr = document.createElement("tr");
                tbody.appendChild(tr);
            }
            return this._TABLE.cloneNode(true);
        },

        /**
         * Supported partial update properties. 
         * @type Array
         */
        _supportedPartialProperties: ["activeTabId", "activeTabIndex"],
        
        /**
         * Default component property settings, used when supported component object does not provide settings. 
         */
        _DEFAULTS: {
            borderType: Extras.TabPane.BORDER_TYPE_ADJACENT_TO_TABS,
            foreground: "#000000",
            insets: 2,
            tabActiveBorder: "1px solid #00004f",
            tabActiveHeightIncrease: 2,
            tabAlignment: "top",
            tabCloseIconTextMargin: 5,
            tabContentInsets: 0,
            tabIconTextMargin: 5,
            tabInactiveBorder: "1px solid #7f7f7f",
            tabInset: 10,
            tabInsets: "1px 8px",
            tabPosition: Extras.TabPane.TAB_POSITION_TOP,
            tabSpacing: 0
        },
        
        /**
         * Runnable to manage scrolling animation.
         */
        ScrollRunnable: Core.extend(Core.Web.Scheduler.Runnable, {
        
            /** @see Core.Web.Scheduler.Runnable#repeat */
            repeat: true,

            /** @see Core.Web.Scheduler.Runnable#timeInterval */
            timeInterval: 20,

            /**
             * Direction of scrolling travel.  True indicates tabs are scrolling in reverse (revealing tabs to the left),
             * true indicating scrolling forward (revealing tabs to the right).
             * @type Boolean
             */
            reverse: false,
            
            /**
             * Current distance scrolled, in pixels.
             * @type Number
             */
            distance: 0,
            
            /** 
             * Minimum distance to move (in case of click rather than hold
             * @type Number 
             */
            clickDistance: 50,
            
            /** 
             * Rate to scroll when scroll button held.
             * @type Number 
             */
            pixelsPerSecond: 400,
            
            /** 
             * Initial scroll position.
             * @type Number 
             */
            initialPosition: null,
            
            /**
             * Flag indicating whether the ScrollRunnable is disposed.
             * @type Boolean
             */
            disposed: false,
            
            /**
             * The TabPane peer for which scrolling is being performed.
             * @type Extras.Sync.TabPane
             */
            peer: null,
            
            /**
             * Last invocation time of run() method.  Used to determine the number of pixels which should be scrolled and 
             * ensure a constant velocity of the tabs.
             */
            lastInvokeTime: null,
        
            /**
             * Creates a new ScrollRunnable.
             * 
             * @param {Extras.Sync.TabPane} the synchronization peer
             * @param {Boolean} direction of scrolling travel
             */
            $construct: function(peer, reverse) {
                this.peer = peer;
                this.reverse = reverse;
                this.initialPosition = peer.scrollPosition;
                this.lastInvokeTime = new Date().getTime();
            },
            
            /**
             * Disposes of the scrolling runnable, removing it from the scheduler.
             */
            dispose: function() {
                if (!this.disposed) {
                    Core.Web.Scheduler.remove(this);
                }
                this.disposed = true;
            },
            
            /**
             * Finishes the tab header scrolling operation in response to the user releasing the scroll button.
             * Ensures the header has been scrolled the minimum "click distance", and if not, scrolls the header
             * that distance.
             */
            finish: function() {
                if (this.distance < this.clickDistance) {
                    this.distance = this.clickDistance;
                    this.updatePosition();
                }
                this.peer.renderDisplay();
                this.dispose();
            },
            
            /** @see Core.Web.Scheduler.Runnable#run */
            run: function() {
                var time = new Date().getTime();
                this.distance += Math.ceil(this.pixelsPerSecond * (time - this.lastInvokeTime) / 1000);
                this.lastInvokeTime = time;
                this.updatePosition();
            },
            
            /**
             * Updates the scroll position of the tab pane header.
             */
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
    
    /**
     * Name-to-ImageReference map for icons used by the TabPane, e.g., tab close and scroll icons.
     * @type Object
     */
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
     * Element containing _headerContainerDiv.
     */
    _headerContainerBoundsDiv: null,
    
    /**
     * Element containing tab headers.
     * This element is contained withing the _headerContainerBoundsDiv, and positioned left/right to facilitate scrolling of 
     * tab headers.
     * @type Element
     */
    _headerContainerDiv: null,
    
    /**
     * The renderId of the active tab.
     * @type String
     */
    _activeTabId: null,
    
    /**
     * The renderId of the displayed tab.
     * @type String 
     */
    _displayedTabId: null,
    
    /**
     * Scroll previous arrow.
     * @type Element
     */
    _previousControlDiv: null,
    
    /**
     * Scroll next arrow.
     * @type Element
     */
    _nextControlDiv: null,
    
    /**
     * Data object containing information about a pending update to a tab's rollover state.
     */
    _pendingRollover: null,
    
    /**
     * The tab which is currently rolled over.
     * @type String
     */
    _rolloverTabId: null,
    
    /**
     * Flag indicating whether the current rolled over tab's close icon is rolled over.
     * @type Boolean
     */
    _rolloverTabCloseState: false,
    
    /**
     * Runnable used to delay rendering of rollover effects to avoid flicker.
     * @type Core.Web.Scheduler.Runnable
     */
    _rolloverRunnable: null,

    /**
     * Array containing <code>Extras.Sync.TabPane.Tab</code> objects represented the displayed tabs.
     * Each index of this array matches the corresponding child component index.
     * @type Array 
     */
    _tabs: null,
    
    /**
     * Combined width of all tabs, in pixels.
     * @type Number
     */
    _totalTabWidth: 0,
    
    /**
     * Height of the header, in pixels.
     * @type Number
     */
    _headerHeight: null,
    
    /**
     * Flag indicating whether a re-layout operation is required.  Flag is set by renderAdd()/renderUpdate() methods.
     * @type Boolean
     */
    _layoutRequired: false,
    
    /**
     * Flag indicating whether header images have been completely loaded.
     */
    _headerImageLoadingComplete: false,
    
    /**
     * Flag indicating whether a full header re-render operation is required.  Flag is set by renderUpdate() method in response
     * to child layout data changes to avoid full render.
     * @type Boolean
     */
    _headerUpdateRequired: false,
    
    /** 
     * Method reference to <code>_tabSelectListener</code> of instance.
     * @type Function 
     */
    _tabSelectListenerRef: null,
    
    /**
     * The ScrollRunnable currently scrolling the tab headers.  Null when the tab pane is not actively scrolling. 
     * @type Extras.Sync.TabPane#ScrollRunnable
     */
    _scrollRunnable: null,
    
    /** 
     * Current scroll position of tab header, in pixels.
     * @type Number
     */
    scrollPosition: 0,
    
    /**
     * Flag indicating rendered layout direction of component (true if right-to-left).
     * @type Boolean
     */
    _rtl: false,
    
    /**
     * Constructor.
     */
    $construct: function() {
        this._tabs = [];
        this._tabSelectListenerRef = Core.method(this, this._tabSelectListener);
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
            tab._renderAdd(update);
            this._headerContainerDiv.appendChild(tab._headerDiv);
            this._contentContainerDiv.appendChild(tab._contentDiv);
        } else {
            this._tabs.splice(index, 0, tab);
            tab._renderAdd(update);
            this._headerContainerDiv.insertBefore(tab._headerDiv, this._headerContainerDiv.childNodes[index]);
            this._contentContainerDiv.insertBefore(tab._contentDiv, this._contentContainerDiv.childNodes[index]);
        }
    },

    /**
     * Measures the height of the header region of the tab pane, adjusting the content region's size to accommodate it.
     * Invoked in renderDisplay phase when <code>_layoutRequired</code> flag has been set.
     */
    _renderLayout: function() {
        if (!this._layoutRequired) {
            return;
        }
        
        this._renderHeaderPositions();
        
        if (this._headerHeight === 0) {
            return;
        }
        this._layoutRequired = false;
        
        if (this._borderDiv) {
            // Adjust image border DIV to match header height.
            this._borderDiv.style[this._tabSide] = (this._headerHeight - this._ibContentInsetsPx[this._tabSide]) + "px";
        }
        
        var borderSize = this._borderType == Extras.TabPane.BORDER_TYPE_NONE ? 0 : Echo.Sync.Border.getPixelSize(this._border);
        this._headerContainerBoundsDiv.style.height = this._headerHeight + "px";
        this._contentContainerDiv.style.left = this._contentContainerDiv.style.right = 
                this._contentContainerDiv.style[this._oppositeSide] = 0;
        this._contentContainerDiv.style[this._tabSide] = (this._headerHeight - borderSize) + "px";
        
        Core.Web.VirtualPosition.redraw(this._contentContainerDiv);
        Core.Web.VirtualPosition.redraw(this._headerContainerDiv);
        Core.Web.VirtualPosition.redraw(this._headerContainerBoundsDiv);
        for (var i = 0; i < this._tabs.length; ++i) {
            this._tabs[i]._renderDisplay();
        }
        
        if (!this._headerImageLoadingComplete) {
            this._headerImageLoadingComplete = true;
            // Add image monitor to re-execute renderLayout as images are loaded.
            var imageListener = Core.method(this, function() {
                if (this.component) { // Verify component still registered.
                    this._layoutRequired = true;
                    this._renderLayout();
                }
            });
            imageListener.id = "TabPane:" + this.component.renderId;
            Core.Web.Image.monitor(this._headerContainerDiv, imageListener);
        }
    },
    
    /**
     * Positions tabs.
     * Equalizes tab heights to height of tallest tab.
     * Determines and stores the object's <code>_totalTabWidth</code> and <code>_headerHeight</code> properties.
     */
    _renderHeaderPositions: function() {
        var maxActiveHeight = 0,
            maxInactiveHeight = 0,
            tabActiveHeight,
            tabInactiveHeight,
            i,
            clearHeight = this._tabHeight ? (this._tabHeight + "px") : "";
            
        this._totalTabWidth = 0;
        this._headerHeight = 0;

        var maximumTabWidth = this.component.render("tabWidth") ? null : this.component.render("tabMaximumWidth");
        var maximumTabWidthPx;
        if (maximumTabWidth) {
            if (Echo.Sync.Extent.isPercent(maximumTabWidth)) {
                var percent = parseInt(maximumTabWidth, 10);
                maximumTabWidthPx = Math.floor(this._tabContainerWidth * percent / 100); 
            } else {
                maximumTabWidthPx = Echo.Sync.Extent.toPixels(maximumTabWidth);
            }
        }
        
        for (i = 0; i < this._tabs.length; ++i) {
            // Clear height/width settings.
            this._tabs[i]._heightTd.style.height = clearHeight;
            if (maximumTabWidthPx) {
                this._tabs[i]._textDiv.style.width = "";
                var labelBounds = new Core.Web.Measure.Bounds(this._tabs[i]._textDiv, 
                            { flags: Core.Web.Measure.Bounds.FLAG_MEASURE_DIMENSION });
                if (labelBounds.width > maximumTabWidthPx) {
                    this._tabs[i]._textDiv.style.width = maximumTabWidthPx + "px";
                }
            }
            
            // Determine bounds of tab.
            var headerDivBounds = new Core.Web.Measure.Bounds(this._tabs[i]._headerDiv, 
                    { flags: Core.Web.Measure.Bounds.FLAG_MEASURE_DIMENSION });
            
            // Determine adjustment in height of tab when it is active.
            var adjust = this._tabActiveHeightIncreasePx + this._tabInactivePositionAdjustPx +
                    this._tabs[i]._activeSurroundHeight - this._tabs[i]._inactiveSurroundHeight;

            // Load tab active and inactive heights.
            if (this._tabs[i]._active) {
                tabActiveHeight = headerDivBounds.height;
                tabInactiveHeight = headerDivBounds.height - adjust;
            } else {
                tabInactiveHeight = headerDivBounds.height;
                tabActiveHeight = headerDivBounds.height + adjust;
            }
            
            // Set maximum active/inactive heights if necessary.
            maxInactiveHeight = tabInactiveHeight > maxInactiveHeight ? tabInactiveHeight : maxInactiveHeight;
            maxActiveHeight = tabActiveHeight > maxActiveHeight ? tabActiveHeight : maxActiveHeight;
            
            // Horizontally position the tab at rightmost position.
            this._tabs[i]._headerDiv.style.left = this._totalTabWidth + "px";
            
            // Set z-index of tab based on position (left to right increase, but with active tab above all inactive tabs,
            // and rollover tab above all tabs).
            this._tabs[i]._headerDiv.style.zIndex = (this._rolloverTabId === this._tabs[i].id) ? (this._tabs.length) : 
                    (this._tabs[i]._active ? this._tabs.length + 1: i);
            
            // Move rendering cursor to right / calculate total width.
            this._totalTabWidth += headerDivBounds.width;
            if (i < this._tabs.length - 1) {
                // Add tab spacing.
                this._totalTabWidth += this._tabSpacingPx;
            }
        }

        // Set minimum heights of tabs for height equalization.
        for (i = 0; i < this._tabs.length; ++i) {
            if (this._tabs[i]._active) {
                this._tabs[i]._heightTd.style.height = (maxActiveHeight -
                        (this._tabs[i]._activeSurroundHeight + this._tabInactivePositionAdjustPx + 
                        this._tabActiveHeightIncreasePx)) + "px";
            } else {
                this._tabs[i]._heightTd.style.height = (maxInactiveHeight - this._tabs[i]._inactiveSurroundHeight) + "px";
            }
        }
        
        // Determine maximum height of tabs (either active or inactive).
        this._headerHeight = maxActiveHeight > maxInactiveHeight ? maxActiveHeight : maxInactiveHeight;
        
        if (Core.Web.VirtualPosition.enabled) {
            for (i = 0; i < this._tabs.length; ++i) {
                if (this._tabs[i]._fibContainer) {
                    Echo.Sync.FillImageBorder.renderContainerDisplay(this._tabs[i]._fibContainer);
                    Core.Web.VirtualPosition.redraw(this._tabs[i]._backgroundDiv);
                }
            }
        }
    },
    
    /**
     * Determines the renderId of the active tab child component.
     * This method first queries the component's <code>activeTabId</code> property, 
     * and if it is not set, the id is determined by finding the child component at the 
     * index specified by the component's <code>activeTabIndex</code> property.
     *
     * @return the active tab renderId
     * @type String
     */
    _getActiveTabId: function() {
        var activeTabId = this.component.get("activeTabId");
        if (!activeTabId) {
            var activeTabIndex = this.component.get("activeTabIndex");
            if (activeTabIndex != null && activeTabIndex < this.component.children.length) {
                activeTabId = this.component.children[activeTabIndex].renderId;
            }
        }
        return activeTabId;
    },
    
    /**
     * Determines the pxiel height of the separation between inactive tabs and the tab content area.  (For a TAB_POSITION_TOP,
     * this is the bottom of the tabs to the top of tab content).
     * 
     * @return the height
     * @type Number
     */
    _getSeparatorHeight: function() {
        if (this._borderType == Extras.TabPane.BORDER_TYPE_NONE) {
            return 0;
        }
        
        if (this._imageBorder) {
            //FIXME, possibly provide a configurable property for this.
            return 0;
        }

        return Echo.Sync.Border.getPixelSize(this._border, this._tabSide);
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
            if (tab.id == tabId) {
                return tab;
            }
        }
        return null;
    },
    
    /** @see Echo.Render.ComponentSync#isChildDisplayed */
    isChildVisible: function(component) {
        return component.renderId == this._activeTabId;
    },
    
    /**
     * Handler for mouse rollover enter/exit events on previous/next scroll buttons.
     * 
     * @param e the mouse rollover event
     */
    _processScrollRollover: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return;
        }
        
        var previous = e.registeredTarget === this._previousControlDiv;
        var enter = e.type == "mouseover";
        var icon;
        
        if (enter) {
            // Set rollover icon.
            icon = previous ? this._icons.rolloverScrollLeftIcon : this._icons.rolloverScrollRightIcon;
            if (!icon && !(previous ? this._icons.scrollLeftIcon : this._icons.scrollRightIcon)) {
                // Configured rollover icon not found, Use default rollover icon, but only if default icon is in use.
                icon = this.client.getResourceUrl("Extras", previous ? 
                        "image/tabpane/PreviousRollover.png" : "image/tabpane/NextRollover.png");
            }
        } else {
            // Set default icon.
            icon = previous ? this._icons.scrollLeftIcon : this._icons.scrollRightIcon;
            if (!icon) {
                icon = this.client.getResourceUrl("Extras", previous ? "image/tabpane/Previous.png" : "image/tabpane/Next.png");
            }
        }
        
        if (icon) {
            e.registeredTarget.firstChild.src = Echo.Sync.ImageReference.getUrl(icon);
        }
    },
    
    /**
     * Handler for mouse down event on previous/next scroll buttons.
     * 
     * @param e the mouse down event
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
     * 
     * @param e the mouse up event
     */
    _processScrollStop: function(e) {
        if (!this._scrollRunnable) {
            return;
        }
        this._scrollRunnable.finish();
        this._scrollRunnable = null;
    },
    
    /**
     * Removes a specific tab.  Removes its rendering from the DOM.
     *
     * @param {Extras.Sync.TabPane.Tab} tab the tab to remove
     */
    _removeTab: function(tab) {
        var tabIndex = Core.Arrays.indexOf(this._tabs, tab);
        if (tabIndex == -1) {
            return;
        }
        if (tab.id == this._activeTabId) {
            this._activeTabId = null;
        }
        this._tabs.splice(tabIndex, 1);
        
        Core.Web.DOM.removeNode(tab._headerDiv);
        Core.Web.DOM.removeNode(tab._contentDiv);
        
        tab._renderDispose();
    },
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this._headerImageLoadingComplete = false;

        this.component.addListener("tabSelect", this._tabSelectListenerRef);
        
        // Store rendering properties.
        this._icons = { 
            scrollLeftIcon: this.component.render("scrollLeftIcon"),
            scrollRightIcon: this.component.render("scrollRightIcon"),
            rolloverScrollLeftIcon: this.component.render("rolloverScrollLeftIcon"),
            rolloverScrollRightIcon: this.component.render("rolloverScrollRightIcon")
        };
        this._rtl = !this.component.getRenderLayoutDirection().isLeftToRight();
        this._activeTabId = this._getActiveTabId();
        this._tabRolloverEnabled = this.component.render("tabRolloverEnabled");
        this._insets = this.component.render("insets", Extras.Sync.TabPane._DEFAULTS.insets);
        this._tabActiveBorder = this.component.render("tabActiveBorder", Extras.Sync.TabPane._DEFAULTS.tabActiveBorder);
        this._imageBorder = this.component.render("imageBorder");
        this._border = this._imageBorder ? null : this._border = this.component.render("border", this._tabActiveBorder);
        this._borderType = this.component.render("borderType", Extras.Sync.TabPane._DEFAULTS.borderType);
        this._tabInactiveBorder = this.component.render("tabInactiveBorder", Extras.Sync.TabPane._DEFAULTS.tabInactiveBorder);
        this._tabInsetPx = Echo.Sync.Extent.toPixels(this.component.render("tabInset",Extras.Sync.TabPane._DEFAULTS.tabInset));
        this._tabPositionBottom = this.component.render("tabPosition", Extras.Sync.TabPane._DEFAULTS.tabPosition) == 
                Extras.TabPane.TAB_POSITION_BOTTOM;
        this._tabSide = this._tabPositionBottom ? "bottom" : "top";
        this._oppositeSide = this._tabPositionBottom ? "top" : "bottom";
        this._tabSpacingPx = Echo.Sync.Extent.toPixels(this.component.render("tabSpacing", 
                Extras.Sync.TabPane._DEFAULTS.tabSpacing));
        this._tabActiveHeightIncreasePx = Echo.Sync.Extent.toPixels(
                this.component.render("tabActiveHeightIncrease", Extras.Sync.TabPane._DEFAULTS.tabActiveHeightIncrease));
        this._tabInactivePositionAdjustPx = this._getSeparatorHeight();
        this._tabCloseEnabled = this.component.render("tabCloseEnabled", false);
        if (this._tabCloseEnabled) {
            this._icons.defaultIcon = this.component.render("tabCloseIcon");
            this._icons.disabledIcon = this.component.render("tabDisabledCloseIcon");
            this._icons.rolloverIcon = this.component.render("tabRolloverCloseIcon");
        }
        this._tabActiveInsets = Echo.Sync.Insets.toPixels(this.component.render("tabActiveInsets"));
        this._tabInactiveInsets = Echo.Sync.Insets.toPixels(this.component.render("tabInactiveInsets"));
        this._tabHeight = Echo.Sync.Extent.toPixels(this.component.render("tabHeight"), false) || 0;

        // Store rendering properties: border/content insets.
        var pixelInsets = Echo.Sync.Insets.toPixels(this._insets);
        if (this._imageBorder) {
            this._ibBorderInsetsPx = Echo.Sync.Insets.toPixels(this._imageBorder.borderInsets);
            this._ibContentInsetsPx = Echo.Sync.Insets.toPixels(this._imageBorder.contentInsets);
        }
        if (this._borderType == Extras.TabPane.BORDER_TYPE_SURROUND) {
            if (this._imageBorder) {
                pixelInsets[this._oppositeSide] += this._ibContentInsetsPx[this._oppositeSide];
                pixelInsets.left += this._ibContentInsetsPx.left;
                pixelInsets.right += this._ibContentInsetsPx.right;
            }
        } else if (this._borderType == Extras.TabPane.BORDER_TYPE_PARALLEL_TO_TABS) {
            if (this._imageBorder) {
                this._imageBorder = {
                    color: this._imageBorder.color,
                    borderInsets: this._ibBorderInsetsPx.top + "px 0 " + this._ibBorderInsetsPx.bottom + "px",
                    contentInsets: this._ibContentInsetsPx.top + "px 0 " + this._ibContentInsetsPx.bottom + "px",
                    top: this._imageBorder.top,
                    bottom: this._imageBorder.bottom
                };
                pixelInsets[this._oppositeSide] += this._ibContentInsetsPx[this._oppositeSide];
            }
            pixelInsets.left = pixelInsets.right = 0;
        } else {
            if (this._imageBorder) {
                var pre = this._tabPositionBottom ? "0 0 " : "";
                var post = this._tabPositionBottom ? "" : " 0 0";
                this._imageBorder = {
                    color: this._imageBorder.color,
                    borderInsets: pre + this._ibBorderInsetsPx[this._tabSide] + "px" + post,
                    contentInsets: pre + this._ibContentInsetsPx[this._tabSide] + "px" + post,
                    top: this._imageBorder.top
                };
            }
            pixelInsets.left = pixelInsets.right = pixelInsets[this._oppositeSide] = 0;
        }

        // Create Main Element.
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        this._div.style.cssText = "position:absolute;top:" + pixelInsets.top + "px;right:" + pixelInsets.right +
                "px;bottom:" + pixelInsets.bottom + "px;left:" + pixelInsets.left + "px;";
                        
        this._headerContainerBoundsDiv = document.createElement("div");
        this._headerContainerBoundsDiv.style.cssText = "position:absolute;overflow:hidden;z-index:1;" +
                (this._tabPositionBottom ? "bottom" : "top") + ":0;" +
                "left:" + this._tabInsetPx + "px;right:" + this._tabInsetPx + "px;";
        this._div.appendChild(this._headerContainerBoundsDiv);
                
        // Render Header Container.
        this._headerContainerDiv = document.createElement("div");
        this._headerContainerDiv.style.cssText = "position:absolute;left:0;right:0;top:0;bottom:0;";
                
        Echo.Sync.Font.render(this.component.render("font"), this._headerContainerDiv);
        Echo.Sync.FillImage.render(this.component.render("tabBackgroundImage"), this._headerContainerDiv);
        this._headerContainerBoundsDiv.appendChild(this._headerContainerDiv);
        
        // Render Image Border (optional).
        if (this._imageBorder) {
            this._borderDiv = Echo.Sync.FillImageBorder.renderContainer(this._imageBorder, { absolute: true });
            if (this._tabPositionBottom) {
                this._borderDiv.style.top = (0 - this._ibContentInsetsPx.top) + "px";
                this._borderDiv.style.bottom = 0;
            } else {
                this._borderDiv.style.top = 0;
                this._borderDiv.style.bottom = (0 - this._ibContentInsetsPx.bottom) + "px";
            }
            this._borderDiv.style.left = (0 - this._ibContentInsetsPx.left) + "px";
            this._borderDiv.style.right = (0 - this._ibContentInsetsPx.right) + "px";
            this._div.appendChild(this._borderDiv);
        }
        
        // Render Content Container.
        this._contentContainerDiv = document.createElement("div");
        this._contentContainerDiv.style.cssText = "position:absolute;overflow:hidden;";
        Echo.Sync.renderComponentDefaults(this.component, this._contentContainerDiv);
        if (this._border) {
            if (this._borderType == Extras.TabPane.BORDER_TYPE_NONE) {
                this._contentContainerDiv.style.border = "0 none";
            } else if (this._borderType == Extras.TabPane.BORDER_TYPE_SURROUND) {
                Echo.Sync.Border.render(this._border, this._contentContainerDiv);
            } else if (this._borderType == Extras.TabPane.BORDER_TYPE_PARALLEL_TO_TABS) {
                Echo.Sync.Border.render(this._border, this._contentContainerDiv, "borderTop");
                Echo.Sync.Border.render(this._border, this._contentContainerDiv, "borderBottom");
            } else if (this._tabPositionBottom) {
                Echo.Sync.Border.render(this._border, this._contentContainerDiv, "borderBottom");
            } else {
                Echo.Sync.Border.render(this._border, this._contentContainerDiv, "borderTop");
            }
        }
        this._div.appendChild(this._contentContainerDiv);

        this._verifyActiveTabAvailable();
        
        // Create tabs.
        for (var i = 0; i < this.component.children.length; ++i) {
            var tab = new Extras.Sync.TabPane.Tab(this.component.children[i], this);
            this._addTab(update, tab);
        }

        this._layoutRequired = true;
        
        parentElement.appendChild(this._div);
    },
    
    /** @see Echo.Render.ComponentSync#renderDisplay */
    renderDisplay: function() {
        var i, tab;
        
        Core.Web.VirtualPosition.redraw(this._div);
        this._tabContainerWidth = new Core.Web.Measure.Bounds(this._div, 
                { flags: Core.Web.Measure.Bounds.FLAG_MEASURE_DIMENSION }).width - (2 * this._tabInsetPx);
        
        this._renderHeaderUpdate();
        
        this._renderLayout();
        
        // Process a change in active tab, update displayed tab.
        if (this._displayedTabId != this._activeTabId) {
            if (this._displayedTabId != null) {
                tab = this._getTabById(this._displayedTabId);
                tab._renderState(false);
            }
            if (this._activeTabId != null) {
                tab = this._getTabById(this._activeTabId);
                tab._renderState(true);
            }
            this._displayedTabId = this._activeTabId;
        }

        this._renderHeaderPositions();

        // Virtual positioning
        if (this._borderDiv) {
            Core.Web.VirtualPosition.redraw(this._borderDiv);
            Echo.Sync.FillImageBorder.renderContainerDisplay(this._borderDiv);
        }
        
        Core.Web.VirtualPosition.redraw(this._contentContainerDiv);
        Core.Web.VirtualPosition.redraw(this._headerContainerDiv);
        
        for (i = 0; i < this._tabs.length; ++i) {
            this._tabs[i]._renderDisplay();
        }

        // Re-bound scroll position.
        this.setScrollPosition(this.scrollPosition);
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        this.component.removeListener("tabSelect", this._tabSelectListenerRef);

        this._activeTabId = null;
        for (var i = 0; i < this._tabs.length; i++) {
            this._tabs[i]._renderDispose();
        }
        this._tabs = [];
        this._div = null;
        this._borderDiv = null;
        this._headerContainerBoundsDiv = null;
        this._headerContainerDiv = null;
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
    
    /**
     * Renders a full update to the header, if required.
     */
    _renderHeaderUpdate: function() {
        if (!this._headerUpdateRequired) {
            return;
        }
        this._headerUpdateRequired = false;
        for (var i = 0; i < this._tabs.length; ++i) {
            this._tabs[i]._loadProperties();
            this._tabs[i]._renderHeaderState(this._tabs[i].id === this._activeTabId, false, true);
        }
    },
    
    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        var fullRender = false,
            tab,
            i;
        
        this._headerImageLoadingComplete = false;
        
        if (update.hasUpdatedLayoutDataChildren()) {
            this._headerUpdateRequired = true;
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
                    if (removedChildren[i].renderId == this._displayedTabId) {
                        this._displayedTabId = null;
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
                if (update.getUpdatedProperty("activeTabId")) {
                    this._activeTabId = update.getUpdatedProperty("activeTabId").newValue;
                } else if (update.getUpdatedProperty("activeTabIndex")) {
                    var newIndex = update.getUpdatedProperty("activeTabIndex").newValue;
                    if (newIndex >= 0 && newIndex < this.component.children.length) {
                        this._activeTabId = this.component.children[newIndex].renderId;
                    }
                }
            }
            this._verifyActiveTabAvailable();
            this._layoutRequired = true;
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
     * Enables/disables the scrolling controls used when the tab header is to wide to be displayed entirely at once.
     * This method will lazy-render the specified scrolling control if it has not been previously enabled. 
     * 
     * @param {Boolean} previous flag indicating which scrolling control should be enabled/disabled, true indicating the
     *        scroll-to-previous control, false indicating the scroll-to-next control
     * @param {Boolean} enabled the new enabled state
     */
    _setOversizeEnabled: function(previous, enabled) {
        var controlDiv = previous ? this._previousControlDiv : this._nextControlDiv,
            img;

        if (enabled) {
            if (controlDiv) {
                controlDiv.style.display = "block";
            } else {
                controlDiv = document.createElement("div");
                controlDiv.style.cssText = "position:absolute;z-index:2;cursor:pointer;";
                
                controlDiv.style[previous ? "left" : "right"] = "2px";
                
                img = document.createElement("img");
                controlDiv.appendChild(img);

                Core.Web.Event.add(controlDiv, "mousedown", Core.method(this, this._processScrollStart));
                Core.Web.Event.add(controlDiv, "mouseup", Core.method(this, this._processScrollStop));
                Core.Web.Event.add(controlDiv, "mouseover", Core.method(this, this._processScrollRollover)); 
                Core.Web.Event.add(controlDiv, "mouseout", Core.method(this, this._processScrollRollover)); 
                Core.Web.Event.Selection.disable(controlDiv);

                if (previous) {
                    img.src = this._icons.scrollLeftIcon ? Echo.Sync.ImageReference.getUrl(this._icons.scrollLeftIcon) :
                            this.client.getResourceUrl("Extras", "image/tabpane/Previous.png");
                    this._previousControlDiv = controlDiv;
                } else {
                    img.src = this._icons.scrollRightIcon ? Echo.Sync.ImageReference.getUrl(this._icons.scrollRightIcon) :
                            this.client.getResourceUrl("Extras", "image/tabpane/Next.png");
                    this._nextControlDiv = controlDiv;
                }
                this._div.appendChild(controlDiv);
                
                var tabContainerHeight = new Core.Web.Measure.Bounds(this._headerContainerDiv,
                        { flags: Core.Web.Measure.Bounds.FLAG_MEASURE_DIMENSION }).height;
                var imageListener = Core.method(this, function() {
                    if (img.height && !isNaN(img.height)) {
                        var imgOffset = Math.floor((tabContainerHeight - img.height) / 2);
                        if (imgOffset > 0) {
                            controlDiv.style[this._tabPositionBottom ? "bottom" : "top"] = imgOffset + "px";
                        }
                    }
                });
                Core.Web.Image.monitor(controlDiv, imageListener);
                imageListener();
            }
        } else if (controlDiv) {
            controlDiv.style.display = "none";
        }
    },
    
    /**
     * Sets the currently rolled-over tab.
     * Enqueues a slightly delayed runnable to perform the operation in order to prevent flicker.
     * 
     * @param {String} tabId the tab id (renderId of child componeent)
     * @param {Boolean} state the rollover state of the tab
     */
    _setRolloverTab: function(tabId, state) {
        this._pendingRollover = { tabId: tabId, state: state };
        if (!this._rolloverRunnable) {
            this._rolloverRunnable = new Core.Web.Scheduler.MethodRunnable(Core.method(this, function() {
                this._setRolloverTabImpl(this._pendingRollover.tabId, this._pendingRollover.state);
            }));
        }
        Core.Web.Scheduler.add(this._rolloverRunnable);
    },
    
    /**
     * Implementation work method for setting currently rolled over tab.
     * 
     * @param {String} tabId the tab id (renderId of child componeent)
     * @param {Boolean} state the rollover state of the tab
     */
    _setRolloverTabImpl: function(tabId, state) {
        var rolloverTab = this._rolloverTabId && this._getTabById(this._rolloverTabId);
        var tab = this._getTabById(tabId);
        if (state) {
            if (this._rolloverTabId != tabId) {
                if (rolloverTab) {
                    rolloverTab.setRollover(false, false);
                }
                this._rolloverTabId = tabId;
                tab.setRollover(true);
            }
        } else {
            if (this._rolloverTabId == tabId) {
                this._rolloverTabId = null;
                if (rolloverTab) {
                    rolloverTab.setRollover(false, false);
                }
            } else {
                // Tab state is already non-rollover, do nothing.
            }
        }
    },
    
    /**
     * Sets the scroll position of the tab header.
     * 
     * @param {Number} position the scroll position, in pixels
     * @return a boolean state indicating whether the scroll position could be set exactly (true) or was bounded by
     *         an attempt too be scrolled to far (false)
     * @type Boolean
     */
    setScrollPosition: function(position) {
        var bounded = false,
            oversize = this._totalTabWidth > this._tabContainerWidth;
            
        // Set position to zero in the event that header is not oversize.
        position = oversize ? position : 0;
            
        if (position < 0) {
            position = 0;
            bounded = true;
        } else if (position > 0 && position > this._totalTabWidth - this._tabContainerWidth) {
            position = this._totalTabWidth - this._tabContainerWidth;
            bounded = true;
        }
        this.scrollPosition = position;
        this._headerContainerDiv.style.left = (0 - position) + "px";
        
        if (oversize) {
            this._setOversizeEnabled(true, position > 0);
            this._setOversizeEnabled(false, position < this._totalTabWidth - this._tabContainerWidth);
        } else {
            this._setOversizeEnabled(true, false);
            this._setOversizeEnabled(false, false);
        }
        
        return !bounded;
    },
    
    /**
     * Event listener to component instance for user tab selections.
     * 
     * @param e the event
     */
    _tabSelectListener: function(e) {
        this._activeTabId = e.tab.renderId;
        Echo.Render.renderComponentDisplay(this.component);
    },
    
    /**
     * Ensures an active tab is present, if possible.
     */
    _verifyActiveTabAvailable: function() {
        for (var i = 0; i < this.component.children.length; ++i) {
            if (this.component.children[i].renderId == this._activeTabId) {
                return;
            }
        }
        this._activeTabId = this.component.children.length === 0 ? null : this.component.children[0].renderId; 
    }
});

/**
 * Representation of a single tab (child component) within the tab pane.
 * Provides tab-specific rendering functionality, handles setting active state
 * on/off for an individual tab.
 */
Extras.Sync.TabPane.Tab = Core.extend({
    
    /**
     * Active state of the tab (true indicating the tab is the active tab in its TabPane).
     * Initial (non-rendered) state is indicated by null.
     * @type Boolean
     */
    _active: null,
    
    /**
     * The child component which will be rendered within the tab.
     * @type Echo.Component
     */
    _childComponent: null,
    
    /**
     * The FillImageBorder container component housing the tab, if in use.
     * @type Element
     */
    _fibContainer: null,
    
    /**
     * The TabPane synchronization peer.
     * @type Extras.Sync.TabPane
     */
    _parent: null,
    
    /**
     * DIV element containing tab header (highest level element managed by Tab object in the header).
     * @type Element
     */
    _headerDiv: null,
    
    /**
     * The DIV element which will contain the rendered child component.
     * @type Element
     */
    _contentDiv: null,
    
    /**
     * TD element containing close icon.
     * @type Element
     */
    _closeIconTd: null,
    
    /**
     * Flag indicating whether the tab may be closed.
     * @type Boolean
     */
    _tabCloseEnabled: false,
    
    /**
     * The default set z-index of the tab.  This value is used to store the previous z-index value when
     * a tab is rolled over (and its z-index is thus raised).
     * @type Number
     */
    _defaultZIndex: 0,
    
    /**
     * The total height of the active tab border and insets, in pixels.
     * @type Number 
     */
    _activeSurroundHeight: null,
    
    /**
     * The total height of the inactive tab border and insets, in pixels.
     * @type Number 
     */
    _inactiveSurroundHeight: null,
    
    /**
     * The DIV containing the tab's label, i.e., title and icon.
     * @type Element
     */
    _labelDiv: null,
    
    /**
     * DIV containing the tab's text content.  The width of this DIV is measured and set when using maximum tab widths.
     * @type Element
     */
    _textDiv: null,
    
    /**
     * The tab identifier, i.e., the renderId of the child component.
     * @type String
     */
    id: null,
    
    /**
     * Creates a new Tab instance.
     * 
     * @param {Echo.Component} childComponent the child component which will be rendered within the tab
     * @param {Extras.Sync.TabPane} parent the TabPane synchronization peer
     */
    $construct: function(childComponent, parent) {
        this.id = childComponent.renderId;
        // state
        this._childComponent = childComponent;
        this._parent = parent;
    },
    
    /**
     * Retries the close image (either default or rollover).
     * 
     * @param rollover flag indicating whether rollover (true) or default (false) image should be returned
     * @type #ImageReference
     */
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

    /**
     * Determine content inset margin.
     * 
     * @return the content inset margin
     * @type #Insets
     */
    _getContentInsets: function() {
        if (this._childComponent.pane) {
            // Do not render insets on panes.
            return 0;
        } else {
            return this._parent.component.render("defaultContentInsets", Extras.Sync.TabPane._DEFAULTS.tabContentInsets);
        }
    },
    
    /**
     * Returns the style property which should be used for a given tab property.
     * Queries layout data and component properties.
     * Queries rollover properties if applicable (and defaults to non-rollover property if unspecified).
     * 
     * @param {String} name the name of the property, first letter capitalized, e.g., "Background"
     * @param {Boolean} active the active state
     * @param {Boolean} rollover the rollover state
     * @return the property value
     */
    _getProperty: function(name, active, rollover) {
        var value = this._layoutData[(active ? "active" : "inactive") + name] ||
                this._parent.component.render((active ? "tabActive" : "tabInactive") + name);
        if (!active && rollover) {
            value = this._layoutData["rollover" + name] || this._parent.component.render("tabRollover" + name) || value;
        }
        return value;
    },
    
    /**
     * Determines the height of the border and insets surrounding the tab (supports both imageBorder and border properties).
     * Uses layout data information if provided.
     * 
     * @param {Boolean} active true to measure the active border, false for the inactive border
     * @return the combined top and bottom border height, in pixels
     * @type Number
     */
    _getSurroundHeight: function(active) {
        var insets, imageBorder, border, padding;
        
        insets = Echo.Sync.Insets.toPixels(this._getProperty("Insets", active, false) || Extras.Sync.TabPane._DEFAULTS.tabInsets);
        padding = insets.top + insets.bottom;
        
        if (this._useImageBorder) {
            imageBorder = this._getProperty("ImageBorder", active, false);
            insets = Echo.Sync.Insets.toPixels(imageBorder.contentInsets);
            return padding + insets.top + insets.bottom;
        } else {
            border = this._getProperty("Border", active, false) || 
                    (active ? this._parent._tabActiveBorder : this._parent._tabInactiveBorder);
            return padding + Echo.Sync.Border.getPixelSize(border, this._parent._tabSide); 
        }
    },
    
    /**
     * Loads state information.
     */
    _loadProperties: function() {
        this._layoutData = this._childComponent.render("layoutData") || {};
        this._useImageBorder = this._getProperty("ImageBorder", false, false);
        this._tabCloseEnabled = this._parent._tabCloseEnabled && this._layoutData.closeEnabled;
        this._activeSurroundHeight = this._getSurroundHeight(true);
        this._inactiveSurroundHeight = this._getSurroundHeight(false);
    },
    
    /**
     * Tab click handler.
     * 
     * @param e the click event
     */
    _processClick: function(e) {
        if (!this._parent || !this._parent.client || !this._parent.client.verifyInput(this._parent.component)) {
            return true;
        }
        if (this._closeIconTd && Core.Web.DOM.isAncestorOf(this._closeIconTd, e.target)) {
            // close icon clicked
            if (!this._tabCloseEnabled) {
                return;
            }
            this._parent.component.doTabClose(this.id);
        } else {
            // tab clicked
            this._parent.component.doTabSelect(this.id);
        }
    },
    
    /**
     * Tab close icon rollover enter/exit handler.
     * 
     * @param e the mouse event
     */
    _processCloseRollover: function(e) {
        var enter = e.type == "mouseover" || e.type == "mouseenter";
        if (enter && (!this._parent || !this._parent.client || !this._parent.client.verifyInput(this._parent.component))) {
            return true;
        }
        this._closeIconTd.firstChild.src = Echo.Sync.ImageReference.getUrl(this._getCloseImage(enter));
        return true;
    },
    
    /**
     * Tab rollover enter/exit handler.
     * 
     * @param e the mouse event
     */
    _processRollover: function(e) {
        var enter = e.type == "mouseover" || e.type == "mouseenter";
        if (enter && (!this._parent || !this._parent.client || !this._parent.client.verifyInput(this._parent.component))) {
            return true;
        }
        this._parent._setRolloverTab(this.id, enter);
    },
    
    /**
     * Renders the tab.
     * 
     * @param {Echo.Update.ComponentUpdate} update the component update 
     */
    _renderAdd: function(update) {
        this._loadProperties();
        
        // Header DIV
        this._headerDiv = document.createElement("div");
        this._headerDiv.style.cssText = "position:absolute;";

        // Content DIV
        this._contentDiv = document.createElement("div");
        this._contentDiv.style.cssText = "position:absolute;top:0;left:0;overflow:auto;";
        // hide content
        if (Core.Web.Env.BROWSER_MOZILLA && !Core.Web.Env.BROWSER_FIREFOX) {
            //FIXME doc/analyze/remove
            this._contentDiv.style.right = "100%";
            this._contentDiv.style.bottom = "100%";
        } else {
            this._contentDiv.style.display = "none";
            this._contentDiv.style.right = "0";
            this._contentDiv.style.bottom = "0";
        }
        Echo.Sync.Insets.render(this._getContentInsets(), this._contentDiv, "padding");
        Echo.Render.renderComponentAdd(update, this._childComponent, this._contentDiv);
        
        this._renderState(this.id == this._parent._activeTabId);
    },
    
    /**
     * Tab-specific renderDisplay() tasks.
     */
    _renderDisplay: function() {
        if (this._fibContainer) {
            Echo.Sync.FillImageBorder.renderContainerDisplay(this._fibContainer);
            Core.Web.VirtualPosition.redraw(this._backgroundDiv);
        }
        Core.Web.VirtualPosition.redraw(this._contentDiv);
    },
    
    /**
     * Disposes of the tab, releasing any resources.
     */
    _renderDispose: function() {
        Core.Web.Event.removeAll(this._headerDiv);
        if (this._rolloverRunnable) {
            Core.Web.Scheduler.remove(this._rolloverRunnable);
        }
        this._fibContainer = null;
        this._parent = null;
        this._childComponent = null;
        this._headerDiv = null;
        this._contentDiv = null;
        this._closeIconTd = null;
        this._iconImg = null;
        this._textDiv = null;
        this._closeImg = null;
        this._heightTd = null;
        this._labelDiv = null;
        this._backgroundDiv = null;
    },
    
    /**
     * Renders the tab header.
     * 
     * @param {Boolean} active the active state of the tab
     */
    _renderHeader: function(active) {
        var tabPane = this._parent.component,
            img, table, tr, td;
        
        Core.Web.Event.removeAll(this._headerDiv);
        Core.Web.DOM.removeAllChildren(this._headerDiv);
        
        // Configure Header DIV.
        this._headerDiv.style[this._parent._tabPositionBottom ? "top" : "bottom"] = 
                active ? 0 : (this._parent._tabInactivePositionAdjustPx + "px");
        if (this._layoutData.toolTipText) {
            this._headerDiv.title = this._layoutData.toolTipText;
        }
        
        // Create Label DIV.
        this._labelDiv = document.createElement("div");
        this._labelDiv.style.cssText = "position:relative;white-space:nowrap;overflow:hidden;";
        Echo.Sync.Extent.render(this._parent.component.render("tabWidth"), this._labelDiv, "width", true, false);
        var headerDivContent = this._labelDiv;

        if (this._useImageBorder) {
            var imageBorder = this._getProperty("ImageBorder", active, false);
            var backgroundInsets = this._getProperty("BackgroundInsets", active, false);
            this._fibContainer = headerDivContent =
                    Echo.Sync.FillImageBorder.renderContainer(imageBorder, { child: this._labelDiv });
            var fibContent = Echo.Sync.FillImageBorder.getContainerContent(this._fibContainer);
            fibContent.style.zIndex = 2;
            this._backgroundDiv = document.createElement("div");
            this._backgroundDiv.style.cssText = "position:absolute;z-index:1;";
            Echo.Sync.Insets.renderPosition(backgroundInsets || imageBorder.borderInsets, this._backgroundDiv);
            this._fibContainer.appendChild(this._backgroundDiv);
            
            if (Core.Web.Env.BROWSER_INTERNET_EXPLORER && Core.Web.Env.BROWSER_VERSION_MAJOR === 6) {
                headerDivContent = Extras.Sync.TabPane._createTable();
                td = document.createElement("td");
                td.style.cssText = "padding:0;";
                td.appendChild(this._fibContainer);
                headerDivContent.firstChild.firstChild.appendChild(td);
            }
        } else {
            var border = this._getProperty("Border", active, false) || 
                    (active ? this._parent._tabActiveBorder : this._parent._tabInactiveBorder);
            this._backgroundDiv = null;
            this._fibContainer = null;
            Echo.Sync.Border.render(border, this._labelDiv, this._parent._tabPositionBottom ? "borderBottom" : "borderTop");
            Echo.Sync.Border.render(border, this._labelDiv, "borderLeft");
            Echo.Sync.Border.render(border, this._labelDiv, "borderRight");
        }
        
        // Render Header Content.
        var icon = this._layoutData && this._layoutData.icon;
        var title = (this._layoutData ? this._layoutData.title : null) || "*";
        var closeIcon = this._parent._tabCloseEnabled && (this._tabCloseEnabled || this._parent._icons.disabledIcon); //FIXME?

        // Render Text and Icon(s)
        table = Extras.Sync.TabPane._createTable();
        tr = table.firstChild.firstChild;
        
        if (icon) {
            td = document.createElement("td");
            td.style.cssText = "padding:0;";
            Echo.Sync.Alignment.render(this._parent.component.render("tabAlignment", 
                    Extras.Sync.TabPane._DEFAULTS.tabAlignment), td, true, this._parent.component);
            this._iconImg = document.createElement("img");
            this._iconImg.style.marginRight = Echo.Sync.Extent.toCssValue(this._parent.component.render("tabIconTextMargin", 
                    Extras.Sync.TabPane._DEFAULTS.tabIconTextMargin), true, false);
            td.appendChild(this._iconImg);
            tr.appendChild(td);
        }

        this._heightTd = document.createElement("td");
        this._heightTd.style.cssText = "padding:0px;width:0px;";
        tr.appendChild(this._heightTd);
        
        td = document.createElement("td");
        td.style.cssText = "padding:0;";
        Echo.Sync.Alignment.render(tabPane.render("tabAlignment", Extras.Sync.TabPane._DEFAULTS.tabAlignment), td, true, tabPane);
        this._textDiv = document.createElement("div");
        this._textDiv.style.cssText = "overflow:hidden;white-space:nowrap;";
        this._textDiv.appendChild(document.createTextNode(title));
        td.appendChild(this._textDiv);
        
        tr.appendChild(td);
        
        if (closeIcon) {
            this._closeIconTd = document.createElement("td");
            this._closeIconTd.style.cssText = "padding:0;";
            Echo.Sync.Alignment.render(this._parent.component.render("tabAlignment", 
                    Extras.Sync.TabPane._DEFAULTS.tabAlignment), this._closeIconTd, true, this._parent.component);
            this._closeIconTd.style.padding = "0 0 0 " + Echo.Sync.Extent.toCssValue(
                    this._parent.component.render("tabCloseIconTextMargin", Extras.Sync.TabPane._DEFAULTS.tabCloseIconTextMargin), 
                    true, false);
            this._closeIconTd.style.cursor = "pointer";
            this._closeImg = document.createElement("img");
            Echo.Sync.ImageReference.renderImg(this._getCloseImage(false), this._closeImg);
            this._closeIconTd.appendChild(this._closeImg);
            tr.appendChild(this._closeIconTd);
        }
        this._labelDiv.appendChild(table);
        
        Core.Web.Event.Selection.disable(this._headerDiv);
        Core.Web.Event.add(this._headerDiv, "click", Core.method(this, this._processClick), false);
        Core.Web.Event.add(this._headerDiv, 
                Core.Web.Env.PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED ? "mouseenter" : "mouseover", 
                Core.method(this, this._processRollover), false);
        Core.Web.Event.add(this._headerDiv,
                Core.Web.Env.PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED ? "mouseleave" : "mouseout",
                Core.method(this, this._processRollover), false);
        if (this._tabCloseEnabled) {
            Core.Web.Event.add(this._closeIconTd, 
                    Core.Web.Env.PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED ? "mouseenter" : "mouseover", 
                    Core.method(this, this._processCloseRollover), false);
            Core.Web.Event.add(this._closeIconTd,
                    Core.Web.Env.PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED ? "mouseleave" : "mouseout",
                    Core.method(this, this._processCloseRollover), false);
        }
        
        this._headerDiv.appendChild(headerDivContent);
    },
    
    /**
     * Renders the appearance of the tab header active or inactive.
     * 
     * @param {Boolean} active the active state of the tab, true for active, false for inactive
     * @param {Boolean} rollover the rollover state of the tab, true for rolled over, false for not
     * @param {Boolean} force force re-render of the tab, even if specified states are identical to rendered states
     *        (method may normally perform no action under such conditions)
     */
    _renderHeaderState: function(active, rollover, force) {
        var fullRender = !this._labelDiv || force;
        
        if (fullRender) {
            this._renderHeader(active);
        }
        
        if (!force && this._active == active && (active || !this._parent._tabRolloverEnabled || this._rolloverState == rollover)) {
            return;
        }
        
        if (rollover) {
            this._defaultZIndex = this._headerDiv.style.zIndex;
            this._headerDiv.style.zIndex = this._parent.component.children.length;
        } else {
            this._headerDiv.style.zIndex = this._defaultZIndex;
        }
        
        this._rolloverState = rollover;

        var tabPane = this._parent.component,
            img, table, tr, td;
        
        Echo.Sync.Color.renderClear(this._getProperty("Foreground", active, rollover), this._labelDiv, "color");
        Echo.Sync.Font.renderClear(this._getProperty("Font", active, rollover), this._labelDiv);
        this._labelDiv.style.cursor = active ? "default" : "pointer";
        Echo.Sync.Insets.render(this._getProperty("Insets", active, false) || Extras.Sync.TabPane._DEFAULTS.tabInsets, 
                this._labelDiv, "padding"); 
                
        this._headerDiv.style[this._parent._tabPositionBottom ? "top" : "bottom"] = 
                active ? 0 : (this._parent._tabInactivePositionAdjustPx + "px");

        if (active) {
            this._labelDiv.style[this._parent._tabPositionBottom ? "paddingTop" : "paddingBottom"] =
                    (parseInt(this._labelDiv.style[this._parent._tabPositionBottom ? "paddingTop" : "paddingBottom"], 10) +
                    (this._parent._tabActiveHeightIncreasePx + this._parent._tabInactivePositionAdjustPx)) + "px";
        }
                
        if (!fullRender) {
            if (this._useImageBorder) {
                // Render FillImageBorder style.
                var imageBorder = this._getProperty("ImageBorder", active, rollover);
                var backgroundInsets = this._getProperty("BackgroundInsets", active, rollover);
                Echo.Sync.FillImageBorder.renderContainer(imageBorder, { update: this._fibContainer });
                Echo.Sync.Insets.renderPosition(backgroundInsets || imageBorder.borderInsets, this._backgroundDiv);
            } else {
                // Render CSS border style.
                var border = this._getProperty("Border", active, rollover) || 
                        (active ? this._parent._tabActiveBorder : this._parent._tabInactiveBorder);
                Echo.Sync.Border.render(border, this._labelDiv, this._parent._tabPositionBottom ? "borderBottom" : "borderTop");
                Echo.Sync.Border.render(border, this._labelDiv, "borderLeft");
                Echo.Sync.Border.render(border, this._labelDiv, "borderRight");
            }
        }
        
        Echo.Sync.Color.renderClear(this._getProperty("Background", active, rollover), 
                this._backgroundDiv || this._labelDiv, "backgroundColor");
        Echo.Sync.FillImage.renderClear(this._getProperty("BackgroundImage", active, rollover), 
                this._backgroundDiv || this._labelDiv, null);

        // Update icon.
        if (this._layoutData && this._layoutData.icon) {
            Echo.Sync.ImageReference.renderImg((active && this._layoutData.activeIcon) || 
                    (rollover && this._layoutData.rolloverIcon) || this._layoutData.icon, this._iconImg);
        }
    },
    
    /**
     * Renders the tab active or inactive, updating header state and showing/hiding tab content.
     * 
     * @param {Boolean} active the active state of the tab, true for active, false for inactive
     */
    _renderState: function(active) {
        if (this._active === active) {
            // Do nothing if values are unchanged.   
            // Note initial value of oldValue is null.
            return;
        }
        
        this._renderHeaderState(active);

        if (this._active !== null && !active) {
            // Notify child component hierarchy that it is being hidden (unless performing initial render,
            // i.e., this._active === null).
            Echo.Render.renderComponentHide(this._childComponent);
        }
        // show/hide content
        if (Core.Web.Env.BROWSER_MOZILLA && !Core.Web.Env.BROWSER_FIREFOX) {
            this._contentDiv.style.right = active ? "0" : "100%";
            this._contentDiv.style.bottom = active ? "0" : "100%";
        } else {
            this._contentDiv.style.display = active ? "block" : "none";
        }
        
        this._active = active;
    },
    
    /**
     * Sets the rollover state of the tab.
     * This is performed after a delay to avoid flickering.
     * 
     * @param {Boolean} rollover the desired rollover state
     */
    setRollover: function(rollover) {
        this._renderHeaderState(this._active, rollover);
        this._parent._renderHeaderPositions();
    }
});
