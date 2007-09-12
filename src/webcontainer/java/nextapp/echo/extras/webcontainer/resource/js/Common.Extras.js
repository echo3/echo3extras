ExtrasApp = function() { };

/**
 * Maintains a unique id for the ExtrasApp namespace.
 * 
 * @type Number
 */
ExtrasApp.uniqueId = 0;

ExtrasSerial = function() { };

/**
 * Contains the prefix for properties specific to Echo Extras.
 */
ExtrasSerial.PROPERTY_TYPE_PREFIX = "ExtrasSerial.";

ExtrasSerial.PropertyTranslator = function() { };

ExtrasRender = function() { };

ExtrasRender = function() { };

ExtrasRender.ComponentSync = function() { };

ExtrasRender.Color = function() { };

/**
 * Adjusts the intensity of the given color.
 * 
 * @param {EchoApp.Property.Color} color
 * @param {Number} factor
 * @return 
 * @type EchoApp.Property.Color the adjusted color 
 */
ExtrasRender.Color.adjustIntensity = function(color, factor) {
	var colorString = color.value;
    var red = parseInt(colorString.substring(1, 3), 16);
    var green = parseInt(colorString.substring(3, 5), 16);
    var blue = parseInt(colorString.substring(5, 7), 16);
    red = parseInt(red * factor);
    green = parseInt(green * factor);
    blue = parseInt(blue * factor);
    red = red < 0x100 ? red : 0xff;
    green = green < 0x100 ? green : 0xff;
    blue = blue < 0x100 ? blue : 0xff;
    var out = "#";
    if (red < 0x10) {
        out += "0";
    }
    out += red.toString(16);
    if (green < 0x10) {
        out += "0";
    }
    out += green.toString(16);
    if (blue < 0x10) {
        out += "0";
    }
    out += blue.toString(16);
    return new EchoApp.Property.Color(out);
};

ExtrasRender.configureStyle = function(component, styleName, defaultStyle) {
    if (styleName) {
        component.setStyleName(styleName);
    } else {
        component.setStyle(defaultStyle);
    }
};

ExtrasRender.DEFAULT_CONTROL_PANE_SPLIT_PANE_STYLE = new EchoApp.Style({
    orientation: EchoApp.SplitPane.ORIENTATION_VERTICAL_BOTTOM_TOP,
    separatorColor: new EchoApp.Property.Color("#dfdfef"),
    separatorHeight: new EchoApp.Property.Extent("1px"),
    separatorPosition: new EchoApp.Property.Extent("30px")
});

ExtrasRender.DEFAULT_CONTROL_PANE_ROW_STYLE = new EchoApp.Style({
    insets: new EchoApp.Property.Insets("2px 10px"),
    cellSpacing: new EchoApp.Property.Extent("3px"),
    layoutData: new EchoApp.LayoutData({
        overflow: EchoApp.SplitPane.OVERFLOW_HIDDEN,
        background: new EchoApp.Property.Color("#cfcfdf")
    })
});

ExtrasRender.DEFAULT_CONTROL_PANE_BUTTON_STYLE = new EchoApp.Style({
    insets: new EchoApp.Property.Insets("0px 8px"),
    lineWrap: false,
    foreground: new EchoApp.Property.Color("#000000"),
    rolloverEnabled: true,
    rolloverForeground: new EchoApp.Property.Color("#6f0f0f")
});
