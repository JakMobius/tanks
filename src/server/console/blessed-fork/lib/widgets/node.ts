/**
 * node.js - base abstract node for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Modules
 */

import EventEmitter from '../events';
import { Screen } from "./screen";

export interface ElementPosition {
    x?: number
    y?: number
    width?: number
    height?: number
}

export interface NodeConfig {
    position?: ElementPosition
    screen?: Screen
}

export class Node extends EventEmitter {
    public options: any;
    public screen: Screen;
    public parent: Node;
    public children: any;
    public data: any;
    public uid: any;
    public index: any;
    public detached: boolean;
    public type: any;
    public position: ElementPosition
    public destroyed: boolean;
    public clickable: boolean;

    /**
     * Node
     */
    constructor(options: NodeConfig) {
        super();

        options = options || {};
        this.options = options;
        this.position = options.position

        this.position = options.position
        this.parent = null;
        this.children = [];
        this.data = {};

        if (this.index == null) {
            this.index = -1;
        } else {
            this.index = this.index;
        }

        this.type = 'node';
    }

    setScreen(screen: Screen) {
        this.screen = screen
        this.detached = !!this.screen
        this.forAncestors(node => {
            node.setScreen(screen)
        })
    }

    insert(element: Node, i: number) {
        var self = this;

        if (element.screen && element.screen !== this.screen) {
            throw new Error('Cannot switch a node\'s screen.');
        }

        element.detach();
        element.parent = this;
        element.setScreen(this.screen);

        if (i === 0) {
            this.children.unshift(element);
        } else if (i === this.children.length) {
            this.children.push(element);
        } else {
            this.children.splice(i, 0, element);
        }

        element.emit('reparent', this);
        this.emit('adopt', element);
    }

    prepend(element: Node) {
        this.insert(element, 0);
    }

    append(element: Node) {
        this.insert(element, this.children.length);
    }

    insertBefore(element: Node, other: Node) {
        var i = this.children.indexOf(other);
        if (~i) this.insert(element, i);
    }

    insertAfter(element: Node, other: Node) {
        var i = this.children.indexOf(other);
        if (~i) this.insert(element, i + 1);
    }

    remove(element: Node) {
        if (element.parent !== this) return;

        var i = this.children.indexOf(element);
        if (!~i) return;

        element.clearPos();

        element.parent = null;

        this.children.splice(i, 1);

        i = this.screen.clickable.indexOf(element);
        if (~i) this.screen.clickable.splice(i, 1);
        i = this.screen.keyable.indexOf(element);
        if (~i) this.screen.keyable.splice(i, 1);

        element.emit('reparent', null);
        this.emit('remove', element);

        (function emit(el) {
            var n = el.detached !== true;
            el.detached = true;
            if (n) el.emit('detach');
            el.children.forEach(emit);
        })(element);

        if (this.screen.focused === element) {
            this.screen.rewindFocus();
        }
    }

    detach() {
        if (this.parent) this.parent.remove(this);
    }

    free() {

    }

    destroy() {
        this.detach();
        this.forDescendants(function (el) {
            el.free();
            el.destroyed = true;
            el.emit('destroy');
        }, true);
    }

    forDescendants(iter: (node: Node) => void, s?: boolean) {
        if (s) iter(this);
        this.children.forEach(function emit(el: Node) {
            iter(el);
            el.children.forEach(emit);
        });
    }

    forAncestors(iter: (node: Node) => void, s?: boolean) {
        let el: Node = this;
        if (s) iter(this);
        while (el = el.parent) {
            iter(el);
        }
    }

    collectDescendants(s: boolean) {
        let out: Node[] = [];
        this.forDescendants(function (el) {
            out.push(el);
        }, s);
        return out;
    }

    collectAncestors(s: boolean) {
        let out: Node[] = [];
        this.forAncestors(function (el) {
            out.push(el);
        }, s);
        return out;
    }

    emitDescendants(parameters: [string, ...any[]], callback?: (node: Node) => void) {
        return this.forDescendants(function (el) {
            if (callback) callback(el);
            el.emit.apply(el, parameters);
        }, true);
    }

    emitAncestors(parameters: [string, ...any[]], callback?: (node: Node) => void) {

        return this.forAncestors(function (el: Node) {
            if (callback) callback(el);
            el.emit.apply(el, parameters);
        }, true);
    }

    hasDescendant(target: Node) {
        for (let child of this.children) {
            if (child === target) return true;
            if (child.hasDescendant(target)) return true;
        }
        return false;
    }

    hasAncestor(target: Node) {
        var el: Node = this;
        while (el = el.parent) {
            if (el === target) return true;
        }
        return false;
    }

    get(name: string, value: any) {
        if (this.data.hasOwnProperty(name)) {
            return this.data[name];
        }
        return value;
    }

    set(name: string, value: any) {
        return this.data[name] = value;
    }

    getwidth(): number {
        return this.position.width
    }

    getheight(): number {
        return this.position.height
    }

    getaleft() {
        return this.position.x;
    }

    getaright() {
        return this.position.x + this.position.width
    }

    getatop() {
        return this.position.y;
    }

    getabottom() {
        return this.position.y + this.position.height
    }

    clearPos(get?: boolean, override?: boolean) {

    }
}
