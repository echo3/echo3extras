/**
 * Component rendering peer: ToolTipContainer
 */
ExtrasRender.ComponentSync.ToolTipContainer = function() {
	this._divElement = null;
	this._applyDivElement = null;
	this._tooltipDivElement = null;
};

ExtrasRender.ComponentSync.ToolTipContainer.prototype = new EchoRender.ComponentSync;

ExtrasRender.ComponentSync.ToolTipContainer.prototype.getElement = function() {
	return this._divElement;
};

ExtrasRender.ComponentSync.ToolTipContainer.prototype.renderAdd = function(update, parentElement) {
    this._divElement = document.createElement("div");
    this._divElement.id = this.component.renderId;
    
    this._applyDivElement = this._createApplyTo(update);
    this._divElement.appendChild(this._applyDivElement);
    
    this._tooltipDivElement = this._createToolTip(update);
	document.getElementsByTagName("body")[0].appendChild(this._tooltipDivElement);
    
    parentElement.appendChild(this._divElement);
};

ExtrasRender.ComponentSync.ToolTipContainer.prototype.renderUpdate = function(update) {
    var element = this.getElement();
    var containerElement = element.parentNode;
    EchoRender.renderComponentDispose(update, update.parent);
    containerElement.removeChild(element);
    this.renderAdd(update, containerElement);
    return true;
};

ExtrasRender.ComponentSync.ToolTipContainer.prototype.renderDispose = function(update) {
	this._divElement.id = "";
	this._divElement = null;
	
    EchoWebCore.EventProcessor.removeAll(this._applyDivElement);
	this._applyDivElement.id = "";
	this._applyDivElement = null;
	
	if (this._tooltipDivElement && this._tooltipDivElement.parentNode) {
		this._tooltipDivElement.parentNode.removeChild(this._tooltipDivElement);
	}
	this._tooltipDivElement = null;
};

ExtrasRender.ComponentSync.ToolTipContainer.prototype._createToolTip = function(update) {
    var tooltipDivElement = document.createElement("div");
    tooltipDivElement.style.visibility = "hidden";
    tooltipDivElement.style.position = "absolute";
	EchoRender.renderComponentAdd(update, this.component.getComponent(0), tooltipDivElement);
    return tooltipDivElement;
};

ExtrasRender.ComponentSync.ToolTipContainer.prototype._createApplyTo = function(update) {
	var applyToComponent = this.component.getComponent(1);
	
    var applyDivElement = document.createElement("div");
    applyDivElement.id = applyToComponent.renderId;
	EchoRender.renderComponentAdd(update, applyToComponent, applyDivElement);
    
    var mouseEnterLeaveSupport = EchoWebCore.Environment.PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED;
    var enterEvent = mouseEnterLeaveSupport ? "mouseenter" : "mouseover";
    var exitEvent = mouseEnterLeaveSupport ? "mouseleave" : "mouseout";
    EchoWebCore.EventProcessor.add(applyDivElement, enterEvent, new EchoCore.MethodRef(this, this._processRolloverEnter), false);
	EchoWebCore.EventProcessor.add(applyDivElement, exitEvent, new EchoCore.MethodRef(this, this._processRolloverExit), false);
	EchoWebCore.EventProcessor.add(applyDivElement, "mousemove", new EchoCore.MethodRef(this, this._processMove), false);
    
    return applyDivElement;
};

ExtrasRender.ComponentSync.ToolTipContainer.prototype._positionToolTip = function(e) {
	var x = e.pageX || (e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft));
	var y = e.pageY || (e.clientY + (document.documentElement.scrollTop || document.body.scrollTop));
	
	this._tooltipDivElement.style.left = (x + 10) + "px";
	this._tooltipDivElement.style.top = (y + 10) + "px";
};

ExtrasRender.ComponentSync.ToolTipContainer.prototype._processMove = function(e) {
    if (!this.component.isActive()) {
        return;
    }
    this._positionToolTip(e);
};

ExtrasRender.ComponentSync.ToolTipContainer.prototype._processRolloverEnter = function(e) {
    if (!this.component.isActive()) {
        return;
    }
    this._positionToolTip(e);
    this._tooltipDivElement.style.visibility = "visible";
};

ExtrasRender.ComponentSync.ToolTipContainer.prototype._processRolloverExit = function(e) {
    if (!this.component.isActive()) {
        return;
    }
    this._tooltipDivElement.style.visibility = "hidden";
};

EchoRender.registerPeer("nextapp.echo.extras.app.ToolTipContainer", ExtrasRender.ComponentSync.ToolTipContainer);
