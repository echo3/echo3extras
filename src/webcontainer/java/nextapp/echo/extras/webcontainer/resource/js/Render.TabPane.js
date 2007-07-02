// FIXME handle enabled/disabled state

/**
 * Component rendering peer: TabPane
 */
ExtrasRender.ComponentSync.TabPane = function() {
	// state
	this._activeTabId = null;
	this._tabs = new EchoCore.Collections.List();
    // elements
    this._element = null;
    this._headerContainerTrElement = null;
    this._contentContainerDivElement = null;
};

ExtrasRender.ComponentSync.TabPane._supportedPartialProperties = new Array("activeTab");

ExtrasRender.ComponentSync.TabPane._paneInsets = new EchoApp.Property.Insets(0);

ExtrasRender.ComponentSync.TabPane._defaultBorderType = ExtrasApp.TabPane.BORDER_TYPE_ADJACENT_TO_TABS;
ExtrasRender.ComponentSync.TabPane._defaultForeground = new EchoApp.Property.Color("#000000");
ExtrasRender.ComponentSync.TabPane._defaultInsets = new EchoApp.Property.Insets(2);
ExtrasRender.ComponentSync.TabPane._defaultTabActiveBorder = new EchoApp.Property.Border("1px solid #00004f");
ExtrasRender.ComponentSync.TabPane._defaultTabActiveHeightIncrease = new EchoApp.Property.Extent(2);
ExtrasRender.ComponentSync.TabPane._defaultTabAlignment = new EchoApp.Property.Alignment(EchoApp.Property.Alignment.DEFAULT, 
        EchoApp.Property.Alignment.TOP);
ExtrasRender.ComponentSync.TabPane._defaultTabCloseIconTextMargin = new EchoApp.Property.Extent(5);
ExtrasRender.ComponentSync.TabPane._defaultTabContentInsets = ExtrasRender.ComponentSync.TabPane._paneInsets;
ExtrasRender.ComponentSync.TabPane._defaultTabHeight = new EchoApp.Property.Extent(32);
ExtrasRender.ComponentSync.TabPane._defaultTabIconTextMargin = new EchoApp.Property.Extent(5);
ExtrasRender.ComponentSync.TabPane._defaultTabInactiveBorder = new EchoApp.Property.Border("1px solid #7f7f7f");
ExtrasRender.ComponentSync.TabPane._defaultTabInset = new EchoApp.Property.Extent(10);
ExtrasRender.ComponentSync.TabPane._defaultTabInsets = new EchoApp.Property.Insets(3, 8);
ExtrasRender.ComponentSync.TabPane._defaultTabPosition = ExtrasApp.TabPane.TAB_POSITION_TOP;
ExtrasRender.ComponentSync.TabPane._defaultTabSpacing = new EchoApp.Property.Extent(0);

ExtrasRender.ComponentSync.TabPane.prototype = new EchoRender.ComponentSync;

/**
 * Closes a specific tab.
 * 
 * @param tabId {String} the id of the tab to close
 */
ExtrasRender.ComponentSync.TabPane.prototype._closeTab = function(tabId) {
    if (tabId == this._activeTabId) {
        this._activeTabId = null;
    }
    this._removeTab(this._getTabById(tabId));
    
    if (!this._activeTabId && this._tabs.size() > 0) {
        this._selectTab(this._tabs.get(this._tabs.size() - 1)._childComponent.renderId);
    }
};

/**
 * Removes a specific tab.
 *
 * @param tab the tab to remove
 */
ExtrasRender.ComponentSync.TabPane.prototype._removeTab = function(tab) {
    var tabIndex = this._tabs.indexOf(tab);
    if (tabIndex == -1) {
        return;
    }
    this._tabs.remove(tabIndex);

    tab._headerTdElement.parentNode.removeChild(tab._headerTdElement);
    tab._contentDivElement.parentNode.removeChild(tab._contentDivElement);
    tab._dispose();
};

ExtrasRender.ComponentSync.TabPane.prototype._render = function() {
    this._borderType = this.component.getRenderProperty("borderType", ExtrasRender.ComponentSync.TabPane._defaultBorderType);
    this._insets = this.component.getRenderProperty("insets", ExtrasRender.ComponentSync.TabPane._defaultInsets);
    this._tabActiveBorder = this.component.getRenderProperty("tabActiveBorder", 
            ExtrasRender.ComponentSync.TabPane._defaultTabActiveBorder);
    this._tabActiveHeightIncrease = this.component.getRenderProperty("tabActiveHeightIncrease", 
            ExtrasRender.ComponentSync.TabPane._defaultTabActiveHeightIncrease);
    this._tabInactiveBorder = this.component.getRenderProperty("tabInactiveBorder", 
            ExtrasRender.ComponentSync.TabPane._defaultTabInactiveBorder);
    this._tabHeight = this.component.getRenderProperty("tabHeight", ExtrasRender.ComponentSync.TabPane._defaultTabHeight);
    this._tabInset = this.component.getRenderProperty("tabInset", ExtrasRender.ComponentSync.TabPane._defaultTabInset);
    this._tabPosition = this.component.getRenderProperty("tabPosition", ExtrasRender.ComponentSync.TabPane._defaultTabPosition);
    this._tabSpacing = this.component.getRenderProperty("tabSpacing", ExtrasRender.ComponentSync.TabPane._defaultTabSpacing);
    this._tabCloseEnabled = this.component.getRenderProperty("tabCloseEnabled", false);

    var tabPaneDivElement = document.createElement("div");
    tabPaneDivElement.id = this.component.renderId;
    tabPaneDivElement.style.position = "absolute";
    tabPaneDivElement.style.overflow = "hidden";

    this._renderBorderInsets(tabPaneDivElement);
    
    tabPaneDivElement.appendChild(this._renderHeaderContainer());
    tabPaneDivElement.appendChild(this._renderContentContainer());
    
    return tabPaneDivElement;
};

ExtrasRender.ComponentSync.TabPane.prototype.renderAdd = function(update, parentElement) {
	this._activeTabId = this.component.getProperty("activeTab");
    this._element = this._render();
    
    this._headerContainerTrElement = this._element.childNodes[0].firstChild.rows[0];
    this._contentContainerDivElement = this._element.childNodes[1];
    
    var activeTabFound = false;
    var componentCount = this.component.getComponentCount();
    for (var i = 0; i < componentCount; ++i) {
        var child = this.component.getComponent(i);
		if (this._activeTabId == child.renderId) {
			activeTabFound = true;
		}
		var tab = new ExtrasRender.ComponentSync.TabPane.Tab(child, this);
	    this._tabs.add(tab);
	    tab._render(update);
	    this._headerContainerTrElement.appendChild(tab._headerTdElement);
	    this._contentContainerDivElement.appendChild(tab._contentDivElement);
    }
    
	if (!activeTabFound) {
		this._activeTabId = null;
		if (componentCount > 0) {
			this._selectTab(this.component.getComponent(0).renderId);
			this.component.setProperty("activeTab", this._activeTabId);
		}
	}
	
    parentElement.appendChild(this._element);
};

ExtrasRender.ComponentSync.TabPane.prototype._renderBorderInsets = function(tabPaneDivElement) {
    var borderInsets;
    if (this._borderType == ExtrasApp.TabPane.BORDER_TYPE_SURROUND) {
        borderInsets = this._insets;
    } else if (this._borderType == ExtrasApp.TabPane.BORDER_TYPE_PARALLEL_TO_TABS) {
        borderInsets = new EchoApp.Property.Insets(this._insets.top, 0, this._insets.bottom, 0);
    } else if (this._tabPosition == ExtrasApp.TabPane.TAB_POSITION_BOTTOM) {
        borderInsets = new EchoApp.Property.Insets(0, 0, this._insets.bottom, 0);
    } else {
        borderInsets = new EchoApp.Property.Insets(this._insets.top, 0, 0, 0);
    }
    tabPaneDivElement.style.top = borderInsets.top.toString();
    tabPaneDivElement.style.right = borderInsets.right.toString();
    tabPaneDivElement.style.bottom = borderInsets.bottom.toString();
    tabPaneDivElement.style.left = borderInsets.left.toString();
};

ExtrasRender.ComponentSync.TabPane.prototype._renderContentContainer = function() {
    var contentContainerDivElement = document.createElement("div");
    contentContainerDivElement.id = this.component.renderId + "_content";
    contentContainerDivElement.style.position = "absolute";
    contentContainerDivElement.style.overflow = "hidden";
    EchoRender.Property.Color.renderFB(this.component, contentContainerDivElement);
    
    if (this._tabPosition == ExtrasApp.TabPane.TAB_POSITION_BOTTOM) {
        contentContainerDivElement.style.top = "0px";
        contentContainerDivElement.style.bottom = this._tabHeight.toString();
    } else {
        contentContainerDivElement.style.top = this._tabHeight.toString();
        contentContainerDivElement.style.bottom = "0px";
    }
    contentContainerDivElement.style.left = "0px";
    contentContainerDivElement.style.right = "0px";
    
    if (this._borderType == ExtrasApp.TabPane.BORDER_TYPE_NONE) {
        contentContainerDivElement.style.border = "0px none";
    } else if (this._borderType == ExtrasApp.TabPane.BORDER_TYPE_SURROUND) {
        EchoRender.Property.Border.render(this._tabActiveBorder, contentContainerDivElement);
    } else if (this._borderType == ExtrasApp.TabPane.BORDER_TYPE_PARALLEL_TO_TABS) {
        EchoRender.Property.Border.renderSide(this._tabActiveBorder, contentContainerDivElement, "borderTop")
        EchoRender.Property.Border.renderSide(this._tabActiveBorder, contentContainerDivElement, "borderBottom")
    } else if (this._tabPosition == ExtrasApp.TabPane.TAB_POSITION_BOTTOM) {
        EchoRender.Property.Border.renderSide(this._tabActiveBorder, contentContainerDivElement, "borderBottom")
    } else {
        EchoRender.Property.Border.renderSide(this._tabActiveBorder, contentContainerDivElement, "borderTop")
    }
    
//    EchoWebCore.VirtualPosition.register(contentContainerDivElement);
    
    return contentContainerDivElement;
};


ExtrasRender.ComponentSync.TabPane.prototype.renderDispose = function(update) {
    this._activeTabId = null;
    for (var i = 0; i < this._tabs.size(); i++) {
        this._tabs.get(i)._dispose();
    }
    this._tabs = new EchoCore.Collections.List();
    this._element = null;
    this._headerContainerTrElement = null;
    this._contentContainerDivElement = null;
};

ExtrasRender.ComponentSync.TabPane.prototype._renderHeaderContainer = function() {
    var headerContainerDivElement = document.createElement("div");
    headerContainerDivElement.id = this.component.renderId + "_header";
    headerContainerDivElement.style.overflow = "hidden";
    headerContainerDivElement.style.zIndex = 1;
    headerContainerDivElement.style.position = "absolute";
    headerContainerDivElement.style.width = "100%";
    if (this._tabPosition == ExtrasApp.TabPane.TAB_POSITION_BOTTOM) {
        headerContainerDivElement.style.bottom = "0px";
    } else {
        headerContainerDivElement.style.top = "0px";
    }
    headerContainerDivElement.style.left = this._tabInset.toString();
    headerContainerDivElement.style.right = this._tabInset.toString();
    headerContainerDivElement.style.height = (this._tabHeight.value + this._tabActiveBorder.size.value) + "px";
    EchoRender.Property.Font.renderDefault(this.component, headerContainerDivElement);
    EchoRender.Property.FillImage.renderComponentProperty(this.component, "tabBackgroundImage", 
            null, headerContainerDivElement);

    var headerTableElement = document.createElement("table");
    headerTableElement.style.borderWidth = "0px";
    headerTableElement.style.borderCollapse = "collapse";
    headerTableElement.style.padding = "0px";
    
    var headerTbodyElement = document.createElement("tbody");
    headerTableElement.appendChild(headerTbodyElement);
    
    var headerTrElement = document.createElement("tr");
    headerTrElement.id = this.component.renderId + "_header_tr";
    headerTbodyElement.appendChild(headerTrElement);
    
    headerContainerDivElement.appendChild(headerTableElement);
    
    return headerContainerDivElement;
};

ExtrasRender.ComponentSync.TabPane.prototype.renderSizeUpdate = function() {
    EchoWebCore.VirtualPosition.redraw(this._element);
    EchoWebCore.VirtualPosition.redraw(this._contentContainerDivElement);
    if (this._activeTabId) {
	    var tab = this._getTabById(this._activeTabId);
    	tab._renderSizeUpdate();
    }
};

ExtrasRender.ComponentSync.TabPane.prototype.renderUpdate = function(update) {
	if (!update.hasUpdatedLayoutDataChildren() && !update.getAddedChildren() && !update.getRemovedChildren()) {
		if (EchoCore.Arrays.containsAll(ExtrasRender.ComponentSync.TabPane._supportedPartialProperties, update.getUpdatedPropertyNames(), true)) {
		    // partial update
			var activeTabUpdate = update.getUpdatedProperty("activeTab");
			if (activeTabUpdate) {
				this._selectTab(activeTabUpdate.newValue);
			}
		    return false;
		}
	}
    // FIXME partial update / lazy rendering
    var element = this._element;
    var containerElement = element.parentNode;
    EchoRender.renderComponentDispose(update, update.parent);
    containerElement.removeChild(element);
    this.renderAdd(update, containerElement);
    return true;
};

/**
 * Selects a specific tab.
 * 
 * @param tabId {String} the id of the tab to select
 */
ExtrasRender.ComponentSync.TabPane.prototype._selectTab = function(tabId) {
    if (tabId == this._activeTabId) {
    	return;
    }
    if (this._activeTabId) {
    	this._getTabById(this._activeTabId)._highlight(false);
    }
    
    this._activeTabId = tabId;
   	
   	this._getTabById(this._activeTabId)._highlight(true);
   	
    EchoRender.notifyResize(this.component);
};

/**
 * Retrieves the tab instance with the specified tab id.
 * 
 * @param tabId the tab id
 * @return the tab, or null if no tab is present with the specified id
 */
ExtrasRender.ComponentSync.TabPane.prototype._getTabById = function(tabId) {
    for (var i = 0; i < this._tabs.size(); ++i) {
        var tab = this._tabs.get(i);
        if (tab._childComponent.renderId == tabId) {
            return tab;
        }
    }
    return null;
};

/**
 * @param state {Boolean} whether the tab is active or inactive
 * @return the tab height in pixels
 * @type {Number}
 */
ExtrasRender.ComponentSync.TabPane.prototype._calculateTabHeight = function(state) {
	var height = this._tabHeight;
	if (state) {
		return height.value + this._tabActiveBorder.size.value;
	} else {
		return height.value - this._tabActiveHeightIncrease.value;
	}
};

ExtrasRender.ComponentSync.TabPane.Tab = function(childComponent, parent) {
	// state
	this._childComponent = childComponent;
	this._parent = parent;
	this._rendered = false;
	// elements
	this._headerTdElement = null;
	this._headerContentTableElement = null;
	this._contentDivElement = null;
	this._leftTdElement = null;
	this._centerTdElement = null;
	this._rightTdElement = null;
	this._closeImageTdElement = null;
};

ExtrasRender.ComponentSync.TabPane.Tab.prototype._render = function(update) {
	this._headerTdElement = this._renderHeaderContainer();
	this._headerContentTableElement = this._headerTdElement.firstChild;
	this._contentDivElement = this._renderContentContainer(update);
	
    this._highlight(this._childComponent.renderId == this._parent._activeTabId);
    this._addEventListeners();
};

ExtrasRender.ComponentSync.TabPane.Tab.prototype._renderHeaderContainer = function() {
	var layoutData = this._childComponent.getRenderProperty("layoutData");
	
	var headerTdElement = document.createElement("td");
    headerTdElement.id = this._parent.component.renderId + "_header_td_" + this._childComponent.renderId;
    headerTdElement.style.borderWidth = "0px";
    headerTdElement.style.padding = "0px";
	
    var headerTableElement = document.createElement("table");
   	headerTableElement.style.padding = "0px";
   	headerTableElement.cellPadding = "0px";
   	headerTableElement.cellSpacing = "0px";
    headerTableElement.style.marginRight = this._parent._tabSpacing.toString();
    var width = this._parent.component.getRenderProperty("tabWidth");
    if (width) {
	   	headerTableElement.style.width = width.toString();
    }
    
    var headerTbodyElement = document.createElement("tbody");
    var headerTrElement = document.createElement("tr");
    
   	// left
	if (this._hasLeftImage()) {
   		this._leftTdElement = document.createElement("td");
   		this._leftTdElement.id = this._parent.component.renderId + "_header_td_" + this._childComponent.renderId + "_left";
	    this._leftTdElement.appendChild(document.createTextNode("\u00a0"));
	    headerTrElement.appendChild(this._leftTdElement);
	}
	
	// center
	var centerTdElement = document.createElement("td");
	EchoRender.Property.Insets.renderPixel(ExtrasRender.ComponentSync.TabPane._defaultTabInsets, centerTdElement, "padding");
	
	var icon = layoutData ? layoutData.getProperty("icon") : null;
	var title = layoutData ? layoutData.getProperty("title", "*") : "*";
	if (icon || this._parent._tabCloseEnabled) {
	    // Render Text and Icon(s)
    	var tableElement = document.createElement("table");
    	tableElement.style.height = "100%";
	   	tableElement.cellPadding = "0px";
	   	tableElement.cellSpacing = "0px";
    	tableElement.style.padding = "0px";
    	tableElement.style.borderCollapse = "collapse";
    	var tbodyElement = document.createElement("tbody");
    	var trElement = document.createElement("tr");
    	if (icon) {
	    	trElement.appendChild(this._renderIconElement(icon));
	    }
    	var textTdElement = document.createElement("td");
    	textTdElement.style.whiteSpace = "nowrap";
		EchoRender.Property.Alignment.renderComponentProperty(this._parent.component, "tabAlignment", 
                ExtrasRender.ComponentSync.TabPane._defaultTabAlignment, textTdElement, true, this._parent.component);
	    textTdElement.appendChild(document.createTextNode(title));
    	tableElement.appendChild(tbodyElement);
    	tbodyElement.appendChild(trElement);
    	trElement.appendChild(textTdElement);
    	if (this._hasCloseImage()) {
	    	this._closeImageTdElement = this._renderCloseIconElement();
	    	trElement.appendChild(this._closeImageTdElement);
	    }
    	centerTdElement.appendChild(tableElement);
	} else {
        // Render Text Only
	    centerTdElement.style.whiteSpace = "nowrap";
		EchoRender.Property.Alignment.renderComponentProperty(this._parent.component, "tabAlignment", 
                ExtrasRender.ComponentSync.TabPane._defaultTabAlignment, centerTdElement, true, this._parent.component);
		centerTdElement.appendChild(document.createTextNode(title));
	}
	headerTrElement.appendChild(centerTdElement);
	this._centerTdElement = centerTdElement;

	// right
	if (this._hasRightImage()) {
   		this._rightTdElement = document.createElement("td");
   		this._rightTdElement.id = this._parent.component.renderId + "_header_td_" + this._childComponent.renderId + "_right";
	    this._rightTdElement.appendChild(document.createTextNode("\u00a0"));
	    headerTrElement.appendChild(this._rightTdElement);
	}

    headerTbodyElement.appendChild(headerTrElement);
    headerTableElement.appendChild(headerTbodyElement);
	headerTdElement.appendChild(headerTableElement);
	
	return headerTdElement;
};

ExtrasRender.ComponentSync.TabPane.Tab.prototype._renderIconElement = function(icon) {
	var imgTdElement = document.createElement("td");
	EchoRender.Property.Alignment.renderComponentProperty(this._parent.component, "tabAlignment", 
            ExtrasRender.ComponentSync.TabPane._defaultTabAlignment, imgTdElement, true, this._parent.component);
	var imgElement = document.createElement("img");
	imgElement.src = icon.url;
	imgElement.style.marginRight = this._parent.component.getRenderProperty("tabIconTextMargin", 
            ExtrasRender.ComponentSync.TabPane._defaultTabIconTextMargin);
	imgTdElement.appendChild(imgElement);
	return imgTdElement;
};

ExtrasRender.ComponentSync.TabPane.Tab.prototype._renderCloseIconElement = function() {
    var imgTdElement = document.createElement("td");
	EchoRender.Property.Alignment.renderComponentProperty(this._parent.component, "tabAlignment", 
            ExtrasRender.ComponentSync.TabPane._defaultTabAlignment, imgTdElement, true, this._parent.component);
	imgTdElement.style.paddingLeft = this._parent.component.getRenderProperty("tabCloseIconTextMargin", 
            ExtrasRender.ComponentSync.TabPane._defaultTabCloseIconTextMargin);
	imgTdElement.style.paddingTop = "0px";
	imgTdElement.style.paddingRight = "0px";
	imgTdElement.style.paddingBottom = "0px";
	imgTdElement.style.cursor = "pointer";
	var imgElement = document.createElement("img");
	imgElement.style.visibility = "hidden";
	var closeImage = this._getCloseImage(false);
	if (!closeImage) {
		closeImage = this._getCloseImage(true);
	}
	if (closeImage) {
		imgElement.src = closeImage.url;
	} else {
		imgElement.src = EchoRender.Util.TRANSPARENT_IMAGE;
	}
	if (EchoWebCore.Environment.BROWSER_INTERNET_EXPLORER) {
    	// remove auto-calculated width & height, to prevent problems with different image sizes
	    imgElement.removeAttribute("width");
	    imgElement.removeAttribute("height");
	}
	imgTdElement.appendChild(imgElement);
	return imgTdElement;
};

ExtrasRender.ComponentSync.TabPane.Tab.prototype._renderContentContainer = function(update) {
    var contentDivElement = document.createElement("div");
    contentDivElement.id = this._parent.component.renderId + "_content_" + this._childComponent.renderId;
    contentDivElement.style.position = "absolute";
    contentDivElement.style.top = "0px";
	// hide content
	if (EchoWebCore.Environment.BROWSER_MOZILLA && !EchoWebCore.Environment.BROWSER_FIREFOX) {
		contentDivElement.style.right = "100%";
		contentDivElement.style.bottom = "100%";
	} else {
	    contentDivElement.style.display = "none";
	    contentDivElement.style.right = "0px";
    	contentDivElement.style.bottom = "0px";
	}
    contentDivElement.style.left = "0px";
    EchoRender.Property.Insets.renderPixel(this._getContentInsets(), contentDivElement, "padding");
    contentDivElement.style.overflow = "auto";
	
//    EchoWebCore.VirtualPosition.register(contentDivElement);
	
	EchoRender.renderComponentAdd(update, this._childComponent, contentDivElement);
	
	return contentDivElement;
};

ExtrasRender.ComponentSync.TabPane.Tab.prototype._renderSizeUpdate = function() {
    EchoWebCore.VirtualPosition.redraw(this._contentDivElement);
};

ExtrasRender.ComponentSync.TabPane.Tab.prototype._dispose = function() {
	EchoWebCore.EventProcessor.removeAll(this._headerTdElement);
	
	this._parent = null;
	this._childComponent = null;
	this._headerTdElement = null;
	this._headerContentTableElement = null;
	this._contentDivElement = null;
	this._leftTdElement = null;
	this._centerTdElement = null;
	this._rightTdElement = null;
	this._closeImageTdElement = null;
};

ExtrasRender.ComponentSync.TabPane.Tab.prototype._highlight = function(state) {
	var headerContentTableElement = this._headerContentTableElement;
	var centerTdElement = this._centerTdElement;
    var contentDivElement = this._contentDivElement;
    
    var foreground;
    var background;
    var border;
    if (state) {
        foreground = this._parent.component.getRenderProperty("tabActiveForeground");
        background = this._parent.component.getRenderProperty("tabActiveBackground");
        border = this._parent._tabActiveBorder;
    } else {
    	foreground = this._parent.component.getRenderProperty("tabInactiveForeground");
    	background = this._parent.component.getRenderProperty("tabInactiveBackground");
    	border = this._parent._tabInactiveBorder;
    }
    EchoRender.Property.Color.renderClear(foreground, headerContentTableElement, "color");
    EchoRender.Property.Color.renderClear(background, headerContentTableElement, "backgroundColor");
    headerContentTableElement.style.cursor = state ? "default" : "pointer";
	headerContentTableElement.style.height = this._parent._calculateTabHeight(state) + "px";
    
    var backgroundImage;
    if (state) {
	    backgroundImage = this._parent.component.getRenderProperty("tabActiveBackgroundImage");
    } else {
	    backgroundImage = this._parent.component.getRenderProperty("tabInactiveBackgroundImage");
    }
    EchoRender.Property.FillImage.renderClear(backgroundImage, centerTdElement, null);
    
    if (this._parent._tabPosition == ExtrasApp.TabPane.TAB_POSITION_BOTTOM) {
        headerContentTableElement.style.marginTop = state ? "0px" : this._parent._tabActiveBorder.size.toString();
        headerContentTableElement.style.marginBottom = state ? "0px" : this._parent._tabActiveHeightIncrease.toString();
        EchoRender.Property.Border.renderSide(border, headerContentTableElement, "borderBottom");
    } else {
        headerContentTableElement.style.marginTop = state ? "0px" : this._parent._tabActiveHeightIncrease.toString();
        EchoRender.Property.Border.renderSide(border, headerContentTableElement, "borderTop");
    }
    EchoRender.Property.Border.renderSide(border, headerContentTableElement, "borderLeft");
    EchoRender.Property.Border.renderSide(border, headerContentTableElement, "borderRight");
    
    var font;
    if (state) {
    	font = this._parent.component.getRenderProperty("tabActiveFont");
    } else {
    	font = this._parent.component.getRenderProperty("tabInactiveFont");
    }
	EchoRender.Property.Font.renderClear(font, headerContentTableElement);

    if (this._leftTdElement) {
        var leftImage = this._getLeftImage(state); 
        EchoRender.Property.FillImage.renderClear(leftImage, this._leftTdElement, null);
		if (leftImage && leftImage.width) {
            this._leftTdElement.style.width = leftImage.width.toString();
		}
    }
    
    if (this._rightTdElement) {
        var rightImage = this._getRightImage(state); 
        EchoRender.Property.FillImage.renderClear(rightImage, this._rightTdElement, null);
		if (rightImage && rightImage.width) {
            this._rightTdElement.style.width = rightImage.width.toString();
		}
    }
	
	// show/hide content
	if (EchoWebCore.Environment.BROWSER_MOZILLA && !EchoWebCore.Environment.BROWSER_FIREFOX) {
		contentDivElement.style.right = state ? "0px" : "100%";
		contentDivElement.style.bottom = state ? "0px" : "100%";
	} else {
	    contentDivElement.style.display = state ? "block" : "none";
	}
};

ExtrasRender.ComponentSync.TabPane.Tab.prototype._addEventListeners = function() {
    EchoWebCore.EventProcessor.add(this._headerTdElement, "click", new EchoCore.MethodRef(this, this._processClick), false);
	EchoWebCore.EventProcessor.addSelectionDenialListener(this._headerTdElement);
	
    if (this._closeImageTdElement) {
	    EchoWebCore.EventProcessor.add(this._headerTdElement, "mouseover", 
                new EchoCore.MethodRef(this, this._processEnter), false);
	    EchoWebCore.EventProcessor.add(this._headerTdElement, "mouseout", 
                new EchoCore.MethodRef(this, this._processExit), false);
    }
};

ExtrasRender.ComponentSync.TabPane.Tab.prototype._hasLeftImage = function() {
	return this._getLeftImage(true) != null || this._getLeftImage(false) != null;
};

ExtrasRender.ComponentSync.TabPane.Tab.prototype._isTabCloseEnabled = function() {
	var layoutData = this._childComponent.getRenderProperty("layoutData");
	return layoutData ? layoutData.getProperty("closeEnabled", false) : false;
};

ExtrasRender.ComponentSync.TabPane.Tab.prototype._getLeftImage = function(state) {
	var propertyName = state ? "tabActiveLeftImage" : "tabInactiveLeftImage";
	var image = this._parent.component.getRenderProperty(propertyName);
	if (!image) {
		return;
	}
	var horOffset = new EchoApp.Property.Extent(0);
	var verOffset = new EchoApp.Property.Extent(0);
	return new EchoApp.Property.FillImage(image, EchoApp.Property.FillImage.NO_REPEAT, horOffset, verOffset);
};

ExtrasRender.ComponentSync.TabPane.Tab.prototype._hasRightImage = function() {
	return this._getRightImage(true) != null || this._getRightImage(false) != null;
};

ExtrasRender.ComponentSync.TabPane.Tab.prototype._getRightImage = function(state) {
	var propertyName = state ? "tabActiveRightImage" : "tabInactiveRightImage";
	var image = this._parent.component.getRenderProperty(propertyName);
	if (!image) {
		return;
	}
	var horOffset = new EchoApp.Property.Extent("100%");
	var verOffset = new EchoApp.Property.Extent(0);
	return new EchoApp.Property.FillImage(image, EchoApp.Property.FillImage.NO_REPEAT, horOffset, verOffset);
};

ExtrasRender.ComponentSync.TabPane.Tab.prototype._hasCloseImage = function() {
	if (!this._parent._tabCloseEnabled) {
		return false;
	}
	if (this._parent.component.getRenderProperty("tabCloseIcon")) {
		return true;
	}
	if (this._parent.component.getRenderProperty("tabDisabledCloseIcon")) {
		return true;
	}
	if (this._parent.component.getRenderProperty("tabCloseIconRolloverEnabled")) {
		return this._parent.component.getRenderProperty("tabRolloverCloseIcon") != null;
	}
	return false;
};

ExtrasRender.ComponentSync.TabPane.Tab.prototype._getCloseImage = function(rollover) {
	if (this._isTabCloseEnabled()) {
		if (rollover && this._parent.component.getRenderProperty("tabCloseIconRolloverEnabled")) {
			var image = this._parent.component.getRenderProperty("tabRolloverCloseIcon");
			if (image) {
				return image;
			}
		}
		return this._parent.component.getRenderProperty("tabCloseIcon");
	} else {
		return this._parent.component.getRenderProperty("tabDisabledCloseIcon");
	}
};

ExtrasRender.ComponentSync.TabPane.Tab.prototype._getContentInsets = function() {
	if (this._childComponent.componentType.indexOf("Pane") != -1) {
		// FIXME use instanceof
		return ExtrasRender.ComponentSync.TabPane._paneInsets;
	} else {
		return this._parent.component.getRenderProperty("defaultContentInsets", 
                ExtrasRender.ComponentSync.TabPane._defaultTabContentInsets);
	}
};

ExtrasRender.ComponentSync.TabPane.Tab.prototype._processClick = function(e) {
    if (!this._parent.component.isActive()) {
        return;
    }
    if (this._closeImageTdElement && EchoWebCore.DOM.isAncestorOf(this._closeImageTdElement, e.target)) {
    	// close icon clicked
    	if (!this._isTabCloseEnabled()) {
    		return;
    	}
	    this._parent.component.fireEvent(new EchoCore.Event(this._parent.component, 
                "tabClose", this._childComponent.renderId));
    } else {
    	// tab clicked
	    this._parent._selectTab(this._childComponent.renderId);
	    this._parent.component.setProperty("activeTab", this._childComponent.renderId);
	    this._parent.component.fireEvent(new EchoCore.Event(this._parent.component, 
                "tabSelect", this._childComponent.renderId));
    }
};

ExtrasRender.ComponentSync.TabPane.Tab.prototype._processEnter = function(e) {
    if (!this._parent.component.isActive()) {
        return;
    }
    
	var rollover = EchoWebCore.DOM.isAncestorOf(this._closeImageTdElement, e.target);
	var closeImage = this._getCloseImage(rollover);
	
	if (closeImage) {
		this._closeImageTdElement.firstChild.src = closeImage.url;
	   	this._closeImageTdElement.firstChild.style.visibility = "visible";
	} else {
	   	this._closeImageTdElement.firstChild.src = EchoRender.Util.TRANSPARENT_IMAGE;
	   	this._closeImageTdElement.firstChild.style.visibility = "hidden";
	}
};

ExtrasRender.ComponentSync.TabPane.Tab.prototype._processExit = function(e) {
    if (!this._parent.component.isActive()) {
        return;
    }

    var relTarget = EchoWebCore.DOM.getEventRelatedTarget(e);
    if (relTarget && EchoWebCore.DOM.isAncestorOf(this._headerTdElement, relTarget)) {
    	// within tab box
    	return;
    }
   	
   	this._closeImageTdElement.firstChild.style.visibility = "hidden";
};

EchoRender.registerPeer("ExtrasApp.TabPane", ExtrasRender.ComponentSync.TabPane);
