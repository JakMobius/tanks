/* @load-resource: './controls.scss' */

const View = require("../../../../../ui/view")

class ControlsContainer extends View {
    constructor(options) {
        super(options);

        this.element.addClass("menu tip")

        let header = $("<div>").addClass("header").text("Управление")

        this.checkbox = $("<input>").prop("type", "checkbox")
        this.button = $("<button>").text("ИГРАТЬ")

        this.element
            .append(header)
            .append(this.line().height("120px")
                .append(this.steeringTable("wasd"))
                .append(" или ")
                .append(this.steeringTable("↑←↓→"))
                .append(" для управления")
            ).append(this.line()
                .append(this.key("ПРОБЕЛ").css("padding", "0 40px"))
                .append(" — выстрел")
                .append(this.key("Q").css("margin-left", "25px"))
                .append(" — мина")
                .append(this.key("R").css("margin-left", "25px"))
                .append(" — респавн")
            ).append(this.line()
                .append(this.key("ВВОД").css("padding", "0 25px"))
                .append(" — чат")
            )
            .append($("<div>").addClass("wish").text("Желаем приятной игры!"))
            .append($("<div>").addClass("checkbox")
                .append(this.checkbox)
                .append("не показывать больше")
            )
            .append(this.button)

        this.button.on("click", () => {
            this.emit("confirm", this.checkbox.checked)
        })
    }

    line() { return $("<div>").addClass("line") }
    key(button) { return $("<div>").addClass("key").text(button) }

    steeringTable(buttons) {
        let table = $("<table>")
        let tbody = $("<tbody>")
        let button = 0

        for(let line = 0; line < 2; line++) {
            let tr = $("<tr>")
            for(let key = 0; key < 3; key++) {
                let td = $("<td>")
                tr.append(td)

                if(line === 0) {
                    if(key === 0 || key === 2) continue
                }

                td.append(this.key(buttons[button++]))
            }
            tbody.append(tr)
        }

        return table.append(tbody)
    }
}

module.exports = ControlsContainer