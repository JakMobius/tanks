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
import {Element} from "./element";

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
    public children: Node[];
    public data: any;
    public uid: any;
    public index: number;
    public detached: boolean;
    public hidden: boolean;
    public type: string;
    public position: ElementPosition
    public destroyed: boolean;

    /**
     * Node
     */
    constructor(options: NodeConfig) {
        super();

        options = options || {};
        this.options = options;
        this.position = options.position || {}
        this.detached = true

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
        let oldDetached = this.detached
        this.detached = !this.screen
        if(oldDetached && screen) this.onAttach()
        if(!oldDetached && !screen) this.onDetach()
        for(let children of this.children) {
            children.setScreen(screen)
        }
    }

    insert(element: Node, i: number) {

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
        element.setScreen(null)

        this.children.splice(i, 1);

        element.emit('reparent', null);
        this.emit('remove', element);

        if (this.screen.getfocused() === element) {
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

    getaleft(): number {
        return this.position.x + this.parent.getaleft();
    }

    getaright(): number {
        return this.position.x + this.position.width + this.parent.getaleft()
    }

    getatop(): number {
        return this.position.y + this.parent.getatop();
    }

    getabottom(): number {
        return this.position.y + this.position.height + this.parent.getatop()
    }

    getitop() {
        return 0
    }

    getileft(){
        return 0
    }

    getiright(){
        return 0
    }

    getibottom(){
        return 0
    }

    getiwidth() {
        return 0
    }

    getiheight(){
        return 0
    }

    getrleft() {
        return this.getaleft() - this.parent.getaleft();
    }

    getrright() {
        return this.getaright() - this.parent.getaright();
    }

    getrtop() {
        return this.getatop() - this.parent.getatop();
    }

    getrbottom() {
        return this.getabottom() - this.parent.getabottom();
    }

    // NOTE:
    // For aright, abottom, right, and bottom:
    // If position.bottom is null, we could simply set top instead.
    // But it wouldn't replicate bottom behavior appropriately if
    // the parent was resized, etc.
    setwidth(val: number) {
        if (this.position.width === val) return;
        this.onResize()
        this.clearPos();
        this.position.width = val;
    }

    setheight(val: number) {
        if (this.position.height === val) return;
        this.onResize()
        this.clearPos();
        this.position.height = val;
    }

    setaleft(val: number) {
        val -= this.parent.getaleft();
        if (this.position.x === val) return;
        this.emit('move');
        this.clearPos();
        this.position.x = val;
    }

    setaright(val: number) {
        val -= this.parent.getaright();
        if (this.position.x + this.position.width === val) return;
        this.emit('move');
        this.clearPos();
        this.position.x = val - this.position.width;
    }

    setatop(val: number) {
        val -= this.parent.getatop();
        if (this.getatop() === val) return;
        this.emit('move');
        this.clearPos();
        this.setrtop(val)
    }

    setabottom(val: number) {
        val -= this.parent.getabottom();
        if (this.getabottom() === val) return;
        this.emit('move');
        this.clearPos();
        this.setrbottom(val)
    }

    setrleft(val: number) {
        if (this.position.x === val) return;
        this.emit('move');
        this.clearPos();
        this.position.x = val;
    }

    setrright(val: number) {
        if (this.position.x + this.position.width === val) return;
        this.emit('move');
        this.clearPos();
        this.position.x = val - this.position.width;
    }

    setrtop(val: number) {
        if (this.position.y === val) return;
        this.emit('move');
        this.clearPos();
        this.position.y = val;
    }

    setrbottom(val: number) {
        if (this.position.y + this.position.height === val) return;
        this.emit('move');
        this.clearPos();
        this.position.y = val - this.position.height;
    }

    render() {

    }

    clearPos(get?: boolean, override?: boolean) {

    }

    onAttach() {
        this.emit('attach')
    }

    onDetach() {
        this.emit('detach')
    }

    onResize() {
        this.emit('resize');
    }
}
