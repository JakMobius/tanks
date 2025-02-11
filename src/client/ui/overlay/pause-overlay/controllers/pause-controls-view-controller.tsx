import AxisSelector from "src/client/ui/overlay/pause-overlay/elements/axis-selector/axis-selector";
import ControllerSelector from "src/client/ui/overlay/pause-overlay/elements/controller-selector/controller-selector";
import GameSettings from "src/client/settings/game-settings";
import RootControlsResponder from "src/client/controls/root-controls-responder";
import ControlsPrinter from "src/client/controls/controls-printer";
import { PauseNavigationItem, PauseMenuButton, PauseMenuSubtitle } from "../pause-menu-view";
import React, { useState } from "react";

const ControlsView: React.FC = () => {

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
        <PauseNavigationItem title="Управление">
            <PauseMenuSubtitle>Обнаруженные контроллеры</PauseMenuSubtitle>
            <ControllerSelector value={selectedDevice} onChange={setSelectedDevice}/>
            <PauseMenuButton blue>Настройки контроллера</PauseMenuButton>
            <PauseMenuSubtitle>Управление танком</PauseMenuSubtitle>
            {...generateAxles(tankControlsEntries)}
            <PauseMenuSubtitle>Игровой процесс</PauseMenuSubtitle>
            {...generateAxles(gameControlsEntries)}
            <PauseMenuButton red>Настройки по умолчанию</PauseMenuButton>
        </PauseNavigationItem>
    )
}

export default ControlsView;