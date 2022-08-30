/* @load-resource: './huge-select.scss' */

import HugeInput from "../huge-input/huge-input";

export interface SelectOption {
    name: string
    data?: string
    selected?: boolean
    defaultSelected?: boolean
}

export default class HugeSelect extends HugeInput {

    select = $("<select>").addClass("huge-input huge-select")

    constructor() {
        super();
        this.element.append(this.select)
    }

    setOptions(options: SelectOption[]) {
        this.select.empty()
        let frag = document.createDocumentFragment()

        for(let optionConfig of options) {
            let option = document.createElement('option')
            frag.appendChild(option);

            option.value = optionConfig.data
            option.text = optionConfig.name
            option.selected = optionConfig.selected
            option.defaultSelected = optionConfig.defaultSelected
        }

        this.select.append(frag);
    }
}