import "./pause-overlay.scss"

import React, { useEffect, useRef, useState } from "react";
import { NavigationProvider } from '../navigation/navigation-view';
import NavigationEscapeHandler from "../navigation/navigation-escape-handler";
import { useScene } from "src/client/scenes/scene-controller";
import { ControlsProvider, useControls } from "src/client/utils/react-controls-responder";
import RootControlsResponder, { ControlsResponder } from "src/client/controls/root-controls-responder";

export interface PauseOverlayConfig {
    rootComponent: React.ReactNode
}

const PauseOverlay: React.FC<PauseOverlayConfig> = React.memo((props) => {

    const scene = useScene()
    const gameControls = useControls()
    const controlsProvider = useRef<ControlsResponder | null>(null)

    const [shown, setShown] = useState(false)

    const show = () => {
        setShown(true)
        controlsProvider.current.focus()
        scene.soundEngine.setEnabled(false)
    }

    const hide = () => {
        setShown(false)
        controlsProvider.current.blur()
        scene.soundEngine.setEnabled(true)
    }

    useEffect(() => {
        controlsProvider.current.on("blur", hide)
    }, [])

    useEffect(() => {
        let callback = (responder: RootControlsResponder) => {
            responder.onUpdate(show)
        }
        if(!gameControls) return undefined
        gameControls.on("game-pause", callback)
        return () => gameControls.off("game-pause", callback)
    }, [gameControls])

    return (
        <ControlsProvider ref={controlsProvider}>
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