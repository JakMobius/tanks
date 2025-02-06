import './browser-check.scss'

import BrowserCheck from './browser-check';

function browserLink (footer: JQuery, name: string, image: string, href: string): void {
    footer.append(
        $("<a>").addClass("supported-browser").append(
            $("<img>")
                .attr("src", image)
                .attr("alt", name),
            $("<p>").text(name)
        ).attr("href", href)
    )
}

export default function(callback: () => void){

    /**
     * Chrome 8
     * PhysicsEdge 12
     * IE 11
     * Firefox 4
     * Safari 5.1
     * Opera 12.1
     * iOS Safari 8
     * Android Browser 81
     * Opera Mobile 12
     * Chrome for Android 81
     * Firefox for Android 68
     * UC Browser for Android 12.12
     * Samsung Internet 4
     * QQ Browser 10.4
     * Baidu Browser 7.12
     * KaiOS Browser 2.5
     */

    var webGl = BrowserCheck.WebGLAvailablilty()

    if(webGl == "available") {
        callback()
    } else {
        var container = $("<div>").addClass("unsupported-browser")
        var header = $("<h1>").addClass("header")
        var text = $("<div>").addClass("text")
        var footer = $("<div>").addClass("footer")

        if(webGl == "disabled") {
            header.text("В Вашем браузере отключен WebGL")
            text.append(
                $("<p>").text("Необходимо разрешить использование WebGL в настройках " +
                    "вашего браузера, прежде чем страница сможет быть загружена")
            )
        } else if(webGl == "unavailable") {
            header.text("Ваш браузер устарел")
            text.append(
                $("<p>").text("Страница не может быть загружена, поскольку ваш браузер " +
                    "не поддерживает WebGL. Для быстрой и стабильной работы страницы рекомендуем " +
                    "скачать последнюю версию одного из этих браузеров:")
            )

            browserLink(
                footer,
                "Google Chrome",
                "static/browser/chrome.png",
                "https://www.google.com/chrome/browser/desktop/"
            )
            browserLink(
                footer,
                "Firefox",
                "static/browser/firefox.png",
                "https://www.mozilla.org/firefox/new"
            )
        }
        container.append(header, text, footer)
        $(document.body).append(container)
    }
};