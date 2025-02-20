
import PauseSliderRow from "src/client/ui/pause-overlay/elements/pause-slider-row";
import React, { useCallback, useEffect, useState } from "react";
import GameSettings from "src/client/settings/game-settings";
import { PauseNavigationItem } from "../pause-menu-view";

const SoundView: React.FC = () => {

    let [volume, setVolume] = useState(GameSettings.getInstance().audio.getVolume() * 100)

    const changeHandler = (value: number) => {
        GameSettings.getInstance().audio.setVolume(value / 100)
        setVolume(value)
    }

    const saveSettings = useCallback(() => {
        GameSettings.getInstance().saveIfNeeded()
    }, [])

    useEffect(() => {
        window.addEventListener("beforeunload", saveSettings)

        return () => {
            window.removeEventListener("beforeunload", saveSettings)
            saveSettings()
        }
    }, [])
    
    return (
        <PauseNavigationItem title="Звук">
            <PauseSliderRow title="Громкость" value={volume} min={0} max={100} onChange={changeHandler}></PauseSliderRow>
        </PauseNavigationItem>
    )
}

export default SoundView;