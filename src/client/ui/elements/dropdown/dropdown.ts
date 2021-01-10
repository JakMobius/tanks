
/* @load-resource: './dropdown.scss' */

import View from '../../view';

class Dropdown extends View {
	public collapsed: any;
	public prototypeCell: any;

    constructor() {
        super();

        this.element.addClass("dropdown")

        this.element.on("click", (e) => {
            e.preventDefault()
            e.stopPropagation()

            this.toggle()
            if(!this.collapsed) return

            let wrapper = $(e.target).closest(".select-wrapper")
            if(!wrapper.length) return

            this.selectOption(wrapper)
        })

        $(document.body).click(() => this.collapse())

        this.prototypeCell = $("<div>").addClass("select-wrapper")

        this.collapsed = true
    }

    collapse() {
        if(this.collapsed) return

        this.collapsed = true
        this.element.removeClass("expanded")
        this.emit("collapse")
    }

    expand() {
        if(!this.collapsed) return

        this.collapsed = false
        this.element.addClass("expanded")
        this.emit("expand")
    }

    toggle() {
        this.collapsed ? this.expand() : this.collapse()
    }

    setOptionCount(count: number) {
        let children = this.getOptions()
        if(children.length > count) {
            while(children.length > count) {
                children.last().remove()
            }
        } else if(children.length < count) {
            while(children.length < count) {
                this.element.append(this.prototypeCell.clone())
                count--
            }
        }
    }

    getOptions(): JQuery {
        return this.element.children()
    }

    selectOption(option: JQuery) {
        this.element.find(".select-wrapper.selected").removeClass("selected")
        if(option) {
            option.addClass("selected")
            this.element.addClass("selected")
        } else {
            this.element.removeClass("selected")
        }
        this.emit("select", option)
    }
}

export default Dropdown;