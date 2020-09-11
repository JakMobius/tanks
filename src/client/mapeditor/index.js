
var BrowserCheckView = require("../utils/browsercheck/browsercheckview")

$(document).ready(function() {
    BrowserCheckView(downloadGameScript)
})

function startGame() {
    var root = $("<div>").addClass("game-root")
    $(document.body).append(root)

    var editor = new MapEditor({
        root: root
    })

    editor.loop.start()
    editor.canvas.focus()

    window.editor = editor
}

function downloadGameScript() {
    var script = document.createElement("script")
    script.src = "./editor.js"
    script.onload = startGame
    document.head.appendChild(script)
}