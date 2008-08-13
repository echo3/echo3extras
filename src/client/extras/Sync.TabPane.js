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
        _defaultTabHeight: 32,
        _defaultTabIconTextMargin: 5,
        _defaultTabInactiveBorder: "1px solid #7f7f7f",
        _defaultTabInset: 10,
        _defaultTabInsets: "3px 8px",
        _defaultTabPosition: Extras.TabPane.TAB_POSITION_TOP,
        _defaultTabSpacing: 0
    },
    
    $load: function() {
        Echo.Render.registerPeer("Extras.TabPane", this);
    },
    
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
     * TR element containing tab headers.
     * @type Element
     */
    _headerContainerTr: null,
    
    /**
     * The renderId of the active tab.
     * @type String
     */
    _activeTabId: null,
    
    /**
     * Array containing <code>Extras.Sync.TabPane.Tab</code> objects represented the displayed tabs.
     * Each index of this array matches the corresponding child component index.
     * @type Array 
     */
    _tabs: null,
    
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
            this._headerContainerTr.appendChild(tab._headerTd);
            this._contentContainerDiv.appendChild(tab._contentDiv);
        } else {
            this._tabs.splice(index, 0, tab);
            tab._render(update);
            this._headerContainerTr.insertBefore(tab._headerTd, 
                    this._headerContainerTr.childNodes[index]);
            this._contentContainerDiv.insertBefore(tab._contentDiv,
                    this._contentContainerDiv.childNodes[index]);
        }
    },
    
    /**
     * @param {Boolean} state whether the tab is active or inactive
     * @return the tab height in pixels
     * @type Number
     */
    _calculateTabHeight: function(state) {
        if (state) {
            return this._tabHeightPx + Echo.Sync.Border.getPixelSize(this._tabActiveBorder);
        } else {
            return this._tabHeightPx - this._tabActiveHeightIncreasePx;
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
        var activeTabId = this.component.get("activeTab")
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
        // Configure Properties
        this._activeTabId = this._getActiveTabId();
        this._borderType = this.component.render("borderType", Extras.Sync.TabPane._defaultBorderType);
        this._insets = this.component.render("insets", Extras.Sync.TabPane._defaultInsets);
        this._tabActiveBorder = this.component.render("tabActiveBorder", Extras.Sync.TabPane._defaultTabActiveBorder);
        this._tabActiveHeightIncreasePx = Echo.Sync.Extent.toPixels(this.component.render("tabActiveHeightIncrease", 
                Extras.Sync.TabPane._defaultTabActiveHeightIncrease));
        this._tabInactiveBorder = this.component.render("tabInactiveBorder", Extras.Sync.TabPane._defaultTabInactiveBorder);
        this._tabHeightPx = Echo.Sync.Extent.toPixels(this.component.render("tabHeight", Extras.Sync.TabPane._defaultTabHeight));
        this._tabInsetPx = Echo.Sync.Extent.toPixels(this.component.render("tabInset",Extras.Sync.TabPane._defaultTabInset));
        this._tabPosition = this.component.render("tabPosition", Extras.Sync.TabPane._defaultTabPosition);
        this._tabSpacing = this.component.render("tabSpacing", Extras.Sync.TabPane._defaultTabSpacing);
        this._tabCloseEnabled = this.component.render("tabCloseEnabled", false);
        if (this._tabCloseEnabled) {
            this._tabCloseIcons = {};
            this._tabCloseIcons.defaultIcon = this.component.render("tabCloseIcon");
            this._tabCloseIcons.disabledIcon = this.component.render("tabDisabledCloseIcon");
            this._tabCloseIcons.fallbackDefaultIcon = this.client.getResourceUrl("Extras", "image/tabpane/Close.gif");
            this._tabCloseIcons.rolloverIcon = this.component.render("tabRolloverCloseIcon");
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

        var borderSize = Echo.Sync.Border.getPixelSize(this._tabActiveBorder);

        // Create Main Element
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        this._div.style.cssText = "position:absolute;overflow:hidden;top:" + pixelInsets.top + "px;right:" + pixelInsets.right
                + "px;bottom:" + pixelInsets.bottom + "px;left:" + pixelInsets.left + "px;";
                        
        // Render Header Container
        var headerContainerDiv = document.createElement("div");
        headerContainerDiv.style.cssText = "position:absolute;overflow:hidden;z-index:1;width:100%;"
                + (this._tabPosition == Extras.TabPane.TAB_POSITION_BOTTOM ? "bottom" : "top") + ":0;"
                + "left:" + this._tabInsetPx + "px;right:" + this._tabInsetPx + "px;"
                + "height:" + (this._tabHeightPx + borderSize) + "px;";
        
        Echo.Sync.Font.render(this.component.render("font"), headerContainerDiv);
        Echo.Sync.FillImage.render(this.component.render("tabBackgroundImage"), headerContainerDiv);
    
        var headerTable = document.createElement("table");
        headerTable.style.cssText = "border-width:0;padding:0;";
        headerTable.cellPadding = "0";
        headerTable.cellSpacing = "0";
        
        var headerTbody = document.createElement("tbody");
        headerTable.appendChild(headerTbody);
        
        this._headerContainerTr = document.createElement("tr");
        headerTbody.appendChild(this._headerContainerTr);
        
        headerContainerDiv.appendChild(headerTable);
        
        this._div.appendChild(headerContainerDiv);
        
        // Render Content Container
        this._contentContainerDiv = document.createElement("div");
        this._contentContainerDiv.style.position = "absolute";
        this._contentContainerDiv.style.overflow = "hidden";
        Echo.Sync.Color.renderFB(this.component, this._contentContainerDiv);
        
        if (this._tabPosition == Extras.TabPane.TAB_POSITION_BOTTOM) {
            this._contentContainerDiv.style.top = "0";
            this._contentContainerDiv.style.bottom = this._tabHeightPx + "px";
        } else {
            this._contentContainerDiv.style.top = this._tabHeightPx + "px";
            this._contentContainerDiv.style.bottom = "0";
        }
        this._contentContainerDiv.style.left = "0";
        this._contentContainerDiv.style.right = "0";
        
        if (this._borderType == Extras.TabPane.BORDER_TYPE_NONE) {
            this._contentContainerDiv.style.border = "0 none";
        } else if (this._borderType == Extras.TabPane.BORDER_TYPE_SURROUND) {
            Echo.Sync.Border.render(this._tabActiveBorder, this._contentContainerDiv);
        } else if (this._borderType == Extras.TabPane.BORDER_TYPE_PARALLEL_TO_TABS) {
            Echo.Sync.Border.render(this._tabActiveBorder, this._contentContainerDiv, "borderTop")
            Echo.Sync.Border.render(this._tabActiveBorder, this._contentContainerDiv, "borderBottom")
        } else if (this._tabPosition == Extras.TabPane.TAB_POSITION_BOTTOM) {
            Echo.Sync.Border.render(this._tabActiveBorder, this._contentContainerDiv, "borderBottom")
        } else {
            Echo.Sync.Border.render(this._tabActiveBorder, this._contentContainerDiv, "borderTop")
        }
        
        this._div.appendChild(this._contentContainerDiv);
        
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
        
        parentElement.appendChild(this._div);
    },
    
    renderDisplay: function() {
        Core.Web.VirtualPosition.redraw(this._div);
        Core.Web.VirtualPosition.redraw(this._contentContainerDiv);
        
        for (var i = 0; i < this._tabs.length; ++i) {
            this._tabs[i]._renderDisplay();
        }
    },
    
    renderDispose: function(update) {
        this._activeTabId = null;
        for (var i = 0; i < this._tabs.length; i++) {
            this._tabs[i]._dispose();
        }
        this._tabs = [];
        this._div = null;
        this._headerContainerTr = null;
        this._contentContainerDiv = null;
    },
    
    renderUpdate: function(update) {
        var fullRender = false;
        
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
                for (var i = 0; i < removedChildren.length; ++i) {
                    var tab = this._getTabById(removedChildren[i].renderId);
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
                for (var i = 0; i < addedChildren.length; ++i) {
                    var tab = new Extras.Sync.TabPane.Tab(addedChildren[i], this);
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
        if (this._activeTabId) {
            var tab = this._getTabById(this._activeTabId);
            if (tab) {
                tab._highlight(false);
            }
        }
        
        var tab = this._getTabById(tabId);
        if (tab) {
            this._activeTabId = tabId;
            tab._highlight(true);
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
    }
});

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
        var icons = this._parent._tabCloseIcons;
        var icon;
        if (this._tabCloseEnabled) {
            if (rollover && this._parent.component.render("tabCloseIconRolloverEnabled")) {
                icon = icons.rolloverIcon;
            }
        } else {
            icon = icons.disabledIcon;
        }
        return icon ? icon : icons.defaultIcon || icons.fallbackDefaultIcon;
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
        return { url: image, repeat: "no-repeat", x: 0, y: 0 };
    },
    
    _getRightImage: function(state) {
        var propertyName = state ? "tabActiveRightImage" : "tabInactiveRightImage";
        var image = this._parent.component.render(propertyName);
        if (!image) {
            return;
        }
        return { url: image, repeat: "no-repeat", x: "100%", y: 0 };
    },
    
    _highlight: function(state) {
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
        headerContentTable.style.height = this._parent._calculateTabHeight(state) + "px";
        
        var backgroundImage;
        if (state) {
            backgroundImage = this._parent.component.render("tabActiveBackgroundImage");
        } else {
            backgroundImage = this._parent.component.render("tabInactiveBackgroundImage");
        }
        Echo.Sync.FillImage.renderClear(backgroundImage, centerTd, null);
        
        var borderSize = Echo.Sync.Border.getPixelSize(this._parent._tabActiveBorder);
        if (this._parent._tabPosition == Extras.TabPane.TAB_POSITION_BOTTOM) {
            headerContentTable.style.marginTop = state ? "0" : borderSize + "px";
            headerContentTable.style.marginBottom = state ? "0" : this._parent._tabActiveHeightIncreasePx + "px";
            Echo.Sync.Border.render(border, headerContentTable, "borderBottom");
        } else {
            headerContentTable.style.marginBottom = state ? "0" : borderSize + "px";
            headerContentTable.style.marginTop = state ? "0" : this._parent._tabActiveHeightIncreasePx + "px";
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
            Echo.Sync.FillImage.renderClear(leftImage, this._leftTd, null);
            if (leftImage && leftImage.width) {
                this._leftTd.style.width = leftImage.width.toString();
            }
        }
        
        if (this._rightTd) {
            var rightImage = this._getRightImage(state); 
            Echo.Sync.FillImage.renderClear(rightImage, this._rightTd, null);
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
    
    _processClick: function(e) {
        if (!this._parent.client.verifyInput(this._parent.component)) {
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
            this._parent.component.fireEvent({type: "tabSelect", source: this._parent.component, 
                    tab: this._childComponent, data: this._childComponent.renderId});
        }
    },
    
    _processEnter: function(e) {
        if (!this._parent.client.verifyInput(this._parent.component)) {
            return true;
        }
        
        var rollover = Core.Web.DOM.isAncestorOf(this._closeImageTd, e.target);
        this._closeImageTd.firstChild.src = Echo.Sync.ImageReference.getUrl(this._getCloseImage(rollover));
    },
    
    _processExit: function(e) {
        var rollover = Core.Web.DOM.isAncestorOf(this._closeImageTd, e.target);
        this._closeImageTd.firstChild.src = Echo.Sync.ImageReference.getUrl(this._getCloseImage(false));
    },
    
    _render: function(update) {
        this._headerTd = this._renderHeader();
        this._headerContentTable = this._headerTd.firstChild;
        this._contentDiv = this._renderContent(update);
        
        this._highlight(this._childComponent.renderId == this._parent._activeTabId);
        this._addEventListeners();
    },
    
    _renderCloseIconElement: function() {
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
    
    _renderDisplay: function() {
        Core.Web.VirtualPosition.redraw(this._contentDiv);
    },

    _renderHeader: function() {
        var layoutData = this._childComponent.render("layoutData");
        
        var headerTd = document.createElement("td");
        headerTd.style.borderWidth = "0";
        headerTd.style.padding = "0";
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
        
        // Render TD element to contain left border image if required.
        if (this._getLeftImage(true) != null || this._getLeftImage(false) != null) {
            this._leftTd = document.createElement("td");
            this._leftTd.appendChild(document.createTextNode("\u00a0"));
            tabTr.appendChild(this._leftTd);
        }
        
        // Render tab
        var centerTd = document.createElement("td");
        centerTd.style.verticalAlign = "top";
        Echo.Sync.Insets.render(Extras.Sync.TabPane._defaultTabInsets, centerTd, "padding");
        
        var icon = layoutData ? layoutData.icon : null;
        var title = layoutData ? (layoutData.title ? layoutData.title : "*") : "*";
        var closeIcon = this._parent._tabCloseEnabled && (this._tabCloseEnabled || this._parent._tabCloseIcons.disabledIcon);
        if (icon || closeIcon) {
            // Render Text and Icon(s)
            var table = document.createElement("table");
            table.style.padding = "0";
            table.cellPadding = "0";
            table.cellSpacing = "0";
            var tbody = document.createElement("tbody");
            var tr = document.createElement("tr");
            if (icon) {
                tr.appendChild(this._renderIconElement(icon));
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
                this._closeImageTd = this._renderCloseIconElement();
                tr.appendChild(this._closeImageTd);
            }
            centerTd.appendChild(table);
        } else {
            // Render Text Only
            centerTd.style.whiteSpace = "nowrap";
            Echo.Sync.Alignment.render(this._parent.component.render("tabAlignment", 
                    Extras.Sync.TabPane._defaultTabAlignment), centerTd, true, this._parent.component);
            centerTd.appendChild(document.createTextNode(title));
        }
        tabTr.appendChild(centerTd);
        this._centerTd = centerTd;
    
        // Render TD element to contain right border image if required.
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
    
    _renderIconElement: function(icon) {
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
