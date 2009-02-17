Extras.Serial.ItemModel = Core.extend(Echo.Serial.PropertyTranslator, {
    
    $static: {
    
        _parseIcon: function(client, propertyElement) {
            var icon = Core.Web.DOM.getChildElementByTagName(propertyElement, "icon");
            if (icon) {
                return Echo.Serial.ImageReference.toProperty(client, icon);
            }
            return null;
        },
        
        toProperty: function(client, propertyElement) {
            var type = propertyElement.getAttribute("t");
            if (type.indexOf(Extras.Serial.PROPERTY_TYPE_PREFIX) === 0) {
                type = type.substring(Extras.Serial.PROPERTY_TYPE_PREFIX.length);
            }
            var translator = Extras.Serial[type];
              if (translator) {
                  return translator.toProperty(client, propertyElement);
            } else {
                throw new Error("Unsupported model type: " + type);
            }
        }
    }
});

Extras.Serial.MenuModel = Core.extend(Echo.Serial.PropertyTranslator, {
    
    $static: {

        toProperty: function(client, propertyElement) {
            var id = propertyElement.getAttribute("id");
            var text = propertyElement.getAttribute("text");
            var icon = Extras.Serial.ItemModel._parseIcon(client, propertyElement);
            var model = new Extras.MenuModel(id, text, icon);
            
            var children = Core.Web.DOM.getChildElementsByTagName(propertyElement, "item");
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

Extras.Serial.OptionModel = Core.extend(Echo.Serial.PropertyTranslator, {
    
    $static: {

        toProperty: function(client, propertyElement) {
            var id = propertyElement.getAttribute("id");
            var text = propertyElement.getAttribute("text");
            var icon = Extras.Serial.ItemModel._parseIcon(client, propertyElement);
            return new Extras.OptionModel(id, text, icon);
        }
    },
    
    $load: function() {
        Echo.Serial.addPropertyTranslator("Extras.Serial.OptionModel", this);
    }
});

Extras.Serial.RadioOptionModel = Core.extend(Echo.Serial.PropertyTranslator, {
    
    $static: {

        toProperty: function(client, propertyElement) {
            var id = propertyElement.getAttribute("id");
            var text = propertyElement.getAttribute("text");
            var icon = Extras.Serial.ItemModel._parseIcon(client, propertyElement);
            return new Extras.RadioOptionModel(id, text, icon);
        }
    },
    
    $load: function() {
        Echo.Serial.addPropertyTranslator("Extras.Serial.RadioOptionModel", this);
    }
});

Extras.Serial.ToggleOptionModel = Core.extend(Echo.Serial.PropertyTranslator, {
    
    $static: {

        toProperty: function(client, propertyElement) {
            var id = propertyElement.getAttribute("id");
            var text = propertyElement.getAttribute("text");
            var icon = Extras.Serial.ItemModel._parseIcon(client, propertyElement);
            return new Extras.ToggleOptionModel(id, text, icon);
        }
    },
    
    $load: function() {
        Echo.Serial.addPropertyTranslator("Extras.Serial.ToggleOptionModel", this);
    }
});

Extras.Serial.SeparatorModel = Core.extend(Echo.Serial.PropertyTranslator, {
    
    $static: {

        toProperty: function(client, propertyElement) {
            return new Extras.SeparatorModel();
        }
    },
    
    $load: function() {
        Echo.Serial.addPropertyTranslator("Extras.Serial.SeparatorModel", this);
    }
});

Extras.Serial.MenuStateModel = Core.extend(Echo.Serial.PropertyTranslator, {
    
    $static: {

        toProperty: function(client, propertyElement) {
            var stateModel = new Extras.MenuStateModel();
            var children = Core.Web.DOM.getChildElementsByTagName(propertyElement, "i");
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
