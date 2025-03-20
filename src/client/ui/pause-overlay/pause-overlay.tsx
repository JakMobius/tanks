import "./pause-overlay.scss"

import React, { useEffect, useRef, useState } from "react";
import { NavigationProvider } from '../navigation/navigation-view';
import NavigationEscapeHandler from "../navigation/navigation-escape-handler";
import { useScene } from "src/client/scenes/scene-controller";
import { ControlsProvider } from "src/client/utils/react-controls-responder";
import RootControlsResponder, { ControlsResponder } from "src/client/controls/root-controls-responder";

export interface PauseOverlayConfig {
    rootComponent: React.ReactNode
}

const PauseOverlay: React.FC<PauseOverlayConfig> = React.memo((props) => {

    const scene = useScene()
    const defaultControls = useRef<ControlsResponder | null>(null)
    const controls = useRef<ControlsResponder | null>(null)

    const [shown, setShown] = useState(false)

    const show = () => setShown(true)
    const hide = () => setShown(false)

    useEffect(() => {
        if(!shown) return undefined
        controls.current?.focus()
        scene.soundEngine.setEnabled(false)
        return () => {
            controls.current?.blur()
            scene.soundEngine.setEnabled(true)
        }
    }, [shown])

    useEffect(() => {
        controls.current.on("blur", hide)
    }, [])

    useEffect(() => {
        defaultControls.current.on("game-pause", (responder: RootControlsResponder) => {
            responder.onUpdate(show)
        })
    }, [])

    return (<>
        <ControlsProvider ref={defaultControls} default></ControlsProvider>
        <ControlsProvider ref={controls}>
            <div className="pause-overlay" style={{display: shown ? undefined : "none"}}>
                <NavigationProvider
                    onClose={hide}
                    rootComponent={props.rootComponent}
                >
                    <NavigationEscapeHandler/>
                </NavigationProvider>
            </div>
        </ControlsProvider>
    </>)
})

export default PauseOverlay