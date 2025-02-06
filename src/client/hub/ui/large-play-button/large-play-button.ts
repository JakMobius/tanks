import './large-play-button.scss'

import View from "src/client/ui/view";

export default class LargePlayButton extends View {

    upperText = $("<div>").addClass("upper-text").text("В БОЙ!")
    lowerText = $("<div>").addClass("lower-text").text("Случайная игра")

    constructor() {
        super();
        this.element.addClass("large-play-button")
        this.element.append(this.upperText, this.lowerText)
    }

}