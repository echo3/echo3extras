/**
 * Synchronization peer for TransitionPane.
 */
Extras.Sync.TransitionPane = Core.extend(Echo.Render.ComponentSync, {

    $load: function() {
        Echo.Render.registerPeer("Extras.TransitionPane", this);
    },

    _containerDiv: null,
    contentDiv: null,
    type: null,
    _duration: null,
    _transition: null,
    _transitionClass: null,
    _runnable: null,
    
    /**
     * The element containing the old child element, which is being transitioned FROM.
     */
    oldChildDiv: null,
    
    /**
     * The element containing the current/new child element, which is being transitioned TO.
     */
    childDiv: null,
    
    /**
     * Flag indicating whether initial content has been loaded (no transition effect is ued on the first load).
     */
    _initialContentLoaded: false,

    $construct: function() {
    },
    
    doImmediateTransition: function() {
        this._removeOldContent();
        if (this.childDiv) {
            this._showContent();
        }
    },

    _loadTransition: function() {
        this.type = this.component.render("type");
        switch (this.type) {
        case Extras.TransitionPane.TYPE_FADE:
            this._transitionClass = Extras.Sync.TransitionPane.FadeOpacityTransition;
            break;
        case Extras.TransitionPane.TYPE_CAMERA_PAN_DOWN:
        case Extras.TransitionPane.TYPE_CAMERA_PAN_LEFT:
        case Extras.TransitionPane.TYPE_CAMERA_PAN_RIGHT:
        case Extras.TransitionPane.TYPE_CAMERA_PAN_UP:
            this._transitionClass = Extras.Sync.TransitionPane.CameraPanTransition;
            break;

        default:
            this._transitionClass = null;
            this._duration = null;
        }
    },
    
    _removeOldContent: function() {
        if (this.oldChildDiv) {
            this.contentDiv.removeChild(this.oldChildDiv);
            this.oldChildDiv = null;
        }
    },
    
    _hideContent: function() {
        if (this.childDiv) {
            this.childDiv.style.visibility = "hidden";
        }
    },
    
    _showContent: function() {
        if (this.childDiv) {
            this.childDiv.style.visibility = "visible";
        }
    },

    renderAdd: function(update, parentElement) {
        this._containerDiv = document.createElement("div");
        this._containerDiv.id = this.component.renderId;
        this._containerDiv.style.cssText = "position:absolute;overflow:auto;top:0;left:0;width:100%;height:100%;";
        
        this.contentDiv = document.createElement("div");
        this.contentDiv.style.cssText = "position:absolute;overflow:hidden;top:0;left:0;width:100%;height:100%;";
        this._containerDiv.appendChild(this.contentDiv);
        
        parentElement.appendChild(this._containerDiv);
        if (this.component.children.length > 0) {
            this._renderAddChild(update);
        }
    },
    
    _renderAddChild: function(update) {
        this._loadTransition();
        this.childDiv = document.createElement("div");
        this.childDiv.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;";
        
        Echo.Render.renderComponentAdd(update, this.component.children[0], this.childDiv);
        
        if (this._initialContentLoaded) {
            this._hideContent();
            if (this._transitionClass) {
                this._transitionStart();
            } else {
                this.doImmediateTransition();
            }
        } else {
            this._initialContentLoaded = true;
        }

        this.contentDiv.appendChild(this.childDiv);
    },
    
    renderDispose: function(update) {
        this._initialContentLoaded = false;
        this._transitionFinish();
        this._childDiv = null;
        this.contentDiv = null;
        this._containerDiv = null;
    },

    renderUpdate: function(update) {
        var fullRender = false;
        if (update.hasUpdatedLayoutDataChildren()) {
            fullRender = true;
        } else if (update.hasUpdatedProperties()) {
            // Property updates
            var propertyNames = update.getUpdatedPropertyNames();
            if (!(propertyNames.length == 1 && propertyNames[0] == "type")) {
                // Properties other than 'type' have changed.
                fullRender = true;
            }
        }

        if (fullRender) {
            var contentDiv = this._containerDiv;
            var containerElement = contentDiv.parentNode;
            Echo.Render.renderComponentDispose(update, update.parent);
            containerElement.removeChild(contentDiv);
            this.renderAdd(update, containerElement);
        } else {
            this._transitionFinish();
        
            var removedChildren = update.getRemovedChildren();
            if (removedChildren) {
                // Remove children.
                this.oldChildDiv = this.childDiv;
                this.childDiv = null;
            }
            var addedChildren = update.getAddedChildren();
            if (update.parent.children > 1) {
                throw new Error("Cannot render more than one child in a TransitionPane.");
            }
            
            if (addedChildren) {
                // Add children.
                this._renderAddChild(update); 
            }
        }
        
        return fullRender;
    },
    
    _transitionStart: function() {
        this._transition = new this._transitionClass(this);
        this._duration = this.component.render("duration", this._transition.duration);
        this._runnable = new Extras.Sync.TransitionPane.Runnable(this);
        Core.Web.Scheduler.add(this._runnable); 
    },
    
    /**
     * Finishes the transition.  This method is invoked by the runnable when the transition is completed,
     * or by the synchronization peer itself if a second transition is required before the first transition has completed.
     */
    _transitionFinish: function() {
        // Remove runnable task from scheduler.
        if (this._runnable) {
            Core.Web.Scheduler.remove(this._runnable);
            this._runnable = null;
        }
        
        // Inform transition to finish immediately.
        if (this._transition) {
            this._transition.finish();
            this._showContent();
            this._transition = null;
        }
        
        // Remove content which was transitioned from.
        this._removeOldContent();
        
        // Refocus current focused component if it is within TransitionPane.
        if (this.component && this.component.application) {
            var focusedComponent = this.component.application.getFocusedComponent();
            if (focusedComponent != null && this.component.isAncestorOf(focusedComponent)) {
                Echo.Render.updateFocus(this.client);
            }
        }
    }
});

Extras.Sync.TransitionPane.Runnable = Core.extend(Core.Web.Scheduler.Runnable, {

    transitionPane: null,

    timeInterval: null,
    
    _startTime: null,
    
    _endTime: null,
    
    repeat: true,
    
    _initialized: false,
    
    $construct: function(transitionPane) {
        this.transitionPane = transitionPane;
        this.timeInterval = transitionPane._transition.stepInterval;
    },
    
    run: function() {
        if (!this.initialized) {
            this._startTime = new Date().getTime();
            this._endTime = this._startTime + this.transitionPane._duration;
            this.transitionPane._transition.start();
            this.initialized = true;
        } else {
            var time = new Date().getTime();
            if (time < this._endTime) {
                var progress = (time - this._startTime) / this.transitionPane._duration;
                this.transitionPane._transition.step(progress);
            } else {
                this.transitionPane._transitionFinish();
            }
        }
    }
}); 

/**
 * Abstract base class for transition implementations.
 */
Extras.Sync.TransitionPane.Transition = Core.extend({

    transitionPane: null,

    $virtual: {
    
        /**
         * Duration of the transition, in milliseconds.
         * This value should be overridden when a custom duration time is desired.
         * This value will automatically be overridden if the TransitionPane component
         * has its "duration" property set.
         * @type Number
         */
        duration: 350,
        
        /**
         * Interval at which transition steps should be invoked, in milliseconds.
         * @type Number
         */
        stepInterval: 10
    },

    $abstract: {
    
        /**
         * Finishes the transition.
         */
        finish: function() { },
        
        /**
         * Starts the transition.
         */
        start: function() { },
        
        /**
         * Renders a step of the transition.
         * 
         * @param {Number} value between 0 and 1 indicating the progress of the transition which should be displayed.
         */
        step: function(progress) { }
    },

    $construct: function(transitionPane) {
        this.transitionPane = transitionPane;
    }
});

Extras.Sync.TransitionPane.CameraPanTransition = Core.extend(
        Extras.Sync.TransitionPane.Transition, {
        
    _newChildOnScreen: false,
    
    _travel: null,

    finish: function() {
        if (this.transitionPane.childDiv) {
            this.transitionPane.childDiv.style.zIndex = 0;
            this.transitionPane.childDiv.style.top = "0px";
            this.transitionPane.childDiv.style.left = "0px";
        }
    },
    
    start: function() {
        var bounds = new Core.Web.Measure.Bounds(this.transitionPane.contentDiv);
        this._travel = (this.transitionPane.type == Extras.TransitionPane.TYPE_CAMERA_PAN_DOWN || 
                this.transitionPane.type == Extras.TransitionPane.TYPE_CAMERA_PAN_UP) ? bounds.height : bounds.width;
        if (this.transitionPane.oldChildDiv) {
            this.transitionPane.oldChildDiv.style.zIndex = 1;
        }
    },
    
    step: function(progress) {
        switch (this.transitionPane.type) {
        case Extras.TransitionPane.TYPE_CAMERA_PAN_DOWN:
            if (this.transitionPane.childDiv) {
                this.transitionPane.childDiv.style.top = ((1 - progress) * this._travel) + "px";
            }
            if (this.transitionPane.oldChildDiv) {
                this.transitionPane.oldChildDiv.style.top = (0 - (progress * this._travel)) + "px";
            }
            break;
        case Extras.TransitionPane.TYPE_CAMERA_PAN_UP:
            if (this.transitionPane.childDiv) {
                this.transitionPane.childDiv.style.top = (0 - ((1 - progress) * this._travel)) + "px";
            }
            if (this.transitionPane.oldChildDiv) {
                this.transitionPane.oldChildDiv.style.top = (progress * this._travel) + "px";
            }
            break;
        case Extras.TransitionPane.TYPE_CAMERA_PAN_RIGHT:
            if (this.transitionPane.childDiv) {
                this.transitionPane.childDiv.style.left = ((1 - progress) * this._travel) + "px";
            }
            if (this.transitionPane.oldChildDiv) {
                this.transitionPane.oldChildDiv.style.left = (0 - (progress * this._travel)) + "px";
            }
            break;
        default:
            if (this.transitionPane.childDiv) {
                this.transitionPane.childDiv.style.left = (0 - ((1 - progress) * this._travel)) + "px";
            }
            if (this.transitionPane.oldChildDiv) {
                this.transitionPane.oldChildDiv.style.left = (progress * this._travel) + "px";
            }
            break;
        }
        if (!this._newChildOnScreen && this.transitionPane.childDiv) {
            this.transitionPane._showContent();
            this.transitionPane.childDiv.style.zIndex = 2;
            this._newChildOnScreen = true;
        }
    }
});

Extras.Sync.TransitionPane.FadeOpacityTransition = Core.extend(
        Extras.Sync.TransitionPane.Transition, {
    
    duration: 1000,
    
    finish: function() {
        if (this.transitionPane.childDiv) {
            this.transitionPane.childDiv.style.zIndex = 0;
            if (Core.Web.Env.PROPRIETARY_IE_OPACITY_FILTER_REQUIRED) {
                this.transitionPane.childDiv.style.filter = "";
            } else {
                this.transitionPane.childDiv.style.opacity = 1;
            }
        }
    },
    
    start: function() {
        if (this.transitionPane.childDiv) {
            if (Core.Web.Env.PROPRIETARY_IE_OPACITY_FILTER_REQUIRED) {
                this.transitionPane.childDiv.style.filter = "alpha(opacity=0)";
            } else {
                this.transitionPane.childDiv.style.opacity = 0;
            }
        }
        this.transitionPane._showContent();
    },
    
    step: function(progress) {
        var percent;
        if (this.transitionPane.childDiv) {
            if (Core.Web.Env.PROPRIETARY_IE_OPACITY_FILTER_REQUIRED) {
                percent = Math.floor(progress * 100);
                this.transitionPane.childDiv.style.filter = "alpha(opacity=" + percent + ")";
            } else {
                this.transitionPane.childDiv.style.opacity = progress;
            }
        } else if (this.transitionPane.oldChildDiv) {
            if (Core.Web.Env.PROPRIETARY_IE_OPACITY_FILTER_REQUIRED) {
                percent = Math.floor((1 - progress) * 100);
                this.transitionPane.oldChildDiv.style.filter = "alpha(opacity=" + percent + ")";
            } else {
                this.transitionPane.oldChildDiv.style.opacity = 1 - progress;
            }
        }
    }
});
