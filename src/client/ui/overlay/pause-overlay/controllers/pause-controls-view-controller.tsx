import PauseViewController from "src/client/ui/overlay/pause-overlay/controllers/pause-view-controller";
import AxisSelector from "src/client/ui/overlay/pause-overlay/elements/axis-selector/axis-selector";
import ControllerSelector from "src/client/ui/overlay/pause-overlay/elements/controller-selector/controller-selector";
import InputDevice from "src/client/controls/input/input-device";
import GameSettings from "src/client/settings/game-settings";
import RootControlsResponder from "src/client/controls/root-controls-responder";
import ControlsPrinter from "src/client/controls/controls-printer";
import { PauseMenuView, PauseMenuButton, PauseMenuSubtitle } from "../pause-menu-view";
import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import View from "src/client/ui/view";

interface ControlsViewProps {

}

const ControlsView: React.FC<ControlsViewProps> = (props) => {

    let [selectedDevice, setSelectedDevice] = useState(0)

    const tankControlsEntries = [
        { title: "Газ", axle: "tank-throttle-forward" },
        { title: "Тормоз / назад", axle: "tank-throttle-backward" },
        { title: "Влево", axle: "tank-steer-left" },
        { title: "Вправо", axle: "tank-steer-right" },
        { title: "Выстрел", axle: "tank-primary-weapon" },
        { title: "Поставить мину", axle:  "tank-miner" },
    ]

    const gameControlsEntries = [
        { title: "Чат", axle: "game-chat" },
        { title: "Респавн", axle: "tank-respawn" },
        { title: "Сброс флага", axle: "tank-flag-drop" },
        { title: "Список игроков", axle: "game-player-list" },
        { title: "Пауза", axle: "game-pause" },
    ]

    const generateAxles = (entries: { title: string, axle: string }[]) => {
        let device = RootControlsResponder.getInstance().devices[selectedDevice]
        let settings = GameSettings.getInstance().controls.getConfigForDevice(device)

        return entries.map((entry, i) => {
            let keyNames = (settings.get(entry.axle) ?? []).map(axle => {
                return ControlsPrinter.getPrintedNameOfAxle(axle, device)
            })

            return <AxisSelector key={i} text={entry.title} axes={keyNames}/>
        })
    }

    return (
        <PauseMenuView>
            <PauseMenuSubtitle>Обнаруженные контроллеры</PauseMenuSubtitle>
            <ControllerSelector value={selectedDevice} onChange={setSelectedDevice}/>
            <PauseMenuButton blue>Настройки контроллера</PauseMenuButton>
            <PauseMenuSubtitle>Управление танком</PauseMenuSubtitle>
            {...generateAxles(tankControlsEntries)}
            <PauseMenuSubtitle>Игровой процесс</PauseMenuSubtitle>
            {...generateAxles(gameControlsEntries)}
            <PauseMenuButton red>Настройки по умолчанию</PauseMenuButton>
        </PauseMenuView>
    )
}

export default class PauseControlsViewController extends PauseViewController {
    root: ReactDOM.Root
    
    constructor() {
        super();
        this.title = "Управление"
        this.view = new View()
        this.root = ReactDOM.createRoot(this.view.element[0]);
        this.root.render(<ControlsView/>)
    }
}