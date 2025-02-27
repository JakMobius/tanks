import '../web/base-style.scss'
import './browser-link.scss'

import { checkBrowser } from '../utils/browsercheck/browser-check';

function getHeader() {
    return document.querySelector(".loading-header") as HTMLDivElement
}

function getErrorDescription() {
    return document.querySelector(".loading-error-description") as HTMLDivElement
}

function showTryAgainButton() {
    let div = document.querySelector(".loading-error-button-container") as HTMLDivElement
    div.style.display = null
}

function removeLoadingDiv() {
    let div = document.querySelector(".loading-overlay") as HTMLDivElement
    div.parentNode.removeChild(div)
}

function createBrowserLink (name: string, image: string, href: string) {
    var link = document.createElement("a")
    link.classList.add("browser-link")
    link.setAttribute("href", href)

    var img = document.createElement("img")
    img.setAttribute("src", image)
    img.setAttribute("alt", name)

    var p = document.createElement("p")
    p.innerText = name

    link.appendChild(img)
    link.appendChild(p)

    return link
}

function onIncompatibleBrowser() {
    let header = getHeader(), errorDescription = getErrorDescription()
    header.innerText = "Ваш браузер устарел"
    errorDescription.style.display = null
    errorDescription.innerHTML = 
        "И уже не поддерживает всё то, что нужно танчикам для работы. Рекомендуем скачать что-нибудь из этого:"
    
    let browserContainer = document.createElement("div")
    browserContainer.classList.add("browser-link-container")

    browserContainer.appendChild(createBrowserLink(
        "Google Chrome",
        "static/browser/chrome.png",
        "https://www.google.com/chrome/browser/desktop/"
    ))
    browserContainer.appendChild(createBrowserLink(
        "Firefox",
        "static/browser/firefox.png",
        "https://www.mozilla.org/firefox/new"
    ))

    errorDescription.parentNode.appendChild(browserContainer)
}

function onLoadingError() {
    let header = getHeader(), errorDescription = getErrorDescription()
    header.innerText = "Ошибка загрузки"
    errorDescription.style.display = null
    errorDescription.innerHTML = "Не удалось загрузить основной скрипт игры. Попробуйте перезагрузить страницу."
    showTryAgainButton()
}

function onDisabledWebGL() {
    let header = getHeader(), errorDescription = getErrorDescription()
    header.innerText = "WebGL отключен"
    errorDescription.style.display = null
    errorDescription.innerHTML = "Танчики не могут работать без него. Разрешите WebGL в настройках браузера."
    showTryAgainButton()
}

window.addEventListener("load", function() {
    let audit = checkBrowser()
    if(audit === true) {
        downloadGameScript()
        return
    }

    if(audit === "webgl-disabled") {
        onDisabledWebGL()
        return
    }

    onIncompatibleBrowser()
})

function onLoaded() {
    removeLoadingDiv()

    var root = document.createElement("div")
    root.classList.add("game-root")
    document.body.appendChild(root)

    var SceneController = (window as any)['SceneController']
    SceneController.shared.main(root)
}

function downloadGameScript() {
    var script = document.createElement("script")
    script.src = "static/main.js"
    script.onload = onLoaded
    script.onerror = onLoadingError
    document.head.appendChild(script)
}