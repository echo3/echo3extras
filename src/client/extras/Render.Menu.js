/**
 * Abstract base class for menu rendering peers.
 */
ExtrasRender.ComponentSync.Menu = Core.extend(EchoRender.ComponentSync, {
    
    $static: {
        _defaultForeground: "#000000",
        _defaultBackground: "#cfcfcf",
        _defaultDisabledForeground: "#7f7f7f",
        _defaultSelectionForeground: "#ffffff",
        _defaultSelectionBackground: "#3f3f3f",
        _defaultBorder: "1px outset #cfcfcf",
        MAX_Z_INDEX: 65535
    }, 
    
    menuModel: null,
    stateModel: null,
    element: null,
    active: false,

    /**
     * Array containing RenderedState objects for open menus.
     */
    _openMenuPath: null,
    
    /**
     * Flag indicating whether menu mask is deployed.
     */
    _maskDeployed: false,
    
    _processMaskClickRef: null,
    
    $construct: function() {
        this._processMaskClickRef = Core.method(this, this._processMaskClick);
        this._openMenuPath = [];
    },

    $abstract: {
    
        /**
         * Returns an object containing 'x' and 'y' properties indicating the position at 
         * which a submenu should be placed.
         */
        getSubMenuPosition: function(menuModel, width, height) { },

        renderMain: function(update) { }
    },
    
    $virtual: {

        activate: function() {
            if (this.active) {
                return false;
            }
            this.active = true;
            this.addMask();
            return true;
        },

        activateItem: function(itemModel) {
            if (this.stateModel && !this.stateModel.isEnabled(itemModel.modelId)) {
                return;
            }
            if (itemModel instanceof ExtrasApp.OptionModel) {
                this.deactivate();
                this.processAction(itemModel);
            } else if (itemModel instanceof ExtrasApp.MenuModel) {
                this._openMenu(itemModel);
            }
        },
        
        processAction: function(itemModel) {
            var path = itemModel.getItemPositionPath().join(".");
            this.component.fireEvent({type: "action", source: this.component, data: path, modelId: itemModel.modelId});
        }
    },

    addMenu: function(menu) {
        this._openMenuPath.push(menu);
    },
    
    addMask: function() {
        if (this.maskDeployed) {
            return;
        }
        this.maskDeployed = true;
        
        WebCore.EventProcessor.add(document.body, "click", this._processMaskClickRef, false);
        WebCore.EventProcessor.add(document.body, "contextmenu", this._processMaskClickRef, false);
    },
    
    closeAll: function() {
        while (this._openMenuPath.length > 0) {
            var menu = this._openMenuPath.pop();
            menu.close();
        }
    },
    
    closeDescendants: function(parentMenu) {
        while (parentMenu != this._openMenuPath[this._openMenuPath.length - 1]) {
            var menu = this._openMenuPath.pop();
            menu.close();
        }
    },
    
    deactivate: function() {
        if (!this.active) {
            return;
        }
        this.active = false;
        
        this.closeAll();
        this.removeMask();
    },
    
    isOpen: function(menuModel) {
        for (var i = 0; i < this._openMenuPath.length; ++i) {
            if (this._openMenuPath[i].menuModel == menuModel) {
                return true;
            }
        }
        return false;
    },
    
    _openMenu: function(menuModel) {
        if (this.isOpen(menuModel)) {
            return;
        }
        
        var subMenu = new ExtrasRender.ComponentSync.Menu.RenderedMenu(this, menuModel);
        subMenu.create();

        var parentMenu = null;
        for (var i = 0; i < this._openMenuPath.length; ++i) {
            if (this._openMenuPath[i].menuModel == menuModel.parent) {
                parentMenu = this._openMenuPath[i];
                break;
            }
        }
        
        if (parentMenu == null) {
            parentMenu = this;
        } else {
            this.closeDescendants(parentMenu);
        }

        var position = parentMenu.getSubMenuPosition(menuModel, subMenu.width, subMenu.height);
        subMenu.add(position.x, position.y);
        
        this.addMenu(subMenu);
    },

    _processMaskClick: function(e) {
        this.deactivate();
        return true;
    },
    
    removeMask: function() {
        if (!this.maskDeployed) {
            return;
        }
        this.maskDeployed = false;
        WebCore.EventProcessor.remove(document.body, "click", this._processMaskClickRef, false);
        WebCore.EventProcessor.remove(document.body, "contextmenu", this._processMaskClickRef, false);
    },
    
    renderAdd: function(update, parentElement) {
        this.menuModel = this.component.get("model");
        this.stateModel = this.component.get("stateModel");
        
        this.element = this.renderMain(update);
        parentElement.appendChild(this.element);
    },
    
    renderDispose: function(update) {
        this.deactivate();
    },
    
    renderUpdate: function(update) {
        var element = this.element;
        var containerElement = element.parentNode;
        EchoRender.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return false;
    }
});

ExtrasRender.ComponentSync.Menu.RenderedMenu = Core.extend({

    $static: {
        defaultIconTextMargin: 5,
        defaultMenuInsets: "2px",
        defaultMenuItemInsets: "1px 12px",
        
        FadeRunnable: Core.extend(WebCore.Scheduler.Runnable, {
        
            timeInterval: 10,
            repeat: true,
            _runTime: null,
            
            _element: null,
            _fadeIn: null,
            _fullOpacity: null,
            
            _startTime: null,
            
            $construct: function(element, fadeIn, fullOpacity, runTime) {
                this._element = element;
                this._fullOpacity = fullOpacity;
                this._fadeIn = fadeIn;
                this._runTime = runTime;
            },
            
            run: function() {
                var time = new Date().getTime();
                if (this._startTime == null) {
                    this._startTime = time;
                    return;
                }
                if (time < this._startTime + this._runTime) {
                    var opacity = ((time - this._startTime) / this._runTime) * this._fullOpacity; 
                    this._element.style.opacity = this._fadeIn ? opacity : this._fullOpacity - opacity;
                } else {
                    if (this._fadeIn) {
                        this._element.style.opacity = this._fullOpacity;
                    } else {
                        if (this._element.parentNode) {
                            this._element.parentNode.removeChild(this._element);
                        }
                    }
                    WebCore.Scheduler.remove(this);
                }
            }
        })
    },
    
    menuSync: null,
    component: null,
    client: null,
    element: null,
    itemElements: null,
    menuModel: null,
    width: null,
    height: null,
    _activeItem: null,
    stateModel: null,
    
    $construct: function(menuSync, menuModel) {
        this.menuSync = menuSync;
        this.menuModel = menuModel;
        this.component = this.menuSync.component;
        this.client = this.menuSync.client;
        this.stateModel = this.menuSync.stateModel;
        this.itemElements = { };
    },

    add: function(x, y) {
        this.element.style.left = x + "px";
        this.element.style.top = y + "px";

        var animationTime = this.component.render("animationTime", 0);
        if (!animationTime || WebCore.Environment.NOT_SUPPORTED_CSS_OPACITY) {
            document.body.appendChild(this.element);
        } else {
            this.element.style.opacity = 0;
            var fullOpacity = WebCore.Environment.NOT_SUPPORTED_CSS_OPACITY ? 100 : this.component.render("menuOpacity", 100) / 100;
            var fadeRunnable = new ExtrasRender.ComponentSync.Menu.RenderedMenu.FadeRunnable(this.element, true, fullOpacity, 
                    animationTime);
            WebCore.Scheduler.add(fadeRunnable);
            document.body.appendChild(this.element);
        }

        WebCore.EventProcessor.add(this.element, "click", Core.method(this, this._processClick), false);
        WebCore.EventProcessor.add(this.element, "mouseover", Core.method(this, this._processItemEnter), false);
        WebCore.EventProcessor.add(this.element, "mouseout", Core.method(this, this._processItemExit), false);
        WebCore.EventProcessor.Selection.disable(this.element);
    },

    close: function() {
        var animationTime = this.component.render("animationTime", 0);
        if (!animationTime || WebCore.Environment.NOT_SUPPORTED_CSS_OPACITY) {
            document.body.removeChild(this.element);
        } else {
            var fullOpacity = WebCore.Environment.NOT_SUPPORTED_CSS_OPACITY ? 100 : this.component.render("menuOpacity", 100) / 100;
            var fadeRunnable = new ExtrasRender.ComponentSync.Menu.RenderedMenu.FadeRunnable(this.element, false, fullOpacity, 
                    animationTime);
            WebCore.Scheduler.add(fadeRunnable);
        }
        
        this.element = null;
        this.itemElements = null;
        this._activeItem = null;
    },

    create: function() {
        this.element = document.createElement("div");
        this.element.style.position = "absolute";
        this.element.style.zIndex = ExtrasRender.ComponentSync.Menu.MAX_Z_INDEX;

        var opacity = WebCore.Environment.NOT_SUPPORTED_CSS_OPACITY ? 100 : this.component.render("menuOpacity", 100);

        var menuContentDivElement = document.createElement("div");
        menuContentDivElement.style.position = "relative";
        menuContentDivElement.style.zIndex = 10;
        this.element.appendChild(menuContentDivElement);

        EchoAppRender.Insets.render(ExtrasRender.ComponentSync.Menu.RenderedMenu.defaultMenuInsets, 
                menuContentDivElement, "padding");
        EchoAppRender.Border.render(this.component.render("menuBorder", ExtrasRender.ComponentSync.Menu._defaultBorder),
                menuContentDivElement);
        var foreground;
        var menuForeground = this.component.render("menuForeground");
        if (menuForeground) {
            foreground = menuForeground;
        } else {
            foreground = this.component.render("foreground", ExtrasRender.ComponentSync.Menu._defaultForeground);
        }
        EchoAppRender.Color.render(foreground, menuContentDivElement, "color");

        // Apply menu font if it is set, or apply default font 
        // if it is set and the menu font is NOT set.
        var font = this.component.render("menuFont");
        if (!font) {
            font = this.component.render("font");
        }
        if (font) {
            EchoAppRender.Font.render(font, menuContentDivElement);
        }

        var backgroundDivElement;
        if (opacity < 100) {
            backgroundDivElement = document.createElement("div");
            backgroundDivElement.style.opacity = opacity / 100;
            backgroundDivElement.style.position = "absolute";
            backgroundDivElement.style.zIndex = 1;
            backgroundDivElement.style.width = "100%";
            backgroundDivElement.style.height = "100%";
            backgroundDivElement.style.top = 0;
            backgroundDivElement.style.bottom = 0;
            this.element.appendChild(backgroundDivElement);
        } else {
            backgroundDivElement = this.element;
        }

        var background;
        var menuBackground = this.component.render("menuBackground");
        if (menuBackground) {
            background = menuBackground;
        } else {
            background = this.component.render("background", ExtrasRender.ComponentSync.Menu._defaultBackground);
        }
        EchoAppRender.Color.render(background, backgroundDivElement, "backgroundColor");

        // Apply menu background image if it is set, or apply default background 
        // image if it is set and the menu background is NOT set.
        var backgroundImage;
        var menuBackgroundImage = this.component.render("menuBackgroundImage");
        if (menuBackgroundImage) {
            backgroundImage = menuBackgroundImage;
        } else if (menuBackground == null) {
            backgroundImage = this.component.render("backgroundImage");
        }
        if (backgroundImage) {
            EchoAppRender.FillImage.render(backgroundImage, backgroundDivElement, null); 
        }

        var menuTableElement = document.createElement("table");
        menuTableElement.style.borderCollapse = "collapse";
        menuContentDivElement.appendChild(menuTableElement);

        var menuTbodyElement = document.createElement("tbody");
        menuTableElement.appendChild(menuTbodyElement);

        var items = this.menuModel.items;

        // Determine if any icons are present.
        var hasIcons = false;
        for (var i = 0; i < items.length; ++i) {
            var item = items[i];
            if (item.icon || item instanceof ExtrasApp.ToggleOptionModel) {
                hasIcons = true;
                break;
            }
        }
        var textPadding, iconPadding;

        if (hasIcons) {
            var pixelInsets = EchoAppRender.Insets.toPixels(ExtrasRender.ComponentSync.Menu.RenderedMenu.defaultMenuItemInsets);
            iconPadding = "0px 0px 0px " + pixelInsets.left + "px";
            textPadding = pixelInsets.top + "px " + pixelInsets.right + "px " + 
                    pixelInsets.bottom + "px " + pixelInsets.left + "px";
        } else {
            textPadding = ExtrasRender.ComponentSync.Menu.RenderedMenu.defaultMenuItemInsets;
        }

        for (var i = 0; i < items.length; ++i) {
            var item = items[i];
            if (item instanceof ExtrasApp.OptionModel || item instanceof ExtrasApp.MenuModel) {
                var menuItemTrElement = document.createElement("tr");
                this.itemElements[item.id] = menuItemTrElement;
                menuItemTrElement.style.cursor = "pointer";
                menuTbodyElement.appendChild(menuItemTrElement);

                if (hasIcons) {
                    var menuItemIconTdElement = document.createElement("td");
                    EchoAppRender.Insets.render(iconPadding, menuItemIconTdElement, "padding");
                    if (item instanceof ExtrasApp.ToggleOptionModel) {
                        var iconIdentifier;
                        var selected = this.stateModel && this.stateModel.isSelected(item.modelId);
                        if (item instanceof ExtrasApp.RadioOptionModel) {
                            iconIdentifier = selected ? "image/menu/RadioOn.gif" : "image/menu/RadioOff.gif";
                        } else {
                            iconIdentifier = selected ? "image/menu/ToggleOn.gif" : "image/menu/ToggleOff.gif";
                        }
                        var imgElement = document.createElement("img");
                        imgElement.src = this.client.getResourceUrl("Extras", iconIdentifier);
                        menuItemIconTdElement.appendChild(imgElement);
                    } else if (item.icon) {
                        var imgElement = document.createElement("img");
                        EchoAppRender.ImageReference.renderImg(item.icon, imgElement);
                        menuItemIconTdElement.appendChild(imgElement);
                    }
                    menuItemTrElement.appendChild(menuItemIconTdElement);
                }

                var menuItemContentTdElement = document.createElement("td");
                EchoAppRender.Insets.render(textPadding, menuItemContentTdElement, "padding");
                var lineWrap = this.component.render("lineWrap");
                if (lineWrap != null && !lineWrap) {
                    menuItemContentTdElement.style.whiteSpace = "nowrap";
                }
                if (this.stateModel && !this.stateModel.isEnabled(item.modelId)) {
                    EchoAppRender.Color.render(this.component.render("disabledForeground", 
                            ExtrasRender.ComponentSync.Menu._defaultDisabledForeground), menuItemContentTdElement, "color");
                }
                menuItemContentTdElement.appendChild(document.createTextNode(item.text));
                menuItemTrElement.appendChild(menuItemContentTdElement);

                if (item instanceof ExtrasApp.MenuModel) {
                    // Submenus have adjacent column containing 'expand' icons.
                    var menuItemArrowTdElement = document.createElement("td");
                    menuItemArrowTdElement.style.textAlign = "right";
                    var imgElement = document.createElement("img");
                    var expandImage = this.component.render("menuExpandIcon", 
                            this.client.getResourceUrl("Extras", "image/menu/ArrowRight.gif"));
                    imgElement.setAttribute("src", expandImage.url ? expandImage.url : expandImage);
                    imgElement.setAttribute("alt", "");
                    menuItemArrowTdElement.appendChild(imgElement);
                    menuItemTrElement.appendChild(menuItemArrowTdElement);
                } else {
                    // Menu items fill both columns.
                    menuItemContentTdElement.colSpan = 2;
                }
            } else if (item instanceof ExtrasApp.SeparatorModel) {
                var menuItemTrElement = document.createElement("tr");
                menuTbodyElement.appendChild(menuItemTrElement);
                var menuItemContentTdElement = document.createElement("td");
                menuItemContentTdElement.colSpan = hasIcons ? 3 : 2;
                menuItemContentTdElement.style.padding = "3px 0px";
                var hrDivElement = document.createElement("div");
                hrDivElement.style.borderTopWidth = "1px";
                hrDivElement.style.borderTopStyle = "solid";
                hrDivElement.style.borderTopColor = "#a7a7a7";
                hrDivElement.style.height = "0px";
                hrDivElement.style.fontSize = "1px";
                hrDivElement.style.lineHeight = "0px";
                menuItemContentTdElement.appendChild(hrDivElement);
                menuItemTrElement.appendChild(menuItemContentTdElement);
            }
        }

        var bounds = new WebCore.Measure.Bounds(this.element);
        this.width = bounds.width;
        this.height = bounds.height;
    },

    _getItemElement: function(element) {
        if (element == null) {
            return null;
        }
        // Find TD element.
        while (element.nodeName.toLowerCase() != "tr") {
            if (element == this.element) {
                return null;
            }
            element = element.parentNode;
        }
        return element;
    },
    
    _getItemModel: function(element) {
        var itemModelId = null;
        element = this._getItemElement(element);
        if (element == null) {
            return null;
        }

        // Find item model id of clicked element.
        for (var x in this.itemElements) {
            if (this.itemElements[x] == element) {
                itemModelId = x;
                break;
            }
        }

        if (itemModelId == null) {
            return null;
        } else {
            return this.menuModel.getItem(itemModelId);
        }
    },
    
    getSubMenuPosition: function(menuModel, width, height) {
        var menuElement = this.itemElements[menuModel.id];
        
        var itemBounds = new WebCore.Measure.Bounds(menuElement);
        var menuBounds = new WebCore.Measure.Bounds(this.element);
        
        return { x: menuBounds.left + menuBounds.width, y: itemBounds.top };
    },
    
    _processClick: function(e) {
        WebCore.DOM.preventEventDefault(e);
        var itemModel = this._getItemModel(e.target);
        if (itemModel) {
            this._setActiveItem(itemModel, true);
        }
    },
    
    _processItemEnter: function(e) {
        this._processRollover(e, true);
    },

    _processItemExit: function(e) {
        this._processRollover(e, false);
    },
    
    _processRollover: function(e, state) {
        if (!this.client.verifyInput(this.component) || WebCore.dragInProgress) {
            return;
        }
        
        var element = this._getItemElement(e.target);
        if (!element) {
            return;
        }
        var itemModel = this._getItemModel(element);
        if (!itemModel) {
            return;
        }
        
        if (this.stateModel && !this.stateModel.isEnabled(itemModel.modelId)) {
            return;
        }
        
        if (state) {
            this._setActiveItem(itemModel, false);
        }
    },
    
    _setActiveItem: function(itemModel, execute) {
        if (this._activeItem) {
            this._setItemHighlight(this._activeItem, false);
            this._activeItem = null;
        }

        if (itemModel instanceof ExtrasApp.MenuModel) {
            this.menuSync.activateItem(itemModel);
        } else {
            if (execute) {
                this.menuSync.activateItem(itemModel);
                // Executing item, menu will close: return immediately.
                return;
            } else {
                this.menuSync.closeDescendants(this);
            }
        }

        if (itemModel) {
            this._activeItem = itemModel;
            this._setItemHighlight(this._activeItem, true);
        }
    },

    _setItemHighlight: function(itemModel, state) {
        var element = this.itemElements[itemModel.id];
        if (state) {
            EchoAppRender.FillImage.render(this.component.render("selectionBackgroundImage"), element);
            EchoAppRender.Color.render(this.component.render("selectionBackground", 
                    ExtrasRender.ComponentSync.Menu._defaultSelectionBackground), element, "backgroundColor");
            EchoAppRender.Color.render(this.component.render("selectionForeground", 
                    ExtrasRender.ComponentSync.Menu._defaultSelectionForeground), element, "color");
        } else {
            element.style.backgroundImage = "";
            element.style.backgroundColor = "";
            element.style.color = "";
        } 
    }
});

/**
 * Component rendering peer: ContextMenu
 */
ExtrasRender.ComponentSync.ContextMenu = Core.extend(ExtrasRender.ComponentSync.Menu, {

    $static: {
        _supportedPartialProperties: ["model", "stateModel"]
    },
    
    $load: function() {
        EchoRender.registerPeer("ExtrasApp.ContextMenu", this);
    },
    
    _mouseX: null,
    _mouseY: null,
    
    getSubMenuPosition: function(menuModel, width, height) {
        return { x: this._mouseX, y: this._mouseY };
    },

    _processContextClick: function(e) {
        if (!this.client.verifyInput(this.component) || WebCore.dragInProgress) {
            return;
        }
    
        WebCore.DOM.preventEventDefault(e);
        
        this._mouseX = e.pageX || (e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft));
        this._mouseY = e.pageY || (e.clientY + (document.documentElement.scrollTop || document.body.scrollTop));
        
        this.activate();
        this.activateItem(this.menuModel);
    },

    renderDispose: function(update) {
        WebCore.EventProcessor.removeAll(this.element);
        ExtrasRender.ComponentSync.Menu.prototype.renderDispose.call(this, update);
    },
    
    renderMain: function(update) {
        var contextMenuDivElement = document.createElement("div");
        contextMenuDivElement.id = this.component.renderId;
        
        WebCore.EventProcessor.add(contextMenuDivElement, "contextmenu", Core.method(this, this._processContextClick), false);
        
        var componentCount = this.component.getComponentCount();
        if (componentCount > 0) {
            EchoRender.renderComponentAdd(update, this.component.getComponent(0), contextMenuDivElement);
        }
        
        return contextMenuDivElement;
    }
});

//FIXME 'selection' property should be an itemmodel id.  We should have a remote peer for this path-string business.
/**
 * Component rendering peer: DropDownMenu
 */
ExtrasRender.ComponentSync.DropDownMenu = Core.extend(ExtrasRender.ComponentSync.Menu, {

    $load: function() {
        EchoRender.registerPeer("ExtrasApp.DropDownMenu", this);
    },
    
    _containerDivElement: null,
    _selectionSpanElement: null,
    _selectedItem: null,

    getSubMenuPosition: function(menuModel, width, height) {
        var bounds = new WebCore.Measure.Bounds(this.element);
        var x = bounds.left
        var y = bounds.top + bounds.height;

        var availableWidth = document.body.offsetWidth;
        
        if (x + width > availableWidth) {
            x = availableWidth - width;
            if (x < 0) {
                x = 0;
            }
        }
        
        return { x: x, y: y };
    },
    
    processAction: function(itemModel) {
        if (this.component.render("selectionEnabled")) {
            this._setSelection(itemModel);
        }
        var path = itemModel.getItemPositionPath().join(".");
        this.component.set("selection", path);
        ExtrasRender.ComponentSync.Menu.prototype.processAction.call(this, itemModel);
    },

    _processClick: function(e) {
        if (!this.client.verifyInput(this.component) || WebCore.dragInProgress) {
            return;
        }
        
        WebCore.DOM.preventEventDefault(e);
    
        this.activate();
        this.activateItem(this.menuModel);
    },
    
    renderDisplay: function() {
        WebCore.VirtualPosition.redraw(this._containerDivElement);
    },
    
    renderDispose: function(update) {
        WebCore.EventProcessor.removeAll(this.element);
        this._containerDivElement = null;
        ExtrasRender.ComponentSync.Menu.prototype.renderDispose.call(this, update);
    },
    
    renderMain: function() {
        var dropDownDivElement = document.createElement("div");
        dropDownDivElement.id = this.component.renderId;
        dropDownDivElement.style.cursor = "pointer";
        dropDownDivElement.style.overflow = "hidden";
        var width = this.component.render("width");
        if (width) {
            dropDownDivElement.style.width = width.toString();
        } else {
            // if the width is not set, IE won't fire click events.
            dropDownDivElement.style.width = "100%";
        }
        var height = this.component.render("height");
        if (height) {
            dropDownDivElement.style.height = height.toString();
        }
        EchoAppRender.Color.renderFB(this.component, dropDownDivElement);
        
        var relativeContainerDivElement = document.createElement("div");
        relativeContainerDivElement.style.position = "relative";
        relativeContainerDivElement.style.height = "100%";
        //FIXME this was commented out...by whom, why?
        //EchoAppRender.Insets.render(this.component.render("insets"), relativeContainerDivElement, "padding");
        relativeContainerDivElement.appendChild(document.createTextNode("\u00a0"));
        
        var expandIcon = this.component.render("expandIcon", this.client.getResourceUrl("Extras", "image/menu/ArrowDown.gif"));
        var expandIconWidth = this.component.render("expandIconWidth", 10);
        
        var expandElement = document.createElement("span");
        expandElement.style.position = "absolute";
        expandElement.style.height = "100%";
        expandElement.style.top = "0px";
        expandElement.style.right = "0px";
        var imgElement = document.createElement("img");
        EchoAppRender.ImageReference.renderImg(expandIcon, imgElement);
        expandElement.appendChild(imgElement);
        relativeContainerDivElement.appendChild(expandElement);
        
        this._containerDivElement = document.createElement("div");
        this._containerDivElement.style.position = "absolute";
        this._containerDivElement.style.top = "0px";
        this._containerDivElement.style.left = "0px";
        this._containerDivElement.style.right = EchoAppRender.Extent.toCssValue(expandIconWidth);
        var insets = this.component.render("insets");
        if (insets) {
            EchoAppRender.Insets.render(insets, this._containerDivElement, "padding");
            if (height) {
                var insetsPx = EchoAppRender.Insets.toPixels(insets);
                var compensatedHeight = Math.max(0, EchoAppRender.Extent.toPixels(height) - insetsPx.top - insetsPx.top);
                this._containerDivElement.style.height = compensatedHeight + "px";
            }
        } else {
            this._containerDivElement.style.height = "100%";
        }
        EchoAppRender.FillImage.render(this.component.render("backgroundImage"), this._containerDivElement); 
        
        this._selectionSpanElement = document.createElement("div");
        this._selectionSpanElement.style.height = "100%";
        this._selectionSpanElement.style.width = "100%";
        this._selectionSpanElement.style.overflow = "hidden";
        this._selectionSpanElement.style.whiteSpace = "nowrap";
        EchoAppRender.Font.render(this.component.render("font"), this._selectionSpanElement, null);
        this._containerDivElement.appendChild(this._selectionSpanElement);
        
        relativeContainerDivElement.appendChild(this._containerDivElement);
        dropDownDivElement.appendChild(relativeContainerDivElement);
    
        WebCore.EventProcessor.add(dropDownDivElement, "click", Core.method(this, this._processClick), false);
        WebCore.EventProcessor.Selection.disable(dropDownDivElement);
    
        if (this.component.render("selectionEnabled")) {
            var selection = this.component.render("selection");
            if (selection) {
                this._setSelection(this.menuModel.getItemModelFromPositions(selection.split(".")));
            }
        }
        if (!this._selectedItem) {
            var selectionText = this.component.render("selectionText");
            if (selectionText) {
                this._selectionSpanElement.appendChild(document.createTextNode(selectionText));
            }
        }
    
        return dropDownDivElement;
    },

    /**
     * Sets the selection to the given menu model.
     *
     * @param itemModel the model to select
     */
    _setSelection: function(itemModel) {
        this._selectedItem = itemModel;
        
        for (var i = this._selectionSpanElement.childNodes.length - 1; i >= 0; --i) {
            this._selectionSpanElement.removeChild(this._selectionSpanElement.childNodes[i]);
        }

        if (itemModel.text) {
            if (itemModel.icon) {
                // Render Text and Icon
                var tableElement = document.createElement("table");
                var tbodyElement = document.createElement("tbody");
                var trElement = document.createElement("tr");
                var tdElement = document.createElement("td");
                var imgElement = document.createElement("img");
                EchoAppRender.ImageReference.renderImg(itemModel.icon, imgElement);
                tdElement.appendChild(imgElement);
                trElement.appendChild(tdElement);
                tdElement = document.createElement("td");
                tdElement.style.width = "3px";
                trElement.appendChild(tdElement);
                tdElement = document.createElement("td");
                tdElement.appendChild(document.createTextNode(itemModel.text));
                trElement.appendChild(tdElement);
                tbodyElement.appendChild(trElement);
                tableElement.appendChild(tbodyElement);
                this._selectionSpanElement.appendChild(tableElement);
            } else {
                // Render Text Only
                this._selectionSpanElement.appendChild(document.createTextNode(itemModel.text));
            }
        } else if (itemModel.icon) {
            // Render Icon Only
            var imgElement = document.createElement("img");
            EchoAppRender.ImageReference.renderImg(itemModel.icon, imgElement);
            this._selectionSpanElement.appendChild(imgElement);
        }
    }
});    

/**
 * Component rendering peer: MenuBarPane
 */
ExtrasRender.ComponentSync.MenuBarPane = Core.extend(ExtrasRender.ComponentSync.Menu, {

    $static: {
        _defaultItemInsets: "0px 12px"
    },
    
    $load: function() {
       EchoRender.registerPeer("ExtrasApp.MenuBarPane", this);
    },
    
    _activeItem: null,
    itemElements: null,
    
    $construct: function() {
        ExtrasRender.ComponentSync.Menu.call(this);
        this.itemElements = {};
    },
    
    activate: function() {
        if (ExtrasRender.ComponentSync.Menu.prototype.activate.call(this)) {
            this.addMenu(this);
        }
    },
    
    close: function() {
        if (this._activeItem) {
            this._setItemHighlight(this._activeItem, false);
            this._activeItem = null;
        }
    },
    
    _getItemElement: function(element) {
        if (element == null) {
            return null;
        }
        // Find TD element.
        while (element.nodeName.toLowerCase() != "td") {
            if (element == this.element) {
                return null;
            }
            element = element.parentNode;
        }
        return element;
    },
    
    _getItemModel: function(element) {
        var itemModelId = null;
        element = this._getItemElement(element);
        if (element == null) {
            return null;
        }

        // Find item model id of clicked element.
        for (var x in this.itemElements) {
            if (this.itemElements[x] == element) {
                itemModelId = x;
                break;
            }
        }

        if (itemModelId == null) {
            return null;
        } else {
            return this.menuModel.getItem(itemModelId);
        }
    },
    
    getSubMenuPosition: function(menuModel, width, height) {
        var itemElement = this.itemElements[menuModel.id];
        if (!itemElement) {
            throw new Error("Invalid menu: " + menuModel);
        }

        var itemBounds = new WebCore.Measure.Bounds(itemElement);
        var x = itemBounds.left
        var y = itemBounds.top + itemBounds.height;

        var availableWidth = document.body.offsetWidth;
        
        if (x + width > availableWidth) {
            x = availableWidth - width;
            if (x < 0) {
                x = 0;
            }
        }
        
        return { x: x, y: y };
    },
    
    _processClick: function(e) {
        if (!this.client.verifyInput(this.component)) {
            return;
        }
        
        WebCore.DOM.preventEventDefault(e);

        var itemModel = this._getItemModel(e.target);
        if (itemModel) {
            this.activate();
            this._setActiveItem(itemModel);
        } else {
            this.deactivate();
        }
    },
    
    _processRollover: function(e, state) {
        if (!this.client.verifyInput(this.component) || WebCore.dragInProgress) {
            return;
        }
        
        var element = this._getItemElement(e.target);
        if (!element) {
            return;
        }
        var itemModel = this._getItemModel(element);
        
        if (this.stateModel && !this.stateModel.isEnabled(itemModel.modelId)) {
            return;
        }
        
        if (this.active) {
            if (state) {
                this._setActiveItem(itemModel);
            }
        } else {
            this._setItemHighlight(itemModel, state);
        }
    },
    
    _processItemEnter: function(e) {
        this._processRollover(e, true);
    },
    
    _processItemExit: function(e) {
        this._processRollover(e, false);
    },
    
    renderDispose: function(update) {
        WebCore.EventProcessor.removeAll(this.element);
        ExtrasRender.ComponentSync.Menu.prototype.renderDispose.call(this, update);
    },
    
    renderMain: function(update) {
        var menuBarDivElement = document.createElement("div");
        menuBarDivElement.id = this.component.renderId;
        menuBarDivElement.style.position = "absolute";
        menuBarDivElement.style.left = "0px";
        menuBarDivElement.style.right = "0px";
        menuBarDivElement.style.top = "0px";
        menuBarDivElement.style.bottom = "0px";
        
        EchoAppRender.Color.renderFB(this.component, menuBarDivElement);
        var border = this.component.render("border", ExtrasRender.ComponentSync.Menu._defaultBorder);
        EchoAppRender.Border.render(border, menuBarDivElement, "borderTop");
        EchoAppRender.Border.render(border, menuBarDivElement, "borderBottom");
        EchoAppRender.FillImage.render(this.component.render("backgroundImage"), menuBarDivElement); 
        EchoAppRender.Font.render(this.component.render("font"), menuBarDivElement, null);
        
        // This 100% high "inner div" element ensures the table will actually render to 100% height on all browsers.
        // IE7 has a peculiar issue here otherwise.
        var menuBarInnerDivElement = document.createElement("div");
        menuBarInnerDivElement.style.position = "absolute";
        menuBarInnerDivElement.style.height = "100%";
        menuBarDivElement.appendChild(menuBarInnerDivElement);
        
        var menuBarTableElement = document.createElement("table");
        menuBarTableElement.style.height = "100%";
        menuBarTableElement.style.borderCollapse = "collapse";
        menuBarInnerDivElement.appendChild(menuBarTableElement);
        
        var menuBarTbodyElement = document.createElement("tbody");
        menuBarTableElement.appendChild(menuBarTbodyElement);
        
        var menuBarTrElement = document.createElement("tr");
        menuBarTbodyElement.appendChild(menuBarTrElement);
        
        if (this.menuModel != null) {
            var items = this.menuModel.items;
            for (var i = 0; i < items.length; ++i) {
                var item = items[i];
                if (item instanceof ExtrasApp.OptionModel || item instanceof ExtrasApp.MenuModel) {
                    var menuBarItemTdElement = document.createElement("td");
                    this.itemElements[item.id] = menuBarItemTdElement;
                    menuBarItemTdElement.style.padding = "0px";
                    menuBarItemTdElement.style.height = "100%";
                    menuBarItemTdElement.style.cursor = "pointer";
                    menuBarTrElement.appendChild(menuBarItemTdElement);
                    var menuBarItemDivElement = document.createElement("div");
                    EchoAppRender.Insets.render(ExtrasRender.ComponentSync.MenuBarPane._defaultItemInsets, 
                            menuBarItemDivElement, "padding");
                    menuBarItemTdElement.appendChild(menuBarItemDivElement);
                    var textNode = document.createTextNode(item.text);
                    menuBarItemDivElement.appendChild(textNode);
                }
            }
        }
        
        WebCore.EventProcessor.add(menuBarDivElement, "click", Core.method(this, this._processClick), false);
        WebCore.EventProcessor.add(menuBarDivElement, "mouseover", Core.method(this, this._processItemEnter), false);
        WebCore.EventProcessor.add(menuBarDivElement, "mouseout", Core.method(this, this._processItemExit), false);
        WebCore.EventProcessor.Selection.disable(menuBarDivElement);
    
        return menuBarDivElement;
    },
    
    _setActiveItem: function(itemModel) {
        if (this._activeItem == itemModel) {
            return;
        }
        
        if (this._activeItem) {
            this._setItemHighlight(this._activeItem, false);
            this._activeItem = null;
        }
    
        this.activateItem(itemModel);

        if (itemModel) {
            this._activeItem = itemModel;
            this._setItemHighlight(this._activeItem, true);
        }
    },
    
    _setItemHighlight: function(itemModel, state) {
        var element = this.itemElements[itemModel.id];
        if (state) {
            EchoAppRender.FillImage.render(this.component.render("selectionBackgroundImage"), element);
            EchoAppRender.Color.render(this.component.render("selectionBackground", 
                    ExtrasRender.ComponentSync.Menu._defaultSelectionBackground), element, "backgroundColor");
            EchoAppRender.Color.render(this.component.render("selectionForeground", 
                    ExtrasRender.ComponentSync.Menu._defaultSelectionForeground), element, "color");
        } else {
            element.style.backgroundImage = "";
            element.style.backgroundColor = "";
            element.style.color = "";
        } 
    }
});
