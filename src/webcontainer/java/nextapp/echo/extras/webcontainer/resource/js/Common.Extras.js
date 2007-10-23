ExtrasApp = { 

    /**
     * Maintains a unique id for the ExtrasApp namespace.
     * 
     * @type Number
     */
    uniqueId: 0
};

ExtrasSerial = { 
    
    /**
     * Contains the prefix for properties specific to Echo Extras.
     */
    PROPERTY_TYPE_PREFIX: "ExtrasSerial.",
    
    PropertyTranslator: { }
};

ExtrasRender = { 

    ComponentSync: { },

    configureStyle: function(component, styleName, defaultStyle) {
        if (styleName) {
            component.setStyleName(styleName);
        } else {
            component.setStyle(defaultStyle);
        }
    },
    
    DEFAULT_CONTROL_PANE_SPLIT_PANE_STYLE: new EchoApp.Style({
        orientation: EchoApp.SplitPane.ORIENTATION_VERTICAL_BOTTOM_TOP,
        separatorColor: new EchoApp.Color("#dfdfef"),
        separatorHeight: new EchoApp.Extent("1px"),
        separatorPosition: new EchoApp.Extent("30px")
    }),
    
    DEFAULT_CONTROL_PANE_ROW_STYLE: new EchoApp.Style({
        insets: new EchoApp.Insets("2px 10px"),
        cellSpacing: new EchoApp.Extent("3px"),
        layoutData: new EchoApp.LayoutData({
            overflow: EchoApp.SplitPane.OVERFLOW_HIDDEN,
            background: new EchoApp.Color("#cfcfdf")
        })
    }),
    
    DEFAULT_CONTROL_PANE_BUTTON_STYLE: new EchoApp.Style({
        insets: new EchoApp.Insets("0px 8px"),
        lineWrap: false,
        foreground: new EchoApp.Color("#000000"),
        rolloverEnabled: true,
        rolloverForeground: new EchoApp.Color("#6f0f0f")
    })
};

ExtrasRender.Color = { 

    /**
     * Adjusts the intensity of the given color.
     * 
     * @param {EchoApp.Color} color
     * @param {Number} factor
     * @return 
     * @type EchoApp.Color the adjusted color 
     */
    adjustIntensity: function(color, factor) {
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
        return new EchoApp.Color(out);
    }
};