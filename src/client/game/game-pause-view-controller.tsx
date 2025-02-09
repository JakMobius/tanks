import {PauseMenuButton, PauseMenuView} from "src/client/ui/overlay/pause-overlay/pause-menu-view";
import SettingsController from "src/client/ui/overlay/pause-overlay/controllers/settings-controller";
import PauseViewController from "src/client/ui/overlay/pause-overlay/controllers/pause-view-controller";
import PageLocation from "src/client/scenes/page-location";
import React from "react";
import ReactDOM from "react-dom/client"
import View from "../ui/view";

interface MainViewProps {
    controller: GamePauseViewController
}

const MainView: React.FC<MainViewProps> = (props) => {

    const closeHandler = () => props.controller.navigationView.emit("close")
    const leaveHandler = () => PageLocation.navigateToScene("hub")

    return <PauseMenuView>
        <PauseMenuButton blue controller={props.controller} target={SettingsController}>Настройки</PauseMenuButton>
        <PauseMenuButton blue onClick={closeHandler}>Продолжить игру</PauseMenuButton>
        <PauseMenuButton red onClick={leaveHandler}>Покинуть бой</PauseMenuButton>
    </PauseMenuView>
}

export default class GamePauseViewController extends PauseViewController {
    root: ReactDOM.Root
    
    constructor() {
        super();
        this.title = "Пауза"
        this.view = new View()
        this.root = ReactDOM.createRoot(this.view.element[0]);
        this.root.render(<MainView controller={this}/>)
    }
}