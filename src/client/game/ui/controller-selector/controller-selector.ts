/* @load-resource: ./controller-selector.scss */

import View from "../../../ui/view";
import ControllerView from "./controller-view/controller-view";
import InputDevice, {InputDeviceType} from "../../../controls/input/input-device";
import ControlsManager from "../../../controls/controls-manager";
import BasicEventHandlerSet from "../../../../utils/basic-event-handler-set";

export default class ControllerSelector extends View {
    deviceViews: ControllerView[] = []
    selectedIndex = -1
    eventHandler = new BasicEventHandlerSet()

    constructor() {
        super()

        this.eventHandler.on("device-connect", () => this.updateDevices())
        this.eventHandler.on("device-disconnect", () => this.updateDevices())

        this.updateDevices()

        this.element.addClass("controller-selector")
    }

    private addDevice(device: InputDevice) {
        const controller = new ControllerView().setDevice(device)

        let index = this.deviceViews.length
        controller.on("click", () => {
            this.selectController(index)
        })

        this.deviceViews.push(controller)
        this.element.append(controller.element)
    }

    private clearDevices() {
        this.element.empty()
        this.deviceViews = []
    }

    private selectController(index: number) {
        if(this.selectedIndex >= 0) {
            this.deviceViews[this.selectedIndex].setSelected(false)
        }
        this.selectedIndex = index
        if(this.selectedIndex >= 0) {
            this.deviceViews[this.selectedIndex].setSelected(true)
            this.emit("select", ControlsManager.getInstance().devices[this.selectedIndex])
        }
    }

    private updateDevices() {

        let selectedDevice = null
        if(this.selectedIndex >= 0) {
            selectedDevice = this.deviceViews[this.selectedIndex].device
        }
        this.selectController(-1)

        this.clearDevices()

        for(let device of ControlsManager.getInstance().devices) {
            this.addDevice(device)
        }

        let index = ControlsManager.getInstance().devices.indexOf(selectedDevice)
        if(index === -1) {
            this.selectController(0)
        } else {
            this.selectController(index)
        }
    }

    startListening() {
        this.eventHandler.setTarget(ControlsManager.getInstance())
    }

    stopListening() {
        this.eventHandler.setTarget(null)
    }
}