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

ExtrasRender.FadeRunnable = Core.extend(WebCore.Scheduler.Runnable, {

    timeInterval: 10,
    repeat: true,
    _runTime: null,
    
    _element: null,
    _fadeIn: null,
    _fullOpacity: null,
    
    _startTime: null,
    
    $construct: function(element, fadeIn, fullOpacity, runTime) {
        this._element = element;
        this._fullOpacity = fullOpacity;
        this._fadeIn = fadeIn;
        this._runTime = runTime;
    },
    
    run: function() {
        var time = new Date().getTime();
        if (this._startTime == null) {
            this._startTime = time;
            return;
        }
        if (time < this._startTime + this._runTime) {
            var opacity = ((time - this._startTime) / this._runTime) * this._fullOpacity; 
            this._element.style.opacity = this._fadeIn ? opacity : this._fullOpacity - opacity;
        } else {
            if (this._fadeIn) {
                this._element.style.opacity = this._fullOpacity;
            } else {
                if (this._element.parentNode) {
                    this._element.parentNode.removeChild(this._element);
                }
            }
            WebCore.Scheduler.remove(this);
        }
    }
});

