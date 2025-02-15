import { ControlsResponder } from "src/client/controls/root-controls-responder"
import { useNavigation } from "./navigation-view"
import React, { useEffect } from "react"

export interface NavigationEscapeHandlerProps {
    controls: ControlsResponder
}

const NavigationEscapeHandler: React.FC<NavigationEscapeHandlerProps> = (props) => {

    const navigation = useNavigation()
    const onNavigateBack = () => navigation.pop()

    useEffect(() => {
        props.controls.on("navigate-back", onNavigateBack)
        return () => {
            props.controls.off("navigate-back", onNavigateBack)
        }
    }, [props.controls, onNavigateBack])

    return <></>
}

export default NavigationEscapeHandler