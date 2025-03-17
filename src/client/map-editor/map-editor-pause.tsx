
import {PauseMenuButton, PauseNavigationItem} from "src/client/ui/pause-overlay/pause-menu-view";
import React, { useCallback } from "react";
import SettingsView from "src/client/ui/pause-overlay/controllers/settings-view";
import { useNavigation } from "src/client/ui/navigation/navigation-view";
import { useMapEditorScene } from "./map-editor-scene";
import { useEvents } from "../ui/events-hud/events-hud";
import { BasicEvent } from "../ui/events-hud/basic-event-view";
import { readMapFromDialog, readMapFromFile } from "./read-map-from-file";
import Entity from "src/utils/ecs/entity";
import GroupPrefab from 'src/entity/types/group/server-prefab';

const MapEditorPauseView: React.FC = () => {

    const navigation = useNavigation()
    const closeHandler = () => navigation.pop()
    const leaveHandler = () => location.hash = ""

    const mapEditorScene = useMapEditorScene()

    const newMap = useCallback(() => {
        const rootGroup = new Entity()
        GroupPrefab.prefab(rootGroup)

        mapEditorScene.loadMap("Новая карта", rootGroup)
        
        closeHandler()
    }, [])

    return (
        <PauseNavigationItem title="Меню">
            <PauseMenuButton blue onClick={newMap}>Новая карта</PauseMenuButton>
            <PauseMenuButton blue onClick={mapEditorScene.saveMap}>Сохранить карту</PauseMenuButton>
            <PauseMenuButton blue onClick={mapEditorScene.openMap}>Загрузить карту</PauseMenuButton>
            <PauseMenuButton blue target={<SettingsView/>}>Настройки</PauseMenuButton>
            <PauseMenuButton blue onClick={closeHandler}>Вернуться в редактор</PauseMenuButton>
            <PauseMenuButton red onClick={leaveHandler}>Выйти из редактора</PauseMenuButton>
        </PauseNavigationItem>
    )
}

export default MapEditorPauseView;