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
    
    _element: null,
    _activeTabId: null,
    _tabs: null,
    _contentContainerDivElement: null,
    _headerContainerTrElement: null,
    
    $construct: function() {
        this._tabs = [];
    },
    
    /**
     * Adds a tab.
     */
    _addTab: function(update, tab, index) {
        if (index == null || index == this._tabs.length) {
            this._tabs.push(tab);
            tab._render(update);
            this._headerContainerTrElement.appendChild(tab._headerTdElement);
            this._contentContainerDivElement.appendChild(tab._contentDivElement);
        } else {
            this._tabs.splice(index, 0, tab);
            tab._render(update);
            this._headerContainerTrElement.insertBefore(tab._headerTdElement, 
                    this._headerContainerTrElement.childNodes[index]);
            this._contentContainerDivElement.insertBefore(tab._contentDivElement,
                    this._contentContainerDivElement.childNodes[index]);
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
    
    /**
     * Removes a specific tab.
     *
     * @param tab the tab to remove
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
        
        Core.Web.DOM.removeNode(tab._headerTdElement);
        Core.Web.DOM.removeNode(tab._contentDivElement);
        
        tab._dispose();
    },
    
    renderAdd: function(update, parentElement) {
        // Configure Properties
        this._activeTabId = this._getActiveTabId();
        this._borderType = this.component.render("borderType", Extras.Sync.TabPane._defaultBorderType);
        this._insets = this.component.render("insets", Extras.Sync.TabPane._defaultInsets);
        this._tabActiveBorder = this.component.render("tabActiveBorder", 
                Extras.Sync.TabPane._defaultTabActiveBorder);
        this._tabActiveHeightIncreasePx = Echo.Sync.Extent.toPixels(this.component.render("tabActiveHeightIncrease", 
                Extras.Sync.TabPane._defaultTabActiveHeightIncrease));
        this._tabInactiveBorder = this.component.render("tabInactiveBorder", 
                Extras.Sync.TabPane._defaultTabInactiveBorder);
        this._tabHeightPx = Echo.Sync.Extent.toPixels(this.component.render("tabHeight",
                Extras.Sync.TabPane._defaultTabHeight));
        this._tabInsetPx = Echo.Sync.Extent.toPixels(this.component.render("tabInset",
                 Extras.Sync.TabPane._defaultTabInset));
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
        this._element = document.createElement("div");
        this._element.id = this.component.renderId;
        this._element.style.cssText = "position:absolute;overflow:hidden;top:" + pixelInsets.top + "px;right:" + pixelInsets.right
                + "px;bottom:" + pixelInsets.bottom + ";left:" + pixelInsets.left + "px;"; 
                        
        // Render Header Container
        var headerContainerDivElement = document.createElement("div");
        headerContainerDivElement.style.cssText = "position:absolute;overflow:hidden;z-index:1;width:100%;"
                + (this._tabPosition == Extras.TabPane.TAB_POSITION_BOTTOM ? "bottom" : "top") + ":0;"
                + "left:" + this._tabInsetPx + "px;right:" + this._tabInsetPx + "px;"
                + "height:" + (this._tabHeightPx + borderSize) + "px;";
        
        Echo.Sync.Font.render(this.component.render("font"), headerContainerDivElement);
        Echo.Sync.FillImage.render(this.component.render("tabBackgroundImage"), headerContainerDivElement);
    
        var headerTableElement = document.createElement("table");
        headerTableElement.style.cssText = "border-width:0;padding:0;";
        headerTableElement.cellPadding = "0px";
        headerTableElement.cellSpacing = "0px";
        
        var headerTbodyElement = document.createElement("tbody");
        headerTableElement.appendChild(headerTbodyElement);
        
        this._headerContainerTrElement = document.createElement("tr");
        headerTbodyElement.appendChild(this._headerContainerTrElement);
        
        headerContainerDivElement.appendChild(headerTableElement);
        
        this._element.appendChild(headerContainerDivElement);
        
        // Render Content Container
        this._contentContainerDivElement = document.createElement("div");
        this._contentContainerDivElement.style.position = "absolute";
        this._contentContainerDivElement.style.overflow = "hidden";
        Echo.Sync.Color.renderFB(this.component, this._contentContainerDivElement);
        
        if (this._tabPosition == Extras.TabPane.TAB_POSITION_BOTTOM) {
            this._contentContainerDivElement.style.top = "0px";
            this._contentContainerDivElement.style.bottom = this._tabHeightPx + "px";
        } else {
            this._contentContainerDivElement.style.top = this._tabHeightPx + "px";
            this._contentContainerDivElement.style.bottom = "0px";
        }
        this._contentContainerDivElement.style.left = "0px";
        this._contentContainerDivElement.style.right = "0px";
        
        if (this._borderType == Extras.TabPane.BORDER_TYPE_NONE) {
            this._contentContainerDivElement.style.border = "0px none";
        } else if (this._borderType == Extras.TabPane.BORDER_TYPE_SURROUND) {
            Echo.Sync.Border.render(this._tabActiveBorder, this._contentContainerDivElement);
        } else if (this._borderType == Extras.TabPane.BORDER_TYPE_PARALLEL_TO_TABS) {
            Echo.Sync.Border.render(this._tabActiveBorder, this._contentContainerDivElement, "borderTop")
            Echo.Sync.Border.render(this._tabActiveBorder, this._contentContainerDivElement, "borderBottom")
        } else if (this._tabPosition == Extras.TabPane.TAB_POSITION_BOTTOM) {
            Echo.Sync.Border.render(this._tabActiveBorder, this._contentContainerDivElement, "borderBottom")
        } else {
            Echo.Sync.Border.render(this._tabActiveBorder, this._contentContainerDivElement, "borderTop")
        }
        
        this._element.appendChild(this._contentContainerDivElement);
        
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
        
        parentElement.appendChild(this._element);
    },
    
    renderDisplay: function() {
        Core.Web.VirtualPosition.redraw(this._element);
        Core.Web.VirtualPosition.redraw(this._contentContainerDivElement);
        
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
        this._element = null;
        this._headerContainerTrElement = null;
        this._contentContainerDivElement = null;
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
            var removedChildren = update.getRemovedChildren();
            if (removedChildren) {
                // Remove children.
                for (var i = 0; i < removedChildren.length; ++i) {
                    var tab = this._getTabById(removedChildren[i].renderId);
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
                    this._selectTab(activeTabUpdate.newValue);
                } else {
                    var activeTabIndexUpdate = update.getUpdatedProperty("activeTabIndex");
                    if (activeTabIndexUpdate && activeTabIndexUpdate.newValue < this.component.children.length) {
                        this._selectTab(this.component.children[activeTabIndexUpdate.newValue].renderId);
                    }
                }
            }
        }
    
        if (fullRender) {
            var element = this._element;
            var containerElement = element.parentNode;
            Echo.Render.renderComponentDispose(update, update.parent);
            containerElement.removeChild(element);
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
        this._headerTdElement = null;
        this._headerContentTableElement = null;
        this._contentDivElement = null;
        this._leftTdElement = null;
        this._centerTdElement = null;
        this._rightTdElement = null;
        this._closeImageTdElement = null;
    },
    
    _addEventListeners: function() {
        Core.Web.Event.add(this._headerTdElement, "click", Core.method(this, this._processClick), false);
        Core.Web.Event.Selection.disable(this._headerTdElement);
        
        if (this._tabCloseEnabled) {
            Core.Web.Event.add(this._headerTdElement, "mouseover", 
                    Core.method(this, this._processEnter), false);
        }
    },
    
    _dispose: function() {
        Core.Web.Event.removeAll(this._headerTdElement);
        
        this._parent = null;
        this._childComponent = null;
        this._headerTdElement = null;
        this._headerContentTableElement = null;
        this._contentDivElement = null;
        this._leftTdElement = null;
        this._centerTdElement = null;
        this._rightTdElement = null;
        this._closeImageTdElement = null;
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
    
    _hasLeftImage: function() {
        return this._getLeftImage(true) != null || this._getLeftImage(false) != null;
    },
    
    _hasRightImage: function() {
        return this._getRightImage(true) != null || this._getRightImage(false) != null;
    },
    
    _highlight: function(state) {
        var headerContentTableElement = this._headerContentTableElement;
        var centerTdElement = this._centerTdElement;
        var contentDivElement = this._contentDivElement;
        
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
        Echo.Sync.Color.renderClear(foreground, headerContentTableElement, "color");
        Echo.Sync.Color.renderClear(background, headerContentTableElement, "backgroundColor");
        headerContentTableElement.style.cursor = state ? "default" : "pointer";
        headerContentTableElement.style.height = this._parent._calculateTabHeight(state) + "px";
        
        var backgroundImage;
        if (state) {
            backgroundImage = this._parent.component.render("tabActiveBackgroundImage");
        } else {
            backgroundImage = this._parent.component.render("tabInactiveBackgroundImage");
        }
        Echo.Sync.FillImage.renderClear(backgroundImage, centerTdElement, null);
        
        var borderSize = Echo.Sync.Border.getPixelSize(this._parent._tabActiveBorder);
        if (this._parent._tabPosition == Extras.TabPane.TAB_POSITION_BOTTOM) {
            headerContentTableElement.style.marginTop = state ? "0px" : borderSize + "px";
            headerContentTableElement.style.marginBottom = state ? "0px" : this._parent._tabActiveHeightIncreasePx + "px";
            Echo.Sync.Border.render(border, headerContentTableElement, "borderBottom");
        } else {
            headerContentTableElement.style.marginBottom = state ? "0px" : borderSize + "px";
            headerContentTableElement.style.marginTop = state ? "0px" : this._parent._tabActiveHeightIncreasePx + "px";
            Echo.Sync.Border.render(border, headerContentTableElement, "borderTop");
        }
        Echo.Sync.Border.render(border, headerContentTableElement, "borderLeft");
        Echo.Sync.Border.render(border, headerContentTableElement, "borderRight");
        
        var font;
        if (state) {
            font = this._parent.component.render("tabActiveFont");
        } else {
            font = this._parent.component.render("tabInactiveFont");
        }
        Echo.Sync.Font.renderClear(font, headerContentTableElement);
    
        if (this._leftTdElement) {
            var leftImage = this._getLeftImage(state); 
            Echo.Sync.FillImage.renderClear(leftImage, this._leftTdElement, null);
            if (leftImage && leftImage.width) {
                this._leftTdElement.style.width = leftImage.width.toString();
            }
        }
        
        if (this._rightTdElement) {
            var rightImage = this._getRightImage(state); 
            Echo.Sync.FillImage.renderClear(rightImage, this._rightTdElement, null);
            if (rightImage && rightImage.width) {
                this._rightTdElement.style.width = rightImage.width.toString();
            }
        }
        
        // show/hide content
        if (Core.Web.Env.BROWSER_MOZILLA && !Core.Web.Env.BROWSER_FIREFOX) {
            contentDivElement.style.right = state ? "0px" : "100%";
            contentDivElement.style.bottom = state ? "0px" : "100%";
        } else {
            contentDivElement.style.display = state ? "block" : "none";
        }
        if (state) {
            // FIXME hack to notify the tab content component that it's size may have changed, this is
            // required because any previous notifications could have taken place when this tab was hidden.
            Echo.Render.renderComponentDisplay(this._childComponent);
        }
    },
    
    _processClick: function(e) {
        if (!this._parent.component.isActive()) {
            return;
        }
        if (this._closeImageTdElement && Core.Web.DOM.isAncestorOf(this._closeImageTdElement, e.target)) {
            // close icon clicked
            if (!this._tabCloseEnabled) {
                return;
            }
            this._parent.component.fireEvent({type: "tabClose", source: this._parent.component, 
                    data: this._childComponent.renderId});
        } else {
            // tab clicked
            this._parent._selectTab(this._childComponent.renderId);
            this._parent._setActiveTabId(this._childComponent.renderId);
            this._parent.component.fireEvent({type: "tabSelect", source: this._parent.component, 
                    data: this._childComponent.renderId});
        }
    },
    
    _processEnter: function(e) {
        if (!this._parent.component.isActive()) {
            return;
        }
        
        var rollover = Core.Web.DOM.isAncestorOf(this._closeImageTdElement, e.target);
        
        this._closeImageTdElement.firstChild.src = Echo.Sync.ImageReference.getUrl(this._getCloseImage(rollover));
    },
    
    _render: function(update) {
        this._headerTdElement = this._renderHeader();
        this._headerContentTableElement = this._headerTdElement.firstChild;
        this._contentDivElement = this._renderContent(update);
        
        this._highlight(this._childComponent.renderId == this._parent._activeTabId);
        this._addEventListeners();
    },
    
    _renderCloseIconElement: function() {
        var imgTdElement = document.createElement("td");
        Echo.Sync.Alignment.render(this._parent.component.render("tabAlignment", 
                Extras.Sync.TabPane._defaultTabAlignment), imgTdElement, true, this._parent.component);
        imgTdElement.style.padding = "0 0 0 " + this._parent.component.render("tabCloseIconTextMargin", 
                Extras.Sync.TabPane._defaultTabCloseIconTextMargin + "px");
        imgTdElement.style.cursor = "pointer";
        var imgElement = document.createElement("img");
        imgElement.src = Echo.Sync.ImageReference.getUrl(this._getCloseImage(false));
        
        if (Core.Web.Env.BROWSER_INTERNET_EXPLORER) {
            // remove auto-calculated width & height, to prevent problems with different image sizes
            imgElement.removeAttribute("width");
            imgElement.removeAttribute("height");
        }
        imgTdElement.appendChild(imgElement);
        return imgTdElement;
    },
    
    _renderContent: function(update) {
        var contentDivElement = document.createElement("div");
        contentDivElement.style.position = "absolute";
        contentDivElement.style.top = "0px";
        // hide content
        if (Core.Web.Env.BROWSER_MOZILLA && !Core.Web.Env.BROWSER_FIREFOX) {
            contentDivElement.style.right = "100%";
            contentDivElement.style.bottom = "100%";
        } else {
            contentDivElement.style.display = "none";
            contentDivElement.style.right = "0px";
            contentDivElement.style.bottom = "0px";
        }
        contentDivElement.style.left = "0px";
        Echo.Sync.Insets.render(this._getContentInsets(), contentDivElement, "padding");
        contentDivElement.style.overflow = "auto";
        
        Echo.Render.renderComponentAdd(update, this._childComponent, contentDivElement);
        
        return contentDivElement;
    },
    
    _renderDisplay: function() {
        Core.Web.VirtualPosition.redraw(this._contentDivElement);
    },

    _renderHeader: function() {
        var layoutData = this._childComponent.render("layoutData");
        
        var headerTdElement = document.createElement("td");
        headerTdElement.style.borderWidth = "0px";
        headerTdElement.style.padding = "0px";
        headerTdElement.vAlign = this._parent._tabPosition == Extras.TabPane.TAB_POSITION_BOTTOM ? "top" : "bottom";
        
        var tabTableElement = document.createElement("table");
        tabTableElement.cellPadding = "0px";
        tabTableElement.cellSpacing = "0px";
        tabTableElement.style.padding = "0px";
        tabTableElement.style.marginRight = this._parent._tabSpacing.toString();
        var width = this._parent.component.render("tabWidth");
        if (width) {
            tabTableElement.style.width = width.toString();
        }
        
        var tabTbodyElement = document.createElement("tbody");
        var tabTrElement = document.createElement("tr");
        
        // left
        if (this._hasLeftImage()) {
            this._leftTdElement = document.createElement("td");
            this._leftTdElement.appendChild(document.createTextNode("\u00a0"));
            tabTrElement.appendChild(this._leftTdElement);
        }
        
        // center
        var centerTdElement = document.createElement("td");
        Echo.Sync.Insets.render(Extras.Sync.TabPane._defaultTabInsets, centerTdElement, "padding");
        
        var icon = layoutData ? layoutData.icon : null;
        var title = layoutData ? (layoutData.title ? layoutData.title : "*") : "*";
        var closeIcon = this._parent._tabCloseEnabled && (this._tabCloseEnabled || this._parent._tabCloseIcons.disabledIcon);
        if (icon || closeIcon) {
            // Render Text and Icon(s)
            var tableElement = document.createElement("table");
            tableElement.style.padding = "0px";
            tableElement.cellPadding = "0px";
            tableElement.cellSpacing = "0px";
            var tbodyElement = document.createElement("tbody");
            var trElement = document.createElement("tr");
            if (icon) {
                trElement.appendChild(this._renderIconElement(icon));
            }
            var textTdElement = document.createElement("td");
            textTdElement.style.whiteSpace = "nowrap";
            Echo.Sync.Alignment.render(this._parent.component.render("tabAlignment", 
                    Extras.Sync.TabPane._defaultTabAlignment), textTdElement, true, this._parent.component);
            textTdElement.appendChild(document.createTextNode(title));
            tableElement.appendChild(tbodyElement);
            tbodyElement.appendChild(trElement);
            trElement.appendChild(textTdElement);
            if (closeIcon) {
                this._closeImageTdElement = this._renderCloseIconElement();
                trElement.appendChild(this._closeImageTdElement);
            }
            centerTdElement.appendChild(tableElement);
        } else {
            // Render Text Only
            centerTdElement.style.whiteSpace = "nowrap";
            Echo.Sync.Alignment.render(this._parent.component.render("tabAlignment", 
                    Extras.Sync.TabPane._defaultTabAlignment), centerTdElement, true, this._parent.component);
            centerTdElement.appendChild(document.createTextNode(title));
        }
        tabTrElement.appendChild(centerTdElement);
        this._centerTdElement = centerTdElement;
    
        // right
        if (this._hasRightImage()) {
            this._rightTdElement = document.createElement("td");
            this._rightTdElement.appendChild(document.createTextNode("\u00a0"));
            tabTrElement.appendChild(this._rightTdElement);
        }
    
        tabTbodyElement.appendChild(tabTrElement);
        tabTableElement.appendChild(tabTbodyElement);
        headerTdElement.appendChild(tabTableElement);
        
        return headerTdElement;
    },
    
    _renderIconElement: function(icon) {
        var imgTdElement = document.createElement("td");
        Echo.Sync.Alignment.render(this._parent.component.render("tabAlignment", 
                Extras.Sync.TabPane._defaultTabAlignment), imgTdElement, true, this._parent.component);
        var imgElement = document.createElement("img");
        imgElement.src = Echo.Sync.ImageReference.getUrl(icon);
        imgElement.style.marginRight = this._parent.component.render("tabIconTextMargin", 
                Extras.Sync.TabPane._defaultTabIconTextMargin + "px");
        imgTdElement.appendChild(imgElement);
        return imgTdElement;
    }
});
