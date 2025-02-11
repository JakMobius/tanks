import {PauseMenuButton, PauseNavigationItem} from "src/client/ui/overlay/pause-overlay/pause-menu-view";
import GraphicsView from "src/client/ui/overlay/pause-overlay/controllers/graphics-controller";
import ControlsView from "src/client/ui/overlay/pause-overlay/controllers/pause-controls-view-controller";
import SoundView from "src/client/ui/overlay/pause-overlay/controllers/sound-controller";
import GameSettings from "src/client/settings/game-settings";
import React, { useCallback } from "react";

const SettingsView: React.FC = () => {

    const saveSettings = useCallback(() => {
        GameSettings.getInstance().saveIfNeeded()
    }, [])

    const onPush = () => {
        window.addEventListener("beforeunload", saveSettings)
    }

    const onPop = () => {
        window.removeEventListener("beforeunload", saveSettings)
        saveSettings()
    }

    return (
        <PauseNavigationItem onPush={onPush} onPop={onPop} title="Настройки">
            <PauseMenuButton blue target={<GraphicsView/>}>Графика</PauseMenuButton>
            <PauseMenuButton blue target={<ControlsView/>}>Управление</PauseMenuButton>
            <PauseMenuButton blue target={<SoundView/>}>Звук</PauseMenuButton>
        </PauseNavigationItem>
    )
}

export default SettingsView;