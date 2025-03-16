import { useNavigation } from "./navigation-view"
import React, { useEffect } from "react"
import RootControlsResponder from "src/client/controls/root-controls-responder"
import { useControls } from "src/client/utils/react-controls-responder"

const NavigationEscapeHandler: React.FC = (props) => {

    const navigation = useNavigation()
    const controls = useControls()

    useEffect(() => {
        const onNavigateBack = (responder: RootControlsResponder) => {
            responder.onUpdate(() => navigation.pop())
        }

        controls.on("navigate-back", onNavigateBack)
        return () => {
            controls.off("navigate-back", onNavigateBack)
        }
    }, [controls, navigation.pop])

    return <></>
}

export default NavigationEscapeHandler