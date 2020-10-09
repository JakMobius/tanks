(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var BrowserCheckView = require(3);

window.addEventListener("load", function () {
  BrowserCheckView(downloadGameScript);
});

function startGame() {
  var root = $("<div>").addClass("game-root");
  $(document.body).append(root);
  var game = new Game({
    scale: window.devicePixelRatio,
    ip: "ws://" + window.location.host,
    root: root
  });
  game.loop.start();
  game.canvas.focus();
  window.game = game;
}

function downloadGameScript() {
  var script = document.createElement("script");
  script.src = "scripts/game.js";
  script.onload = startGame;
  document.head.appendChild(script);
}
},{}],2:[function(require,module,exports){
module.exports = {
  WebGLAvailablilty: function () {
    if (window.WebGLRenderingContext) {
      var canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      var gl;

      try {
        gl = canvas.getContext("webgl");
      } catch (x) {
        gl = null;
      }

      if (gl == null) {
        try {
          gl = canvas.getContext("experimental-webgl");
        } catch (x) {
          gl = null;
        }
      }

      if (gl) {
        return "available";
      } else {
        return "disabled";
      }
    } else {
      return "unavailable";
    }
  }
};
},{}],3:[function(require,module,exports){
var BrowserCheck = require(2);

module.exports = function (callback) {
  /**
   * Chrome 8
   * Edge 12
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
  var webGl = BrowserCheck.WebGLAvailablilty();

  if (webGl == "available") {
    callback();
  } else {
    var container = $("<div>").addClass("unsupported-browser");
    var header = $("<h1>").addClass("header");
    var text = $("<div>").addClass("text");
    var footer = $("<div>").addClass("footer");

    if (webGl == "disabled") {
      header.text("В Вашем браузере отключен WebGL");
      text.append($("<p>").text("Необходимо разрешить использование WebGL в настройках " + "вашего браузера, прежде чем страница сможет быть загружена"));
      return;
    }

    if (webGl == "unavailable") {
      header.text("Ваш браузер устарел");
      text.append($("<p>").text("Страница не может быть загружена, поскольку ваш браузер " + "не поддерживает WebGL. Для быстрой и стабильной работы страницы рекомендуем " + "скачать последнюю версию одного из этих браузеров:"));

      function browserLink(name, image, href) {
        footer.append($("<a>").addClass("supported-browser").append($("<img>").attr("src", image).attr("alt", name), $("<p>").text(name)).attr("href", href));
      }

      browserLink("Google Chrome", "../assets/browser/chrome.png", "https://www.google.com/chrome/browser/desktop/");
      browserLink("Firefox", "../assets/browser/firefox.png", "https://www.mozilla.org/firefox/new");
    }

    container.append(header, text, footer);
    $(document.body).append(container);
  }
};
},{}]},{},[1]);
