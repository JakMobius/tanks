export type Column = Map<number, number>

export interface SystemMatrix {
    size: number
    diagonal: Float64Array
    invDiagonal: Float64Array

    clearResize(size: number): void

    clear(): void

    add(rowIndex: number, columnIndex: number, value: number): void

    mulVec(vec: Float64Array, result: Float64Array): void

    get(row: number, column: number): number
}

export class FastMatrix implements SystemMatrix {
    size: number
    data: Float64Array
    diagonal: Float64Array
    invDiagonal: Float64Array

    constructor(size: number = 4) {
        this.clearResize(size)
    }

    clearResize(size: number) {
        this.size = size
        this.data = new Float64Array(size * size)
        this.diagonal = new Float64Array(size)
        this.invDiagonal = new Float64Array(size)
    }

    clear() {
        let size = this.size
        for (let i = 0; i < size; i++) {
            this.diagonal[i] = 0
            this.invDiagonal[i] = Infinity
        }
        size = size * size
        for (let i = 0; i < size; i++) {
            this.data[i] = 0
        }
    }

    add(rowIndex: number, columnIndex: number, value: number) {
        if (rowIndex === columnIndex) {
            this.diagonal[rowIndex] += value
            this.invDiagonal[rowIndex] = 1 / this.diagonal[rowIndex]
        }
        this.data[columnIndex * this.size + rowIndex] = value
    }

    mulVec(vec: Float64Array, result: Float64Array) {
        let size = this.size
        let data = this.data

        for (let i = 0; i < size; i++) {
            let accum = 0
            let offset = i * size

            for(let j = 0; j < this.size; j++) {
                accum += data[offset + j] * vec[j]
            }

            result[i] = accum
        }
    }

    get(row: number, column: number) {
        return this.data[column * this.size + row]
    }
}

export class SparseMatrix implements SystemMatrix {
    columns: Column[] = []
    diagonal: Float64Array
    invDiagonal: Float64Array
    size: number
    capacity: number

    constructor(size: number = 0) {
        this.setCapacity(32)
        this.size = size
    }

    private setCapacity(capacity: number) {
        this.capacity = capacity
        this.invDiagonal = new Float64Array(capacity)
        this.diagonal = new Float64Array(capacity)
        while (this.columns.length < this.capacity) {
            this.columns.push(new Map())
        }
    }

    clearResize(size: number) {
        this.clear()

        if (this.capacity < size) {
            let newSize = this.columns.length
            while (newSize < size) newSize *= 2
            this.setCapacity(newSize)
        }
        this.size = size
    }

    clear() {
        for (let i = 0; i < this.size; i++) {
            this.columns[i].clear()
            this.invDiagonal[i] = Infinity
            this.diagonal[i] = 0
        }
    }

    add(rowIndex: number, columnIndex: number, value: number) {
        if (rowIndex === columnIndex) {
            this.diagonal[rowIndex] += value
            this.invDiagonal[rowIndex] = 1 / this.diagonal[rowIndex]
        }
        let column = this.columns[columnIndex]
        let row = column.get(rowIndex) ?? 0
        column.set(rowIndex, value + row)
    }

    mulVec(vec: Float64Array, result: Float64Array) {
        for (let i = 0; i < this.size; i++) {
            let accum = 0
            for (let [index, value] of this.columns[i]) {
                accum += vec[index] * value
            }

            result[i] = accum
        }
    }

    get(row: number, column: number) {
        return this.columns[column]?.get(row) ?? 0
    }
}