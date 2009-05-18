/**
 * Component rendering peer: BorderPane.
 * This class should not be extended by developers, the implementation is subject to change.
 */
Extras.Sync.BorderPane = Core.extend(Echo.Render.ComponentSync, {

    $load: function() {
        Echo.Render.registerPeer("Extras.BorderPane", this);
    },

    /**
     * The main DIV element.
     * @type Element
     */
    _div: null,
    
    /**
     * The content containing DIV element.
     * @type Element
     */
    _content: null,
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this._div = Echo.Sync.FillImageBorder.renderContainer(this.component.render("border", Extras.BorderPane.DEFAULT_BORDER),
                { absolute: true, content: true });
        this._div.id = this.component.renderId;
        this._div.style.top = this._div.style.right = this._div.style.bottom = this._div.style.left = 0;
        
        this._content = Echo.Sync.FillImageBorder.getContainerContent(this._div);
        
        Echo.Sync.renderComponentDefaults(this.component, this._content);
        Echo.Sync.FillImage.render(this.component.render("backgroundImage"), this._content);
    
        var componentCount = this.component.getComponentCount();
        if (componentCount == 1) {
            var child = this.component.getComponent(0);
            var insets = child.pane ? null : this.component.render("insets");
            if (insets) {
                Echo.Sync.Insets.render(insets, this._content, "padding");
            }
            Echo.Render.renderComponentAdd(update, child, this._content);
        } else if (componentCount > 1) {
            throw new Error("Too many children: " + componentCount);
        }
        
        parentElement.appendChild(this._div);
    },
    
    /** @see Echo.Render.ComponentSync#renderDisplay */
    renderDisplay: function() {
        Echo.Sync.FillImageBorder.renderContainerDisplay(this._div);
        Core.Web.VirtualPosition.redraw(this._content);
        Core.Web.VirtualPosition.redraw(this._div);
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        this._content = null;
        this._div = null;
    },
    
    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        var element = this._div;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    }
});
