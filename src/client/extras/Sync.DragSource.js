/**
 * Component rendering peer: DragSource.
 * This class should not be extended by developers, the implementation is subject to change.
 */
Extras.Sync.DragSource = Core.extend(Echo.Render.ComponentSync, {
    
    $load: function() {
        Echo.Render.registerPeer("Extras.DragSource", this);
    },
    
    /**
     * The dragging element.  This element is created by cloning the rendered DIV (and its descendants), reducing their
     * opacity, and then absolutely positioning it adjacent the mouse cursor position.
     * @type Element
     */
    _dragDiv: null,
    
    /**
     * Rendered DIV element.
     * @type Element 
     */
    _div: null,
    
    /**
     * Overlay DIV which covers other elements (such as IFRAMEs) when dragging which may otherwise suppress events.
     * @type Element
     */
    _overlayDiv: null,
    
    /**
     * Method reference to <code>_processMouseMove()</code>.
     * @type Function
     */
    _processMouseMoveRef: null,

    /**
     * Method reference to <code>_processMouseUp()</code>.
     * @type Function
     */
    _processMouseUpRef: null,

    /**
     * Constructor.
     */
    $construct: function() {
        this._processMouseMoveRef = Core.method(this, this._processMouseMove);
        this._processMouseUpRef = Core.method(this, this._processMouseUp);
    },
    
    /**
     * Prepare for a drag operation, register move/up listeners.
     * 
     * @param e the relevant mouse down event which started the drag operation
     */
    _dragPreStart: function(e) {
        this._dragStop();

        Core.Web.Event.add(document.body, "mousemove", this._processMouseMoveRef, true);
        Core.Web.Event.add(document.body, "mouseup", this._processMouseUpRef, true);
    },
    
    /**
     * Mouse has moved since drag operation was prepared, draw overlay DIV, create clone of
     * dragged item.
     * 
     * @param e the relevant mouse move event
     */
    _dragMoveStart: function(e) {
        this._overlayDiv = document.createElement("div");
        this._overlayDiv.style.cssText = "position:absolute;z-index:30000;width:100%;height:100%;cursor:pointer;";
        Echo.Sync.FillImage.render(this.client.getResourceUrl("Echo", "resource/Transparent.gif"), this._overlayDiv);

        this._dragDiv = this._div.cloneNode(true);
        this._dragDiv.style.position = "absolute";
        this._setDragOpacity(0.75);
        this._overlayDiv.appendChild(this._dragDiv);

        document.body.appendChild(this._overlayDiv);
    },
    
    /**
     * Performs a drop operation.
     * 
     * @param e the relevant mouse up event describing where the dragged item was dropped
     */
    _dragDrop: function(e) {
        var i,
            specificTarget = null,
            dropTarget, 
            testTarget,
            dropTargetIds,
            targetElement = this._findElement(this.client.domainElement, e.clientX, e.clientY);
        
        // Find specific target component.
        while (!specificTarget && targetElement && targetElement != this.client.domainElement) {
            if (targetElement.id) {
                specificTarget = this.client.application.getComponentByRenderId(targetElement.id);
            }
            targetElement = targetElement.parentNode;
        }
        
        // Return if specific target component could not be found.
        if (!specificTarget) {
            return;
        }

        // Retrieve valid drop target renderIds from component.
        dropTargetIds = this.component.get("dropTargetIds");
        if (!dropTargetIds) {
            dropTargetIds = [];
        }
        
        // Find actual drop target.
        testTarget = specificTarget;
        while (testTarget && !dropTarget) {
            for (i = 0; i < dropTargetIds.length; ++i) {
                if (dropTargetIds[i] == testTarget.renderId) {
                    // Drop target found.
                    dropTarget = testTarget;
                    break;
                }
            }
            testTarget = testTarget.parent;
        }
        
        // Return immediately if target is not a descendent of a drop target.
        if (!dropTarget) {
            return;
        }
        
        this.component.doDrop(dropTarget.renderId, specificTarget.renderId);
    },
    
    /**
     * Stop a drag operation.
     */
    _dragStop: function() {
        Core.Web.Event.remove(document.body, "mousemove", this._processMouseMoveRef, true);
        Core.Web.Event.remove(document.body, "mouseup", this._processMouseUpRef, true);

        if (this._overlayDiv) {
            document.body.removeChild(this._overlayDiv);
            this._overlayDiv = null;
        }
        this._dragDiv = null;
    },
    
    /**
     * Updates the position of the dragged object in response to mouse movement.
     * 
     * @param e the relevant mouse move event which necessitated the drag update
     */
    _dragUpdate: function(e) {
        this._dragDiv.style.top = e.clientY + "px";
        this._dragDiv.style.left = e.clientX + "px";
    },
    
    /**
     * Finds the highest-level (z-index) element at the specified x/y coordinate.
     * 
     * @param {Element} searchElement the element at which to begin searching
     * @param {Number} x the x coordinate
     * @param {Number} y the y coordinate
     * @return the element
     * @type Element
     */
    _findElement: function(searchElement, x, y) {
        if (searchElement.style.display == "none") {
            // Not displayed.
            return null;
        }

        if (searchElement.style.visibility == "hidden") {
            // Not visible.
            return null;
        }
        
        if (searchElement.nodeName && searchElement.nodeName.toLowerCase() == "colgroup") {
            // Ignore colgroups.
            return null;
        }

        var searchElementIsCandidate = false;
        if (!(searchElement.nodeName && searchElement.nodeName.toLowerCase() == "tr")) {
            var bounds = new Core.Web.Measure.Bounds(searchElement);
            if (this._isBoundsDefined(bounds)) {
                // Only take action if bounds is defined, as elements without positioning can contain positioned elements.
            
                if (this._isInBounds(bounds, x, y)) {
                    // Mark search element as being in candidate.
                    // This flag will be used to ensure that elements with undefined bounds are not returned as candidate.
                    // In any case, it is necessary to continue to search them for children that might be candidates though.
                    searchElementIsCandidate = true;
                } else {
                    // Out of bounds.
                    return null;
                }
            }
        }
        
        var candidates = null;

        // At this point, element is still a candidate.  Now we look for child elements with greater specificity.
        for (var i = 0; i < searchElement.childNodes.length; ++i) {
            if (searchElement.childNodes[i].nodeType != 1) {
                continue;
            }
            
            var resultElement = this._findElement(searchElement.childNodes[i], x, y);
            if (resultElement) {
                if (candidates == null) {
                    candidates = [];
                }
                candidates.push(resultElement);
            }
        }
        
        if (candidates != null) {
            if (candidates.length == 1) {
                return candidates[0];
            } else {
                return this._findHighestCandidate(searchElement, candidates);
            }
        }
        
        // The 'searchElement' is the best candidate found.  Return it only in the case where its bounds are actually defined.
        return searchElementIsCandidate ? searchElement : null;
    },
    
    /**
     * Determine which element amongst candidates is displayed above others (based on z-index).
     * 
     * @param {Element} searchElement the highest-level element from which all candidate elements descend
     * @param {Array} candidates an array of candidate elements to test
     * @return the highest candidate element
     * @type Element
     */
    _findHighestCandidate: function(parentElement, candidates) {
        var candidatePaths = [];
        var iCandidate;
        for (iCandidate = 0; iCandidate < candidates.length; ++iCandidate) {
            candidatePaths[iCandidate] = [];
            var element = candidates[iCandidate];
            do {
                if (element.style.zIndex) {
                    candidatePaths[iCandidate].unshift(element.style.zIndex);
                }
                element = element.parentNode;
            } while (element != parentElement);
        }
        
        var elementIndex = 0;
        var elementsFoundOnIteration;
        do {
            elementsFoundOnIteration = false;
            var highestZIndex = 0;
            var highestCandidateIndices = [];
            for (iCandidate = 0; iCandidate < candidatePaths.length; ++iCandidate) {
                if (elementIndex < candidatePaths[iCandidate].length) {
                    var zIndex = candidatePaths[iCandidate][elementIndex];
                    if (zIndex && zIndex > 0 && zIndex >= highestZIndex) {
                        if (zIndex == highestZIndex) {
                            // Value is equal to previous highest found, add to list of highest.
                            highestCandidateIndices.push(iCandidate);
                        } else {
                            // Value is greater than highest found, clear list of highest and add.
                            highestCandidateIndices = [];
                            highestCandidateIndices.push(iCandidate);
                            highestZIndex = zIndex;
                        }
                    }
                    elementsFoundOnIteration = true;
                }
            }
            
            if (highestCandidateIndices.length == 1) {
                // Only one candidate remains: return it.
                return candidates[highestCandidateIndices[0]];
            } else if (highestCandidateIndices.length > 0) {
                // Remove candidates that are now longer in contention.
                var remainingCandidates = [];
                for (var i = 0; i < highestCandidateIndices.length; ++i) {
                    remainingCandidates[i] = candidates[highestCandidateIndices[i]];
                }
                candidates = remainingCandidates;
            }
            ++elementIndex;
        } while (elementsFoundOnIteration);
        
        return candidates[candidates.length - 1];
    },
    
    /**
     * Determines if the specified bounding area is defined (has contained pixels).
     * 
     * @param {Core.Web.Measure.Bounds} bounds the bounding region
     * @return true if the bounds has a defined, nonzero area
     * @type Boolean
     */
    _isBoundsDefined: function(bounds) {
        return bounds.width !== 0 && bounds.height !== 0;
    },

    /**
     * Determines if a point is within a bounding region.
     * 
     * @param {Core.Web.Measure.Bounds} bounds the bounding region
     * @param {Number} x the horizontal coordinate of the point
     * @param {Number} y the vertical coordinate of the point
     * @return true if the point is in the bounding region
     * @type Boolean
     */
    _isInBounds: function(bounds, x, y) {
        return x >= bounds.left && y >= bounds.top && x <= bounds.left + bounds.width && y <= bounds.top + bounds.height;
    },

    /**
     * Processes a mouse down event on the drag source container element.
     * 
     * @param e the event
     */
    _processMouseDown: function(e) {
        Core.Web.DOM.preventEventDefault(e);

        if (!this.client || !this.client.verifyInput(this.component)) {
            return;
        }
        
        this._dragPreStart(e);
    },
    
    /**
     * Processes a mouse move event (on the overlay DIV).
     * 
     * @param e the event
     */
    _processMouseMove: function(e) {
        Core.Web.DOM.preventEventDefault(e);
        if (!this._dragDiv) {
            this._dragMoveStart();
        }
        this._dragUpdate(e);
    },
    
    /**
     * Processes a mouse up event (on the overlay DIV).
     * 
     * @param e the event
     */
    _processMouseUp: function(e) {
        var inProgress = !!this._dragDiv;
        if (inProgress) {
            Core.Web.DOM.preventEventDefault(e);
        }
        this._dragStop();
        if (inProgress) {
            this._dragDrop(e);
        }
    },
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        this._div.style.cssText = "cursor:pointer;";
        if (this.component.children.length > 0) {
            Echo.Render.renderComponentAdd(update, this.component.children[0], this._div);
        }

        Core.Web.Event.add(this._div, "mousedown", Core.method(this, this._processMouseDown), true);
        
        parentElement.appendChild(this._div);
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        this._dragStop();
        Core.Web.Event.removeAll(this._div);

        this._dragDiv = null;
        this._div = null;
    },
    
    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        var element = this._div;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
    },
    
    /**
     * Sets the opacity of the dragged item.
     * 
     * @param value the new opacity
     */
    _setDragOpacity: function(value) {
        if (Core.Web.Env.NOT_SUPPORTED_CSS_OPACITY) {
            if (Core.Web.Env.PROPRIETARY_IE_OPACITY_FILTER_REQUIRED) {
                this._dragDiv.style.filter = "alpha(opacity=" + (value * 100) + ")";
            }
        } else {
            this._dragDiv.style.opacity = value;
        }
    }
});