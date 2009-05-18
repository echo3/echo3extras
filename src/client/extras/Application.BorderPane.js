/**
 * BorderPane component: a container which renders a
 * <code>FillImageBorder</code> around its content. May contain only one
 * child. May contain a pane component as a child.
 * 
 * @sp {#FillImage} backgroundImage  the content background image
 * @sp {#FillImageBorder} border the border with which to surround the content
 * @sp {#Insets} insets the inset margin between border and content
 */
Extras.BorderPane = Core.extend(Echo.Component, {
    
    $static: {
    
        /**
         * Default border.
         * @type #FillImageBorder
         */
        DEFAULT_BORDER: { color: "#00007f", contentInsets: 20, borderInsets: 3 }
    },
    
    $load: function() {
        Echo.ComponentFactory.registerType("Extras.BorderPane", this);
    },
    
    /** @see Echo.Component#componentType */
    componentType: "Extras.BorderPane",

    /** @see Echo.Component#pane */
    pane: true
});