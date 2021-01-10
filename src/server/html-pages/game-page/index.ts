/* @load-resource: '../style.css' */

import BrowserCheckView from '../../../client/utils/browsercheck/browsercheckview';

window.addEventListener("load", function() {
    BrowserCheckView(downloadGameScript)
})

function startGame() {
    var root = $("<div>").addClass("game-root")
    $(document.body).append(root)
    var Game = (window as any)['Game']
    var game = new Game({
        scale: window.devicePixelRatio,
        ip: "ws://" + window.location.host + "/game-socket",
        root: root
    })

    game.loop.start();
    game.canvas.focus();

    (window as any)["game"] = game
}

function downloadGameScript() {
    var script = document.createElement("script")
    script.src = "scripts/game.js"
    script.onload = startGame
    document.head.appendChild(script)
}