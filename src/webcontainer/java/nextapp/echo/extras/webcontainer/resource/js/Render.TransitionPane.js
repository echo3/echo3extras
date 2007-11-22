ExtrasRender.ComponentSync.TransitionPane = Core.extend(EchoRender.ComponentSync, {

    $load: function() {
        EchoRender.registerPeer("ExtrasApp.TransitionPane", this);
    },

    _element: null,
    _transitionDuration: null,
    _transition: null,
    _runnable: null,
    
    /**
     * The element containing the old child element, which is being transitioned FROM.
     */
    oldChildDivElement: null,
    
    /**
     * The element containing the current/new child element, which is being transitioned TO.
     */
    childDivElement: null,
    
    /**
     * Flag indicating whether initial content has been loaded (no transition effect is ued on the first load).
     */
    _initialContentLoaded: false,

    $construct: function() {
    },
    
    doImmediateTransition: function() {
        if (this.oldChildDivElement) {
            this._element.removeChild(this.oldChildDivElement);
            this.oldChildDivElement = null;
        }
        
        if (this.childDivElement) {
            this.childDivElement.style.display = "block";
        }
    },

    _loadTransition: function() {
        switch (this.component.getRenderProperty("transition")) {
        case ExtrasApp.TransitionPane.TYPE_FADE:
            this._transition = new ExtrasRender.ComponentSync.TransitionPane.FadeOpacityTransition();
            break;
        default:
            this._transition = null;
            this._transitionDuration = null;
        }
        
        if (this._transition) {
            this._transitionDuration = this.component.getRenderProperty("duartion", 
                    this._transition.constructor.DEFAULT_TRANSITION_DURATION);
        }
    },

    renderAdd: function(update, parentElement) {
        this._loadTransition();
        this._element = document.createElement("div");
        this._element.style.cssText = "position:absolute;overflow:hidden;top:0;left:0;width:100%;height:100%;";
        parentElement.appendChild(this._element);
        if (this.component.children.length > 0) {
            this._renderAddChild(update);
        }
    },
    
    _renderAddChild: function(update) {
        this.childDivElement = document.createElement("div");
        this.childDivElement.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;";
        if (this._initialContentLoaded) {
            this.childDivElement.style.display = "none";
        } else {
            this._initialContentLoaded = true;
        }
        EchoRender.renderComponentAdd(update, this.component.children[0], this.childDivElement);
        this._element.appendChild(this.childDivElement);
        
        if (this._transition) {
            this._startTransition();
        } else {
            this.doImmediateTransition();
        }
    },
    
    renderDisplay: function() {
        
    },
    
    renderDispose: function(update) {
        this._element = null;
    },

    renderUpdate: function(update) {
        var fullRender = false;
        if (update.hasUpdatedProperties() || update.hasUpdatedLayoutDataChildren()) {
            // Full render
            fullRender = true;
        } else {
            var removedChildren = update.getRemovedChildren();
            if (removedChildren) {
                // Remove children.
                this.oldChildDivElement = this.childDivElement;
                this.childDivElement = null;
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
        if (fullRender) {
            var element = this._element;
            var containerElement = element.parentNode;
            EchoRender.renderComponentDispose(update, update.parent);
            containerElement.removeChild(element);
            this.renderAdd(update, containerElement);
        }
        
        return fullRender;
    },
    
    _startTransition: function() {
        this._runnable = new ExtrasRender.ComponentSync.TransitionPane.Runnable();
        Core.Scheduler.add(this._runnable); 
    },
    
    _stopTransition: function() {
        this.doImmediateTransition();
        Core.Scheduler.add(this._runnable); 
    }
});

ExtrasRender.ComponentSync.TransitionPane.Runnable = Core.extend(Core.Scheduler.Runnable, {

    transitionPane: null,

    timeInterval: null,
    
    _startTime: null,
    
    _endTime: null,
    
    repeat: true,
    
    _initialized: false,
    
    $construct: function(transitionPane) {
        this.transitionPane = transitionPane;
    },
    
    run: function() {
        if (!this.initialized) {
            this._startTime = new Date().getTime();
            this._endTime = this._startTime + this.transitionPane._transitionDuration;
            this.transitionPane._transition.init();
            this.initialized = true;
        } else {
            var time = new Date().getTime();
            if (time < this._endTime) {
                var progress = (time - this._startTime) / this.transitionPane._transitionDuration;
                this.transitionPane._transition.step(progress);
            } else {
                this.transitionPane._transition.dispose();
                this.transitionPane._stopTransition();
            }
        }
    }
}); 

ExtrasRender.ComponentSync.TransitionPane.Transition = Core.extend({

    $abstract: {
    
        dispose: function() { },
        
        init: function() { },
        
        step: function(progress) { }
    }
});

ExtrasRender.ComponentSync.TransitionPane.FadeOpacityTransition = Core.extend(
        ExtrasRender.ComponentSync.TransitionPane.Transition, {
    
    $static: {
    
        DEFAULT_TRANSITION_DURATION: 1000,
        
        INTERVAL: 10
    },
    
    _transitionPane: null,
    
    $construct: function(transitionPane) {
        this._transitionPane = transitionPane;
    },
    
    dispose: function() {
        if (this._transitionPane.childDivElement) {
            this._transitionPane.childDivElement.style.zIndex = 0;
            if (WebCore.Environment.PROPRIETARY_IE_OPACITY_FILTER_REQUIRED) {
                this._transitionPane.childDivElement.style.filter = "";
            } else {
                this._transitionPane.childDivElement.style.opacity = 1;
            }
        }
    },
    
    init: function() {
        if (this._transitionPane.childDivElement) {
            if (WebCore.Environment.PROPRIETARY_IE_OPACITY_FILTER_REQUIRED) {
                this._transitionPane.childDivElement.style.filter = "alpha(opacity=0)";
            } else {
                this._transitionPane.childDivElement.style.opacity = 0;
            }
        }
    },
    
    step: function(progress) {
Core.Debug.consoleWrite("progress:" +  progress);    
        if (this._transitionPane.childDivElement) {
            if (WebCore.Environment.PROPRIETARY_IE_OPACITY_FILTER_REQUIRED) {
                var percent = parseInt(progress * 100);
                this._transitionPane.childDivElement.style.filter = "alpha(opacity=" + percent + ")";
            } else {
                this._transitionPane.childDivElement.style.opacity = progress;
            }
        } else if (this._transitionPane.oldChildDivElement) {
            if (WebCore.Environment.PROPRIETARY_IE_OPACITY_FILTER_REQUIRED) {
                var percent = parseInt((1 - progress) * 100);
                this._transitionPane.oldChildDivElement.style.filter = "alpha(opacity=" + percent + ")";
            } else {
                this._transitionPane.oldChildDivElement.style.opacity = 1 - progress;
            }
        }
    }
});
