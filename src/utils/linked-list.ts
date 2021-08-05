
export class LinkedListItem<T> {
    item: T | null
    next: LinkedListItem<T> | null
    prev: LinkedListItem<T> | null
}

export default class LinkedList<ItemClass> {
    private unused: LinkedListItem<ItemClass>[] = []
    private head: LinkedListItem<ItemClass> | null
    private tail: LinkedListItem<ItemClass> | null

    private getUnusedItem() {
        if (this.unused.length) return this.unused.pop()
        return new LinkedListItem<ItemClass>()
    }

    private reuseItem(head: LinkedListItem<ItemClass>) {
        head.item = null
        head.prev = null
        head.next = null
        this.unused.push(head)
    }

    public insertHead(item: ItemClass) {
        let unused = this.getUnusedItem()
        unused.item = item
        unused.prev = null
        unused.next = this.head
        if(this.head) this.head.prev = unused
        this.head = unused
        if(!this.tail) this.tail = unused
        return unused
    }

    public insertTail(item: ItemClass) {
        let unused = this.getUnusedItem()
        unused.item = item
        unused.prev = this.tail
        unused.next = null
        if(this.tail) this.tail.next = unused
        this.tail = unused
        if(!this.head) this.head = unused
        return unused
    }

    public removeHead(): ItemClass {
        if (!this.head) return null

        const result = this.head.item
        const next = this.head.next
        this.reuseItem(this.head)
        if(next) next.prev = null
        else this.tail = null
        this.head = next
        return result
    }

    public removeTail(): ItemClass {
        if(!this.tail) return null

        const result = this.tail.item
        const prev = this.tail.prev
        this.reuseItem(this.tail)
        if(prev) prev.next = null
        else this.head = null
        this.tail = prev
        return result
    }

    public getHead(): ItemClass {
        return this.head.item
    }

    public getTail(): ItemClass {
        return this.tail.item
    }
}