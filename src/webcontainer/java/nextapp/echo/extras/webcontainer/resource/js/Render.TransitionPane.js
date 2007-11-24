ExtrasRender.ComponentSync.TransitionPane = Core.extend(EchoRender.ComponentSync, {

    $load: function() {
        EchoRender.registerPeer("ExtrasApp.TransitionPane", this);
    },

    _element: null,
    _duration: null,
    _transition: null,
    _transitionType: null,
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
        this._removeOldContent();
        if (this.childDivElement) {
            this.childDivElement.style.display = "block";
        }
    },

    _loadTransition: function() {
        switch (this.component.getRenderProperty("type")) {
        case ExtrasApp.TransitionPane.TYPE_FADE:
            this._transitionType = ExtrasRender.ComponentSync.TransitionPane.FadeOpacityTransition;
            break;
        default:
            this._transitionType = null;
            this._duration = null;
        }
    },
    
    _removeOldContent: function() {
        if (this.oldChildDivElement) {
            this._element.removeChild(this.oldChildDivElement);
            this.oldChildDivElement = null;
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
        
        EchoRender.renderComponentAdd(update, this.component.children[0], this.childDivElement);
        
        if (this._initialContentLoaded) {
            this.childDivElement.style.display = "none";
            if (this._transitionType) {
                this._transitionStart();
            } else {
                this.doImmediateTransition();
            }
        } else {
            this._initialContentLoaded = true;
        }

        this._element.appendChild(this.childDivElement);
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
            this._transitionFinish();
        
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
    
    _transitionStart: function() {
        this._transition = new this._transitionType(this);
        this._duration = this.component.getRenderProperty("duration", this._transition.duration);
        this._runnable = new ExtrasRender.ComponentSync.TransitionPane.Runnable(this);
        Core.Scheduler.add(this._runnable); 
    },
    
    /**
     * Finishes the transition.  This method is invoked by the runnable when the transition is completed,
     * or by the synchronization peer itself if a second transition is required before the first transition has completed.
     */
    _transitionFinish: function() {
        // Remove runnable task from scheduler.
        if (this._runnable) {
            Core.Scheduler.remove(this._runnable);
            this._runnable = null;
        }
        
        // Inform transition to finish immediately.
        if (this._transition) {
            this._transition.finish();
            this.transition = null;
        }
        
        // Remove content which was transitioned from.
        this._removeOldContent();
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

ExtrasRender.ComponentSync.TransitionPane.Transition = Core.extend({

    $virtual: {
    
        duration: 350,
        
        stepInterval: 50
    },

    $abstract: {
    
        finish: function() { },
        
        start: function() { },
        
        step: function(progress) { }
    }
});

ExtrasRender.ComponentSync.TransitionPane.FadeOpacityTransition = Core.extend(
        ExtrasRender.ComponentSync.TransitionPane.Transition, {
    
    duration: 1000,
    
    _transitionPane: null,
    
    $construct: function(transitionPane) {
        this._transitionPane = transitionPane;
    },
    
    finish: function() {
        if (this._transitionPane.childDivElement) {
            this._transitionPane.childDivElement.style.zIndex = 0;
            if (WebCore.Environment.PROPRIETARY_IE_OPACITY_FILTER_REQUIRED) {
                this._transitionPane.childDivElement.style.filter = "";
            } else {
                this._transitionPane.childDivElement.style.opacity = 1;
            }
        }
    },
    
    start: function() {
        if (this._transitionPane.childDivElement) {
            if (WebCore.Environment.PROPRIETARY_IE_OPACITY_FILTER_REQUIRED) {
                this._transitionPane.childDivElement.style.filter = "alpha(opacity=0)";
            } else {
                this._transitionPane.childDivElement.style.opacity = 0;
            }
        }
        this._transitionPane.childDivElement.style.display = "block";
    },
    
    step: function(progress) {
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
