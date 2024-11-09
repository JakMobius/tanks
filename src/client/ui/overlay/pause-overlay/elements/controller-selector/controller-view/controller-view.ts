/* @load-resource: ./controller-view.scss */

import View from "src/client/ui/view";
import InputDevice, {InputDeviceType} from "src/client/controls/input/input-device";

export default class ControllerView extends View {

    name: JQuery
    icon: JQuery
    subtitle: JQuery
    device: InputDevice

    constructor() {
        super();

        this.name = $("<div>").addClass("controller-name")
        this.icon = $("<div>").addClass("controller-icon")
        this.subtitle = $("<div>").addClass("controller-subtitle")

        this.element.addClass("controller-view")

        this.element.append(this.name)
        this.element.append(this.icon)
        this.element.append(this.subtitle)

        this.element.on("click", () => {
            this.emit("click")
        })
    }

    setSelected(selected: boolean) {
        if(selected) {
            this.element.addClass("selected")
        } else {
            this.element.removeClass("selected")
        }
    }

    private static getPrintedDeviceName(device: InputDevice) {
        switch(device.getType()) {
            case InputDeviceType.keyboard: return "Клавиатура"
            case InputDeviceType.mouse:    return "Мышь"
            case InputDeviceType.gamepad:  return "Геймпад"
        }
    }

    private static getDeviceIcon(device: InputDevice) {
        switch(device.getType()) {
            case InputDeviceType.keyboard: return "keyboard.png"
            case InputDeviceType.mouse:    return "mouse.png"
            case InputDeviceType.gamepad:  return "gamepad.png"
        }
    }

    setDevice(device: InputDevice) {
        this.device = device
        this.setName(ControllerView.getPrintedDeviceName(device))
        this.setIcon(ControllerView.getDeviceIcon(device))
        this.setSubtitle("Игрок 1")
        return this
    }

    setName(name: string) {
        this.name.text(name)
        return this
    }

    setIcon(icon: string) {
        this.icon.css("background-image", `url(assets/game/controllers/${icon})`)
        return this
    }

    setSubtitle(subtitle: string) {
        this.subtitle.text(subtitle)
        return this
    }
}