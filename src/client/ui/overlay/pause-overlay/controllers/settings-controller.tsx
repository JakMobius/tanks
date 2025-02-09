import {PauseMenuButton, PauseMenuView} from "src/client/ui/overlay/pause-overlay/pause-menu-view";
import GraphicsController from "src/client/ui/overlay/pause-overlay/controllers/graphics-controller";
import PauseControlsViewController from "src/client/ui/overlay/pause-overlay/controllers/pause-controls-view-controller";
import PauseViewController from "src/client/ui/overlay/pause-overlay/controllers/pause-view-controller";
import SoundController from "src/client/ui/overlay/pause-overlay/controllers/sound-controller";
import GameSettings from "src/client/settings/game-settings";
import React from "react";
import ReactDOM from "react-dom/client"
import View from "src/client/ui/view";

interface MainViewProps {
    controller: PauseViewController
}

const MainView: React.FC<MainViewProps> = (props) => {
    return <PauseMenuView>
        <PauseMenuButton blue controller={props.controller} target={GraphicsController}>Графика</PauseMenuButton>
        <PauseMenuButton blue controller={props.controller} target={PauseControlsViewController}>Управление</PauseMenuButton>
        <PauseMenuButton blue controller={props.controller} target={SoundController}>Звук</PauseMenuButton>
    </PauseMenuView>
}

export default class SettingsController extends PauseViewController {

    private onBeforeUnloadHandler = () => GameSettings.getInstance().saveIfNeeded()

    root: ReactDOM.Root
    
    constructor() {
        super();
        this.title = "Настройки"
        this.view = new View()
        this.root = ReactDOM.createRoot(this.view.element[0]);
        this.root.render(<MainView controller={this}/>)
    }

    onFocus() {
        super.onFocus();
        window.addEventListener("beforeunload", this.onBeforeUnloadHandler)
    }

    onBlur() {
        super.onBlur();
        window.removeEventListener("beforeunload", this.onBeforeUnloadHandler)
        GameSettings.getInstance().saveIfNeeded()
    }
}
