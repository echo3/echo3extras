/**
 * ItemModel PropertyTranslator singleton.  Not registered, but used by other translators.
 */
Extras.Serial.ItemModel = Core.extend(Echo.Serial.PropertyTranslator, {
    
    $static: {
    
        /**
         * Parses an icon contained in a menu model property element.
         * 
         * @param {Echo.Client} client the client
         * @param {Element} pElement the property "p" element
         */
        parseIcon: function(client, pElement) {
            var icon = Core.Web.DOM.getChildElementByTagName(pElement, "icon");
            if (icon) {
                return Echo.Serial.ImageReference.toProperty(client, icon);
            }
            return null;
        },
        
        /** @see Echo.Serial.PropertyTranslator#toProperty */
        toProperty: function(client, pElement) {
            var type = pElement.getAttribute("t");
            if (type.indexOf(Extras.Serial.PROPERTY_TYPE_PREFIX) === 0) {
                type = type.substring(Extras.Serial.PROPERTY_TYPE_PREFIX.length);
            }
            var translator = Extras.Serial[type];
              if (translator) {
                  return translator.toProperty(client, pElement);
            } else {
                throw new Error("Unsupported model type: " + type);
            }
        }
    }
});

/**
 * MenuModel PropertyTranslator singleton.
 */
Extras.Serial.MenuModel = Core.extend(Echo.Serial.PropertyTranslator, {
    
    $static: {

        /** @see Echo.Serial.PropertyTranslator#toProperty */
        toProperty: function(client, pElement) {
            var id = pElement.getAttribute("id");
            var text = pElement.getAttribute("text");
            var icon = Extras.Serial.ItemModel.parseIcon(client, pElement);
            var model = new Extras.MenuModel(id, text, icon);
            
            var children = Core.Web.DOM.getChildElementsByTagName(pElement, "item");
            for (var i = 0; i < children.length; i++) {
                var childElement = children[i];
                var subModel = Extras.Serial.ItemModel.toProperty(client, childElement);
                model.addItem(subModel);
           }
           return model;
        }
    },
    
    $load: function() {
        Echo.Serial.addPropertyTranslator("Extras.Serial.MenuModel", this);
    }
});

/**
 * OptionModel PropertyTranslator singleton.
 */
Extras.Serial.OptionModel = Core.extend(Echo.Serial.PropertyTranslator, {
    
    $static: {

        /** @see Echo.Serial.PropertyTranslator#toProperty */
        toProperty: function(client, pElement) {
            var id = pElement.getAttribute("id");
            var text = pElement.getAttribute("text");
            var icon = Extras.Serial.ItemModel.parseIcon(client, pElement);
            return new Extras.OptionModel(id, text, icon);
        }
    },
    
    $load: function() {
        Echo.Serial.addPropertyTranslator("Extras.Serial.OptionModel", this);
    }
});

/**
 * RadioOptionModel PropertyTranslator singleton.
 */
Extras.Serial.RadioOptionModel = Core.extend(Echo.Serial.PropertyTranslator, {
    
    $static: {

        /** @see Echo.Serial.PropertyTranslator#toProperty */
        toProperty: function(client, pElement) {
            var id = pElement.getAttribute("id");
            var text = pElement.getAttribute("text");
            var icon = Extras.Serial.ItemModel.parseIcon(client, pElement);
            return new Extras.RadioOptionModel(id, text, icon);
        }
    },
    
    $load: function() {
        Echo.Serial.addPropertyTranslator("Extras.Serial.RadioOptionModel", this);
    }
});

/**
 * ToggleOptionModel PropertyTranslator singleton.
 */
Extras.Serial.ToggleOptionModel = Core.extend(Echo.Serial.PropertyTranslator, {
    
    $static: {

        /** @see Echo.Serial.PropertyTranslator#toProperty */
        toProperty: function(client, pElement) {
            var id = pElement.getAttribute("id");
            var text = pElement.getAttribute("text");
            var icon = Extras.Serial.ItemModel.parseIcon(client, pElement);
            return new Extras.ToggleOptionModel(id, text, icon);
        }
    },
    
    $load: function() {
        Echo.Serial.addPropertyTranslator("Extras.Serial.ToggleOptionModel", this);
    }
});

/**
 * SeparatorModel PropertyTranslator singleton.
 */
Extras.Serial.SeparatorModel = Core.extend(Echo.Serial.PropertyTranslator, {
    
    $static: {

        /** @see Echo.Serial.PropertyTranslator#toProperty */
        toProperty: function(client, pElement) {
            return new Extras.SeparatorModel();
        }
    },
    
    $load: function() {
        Echo.Serial.addPropertyTranslator("Extras.Serial.SeparatorModel", this);
    }
});

/**
 * MenuStateModel PropertyTranslator singleton.
 */
Extras.Serial.MenuStateModel = Core.extend(Echo.Serial.PropertyTranslator, {
    
    $static: {

        /** @see Echo.Serial.PropertyTranslator#toProperty */
        toProperty: function(client, pElement) {
            var stateModel = new Extras.MenuStateModel();
            var children = Core.Web.DOM.getChildElementsByTagName(pElement, "i");
            for (var i = 0; i < children.length; i++) {
                var childElement = children[i];
                var enabledValue = childElement.getAttribute("enabled");
                if (enabledValue != null) {
                    stateModel.setEnabled(childElement.getAttribute("id"), enabledValue == "true");
                }
                var selectedValue = childElement.getAttribute("selected");
                if (selectedValue != null) {
                    stateModel.setSelected(childElement.getAttribute("id"), selectedValue == "true");
                }
            }
            return stateModel;
        }
    },
    
    $load: function() {
        Echo.Serial.addPropertyTranslator("Extras.Serial.MenuStateModel", this);
    }
});
