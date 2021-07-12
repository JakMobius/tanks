/* @load-resource: './block-select.scss' */


import BlockState from 'src/utils/map/blockstate/blockstate';
import Menu from "../../../../../ui/menu/menu";

export default class BlockSelectMenu extends Menu {
	public list: JQuery;

    constructor() {
        super();

        this.element.addClass("editor-block-select-menu")

        this.element.append($("<div>").addClass("title").text("Выбор блока"))
        this.list = $("<div>").addClass("block-list")
        this.element.append(this.list)

        for(let [id, Block] of BlockState.Types) {
            if(id === 0) continue

            let name = Block.typeName

            this.list.append($("<div>")
                .addClass("block-button")
                .css("background-image", "url(assets/img/blocks/" + name + ".png)")
                .on("click", { id: id, name: name }, (event) => {
                    const Block = BlockState.getBlockStateClass(event.data.id)
                    const block = new Block()
                    this.emit("select", block)
                })
            )
        }
    }
}