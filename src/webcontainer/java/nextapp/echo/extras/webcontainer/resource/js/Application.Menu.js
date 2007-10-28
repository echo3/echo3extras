/**
 * @class 
 * ContextMenu component.
 */
ExtrasApp.ContextMenu = EchoCore.extend(EchoApp.Component, {

    componentType: "ExtrasApp.ContextMenu",
    
    globalInitialize: function() {
        EchoApp.ComponentFactory.registerType("ExtrasApp.ContextMenu", this);
    },
    
    /**
     * Creates a new ContextMenu.
     * 
     * @constructor
     * @base EchoApp.Component
     */
    initialize: function(properties) {
        EchoApp.Component.prototype.initialize.call(this, properties);
    }
});

/**
 * @class
 * DropDownMenu component.
 */
ExtrasApp.DropDownMenu = EchoCore.extend(EchoApp.Component, {

    componentType: "ExtrasApp.DropDownMenu",

    globalInitialize: function() {
        EchoApp.ComponentFactory.registerType("ExtrasApp.DropDownMenu", this);
    },

    /**
     * Creates a new DropDownMenu.
     * 
     * @constructor
     * @base EchoApp.Component
     */
    initialize: function(properties) {
        EchoApp.Component.prototype.initialize.call(this, properties);
    }
});

/**
 * @class 
 * MenuBarPane component.
 */
ExtrasApp.MenuBarPane = EchoCore.extend(EchoApp.Component, {

    componentType: "ExtrasApp.MenuBarPane",

    globalInitialize: function() {
        EchoApp.ComponentFactory.registerType("ExtrasApp.MenuBarPane", this);
    },

    /**
     * Creates a new MenuBarPane.
     * 
     * @constructor
     * @base EchoApp.Component
     */
    initialize: function(properties) {
        EchoApp.Component.prototype.initialize.call(this, properties);
    }
});

/**
 * Representation of a menu that may contain submenus, options, and separators.
 *
 * @param modelId {String} the id of the menu model
 * @param text {String} the title of the menu model which will appear in its parent menu
 *        when this menu is used as a submenu
 * @param icon {String} the icon of the menu model which will appear in its parent menu
 *        when this menu is used as a submenu
 */
ExtrasApp.MenuModel = EchoCore.extend({
    
    initialize: function(modelId, text, icon, items) {
        this.modelId = modelId;
        this.id = ExtrasApp.uniqueId++;
        this.parent = null;
        this.text = text;
        this.icon = icon;
        if (items) {
            for (var i = 0; i < items.length; ++i) {
                items[i].parent = this;
            }
        }
        this.items = items ? items : [];
    },
    
    /**
     * Adds an item to the MenuModel.
     *
     * @param item the item (must be a MenuModel, OptionModel, or SeparatorModel.
     */
    addItem: function(item) {
        this.items.push(item);
        item.parent = this;
    },
    
    getItem: function(id) {
        var i;
        for (i = 0; i < this.items.length; ++i) {
            if (this.items[i].id == id) {
                return this.items[i];
            }
        }
        for (i = 0; i < this.items.length; ++i) {
            if (this.items[i] instanceof ExtrasApp.MenuModel) {
                var itemModel = this.items[i].getItem(id);
                if (itemModel) {
                    return itemModel;
                }
            }
        }
        return null;
    },
    
    indexOfItem: function(item) {
        for (var i = 0; i < this.items.length; ++i) {
            if (this.items[i] == item) {
                return i;
            }
        }
        return -1;
    },
    
    getItemModelFromPositions: function(itemPositions) {
        var menuModel = this;
        for (var i = 0; i < itemPositions.length; ++i) {
            menuModel = menuModel.items[parseInt(itemPositions[i])];
        }
        return menuModel;
    },
    
    /**
     * toString() implementation.
     */
    $toString: function() {
        return "MenuModel \"" + this.text + "\" Items:" + this.items.length;
    }
});

ExtrasApp.OptionModel = EchoCore.extend({
    
    initialize: function(modelId, text, icon) {
        this.modelId = modelId;
        this.id = ExtrasApp.uniqueId++;
        this.parent = null;
        this.text = text;
        this.icon = icon;
    },
    
    /**
     * Returns an array containing the path of this model to its most distant ancestor, consisting of 
     * positions.
     * 
     * @return the array of positions.
     * @type {Array}
     */
    getItemPositionPath: function() {
        var path = [];
        var itemModel = this;
        while (itemModel.parent != null) {
            path.unshift(itemModel.parent.indexOfItem(itemModel));
            itemModel = itemModel.parent;
        }
        return path;
    },
    
    /**
     * toString() implementation.
     */
    $toString: function() {
        return "OptionModel \"" + this.text + "\"";
    }
});

ExtrasApp.ToggleOptionModel = EchoCore.extend(ExtrasApp.OptionModel, {

    initialize: function(modelId, text, selected) {
        ExtrasApp.OptionModel.prototype.initialize.call(this, modelId, text, null)
        this.selected = selected;
    }
});

ExtrasApp.RadioOptionModel = EchoCore.extend(ExtrasApp.ToggleOptionModel, {

    initialize: function(modelId, text, selected) {
        ExtrasApp.ToggleOptionModel.prototype.initialize.call(this, modelId, text, selected)
    }
});

/**
 * A representation of a menu separator.
 */
ExtrasApp.SeparatorModel = EchoCore.extend({

    initialize: function() {
        this.parent = null;
    }
});

ExtrasApp.MenuStateModel = EchoCore.extend({

    initialize: function() {
        this._disabledItems = [];
        this._selectedItems = [];
    },
    
    isEnabled: function(modelId) {
    	if (modelId) {
    		for (var i = 0; i < this._disabledItems.length; i++) {
    			if (this._disabledItems[i] == modelId) {
    				return false;
    			}
    		}
    	}
    	return true;
    },
    
    isSelected: function(modelId) {
    	if (modelId) {
    		for (var i = 0; i < this._selectedItems.length; i++) {
    			if (this._selectedItems[i] == modelId) {
    				return true;
    			}
    		}
    	}
    	return false;
    },
    
    setEnabled: function(modelId, enabled) {
    	if (!enabled) {
    		this._disabledItems.push(modelId);
    	}
    },
    
    setSelected: function(modelId, selected) {
    	if (selected) {
    		this._selectedItems.push(modelId);
    	}
    }
});
