/**
 * Component rendering peer: ToolTipContainer
 */
ExtrasRender.ComponentSync.ToolTipContainer = Core.extend(EchoRender.ComponentSync, {
    
    $load: function() {
        EchoRender.registerPeer("ExtrasApp.ToolTipContainer", this);
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
            document.getElementsByTagName("body")[0].appendChild(this._tooltipDivElement);
        }
        
        parentElement.appendChild(this._divElement);
    },
    
    renderUpdate: function(update) {
        var element = this._divElement;
        var containerElement = element.parentNode;
        EchoRender.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    },
    
    renderDispose: function(update) {
        this._divElement = null;
        
        if (this._applyDivElement) {
            WebCore.EventProcessor.removeAll(this._applyDivElement);
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
        tooltipDivElement.style.visibility = "hidden";
        tooltipDivElement.style.position = "absolute";
        EchoRender.renderComponentAdd(update, this.component.getComponent(1), tooltipDivElement);
        return tooltipDivElement;
    },
    
    _createApplyTo: function(update) {
        var applyToComponent = this.component.getComponent(0);
        
        var applyDivElement = document.createElement("div");
        applyDivElement.id = applyToComponent.renderId;
        applyDivElement.style.cursor = "default";
        EchoRender.renderComponentAdd(update, applyToComponent, applyDivElement);
        
        if (this.component.getComponentCount() > 1) {
            var mouseEnterLeaveSupport = WebCore.Environment.PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED;
            var enterEvent = mouseEnterLeaveSupport ? "mouseenter" : "mouseover";
            var exitEvent = mouseEnterLeaveSupport ? "mouseleave" : "mouseout";
            WebCore.EventProcessor.add(applyDivElement, enterEvent, Core.method(this, this._processRolloverEnter), false);
            WebCore.EventProcessor.add(applyDivElement, exitEvent, Core.method(this, this._processRolloverExit), false);
            WebCore.EventProcessor.add(applyDivElement, "mousemove", Core.method(this, this._processMove), false);
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
    },
    
    _processRolloverEnter: function(e) {
        if (!this.component.isActive()) {
            return;
        }
        this._positionToolTip(e);
        this._tooltipDivElement.style.visibility = "visible";
    },
    
    _processRolloverExit: function(e) {
        if (!this.component.isActive()) {
            return;
        }
        this._tooltipDivElement.style.visibility = "hidden";
    }
});
