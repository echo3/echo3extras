/**
 * @class 
 * ContextMenu component.
 * @base Echo.Component
 */
Extras.ContextMenu = Core.extend(Echo.Component, {

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.ContextMenu", this);
    },

    componentType: "Extras.ContextMenu"
});

/**
 * @class
 * DropDownMenu component.
 * @base Echo.Component
 */
Extras.DropDownMenu = Core.extend(Echo.Component, {

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.DropDownMenu", this);
    },

    componentType: "Extras.DropDownMenu"
});

/**
 * @class 
 * MenuBarPane component.
 * @base Echo.Component
 */
Extras.MenuBarPane = Core.extend(Echo.Component, {

    $load: function() {
        Echo.ComponentFactory.registerType("Extras.MenuBarPane", this);
    },

    componentType: "Extras.MenuBarPane"
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
Extras.MenuModel = Core.extend({
    
    $construct: function(modelId, text, icon, items) {
        this.modelId = modelId;
        this.id = Extras.uniqueId++;
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
            if (this.items[i] instanceof Extras.MenuModel) {
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
    toString: function() {
        return "MenuModel \"" + this.text + "\" Items:" + this.items.length;
    }
});

Extras.OptionModel = Core.extend({
    
    $construct: function(modelId, text, icon) {
        this.modelId = modelId;
        this.id = Extras.uniqueId++;
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
    toString: function() {
        return "OptionModel \"" + this.text + "\"";
    }
});

Extras.ToggleOptionModel = Core.extend(Extras.OptionModel, {

    $construct: function(modelId, text, selected) {
        Extras.OptionModel.call(this, modelId, text, null);
        this.selected = selected;
    }
});

Extras.RadioOptionModel = Core.extend(Extras.ToggleOptionModel, {

    $construct: function(modelId, text, selected) {
        Extras.ToggleOptionModel.call(this, modelId, text, selected);
    }
});

/**
 * A representation of a menu separator.
 */
Extras.SeparatorModel = Core.extend({

    $construct: function() {
        this.parent = null;
    }
});

Extras.MenuStateModel = Core.extend({

    $construct: function() {
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
