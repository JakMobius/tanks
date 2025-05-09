import {PauseMenuButton, PauseNavigationItem} from "src/client/ui/pause-overlay/pause-menu-view";
import PageLocation from "src/client/scenes/page-location";
import React from "react";
import SettingsView from "src/client/ui/pause-overlay/controllers/settings-view";
import { useNavigation } from "../ui/navigation/navigation-view";

const GamePauseView: React.FC = () => {

    const navigation = useNavigation()

    const closeHandler = () => navigation.pop()
    const leaveHandler = () => PageLocation.navigateToScene("hub")

    return (
        <PauseNavigationItem title="Пауза">
            <PauseMenuButton blue target={<SettingsView/>}>Настройки</PauseMenuButton>
            <PauseMenuButton blue onClick={closeHandler}>Продолжить игру</PauseMenuButton>
            <PauseMenuButton red onClick={leaveHandler}>Покинуть бой</PauseMenuButton>
        </PauseNavigationItem>
    )
}

export default GamePauseView;