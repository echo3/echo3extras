package nextapp.echo.extras.testapp.testscreen;

import nextapp.echo.app.Label;
import nextapp.echo.app.Panel;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.extras.app.ToolTipContainer;
import nextapp.echo.extras.testapp.AbstractTest;
import nextapp.echo.extras.testapp.StyleUtil;
import nextapp.echo.extras.testapp.Styles;
import nextapp.echo.extras.testapp.TestControlPane;

/**
 * Interactive test module for <code>ToolTipContainer</code>s.
 */
public class ToolTipContainerTest extends AbstractTest {
    private Panel tooltip;
    
    public ToolTipContainerTest() {
        super("ToolTipContainer", Styles.ICON_16_TOOL_TIP_CONTAINER);
        
        final ToolTipContainer tooltipContainer = new ToolTipContainer();
        tooltipContainer.add(new Label("Hover Me!"));
        tooltip = new Panel();
        tooltip.setStyleName("TooltipPanel");
        tooltipContainer.add(tooltip);
        add(tooltipContainer);
        setTestComponent(this, tooltipContainer);
        
        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Small Label", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tooltip.removeAll();
                tooltip.add(new Label("Tooltip Component"));
            }
        });
        testControlsPane.addButton(TestControlPane.CATEGORY_CONTENT, "Large Label", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                tooltip.removeAll();
                tooltip.add(new Label(StyleUtil.QUASI_LATIN_TEXT_1));
            }
        });
    }
}