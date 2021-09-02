/* @load-resource: './navigation.scss' */

import View from "../view";
import Controller from "../controller/controller";
import NavigationTransition from "./navigation-transition";
import NavigationBlock from "./navigation-block";
import {Constructor} from "../../../serialization/binary/serializable";

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

    popController(): boolean {
        if(this.locked) return false

        const currentBlock = this.stack.pop()
        if(currentBlock) currentBlock.controller.onBlur()

        if(this.stack.length > 0) {
            this.locked = true
            const newBlock = this.stack[this.stack.length - 1]

            let transition = this.transitionStack.pop()
            if(transition) {
                transition.performBackwardTransition(this, currentBlock, newBlock, () => {
                    newBlock.controller.onFocus()
                    this.locked = false
                })
            } else {
                this.performDefaultTransition(currentBlock, newBlock)
                newBlock.controller.onFocus()
                this.locked = false
            }

            return true
        }

        return false
    }

    private performDefaultTransition(oldBlock: NavigationBlock, newBlock: NavigationBlock) {
        if(oldBlock) oldBlock.element.detach()
        if(newBlock) this.element.append(newBlock.element)
    }
}

