
import {PauseMenuButton, PauseNavigationItem} from "src/client/ui/overlay/pause-overlay/pause-menu-view";
import React from "react";
import NewMapView from "src/client/map-editor/ui/pause/new-map-view";
import SettingsView from "src/client/ui/overlay/pause-overlay/controllers/settings-view";
import LoadMapView from "./load-map-view";
import { useNavigation } from "src/client/ui/navigation/navigation-view";

const MapEditorPauseView: React.FC = () => {

    const navigation = useNavigation()
    const closeHandler = () => navigation.pop()
    const leaveHandler = () => location.hash = ""

    return (
        <PauseNavigationItem title="Меню">
            <PauseMenuButton blue target={<NewMapView/>}>Новая карта</PauseMenuButton>
            <PauseMenuButton blue>Сохранить карту</PauseMenuButton>
            <PauseMenuButton blue target={<LoadMapView/>}>Загрузить карту</PauseMenuButton>
            <PauseMenuButton blue target={<SettingsView/>}>Настройки</PauseMenuButton>
            <PauseMenuButton blue onClick={closeHandler}>Вернуться в редактор</PauseMenuButton>
            <PauseMenuButton red onClick={leaveHandler}>Выйти из редактора</PauseMenuButton>
        </PauseNavigationItem>
    )
}

export default MapEditorPauseView;