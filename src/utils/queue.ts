import LinkedList from "./linked-list";

export default class Queue<ItemClass> extends LinkedList<ItemClass> {

    front(): ItemClass {
        return this.getTail()
    }

    enqueue(item: ItemClass) {
        this.insertHead(item)
    }

    dequeue(): ItemClass {
        return this.removeTail()
    }
}