/**
 * Component rendering peer: ToolTipContainer
 */
Extras.Sync.ToolTipContainer = Core.extend(Echo.Render.ComponentSync, {
    
    $load: function() {
        Echo.Render.registerPeer("Extras.ToolTipContainer", this);
    },
    
    $construct: function() {
        this._divElement = null;
        this._applyDivElement = null;
        this._tooltipDivElement = null;
    },
    
    renderAdd: function(update, parentElement) {
        this._divElement = document.createElement("div");
        var componentCount = this.component.getComponentCount();
        
        if (componentCount > 0) {
            this._applyDivElement = this._createApplyTo(update);
            this._divElement.appendChild(this._applyDivElement);
        }
        
        if (componentCount > 1) {
            this._tooltipDivElement = this._createToolTip(update);
            document.body.appendChild(this._tooltipDivElement);
        }
        
        parentElement.appendChild(this._divElement);
    },
    
    renderUpdate: function(update) {
        var element = this._divElement;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    },
    
    renderDispose: function(update) {
        this._divElement = null;
        
        if (this._applyDivElement) {
            Core.Web.Event.removeAll(this._applyDivElement);
            this._applyDivElement.id = "";
            this._applyDivElement = null;
        }
        
        if (this._tooltipDivElement && this._tooltipDivElement.parentNode) {
            this._tooltipDivElement.parentNode.removeChild(this._tooltipDivElement);
        }
        this._tooltipDivElement = null;
    },
    
    _createToolTip: function(update) {
        var tooltipDivElement = document.createElement("div");
        tooltipDivElement.style.zIndex = 32767;
        tooltipDivElement.style.visibility = "hidden";
        tooltipDivElement.style.position = "absolute";
        var width = this.component.render("width");
        if (width) {
            tooltipDivElement.style.width = Echo.Sync.Extent.toCssValue(width);
        }
        Echo.Render.renderComponentAdd(update, this.component.getComponent(1), tooltipDivElement);
        return tooltipDivElement;
    },
    
    _createApplyTo: function(update) {
        var applyToComponent = this.component.getComponent(0);
        
        var applyDivElement = document.createElement("div");
        applyDivElement.id = applyToComponent.renderId;
        applyDivElement.style.cursor = "default";
        Echo.Render.renderComponentAdd(update, applyToComponent, applyDivElement);
        
        if (this.component.getComponentCount() > 1) {
            var mouseEnterLeaveSupport = Core.Web.Env.PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED;
            var enterEvent = mouseEnterLeaveSupport ? "mouseenter" : "mouseover";
            var exitEvent = mouseEnterLeaveSupport ? "mouseleave" : "mouseout";
            Core.Web.Event.add(applyDivElement, enterEvent, Core.method(this, this._processRolloverEnter), true);
            Core.Web.Event.add(applyDivElement, exitEvent, Core.method(this, this._processRolloverExit), true);
            Core.Web.Event.add(applyDivElement, "mousemove", Core.method(this, this._processMove), true);
        }
        
        return applyDivElement;
    },
    
    _positionToolTip: function(e) {
        var x = e.pageX || (e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft));
        var y = e.pageY || (e.clientY + (document.documentElement.scrollTop || document.body.scrollTop));
        
        this._tooltipDivElement.style.left = (x + 10) + "px";
        this._tooltipDivElement.style.top = (y + 10) + "px";
    },
    
    _processMove: function(e) {
        if (!this.component.isActive()) {
            return;
        }
        this._positionToolTip(e);
        return true;
    },
    
    _processRolloverEnter: function(e) {
        if (!this.component.isActive()) {
            return;
        }
        this._positionToolTip(e);
        this._tooltipDivElement.style.visibility = "visible";
        return true;
    },
    
    _processRolloverExit: function(e) {
        if (!this.component.isActive()) {
            return;
        }
        this._tooltipDivElement.style.visibility = "hidden";
        return true;
    }
});
