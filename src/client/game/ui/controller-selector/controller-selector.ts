/* @load-resource: ./controller-selector.scss */

import View from "../../../ui/view";
import ControllerView from "./controller-view/controller-view";

export default class ControllerSelector extends View {
    constructor() {
        super();

        this.element.append(new ControllerView()
            .setName("Клавиатура")
            .setIcon("keyboard.png")
            .setSubtitle("Игрок 1").element)

        this.element.append(new ControllerView()
            .setName("Мышь")
            .setIcon("mouse.png")
            .setSubtitle("Игрок 2").element)

        this.element.append(new ControllerView()
            .setName("Геймпад")
            .setIcon("gamepad.png")
            .setSubtitle("Игрок 3").element)

        this.element.addClass("controller-selector")
    }
}