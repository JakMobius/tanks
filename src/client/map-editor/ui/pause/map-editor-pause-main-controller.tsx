import SettingsController from "src/client/ui/overlay/pause-overlay/controllers/settings-controller";
import {PauseMenuButton, PauseMenuView} from "src/client/ui/overlay/pause-overlay/pause-menu-view";
import PauseViewController from "src/client/ui/overlay/pause-overlay/controllers/pause-view-controller";
import LoadMapController from "src/client/map-editor/ui/pause/load-map-controller";
import NewMapController from "src/client/map-editor/ui/pause/new-map-controller";
import React from "react";
import ReactDOM from "react-dom/client";
import View from "src/client/ui/view";

interface MainViewProps {
    controller: PauseViewController
}

const MainView: React.FC<MainViewProps> = (props) => {

    const closeHandler = () => props.controller.navigationView.emit("close")
    const leaveHandler = () => location.hash = ""

    return <PauseMenuView>
        <PauseMenuButton blue controller={props.controller} target={NewMapController}>Новая карта</PauseMenuButton>
        <PauseMenuButton blue>Сохранить карту</PauseMenuButton>
        <PauseMenuButton blue controller={props.controller} target={LoadMapController}>Загрузить карту</PauseMenuButton>
        <PauseMenuButton blue controller={props.controller} target={SettingsController}>Настройки</PauseMenuButton>
        <PauseMenuButton blue onClick={closeHandler}>Вернуться в редактор</PauseMenuButton>
        <PauseMenuButton red onClick={leaveHandler}>Выйти из редактора</PauseMenuButton>
    </PauseMenuView>
}

export default class MapEditorPauseMainController extends PauseViewController {

    root: ReactDOM.Root
    
    constructor() {
        super();
        this.title = "Меню"
        this.view = new View()
        this.root = ReactDOM.createRoot(this.view.element[0]);
        this.root.render(<MainView controller={this}/>)
    }
}
