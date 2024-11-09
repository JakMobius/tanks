/* @load-resource: ./axis-selector.scss */

import Cloud from "src/client/ui/overlay/pause-overlay/elements/cloud/cloud";
import PauseKeyValueRow from "src/client/ui/overlay/pause-overlay/elements/pause-key-value-row";

export default class AxisSelector extends PauseKeyValueRow {
    keyName = new Cloud().blue().customClass("key-name")
    keys = $("<div>").addClass("mapped-keys")

    constructor(text?: string) {
        super();
        this.small()

        this.element.addClass("axis-selector")

        this.keyName.text(text)

        this.element.append(this.keyName.element)
        this.element.append(this.keys)
    }

    setAxes(axes: string[]) {
        this.keys.empty()
        if(axes.length > 0) {
            axes.forEach(axle => {
                this.keys.append(new Cloud().customClass("mapped-key").text(axle).blue().element)
            })
        } else {
            this.keys.append(new Cloud().customClass("mapped-key").text("Не установлено").element)
        }
        return this
    }
}