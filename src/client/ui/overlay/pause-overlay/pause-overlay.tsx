import "./pause-overlay.scss"

import RootControlsResponder, {ControlsResponder} from "src/client/controls/root-controls-responder";
import React, { useEffect, useMemo, useState } from "react";
import { NavigationProvider, useNavigation } from '../../navigation/navigation-view';
import NavigationEscapeHandler from "../../navigation/navigation-escape-handler";
import { useScene } from "src/client/scenes/scene-controller";

export interface PauseOverlayConfig {
    rootComponent: React.ReactNode,
    gameControls: ControlsResponder
}

const PauseOverlay: React.FC<PauseOverlayConfig> = (props) => {

    const scene = useScene()

    const [state, setState] = useState({
        pauseControlsResponder: useMemo(() => new ControlsResponder(), []),
        shown: false
    })

    const show = () => {
        RootControlsResponder.getInstance().setMainResponderDelayed(state.pauseControlsResponder)
        setState(state => ({...state, shown: true}))
        scene.soundEngine.setEnabled(false)
    }

    const hide = () => {
        RootControlsResponder.getInstance().setMainResponderDelayed(props.gameControls)
        setState(state => ({...state, shown: false}))
        scene.soundEngine.setEnabled(true)
    }

    useEffect(() => {
        if(!props.gameControls) return undefined
        props.gameControls.on("game-pause", show)
        return () => props.gameControls.off("game-pause", show)
    }, [props.gameControls])

    return (
        <div className="pause-overlay" style={{display: state.shown ? undefined : "none"}}>
            <NavigationProvider
                onClose={hide}
                rootComponent={props.rootComponent}
            >
                <NavigationEscapeHandler controls={state.pauseControlsResponder}/>
            </NavigationProvider>
        </div>
    )
}

export default PauseOverlay