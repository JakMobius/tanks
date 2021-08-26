/* @load-resource: '../web/base-style.scss' */

import BrowserCheckView from '../utils/browsercheck/browser-check-view';

window.addEventListener("load", function() {
    BrowserCheckView(downloadGameScript)
})

function startGame() {
    var root = $("<div>").addClass("game-root")
    $(document.body).append(root)

    const MapEditor = (window as any)["MapEditor"]

    // @ts-ignore
    var editor = new MapEditor({
        root: root
    })

    editor.loop.start()
    editor.canvas.focus();

    (window as any).editor = editor
}

function downloadGameScript() {
    var script = document.createElement("script")
    script.src = "scripts/map-editor.js"
    script.onload = startGame
    document.head.appendChild(script)
}