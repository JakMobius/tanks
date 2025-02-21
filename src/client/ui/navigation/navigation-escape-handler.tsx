import { ControlsResponder } from "src/client/controls/root-controls-responder"
import { useNavigation } from "./navigation-view"
import React, { useEffect } from "react"

export interface NavigationEscapeHandlerProps {
    controls: ControlsResponder
}

const NavigationEscapeHandler: React.FC<NavigationEscapeHandlerProps> = (props) => {

    const navigation = useNavigation()

    useEffect(() => {
        const onNavigateBack = () => {
            navigation.pop()
        }

        props.controls.on("navigate-back", onNavigateBack)
        return () => {
            props.controls.off("navigate-back", onNavigateBack)
        }
    }, [props.controls, navigation.pop])

    return <></>
}

export default NavigationEscapeHandler