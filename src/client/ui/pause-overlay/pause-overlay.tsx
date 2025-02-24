import "./pause-overlay.scss"

import React, { useEffect, useState } from "react";
import { NavigationProvider } from '../navigation/navigation-view';
import NavigationEscapeHandler from "../navigation/navigation-escape-handler";
import { useScene } from "src/client/scenes/scene-controller";
import { ControlsProvider, useControls } from "src/client/utils/react-controls-responder";

export interface PauseOverlayConfig {
    rootComponent: React.ReactNode
}

const PauseOverlay: React.FC<PauseOverlayConfig> = React.memo((props) => {

    const scene = useScene()
    const gameControls = useControls()

    const [shown, setShown] = useState(false)

    const show = () => {
        setShown(true)
        scene.soundEngine.setEnabled(false)
    }

    const hide = () => {
        setShown(false)
        scene.soundEngine.setEnabled(true)
    }

    useEffect(() => {
        if(!gameControls) return undefined
        gameControls.on("game-pause", show)
        return () => gameControls.off("game-pause", show)
    }, [gameControls])

    return (
        <ControlsProvider enabled={shown}>
            <div className="pause-overlay" style={{display: shown ? undefined : "none"}}>
                <NavigationProvider
                    onClose={hide}
                    rootComponent={props.rootComponent}
                >
                    <NavigationEscapeHandler/>
                </NavigationProvider>
            </div>
        </ControlsProvider>
    )
})

export default PauseOverlay