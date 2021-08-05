
type Columns<K2, V> = Map<K2, V>
type Rows<K1, K2, V> = Map<K1, Columns<K2, V>>

export class TwoDimensionalMap<K1, K2, V> {

    rows: Rows<K1, K2, V> = new Map<K1, Columns<K2, V>>()

    get(x: K1, y: K2): V | null {
        let row, column
        if((row = this.rows.get(x)) && (column = row.get(y))) {
            return column
        }
        return null
    }

    set(k1: K1, k2: K2, v: V): void {
        let row: Columns<K2, V>
        if((row = this.rows.get(k1))) {
            row.set(k2, v)
        } else {
            this.rows.set(k1, new Map([[k2, v]]))
        }
    }

    delete(k1: K1, k2: K2) {
        let row: Columns<K2, V>
        if((row = this.rows.get(k1))) {
            row.delete(k2)
            if(row.size === 0) this.rows.delete(k1)
        }
    }

    clear() {
        this.rows.clear()
    }
}