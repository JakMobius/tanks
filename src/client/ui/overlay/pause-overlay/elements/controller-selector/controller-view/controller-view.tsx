import './controller-view.scss'
import InputDevice, {InputDeviceType} from "src/client/controls/input/input-device";
import React from 'react';


const getPrintedDeviceName = (device: InputDevice) => {
    switch(device.getType()) {
        case InputDeviceType.keyboard: return "Клавиатура"
        case InputDeviceType.mouse:    return "Мышь"
        case InputDeviceType.gamepad:  return "Геймпад"
    }
}

const getDeviceIcon = (device: InputDevice) => {
    switch(device.getType()) {
        case InputDeviceType.keyboard: return "keyboard.png"
        case InputDeviceType.mouse:    return "mouse.png"
        case InputDeviceType.gamepad:  return "gamepad.png"
    }
}

interface ControllerViewProps {
    selected?: boolean
    onSelect?: () => void
    device?: InputDevice
}

const ControllerView: React.FC<ControllerViewProps> = (props) => {
    return (
        <div className={"controller-view" + (props.selected ? " selected" : "")} onClick={props.onSelect}>
            <div className="controller-name">{getPrintedDeviceName(props.device)}</div>
            <div className="controller-icon" style={{
                backgroundImage: `url(static/game/controllers/${getDeviceIcon(props.device)})`
            }}></div>
            <div className="controller-subtitle">{"Игрок 1"}</div>
        </div>
    )
}

export default ControllerView;