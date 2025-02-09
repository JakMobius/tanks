import './controller-selector.scss'

import RootControlsResponder from "src/client/controls/root-controls-responder";
import { useEffect, useState } from 'react';
import React from 'react';
import ControllerView from './controller-view/controller-view';

interface ControllerSelectorProps {
    value: number
    onChange: (value: number) => void
}

const ControllerSelector: React.FC<ControllerSelectorProps> = (props) => {
    
    const [devices, setDevices] = useState([...RootControlsResponder.getInstance().devices])
    const [selectedIndex, setSelectedIndex] = useState(props.value)

    const updateDevices = () => {
        setDevices([...RootControlsResponder.getInstance().devices])
    }

    useEffect(() => {
        RootControlsResponder.getInstance().on("device-connect", updateDevices)
        RootControlsResponder.getInstance().on("device-disconnect", updateDevices)

        return () => {
            RootControlsResponder.getInstance().off("device-connect", updateDevices)
            RootControlsResponder.getInstance().off("device-disconnect", updateDevices)
        }
    }, [])

    const handleSelect = (index: number) => () => {
        props.onChange(index)
        setSelectedIndex(index)
    }

    return (
        <div className="controller-selector">
            {devices.map((device, i) => {
                return <ControllerView device={device} onSelect={handleSelect(i)} selected={selectedIndex === i}/>
            })}
        </div>
    )
}

export default ControllerSelector;