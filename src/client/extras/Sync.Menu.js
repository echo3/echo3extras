/**
 * Abstract base class for menu rendering peers.
 */
Extras.Sync.Menu = Core.extend(Echo.Render.ComponentSync, {
    
    $static: {
        DEFAULT_FOREGROUND: "#000000",
        DEFAULT_BACKGROUND: "#cfcfcf",
        DEFAULT_DISABLED_FOREGROUND: "#7f7f7f",
        DEFAULT_SELECTION_FOREGROUND: "#ffffff",
        DEFAULT_SELECTION_BACKGROUND: "#3f3f3f",
        DEFAULT_BORDER: "1px outset #cfcfcf",
        MAX_Z_INDEX: 65535
    }, 
    
    /**
     * The root menu model.
     * @type Extras.MenuModel
     */
    menuModel: null,
    
    /**
     * The menu state model.
     * @type Extras.MenuStateModel
     */
    stateModel: null,
    
    /**
     * The root DOM element of the rendered menu.
     * @type Element
     */
    element: null,
    
    /**
     * The active state of the menu, true when the menu is open.
     * @type Boolean
     */
    active: false,

    /** 
     * Array containing RenderedState objects for open menus. 
     * @type Boolean
     */
    _openMenuPath: null,
    
    /** 
     * Flag indicating whether menu mask is deployed. 
     * @type Boolean
     */
    _maskDeployed: false,
    
    /**
     * Reference to the mask click listener.
     */
    _processMaskClickRef: null,
    
    /** Reference to menu key press listener. */
    _processKeyPressRef: null,
    
    /**
     * The collection of named overlay elements (top/left/right/bottom) deployed to cover non-menu elements of the
     * screen with transparent DIVs when the menu is active.  This allows the menu to receive de-activation events,
     * event if a mouse click is received in an IFRAME document.
     */
    _overlay: null,
    
    $construct: function() {
        this._processMaskClickRef = Core.method(this, this._processMaskClick);
        this._processKeyPressRef = Core.method(this, this.processKeyPress);
        this._openMenuPath = [];
    },

    $abstract: {
    
        /**
         * Returns an object containing 'x' and 'y' properties indicating the position at 
         * which a submenu should be placed.
         */
        getSubMenuPosition: function(menuModel, width, height) { },

        /**
         * Renders the top level menu of the menu component (that which resides in the DOM at all times).
         * 
         * @param {Echo.Update.ComponentUpdate} the hierarchy update for which the rendering is being performed
         */
        renderMain: function(update) { }
    },
    
    $virtual: {

        /**
         * Activates the menu component.
         */
        activate: function() {
            if (this.active) {
                return false;
            }
            this.component.set("modal", true);
            this.active = true;
            this.addMask();
            
            Core.Web.DOM.focusElement(this.element);
            Core.Web.Event.add(this.element, 
                    Core.Web.Env.QUIRK_IE_KEY_DOWN_EVENT_REPEAT ? "keydown" : "keypress",
                    this._processKeyPressRef, true);
            
            return true;
        },

        /**
         * Activates a menu item.  Displays submenu if item is a submenu.  Invokes menu action if item
         * is a menu option.
         * 
         * @param {Extras.ItemModel} itemModel the item model to activate.
         */
        activateItem: function(itemModel) {
            if (this.stateModel && !this.stateModel.isEnabled(itemModel.modelId)) {
                return;
            }
            if (itemModel instanceof Extras.OptionModel) {
                this.deactivate();
                this.processAction(itemModel);
            } else if (itemModel instanceof Extras.MenuModel) {
                this._openMenu(itemModel);
            }
        },
        
        /**
         * Fires an action event in response to a menu option being activated.
         */
        processAction: function(itemModel) {
            this.component.doAction(itemModel);
        },
        
        /**
         * Key press listener.
         */
        processKeyPress: function(e) {
            if (e.keyCode == 27) {
                this.deactivate();
                return false;
            }
            return true;
        }
    },

    addMenu: function(menu) {
        this._openMenuPath.push(menu);
    },
    
    /**
     * Adds the menu mask, such that click events on elements other than the menu will be captured by the menu.
     */
    addMask: function() {
        if (this.maskDeployed) {
            return;
        }
        this.maskDeployed = true;
        this._overlayAdd(new Core.Web.Measure.Bounds(this.element));
        
        Core.Web.Event.add(document.body, "click", this._processMaskClickRef, false);
        Core.Web.Event.add(document.body, "contextmenu", this._processMaskClickRef, false);
    },
    
    /**
     * Closes all open menus.
     */
    closeAll: function() {
        while (this._openMenuPath.length > 0) {
            var menu = this._openMenuPath.pop();
            menu.close();
        }
    },
    
    /**
     * Closes all open menus which are descendants of the specified parent menu.
     * 
     * @param {Extras.MenuModel} the parent menu
     */
    closeDescendants: function(parentMenu) {
        while (parentMenu != this._openMenuPath[this._openMenuPath.length - 1]) {
            var menu = this._openMenuPath.pop();
            menu.close();
        }
    },
    
    /**
     * Deactivates the menu component, closing any open menus.
     */
    deactivate: function() {
        this.component.set("modal", false);
        if (!this.active) {
            return;
        }
        this.active = false;

        Core.Web.Event.remove(this.element, 
                Core.Web.Env.QUIRK_IE_KEY_DOWN_EVENT_REPEAT ? "keydown" : "keypress",
                this._processKeyPressRef, true);
        
        this.closeAll();
        this.removeMask();
    },
    
    /**
     * Determines if the specified menu is currently open (on-screen).
     * 
     * @param {Extras.MenuModel} menuModel the menu
     * @return true if the menu is open
     * @type Boolean
     */
    isOpen: function(menuModel) {
        for (var i = 0; i < this._openMenuPath.length; ++i) {
            if (this._openMenuPath[i].menuModel == menuModel) {
                return true;
            }
        }
        return false;
    },
    
    /**
     * Creates and adds the overlay mask elements to the screen, blocking all content except that within the specified bounds.
     * 
     * @param bounds an object containing the pixel bounds of the region NOT to be blocked, must provide top, left, width, and
     *        height integer properties
     */
    _overlayAdd: function(bounds) {
        this._overlayRemove();
        
        var bottom = bounds.top + bounds.height,
            right = bounds.left + bounds.width,
            domainBounds = new Core.Web.Measure.Bounds(this.client.domainElement);
        this._overlay = { };

        if (bounds.top > 0) {
            this._overlay.top = document.createElement("div");
            this._overlay.top.style.cssText = "position:absolute;z-index:32767;top:0;left:0;width:100%;" +
                    "height:" + bounds.top + "px;";
            this.client.domainElement.appendChild(this._overlay.top);
        }
        
        if (bottom < domainBounds.height) {
            this._overlay.bottom = document.createElement("div");
            this._overlay.bottom.style.cssText = "position:absolute;z-index:32767;bottom:0;left:0;width:100%;" +
                    "top:" + bottom + "px;";
            this.client.domainElement.appendChild(this._overlay.bottom);
        }

        if (bounds.left > 0) {
            this._overlay.left = document.createElement("div");
            this._overlay.left.style.cssText = "position:absolute;z-index:32767;left:0;" +
                    "width:" + bounds.left + "px;top:" + bounds.top + "px;height:" + bounds.height + "px;";
            this.client.domainElement.appendChild(this._overlay.left);
        }

        if (right < domainBounds.width) {
            this._overlay.right = document.createElement("div");
            this._overlay.right.style.cssText = "position:absolute;z-index:32767;right:0;" +
                    "left:" + right + "px;top:" + bounds.top + "px;height:" + bounds.height + "px;";
            this.client.domainElement.appendChild(this._overlay.right);
        }
        
        for (var name in this._overlay) {
            Echo.Sync.FillImage.render(this.client.getResourceUrl("Echo", "resource/Transparent.gif"), this._overlay[name]);
            Core.Web.VirtualPosition.redraw(this._overlay[name]);
        }
    },
    
    /**
     * Removes the overlay mask from the screen, if present.
     */
    _overlayRemove: function() {
        if (!this._overlay) {
            return;
        }
        for (var name in this._overlay) {
            this.client.domainElement.removeChild(this._overlay[name]);
        }
        this._overlay = null;
    },
    
    /**
     * Opens a menu.
     * 
     * @param {Extras.MenuModel} menuModel the menu to open
     */
    _openMenu: function(menuModel) {
        if (this.isOpen(menuModel)) {
            return;
        }
        
        var subMenu = new Extras.Sync.Menu.RenderedMenu(this, menuModel);
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
        var windowBounds = new Core.Web.Measure.Bounds(document.body);
        
        if (position.x + subMenu.width > windowBounds.width) {
            position.x = windowBounds.width - subMenu.width;
            if (position.x < 0) {
                position.x = 0;
            }
        }
        if (position.y + subMenu.height > windowBounds.height) {
            position.y = windowBounds.height - subMenu.height;
            if (position.y < 0) {
                position.y = 0;
            }
        }
        
        subMenu.add(position.x, position.y);
        
        this.addMenu(subMenu);
    },

    /**
     * Handler for clicks on the overlay mask: de-activates menu.
     */
    _processMaskClick: function(e) {
        this.deactivate();
        return true;
    },
    
    /** 
     * Removes the menu mask.
     */
    removeMask: function() {
        if (!this.maskDeployed) {
            return;
        }
        this._overlayRemove();
        this.maskDeployed = false;
        Core.Web.Event.remove(document.body, "click", this._processMaskClickRef, false);
        Core.Web.Event.remove(document.body, "contextmenu", this._processMaskClickRef, false);
    },
    
    renderAdd: function(update, parentElement) {
        this.menuModel = this.component.get("model");
        this.stateModel = this.component.get("stateModel");
        
        this.element = this.renderMain(update);
        this.element.tabIndex = "-1";
        this.element.style.outlineStyle = "none";
        parentElement.appendChild(this.element);
    },
    
    renderDispose: function(update) {
        this.deactivate();
    },
    
    renderUpdate: function(update) {
        if (update.isUpdatedPropertySetIn({modal: true})) {
            // Do not re-render on update to modal state.
            return;
        }
        var element = this.element;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return false;
    }
});

Extras.Sync.Menu.RenderedMenu = Core.extend({

    $static: {
        defaultIconTextMargin: 5,
        defaultMenuInsets: "2px",
        defaultMenuItemInsets: "1px 12px"
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
        if (animationTime && !Core.Web.Env.NOT_SUPPORTED_CSS_OPACITY) {
            this.element.style.opacity = 0;
            var fadeRunnable = new Extras.Sync.FadeRunnable(this.element, true, 1, animationTime);
            Core.Web.Scheduler.add(fadeRunnable);
        }
        document.body.appendChild(this.element);

        Core.Web.Event.add(this.element, "click", Core.method(this, this._processClick), false);
        Core.Web.Event.add(this.element, "mouseover", Core.method(this, this._processItemEnter), false);
        Core.Web.Event.add(this.element, "mouseout", Core.method(this, this._processItemExit), false);
        Core.Web.Event.Selection.disable(this.element);
    },

    close: function() {
        Core.Web.Event.removeAll(this.element);
        document.body.removeChild(this.element);
        this.element = null;
        this.itemElements = null;
        this._activeItem = null;
    },

    create: function() {
        var i,
            item,
            img,
            menuItemContentTd,
            menuItemIconTd,
            menuItemTr;

        this.element = document.createElement("div");
        this.element.style.position = "absolute";
        this.element.style.zIndex = Extras.Sync.Menu.MAX_Z_INDEX;
        
        var opacity = (Core.Web.Env.NOT_SUPPORTED_CSS_OPACITY ? 100 : this.component.render("menuOpacity", 100)) / 100;

        var menuContentDiv = document.createElement("div");
        menuContentDiv.style.cssText = "position:relative;z-index:10;";
        this.element.appendChild(menuContentDiv);

        Echo.Sync.LayoutDirection.render(this.component.getLayoutDirection(), menuContentDiv);
        Echo.Sync.Insets.render(Extras.Sync.Menu.RenderedMenu.defaultMenuInsets, 
                menuContentDiv, "padding");
        Echo.Sync.Border.render(this.component.render("menuBorder", Extras.Sync.Menu.DEFAULT_BORDER),
                menuContentDiv);
        var foreground;
        var menuForeground = this.component.render("menuForeground");
        if (menuForeground) {
            foreground = menuForeground;
        } else {
            foreground = this.component.render("foreground", Extras.Sync.Menu.DEFAULT_FOREGROUND);
        }
        Echo.Sync.Color.render(foreground, menuContentDiv, "color");

        // Apply menu font if it is set, or apply default font 
        // if it is set and the menu font is NOT set.
        var font = this.component.render("menuFont");
        if (!font) {
            font = this.component.render("font");
        }
        if (font) {
            Echo.Sync.Font.render(font, menuContentDiv);
        }

        var backgroundDiv;
        if (opacity < 1) {
            backgroundDiv = document.createElement("div");
            backgroundDiv.style.cssText = "position:absolute;z-index:1;width:100%;height:100%;top:0;bottom:0;";
            backgroundDiv.style.opacity = opacity;
            this.element.appendChild(backgroundDiv);
        } else {
            backgroundDiv = this.element;
        }

        var background;
        var menuBackground = this.component.render("menuBackground");
        if (menuBackground) {
            background = menuBackground;
        } else {
            background = this.component.render("background", Extras.Sync.Menu.DEFAULT_BACKGROUND);
        }
        Echo.Sync.Color.render(background, backgroundDiv, "backgroundColor");

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
            Echo.Sync.FillImage.render(backgroundImage, backgroundDiv, null); 
        }

        var menuTable = document.createElement("table");
        menuTable.style.borderCollapse = "collapse";
        menuContentDiv.appendChild(menuTable);

        var menuTbody = document.createElement("tbody");
        menuTable.appendChild(menuTbody);

        var items = this.menuModel.items;

        // Determine if any icons are present.
        var hasIcons = false;
        for (i = 0; i < items.length; ++i) {
            item = items[i];
            if (item.icon || item instanceof Extras.ToggleOptionModel) {
                hasIcons = true;
                break;
            }
        }
        var textPadding, iconPadding;

        if (hasIcons) {
            var pixelInsets = Echo.Sync.Insets.toPixels(Extras.Sync.Menu.RenderedMenu.defaultMenuItemInsets);
            iconPadding = "0px 0px 0px " + pixelInsets.left + "px";
            textPadding = pixelInsets.top + "px " + pixelInsets.right + "px " + 
                    pixelInsets.bottom + "px " + pixelInsets.left + "px";
        } else {
            textPadding = Extras.Sync.Menu.RenderedMenu.defaultMenuItemInsets;
        }

        for (i = 0; i < items.length; ++i) {
            item = items[i];
            if (item instanceof Extras.OptionModel || item instanceof Extras.MenuModel) {
                menuItemTr = document.createElement("tr");
                this.itemElements[item.id] = menuItemTr;
                menuItemTr.style.cursor = "pointer";
                menuTbody.appendChild(menuItemTr);

                if (hasIcons) {
                    menuItemIconTd = document.createElement("td");
                    Echo.Sync.Insets.render(iconPadding, menuItemIconTd, "padding");
                    if (item instanceof Extras.ToggleOptionModel) {
                        var iconIdentifier;
                        var selected = this.stateModel && this.stateModel.isSelected(item.modelId);
                        if (item instanceof Extras.RadioOptionModel) {
                            iconIdentifier = selected ? "image/menu/RadioOn.gif" : "image/menu/RadioOff.gif";
                        } else {
                            iconIdentifier = selected ? "image/menu/ToggleOn.gif" : "image/menu/ToggleOff.gif";
                        }
                        img = document.createElement("img");
                        img.src = this.client.getResourceUrl("Extras", iconIdentifier);
                        menuItemIconTd.appendChild(img);
                    } else if (item.icon) {
                        img = document.createElement("img");
                        Echo.Sync.ImageReference.renderImg(item.icon, img);
                        menuItemIconTd.appendChild(img);
                    }
                    menuItemTr.appendChild(menuItemIconTd);
                }

                menuItemContentTd = document.createElement("td");
                Echo.Sync.Insets.render(textPadding, menuItemContentTd, "padding");
                var lineWrap = this.component.render("lineWrap");
                if (lineWrap != null && !lineWrap) {
                    menuItemContentTd.style.whiteSpace = "nowrap";
                }
                if (this.stateModel && !this.stateModel.isEnabled(item.modelId)) {
                    Echo.Sync.Color.render(this.component.render("disabledForeground", 
                            Extras.Sync.Menu.DEFAULT_DISABLED_FOREGROUND), menuItemContentTd, "color");
                }
                menuItemContentTd.appendChild(document.createTextNode(item.text));
                menuItemTr.appendChild(menuItemContentTd);

                if (item instanceof Extras.MenuModel) {
                    // Submenus have adjacent column containing 'expand' icons.
                    var menuItemArrowTd = document.createElement("td");
                    menuItemArrowTd.style.textAlign = "right";
                    img = document.createElement("img");
                    var expandImage = this.component.render("menuExpandIcon", 
                            this.client.getResourceUrl("Extras", "image/menu/ArrowRight.gif"));
                    img.setAttribute("src", expandImage.url ? expandImage.url : expandImage);
                    img.setAttribute("alt", "");
                    menuItemArrowTd.appendChild(img);
                    menuItemTr.appendChild(menuItemArrowTd);
                } else {
                    // Menu items fill both columns.
                    menuItemContentTd.colSpan = 2;
                }
            } else if (item instanceof Extras.SeparatorModel) {
                if (i === 0 || i === items.length - 1 || items[i - 1] instanceof Extras.SeparatorModel ||
                        items[i + 1] instanceof Extras.SeparatorModel) {
                    // Ignore separators at zero position.
                    continue;
                }
                menuItemTr = document.createElement("tr");
                menuTbody.appendChild(menuItemTr);
                menuItemContentTd = document.createElement("td");
                menuItemContentTd.colSpan = hasIcons ? 3 : 2;
                menuItemContentTd.style.padding = "3px 0px";
                var hrDiv = document.createElement("div");
                hrDiv.style.cssText = "border-top:1px solid #a7a7a7;height:0;font-size:1px;line-height:0";
                menuItemContentTd.appendChild(hrDiv);
                menuItemTr.appendChild(menuItemContentTd);
            }
        }

        var bounds = new Core.Web.Measure.Bounds(this.element);
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
            return this.menuModel.findItem(itemModelId);
        }
    },
    
    getSubMenuPosition: function(menuModel, width, height) {
        var menuElement = this.itemElements[menuModel.id];
        var itemBounds = new Core.Web.Measure.Bounds(menuElement);
        var menuBounds = new Core.Web.Measure.Bounds(this.element);
        return { x: menuBounds.left + menuBounds.width, y: itemBounds.top };
    },
    
    _processClick: function(e) {
        Core.Web.DOM.preventEventDefault(e);
        var itemModel = this._getItemModel(Core.Web.DOM.getEventTarget(e));
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
        if (!this.client || !this.client.verifyInput(this.component) || Core.Web.dragInProgress) {
            return true;
        }
        
        var element = this._getItemElement(Core.Web.DOM.getEventTarget(e));
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

        if (itemModel instanceof Extras.MenuModel) {
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
            Echo.Sync.FillImage.render(this.component.render("selectionBackgroundImage"), element);
            Echo.Sync.Color.render(this.component.render("selectionBackground", 
                    Extras.Sync.Menu.DEFAULT_SELECTION_BACKGROUND), element, "backgroundColor");
            Echo.Sync.Color.render(this.component.render("selectionForeground", 
                    Extras.Sync.Menu.DEFAULT_SELECTION_FOREGROUND), element, "color");
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
Extras.Sync.ContextMenu = Core.extend(Extras.Sync.Menu, {

    $load: function() {
        Echo.Render.registerPeer("Extras.ContextMenu", this);
    },
    
    _mouseX: null,
    _mouseY: null,
    
    getSubMenuPosition: function(menuModel, width, height) {
        return { x: this._mouseX, y: this._mouseY };
    },

    _processContextClick: function(e) {
        if (!this.client || !this.client.verifyInput(this.component) || Core.Web.dragInProgress) {
            return true;
        }
    
        Core.Web.DOM.preventEventDefault(e);
        
        this._mouseX = e.pageX || (e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft));
        this._mouseY = e.pageY || (e.clientY + (document.documentElement.scrollTop || document.body.scrollTop));
        
        this.activate();
        this.activateItem(this.menuModel);
    },

    renderDispose: function(update) {
        Core.Web.Event.removeAll(this.element);
        Extras.Sync.Menu.prototype.renderDispose.call(this, update);
    },
    
    renderMain: function(update) {
        var contextMenuDiv = document.createElement("div");
        contextMenuDiv.id = this.component.renderId;
        
        var activationMode = this.component.render("activationMode", Extras.ContextMenu.ACTIVATION_MODE_CONTEXT_CLICK);
        if (activationMode & Extras.ContextMenu.ACTIVATION_MODE_CLICK) {
            Core.Web.Event.add(contextMenuDiv, "click", Core.method(this, this._processContextClick), false);
        }
        if (activationMode & Extras.ContextMenu.ACTIVATION_MODE_CONTEXT_CLICK) {
            Core.Web.Event.add(contextMenuDiv, "contextmenu", Core.method(this, this._processContextClick), false);
        }
        
        var componentCount = this.component.getComponentCount();
        if (componentCount > 0) {
            Echo.Render.renderComponentAdd(update, this.component.getComponent(0), contextMenuDiv);
        }
        
        return contextMenuDiv;
    },
    
    renderUpdate: function(update) {
        if (update.isUpdatedPropertySetIn({ stateModel: true, model: true })) {
            // partial update
            var removedChildren = update.getRemovedChildren();
            if (removedChildren) {
                Core.Web.DOM.removeNode(this.element.firstChild);
            }
            var addedChildren = update.getAddedChildren();
            if (addedChildren) {
                Echo.Render.renderComponentAdd(update, addedChildren[0], this.element);
            }
            var modelUpdate = update.getUpdatedProperty("model");
            var stateModelUpdate = update.getUpdatedProperty("stateModel");
            
            var reOpenMenu = this.maskDeployed && (modelUpdate || stateModelUpdate);
            if (reOpenMenu) {
                this.deactivate();
            }
            if (modelUpdate) {
                this.menuModel = modelUpdate.newValue;
            }
            if (stateModelUpdate) {
                this.stateModel = stateModelUpdate.newValue;
            }
            if (reOpenMenu) {
                this.activate();
                this.activateItem(this.menuModel);
            }
            return false;
        }
        // full update
        Extras.Sync.Menu.prototype.renderUpdate.call(this, update);
        return true;
    }
});

//FIXME 'selection' property should be an itemmodel id.  We should have a remote peer for this path-string business.
/**
 * Component rendering peer: DropDownMenu
 */
Extras.Sync.DropDownMenu = Core.extend(Extras.Sync.Menu, {

    $load: function() {
        Echo.Render.registerPeer("Extras.DropDownMenu", this);
    },
    
    _containerDiv: null,
    _contentDiv: null,
    _selectedItem: null,
    
    _createContent: function(itemModel) {
        var img;
        if (itemModel.icon) {
            if (itemModel.text) {
                // Render Text and Icon
                var table = document.createElement("table");
                table.style.cssText = "border-collapse:collapse;padding:0;";
                var tbody = document.createElement("tbody");
                var tr = document.createElement("tr");
                var td = document.createElement("td");
                td.style.cssText = "padding:0vertical-align:top;";
                img = document.createElement("img");
                Echo.Sync.ImageReference.renderImg(itemModel.icon, img);
                td.appendChild(img);
                tr.appendChild(td);
                td = document.createElement("td");
                td.style.cssText = "padding:width:3px;";
                var spacingDiv = document.createElement("div");
                spacingDiv.style.cssText = "width:3px";
                td.appendChild(spacingDiv);
                tr.appendChild(td);
                td = document.createElement("td");
                td.style.cssText = "padding:0vertical-align:top;";
                td.appendChild(document.createTextNode(itemModel.text));
                tr.appendChild(td);
                tbody.appendChild(tr);
                table.appendChild(tbody);
                return table;
            } else {
                // Render Icon Only
                img = document.createElement("img");
                Echo.Sync.ImageReference.renderImg(itemModel.icon, img);
                return img;
            }
        } else {
            // Text (or Empty)
            return document.createTextNode(itemModel.text ? itemModel.text : "\u00a0");
        }
    },

    getSubMenuPosition: function(menuModel, width, height) {
        var bounds = new Core.Web.Measure.Bounds(this.element);
        return { x: bounds.left, y: bounds.top + bounds.height };
    },
    
    processAction: function(itemModel) {
        if (this.component.render("selectionEnabled")) {
            this._setSelection(itemModel);
        }
        var path = itemModel.getItemPositionPath().join(".");
        this.component.set("selection", path);
        Extras.Sync.Menu.prototype.processAction.call(this, itemModel);
    },

    _processClick: function(e) {
        if (!this.client || !this.client.verifyInput(this.component) || Core.Web.dragInProgress) {
            return true;
        }
        
        Core.Web.DOM.preventEventDefault(e);
    
        this.activate();
        this.activateItem(this.menuModel);
    },
    
    renderDisplay: function() {
        Core.Web.VirtualPosition.redraw(this._containerDiv);
    },
    
    renderDispose: function(update) {
        Core.Web.Event.removeAll(this.element);
        this._containerDiv = null;
        Extras.Sync.Menu.prototype.renderDispose.call(this, update);
    },
    
    renderMain: function() {
        var dropDownDiv = document.createElement("div");
        dropDownDiv.id = this.component.renderId;
        dropDownDiv.style.cssText = "overflow:hidden;cursor:pointer;";
        
        Echo.Sync.LayoutDirection.render(this.component.getLayoutDirection(), dropDownDiv);
        Echo.Sync.Color.render(this.component.render("foreground", Extras.Sync.Menu.DEFAULT_FOREGROUND), dropDownDiv, "color");
        Echo.Sync.Color.render(this.component.render("background", Extras.Sync.Menu.DEFAULT_BACKGROUND), 
                dropDownDiv, "backgroundColor");
        Echo.Sync.FillImage.render(this.component.render("backgroundImage"), dropDownDiv); 
        Echo.Sync.Border.render(this.component.render("border", Extras.Sync.Menu.DEFAULT_BORDER), dropDownDiv); 
        
        var relativeDiv = document.createElement("div");
        relativeDiv.style.cssText = "position:relative;overflow:hidden;";
        dropDownDiv.appendChild(relativeDiv);
        
        Echo.Sync.Extent.render(this.component.render("width"), dropDownDiv, "width", true, true);
        Echo.Sync.Extent.render(this.component.render("height"), relativeDiv, "height", false, true);

        var expandIcon = this.component.render("expandIcon", this.client.getResourceUrl("Extras", "image/menu/ArrowDown.gif"));

        this._contentDiv = document.createElement("div");
        this._contentDiv.style.cssText = "position:absolute;white-space:nowrap;";
        Echo.Sync.Insets.render(this.component.render("insets", "2px 5px"), this._contentDiv, "padding");
        
        relativeDiv.appendChild(this._contentDiv);
        var expandElement = document.createElement("span");
        expandElement.style.position = "absolute";
        expandElement.style.top = "2px";
        expandElement.style.right = "2px";

        var img = document.createElement("img");
        img.style.verticalAlign = "middle";
        Echo.Sync.ImageReference.renderImg(expandIcon, img);
        expandElement.appendChild(img);

        relativeDiv.appendChild(expandElement);
    
        Core.Web.Event.add(dropDownDiv, "click", Core.method(this, this._processClick), false);
        Core.Web.Event.Selection.disable(dropDownDiv);

        if (this.component.render("selectionEnabled")) {
            var selection = this.component.render("selection");
            if (selection) {
                this._selectedItem = this.menuModel.getItemModelFromPositions(selection.split("."));
            }
        } else {
            this._selectedItem = null;
        }
        
        if (this._selectedItem) {
            this._contentDiv.appendChild(this._createContent(this._selectedItem));
        } else {
            var contentText = this.component.render("selectionText");
            this._contentDiv.appendChild(document.createTextNode(contentText ? contentText : "\u00a0"));
        }
        
        if (!this.component.render("height")) {
            var contentBounds = new Core.Web.Measure.Bounds(this._contentDiv);
            relativeDiv.style.height = contentBounds.height + "px";
        }

        return dropDownDiv;
    },

    /**
     * Sets the selection to the given menu model.
     *
     * @param itemModel the model to select
     */
    _setSelection: function(itemModel) {
        this._selectedItem = itemModel;
        for (var i = this._contentDiv.childNodes.length - 1; i >= 0; --i) {
            this._contentDiv.removeChild(this._contentDiv.childNodes[i]);
        }
        this._contentDiv.appendChild(this._createContent(itemModel));
    }
});    

/**
 * Component rendering peer: MenuBarPane
 */
Extras.Sync.MenuBarPane = Core.extend(Extras.Sync.Menu, {

    $static: {
        _defaultItemInsets: "0px 12px"
    },
    
    $load: function() {
       Echo.Render.registerPeer("Extras.MenuBarPane", this);
    },
    
    _activeItem: null,
    _menuBarTable: null,
    _menuBarBorderHeight: null,
    itemElements: null,
    
    $construct: function() {
        Extras.Sync.Menu.call(this);
        this.itemElements = {};
    },
    
    activate: function() {
        if (Extras.Sync.Menu.prototype.activate.call(this)) {
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
            return this.menuModel.findItem(itemModelId);
        }
    },
    
    getPreferredSize: function() {
        this._menuBarTable.style.height = "";
        var insets = Echo.Sync.Insets.toPixels(this.component.render("insets", Extras.MenuBarPane.DEFAULT_INSETS));
        return { height: new Core.Web.Measure.Bounds(this.element).height + insets.top + insets.bottom };
    },
    
    getSubMenuPosition: function(menuModel, width, height) {
        var itemElement = this.itemElements[menuModel.id];
        if (!itemElement) {
            throw new Error("Invalid menu: " + menuModel);
        }
        
        var containerBounds = new Core.Web.Measure.Bounds(this.element);
        var itemBounds = new Core.Web.Measure.Bounds(itemElement);

        return { x: itemBounds.left, y: containerBounds.top + containerBounds.height };
    },
    
    _processClick: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true;
        }
        
        Core.Web.DOM.preventEventDefault(e);

        var itemModel = this._getItemModel(Core.Web.DOM.getEventTarget(e));
        if (itemModel) {
            if (itemModel instanceof Extras.OptionModel) {
                this.deactivate();
                this.processAction(itemModel);
            } else {
                this.activate();
                this._setActiveItem(itemModel, true);
            }
        } else {
            this.deactivate();
        }
    },
    
    _processItemEnter: function(e) {
        this._processRollover(e, true);
    },
    
    _processItemExit: function(e) {
        this._processRollover(e, false);
    },
    
    _processRollover: function(e, state) {
        if (!this.client || !this.client.verifyInput(this.component) || Core.Web.dragInProgress) {
            return true;
        }
        
        var element = this._getItemElement(Core.Web.DOM.getEventTarget(e));
        if (!element) {
            return;
        }
        var itemModel = this._getItemModel(element);
        
        if (this.stateModel && !this.stateModel.isEnabled(itemModel.modelId)) {
            return;
        }
        
        if (this.active) {
            if (state) {
                this._setActiveItem(itemModel, itemModel instanceof Extras.MenuModel);
            }
        } else {
            this._setItemHighlight(itemModel, state);
        }
    },
    
    renderDisplay: function() {
        Core.Web.VirtualPosition.redraw(this.element);
        var bounds = new Core.Web.Measure.Bounds(this.element.parentNode);
        var height = bounds.height - this._menuBarBorderHeight;
        this._menuBarTable.style.height = height <= 0 ? "" : height + "px";
    },

    renderDispose: function(update) {
        this._menuBarTable = null;
        Core.Web.Event.removeAll(this.element);
        Extras.Sync.Menu.prototype.renderDispose.call(this, update);
    },
    
    renderMain: function(update) {
        var menuBarDiv = document.createElement("div");
        menuBarDiv.id = this.component.renderId;
        menuBarDiv.style.cssText = "overflow:hidden;";
        
        Echo.Sync.renderComponentDefaults(this.component, menuBarDiv);
        var border = this.component.render("border", Extras.Sync.Menu.DEFAULT_BORDER);
        this._menuBarBorderHeight = Echo.Sync.Border.getPixelSize(border, "top") + Echo.Sync.Border.getPixelSize(border, "bottom"); 
        Echo.Sync.Border.render(border, menuBarDiv, "borderTop");
        Echo.Sync.Border.render(border, menuBarDiv, "borderBottom");
        Echo.Sync.FillImage.render(this.component.render("backgroundImage"), menuBarDiv); 
        
        this._menuBarTable = document.createElement("table");
        this._menuBarTable.style.borderCollapse = "collapse";
        menuBarDiv.appendChild(this._menuBarTable);
        
        var menuBarTbody = document.createElement("tbody");
        this._menuBarTable.appendChild(menuBarTbody);
        
        var menuBarTr = document.createElement("tr");
        menuBarTbody.appendChild(menuBarTr);
        
        if (this.menuModel != null) {
            var items = this.menuModel.items;
            for (var i = 0; i < items.length; ++i) {
                var item = items[i];
                if (item instanceof Extras.OptionModel || item instanceof Extras.MenuModel) {
                    var menuBarItemTd = document.createElement("td");
                    this.itemElements[item.id] = menuBarItemTd;
                    menuBarItemTd.style.padding = "0px";
                    menuBarItemTd.style.cursor = "pointer";
                    menuBarTr.appendChild(menuBarItemTd);
                    var menuBarItemDiv = document.createElement("div");
                    menuBarItemDiv.style.whiteSpace = "nowrap";
                    Echo.Sync.Insets.render(Extras.Sync.MenuBarPane._defaultItemInsets, 
                            menuBarItemDiv, "padding");
                    menuBarItemTd.appendChild(menuBarItemDiv);
                    if (item.icon) {
                        // FIXME no load listeners being set on images for auto-resizing yet.
                        var img = document.createElement("img");
                        img.style.verticalAlign = "middle";
                        img.src = item.icon;
                        menuBarItemDiv.appendChild(img);
                        if (item.text) {
                            // FIXME Does not handle RTL.
                            img.style.paddingRight = "1ex";
                        }
                    }
                    if (item.text) {
                        var textSpan = document.createElement("span");
                        textSpan.style.verticalAlign = "middle";
                        textSpan.appendChild(document.createTextNode(item.text));
                        menuBarItemDiv.appendChild(textSpan);
                    }
                }
            }
        }
        
        Core.Web.Event.add(menuBarDiv, "click", Core.method(this, this._processClick), false);
        Core.Web.Event.add(menuBarDiv, "mouseover", Core.method(this, this._processItemEnter), false);
        Core.Web.Event.add(menuBarDiv, "mouseout", Core.method(this, this._processItemExit), false);
        Core.Web.Event.Selection.disable(menuBarDiv);
    
        return menuBarDiv;
    },
    
    _setActiveItem: function(itemModel, execute) {
        if (this._activeItem == itemModel) {
            return;
        }
        
        if (this._activeItem) {
            this._setItemHighlight(this._activeItem, false);
            this._activeItem = null;
        }
    
        if (execute) {
            this.activateItem(itemModel);
        }

        if (itemModel) {
            this._activeItem = itemModel;
            this._setItemHighlight(this._activeItem, true);
        }
    },
    
    _setItemHighlight: function(itemModel, state) {
        var element = this.itemElements[itemModel.id];
        if (state) {
            Echo.Sync.FillImage.render(this.component.render("selectionBackgroundImage"), element);
            Echo.Sync.Color.render(this.component.render("selectionBackground", 
                    Extras.Sync.Menu.DEFAULT_SELECTION_BACKGROUND), element, "backgroundColor");
            Echo.Sync.Color.render(this.component.render("selectionForeground", 
                    Extras.Sync.Menu.DEFAULT_SELECTION_FOREGROUND), element, "color");
        } else {
            element.style.backgroundImage = "";
            element.style.backgroundColor = "";
            element.style.color = "";
        } 
    }
});
