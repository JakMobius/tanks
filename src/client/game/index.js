
var BrowserCheckView = require("../utils/browsercheck/browsercheckview")

window.addEventListener("load", function() {
    BrowserCheckView(downloadGameScript)
})

function startGame() {
    var root = $("<div>").addClass("game-root")
    $(document.body).append(root)
    var game = new Game({
        scale: window.devicePixelRatio,
        ip: "ws://" + window.location.host + ":25565",
        root: root
    })

    game.loop.start()
    game.canvas.focus()

    window.game = game
}

function downloadGameScript() {
    var script = document.createElement("script")
    script.src = "./game.js"
    script.onload = startGame
    document.head.appendChild(script)
}