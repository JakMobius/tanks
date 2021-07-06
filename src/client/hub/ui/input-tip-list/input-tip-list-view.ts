/* @load-resource: 'input-tip-list-view.scss' */

import View from "../../../ui/view";

export enum TipStyle {
    FINE = "fine",
    WEAK_WARNING = "weak-warning",
    WARNING = "warning",
    ERROR = "error"
}

export interface Tip {
    style: TipStyle;
    text: string
}

export default class InputTipList extends View {

    currentTipList: Tip[] = []

    constructor() {
        super();
        this.element.addClass("tip-list")
    }

    setTips(tipList: Tip[]) {
        if(!this.shouldUpdateTips(tipList)) return;

        this.element.html("")
        this.currentTipList = tipList;
        let tips = tipList.map(tip => this.createTipView(tip))
        this.element.append(tips)
    }

    private createTipView(tip: Tip): JQuery {
        return $("<span>").addClass("tip").addClass(tip.style).text(tip.text)
    }

    private shouldUpdateTips(tipList: Tip[]) {
        if(tipList.length != this.currentTipList.length) return true
        for(let i = 0; i < this.currentTipList.length; i++) {
            if(tipList[i].style != this.currentTipList[i].style || tipList[i].text != this.currentTipList[i].text) {
                return true;
            }
        }
        return false;
    }
}