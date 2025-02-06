import './tank-stat-row.scss'

import View from "src/client/ui/view";

export default class TankStatRow extends View {

    private label = $("<div>").addClass("tank-stat-label")
    private value = $("<div>").addClass("tank-stat-value")
    private scale = $("<div>").addClass("tank-stat-scale")
    private scaleBar = $("<div>").addClass("tank-stat-scale-bar")
    private medianStatValue = 10

    constructor() {
        super();
        this.element.addClass("tank-stat-row");
        this.element.append(this.label);
        this.element.append(this.scale);
        this.scale.append(this.scaleBar);
        this.element.append(this.value);
    }

    setMedianStatValue(value: number) {
        this.medianStatValue = value
        return this
    }

    setLabel(label: string) {
        this.label.text(label)
        return this
    }

    formatNumber(number: number) {
        if(number < 0.01) return 0
        if(number < 0.1) return number.toFixed(2)
        if(number < 100) return number.toPrecision(2)
        return Math.round(number).toString()
    }

    setValue(value: number) {
        this.value.text(this.formatNumber(value))
        this.setBarWidth(this.valueToWidth(value))
    }

    valueToWidth(value: number) {
        return value / (value + this.medianStatValue)
    }

    setBarWidth(width: number) {
        this.scaleBar.css("width", (width * 100) + "%")
    }
}