/* @load-resource: '/src/client/ui/overlay.scss' */
/* @load-resource: './tool-settings.scss' */

const View = require("/src/client/ui/view")

class ToolSettingsView extends View {
    constructor() {
        super();

        this.element.addClass("menu editor-tool-settings")
        this.element.css("opacity", "0")
        this.element.hide()
        this.hidden = true
    }

    setupTool(tool) {
        if (tool.settingsView) {
            this.show()
            this.element.children().detach()
            this.element.css("width", tool.settingsView.width() + "px")
            this.element.append(tool.settingsView)
        } else {
            this.hide()
        }
    }

    show() {
        if (this.hidden) {
            this.element.show()
            this.element.css("opacity", "1")
            this.hidden = false
        }
    }

    hide() {
        if (!this.hidden) {
            this.element.css("opacity", "0")
            this.hidden = true
            setTimeout(() => {
                if(this.hidden) this.element.hide()
            }, 500)
        }
    }
}

module.exports = ToolSettingsView