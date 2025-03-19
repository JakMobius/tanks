
import {PauseMenuButton, PauseNavigationItem} from "src/client/ui/pause-overlay/pause-menu-view";
import React, { useCallback } from "react";
import SettingsView from "src/client/ui/pause-overlay/controllers/settings-view";
import { useNavigation } from "src/client/ui/navigation/navigation-view";
import { useMapEditor } from "./map-editor-scene";
import Entity from "src/utils/ecs/entity";
import GroupPrefab from 'src/entity/types/group/server-prefab';
import { useEvents } from "../ui/events-hud/events-hud";
import { BasicEvent } from "../ui/events-hud/basic-event-view";

const MapEditorPauseView: React.FC = () => {

    const events = useEvents()
    const navigation = useNavigation()
    const closeHandler = () => navigation.pop()
    const leaveHandler = () => location.hash = ""

    const mapEditor = useMapEditor()

    const newMap = useCallback(() => {
        const rootGroup = new Entity()
        GroupPrefab.prefab(rootGroup)

        mapEditor.loadMap("Новая карта", rootGroup)
    }, [])

    const openMap = useCallback(() => {
        mapEditor.openMap().then(closeHandler).catch(() => {
            events.addEvent(() => <BasicEvent text="Не удалось открыть карту"/>)
        })
    }, [])

    const saveMap = useCallback(() => {
        mapEditor.saveMap()
    }, [])

    return (
        <PauseNavigationItem title="Меню">
            <PauseMenuButton blue onClick={newMap}>Новая карта</PauseMenuButton>
            <PauseMenuButton blue onClick={saveMap}>Сохранить карту</PauseMenuButton>
            <PauseMenuButton blue onClick={openMap}>Загрузить карту</PauseMenuButton>
            <PauseMenuButton blue target={<SettingsView/>}>Настройки</PauseMenuButton>
            <PauseMenuButton blue onClick={closeHandler}>Вернуться в редактор</PauseMenuButton>
            <PauseMenuButton red onClick={leaveHandler}>Выйти из редактора</PauseMenuButton>
        </PauseNavigationItem>
    )
}

export default MapEditorPauseView;