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
        separatorColor: "#dfdfef",
        separatorHeight: 1,
        separatorPosition: 30
    }),
    
    DEFAULT_CONTROL_PANE_ROW_STYLE: new EchoApp.Style({
        insets: "2px 10px",
        cellSpacing: 3,
        layoutData: {
            overflow: EchoApp.SplitPane.OVERFLOW_HIDDEN,
            background: "#cfcfdf"
        }
    }),
    
    DEFAULT_CONTROL_PANE_BUTTON_STYLE: new EchoApp.Style({
        insets: "0px 8px",
        lineWrap: false,
        foreground: "#000000",
        rolloverEnabled: true,
        rolloverForeground: "#6f0f0f"
    })
};

ExtrasRender.Color = { 

    /**
     * Adjusts the intensity of the given color.
     * 
     * @param the color
     * @param {Number} factor
     * @return 
     * @type the adjusted color 
     */
    adjustIntensity: function(color, factor) {
        var red = parseInt(color.substring(1, 3), 16);
        var green = parseInt(color.substring(3, 5), 16);
        var blue = parseInt(color.substring(5, 7), 16);
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
        return out;
    }
};