
import PauseKeyValueRow from "src/client/ui/overlay/pause-overlay/elements/pause-key-value-row";
import Cloud from "src/client/ui/overlay/pause-overlay/elements/cloud/cloud";
import InputCloud from "src/client/ui/elements/input-cloud/input-cloud";

export default class PauseInputRow extends PauseKeyValueRow {
    title = new Cloud()
    input = new InputCloud().button()

    constructor() {
        super();
        this.element.append(this.title.element)
        this.element.append(this.input.element)

        this.element.on("click", () => {
            this.input.input.input.trigger("focus")
        })
    }
}