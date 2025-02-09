import PauseViewController from "src/client/ui/overlay/pause-overlay/controllers/pause-view-controller";
import PauseSliderRow from "src/client/ui/overlay/pause-overlay/elements/pause-slider-row";
import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import View from "src/client/ui/view";
import GameSettings from "src/client/settings/game-settings";
import { PauseMenuView } from "../pause-menu-view";

interface MainViewProps {
    controller: PauseViewController
}

const SoundView: React.FC<MainViewProps> = (props) => {

    let [volume, setVolume] = useState(GameSettings.getInstance().audio.getVolume() * 100)

    const changeHandler = (value: number) => {
        GameSettings.getInstance().audio.setVolume(value / 100)
        setVolume(value)
    }
    
    return <PauseMenuView>
        <PauseSliderRow title="Громкость" value={volume} min={0} max={100} onChange={changeHandler}></PauseSliderRow>
    </PauseMenuView>
}

export default class SettingsController extends PauseViewController {
    root: ReactDOM.Root
    
    constructor() {
        super();
        this.title = "Звук"
        this.view = new View()
        this.root = ReactDOM.createRoot(this.view.element[0]);
        this.root.render(<SoundView controller={this}/>)
    }
}
