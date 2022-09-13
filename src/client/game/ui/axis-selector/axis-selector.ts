/* @load-resource: ./axis-selector.scss */

import View from "src/client/ui/view";
import Cloud from "../cloud/cloud";

export default class AxisSelector extends View {
    keyName = new Cloud().blue()
    keys = $("<div>").addClass("mapped-keys")

    constructor(text?: string) {
        super();
        this.element.addClass("axis-selector")

        this.keyName.text(text)

        this.element.append(this.keyName.element)
        this.element.append(this.keys)
    }

    setAxes(axes: string[]) {
        this.keys.empty()
        if(axes.length > 0) {
            axes.forEach(axle => {
                this.keys.append(new Cloud().text(axle).blue().element)
            })
        } else {
            this.keys.append(new Cloud().text("Не установлено").element)
        }
        return this
    }
}