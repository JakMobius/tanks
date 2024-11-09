/* @load-resource: './loading-view.scss' */

import View from "src/client/ui/view";
import {LoadingErrorAction} from "src/client/scenes/loading/loading-error";

export default class LoadingView extends View {

    image = $("<div>").addClass("tank-image")
    header = $("<div>").addClass("loading-header")
    scale = $("<div>").addClass("loading-scale")
    scaleFill = $("<div>").addClass("scale-fill")

    errorDescription = $("<div>").addClass("loading-error-description")
    errorButtonContainer = $("<div>").addClass("loading-error-button-container")
    errorButtons: JQuery<HTMLElement>[] = []

    constructor() {
        super();
        this.element.addClass("loading-view")

        this.scale.append(this.scaleFill)

        this.element.append(this.image)
        this.element.append(this.header)
        this.element.append(this.scale)
        this.element.append(this.errorDescription)
        this.element.append(this.errorButtonContainer)

        this.setDefaultHeader()
    }

    setLoadingFraction(fraction: number) {
        this.scaleFill.css("width", (fraction * 100).toFixed(2) + "%")
    }

    setHeader(header: string) {
        this.header.text(header)
    }

    setDefaultHeader() {
        this.header.text("Пожалуйста, подождите...")
    }

    setErrorDescription(description: string) {
        this.errorDescription.text(description)
    }

    setErrorActions(buttons: LoadingErrorAction[]) {
        this.errorButtons = []

        for(let buttonConfig of buttons) {
            let button = $("<div>")
                .addClass("loading-error-button")
                .addClass(buttonConfig.style)
                .text(buttonConfig.title)
                .on("click", buttonConfig.callback)
            this.errorButtons.push(button)
        }

        this.errorButtonContainer.empty()
        this.errorButtonContainer.append(...this.errorButtons)
    }

    setScaleVisible(visible: boolean) {
        this.scale.css("display", visible ? "" : "none")
    }

    setErrorVisible(visible: boolean) {
        let display = visible ? "" : "none"
        this.errorButtonContainer.css("display", display)
        this.errorDescription.css("display", display)
    }
}