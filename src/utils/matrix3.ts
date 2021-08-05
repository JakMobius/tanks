

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

function multiply(a: Float32Array, b: Float32Array) {
    const a00 = a[0];
    const a01 = a[1];
    const a02 = a[2];
    const a10 = a[3];
    const a11 = a[3 + 1];
    const a12 = a[3 + 2];
    const a20 = a[2 * 3];
    const a21 = a[2 * 3 + 1];
    const a22 = a[2 * 3 + 2];
    const b00 = b[0];
    const b01 = b[1];
    const b02 = b[2];
    const b10 = b[3];
    const b11 = b[3 + 1];
    const b12 = b[3 + 2];
    const b20 = b[2 * 3];
    const b21 = b[2 * 3 + 1];
    const b22 = b[2 * 3 + 2];

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


function identity() {
    return new Float32Array([
        1, 0, 0,
        0, 1, 0,
        0, 0, 1,
    ]);
}

function translation(tx: number, ty: number) {
    return new Float32Array([
        1, 0, 0,
        0, 1, 0,
        tx, ty, 1,
    ]);
}

function translate(m: Float32Array, tx: number, ty: number) {
    return multiply(m, translation(tx, ty));
}

function rotation(s: number, c: number) {
    return new Float32Array([
        c, -s, 0,
        s, c, 0,
        0, 0, 1,
    ]);
}

function rotate(m: Float32Array, angle: number) {
    return multiply(m, rotation(Math.sin(angle), Math.cos(angle)));
}

function turn(m: Float32Array, s: number, c: number) {
    return multiply(m, rotation(s, c));
}

function scaling(sx: number, sy: number) {
    return new Float32Array([
        sx, 0, 0,
        0, sy, 0,
        0, 0, 1,
    ]);
}

function scale(m: Float32Array, sx: number, sy: number) {
    return multiply(m, scaling(sx, sy));
}

function inverse(m: Float32Array) {
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

export default class Matrix3 {
    public m: Float32Array;
    public stack: Float32Array[];

    constructor() {
        this.m = new Float32Array([
            1, 0, 0,
            0, 1, 0,
            0, 0, 1,
        ])
        this.stack = []
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

    transformX(x: number, y: number, z: number = 1) {
        return this.m[0] * x + this.m[3] * y + this.m[6] * z
    }

    transformY(x: number, y: number, z: number = 1) {
        return this.m[1] * x + this.m[4] * y + this.m[7] * z
    }

    reset() {
        this.m.set([
            1, 0, 0,
            0, 1, 0,
            0, 0, 1,
        ])
    }
}