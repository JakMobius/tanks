import '../web/base-style.scss'

import BrowserCheckView from '../utils/browsercheck/browser-check-view';

window.addEventListener("load", function() {
    BrowserCheckView(downloadGameScript)
})

function launchGame() {
    var root = document.createElement("div")
    root.classList.add("game-root")
    document.body.appendChild(root)

    var SceneController = (window as any)['SceneController']
    SceneController.shared.main(root)
}

function downloadGameScript() {
    var script = document.createElement("script")
    script.src = "static/main.js"
    script.onload = launchGame
    document.head.appendChild(script)
}