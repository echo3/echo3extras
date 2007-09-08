/**
 * Creates a new ContextMenu.
 * 
 * @constructor
 * @class ContextMenu component.
 * @base EchoApp.Component
 */
ExtrasApp.ContextMenu = function(properties) {
    EchoApp.Component.call(this, properties);
    this.componentType = "ExtrasApp.ContextMenu";
};

ExtrasApp.ContextMenu.prototype = EchoCore.derive(EchoApp.Component);

EchoApp.ComponentFactory.registerType("ExtrasApp.ContextMenu", ExtrasApp.ContextMenu);

/**
 * Creates a new DropDownMenu.
 * 
 * @constructor
 * @class DropDownMenu component.
 * @base EchoApp.Component
 */
ExtrasApp.DropDownMenu = function(properties) {
    EchoApp.Component.call(this, properties);
    this.componentType = "ExtrasApp.DropDownMenu";
};

ExtrasApp.DropDownMenu.prototype = EchoCore.derive(EchoApp.Component);

EchoApp.ComponentFactory.registerType("ExtrasApp.DropDownMenu", ExtrasApp.DropDownMenu);

/**
 * Creates a new MenuBarPane.
 * 
 * @constructor
 * @class MenuBarPane component.
 * @base EchoApp.Component
 */
ExtrasApp.MenuBarPane = function(properties) {
    EchoApp.Component.call(this, properties);
    this.componentType = "ExtrasApp.MenuBarPane";
};

ExtrasApp.MenuBarPane.prototype = EchoCore.derive(EchoApp.Component);

EchoApp.ComponentFactory.registerType("ExtrasApp.MenuBarPane", ExtrasApp.MenuBarPane);

/**
 * Representation of a menu that may contain submenus, options, and separators.
 *
 * @param modelId {String} the id of the menu model
 * @param text {String} the title of the menu model which will appear in its parent menu
 *        when this menu is used as a submenu
 * @param icon {String} the icon of the menu model which will appear in its parent menu
 *        when this menu is used as a submenu
 */
ExtrasApp.MenuModel = function(modelId, text, icon) {
    this.modelId = modelId;
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

ExtrasApp.OptionModel = function(modelId, text, icon) {
    this.modelId = modelId;
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

ExtrasApp.ToggleOptionModel = function(modelId, text, selected) {
    ExtrasApp.OptionModel.call(this, modelId, text, null)
    this.selected = selected;
};

ExtrasApp.ToggleOptionModel.prototype = EchoCore.derive(ExtrasApp.OptionModel);

ExtrasApp.RadioOptionModel = function(modelId, text, selected) {
    ExtrasApp.ToggleOptionModel.call(this, modelId, text, selected)
};

ExtrasApp.RadioOptionModel.prototype = EchoCore.derive(ExtrasApp.ToggleOptionModel);

/**
 * A representation of a menu separator.
 */
ExtrasApp.SeparatorModel = function() {
    this.parent = null;
};

ExtrasApp.MenuStateModel = function() {
    this._disabledItems = new Array();
    this._selectedItems = new Array();
};

ExtrasApp.MenuStateModel.prototype.isEnabled = function(modelId) {
	if (modelId) {
		for (var i = 0; i < this._disabledItems.length; i++) {
			if (this._disabledItems[i] == modelId) {
				return false;
			}
		}
	}
	return true;
};

ExtrasApp.MenuStateModel.prototype.isSelected = function(modelId) {
	if (modelId) {
		for (var i = 0; i < this._selectedItems.length; i++) {
			if (this._selectedItems[i] == modelId) {
				return true;
			}
		}
	}
	return false;
};

ExtrasApp.MenuStateModel.prototype.setEnabled = function(modelId, enabled) {
	if (!enabled) {
		this._disabledItems.push(modelId);
	}
};

ExtrasApp.MenuStateModel.prototype.setSelected = function(modelId, selected) {
	if (selected) {
		this._selectedItems.push(modelId);
	}
};