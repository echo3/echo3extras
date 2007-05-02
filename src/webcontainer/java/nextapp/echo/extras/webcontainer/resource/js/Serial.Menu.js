ExtrasSerial.PropertyTranslator.ItemModel = function() { };

ExtrasSerial.PropertyTranslator.ItemModel._parseIcon = function(client, propertyElement) {
	var icon = EchoWebCore.DOM.getChildElementByTagName(propertyElement, "icon");
	if (icon) {
		return EchoSerial.PropertyTranslator.ImageReference.toProperty(client, icon);
	}
	return null;
};

ExtrasSerial.PropertyTranslator.ItemModel.toProperty = function(client, propertyElement) {
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
};

ExtrasSerial.PropertyTranslator.MenuModel = function() { };

ExtrasSerial.PropertyTranslator.MenuModel.toProperty = function(client, propertyElement) {
    var text = propertyElement.getAttribute("text");
    var icon = ExtrasSerial.PropertyTranslator.ItemModel._parseIcon(client, propertyElement);
    var model = new ExtrasApp.MenuModel(text, icon);
    
    var children = EchoWebCore.DOM.getChildElementsByTagName(propertyElement, "item");
    for (var i = 0; i < children.length; i++) {
    	var childElement = children[i];
    	var subModel = ExtrasSerial.PropertyTranslator.ItemModel.toProperty(client, childElement);
    	model.addItem(subModel);
   }
   return model;
};

ExtrasSerial.PropertyTranslator.OptionModel = function() { };

ExtrasSerial.PropertyTranslator.OptionModel.toProperty = function(client, propertyElement) {
    var text = propertyElement.getAttribute("text");
    var icon = ExtrasSerial.PropertyTranslator.ItemModel._parseIcon(client, propertyElement);
    return new ExtrasApp.OptionModel(text, icon);
};

ExtrasSerial.PropertyTranslator.RadioOptionModel = function() { };

ExtrasSerial.PropertyTranslator.RadioOptionModel.toProperty = function(client, propertyElement) {
    var text = propertyElement.getAttribute("text");
    var icon = ExtrasSerial.PropertyTranslator.ItemModel._parseIcon(client, propertyElement);
    return new ExtrasApp.RadioOptionModel(text, icon);
};

ExtrasSerial.PropertyTranslator.ToggleOptionModel = function() { };

ExtrasSerial.PropertyTranslator.ToggleOptionModel.toProperty = function(client, propertyElement) {
    var text = propertyElement.getAttribute("text");
    var icon = ExtrasSerial.PropertyTranslator.ItemModel._parseIcon(client, propertyElement);
    return new ExtrasApp.ToggleOptionModel(text, icon);
};

ExtrasSerial.PropertyTranslator.SeparatorModel = function() { };

ExtrasSerial.PropertyTranslator.SeparatorModel.toProperty = function(client, propertyElement) {
    return new ExtrasApp.SeparatorModel();
};

EchoSerial.addPropertyTranslator("ExtrasSerial.MenuModel", ExtrasSerial.PropertyTranslator.MenuModel);
EchoSerial.addPropertyTranslator("ExtrasSerial.OptionModel", ExtrasSerial.PropertyTranslator.OptionModel);
EchoSerial.addPropertyTranslator("ExtrasSerial.RadioOptionModel", ExtrasSerial.PropertyTranslator.RadioOptionModel);
EchoSerial.addPropertyTranslator("ExtrasSerial.ToggleOptionModel", ExtrasSerial.PropertyTranslator.ToggleOptionModel);
EchoSerial.addPropertyTranslator("ExtrasSerial.SeparatorModel", ExtrasSerial.PropertyTranslator.SeparatorModel);

ExtrasSerial.PropertyTranslator.MenuStateModel = function() { };

ExtrasSerial.PropertyTranslator.MenuStateModel.toProperty = function(client, propertyElement) {
	// FIXME implement this
    return new ExtrasApp.MenuStateModel();
};

EchoSerial.addPropertyTranslator("ExtrasSerial.MenuStateModel", ExtrasSerial.PropertyTranslator.MenuStateModel);
