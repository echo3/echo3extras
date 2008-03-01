// FIXME handle enabled/disabled state
// FIXME fire events from components, not peer.

/**
 * Component rendering peer: Menu
 */
ExtrasRender.ComponentSync.Menu = Core.extend(EchoRender.ComponentSync, {
    
    $static: {
        _defaultForeground: "#000000",
        _defaultBackground: "#cfcfcf",
        _defaultDisabledForeground: "#7f7f7f",
        _defaultSelectionForeground: "#ffffff",
        _defaultSelectionBackground: "#3f3f3f",
        MAX_Z_INDEX: 65535
    },    
        
    /**
     * Array containing models of open menus.
     */
    _openMenuPath: null,

    _element: null,    
    _menuInsets: null,
    _menuItemInsets: null,
    _menuItemIconTextMargin: null,
    _menuModel: null,
    _processMaskClickRef: null,
    _stateModel: null,
    
    $construct: function() {
        this._processMaskClickRef = Core.method(this, this._processMaskClick);
        this._openMenuPath = [];
        this._menuInsets = "2px";
        this._menuItemInsets = "1px 12px";
        this._menuItemIconTextMargin = 5;
    },
    
    $virtual: {
    
        renderMenu: function(menuModel, xPosition, yPosition) {
            var menuDivElement = document.createElement("div");
            menuDivElement.id = this.component.renderId + "_menu_" + menuModel.id;
            menuDivElement.style.position = "absolute";
            menuDivElement.style.zIndex = ExtrasRender.ComponentSync.Menu.MAX_Z_INDEX;
            menuDivElement.style.top = yPosition + "px";
            menuDivElement.style.left = xPosition + "px";
            
            var opacity = WebCore.Environment.NOT_SUPPORTED_CSS_OPACITY ? 100 : this.component.render("menuOpacity", 100);

            var menuContentDivElement = document.createElement("div");
            menuContentDivElement.style.position = "relative";
            menuContentDivElement.style.zIndex = 10;
            menuDivElement.appendChild(menuContentDivElement);

            EchoAppRender.Insets.render(this._menuInsets, menuContentDivElement, "padding");
            EchoAppRender.Border.render(this._getMenuBorder(), menuContentDivElement);
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
                menuDivElement.appendChild(backgroundDivElement);
            } else {
                backgroundDivElement = menuDivElement;
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
        
            var items = menuModel.items;
            
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
                var pixelInsets = EchoAppRender.Insets.toPixels(this._menuItemInsets);
                iconPadding = "0px 0px 0px " + pixelInsets.left + "px";
                textPadding = pixelInsets.top + "px " + pixelInsets.right + "px " + 
                        pixelInsets.bottom + "px " + pixelInsets.left + "px";
            } else {
                textPadding = this._menuItemInsets;
            }
            
            for (var i = 0; i < items.length; ++i) {
                var item = items[i];
                if (item instanceof ExtrasApp.OptionModel || item instanceof ExtrasApp.MenuModel) {
                    var menuItemTrElement = document.createElement("tr");
                    menuItemTrElement.id = this.component.renderId + "_tr_item_" + item.id;
                    menuItemTrElement.style.cursor = "pointer";
                    menuTbodyElement.appendChild(menuItemTrElement);
        
                    if (hasIcons) {
                        var menuItemIconTdElement = document.createElement("td");
                        EchoAppRender.Insets.render(iconPadding, menuItemIconTdElement, "padding");
                        if (item instanceof ExtrasApp.ToggleOptionModel) {
                            var iconIdentifier;
                            var selected = this._stateModel && this._stateModel.isSelected(item.modelId);
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
                    if (this._stateModel && !this._stateModel.isEnabled(item.modelId)) {
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
            
            document.body.appendChild(menuDivElement);
        
            WebCore.EventProcessor.add(menuDivElement, "click", Core.method(this, this._processClick), false);
            WebCore.EventProcessor.add(menuDivElement, "mouseover", Core.method(this, this._processItemEnter), false);
            WebCore.EventProcessor.add(menuDivElement, "mouseout", Core.method(this, this._processItemExit), false);
            WebCore.EventProcessor.Selection.disable(menuDivElement);
            
            return menuDivElement;
        },

        renderTopMenu: function(menuModel) {
            var menuElement = this._getMenuElement(menuModel);
            var containerElement = document.getElementById(this.component.renderId);
            
            var menuBounds = new WebCore.Measure.Bounds(menuElement);
            var containerBounds = new WebCore.Measure.Bounds(containerElement);
            
            this.renderMenu(menuModel, menuBounds.left, containerBounds.top + containerBounds.height);
            // FIXME handle overflow
        }
    },
    
    _activateItem: function(itemModel) {
        if (this._stateModel && !this._stateModel.isEnabled(itemModel.modelId)) {
            return;
        }
        if (itemModel instanceof ExtrasApp.OptionModel) {
            this._removeMask();
            this._closeDescendantMenus(null);
            this._doAction(itemModel);
        } else if (itemModel instanceof ExtrasApp.MenuModel) {
            this._openMenu(itemModel);
        }
    },
    
    _closeMenu: function() {
        this._removeMask();
        this._closeDescendantMenus(null);
    },
    
    /**
     * @param menuModel the menu model whose descendants should be closed;
     * the menu model itself will remain open; providing null will close all descendant menus; 
     */
    _closeDescendantMenus: function(menuModel) {
        for (var i = this._openMenuPath.length - 1;  i >= 0; --i) {
            if (menuModel != null && this._openMenuPath[i].id == menuModel.id) {
                // Stop once specified menu is found.
                return;
            }
            this._disposeMenu(this._openMenuPath[i]);
            --this._openMenuPath.length;
        }
    },
    
    _disposeMenu: function(menuModel) {
        var menuElement = document.getElementById(this.component.renderId + "_menu_" + menuModel.id);
    
        WebCore.EventProcessor.removeAll(menuElement);
        menuElement.parentNode.removeChild(menuElement);
    },
    
    _getBorder: function() {
        var border = this.component.render("border");
        if (!border) {
            border = "1px outset #cfcfcf";
        }
        return border;
    },
    
    _getElementModelId: function(element) {
        if (!element.id) {
            return this._getElementModelId(element.parentNode);
        }
        if (element.id.indexOf(this.component.renderId + "_") != 0 || element.id.indexOf("_item_") == -1) {
            return null;
        }
        return element.id.substring(element.id.lastIndexOf("_") + 1);
    },
    
    _getMenuBorder: function() {
        var border = this.component.render("menuBorder");
        if (!border) {
            border = this._getBorder();
        }
        return border;
    },
    
    _highlight: function(menuModel, state) {
        if (this._stateModel && !this._stateModel.isEnabled(menuModel.modelId)) {
            return;
        }
        var menuElement = this._getMenuElement(menuModel);
        if (state) {
            EchoAppRender.FillImage.render(this.component.render("selectionBackgroundImage"), menuElement);
            EchoAppRender.Color.render(this.component.render("selectionBackground", 
                    ExtrasRender.ComponentSync.Menu._defaultSelectionBackground), menuElement, "backgroundColor");
            EchoAppRender.Color.render(this.component.render("selectionForeground", 
                    ExtrasRender.ComponentSync.Menu._defaultSelectionForeground), menuElement, "color");
        } else {
            menuElement.style.backgroundImage = "";
            menuElement.style.backgroundColor = "";
            menuElement.style.color = "";
        }
    },
    
    _openMenu: function(menuModel) {
        if (!this._prepareOpenMenu(menuModel)) {
            // Do nothing: menu is already open.
            return;
        }
    
        var menuElement = this._getMenuElement(menuModel);
        if (this._isTopMenuElement(menuElement)) { 
            this.renderTopMenu(menuModel);
        } else {
            this._renderSubMenu(menuModel);
        }
    },
    
    /**
     * @return true if the menu should be opened, false it if is already opened
     */
    _prepareOpenMenu: function(menuModel) {
        if (this._openMenuPath.length != 0) {
            var openMenu = this._openMenuPath[this._openMenuPath.length - 1];
            if (openMenu.id == menuModel.id || menuModel.parent == null) {
                // Do nothing: menu is already open
                return false;
            }
            if (openMenu.id != menuModel.parent.id) {
                // Close previous menu
                this._closeDescendantMenus(menuModel.parent);
            }
        }
        
        this._openMenuPath.push(menuModel);
        return true;
        
    },
    
    _processItemEnter: function(e) {
        if (!this.client.verifyInput(this.component) || WebCore.dragInProgress) {
            return;
        }
        var modelId = this._getElementModelId(e.target);
        if (modelId) {
            this._highlight(this._menuModel.getItem(modelId), true);
        }
    },
    
    _processItemExit: function(e) {
        if (!this.client.verifyInput(this.component) || WebCore.dragInProgress) {
            return;
        }
        var modelId = this._getElementModelId(e.target);
        if (modelId) {
            this._highlight(this._menuModel.getItem(modelId), false);
        }
    },
    
    _processMaskClick: function(e) {
        var modelId = this._getElementModelId(e.target);
        if (!modelId) {
            this._closeMenu();
        }
        return true;
    },
    
    renderDispose: function(update) {
        this._closeMenu();
        WebCore.EventProcessor.removeAll(this._element);
        this._element.id = "";
        this._element = null;
        this._menuModel = null;
        this._stateModel = null;
        this._openMenuPath = [];
    },
    
    _removeMask: function() {
        if (!this.maskDeployed) {
            return;
        }
        this.maskDeployed = false;
    
        WebCore.EventProcessor.remove(document.body, "click", this._processMaskClickRef, true);
        WebCore.EventProcessor.remove(document.body, "contextmenu", this._processMaskClickRef, true);
    },
    
    renderAdd: function(update, parentElement) {
        this._menuModel = this.component.get("model");
        this._stateModel = this.component.get("stateModel");
        
        this._element = this._renderMain(update);
        
        parentElement.appendChild(this._element);
    },
    
    _renderMask: function() {
        if (this.maskDeployed) {
            return;
        }
        this.maskDeployed = true;
        
        WebCore.EventProcessor.add(document.body, "click", this._processMaskClickRef, true);
        WebCore.EventProcessor.add(document.body, "contextmenu", this._processMaskClickRef, true);
    },
    
    _renderSubMenu: function(menuModel) {
        var menuElement = this._getMenuElement(menuModel);
        var containerElement = menuElement.parentNode.parentNode.parentNode;
        
        var menuBounds = new WebCore.Measure.Bounds(menuElement);
        var containerBounds = new WebCore.Measure.Bounds(containerElement);
        
        this.renderMenu(menuModel, containerBounds.left + containerBounds.width, menuBounds.top);
    },

    renderUpdate: function(update) {
        var element = this._element;
        var containerElement = element.parentNode;
        EchoRender.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return false;
    }
});

/**
 * Component rendering peer: MenuBarPane
 */
ExtrasRender.ComponentSync.MenuBarPane = Core.extend(ExtrasRender.ComponentSync.Menu, {

    $load: function() {
       EchoRender.registerPeer("ExtrasApp.MenuBarPane", this);
    },
    
    $construct: function() {
        ExtrasRender.ComponentSync.Menu.call(this);
        this._itemInsets = "0px 12px";
    },
    
    _doAction: function(menuModel) {
        var path = menuModel.getItemPositionPath().join(".");
        this.component.fireEvent({type: "action", source: this.component, data: path, modelId: menuModel.modelId});
    },
    
    _getMenuElement: function(itemModel) {
        var menuElement = document.getElementById(this.component.renderId + "_bar_td_item_" + itemModel.id);
        if (menuElement == null) {
            menuElement = document.getElementById(this.component.renderId + "_tr_item_" + itemModel.id);
        }
        return menuElement;
    },
    
    _isTopMenuElement: function(element) {
        return element.id.indexOf("_bar_td_item") != -1;
    },
    
    _processClick: function(e) {
        if (!this.component.isActive()) {
            return;
        }
        
        WebCore.DOM.preventEventDefault(e);
    
        var modelId = this._getElementModelId(e.target);
        if (modelId) {
            this._renderMask();
            this._activateItem(this._menuModel.getItem(modelId));
        } else {
            this._closeMenu();
        }
    },
    
    renderDisplay: function() {
        WebCore.VirtualPosition.redraw(this._element);
    },
    
    _renderMain: function() {
        var menuBarDivElement = document.createElement("div");
        menuBarDivElement.id = this.component.renderId;
        menuBarDivElement.style.position = "absolute";
        menuBarDivElement.style.left = "0px";
        menuBarDivElement.style.right = "0px";
        menuBarDivElement.style.top = "0px";
        menuBarDivElement.style.bottom = "0px";
        
        EchoAppRender.Color.renderFB(this.component, menuBarDivElement);
        var border = this._getBorder();
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
        
        if (this._menuModel != null) {
            var items = this._menuModel.items;
            for (var i = 0; i < items.length; ++i) {
                var item = items[i];
                if (item instanceof ExtrasApp.OptionModel || item instanceof ExtrasApp.MenuModel) {
                    var menuBarItemTdElement = document.createElement("td");
                    menuBarItemTdElement.id = this.component.renderId + "_bar_td_item_" + item.id;
                    menuBarItemTdElement.style.padding = "0px";
                    menuBarItemTdElement.style.height = "100%";
                    menuBarItemTdElement.style.cursor = "pointer";
                    menuBarTrElement.appendChild(menuBarItemTdElement);
                    var menuBarItemDivElement = document.createElement("div");
                    EchoAppRender.Insets.render(this._itemInsets, menuBarItemDivElement, "padding");
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
    }
});

/**
 * Component rendering peer: DropDownMenu
 */
ExtrasRender.ComponentSync.DropDownMenu = Core.extend(ExtrasRender.ComponentSync.Menu, {

    $load: function() {
        EchoRender.registerPeer("ExtrasApp.DropDownMenu", this);
    },
    
    _selectedItem: null,
    
    _contentDivElement: null,
    
    _doAction: function(menuModel) {
        if (this._isSelectionEnabled()) {
            this._setSelection(menuModel);
        }
        var path = menuModel.getItemPositionPath().join(".");
        this.component.set("selection", path);
        this.component.fireEvent({type: "action", source: this.component, data: path});
    },
    
    _getMenuElement: function(itemModel) {
        var menuElement = document.getElementById(this.component.renderId + "_tr_item_" + itemModel.id);
        if (menuElement == null) {
            menuElement = document.getElementById(this.component.renderId);
        }
        return menuElement;
    },
    
    _isSelectionEnabled: function() {
        return this.component.render("selectionEnabled");
    },
    
    _isTopMenuElement: function(element) {
        return element.id == this.component.renderId;
    },
    
    _processClick: function(e) {
        if (!this.component.isActive()) {
            return;
        }
        
        WebCore.DOM.preventEventDefault(e);
    
        var modelId = this._getElementModelId(e.target);
        var model;
        if (modelId) {
            model = this._menuModel.getItem(modelId);
        } else {
            model = this._menuModel;
        }
        
        this._renderMask();
        this._activateItem(model);
        
        return true;
    },
    
    renderDisplay: function() {
        WebCore.VirtualPosition.redraw(this._contentDivElement);
    },
    
    renderDispose: function(update) {
        ExtrasRender.ComponentSync.Menu.prototype.renderDispose.call(this, update);
        this._selectedItem = null;
        this._contentDivElement = null;
    },
    
    _renderMain: function() {
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
        
        var expandIcon = this.component.render("expandIcon", 
                this.client.getResourceUrl("Extras", "image/menu/ArrowDown.gif"));
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
        
        this._contentDivElement = document.createElement("div");
        this._contentDivElement.style.position = "absolute";
        this._contentDivElement.style.top = "0px";
        this._contentDivElement.style.left = "0px";
        this._contentDivElement.style.right = EchoAppRender.Extent.toCssValue(expandIconWidth);
        var insets = this.component.render("insets");
        if (insets) {
            EchoAppRender.Insets.render(insets, this._contentDivElement, "padding");
            if (height) {
                var insetsPx = EchoAppRender.Insets.toPixels(insets);
                var compensatedHeight = Math.max(0, EchoAppRender.Extent.toPixels(height) - insetsPx.top - insetsPx.top);
                this._contentDivElement.style.height = compensatedHeight + "px";
            }
        } else {
            this._contentDivElement.style.height = "100%";
        }
        EchoAppRender.FillImage.render(this.component.render("backgroundImage"), this._contentDivElement); 
        
        var contentSpanElement = document.createElement("div");
        contentSpanElement.id = this.component.renderId + "_content";
        contentSpanElement.style.height = "100%";
        contentSpanElement.style.width = "100%";
        contentSpanElement.style.overflow = "hidden";
        contentSpanElement.style.whiteSpace = "nowrap";
        EchoAppRender.Font.render(this.component.render("font"), contentSpanElement, null);
        this._contentDivElement.appendChild(contentSpanElement);
        
        relativeContainerDivElement.appendChild(this._contentDivElement);
        dropDownDivElement.appendChild(relativeContainerDivElement);
    
        WebCore.EventProcessor.add(dropDownDivElement, "click", Core.method(this, this._processClick), false);
        WebCore.EventProcessor.Selection.disable(dropDownDivElement);
    
        if (this._isSelectionEnabled()) {
            var selection = this.component.render("selection");
            if (selection) {
                this._setSelection(this._menuModel.getItemModelFromPositions(selection.split(".")), contentSpanElement);
            }
        }
        if (!this._selectedItem) {
            var selectionText = this.component.render("selectionText");
            if (selectionText) {
                contentSpanElement.appendChild(document.createTextNode(selectionText));
            }
        }
    
        return dropDownDivElement;
    },
    
    renderMenu: function(menuModel, xPosition, yPosition) {
        var menuDivElement = ExtrasRender.ComponentSync.Menu.prototype.renderMenu.call(this, menuModel, xPosition, yPosition);
        
        var menuWidth = this.component.render("menuWidth");
        if (menuWidth) {
            menuDivElement.style.width = menuWidth;
            menuDivElement.style.overflowX = "hidden";
            menuDivElement.firstChild.style.width = "100%";
        }
        var menuHeight = this.component.render("menuHeight");
        if (menuHeight) {
            var menuHeightPx = EchoAppRender.Extent.toPixels(menuHeight);
            if (WebCore.Environment.NOT_SUPPORTED_CSS_MAX_HEIGHT) {
                var measure = new WebCore.Measure(menuDivElement);
                if (measure.height > menuHeight) {
                    menuDivElement.style.height = menuHeight + "px";
                }
            } else {
                menuDivElement.style.maxHeight = menuHeight;
            }
            menuDivElement.style.overflowY = "auto";
        }
        return menuDivElement;
    },
    
    /**
     * Sets the selection to the given menu model.
     *
     * @param menuModel the model to select
     * @param contentElement the contentElement element, may be null
     */
    _setSelection: function(menuModel, contentElement) {
        if (this._selectedItem == menuModel) {
            return;
        }
        this._selectedItem = menuModel;
        
        if (!contentElement) {
            contentElement = document.getElementById(this.component.renderId + "_content");
        }
        for (var i = contentElement.childNodes.length - 1; i >= 0; --i) {
            contentElement.removeChild(contentElement.childNodes[i]);
        }
        
        if (menuModel.text) {
            if (menuModel.icon) {
                // Render Text and Icon
                var tableElement = document.createElement("table");
                var tbodyElement = document.createElement("tbody");
                var trElement = document.createElement("tr");
                var tdElement = document.createElement("td");
                var imgElement = document.createElement("img");
                EchoAppRender.ImageReference.renderImg(menuModel.icon, imgElement);
                tdElement.appendChild(imgElement);
                trElement.appendChild(tdElement);
                tdElement = document.createElement("td");
                tdElement.style.width = "3px";
                trElement.appendChild(tdElement);
                tdElement = document.createElement("td");
                tdElement.appendChild(document.createTextNode(menuModel.text));
                trElement.appendChild(tdElement);
                tbodyElement.appendChild(trElement);
                tableElement.appendChild(tbodyElement);
                contentElement.appendChild(tableElement);
            } else {
                // Render Text Only
                contentElement.appendChild(document.createTextNode(menuModel.text));
            }
        } else if (menuModel.icon) {
            // Render Icon Only
            var imgElement = document.createElement("img");
            EchoAppRender.ImageReference.renderImg(menuModel.icon, imgElement);
            contentElement.appendChild(imgElement);
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
    
    _doAction: function(menuModel) {
        var path = menuModel.getItemPositionPath().join(".");
        this.component.fireEvent({type: "action", source: this.component, data: path});
    },
    
    _getMenuElement: function(itemModel) {
        var menuElement = document.getElementById(this.component.renderId + "_tr_item_" + itemModel.id);
        if (menuElement == null) {
            menuElement = document.getElementById(this.component.renderId);
        }
        return menuElement;
    },
    
    _isTopMenuElement: function(element) {
        return element.id == this.component.renderId;
    },
    
    _processClick: function(e) {
        if (!this.component.isActive()) {
            return;
        }
        
        var modelId = this._getElementModelId(e.target);
        if (modelId) {
            WebCore.DOM.preventEventDefault(e);
            this._renderMask();
            this._activateItem(this._menuModel.getItem(modelId));
        } else {
            return true;
        }
    },
    
    _processContextClick: function(e) {
        if (!this.component.isActive()) {
            return;
        }
    
        WebCore.DOM.preventEventDefault(e);
        
        this._mousePosX = e.pageX || (e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft));
        this._mousePosY = e.pageY || (e.clientY + (document.documentElement.scrollTop || document.body.scrollTop));
        
        this._renderMask();
        this._activateItem(this._menuModel);
    },
    
    renderDispose: function(update) {
        ExtrasRender.ComponentSync.Menu.prototype.renderDispose.call(this, update);
        this._mousePosX = null;
        this._mousePosY = null;
    },
    
    _renderMain: function(update) {
        var contextMenuDivElement = document.createElement("div");
        contextMenuDivElement.id = this.component.renderId;
        
        WebCore.EventProcessor.add(contextMenuDivElement, "click", Core.method(this, this._processClick), false);
        WebCore.EventProcessor.add(contextMenuDivElement, "contextmenu", Core.method(this, this._processContextClick), false);
        
        var componentCount = this.component.getComponentCount();
        if (componentCount > 0) {
            EchoRender.renderComponentAdd(update, this.component.getComponent(0), contextMenuDivElement);
        }
        
        return contextMenuDivElement;
    },
    
    renderTopMenu: function(menuModel) {
        this.renderMenu(menuModel, this._mousePosX, this._mousePosY);
    },
    
    renderUpdate: function(update) {
        if (Core.Arrays.containsAll(ExtrasRender.ComponentSync.ContextMenu._supportedPartialProperties,
                update.getUpdatedPropertyNames(), true)) {
            // partial update
            var removedChildren = update.getRemovedChildren();
            if (removedChildren) {
                WebCore.DOM.removeNode(this._element.firstChild);
            }
            var addedChildren = update.getAddedChildren();
            if (addedChildren) {
                EchoRender.renderComponentAdd(update, addedChildren[0], this._element);
            }
            var modelUpdate = update.getUpdatedProperty("model");
            var stateModelUpdate = update.getUpdatedProperty("stateModel");
            
            var reOpenMenu = this.maskDeployed && (modelUpdate || stateModelUpdate);
            if (reOpenMenu) {
                this._closeDescendantMenus(null);
            }
            if (modelUpdate) {
                this._menuModel = modelUpdate.newValue;
            }
            if (stateModelUpdate) {
                this._stateModel = stateModelUpdate.newValue;
            }
            if (reOpenMenu) {
                this._activateItem(this._menuModel);
            }
            return false;
        }
        // full update
        ExtrasRender.ComponentSync.Menu.prototype.renderUpdate.call(this, update);
        return true;
    }
});
