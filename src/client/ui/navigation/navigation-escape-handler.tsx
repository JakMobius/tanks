import { useNavigation } from "./navigation-view"
import React, { useEffect } from "react"
import { useControls } from "src/client/utils/react-controls-responder"

const NavigationEscapeHandler: React.FC = (props) => {

    const navigation = useNavigation()
    const controls = useControls()

    useEffect(() => {
        const onNavigateBack = () => {
            navigation.pop()
        }

        controls.on("navigate-back", onNavigateBack)
        return () => {
            controls.off("navigate-back", onNavigateBack)
        }
    }, [controls, navigation.pop])

    return <></>
}

export default NavigationEscapeHandler