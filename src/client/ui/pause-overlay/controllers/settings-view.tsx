
import React, { useCallback, useEffect } from "react";
import GraphicsView from "./graphics-view";
import ControlsView from "./controls-view";
import SoundView from "./sound-view";
import { PauseMenuButton, PauseNavigationItem } from "../pause-menu-view";

const SettingsView: React.FC = () => {
    return (
        <PauseNavigationItem title="Настройки">
            <PauseMenuButton blue target={<GraphicsView/>}>Графика</PauseMenuButton>
            <PauseMenuButton blue target={<ControlsView/>}>Управление</PauseMenuButton>
            <PauseMenuButton blue target={<SoundView/>}>Звук</PauseMenuButton>
        </PauseNavigationItem>
    )
}

export default SettingsView;