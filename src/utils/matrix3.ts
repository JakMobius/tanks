

/*
 * Copyright 2012, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of his
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * Various 2d math functions.
 *
 * @module webgl-2d-math
 */

export function multiply(a: Float32Array, b: Float32Array) {
    const a00 = a[0];
    const a01 = a[1];
    const a02 = a[2];
    const a10 = a[3];
    const a11 = a[4];
    const a12 = a[5];
    const a20 = a[6];
    const a21 = a[7];
    const a22 = a[8];
    const b00 = b[0];
    const b01 = b[1];
    const b02 = b[2];
    const b10 = b[3];
    const b11 = b[4];
    const b12 = b[5];
    const b20 = b[6];
    const b21 = b[7];
    const b22 = b[8];

    return new Float32Array([
        b00 * a00 + b01 * a10 + b02 * a20,
        b00 * a01 + b01 * a11 + b02 * a21,
        b00 * a02 + b01 * a12 + b02 * a22,
        b10 * a00 + b11 * a10 + b12 * a20,
        b10 * a01 + b11 * a11 + b12 * a21,
        b10 * a02 + b11 * a12 + b12 * a22,
        b20 * a00 + b21 * a10 + b22 * a20,
        b20 * a01 + b21 * a11 + b22 * a21,
        b20 * a02 + b21 * a12 + b22 * a22,
    ]);
}


export function identity() {
    return new Float32Array([
        1, 0, 0,
        0, 1, 0,
        0, 0, 1,
    ]);
}

export function translation(tx: number, ty: number) {
    return new Float32Array([
        1, 0, 0,
        0, 1, 0,
        tx, ty, 1,
    ]);
}

export function translate(m: Float32Array, tx: number, ty: number) {
    return multiply(m, translation(tx, ty));
}

export function rotation(s: number, c: number) {
    return new Float32Array([
        c, s, 0,
        -s, c, 0,
        0, 0, 1,
    ]);
}

export function rotate(m: Float32Array, angle: number) {
    return multiply(m, rotation(Math.sin(angle), Math.cos(angle)));
}

export function turn(m: Float32Array, s: number, c: number) {
    return multiply(m, rotation(s, c));
}

export function scaling(sx: number, sy: number) {
    return new Float32Array([
        sx, 0, 0,
        0, sy, 0,
        0, 0, 1,
    ]);
}

export function scale(m: Float32Array, sx: number, sy: number) {
    return multiply(m, scaling(sx, sy));
}

export function inverse(m: Float32Array) {
    const t00 = m[3 + 1] * m[2 * 3 + 2] - m[3 + 2] * m[2 * 3 + 1];
    const t10 = m[1] * m[2 * 3 + 2] - m[2] * m[2 * 3 + 1];
    const t20 = m[1] * m[3 + 2] - m[2] * m[3 + 1];
    const d = 1.0 / (m[0] * t00 - m[3] * t10 + m[2 * 3] * t20);

    return new Float32Array([
        d * t00, -d * t10, d * t20,
        -d * (m[3] * m[2 * 3 + 2] - m[3 + 2] * m[2 * 3]),
        d * (m[0] * m[2 * 3 + 2] - m[2] * m[2 * 3]),
        -d * (m[0] * m[3 + 2] - m[2] * m[3]),
        d * (m[3] * m[2 * 3 + 1] - m[3 + 1] * m[2 * 3]),
        -d * (m[0] * m[2 * 3 + 1] - m[1] * m[2 * 3]),
        d * (m[0] * m[3 + 1] - m[1] * m[3]),
    ]);
}

export class ReadonlyMatrix3 {
    protected m: Float32Array;

    constructor(data?: Float32Array) {
        if(!data) {
            this.m = new Float32Array([
                1, 0, 0,
                0, 1, 0,
                0, 0, 1,
            ])
        } else {
            this.m = data
        }
    }

    inverted() {
        return new Matrix3(inverse(this.m))
    }

    transformX(x: number, y: number, z: number = 1) {
        return this.m[0] * x + this.m[3] * y + this.m[6] * z
    }

    transformY(x: number, y: number, z: number = 1) {
        return this.m[1] * x + this.m[4] * y + this.m[7] * z
    }

    multiplied(other: ReadonlyMatrix3) {
        return new Matrix3(multiply(this.m, other.m))
    }

    equals(currentTransform: ReadonlyMatrix3) {
        for(let i = 0; i < 9; i++) {
            if(this.m[i] !== currentTransform.m[i]) return false
        }
        return true
    }

    multiplyLeft(left: Matrix3) {
        return multiply(left.m, this.m)
    }

    copyTo(matrix: Matrix3) {
        matrix.m.set(this.m)
    }

    clone() {
        return new Matrix3(this.m.slice())
    }

    get(i: number) {
        return this.m[i]
    }

    getScale() {
        let x = Math.sqrt(this.get(0) ** 2 + this.get(1) ** 2)
        let y = Math.sqrt(this.get(3) ** 2 + this.get(4) ** 2)
    
        let basis1X = this.get(0) / x
        let basis1Y = this.get(1) / x
    
        let basis2X = this.get(3) / y
        let basis2Y = this.get(4) / y
    
        if(basis1X * basis2Y - basis1Y * basis2X < 0) {
            y = -y
        }
    
        return { x, y }
    }
    
    getPosition() {
        return { x: this.get(6), y: this.get(7) }
    }
    
    getDirection() {
        return { x: this.get(0), y: this.get(1) }
    }

    getUpDirection() {
        return { x: this.get(3), y: this.get(4) }
    }
    
    getAngle() {
        let direction = this.getDirection()
        return Math.atan2(direction.y, direction.x);
    }
}

export class Matrix3 extends ReadonlyMatrix3 {
    public stack: Float32Array[];

    constructor(data?: Float32Array) {
        super(data)
        this.stack = []
    }

    set(another: ReadonlyMatrix3) {
        another.copyTo(this)
    }
    
    save() {
        this.stack.push(this.m.slice())
    }

    restore() {
        this.m = this.stack.pop()
    }

    inverse() {
        this.m = inverse(this.m)
    }

    rotate(angle: number) {
        this.m = rotate(this.m, angle)
    }

    turn(sin: number, cos: number) {
        this.m = turn(this.m, sin, cos)
    }

    turnAngle(angle: number) {
        this.m = turn(this.m, Math.sin(angle), Math.cos(angle))
    }

    translate(x: number, y: number) {
        this.m = translate(this.m, x, y)
    }

    scale(x: number, y: number) {
        this.m = scale(this.m, x, y)
    }

    multiply(left: ReadonlyMatrix3): void {
        this.m = left.multiplyLeft(this)
    }

    getArray(): Float32Array {
        return this.m
    }

    reset() {
        this.m.set([
            1, 0, 0,
            0, 1, 0,
            0, 0, 1,
        ])
    }

}