ExtrasSerial.PropertyTranslator.ItemModel = {

    _parseIcon: function(client, propertyElement) {
    	var icon = EchoWebCore.DOM.getChildElementByTagName(propertyElement, "icon");
    	if (icon) {
    		return EchoSerial.PropertyTranslator.ImageReference.toProperty(client, icon);
    	}
    	return null;
    },
    
    toProperty: function(client, propertyElement) {
    	var type = propertyElement.getAttribute("t");
    	if (type.indexOf(ExtrasSerial.PROPERTY_TYPE_PREFIX) == 0) {
    		type = type.substring(ExtrasSerial.PROPERTY_TYPE_PREFIX.length);
    	}
    	var translator = ExtrasSerial.PropertyTranslator[type];
      	if (translator) {
      		return translator.toProperty(client, propertyElement);
    	} else {
    		throw new Error("Unsupported model type: " + type);
    	}
    }
};

ExtrasSerial.PropertyTranslator.MenuModel = {

    toProperty: function(client, propertyElement) {
        var id = propertyElement.getAttribute("id");
        var text = propertyElement.getAttribute("text");
        var icon = ExtrasSerial.PropertyTranslator.ItemModel._parseIcon(client, propertyElement);
        var model = new ExtrasApp.MenuModel(id, text, icon);
        
        var children = EchoWebCore.DOM.getChildElementsByTagName(propertyElement, "item");
        for (var i = 0; i < children.length; i++) {
        	var childElement = children[i];
        	var subModel = ExtrasSerial.PropertyTranslator.ItemModel.toProperty(client, childElement);
        	model.addItem(subModel);
       }
       return model;
    }
};

ExtrasSerial.PropertyTranslator.OptionModel = {

    toProperty: function(client, propertyElement) {
        var id = propertyElement.getAttribute("id");
        var text = propertyElement.getAttribute("text");
        var icon = ExtrasSerial.PropertyTranslator.ItemModel._parseIcon(client, propertyElement);
        return new ExtrasApp.OptionModel(id, text, icon);
    }
};

ExtrasSerial.PropertyTranslator.RadioOptionModel = {

    toProperty: function(client, propertyElement) {
        var id = propertyElement.getAttribute("id");
        var text = propertyElement.getAttribute("text");
        var icon = ExtrasSerial.PropertyTranslator.ItemModel._parseIcon(client, propertyElement);
        return new ExtrasApp.RadioOptionModel(id, text, icon);
    }
};

ExtrasSerial.PropertyTranslator.ToggleOptionModel = {

    toProperty: function(client, propertyElement) {
        var id = propertyElement.getAttribute("id");
        var text = propertyElement.getAttribute("text");
        var icon = ExtrasSerial.PropertyTranslator.ItemModel._parseIcon(client, propertyElement);
        return new ExtrasApp.ToggleOptionModel(id, text, icon);
    }
};

ExtrasSerial.PropertyTranslator.SeparatorModel = {

    toProperty: function(client, propertyElement) {
        return new ExtrasApp.SeparatorModel();
    }
};

ExtrasSerial.PropertyTranslator.MenuStateModel = {

    toProperty: function(client, propertyElement) {
        var stateModel = new ExtrasApp.MenuStateModel();
        var children = EchoWebCore.DOM.getChildElementsByTagName(propertyElement, "i");
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
};

EchoSerial.addPropertyTranslator("ExtrasSerial.MenuModel", ExtrasSerial.PropertyTranslator.MenuModel);
EchoSerial.addPropertyTranslator("ExtrasSerial.OptionModel", ExtrasSerial.PropertyTranslator.OptionModel);
EchoSerial.addPropertyTranslator("ExtrasSerial.RadioOptionModel", ExtrasSerial.PropertyTranslator.RadioOptionModel);
EchoSerial.addPropertyTranslator("ExtrasSerial.ToggleOptionModel", ExtrasSerial.PropertyTranslator.ToggleOptionModel);
EchoSerial.addPropertyTranslator("ExtrasSerial.SeparatorModel", ExtrasSerial.PropertyTranslator.SeparatorModel);
EchoSerial.addPropertyTranslator("ExtrasSerial.MenuStateModel", ExtrasSerial.PropertyTranslator.MenuStateModel);
