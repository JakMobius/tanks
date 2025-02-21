import {SystemMatrix} from "src/physics/constraint-system/sparse-matrix";
import {nextPowerOfTwo} from "src/utils/utils";

export default class GaussSeidelSolver {
    public maxIterations: number = 500;
    public tolerance: number = 1E-4
    public eps: number = 1E-3
    private buffer = new Float64Array(32)

    private solveIteration(
        left: SystemMatrix,
        right: Float64Array,
        limitsMin: Float64Array,
        limitsMax: Float64Array,
        previous: Float64Array,
        next: Float64Array,
    ): number {
        let eps = this.eps
        let maxDifference: number = 0.0;
        const n: number = left.size;

        for (let i = 0; i < n; ++i) {
            let numerator: number = right[i];

            for (let j = 0; j < n; j++) {
                let value = left.get(i, j)
                if (j < i) {
                    numerator -= value * next[j];
                } else if (j > i) {
                    numerator -= value * previous[j];
                }
            }

            const kNextI: number = numerator * left.invDiagonal[i]

            const limitMin: number = limitsMin[i];
            const limitMax: number = limitsMax[i];
            const x: number = Math.max(limitMin, Math.min(limitMax, kNextI));

            const minK: number = Math.max(eps, Math.abs(previous[i]));
            const delta: number = Math.abs(x - previous[i]) / minK;
            maxDifference = Math.max(delta, maxDifference)

            next[i] = x;
        }

        return maxDifference;
    }

    public solve(
        matrix: SystemMatrix,
        right: Float64Array,
        result: Float64Array,
        limitsMin: Float64Array,
        limitsMax: Float64Array,
    ): boolean {

        if (this.buffer.length < result.length) {
            this.buffer = new Float64Array(nextPowerOfTwo(result.length))
        }

        let bufferA = result
        let bufferB = this.buffer
        let i = 0

        for (; i < this.maxIterations; ++i) {
            const maxDelta: number = this.solveIteration(
                matrix,
                right,
                limitsMin,
                limitsMax,
                bufferA,
                bufferB
            );

            if (maxDelta < this.tolerance) {
                break
            }

            let tmp = bufferA
            bufferA = bufferB
            bufferB = tmp
        }

        if (result !== bufferB) {
            for (let j = 0; j < matrix.size; j++) {
                result[j] = bufferB[j]
            }
        }

        // if (i >= this.maxIterations) {
            // let denseMatrix = "[\n" + matrix.columns.slice(0, matrix.size).map(column => {
            //     let denseColumn = Array(matrix.size).fill(0)
            //     for (let [key, value] of column) {
            //         denseColumn[key] = value
            //     }
            //     return "[" + denseColumn.join(",") + "]"
            // }).join("\n") + "]"
            // console.log(`
            //     Exceeded 500 iterations. test:
            //     const A = denseMatrixToSparse(${denseMatrix})
            //     const b = new Float64Array([${right.slice(0, matrix.size).join(",")}])
            //     const limitsMin = new Float64Array([${limitsMin.slice(0, matrix.size).join(",")}])
            //     const limitsMax = new Float64Array([${limitsMax.slice(0, matrix.size).join(",")}])
            //     const expectedResult = [${result.slice(0, matrix.size)}]
            // `)
        // }

        return false;
    }
}
