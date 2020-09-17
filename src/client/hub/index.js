
const Overlay = require("../ui/overlay.js")
const View = require("../ui/view")
const Dropdown = require("../ui/elements/dropdown/dropdown")

window.addEventListener("load", function() {

    const body = $("body")

    const view = new View()

    view.element
        .css("position", "unset")
        .css("width", "200px")

    view.element.addClass("menu expanded")

    body.append($("<p>").text("Это страница хаба. Ей срочно нужен дизайн."))
    body.append($("<p>").text("Внизу dropdown-меню, чтобы проверить, что система сборки подшивает нужные scss-файлы"))

    body.append(view.element)

    const dropdown = new Dropdown()

    dropdown.setOptionCount(4)

    dropdown.getOptions().each((index, option) => {
        $(option).text("Элемент номер " + index);
    })

    // dropdown.on("expand", () => view.element.addClass("expanded"))
    //
    // dropdown.on("collapse", () => view.element.removeClass("expanded"))

    view.element.append(dropdown.element)
})