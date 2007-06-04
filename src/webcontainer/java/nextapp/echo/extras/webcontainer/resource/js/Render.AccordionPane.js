// FIXME handle enabled/disabled state

/**
 * Component rendering peer: AccordionPane
 */
ExtrasRender.ComponentSync.AccordionPane = function() {
	this._paneDivElement = null;
	this._activeTabId = null;
	this._tabs = new EchoCore.Collections.List();
	this._rotation = null;
    this._animationEnabled = true;
    this._animationTime = 350;
    this._animationSleepInterval = 1;
};

ExtrasRender.ComponentSync.AccordionPane._paneInsets = new EchoApp.Property.Insets(0);

ExtrasRender.ComponentSync.AccordionPane._defaultTabBackground = new EchoApp.Property.Color("#cfcfcf");
ExtrasRender.ComponentSync.AccordionPane._defaultTabBorder = new EchoApp.Property.Border("1px outset #cfcfcf");
ExtrasRender.ComponentSync.AccordionPane._defaultTabForeground = new EchoApp.Property.Color("#000000");
ExtrasRender.ComponentSync.AccordionPane._defaultTabHeight = new EchoApp.Property.Extent(20);
ExtrasRender.ComponentSync.AccordionPane._defaultTabInsets = new EchoApp.Property.Insets(2, 5);
ExtrasRender.ComponentSync.AccordionPane._defaultTabContentInsets = ExtrasRender.ComponentSync.AccordionPane._paneInsets;

ExtrasRender.ComponentSync.AccordionPane.prototype = new EchoRender.ComponentSync;

ExtrasRender.ComponentSync.AccordionPane.prototype.renderAdd = function(update, parentElement) {
	this._activeTabId = this.component.getProperty("activeTab");
	
    this._paneDivElement = this._render();
    
    var componentCount = this.component.getComponentCount();
    for (var i = 0; i < componentCount; ++i) {
        var child = this.component.getComponent(i);
		var tab = new ExtrasRender.ComponentSync.AccordionPane.Tab(child, this);
	    this._tabs.add(tab);
	    tab._render(update);
	    this._paneDivElement.appendChild(tab._tabDivElement);
	    this._paneDivElement.appendChild(tab._contentDivElement);
    }
    
    this._redrawTabs();
    
    parentElement.appendChild(this._paneDivElement);
};

ExtrasRender.ComponentSync.AccordionPane.prototype.renderUpdate = function(update) {
    // FIXME partial update / lazy rendering
    var element = this._paneDivElement;
    var containerElement = element.parentNode;
    EchoRender.renderComponentDispose(update, update.parent);
    containerElement.removeChild(element);
    this.renderAdd(update, containerElement);
    return true;
};

ExtrasRender.ComponentSync.AccordionPane.prototype.renderDispose = function(update) {
	if (this._rotation) {
		this._rotation._dispose();
	}
	this._activeTabId = null;
	for (var i = 0; i < this._tabs.size(); i++) {
		this._tabs.get(i)._dispose();
	}
	this._tabs = new EchoCore.Collections.List();
	this._paneDivElement.id = "";
	this._paneDivElement = null;
};

ExtrasRender.ComponentSync.AccordionPane.prototype._render = function() {
    var paneDivElement = document.createElement("div");
    paneDivElement.id = this.component.renderId;
    paneDivElement.style.position = "absolute";
    paneDivElement.style.overflow = "hidden";
    paneDivElement.style.width = "100%";
    paneDivElement.style.height = "100%";
    EchoRender.Property.Color.renderFB(this.component, paneDivElement);
    EchoRender.Property.Font.renderDefault(this.component, paneDivElement);
    return paneDivElement;
};

/**
 * Selects a specific tab.
 * 
 * @param tabId {String} the id of the tab to select
 */
ExtrasRender.ComponentSync.AccordionPane.prototype._selectTab = function(tabId) {
    if (tabId == this._activeTabId) {
    	return;
    }
    this.component.setProperty("activeTab", tabId);
    
    var oldTabId = this._activeTabId;
    this._activeTabId = tabId;
    if (oldTabId != null && this._animationEnabled) {
        this._rotateTabs(oldTabId, tabId);
    } else {
        this._redrawTabs();
    }
};

/**
 * Removes a tab from an AccordionPane.
 *
 * @param tab the tab to remove
 */
ExtrasRender.ComponentSync.AccordionPane.prototype._removeTab = function(tab) {
    var tabIndex = this._tabs.indexOf(tab);
    this._tabs.remove(tabIndex);

    tab._tabDivElement.parentNode.removeChild(tab._tabDivElement);
    tab._contentDivElement.parentNode.removeChild(tab._contentDivElement);
	tab._dispose();
};

/**
 * Redraws tabs in the appropriate positions, exposing the content of the 
 * selected tab.
 */
ExtrasRender.ComponentSync.AccordionPane.prototype._redrawTabs = function() {
    if (this._rotation) {
        this._rotation._cancel();
    }
    
    if (this._activeTabId == null || this._getTabById(this._activeTabId) == null) {
		if (this._tabs.size() > 0) {
			this._activeTabId = this._tabs.get(0)._childComponent.renderId;
    	} else {
            this._activeTabId = null;
    	}
    }
	
    var selectionPassed = false;
    var tabHeight = this._calculateTabHeight();
    for (var i = 0; i < this._tabs.size(); ++i) {
        var tab = this._tabs.get(i);
        var tabDivElement = tab._tabDivElement;
        var contentDivElement = tab._contentDivElement;
        
        if (selectionPassed) {
            tabDivElement.style.top = "";
            tabDivElement.style.bottom = (tabHeight * (this._tabs.size() - i - 1)) + "px";
        } else {
            tabDivElement.style.bottom = "";
            tabDivElement.style.top = (tabHeight * i) + "px";
        }

        contentDivElement.style.height = "";
        
        if (this._activeTabId == tab._childComponent.renderId) {
            selectionPassed = true;
            contentDivElement.style.display = "block";
            contentDivElement.style.top = (tabHeight * (i + 1)) + "px";
            var bottomPx = tabHeight * (this._tabs.size() - i - 1);
            contentDivElement.style.bottom = bottomPx + "px";
        } else {
            contentDivElement.style.display = "none";
        }
    }
    
	EchoWebCore.VirtualPosition.redraw();
};

/**
 * "Rotates" the AccordionPane to display the specified tab.
 *
 * @param oldTabId {String} the currently displayed tab id
 * @param newTabId {String} the id of the tab that will be displayed
 */
ExtrasRender.ComponentSync.AccordionPane.prototype._rotateTabs = function(oldTabId, newTabId) {
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
        this._rotation = new ExtrasRender.ComponentSync.AccordionPane.Rotation(this, oldTab, newTab);
    }
};

/**
 * Retrieves the tab instance with the specified tab id.
 * 
 * @param tabId the tab id
 * @return the tab, or null if no tab is present with the specified id
 */
ExtrasRender.ComponentSync.AccordionPane.prototype._getTabById = function(tabId) {
    for (var i = 0; i < this._tabs.size(); ++i) {
        var tab = this._tabs.get(i);
        if (tab._childComponent.renderId == tabId) {
            return tab;
        }
    }
    return null;
};

ExtrasRender.ComponentSync.AccordionPane.prototype._getTabBackground = function() {
	var background = this.component.getRenderProperty("tabBackground");
	return background ? background : ExtrasRender.ComponentSync.AccordionPane._defaultTabBackground;
};

ExtrasRender.ComponentSync.AccordionPane.prototype._getTabBorder = function() {
	var border = this.component.getRenderProperty("tabBorder");
	return border ? border : ExtrasRender.ComponentSync.AccordionPane._defaultTabBorder;
};

ExtrasRender.ComponentSync.AccordionPane.prototype._getTabInsets = function() {
	var insets = this.component.getRenderProperty("tabInsets");
	return insets ? insets : ExtrasRender.ComponentSync.AccordionPane._defaultTabInsets;
};

/**
 * @return the tab height in pixels
 * @type {Number}
 */
ExtrasRender.ComponentSync.AccordionPane.prototype._calculateTabHeight = function() {
	var height = ExtrasRender.ComponentSync.AccordionPane._defaultTabHeight;
	var insets = this._getTabInsets();
	var border = this._getTabBorder();
    return height.value + insets.top.value + insets.bottom.value + (border.size.value * 2);
};

ExtrasRender.ComponentSync.AccordionPane.Tab = function(childComponent, parent) {
	this._childComponent = childComponent;
	this._parent = parent;
	this._rendered = false;
	this._tabDivElement = null;
	this._contentDivElement = null;
};

ExtrasRender.ComponentSync.AccordionPane.Tab.prototype._render = function(update) {
    var tabDivElement = document.createElement("div");
    tabDivElement.id = this._parent.component.renderId + "_tab_" + this._childComponent.renderId;
    tabDivElement.style.cursor = "pointer";
    tabDivElement.style.height = ExtrasRender.ComponentSync.AccordionPane._defaultTabHeight;
    EchoRender.Property.Insets.renderPixel(this._parent._getTabInsets(), tabDivElement, "padding");
    tabDivElement.style.position = "absolute";
    tabDivElement.style.left = "0px";
    tabDivElement.style.right = "0px";
    tabDivElement.style.overflow = "hidden";
    tabDivElement.appendChild(document.createTextNode(this._getTitle()));

    var contentDivElement = document.createElement("div");
    contentDivElement.id = this._parent.component.renderId + "_content_" + this._childComponent.renderId;
    contentDivElement.style.display = "none";
    contentDivElement.style.position = "absolute";
    contentDivElement.style.left = "0px";
    contentDivElement.style.right = "0px";
    EchoRender.Property.Insets.renderPixel(this._getContentInsets(), contentDivElement, "padding");
    contentDivElement.style.overflow = "auto";

    EchoWebCore.VirtualPosition.register(tabDivElement.id);
    EchoWebCore.VirtualPosition.register(contentDivElement.id);
    
	EchoRender.renderComponentAdd(update, this._childComponent, contentDivElement);
	
    this._tabDivElement = tabDivElement;
    this._contentDivElement = contentDivElement;
    
    this._highlight(false);
    this._addEventListeners();
};

ExtrasRender.ComponentSync.AccordionPane.Tab.prototype._dispose = function() {
	EchoWebCore.EventProcessor.removeAll(this._tabDivElement);
	
	this._parent = null;
	this._childComponent = null;
	this._tabDivElement.id = "";
	this._tabDivElement = null;
	this._contentDivElement.id = "";
	this._contentDivElement = null;
};

ExtrasRender.ComponentSync.AccordionPane.Tab.prototype._highlight = function(state) {
    var tabDivElement = this._tabDivElement;
    if (state) {
        var background = this._parent.component.getRenderProperty("tabRolloverBackground");
        if (!background) {
        	background = ExtrasRender.Color.adjustIntensity(this._parent._getTabBackground());
        }
        EchoRender.Property.Color.render(background, tabDivElement, "backgroundColor");
        var backgroundImage = this._parent.component.getRenderProperty("tabRolloverBackgroundImage");
        if (backgroundImage) {
	        tabDivElement.style.backgroundImage = "";
	        tabDivElement.style.backgroundPosition = "";
	        tabDivElement.style.backgroundRepeat = "";
	        EchoRender.Property.FillImage.render(backgroundImage, tabDivElement, null);
        }
        var foreground = this._parent.component.getRenderProperty("tabRolloverForeground");
        if (foreground) {
        	EchoRender.Property.Color.render(foreground, tabDivElement, "color");
        }
        var border = this._parent.component.getRenderProperty("tabRolloverBorder");
        if (!border) {
        	var defaultBorder = this._parent._getTabBorder();
        	border = new EchoApp.Property.Border(defaultBorder.size, defaultBorder.style, ExtrasRender.Color.adjustIntensity(defaultBorder.color));
        }
	    EchoRender.Property.Border.renderSide(border, tabDivElement, "borderTop");
	    EchoRender.Property.Border.renderSide(border, tabDivElement, "borderBottom");
    } else {
	    var border = this._parent._getTabBorder();
	    EchoRender.Property.Border.renderSide(border, tabDivElement, "borderTop");
	    EchoRender.Property.Border.renderSide(border, tabDivElement, "borderBottom");
	    EchoRender.Property.Color.render(this._parent._getTabBackground(), tabDivElement, "backgroundColor");
	    EchoRender.Property.Color.renderComponentProperty(this._parent.component, "tabForeground", ExtrasRender.ComponentSync.AccordionPane._defaultTabForeground, tabDivElement, "color");
        tabDivElement.style.backgroundImage = "";
        tabDivElement.style.backgroundPosition = "";
        tabDivElement.style.backgroundRepeat = "";
	    EchoRender.Property.FillImage.renderComponentProperty(this._parent.component, "tabBackgroundImage", null, tabDivElement);
    }
};

ExtrasRender.ComponentSync.AccordionPane.Tab.prototype._addEventListeners = function() {
    EchoWebCore.EventProcessor.add(this._tabDivElement, "click", new EchoCore.MethodRef(this, this._processClick), false);
    if (this._parent.component.getRenderProperty("tabRolloverEnabled", true)) {
	    EchoWebCore.EventProcessor.add(this._tabDivElement, "mouseover", new EchoCore.MethodRef(this, this._processEnter), false);
	    EchoWebCore.EventProcessor.add(this._tabDivElement, "mouseout", new EchoCore.MethodRef(this, this._processExit), false);
    }
	EchoWebCore.EventProcessor.addSelectionDenialListener(this._tabDivElement);
};

ExtrasRender.ComponentSync.AccordionPane.Tab.prototype._getTitle = function() {
	var layoutData = this._childComponent.getRenderProperty("layoutData");
	return layoutData ? layoutData.getProperty("title") : null;
};

ExtrasRender.ComponentSync.AccordionPane.Tab.prototype._getContentInsets = function() {
	if (this._childComponent.componentType.indexOf("Pane") != -1) {
		// FIXME use instanceof
		return ExtrasRender.ComponentSync.AccordionPane._paneInsets;
	} else {
		var insets = this._parent.component.getRenderProperty("defaultContentInsets");
		return insets ? insets : ExtrasRender.ComponentSync.AccordionPane._defaultTabContentInsets;
	}
};

ExtrasRender.ComponentSync.AccordionPane.Tab.prototype._processClick = function(e) {
    if (!this._parent.component.isActive()) {
        return;
    }
    this._parent._selectTab(this._childComponent.renderId);
    // FIXME notify server
};

ExtrasRender.ComponentSync.AccordionPane.Tab.prototype._processEnter = function(e) {
    if (!this._parent.component.isActive()) {
        return;
    }
    this._highlight(true);
};

ExtrasRender.ComponentSync.AccordionPane.Tab.prototype._processExit = function(e) {
    if (!this._parent.component.isActive()) {
        return;
    }
    this._highlight(false);
};

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
ExtrasRender.ComponentSync.AccordionPane.Rotation = function(parent, oldTab, newTab) {
	this._parent = parent;
    this._oldTab = oldTab;
    this._newTab = newTab;
    
    this._oldTabContentInsets = this._oldTab._getContentInsets();
    this._newTabContentInsets = this._newTab._getContentInsets();
    
    this._animationStartTime = new Date().getTime();
    this._animationEndTime = this._animationStartTime + this._parent._animationTime;
    
    this._tabHeight = this._parent._calculateTabHeight();
    
    this._rotatingTabs = new Array();
    
    this._animationStepIndex = 0;
    
    this._oldTabIndex = this._parent._tabs.indexOf(this._oldTab);
    this._newTabIndex = this._parent._tabs.indexOf(this._newTab);
    this._directionDown = this._newTabIndex < this._oldTabIndex;
    
    if (this._directionDown) {
        // Tabs are sliding down (a tab on the top has been selected).
        for (var i = this._oldTabIndex; i > this._newTabIndex; --i) {
            this._rotatingTabs.push(this._parent._tabs.get(i));
        }
    } else {
        // Tabs are sliding up (a tab on the bottom has been selected).
        for (var i = this._oldTabIndex + 1; i <= this._newTabIndex; ++i) {
            this._rotatingTabs.push(this._parent._tabs.get(i));
        }
    }
    
    this._regionHeight = this._newTab._tabDivElement.parentNode.offsetHeight;
    
    if (this._directionDown) {
        // Numbers of tabs above that will not be moving.
        this._numberOfTabsAbove = this._newTabIndex + 1;
        
        // Number of tabs below that will not be moving.
        this._numberOfTabsBelow = this._parent._tabs.size() - 1 - this._newTabIndex;
        
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
        this._numberOfTabsBelow = this._parent._tabs.size() - 1 - this._newTabIndex;

        // Initial bottom position of bottommost moving tab.
        this._startBottomPosition = this._tabHeight * this._numberOfTabsBelow;

        // Final bottom position of bottommost moving tab.
        this._endBottomPosition = this._regionHeight - this._tabHeight * (this._numberOfTabsAbove + 1);
        
        // Number of pixels across which animation will occur.
        this._animationDistance = this._endBottomPosition - this._startBottomPosition;
    }
    
    this._overflowUpdate();
    this._animationStep();
};

/**
 * Contains mappings from AccordionPane render ids to Rotation objects.
 * 
 * @type {EchoCore.Collections.Map}
 */
ExtrasRender.ComponentSync.AccordionPane.Rotation._idToRotation = new EchoCore.Collections.Map();

/**
 * Renders the next step of the rotation animation.
 * Queues subsequent frame of animation via Window.setTimeout() call to self.
 */
ExtrasRender.ComponentSync.AccordionPane.Rotation.prototype._animationStep = function() {
    var currentTime = new Date().getTime();
    
    if (currentTime < this._animationEndTime) {
        // Number of pixels (from 0) to step current current frame.
        
        var stepFactor = (currentTime - this._animationStartTime) / this._parent._animationTime;
        var stepPosition = Math.round(stepFactor * this._animationDistance);

        if (this._directionDown) {

            // Move each moving tab to next step position.
            for (var i = 0; i < this._rotatingTabs.length; ++i) {
                var newPosition = stepPosition + this._startTopPosition + (this._tabHeight * (this._rotatingTabs.length - i - 1));
                this._rotatingTabs[i]._tabDivElement.style.top = newPosition + "px";
            }
            
            // Adjust height of expanding new tab content to fill expanding space.
            var newContentHeight = stepPosition - this._oldTabContentInsets.top.value - this._oldTabContentInsets.bottom.value;
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
                    - this._oldTabContentInsets.top.value - this._oldTabContentInsets.bottom.value;
            if (oldContentHeight < 0) {
                oldContentHeight = 0;
            }
            this._oldTab._contentDivElement.style.height = oldContentHeight + "px";
        } else {
            // Move each moving tab to next step position.
            for (var i = 0; i < this._rotatingTabs.length; ++i) {
                var newPosition = stepPosition + this._startBottomPosition + (this._tabHeight * (this._rotatingTabs.length - i - 1));
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
                    - this._oldTabContentInsets.top.value - this._oldTabContentInsets.bottom.value;
            if (oldContentHeight < 0) {
                oldContentHeight = 0;
            }
            this._oldTab._contentDivElement.style.height = oldContentHeight + "px";
            
            // Increase height of expanding tab content to fit within expanding space.
            var newContentHeight = stepPosition - this._newTabContentInsets.top.value - this._newTabContentInsets.bottom.value;
            if (newContentHeight < 0) {
                newContentHeight = 0;
            };
            this._newTab._contentDivElement.style.height = newContentHeight + "px";
        }
        
        ++this._animationStepIndex;
    
        // Continue Rotation.
        var renderId = this._parent.component.renderId;
        ExtrasRender.ComponentSync.AccordionPane.Rotation._idToRotation.put(renderId, this);
        window.setTimeout("ExtrasRender.ComponentSync.AccordionPane.Rotation._animationStep(\"" + renderId + "\")", 
                this._parent._animationSleepInterval);
    } else {
        // Complete Rotation.
        this._overflowRestore();
        var parent = this._parent;
        this._dispose();
        parent._redrawTabs();
    }
};

ExtrasRender.ComponentSync.AccordionPane.Rotation.prototype._overflowUpdate = function() {
    if (this._oldTab._contentDivElement.style.overflow) {
        this._oldContentOverflow = this._oldTab._contentDivElement.style.overflow; 
    }
    if (this._newTab._contentDivElement.style.overflow) {
        this._newContentOverflow = this._newTab._contentDivElement.style.overflow; 
    }

    this._oldTab._contentDivElement.style.overflow = "hidden";
    this._newTab._contentDivElement.style.overflow = "hidden";
};

ExtrasRender.ComponentSync.AccordionPane.Rotation.prototype._overflowRestore = function() {
    this._oldTab._contentDivElement.style.overflow = this._oldContentOverflow ? this._oldContentOverflow : ""; 
    this._newTab._contentDivElement.style.overflow = this._newContentOverflow ? this._newContentOverflow : "";
};

/**
 * Static method invoked by window.setTimeout which invokes appropriate Rotation instance method.
 *
 * @param renderId the render id of the Rotation's AccordionPane to step
 */
ExtrasRender.ComponentSync.AccordionPane.Rotation._animationStep = function(renderId) {
    var rotation = ExtrasRender.ComponentSync.AccordionPane.Rotation._idToRotation.get(renderId);
    if (rotation) {
	    rotation._animationStep();
    }
};

ExtrasRender.ComponentSync.AccordionPane.Rotation.prototype._cancel = function() {
	this._overflowRestore();
	this._dispose();
};

ExtrasRender.ComponentSync.AccordionPane.Rotation.prototype._dispose = function() {
	var renderId = this._parent.component.renderId;
	ExtrasRender.ComponentSync.AccordionPane.Rotation._idToRotation.remove(renderId);
	this._parent._rotation = null;
	this._parent = null;
	this._oldTab = null;
	this._newTab = null;
	this._rotatingTabs = null;
};

EchoRender.registerPeer("ExtrasApp.AccordionPane", ExtrasRender.ComponentSync.AccordionPane);
