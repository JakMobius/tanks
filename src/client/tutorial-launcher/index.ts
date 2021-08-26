/* @load-resource: '../web/base-style.scss' */

import BrowserCheckView from '../utils/browsercheck/browser-check-view';

window.addEventListener("load", function() {
    BrowserCheckView(downloadGameScript)
})

function startGame() {
    var root = $("<div>").addClass("game-root")
    $(document.body).append(root)
    var Tutorial = (window as any)['Tutorial']
    var tutorial = new Tutorial({
        scale: window.devicePixelRatio,
        root: root,
        userData: (window as any)['userData']
    })

    tutorial.loop.start();
    tutorial.canvas.focus();

    (window as any)["tutorial"] = tutorial
}

function downloadGameScript() {
    var script = document.createElement("script")
    script.src = "scripts/tutorial.js"
    script.onload = startGame
    document.head.appendChild(script)
}