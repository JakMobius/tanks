
import View from 'src/client/ui/view';
import {Stat} from "./tank-preview-container";

class StatScale extends View {
	public statScale: JQuery;
	public value: JQuery;
	public title: JQuery;
	public stat: Stat;

    constructor() {
        super();

        this.element.addClass("stat")
        this.statScale = $("<div>").addClass("stat-scale")
        this.value = $("<div>").addClass("stat-value")
        this.title = $("<div>").addClass("stat-title")

        this.element.append(this.statScale)
        this.element.append(this.value)
        this.element.append(this.title)

        this.stat = null
    }

    setStat(stat: Stat) {
        this.stat = stat
        this.statScale.css("background", stat.color)
        this.value.css("color", stat.color)
        this.title.text(stat.name)
    }

    setValue(value: number) {
        if (value) {
            this.element.css("opacity", "")
            let fraction = this.stat.func(value, this.stat.maximum);

            const size = 165 + fraction * 150;

            this.statScale.css("width", size + "px")
            this.value.css("left", size + 10 + "px")
            this.value.text(value)
        } else {
            this.element.css("opacity", "0.5")
            this.statScale.css("width", "165px")
            this.value.css("left", "165px")
            this.value.text("")
        }
    }
}

export default StatScale;