import {ASTNode} from "./parser";


export default class Serializer {
    static shared = new Serializer()

    result: string = ""

    reset() {
        this.result = ""
    }

    serialize(node: ASTNode) {
        this.reset()
        node.serialize(this)
        let result = this.result
        this.reset()
        return result
    }
}