/* @load-resource: '../web/base-style.scss' */

import BrowserCheckView from '../utils/browsercheck/browsercheckview';

window.addEventListener("load", function() {
    BrowserCheckView(downloadGameScript)
})

function startGame() {
    var root = $("<div>").addClass("game-root")
    $(document.body).append(root)

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