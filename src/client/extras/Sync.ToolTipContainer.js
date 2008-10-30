/**
 * Component rendering peer: ToolTipContainer
 */
Extras.Sync.ToolTipContainer = Core.extend(Echo.Render.ComponentSync, {
    
    $load: function() {
        Echo.Render.registerPeer("Extras.ToolTipContainer", this);
    },
    
    $construct: function() {
        this._div = null;
        this._applyDiv = null;
        this._toolTipDiv = null;
    },
    
    renderAdd: function(update, parentElement) {
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        var componentCount = this.component.getComponentCount();
        
        if (componentCount > 0) {
            this._applyDiv = this._createApplyTo(update);
            this._div.appendChild(this._applyDiv);
        }
        
        if (componentCount > 1) {
            this._toolTipDiv = this._createToolTip(update);
        }
        
        parentElement.appendChild(this._div);
    },
    
    renderUpdate: function(update) {
        var element = this._div;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    },
    
    renderDispose: function(update) {
        this._div = null;
        
        if (this._applyDiv) {
            Core.Web.Event.removeAll(this._applyDiv);
            this._applyDiv = null;
        }
        
        if (this._toolTipDiv && this._toolTipDiv.parentNode === document.body) {
            document.body.removeChild(this._toolTipDiv);
            this._toolTipDiv = null;
        }
    },
    
    _createToolTip: function(update) {
        var div = document.createElement("div");
        div.style.zIndex = 32767;
        div.style.position = "absolute";
        var width = this.component.render("width");
        if (width) {
            div.style.width = Echo.Sync.Extent.toCssValue(width);
        }
        Echo.Render.renderComponentAdd(update, this.component.getComponent(1), div);
        return div;
    },
    
    _createApplyTo: function(update) {
        var applyToComponent = this.component.getComponent(0);
        
        var div = document.createElement("div");
        div.style.cursor = "default";
        Echo.Render.renderComponentAdd(update, applyToComponent, div);
        
        if (this.component.getComponentCount() > 1) {
            var mouseEnterLeaveSupport = Core.Web.Env.PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED;
            var enterEvent = mouseEnterLeaveSupport ? "mouseenter" : "mouseover";
            var exitEvent = mouseEnterLeaveSupport ? "mouseleave" : "mouseout";
            Core.Web.Event.add(div, enterEvent, Core.method(this, this._processRolloverEnter), true);
            Core.Web.Event.add(div, exitEvent, Core.method(this, this._processRolloverExit), true);
            Core.Web.Event.add(div, "mousemove", Core.method(this, this._processMove), true);
        }
        
        return div;
    },
    
    _positionToolTip: function(e) {
        var x = e.pageX || (e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft));
        var y = e.pageY || (e.clientY + (document.documentElement.scrollTop || document.body.scrollTop));
        
        this._toolTipDiv.style.left = (x + 10) + "px";
        this._toolTipDiv.style.top = (y + 10) + "px";
    },
    
    _processMove: function(e) {
        if (!this.client || !this.client.verifyInput(this.component) || Core.Web.dragInProgress) {
            return;
        }
        this._positionToolTip(e);
        return true;
    },
    
    _processRolloverEnter: function(e) {
        if (!this.client || !this.client.verifyInput(this.component) || Core.Web.dragInProgress) {
            return;
        }
        
        if (this._toolTipDiv.parentNode !== document.body) {
            document.body.appendChild(this._toolTipDiv);
            this._positionToolTip(e);
        }
        return true;
    },
    
    _processRolloverExit: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return;
        }
        if (this._toolTipDiv.parentNode === document.body) {
            document.body.removeChild(this._toolTipDiv);
        }
        return true;
    }
});
