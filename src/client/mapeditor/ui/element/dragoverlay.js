/* @load-resource: './drag-overlay.scss' */

const DocumentEventHandler = require("../../../controls/interact/documenteventhandler")

class DragOverlay extends DocumentEventHandler {

    constructor(root) {
        super();

        this.root = root
        this.element = $("<div>").addClass("drag-overlay")
        this.target = [this.root[0], this.element[0]]
        this.hovered = false
    }

    startListening() {
        this.bind("dragenter", this.dragEnter)
        this.bind("dragover", this.dragOver)
        this.bind("dragleave", this.dragLeave)
        this.bind("drop", this.drop)
    }

    dragEnter(event) {
        event.preventDefault()
        if(!this.hovered) {
            this.element.addClass("visible")
            this.hovered = true
        }
    }

    dragOver(event) {
        event.preventDefault()
    }

    dragLeave(event) {
        event.preventDefault()

        if(this.hovered && event.target && $(event.target).closest(".drag-overlay")[0]) {
            this.element.removeClass("visible")
            this.hovered = false
        }
    }

    drop(event) {
        event.preventDefault()

        if(this.hovered) {
            this.element.removeClass("visible")
            let files = event.dataTransfer.files
            let length = files.length

            while(length--) {
                (function(i, self) {
                    let file = event.dataTransfer.files.item(i)

                    let fileReader = new FileReader();
                    fileReader.onload = function (event) {
                        self.emit("file", {
                            buffer: event.target.result,
                            name: file.name
                        })
                    };
                    fileReader.readAsArrayBuffer(file);
                })(length, this)
            }
            this.hovered = false
        }
    }

}

module.exports = DragOverlay