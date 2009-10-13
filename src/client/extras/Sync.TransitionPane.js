/**
 * Component rendering peer: TransitionPane.
 * This class should not be extended by developers, the implementation is subject to change.
 */
Extras.Sync.TransitionPane = Core.extend(Echo.Render.ComponentSync, {

    $load: function() {
        Echo.Render.registerPeer("Extras.TransitionPane", this);
    },

    /**
     * Outermost/top-level container element.
     * @type Element
     */
    _containerDiv: null,
    
    /**
     * Content element, contains oldChildDiv/childDiv elements.
     * @type Element
     */
    contentDiv: null,
    
    /**
     * The transition type value (retrieved from the component).
     * @type Number
     */
    type: null,
    
    /**
     * The transition which is actively running (null when content is not being transitioned).
     * @type Extras.Sync.TransitionPane.Transition
     */
    _transition: null,
    
    /**
     * Reference to the Extras.Sync.TransitionPane.Transition object type which will be instantiated to perform a transition.
     */
    _transitionClass: null,
    
    /**
     * The element containing the old child element, which is being transitioned FROM.
     * @type Element
     */
    oldChildDiv: null,
    
    /**
     * The element containing the current/new child element, which is being transitioned TO.
     * @type Element
     */
    childDiv: null,
    
    /**
     * Flag indicating whether initial content has been loaded (no transition effect is used on the first load).
     * @type Boolean
     */
    _initialContentLoaded: false,

    /**
     * Performs an immediate transition between old content and new content with no animated effect.
     */
    doImmediateTransition: function() {
        this.removeOldContent();
        if (this.childDiv) {
            this.showContent();
        }
    },

    /**
     * Determines the transition class that will be used to change content based on the
     * type value of the supported Extras.TransitionPane component. 
     */
    _loadTransition: function() {
        this.type = this.component.render("type");
        switch (this.type) {
        case Extras.TransitionPane.TYPE_FADE:
            this._transitionClass = Extras.Sync.TransitionPane.FadeOpacityTransition;
            break;
        case Extras.TransitionPane.TYPE_FADE_TO_BLACK:
        case Extras.TransitionPane.TYPE_FADE_TO_WHITE:
            this._transitionClass = Extras.Sync.TransitionPane.FadeOpacityColorTransition;
            break;
        case Extras.TransitionPane.TYPE_CAMERA_PAN_DOWN:
        case Extras.TransitionPane.TYPE_CAMERA_PAN_LEFT:
        case Extras.TransitionPane.TYPE_CAMERA_PAN_RIGHT:
        case Extras.TransitionPane.TYPE_CAMERA_PAN_UP:
            this._transitionClass = Extras.Sync.TransitionPane.CameraPanTransition;
            break;
        case Extras.TransitionPane.TYPE_BLIND_BLACK_IN:
        case Extras.TransitionPane.TYPE_BLIND_BLACK_OUT:
            this._transitionClass = Extras.Sync.TransitionPane.BlindTransition;
            break;
        default:
            this._transitionClass = null;
        }
    },
    
    /**
     * Removes old content: remove oldChildDiv from parent, set oldChildDiv to null.
     */
    removeOldContent: function() {
        if (this.oldChildDiv) {
            this.contentDiv.removeChild(this.oldChildDiv);
            this.oldChildDiv = null;
        }
    },

    /**
     * Shows new content.
     */
    showContent: function() {
        if (this.childDiv) {
            this.childDiv.style.visibility = "visible";
        }
    },

    /** @see Echo.Render.ComponentSync#renderAdd */
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
    
    /**
     * Renders new content (a new child) added in an update.  Starts the transition.
     * 
     * @param {Echo.Update.ComponentUpdate} the update 
     */
    _renderAddChild: function(update) {
        this._loadTransition();
        this.childDiv = document.createElement("div");
        this.childDiv.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;";
        
        Echo.Render.renderComponentAdd(update, this.component.children[0], this.childDiv);
        
        if (this._initialContentLoaded) {
            this.childDiv.style.visibility = "hidden";
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
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        this._initialContentLoaded = false;
        if (this._transition) {
            this._transition.abort();
        }
        this.childDiv = null;
        this.contentDiv = null;
        this._containerDiv = null;
    },

    /** @see Echo.Render.ComponentSync#renderUpdate */
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
            if (this._transition) {
                this._transition.abort();
            }
        
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
    
    /**
     * Initiates the animated transition effect.
     */
    _transitionStart: function() {
        this._transition = new this._transitionClass(this);
        this._transition.runTime = this.component.render("duration", this._transition.runTime);
        this._transition.start(Core.method(this, this._transitionFinish));
    },
    
    /**
     * Completes the animated transition effect. 
     */
    _transitionFinish: function(abort) {
        // Abort current transition, if necessary.
        if (this._transition) {
            this._transition = null;
            this.showContent();
        }
        
        // Remove content which was transitioned from.
        this.removeOldContent();
        
        // Refocus current focused component if it is within TransitionPane.
        if (this.component && this.component.application) {
            var focusedComponent = this.component.application.getFocusedComponent();
            if (focusedComponent != null && this.component.isAncestorOf(focusedComponent)) {
                Echo.Render.updateFocus(this.client);
            }
        }
    }
});

/**
 * Abstract base class for transition implementations.
 */
Extras.Sync.TransitionPane.Transition = Core.extend(Extras.Sync.Animation, {

    /**
     * The transition pane synchronization peer.
     * @type Extras.Sync.TransitionPane
     */
    transitionPane: null,

    /**
     * Duration of the transition, in milliseconds.
     * This value should be overridden when a custom duration time is desired.
     * This value will automatically be overridden if the TransitionPane component
     * has its "duration" property set.
     * @type Number
     * @see Extras.Sync.Animation#runTime
     */
    runTime: 350,

    /**
     * Interval at which transition steps should be invoked, in milliseconds.
     * @type Number
     * @see Extras.Sync.Animation#sleepInterval
     */
    sleepInterval: 10,
    
    $abstract: true,

    /**
     * Constructor.
     * 
     * @param {Extras.Sync.TransitionPane} transitionPane the transition pane peer 
     */
    $construct: function(transitionPane) {
        this.transitionPane = transitionPane;
    }
});

/**
 * Transition implementation to translate between old content and new content by flipping horizontal blinds, as though the old
 * screen were written to one side and the new screen were written to the other.
 * Uses a series of alpha-channeled PNG images to approximate the effect.
 */
Extras.Sync.TransitionPane.BlindTransition = Core.extend(Extras.Sync.TransitionPane.Transition, {

    /** @see Extras.Sync.Animation#runTime */
    runTime: 700,

    /**
     * The mask DIV that will display the blind graphic effect over the content.
     * @type Element
     */
    _maskDiv: null,
    
    /**
     * Number of steps (images) to display.
     * @type Number
     */
    _stepCount: 14,
    
    /**
     * Step number where old content will be swapped for new content.
     * @type Number
     */
    _swapStep: null,
    
    /**
     * Flag indicating whether the transition will occur in reverse order.
     * @type Boolean
     */
    _reverse: false,
    
    /** @see Extras.Sync.Animation#complete */
    complete: function(abort) {
        this._maskDiv.parentNode.removeChild(this._maskDiv);
    },
    
    /** @see Extras.Sync.Animation#init */
    init: function() {
        this._swapStep = Math.floor(this._stepCount) / 2 + 1;
        this._reverse = this.transitionPane.type === Extras.TransitionPane.TYPE_BLIND_BLACK_OUT;

        this._maskDiv = document.createElement("div");
        this._maskDiv.style.cssText = "position:absolute;width:100%;height:100%;z-index:30000;";
        this.transitionPane.contentDiv.appendChild(this._maskDiv);
    },

    /** @see Extras.Sync.Animation#step */
    step: function(progress) {
        var currentStep = Math.ceil(progress * this._stepCount);
        if (currentStep === 0) {
            currentStep = 1;
        }
        if (currentStep === this._renderedStep) {
            // No need to update, already current.
            return;
        }
        var url = this.transitionPane.client.getResourceUrl("Extras", 
                "image/transitionpane/blindblack/Frame" + currentStep + ".gif");
        this._maskDiv.style.backgroundImage = "url(" + url + ")";
        
        if (currentStep < this._swapStep) {
            if (this.transitionPane.oldChildDiv) {
                if (this._reverse) {
                    this.transitionPane.oldChildDiv.style.top = currentStep + "px";
                } else {
                    this.transitionPane.oldChildDiv.style.top = (0 - currentStep) + "px";
                }
            }
        } else {
            if (this._renderedStep < this._swapStep) {
                // blind is crossing horizontal, swap content.
                this.transitionPane.showContent();
                this.transitionPane.removeOldContent();
            }
            if (this.transitionPane.childDiv) {
                if (this._reverse) {
                    this.transitionPane.childDiv.style.top = (currentStep - this._stepCount) + "px";
                } else {
                    this.transitionPane.childDiv.style.top = (this._stepCount - currentStep) + "px";
                }
            }
        }

        this._renderedStep = currentStep;
    }    
});

/**
 * Transition implementation to pan from old content to new content, as though both were either horizontally
 * or vertically adjacent and the screen (camera) were moving from one to the other.
 */
Extras.Sync.TransitionPane.CameraPanTransition = Core.extend(
        Extras.Sync.TransitionPane.Transition, {
    
    /**
     * Flag indicating whether the new child (being transitioned to) has been placed on the screen.
     * @type Boolean
     */
    _newChildOnScreen: false,
    
    /**
     * The distance, in pixels, which content will travel across the screen (the width/height of the region).
     * @type Number 
     */
    _travel: null,

    /** @see Extras.Sync.Animation#complete */
    complete: function(abort) {
        if (this.transitionPane.childDiv) {
            this.transitionPane.childDiv.style.zIndex = 0;
            this.transitionPane.childDiv.style.top = "0px";
            this.transitionPane.childDiv.style.left = "0px";
        }
    },
    
    /** @see Extras.Sync.Animation#init */
    init: function() {
        var bounds = new Core.Web.Measure.Bounds(this.transitionPane.contentDiv);
        this._travel = (this.transitionPane.type == Extras.TransitionPane.TYPE_CAMERA_PAN_DOWN || 
                this.transitionPane.type == Extras.TransitionPane.TYPE_CAMERA_PAN_UP) ? bounds.height : bounds.width;
        if (this.transitionPane.oldChildDiv) {
            this.transitionPane.oldChildDiv.style.zIndex = 1;
        }
    },
    
    /** @see Extras.Sync.Animation#step */
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
            this.transitionPane.showContent();
            this.transitionPane.childDiv.style.zIndex = 2;
            this._newChildOnScreen = true;
        }
    }
});

/**
 * Transition implementation to fade from old content to new content.
 */
Extras.Sync.TransitionPane.FadeOpacityTransition = Core.extend(Extras.Sync.TransitionPane.Transition, {
    
    /** @see Extras.Sync.Animation#runTime */
    runTime: 1000,
    
    /** @see Extras.Sync.Animation#complete */
    complete: function(abort) {
        if (this.transitionPane.childDiv) {
            this.transitionPane.childDiv.style.zIndex = 0;
            if (Core.Web.Env.PROPRIETARY_IE_OPACITY_FILTER_REQUIRED) {
                this.transitionPane.childDiv.style.filter = "";
            } else {
                this.transitionPane.childDiv.style.opacity = 1;
            }
        }
    },
    
    /** @see Extras.Sync.Animation#init */
    init: function() {
        if (this.transitionPane.childDiv) {
            if (Core.Web.Env.PROPRIETARY_IE_OPACITY_FILTER_REQUIRED) {
                this.transitionPane.childDiv.style.filter = "alpha(opacity=0)";
            } else {
                this.transitionPane.childDiv.style.opacity = 0;
            }
        }
        this.transitionPane.showContent();
    },
    
    /** @see Extras.Sync.Animation#step */
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

/**
 * Transition implementation to fade from old content to a solid color, then fade to new content.
 */
Extras.Sync.TransitionPane.FadeOpacityColorTransition = Core.extend(Extras.Sync.TransitionPane.Transition, {

    /** @see Extras.Sync.Animation#runTime */
    runTime: 1000,

    /**
     * The masking color DIV element being faded in/out over the changing content.
     * @type Element
     */
    _maskDiv: null,
    
    /**
     * Flag indicating whether old content has been fully faded out and swapped for new content.
     * @type Boolean
     */
    _swapped: false,
    
    /** @see Extras.Sync.Animation#complete */
    complete: function(abort) {
        this._maskDiv.parentNode.removeChild(this._maskDiv);
    },
    
    /** @see Extras.Sync.Animation#init */
    init: function() {
        this._maskDiv = document.createElement("div");
        this._maskDiv.style.cssText = "position:absolute;width:100%;height:100%;z-index:30000;";
        if (Core.Web.Env.PROPRIETARY_IE_OPACITY_FILTER_REQUIRED) {
            this._maskDiv.style.filter = "alpha(opacity=0)";
        } else {
            this._maskDiv.style.opacity = 0;
        }
        if (this.transitionPane.type === Extras.TransitionPane.TYPE_FADE_TO_WHITE) {
            this._maskDiv.style.backgroundColor = "#ffffff";
        } else {
            this._maskDiv.style.backgroundColor = "#000000";
        }
        this.transitionPane.contentDiv.appendChild(this._maskDiv);
    },

    /** @see Extras.Sync.Animation#step */
    step: function(progress) {
        var opacity = 1 - Math.abs(progress * 2 - 1);
        if (progress > 0.5 && !this._swapped) {
            this.transitionPane.showContent();
            this.transitionPane.removeOldContent();
            this._swapped = true;
        }
        if (Core.Web.Env.PROPRIETARY_IE_OPACITY_FILTER_REQUIRED) {
            var percent = Math.floor(opacity * 100);
            this._maskDiv.style.filter = "alpha(opacity=" + percent + ")";
        } else {
            this._maskDiv.style.opacity = opacity;
        }
    }
});
