/* @load-resource: '../html/style.css' */

import Menu from '../../../client/ui/menu/menu';

import Dropdown from '../../../client/ui/elements/dropdown/dropdown';

window.addEventListener("load", function() {

    const body = $("body")

    body.css("padding", "20px")

    const view = new Menu()

    view.element
        .css("position", "unset")
        .css("width", "200px")

    view.element.addClass("expanded")

    body.append($("<p>").text("Это страница хаба. Ей срочно нужен дизайн."))
    body.append($("<p>").text("Внизу менюшка, чтобы проверить, что система сборки подшивает нужные файлы"))

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

    body.append($("<p>").text("p.s. Арсений, пожалуйста, сделай меня, мне очень грустно"))
    body.append($("<p>").text("       плак плак"))
    body.append($("<p>").text("         💧  💧"))
})