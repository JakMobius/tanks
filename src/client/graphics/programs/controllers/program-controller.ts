import Program from "../program";


export default abstract class ProgramController<ProgramClass extends Program = Program> {

    program: ProgramClass

    protected constructor(program: ProgramClass) {
        this.program = program
    }

    abstract reset(): void
    abstract draw(): void
}