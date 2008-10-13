/**
 * @namespace
 */
Extras = { 

    /**
     * Maintains a unique id for the ExtrasApp namespace.
     * 
     * @type Number
     */
    uniqueId: 0
};

/**
 * @namespace
 */
Extras.Serial = { 
    
    /**
     * Contains the prefix for properties specific to Echo Extras.
     */
    PROPERTY_TYPE_PREFIX: "Extras.Serial."
};

/**
 * @namespace
 */
Extras.Sync = { 

    configureStyle: function(component, styleName, defaultStyle) {
        if (styleName) {
            component.setStyleName(styleName);
        } else {
            component.setStyle(defaultStyle);
        }
    },
    
    DEFAULT_CONTROL_PANE_SPLIT_PANE_STYLE: {
        orientation: Echo.SplitPane.ORIENTATION_VERTICAL_BOTTOM_TOP,
        separatorColor: "#dfdfef",
        separatorHeight: 1,
        separatorPosition: 30
    },
    
    DEFAULT_CONTROL_PANE_ROW_STYLE: {
        insets: "2px 10px",
        cellSpacing: 3,
        layoutData: {
            overflow: Echo.SplitPane.OVERFLOW_HIDDEN,
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

Extras.Sync.Animation = Core.extend({

    stepIndex: 0,
    startTime: null,
    endTime: null,
    
    _listenerList: null,
    _runnable: null,
    
    $virtual: {
        runTime: 0,
        sleepInterval: 1
    },

    $abstract: {
    
        /**
         * Initializes the animation.  This method will always be invoked internally, it should not be manually invoked.
         */
        init: function() { },
        
        /**
         * Initializes the animation.  This method will always be invoked internally, it should not be manually invoked.
         */
        complete: function(abort) { },
        
        /**
         * Initializes the animation.  This method will always be invoked internally, it should not be manually invoked.
         */
        step: function(progress) { }
    },
    
    _doStep: function() {
        var currentTime = new Date().getTime();
        if (currentTime < this.endTime) {
            if (this.stepIndex == 0) {
                this.init();
            } else {
                this.step((currentTime - this.startTime) / this.runTime);
            }
            ++this.stepIndex;
            Core.Web.Scheduler.add(this._runnable);
        } else {
            this.complete(false);
            if (this._completeMethod) {
                this._completeMethod(false);
            }
        }
    },
    
    /**
     * Aborts an in-progress animation.  The <code>complete()</code> method will be invoked.
     */
    abort: function() {
        Core.Web.Scheduler.remove(this._runnable);
        this.complete(true);
        if (this._completeMethod) {
            this._completeMethod(true);
        }
    },
    
    /**
     * Starts the animation.
     */
    start: function(completeMethod) {
        this._runnable = new Core.Web.Scheduler.MethodRunnable(Core.method(this, this._doStep),  parent._sleepInterval, false);
        this.startTime = new Date().getTime();
        this.endTime = this.startTime + this.runTime;
        this._completeMethod = completeMethod;
        Core.Web.Scheduler.add(this._runnable);
    }
});

Extras.Sync.FadeRunnable = Core.extend(Core.Web.Scheduler.Runnable, {

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
        this._startTime = new Date().getTime();
    },
    
    run: function() {
        var time = new Date().getTime();
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
            Core.Web.Scheduler.remove(this);
        }
    }
});
