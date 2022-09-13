/* @load-resource: '../web/base-style.scss' */

import BrowserCheckView from '../utils/browsercheck/browser-check-view';

window.addEventListener("load", function() {
    BrowserCheckView(downloadGameScript)
})

function startGame() {
    var root = $("<div>").addClass("game-root")
    $(document.body).append(root)

    let url = new URL(location.href)
    let room = url.searchParams.get("room")

    var Game = (window as any)['Game']
    var game = new Game({
        scale: window.devicePixelRatio,
        ip: "ws://" + window.location.host + "/game-socket",
        room: room,
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