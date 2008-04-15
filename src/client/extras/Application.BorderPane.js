/**
 * BorderPane component.
 *
 * @sp {#FillImageBorder} border the border with which to surround the content.
 * @sp {#Insets} insets the inset margin between border and content.
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
    
    componentType: "Extras.BorderPane",
    pane: true
});