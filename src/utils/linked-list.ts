export class LinkedListItem<T> {
    item: T
    next: LinkedListItem<T> | undefined
    prev: LinkedListItem<T> | undefined

    unlink() {
        if(this.prev) {
            this.prev.next = this.next
        }
        if(this.next) {
            this.next.prev = this.prev
        }
        this.prev = undefined
        this.next = undefined
    }
}

export default class LinkedList<ItemClass> {
    private unused: LinkedListItem<ItemClass>[] = []
    head: LinkedListItem<ItemClass> | undefined = undefined
    tail: LinkedListItem<ItemClass> | undefined = undefined

    private getUnusedItem() {
        if (this.unused.length) return this.unused.pop()
        return new LinkedListItem<ItemClass>()
    }

    private reuseItem(head: LinkedListItem<ItemClass>) {
        head.item = undefined
        head.prev = undefined
        head.next = undefined
        this.unused.push(head)
    }

    public insertHead(item: ItemClass) {
        let unused = this.getUnusedItem()
        unused.item = item
        unused.prev = undefined
        unused.next = this.head
        if (this.head) this.head.prev = unused
        this.head = unused
        if (!this.tail) this.tail = unused
        return unused
    }

    public insertTail(item: ItemClass) {
        let unused = this.getUnusedItem()
        unused.item = item
        unused.prev = this.tail
        unused.next = undefined
        if (this.tail) this.tail.next = unused
        this.tail = unused
        if (!this.head) this.head = unused
        return unused
    }

    public removeHead(): ItemClass | undefined {
        if (!this.head) return undefined

        const result = this.head.item
        const next = this.head.next
        this.reuseItem(this.head)
        if (next) next.prev = undefined
        else this.tail = undefined
        this.head = next
        return result
    }

    public removeTail(): ItemClass | undefined {
        if (!this.tail) return undefined

        const result = this.tail.item
        const prev = this.tail.prev
        this.reuseItem(this.tail)
        if (prev) prev.next = undefined
        else this.head = undefined
        this.tail = prev
        return result
    }

    public getHead(): ItemClass | undefined {
        return this.head?.item
    }

    public getTail(): ItemClass | undefined {
        return this.tail?.item
    }
}