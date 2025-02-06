import './tank-change-event-view.scss'

import LargeIconEventView from "src/client/ui/overlay/events-overlay/types/large-icon-event-view";
import {getTankDescription} from "src/client/ui/overlay/tank-select-overlay/tank-descriptions";

export default class TankChangeEventView extends LargeIconEventView {
    constructor(newTank: number) {
        super();
        this.element.addClass("tank-change-event-view")

        this.updateTankType(newTank)
    }

    updateTankType(type: number) {
        this.title.empty()
        this.title.append(
            $("<span>").addClass("tank-type").text(getTankDescription(type).name),
            " будет выбран после респавна"
        )

        this.subtitle.empty()
        this.subtitle.append(
            "Вы можете быстро взорвать свой танк, нажав ",
            $("<span>").addClass("key").text("R"),
            ". Мы всё возместим."
        )
    }

    appear() {
        super.appear();
        setTimeout(() => this.disappear(), 30000)
    }
}