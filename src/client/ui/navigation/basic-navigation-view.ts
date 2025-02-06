import './navigation-view.scss'

import View from "../view";
import Controller from "../controller/controller";
import NavigationTransition from "./navigation-transition";
import NavigationBlock from "./navigation-block";
import {Constructor} from "src/utils/constructor"
import {ControlsResponder} from "src/client/controls/root-controls-responder";

export default class BasicNavigationView extends View {

    blockClass: Constructor<NavigationBlock> = NavigationBlock
    stack: NavigationBlock[] = []
    transitionStack: NavigationTransition[] = []
    locked: boolean

    constructor() {
        super();
        this.element.addClass("navigation-view")
    }

    pushController(controller: Controller, transition?: NavigationTransition): boolean {
        if(this.locked) return false

        controller.setNavigationView(this)

        const currentBlock = this.stack[this.stack.length - 1]
        const newBlock = new this.blockClass(controller)

        if(currentBlock) currentBlock.controller.onBlur()

        this.stack.push(newBlock)

        newBlock.onPush()

        if(transition) {
            this.locked = true
            this.transitionStack.push(transition)
            transition.performForwardTransition(this, currentBlock, newBlock, () => {
                this.locked = false
                newBlock.controller.onFocus()
            })
        } else {
            this.transitionStack.push(null)
            this.performDefaultTransition(currentBlock, newBlock)
            newBlock.controller.onFocus()
            this.locked = false
        }

        return true
    }

    popController(which: Controller | null = null): boolean {
        if(this.locked) return false

        if(which) {
            const index = this.stack.findIndex(b => b.controller === which)
            // Cannot pop root view controller as well as absent view controller
            if(index < 1) return false
        }

        if (this.stack.length <= 1) {
            return false
        }

        const currentBlock = this.stack[this.stack.length - 1]
        if(currentBlock) currentBlock.controller.onBlur()

        this.locked = true

        this.transitionToController(which).then(() => {
            this.locked = false
            const newBlock = this.stack[this.stack.length - 1]
            if(newBlock) newBlock.controller.onFocus()
        })

        return true
    }

    private async transitionToController(which: Controller | null) {
        while(true) {
            let poppedController = this.stack[this.stack.length - 1].controller
            await this.transitionToPreviousController()
            if(poppedController == which || !which) return
        }
    }

    private transitionToPreviousController(): Promise<void> {
        return new Promise<void>(resolve => {
            const currentBlock = this.stack.pop()
            const newBlock = this.stack[this.stack.length - 1]

            let transition = this.transitionStack.pop()
            if (transition) {
                transition.performBackwardTransition(this, currentBlock, newBlock, () => {
                    resolve()
                })
            } else {
                this.performDefaultTransition(currentBlock, newBlock)
                resolve()
            }
        })
    }

    clearControllers() {
        let topBlock = this.stack[this.stack.length - 1]
        if(topBlock) {
            topBlock.controller.onBlur()
            topBlock.element.detach()
        }
        this.stack = []
    }

    topController() {
        return this.stack[this.stack.length - 1].controller
    }

    private performDefaultTransition(oldBlock: NavigationBlock, newBlock: NavigationBlock) {
        if(oldBlock) oldBlock.element.detach()
        if(newBlock) this.element.append(newBlock.element)
    }
}

