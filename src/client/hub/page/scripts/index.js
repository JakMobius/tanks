(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const View = require(3);

const Dropdown = require(2);

window.addEventListener("load", function () {
  const body = $("body");
  const view = new View();
  view.element.css("position", "unset").css("width", "200px");
  view.element.addClass("menu expanded");
  body.append($("<p>").text("Это страница хаба. Ей срочно нужен дизайн."));
  body.append($("<p>").text("Внизу менюшка, чтобы проверить, что система сборки подшивает нужные файлы"));
  body.append(view.element);
  const dropdown = new Dropdown();
  dropdown.setOptionCount(4);
  dropdown.getOptions().each((index, option) => {
    $(option).text("Элемент номер " + index);
  }); // dropdown.on("expand", () => view.element.addClass("expanded"))
  //
  // dropdown.on("collapse", () => view.element.removeClass("expanded"))

  view.element.append(dropdown.element);
  body.append($("<p>").text("p.s. Арсений, пожалуйста, сделай меня, мне очень грустно"));
  body.append($("<p>").text("       плак плак"));
  body.append($("<p>").text("         💧  💧"));
});
},{}],2:[function(require,module,exports){
const View = require(3);

class Dropdown extends View {
  constructor() {
    super();
    this.element.addClass("dropdown");
    this.element.on("click", e => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle();
      if (!this.collapsed) return;
      let wrapper = $(e.target).closest(".select-wrapper");
      if (!wrapper.length) return;
      this.selectOption(wrapper);
    });
    $(document.body).click(() => this.collapse());
    this.prototypeCell = $("<div>").addClass("select-wrapper");
    this.collapsed = true;
  }

  collapse() {
    if (this.collapsed) return;
    this.collapsed = true;
    this.element.removeClass("expanded");
    this.emit("collapse");
  }

  expand() {
    if (!this.collapsed) return;
    this.collapsed = false;
    this.element.addClass("expanded");
    this.emit("expand");
  }

  toggle() {
    this.collapsed ? this.expand() : this.collapse();
  }

  setOptionCount(count) {
    let children = this.getOptions();

    if (children.length > count) {
      while (children.length > count) {
        children.pop().remove();
      }
    } else if (children.length < count) {
      while (children.length < count) {
        this.element.append(this.prototypeCell.clone());
        count--;
      }
    }
  }
  /**
   * @return {jQuery}
   */


  getOptions() {
    return this.element.children();
  }

  selectOption(option) {
    this.element.find(".select-wrapper.selected").removeClass("selected");

    if (option) {
      option.addClass("selected");
      this.element.addClass("selected");
    } else {
      this.element.removeClass("selected");
    }

    this.emit("select", option);
  }

}

module.exports = Dropdown;
},{}],3:[function(require,module,exports){
const EventEmitter = require(4);

class View extends EventEmitter {
  /**
   * View raw element
   * @type {jQuery}
   */
  constructor() {
    super();
    this.element = null;
    this.element = $("<div>");
  }

}

module.exports = View;
},{}],4:[function(require,module,exports){
if (typeof window == "undefined") {
  const Events = require("eve" + "nts"); // noinspection JSDuplicatedDeclaration


  class EventEmitter extends Events {
    constructor() {
      super();
    }

    on(event, handler) {
      this.addListener(event, handler);
    }

  }

  module.exports = EventEmitter;
} else {
  // noinspection JSDuplicatedDeclaration
  class EventEmitter {
    constructor() {
      this.events = new Map();
    }

    emit(event) {
      if (this.events.has(event)) {
        let args = Array.prototype.slice.call(arguments, 1);

        for (let listener of this.events.get(event)) {
          listener.apply(null, args);
        }
      }
    }

    on(event, handler) {
      if (this.events.has(event)) {
        this.events.get(event).push(handler);
      } else {
        this.events.set(event, [handler]);
      }
    }

  }

  module.exports = EventEmitter;
}
},{}]},{},[1]);
