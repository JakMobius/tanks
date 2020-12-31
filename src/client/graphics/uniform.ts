
class Uniform {
	public program: any;
	public name: any;
	public ctx: any;
	public location: any;

    constructor(program, name) {
        this.program = program
        this.name = name
        this.ctx = this.program.ctx
        this.location = this.ctx.getUniformLocation(this.program.raw, name)

        if(!this.location) {
            console.warn("Could not find uniform named '" + this.name + "' in '" + this.program.name + "'")
        }
    }

    set1f(value) {
        if(this.location)
            this.ctx.uniform1f(this.location, value);
    }

    set2f(value1, value2) {
        if (this.location)
            this.ctx.uniform2f(this.location, value1, value2);
    }

    set3f(value1, value2, value3) {
        if (this.location)
            this.ctx.uniform3f(this.location, value1, value2, value3);
    }

    set4f(value1, value2, value3, value4) {
        if (this.location)
            this.ctx.uniform4f(this.location, value1, value2, value3, value4);
    }

    set1d(value) {
        if(this.location)
            this.ctx.uniform1fv(this.location, value);
    }

    set2d(value1, value2) {
        if (this.location)
            this.ctx.uniform2fv(this.location, value1, value2);
    }

    set3d(value1, value2, value3) {
        if (this.location)
            this.ctx.uniform3fv(this.location, value1, value2, value3);
    }

    set4d(value1, value2, value3, value4) {
        if (this.location)
            this.ctx.uniform4fv(this.location, value1, value2, value3, value4);
    }

    set1i(value) {
        if (this.location)
            this.ctx.uniform1i(this.location, value);
    }

    set2i(value1, value2) {
        if (this.location)
            this.ctx.uniform2i(this.location, value1, value2);
    }

    set3i(value1, value2, value3) {
        if (this.location)
            this.ctx.uniform3i(this.location, value1, value2, value3);
    }

    set4i(value1, value2, value3, value4) {
        if (this.location)
            this.ctx.uniform4i(this.location, value1, value2, value3, value4);
    }

    setMatrix(matrix) {
        if (this.location) {
            if (matrix.length === 4) {
                this.ctx.uniformMatrix2fv(this.location, false, matrix)
            } else if (matrix.length === 9) {
                this.ctx.uniformMatrix3fv(this.location, false, matrix)
            } else if (matrix.length === 16) {
                this.ctx.uniformMatrix4fv(this.location, false, matrix)
            }
        }
    }
}

export default Uniform;