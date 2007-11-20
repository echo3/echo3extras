ExtrasRender.ComponentSync.TransitionPane = Core.extend(EchoRender.ComponentSync, {

    $load: function() {
        EchoRender.registerPeer("ExtrasApp.TransitionPane", this);
    },

    _element: null,
    _transitionDuration: -1,
    _transition: null,
    
    /**
     * The element containing the old child element, which is being transitioned FROM.
     */
    oldChildDivElement: null,
    
    /**
     * The element containing the new child element, which is being transitioned TO.
     */
    newChildDivElement: null,
    
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
        
        if (this.newChildDivElement) {
            this.newChildDivElement.style.display = "block";
            this.newChildDivElement = null;
        }
    },

    renderAdd: function(update, parentElement) {
        this._element = document.createElement("div");
        this._element.style.cssText = "position:absolute;overflow:hidden;top:0;left:0;width:100%;height:100%;";
        parentElement.appendChild(this._element);
    },
    
    _renderAddChild: function() {
        this.newChildDivElement = document.createElement("div");
        this.newChildDivElement.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;";
        if (this._initialContentLoaded) {
            this.newChildDivElement.style.display = "none";
        } else {
            this._initialContentLoaded = true;
        }
        this._element.appendChild(this.newChildDivElement);
    },
    
    renderDisplay: function() {
        
    },
    
    renderDispose: function(update) {
        this._element = null;
    },

    renderUpdate: function(update) {
        return true;
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
    
        DEFAULT_TRANSITION_DURATION: 1000
    },
    
    _transitionPane: null,
    
    $construct: function(transitionPane) {
        this._transitionPane = transitionPane;
    },
    
    dispose: function() {
        if (this._transitionPane.newChildDivElement) {
            this._transitionPane.newChildDivElement.style.zIndex = 0;
            if (WebCore.Environment.PROPRIETARY_IE_OPACITY_FILTER_REQUIRED) {
                this._transitionPane.newChildDivElement.style.filter = "";
            } else {
                this._transitionPane.newChildDivElement.style.opacity = 1;
            }
        }
        this.transitionPane.doImmediateTransition();
    },
    
    init: function() {
        if (this._transitionPane.newChildDivElement) {
            if (WebCore.Environment.PROPRIETARY_IE_OPACITY_FILTER_REQUIRED) {
                this._transitionPane.newChildDivElement.style.filter = "alpha(opacity=0)";
            } else {
                this._transitionPane.newChildDivElement.style.opacity = 0;
            }
        }
    },
    
    step: function(progress) {
        if (this._transitionPane.newChildDivElement) {
            if (WebCore.Environment.PROPRIETARY_IE_OPACITY_FILTER_REQUIRED) {
                var percent = parseInt(progress * 100);
                this._transitionPane.newChildDivElement.style.filter = "alpha(opacity=" + percent + ")";
            } else {
                this._transitionPane.newChildDivElement.style.opacity = progress;
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
