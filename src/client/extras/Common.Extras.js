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
    
    DEFAULT_CONTROL_PANE_SPLIT_PANE_STYLE: {
        orientation: EchoApp.SplitPane.ORIENTATION_VERTICAL_BOTTOM_TOP,
        separatorColor: "#dfdfef",
        separatorHeight: 1,
        separatorPosition: 30
    },
    
    DEFAULT_CONTROL_PANE_ROW_STYLE: {
        insets: "2px 10px",
        cellSpacing: 3,
        layoutData: {
            overflow: EchoApp.SplitPane.OVERFLOW_HIDDEN,
            background: "#cfcfdf"
        }
    },
    
    DEFAULT_CONTROL_PANE_BUTTON_STYLE: {
        insets: "0px 8px",
        lineWrap: false,
        foreground: "#000000",
        rolloverEnabled: true,
        rolloverForeground: "#6f0f0f"
    }
};
