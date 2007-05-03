/**
 * Representation of a menu that may contain submenus, options, and separators.
 *
 * @param text {String} the title of the menu model which will appear in its parent menu
 *        when this menu is used as a submenu
 * @param icon {String} the icon of the menu model which will appear in its parent menu
 *        when this menu is used as a submenu
 */
ExtrasApp.MenuModel = function(text, icon) {
    this.id = ExtrasApp.uniqueId++;
    this.parent = null;
    this.text = text;
    this.icon = icon;
    this.items = new Array();
};

/**
 * Adds an item to the MenuModel.
 *
 * @param item the item (must be a MenuModel, OptionModel, or SeparatorModel.
 */
ExtrasApp.MenuModel.prototype.addItem = function(item) {
    this.items.push(item);
    item.parent = this;
};

ExtrasApp.MenuModel.prototype.getItem = function(id) {
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
};

ExtrasApp.MenuModel.prototype.indexOfItem = function(item) {
    for (var i = 0; i < this.items.length; ++i) {
        if (this.items[i] == item) {
            return i;
        }
    }
    return -1;
};

ExtrasApp.MenuModel.prototype.getItemModelFromPositions = function(itemPositions) {
    var menuModel = this;
    for (var i = 0; i < itemPositions.length; ++i) {
        menuModel = menuModel.items[parseInt(itemPositions[i])];
    }
    return menuModel;
};

/**
 * toString() implementation.
 */
ExtrasApp.MenuModel.prototype.toString = function() {
    return "MenuModel \"" + this.text + "\" Items:" + this.items.length;
};

ExtrasApp.OptionModel = function(text, icon) {
    this.id = ExtrasApp.uniqueId++;
    this.parent = null;
    this.text = text;
    this.icon = icon;
};

/**
 * Returns an array containing the path of this model to its most distant ancestor, consisting of 
 * positions.
 * 
 * @return the array of positions.
 * @type {Array}
 */
ExtrasApp.OptionModel.prototype.getItemPositionPath = function() {
    var path = new Array();
    var itemModel = this;
    while (itemModel.parent != null) {
        path.unshift(itemModel.parent.indexOfItem(itemModel));
        itemModel = itemModel.parent;
    }
    return path;
};

/**
 * toString() implementation.
 */
ExtrasApp.OptionModel.prototype.toString = function() {
    return "OptionModel \"" + this.text + "\"";
};

ExtrasApp.ToggleOptionModel = function(text, selected) {
    this.id = ExtrasApp.uniqueId++;
    this.text = text;
    this.selected = selected;
};

ExtrasApp.ToggleOptionModel.prototype = new ExtrasApp.OptionModel(null, null);

ExtrasApp.RadioOptionModel = function(text, selected) {
    this.id = ExtrasApp.uniqueId++;
    this.text = text;
    this.selected = selected;
};

ExtrasApp.RadioOptionModel.prototype = new ExtrasApp.ToggleOptionModel(null, null);

/**
 * A representation of a menu separator.
 */
ExtrasApp.SeparatorModel = function() {
    this.parent = null;
};

ExtrasApp.MenuStateModel = function() {
    this._enabledItems = new Array();
    this._selectedItems = new Array();
};

ExtrasApp.MenuStateModel.prototype.isEnabled = function(id) {
	// FIXME implement this
	if (id) {
		return true;
	} else {
		return false;
	}
};

ExtrasApp.MenuStateModel.prototype.isSelected = function(id) {
	// FIXME implement this
	if (id) {
		return true;
	} else {
		return false;
	}
};